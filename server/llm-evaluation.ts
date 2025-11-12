/**
 * LLM Quality Evaluation System for Friday AI
 * Tracks response quality, intent accuracy, and token efficiency
 */

export type EvaluationMetric =
  | "intent_accuracy" // Did we detect the right intent?
  | "action_relevance" // Was the suggested action appropriate?
  | "response_quality" // Was the response helpful?
  | "token_efficiency" // Tokens used vs. value delivered
  | "conversation_coherence" // Multi-turn consistency
  | "hallucination_check"; // Did we make up facts?

export interface EvaluationScore {
  metric: EvaluationMetric;
  score: number; // 0-100
  confidence: number; // 0-1
  reasoning?: string;
  conversationId: number;
  messageId?: number;
  timestamp: string;
}

/**
 * Evaluation store (in-memory for dev, database for prod)
 */
const evaluationStore: EvaluationScore[] = [];

/**
 * Evaluate intent detection accuracy
 * Compare detected intent vs. actual user action
 */
export async function evaluateIntentAccuracy(
  conversationId: number,
  detectedIntent: string,
  userApproved: boolean,
  alternativeActions: string[]
): Promise<EvaluationScore> {
  // If user approved, intent was correct
  if (userApproved) {
    return recordScore({
      metric: "intent_accuracy",
      score: 100,
      confidence: 1.0,
      conversationId,
      reasoning: "User approved suggested action immediately",
    });
  }

  // If user rejected but we had alternatives
  if (alternativeActions.length > 0) {
    return recordScore({
      metric: "intent_accuracy",
      score: 60,
      confidence: 0.8,
      conversationId,
      reasoning: `Intent detected but user chose alternative: ${alternativeActions[0]}`,
    });
  }

  // Complete miss
  return recordScore({
    metric: "intent_accuracy",
    score: 0,
    confidence: 1.0,
    conversationId,
    reasoning: "User rejected action and no alternatives matched",
  });
}

/**
 * Evaluate token efficiency
 * Score = (value delivered) / (tokens used) * 100
 */
export function evaluateTokenEfficiency(
  conversationId: number,
  totalTokens: number,
  actionExecuted: boolean,
  userSatisfaction?: number // 1-5 scale
): EvaluationScore {
  // Baseline: successful action with <500 tokens = 100 score
  // Every 100 extra tokens = -10 points
  let score = 100;

  if (!actionExecuted) {
    score = 20; // Low value if no action taken
  }

  const tokenPenalty = Math.floor((totalTokens - 500) / 100) * 10;
  score = Math.max(0, score - tokenPenalty);

  if (userSatisfaction) {
    // Boost score based on satisfaction (1-5 → 0.6-1.0 multiplier)
    score *= 0.6 + (userSatisfaction / 5) * 0.4;
  }

  return recordScore({
    metric: "token_efficiency",
    score: Math.round(score),
    confidence: 0.9,
    conversationId,
    reasoning: `${totalTokens} tokens, action=${actionExecuted}, satisfaction=${userSatisfaction || "N/A"}`,
  });
}

/**
 * Check for hallucinations in Friday's response
 * Uses simple heuristics - can be enhanced with LLM-as-judge later
 */
export function checkHallucinations(
  conversationId: number,
  response: string,
  knownFacts: Record<string, any>
): EvaluationScore {
  let hallucinationIndicators = 0;

  // Simple checks (can be enhanced)
  const suspiciousPhrases = [
    "I'm sure that",
    "definitely confirmed",
    "100% certain",
    "I verified",
  ];

  suspiciousPhrases.forEach(phrase => {
    if (response.toLowerCase().includes(phrase)) {
      hallucinationIndicators++;
    }
  });

  // Check if response mentions specific data that wasn't provided
  // (more sophisticated check needed - placeholder)

  const score = Math.max(0, 100 - hallucinationIndicators * 30);

  return recordScore({
    metric: "hallucination_check",
    score,
    confidence: 0.7,
    conversationId,
    reasoning: `Found ${hallucinationIndicators} suspicious phrases`,
  });
}

/**
 * Record evaluation score
 */
function recordScore(
  data: Omit<EvaluationScore, "timestamp">
): EvaluationScore {
  const score: EvaluationScore = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  evaluationStore.push(score);

  console.log(
    `[LLM EVAL] ${score.metric}: ${score.score}/100 (${score.reasoning})`
  );

  return score;
}

/**
 * Get average scores by metric
 */
export function getEvaluationSummary(
  conversationId?: number
): Record<EvaluationMetric, { avg: number; count: number }> {
  const scores = conversationId
    ? evaluationStore.filter(s => s.conversationId === conversationId)
    : evaluationStore;

  const summary: any = {};

  const metrics: EvaluationMetric[] = [
    "intent_accuracy",
    "action_relevance",
    "response_quality",
    "token_efficiency",
    "conversation_coherence",
    "hallucination_check",
  ];

  metrics.forEach(metric => {
    const metricScores = scores.filter(s => s.metric === metric);
    const avg =
      metricScores.length > 0
        ? Math.round(
            metricScores.reduce((sum, s) => sum + s.score, 0) /
              metricScores.length
          )
        : 0;

    summary[metric] = {
      avg,
      count: metricScores.length,
    };
  });

  return summary;
}

/**
 * Export evaluation data for training
 * Format compatible with Agent Lightning
 */
export function exportEvaluationData(since?: Date): {
  conversations: Array<{
    id: number;
    scores: EvaluationScore[];
    overallQuality: number;
  }>;
} {
  const sinceTimestamp = since?.toISOString() || "1970-01-01";
  const relevantScores = evaluationStore.filter(
    s => s.timestamp > sinceTimestamp
  );

  // Group by conversation
  const byConversation = new Map<number, EvaluationScore[]>();
  relevantScores.forEach(score => {
    if (!byConversation.has(score.conversationId)) {
      byConversation.set(score.conversationId, []);
    }
    byConversation.get(score.conversationId)!.push(score);
  });

  // Calculate overall quality per conversation
  const conversations = Array.from(byConversation.entries()).map(
    ([id, scores]) => {
      const avgScore =
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      return {
        id,
        scores,
        overallQuality: Math.round(avgScore),
      };
    }
  );

  return { conversations };
}
