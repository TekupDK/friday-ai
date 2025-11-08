"""
DeepEval Test Suite for Friday AI Models
Evaluates OpenRouter free tier models on various metrics

Installation:
pip install deepeval openai requests

Usage:
python tests/ai/deepeval-test.py
"""

import os
from typing import List, Dict
import requests
from deepeval import evaluate
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualPrecisionMetric,
    HallucinationMetric,
)
from deepeval.test_case import LLMTestCase

# OpenRouter Configuration
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Models to evaluate (100% accuracy models)
MODELS_TO_TEST = [
    {
        "id": "z-ai/glm-4.5-air:free",
        "name": "GLM-4.5 Air",
        "description": "100% accuracy, recommended",
    },
    {
        "id": "openai/gpt-oss-20b:free",
        "name": "GPT-OSS 20B",
        "description": "100% accuracy, OpenAI-compatible",
    },
    {
        "id": "deepseek/deepseek-chat-v3.1:free",
        "name": "DeepSeek Chat v3.1",
        "description": "Advanced reasoning",
    },
    {
        "id": "qwen/qwen3-coder:free",
        "name": "Qwen3 Coder",
        "description": "Code generation specialist",
    },
]


def call_openrouter(model_id: str, messages: List[Dict]) -> str:
    """Call OpenRouter API with specified model"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tekup.dk",
        "X-Title": "Friday AI - DeepEval Testing",
    }
    
    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000,
    }
    
    response = requests.post(OPENROUTER_URL, json=payload, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    return data["choices"][0]["message"]["content"]


# Test Cases
TEST_CASES = [
    {
        "name": "Danish Business Email Response",
        "input": "Hej, jeg vil gerne have et tilbud på en badværelsesrenovering. Hvornår kan I komme ud og se på det?",
        "expected_output": "Professionelt dansk svar med forslag til næste skridt",
        "context": ["Friday er en dansk executive assistant", "Svaret skal være kort og professionelt"],
        "retrieval_context": ["Rendetalje tilbyder badværelsesrenoveringer", "Vi kan typisk komme ud inden for 1-2 uger"],
    },
    {
        "name": "Calendar Reasoning",
        "input": "Jeg skal booke et 2-timers møde med Peter næste onsdag mellem 10-16. Hans kalender har møder 10:00-11:30 og 14:00-15:00.",
        "expected_output": "To forslag: 11:30-13:30 eller 15:00-17:00 (men 17:00 er uden for vinduet, så kun 11:30-13:30)",
        "context": ["Mødet skal være 2 timer", "Kun onsdag mellem 10-16"],
        "retrieval_context": ["Eksisterende møder: 10:00-11:30 og 14:00-15:00"],
    },
    {
        "name": "Invoice Data Extraction",
        "input": "Udtræk data: Badekar 15.000 kr, Fliser 28.500 kr, VVS 12.000 kr. Kunde: Tomas Jensen, Hovedgaden 42. Dato: 15. marts 2024",
        "expected_output": '{"items": ["Badekar", "Fliser", "VVS"], "amounts": [15000, 28500, 12000], "customer": "Tomas Jensen", "address": "Hovedgaden 42", "date": "2024-03-15"}',
        "context": ["Returner struktureret JSON data"],
        "retrieval_context": ["Typisk faktura format med items, beløb, kunde info"],
    },
    {
        "name": "Code Generation - TypeScript",
        "input": "Skriv en TypeScript funktion der grupperer fakturaer efter måned og returnerer totaler",
        "expected_output": "TypeScript funktion med typer, der grupperer efter måned og summer beløb",
        "context": ["Brug TypeScript med proper typing", "Inkluder JSDoc comments"],
        "retrieval_context": ["Invoice type har amount og date felter"],
    },
]


def evaluate_model(model: Dict) -> Dict:
    """Evaluate a single model on all test cases"""
    print(f"\n{'='*60}")
    print(f"Evaluating: {model['name']} ({model['description']})")
    print(f"Model ID: {model['id']}")
    print(f"{'='*60}\n")
    
    results = []
    
    for test_case_data in TEST_CASES:
        print(f"Running test: {test_case_data['name']}...")
        
        # Call model
        messages = [
            {
                "role": "system",
                "content": "Du er Friday, en professionel dansk executive assistant for Rendetalje.",
            },
            {"role": "user", "content": test_case_data["input"]},
        ]
        
        try:
            actual_output = call_openrouter(model["id"], messages)
            
            # Create DeepEval test case
            test_case = LLMTestCase(
                input=test_case_data["input"],
                actual_output=actual_output,
                expected_output=test_case_data["expected_output"],
                context=test_case_data["context"],
                retrieval_context=test_case_data["retrieval_context"],
            )
            
            # Evaluate with metrics
            metrics = [
                AnswerRelevancyMetric(threshold=0.7),
                FaithfulnessMetric(threshold=0.7),
                HallucinationMetric(threshold=0.5),
            ]
            
            # Run evaluation
            eval_results = evaluate([test_case], metrics)
            
            results.append(
                {
                    "test_name": test_case_data["name"],
                    "success": eval_results.successful,
                    "actual_output": actual_output,
                    "metrics": eval_results.metrics_data,
                }
            )
            
            print(f"  ✓ Success: {eval_results.successful}")
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            results.append(
                {
                    "test_name": test_case_data["name"],
                    "success": False,
                    "error": str(e),
                }
            )
    
    # Calculate overall score
    successful_tests = sum(1 for r in results if r.get("success"))
    total_tests = len(results)
    accuracy = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"Model: {model['name']}")
    print(f"Accuracy: {accuracy:.1f}% ({successful_tests}/{total_tests} tests passed)")
    print(f"{'='*60}\n")
    
    return {
        "model": model,
        "accuracy": accuracy,
        "successful_tests": successful_tests,
        "total_tests": total_tests,
        "results": results,
    }


def main():
    """Run evaluation for all models"""
    if not OPENROUTER_API_KEY:
        print("Error: OPENROUTER_API_KEY environment variable not set")
        return
    
    print("="*60)
    print("Friday AI - Model Evaluation with DeepEval")
    print("="*60)
    
    all_results = []
    
    for model in MODELS_TO_TEST:
        model_results = evaluate_model(model)
        all_results.append(model_results)
    
    # Final summary
    print("\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    
    for result in sorted(all_results, key=lambda x: x["accuracy"], reverse=True):
        print(f"{result['model']['name']:25} {result['accuracy']:5.1f}% accuracy")
    
    print("\nRecommendation:")
    best_model = max(all_results, key=lambda x: x["accuracy"])
    print(f"  → {best_model['model']['name']} ({best_model['accuracy']:.1f}% accuracy)")
    print(f"  → Model ID: {best_model['model']['id']}")
    

if __name__ == "__main__":
    main()
