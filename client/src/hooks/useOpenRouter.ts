/**
 * useOpenRouter Hook - Production Optimized
 * 
 * Handles OpenRouter API communication for Friday AI
 * A/B tested prompts, quality checks, context support
 */

import { useState, useCallback } from "react";
import { AI_CONFIG } from "@/config/ai-config";
import { FRIDAY_PROMPTS, selectPrompt } from "@/config/friday-prompts";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface UseOpenRouterProps {
  context?: {
    selectedEmails?: string[];
    calendarEvents?: any[];
    searchQuery?: string;
    hasEmails?: boolean;
    hasCalendar?: boolean;
    hasInvoices?: boolean;
  };
  promptVariation?: keyof typeof FRIDAY_PROMPTS.testVariations;
}

interface QualityScore {
  danishLanguage: boolean;
  professionalTone: boolean;
  businessContext: boolean;
  responseLength: boolean;
  overallScore: number;
}

export function useOpenRouter({ 
  context = {}, 
  promptVariation 
}: UseOpenRouterProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQualityScore, setLastQualityScore] = useState<QualityScore | null>(null);

  // Quality check function
  const checkResponseQuality = useCallback((response: string): QualityScore => {
    const checks = FRIDAY_PROMPTS.utilities.qualityChecks;
    
    const danishLanguage = checks.danishLanguage(response);
    const professionalTone = checks.professionalTone(response);
    const businessContext = checks.businessContext(response);
    const responseLength = checks.responseLength(response);
    
    const overallScore = [danishLanguage, professionalTone, businessContext, responseLength]
      .filter(Boolean).length;
    
    return {
      danishLanguage,
      professionalTone,
      businessContext,
      responseLength,
      overallScore,
    };
  }, []);

  const sendMessage = useCallback(async (
    messages: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for API key
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OpenRouter API key not found. Check VITE_OPENROUTER_API_KEY in .env.dev");
      }

      // Select optimal prompt based on context
      const systemPrompt = promptVariation 
        ? FRIDAY_PROMPTS.testVariations[promptVariation].system
        : selectPrompt({
            hasEmails: context.selectedEmails && context.selectedEmails.length > 0,
            hasCalendar: context.calendarEvents && context.calendarEvents.length > 0,
            hasInvoices: context.hasInvoices,
            userIntent: 'action' // Default to action-oriented
          });

      // Build context string
      const contextString = Object.keys(context).length > 0 ? `
<CONTEXT>
${Object.entries(context)
  .filter(([key, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
  .map(([key, value]) => `${key.toUpperCase()}: ${JSON.stringify(value)}`)
  .join('\n')}
</CONTEXT>` : '';

      const fullSystemPrompt = systemPrompt + contextString;

      const fullMessages = [
        { role: "system", content: fullSystemPrompt },
        ...messages,
      ];

      console.log('🤖 Friday AI Request:', {
        model: AI_CONFIG.model.modelId,
        contextKeys: Object.keys(context),
        messageCount: fullMessages.length,
        promptVariation: promptVariation || 'production'
      });

      const response = await fetch(AI_CONFIG.model.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Friday AI - Rendetalje",
        },
        body: JSON.stringify({
          model: AI_CONFIG.model.modelId,
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle specific errors
        if (response.status === 401) {
          throw new Error("Invalid API key - check VITE_OPENROUTER_API_KEY");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded - try again in a moment");
        } else if (response.status >= 500) {
          throw new Error("OpenRouter server error - try again");
        } else {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content || "";

      if (!content.trim()) {
        throw new Error("Empty response from AI model");
      }

      // Quality check
      const qualityScore = checkResponseQuality(content);
      setLastQualityScore(qualityScore);

      console.log('📊 Response Quality:', qualityScore);
      console.log('💰 Token Usage:', data.usage);

      // Log quality issues for debugging
      if (qualityScore.overallScore < 3) {
        console.warn('⚠️ Low quality response detected:', {
          score: qualityScore.overallScore,
          response: content.substring(0, 200)
        });
      }

      if (onChunk) {
        onChunk(content);
      }

      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      
      // Return user-friendly error message
      const friendlyError = FRIDAY_PROMPTS.utilities.errorHandling[
        errorMessage.includes('API key') ? 'apiKeyError' :
        errorMessage.includes('rate limit') ? 'timeoutError' :
        errorMessage.includes('network') ? 'networkError' :
        'modelError'
      ];
      
      throw new Error(friendlyError);
    } finally {
      setIsLoading(false);
    }
  }, [context, promptVariation, checkResponseQuality]);

  // A/B testing function
  const testPromptVariation = useCallback(async (
    variation: keyof typeof FRIDAY_PROMPTS.testVariations,
    testMessage: string
  ): Promise<{ response: string; quality: QualityScore; responseTime: number }> => {
    const startTime = Date.now();
    
    try {
      const response = await sendMessage(
        [{ role: "user", content: testMessage }],
        undefined,
      );
      
      const responseTime = Date.now() - startTime;
      const quality = checkResponseQuality(response);
      
      return { response, quality, responseTime };
    } catch (error) {
      throw error;
    }
  }, [sendMessage, checkResponseQuality]);

  return {
    sendMessage,
    testPromptVariation,
    isLoading,
    error,
    lastQualityScore,
    clearError: () => setError(null),
  };
}