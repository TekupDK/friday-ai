/**
 * Priority Scorer - Intelligent email importance detection
 * Analyzes emails to determine urgency and priority level
 */

import { generateCorrelationId } from "../action-audit";
import { routeAI } from "../ai-router";

import type { EmailMessage } from "./categorizer";

export interface EmailPriority {
  score: number; // 0-100
  level: "urgent" | "high" | "normal" | "low";
  factors: {
    sender_importance: number; // 0-1
    content_urgency: number; // 0-1
    deadline_mentioned: boolean;
    requires_action: boolean;
    time_sensitive: boolean;
  };
  reasoning?: string;
}

export interface SenderProfile {
  email: string;
  relationship: "vip" | "customer" | "colleague" | "vendor" | "unknown";
  importance: number; // 0-1
  responseTime?: number; // average response time in hours
}

const PRIORITY_SCORING_PROMPT = `Du er en email prioriterings-ekspert. Analyser følgende email og bestem dens prioritet.

Email Information:
Fra: {from}
Til: {to}
Emne: {subject}
Indhold: {body}

{senderSection}

Analyser følgende faktorer:
1. Afsen ders vigtighed (VIP, kunde, kollega)
2. Indhold urgency (nøgleord: urgent, asap, deadline, vigtig)
3. Deadline nævnt (datoer, tidsfrister)
4. Kræver handling (handlingspunkter, spørgsmål)
5. Tidsfølsom (møde invitationer, events)

Svar KUN med valid JSON:
{
  "score": 75,
  "level": "high",
  "factors": {
    "sender_importance": 0.9,
    "content_urgency": 0.7,
    "deadline_mentioned": true,
    "requires_action": true,
    "time_sensitive": false
  },
  "reasoning": "VIP kunde med deadline i morgen - kræver hurtig respons"
}`;

/**
 * Score email priority
 */
export async function scorePriority(
  email: EmailMessage,
  userId: number,
  senderProfile?: SenderProfile
): Promise<EmailPriority> {
  try {
    // First try rule-based quick scoring
    const quickScore = quickPriorityScore(email, senderProfile);

    // If clearly low/normal priority, return quick score
    if (quickScore.score < 50) {
      return quickScore;
    }

    // For potentially high priority, use LLM for detailed analysis
    const senderSection = senderProfile
      ? `\nAfsender profil: ${senderProfile.relationship} (importance: ${senderProfile.importance})\n`
      : "";

    const truncatedBody =
      email.body.length > 1500
        ? email.body.substring(0, 1500) + "..."
        : email.body;

    const prompt = PRIORITY_SCORING_PROMPT.replace("{from}", email.from)
      .replace("{to}", email.to)
      .replace("{subject}", email.subject)
      .replace("{body}", truncatedBody)
      .replace("{senderSection}", senderSection);

    const response = await routeAI({
      messages: [{ role: "user", content: prompt }],
      taskType: "chat",
      userId,
      requireApproval: false,
      correlationId: generateCorrelationId(),
      tools: [],
    });

    const priority = parsePriorityResponse(response.content);
    return priority;
  } catch (error) {
    console.error("Priority scoring error:", error);
    return quickPriorityScore(email, senderProfile);
  }
}

/**
 * Quick rule-based priority scoring
 */
function quickPriorityScore(
  email: EmailMessage,
  senderProfile?: SenderProfile
): EmailPriority {
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();
  const from = email.from.toLowerCase();

  let score = 50; // Start at normal
  const factors = {
    sender_importance: 0.5,
    content_urgency: 0.5,
    deadline_mentioned: false,
    requires_action: false,
    time_sensitive: false,
  };

  // Sender importance
  if (senderProfile) {
    factors.sender_importance = senderProfile.importance;
    score += senderProfile.importance * 20;
  } else if (isVIPSender(from)) {
    factors.sender_importance = 0.9;
    score += 18;
  }

  // Urgency keywords
  const urgencyKeywords = [
    "urgent",
    "asap",
    "vigtig",
    "haster",
    "straks",
    "immediately",
  ];
  const hasUrgency = urgencyKeywords.some(
    kw => subject.includes(kw) || body.includes(kw)
  );
  if (hasUrgency) {
    factors.content_urgency = 0.9;
    score += 20;
  }

  // Deadline detection
  const deadlinePatterns = [
    /deadline|frist/i,
    /inden|before|by/i,
    /i dag|today/i,
    /i morgen|tomorrow/i,
    /denne uge|this week/i,
  ];
  const hasDeadline = deadlinePatterns.some(
    pattern => pattern.test(subject) || pattern.test(body)
  );
  if (hasDeadline) {
    factors.deadline_mentioned = true;
    score += 15;
  }

  // Action required
  const actionKeywords = [
    "skal",
    "must",
    "need",
    "kræver",
    "requires",
    "action",
  ];
  const hasAction = actionKeywords.some(
    kw => subject.includes(kw) || body.includes(kw)
  );
  const hasQuestion = body.includes("?");
  if (hasAction || hasQuestion) {
    factors.requires_action = true;
    score += 10;
  }

  // Time sensitive
  const timeKeywords = ["møde", "meeting", "event", "invitation", "aftale"];
  const hasTime = timeKeywords.some(
    kw => subject.includes(kw) || body.includes(kw)
  );
  if (hasTime) {
    factors.time_sensitive = true;
    score += 10;
  }

  // Determine level
  const level = scoreToLevel(Math.min(score, 100));

  return {
    score: Math.min(score, 100),
    level,
    factors,
    reasoning: generateReasoning(factors, level),
  };
}

/**
 * Parse LLM priority response
 */
function parsePriorityResponse(content: string): EmailPriority {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(Math.max(parsed.score || 50, 0), 100),
      level: validateLevel(parsed.level),
      factors: {
        sender_importance: Math.min(
          Math.max(parsed.factors?.sender_importance || 0.5, 0),
          1
        ),
        content_urgency: Math.min(
          Math.max(parsed.factors?.content_urgency || 0.5, 0),
          1
        ),
        deadline_mentioned: !!parsed.factors?.deadline_mentioned,
        requires_action: !!parsed.factors?.requires_action,
        time_sensitive: !!parsed.factors?.time_sensitive,
      },
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    throw new Error("Failed to parse priority response");
  }
}

/**
 * Convert score to priority level
 */
function scoreToLevel(score: number): EmailPriority["level"] {
  if (score >= 80) return "urgent";
  if (score >= 65) return "high";
  if (score >= 35) return "normal";
  return "low";
}

/**
 * Validate priority level
 */
function validateLevel(level: string): EmailPriority["level"] {
  const validLevels: EmailPriority["level"][] = [
    "urgent",
    "high",
    "normal",
    "low",
  ];
  return validLevels.includes(level as any)
    ? (level as EmailPriority["level"])
    : "normal";
}

/**
 * Check if sender is VIP
 */
function isVIPSender(from: string): boolean {
  const vipDomains = ["kunde.dk", "vip.com", "important.dk"];
  const vipKeywords = ["ceo", "director", "manager", "chef"];

  return (
    vipDomains.some(domain => from.includes(domain)) ||
    vipKeywords.some(kw => from.toLowerCase().includes(kw))
  );
}

/**
 * Generate reasoning text
 */
function generateReasoning(
  factors: EmailPriority["factors"],
  level: EmailPriority["level"]
): string {
  const reasons: string[] = [];

  if (factors.sender_importance > 0.7) {
    reasons.push("Vigtig afsender");
  }
  if (factors.content_urgency > 0.7) {
    reasons.push("Urgent indhold");
  }
  if (factors.deadline_mentioned) {
    reasons.push("Deadline nævnt");
  }
  if (factors.requires_action) {
    reasons.push("Kræver handling");
  }
  if (factors.time_sensitive) {
    reasons.push("Tidsfølsom");
  }

  if (reasons.length === 0) {
    return `Standard ${level} prioritet`;
  }

  return reasons.join(", ");
}

/**
 * Batch score priorities
 */
export async function scoreBatchPriorities(
  emails: EmailMessage[],
  userId: number,
  senderProfiles?: Map<string, SenderProfile>
): Promise<Map<string, EmailPriority>> {
  const results = new Map<string, EmailPriority>();

  // Process in parallel with rate limiting
  const BATCH_SIZE = 3;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(email =>
        scorePriority(email, userId, senderProfiles?.get(email.from)).catch(
          error => {
            console.error(`Failed to score priority for ${email.id}:`, error);
            return quickPriorityScore(email, senderProfiles?.get(email.from));
          }
        )
      )
    );

    batch.forEach((email, index) => {
      results.set(email.id, batchResults[index]);
    });
  }

  return results;
}

/**
 * Get priority statistics
 */
export function getPriorityStats(priorities: EmailPriority[]): {
  distribution: Record<string, number>;
  averageScore: number;
  urgentCount: number;
} {
  const distribution = {
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0,
  };

  let totalScore = 0;
  let urgentCount = 0;

  priorities.forEach(priority => {
    distribution[priority.level]++;
    totalScore += priority.score;
    if (priority.level === "urgent") urgentCount++;
  });

  return {
    distribution,
    averageScore: priorities.length > 0 ? totalScore / priorities.length : 0,
    urgentCount,
  };
}

/**
 * Create sender profile from history
 */
export function createSenderProfile(
  email: string,
  previousEmails: EmailMessage[]
): SenderProfile {
  // Analyze previous emails to determine relationship
  const emailCount = previousEmails.filter(e => e.from === email).length;

  let relationship: SenderProfile["relationship"] = "unknown";
  let importance = 0.5;

  if (emailCount > 10) {
    relationship = "colleague";
    importance = 0.6;
  } else if (emailCount > 5) {
    relationship = "customer";
    importance = 0.7;
  } else if (isVIPSender(email)) {
    relationship = "vip";
    importance = 0.9;
  }

  return {
    email,
    relationship,
    importance,
  };
}
