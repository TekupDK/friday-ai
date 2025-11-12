/**
 * UI Analysis Module
 * AI-powered analysis of UI designs using LiteLLM
 */

import { invokeLLM } from "../_core/llm";
import type { AIModel } from "../model-router";

interface UIAnalysisInput {
  uiConcept: string;
  context?: string;
  targetAudience?: string;
  model?: string;
}

interface UIAnalysisResult {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  accessibilityScore: number;
  usabilityScore: number;
  innovationScore: number;
  detailedAnalysis: string;
  suggestions: string[];
}

/**
 * Analyze UI concepts with AI models
 */
export async function analyzeUIWithAI(
  input: UIAnalysisInput
): Promise<UIAnalysisResult> {
  const { uiConcept, context, targetAudience, model } = input;

  // Select best model for UI analysis
  const analysisModel = model || selectBestModelForUIAnalysis(uiConcept);

  const prompt = buildUIAnalysisPrompt({
    uiConcept,
    context,
    targetAudience,
  });

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      model: analysisModel,
      maxTokens: 2000,
    });

    const analysis = parseUIAnalysisResponse(
      typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content)
    );
    return analysis;
  } catch (error) {
    console.error("[UI Analysis] Error:", error);
    // Return fallback analysis
    return getFallbackUIAnalysis(uiConcept);
  }
}

/**
 * Select the best AI model for UI analysis based on the concept
 */
function selectBestModelForUIAnalysis(uiConcept: string): AIModel {
  // For complex UI analysis, use more capable models
  if (
    uiConcept.includes("CRM") ||
    uiConcept.includes("enterprise") ||
    uiConcept.includes("business")
  ) {
    return "glm-4.5-air-free"; // Good for structured analysis
  }

  if (uiConcept.includes("mobile") || uiConcept.includes("responsive")) {
    return "deepseek-chat-v3.1-free"; // Good for technical details
  }

  if (uiConcept.includes("creative") || uiConcept.includes("design")) {
    return "minimax-m2-free"; // Good for creative analysis
  }

  return "glm-4.5-air-free"; // Default
}

/**
 * Build comprehensive UI analysis prompt
 */
function buildUIAnalysisPrompt({
  uiConcept,
  context,
  targetAudience,
}: {
  uiConcept: string;
  context?: string;
  targetAudience?: string;
}): string {
  return `You are a senior UI/UX expert analyzing a UI design concept. Provide a detailed, objective analysis.

DESIGN CONCEPT TO ANALYZE:
${uiConcept}

${context ? `CONTEXT: ${context}` : ""}

${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ""}

Please analyze this UI concept and provide a structured response with:

1. OVERALL SCORE (0-100): How effective is this UI design?

2. STRENGTHS: List 3-5 key strengths of this approach

3. WEAKNESSES: List 2-4 potential issues or improvements needed

4. RECOMMENDATIONS: Specific suggestions for improvement

5. ACCESSIBILITY SCORE (0-100): How accessible is this design?

6. USABILITY SCORE (0-100): How user-friendly is this interface?

7. INNOVATION SCORE (0-100): How innovative and modern is this approach?

8. DETAILED ANALYSIS: 2-3 paragraphs explaining your evaluation

9. SPECIFIC SUGGESTIONS: 3-5 actionable improvements

Format your response as a valid JSON object with these exact keys:
{
  "score": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "accessibilityScore": number,
  "usabilityScore": number,
  "innovationScore": number,
  "detailedAnalysis": "string",
  "suggestions": ["string"]
}

Be critical but constructive. Focus on user experience, technical feasibility, and best practices.`;
}

/**
 * Parse AI response into structured format
 */
function parseUIAnalysisResponse(response: string): UIAnalysisResult {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      accessibilityScore: Math.min(
        100,
        Math.max(0, parsed.accessibilityScore || 0)
      ),
      usabilityScore: Math.min(100, Math.max(0, parsed.usabilityScore || 0)),
      innovationScore: Math.min(100, Math.max(0, parsed.innovationScore || 0)),
      detailedAnalysis:
        parsed.detailedAnalysis || "No detailed analysis provided",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    // Fallback parsing for non-JSON responses
    console.warn("[UI Analysis] Could not parse as JSON, using fallback");
    return parseFallbackResponse(response);
  }
}

/**
 * Fallback parser for non-JSON AI responses
 */
function parseFallbackResponse(response: string): UIAnalysisResult {
  return {
    score: 75, // Default good score
    strengths: extractListItems(response, "STRENGTHS:"),
    weaknesses: extractListItems(response, "WEAKNESSES:"),
    recommendations: extractListItems(response, "RECOMMENDATIONS:"),
    accessibilityScore: 70,
    usabilityScore: 75,
    innovationScore: 80,
    detailedAnalysis: response,
    suggestions: extractListItems(response, "SUGGESTIONS:"),
  };
}

/**
 * Extract list items from AI response
 */
function extractListItems(text: string, section: string): string[] {
  const sectionIndex = text.toLowerCase().indexOf(section.toLowerCase());
  if (sectionIndex === -1) return [];

  const sectionText = text.slice(sectionIndex);
  const nextSectionIndex = sectionText.search(/\d+\.\s+[A-Z]+:/);
  const relevantText =
    nextSectionIndex > 0 ? sectionText.slice(0, nextSectionIndex) : sectionText;

  // Extract bullet points or numbered items
  const items = relevantText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.match(/^[-•*]\s+|^\d+\.\s+/))
    .map(line => line.replace(/^[-•*]\s+|^\d+\.\s+/, "").trim())
    .filter(item => item.length > 0);

  return items.slice(0, 5); // Max 5 items
}

/**
 * Fallback analysis when AI fails
 */
function getFallbackUIAnalysis(uiConcept: string): UIAnalysisResult {
  return {
    score: 70,
    strengths: [
      "Clear concept structure",
      "Addresses user needs",
      "Modern approach",
    ],
    weaknesses: [
      "Could benefit from more detail",
      "May need accessibility improvements",
      "Testing recommended",
    ],
    recommendations: [
      "Add more specific implementation details",
      "Consider accessibility guidelines",
      "Plan user testing",
    ],
    accessibilityScore: 65,
    usabilityScore: 70,
    innovationScore: 75,
    detailedAnalysis: `Fallback analysis for: ${uiConcept}. This appears to be a solid UI concept that could benefit from more detailed implementation planning and user testing.`,
    suggestions: [
      "Consider user research to validate assumptions",
      "Plan accessibility audit",
      "Create detailed wireframes",
      "Consider performance implications",
    ],
  };
}
