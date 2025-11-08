/**
 * AI Docs Generator - Analyzer
 * 
 * Uses OpenRouter (FREE GLM-4.5-Air) to analyze collected data and extract insights
 */

import type { CollectedData } from "./data-collector";
import { logger } from "../../_core/logger";
import { invokeLLM } from "../../_core/llm";

export interface Analysis {
  summary: string;
  keyTopics: string[];
  sentiment: "positive" | "neutral" | "negative";
  actionItems: string[];
  decisions: string[];
  openQuestions: string[];
  risks: string[];
  recommendations: string[];
  priority: "low" | "medium" | "high" | "critical";
}

/**
 * Analyze collected data using AI
 */
export async function analyzeLeadData(data: CollectedData): Promise<Analysis> {
  try {
    const prompt = buildAnalysisPrompt(data);
    
    logger.info({ leadId: data.lead.id }, "[AI Analyzer] Starting analysis");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a business analyst assistant. Analyze lead communication data and provide insights.
          
Format your response as JSON with this structure:
{
  "summary": "2-3 sentence executive summary",
  "keyTopics": ["topic1", "topic2", ...],
  "sentiment": "positive|neutral|negative",
  "actionItems": ["action 1", "action 2", ...],
  "decisions": ["decision 1", ...],
  "openQuestions": ["question 1", ...],
  "risks": ["risk 1", ...],
  "recommendations": ["recommendation 1", ...],
  "priority": "low|medium|high|critical"
}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.choices[0].message;
    const content = typeof message.content === "string" 
      ? message.content 
      : JSON.stringify(message.content);
    
    if (!content) {
      throw new Error("No response from LLM");
    }

    const analysis: Analysis = JSON.parse(content);

    logger.info(
      { 
        leadId: data.lead.id,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        actionItemsCount: analysis.actionItems.length,
      },
      "[AI Analyzer] Analysis complete"
    );

    return analysis;
  } catch (error) {
    logger.error({ error, leadId: data.lead.id }, "[AI Analyzer] Analysis failed");
    
    // Fallback analysis
    return {
      summary: `Analysis unavailable. Lead: ${data.lead.name} (${data.lead.company || 'No company'}). ${data.emailThreads.length} email threads, ${data.calendarEvents.length} meetings recorded.`,
      keyTopics: ["data-collected"],
      sentiment: "neutral",
      actionItems: ["Review communication history manually"],
      decisions: [],
      openQuestions: [],
      risks: ["AI analysis failed - manual review recommended"],
      recommendations: ["Follow up with lead", "Review communication history"],
      priority: "medium",
    };
  }
}

/**
 * Build analysis prompt from collected data
 */
function buildAnalysisPrompt(data: CollectedData): string {
  const sections: string[] = [];

  // Lead info
  sections.push(`## Lead Information
Name: ${data.lead.name}
Company: ${data.lead.company || "N/A"}
Email: ${data.lead.email}
Phone: ${data.lead.phone || "N/A"}
Status: ${data.lead.status}
First Contact: ${data.lead.createdAt}
Last Updated: ${data.lead.updatedAt}`);

  // Email threads
  if (data.emailThreads.length > 0) {
    sections.push(`\n## Email Communication (${data.emailThreads.length} threads)

Recent emails:`);
    
    data.emailThreads.slice(0, 10).forEach((thread, i) => {
      sections.push(`\n### Email ${i + 1}
Subject: ${thread.subject}
Date: ${thread.date}
From: ${thread.from_email}
To: ${thread.to_email}
Preview: ${thread.snippet}
${thread.body ? `\nBody excerpt: ${thread.body.slice(0, 500)}...` : ""}`);
    });
  }

  // Calendar events
  if (data.calendarEvents.length > 0) {
    sections.push(`\n## Meetings (${data.calendarEvents.length} events)

Recent meetings:`);
    
    data.calendarEvents.slice(0, 5).forEach((event, i) => {
      sections.push(`\n### Meeting ${i + 1}
Title: ${event.summary}
Date: ${event.start}
Attendees: ${event.attendees.join(", ") || "N/A"}
${event.description ? `Description: ${event.description}` : "No description"}`);
    });
  }

  // Chat messages
  if (data.chatMessages.length > 0) {
    sections.push(`\n## Chat Conversations (${data.chatMessages.length} messages)

Recent chats:`);
    
    data.chatMessages.slice(0, 5).forEach((msg, i) => {
      sections.push(`\n### Chat ${i + 1}
Time: ${msg.timestamp}
User: ${msg.userId}
Content: ${msg.content.slice(0, 200)}...`);
    });
  }

  sections.push(`\n## Analysis Task

Based on ALL the above information:

1. **Summary**: Create a concise 2-3 sentence summary of this lead's engagement
2. **Key Topics**: List 3-5 main topics discussed across all channels
3. **Sentiment**: Assess overall sentiment (positive/neutral/negative)
4. **Action Items**: Extract any explicit or implicit action items
5. **Decisions**: Identify any decisions made
6. **Open Questions**: List unanswered questions or unclear points
7. **Risks**: Identify potential risks or concerns
8. **Recommendations**: Suggest 2-3 next steps
9. **Priority**: Rate lead priority (low/medium/high/critical)

Focus on:
- Communication frequency and recency
- Response times and engagement level
- Deal progress and stage
- Customer needs and pain points
- Timeline and urgency
- Budget and decision-making authority`);

  return sections.join("\n");
}

/**
 * Analyze weekly digest data
 */
export async function analyzeWeeklyData(data: {
  leads: any[];
  emailThreads: any[];
  calendarEvents: any[];
  recentConversations: any[];
}): Promise<{
  summary: string;
  highlights: string[];
  metrics: {
    newLeads: number;
    emailsProcessed: number;
    meetingsHeld: number;
    conversationsHad: number;
  };
  trends: string[];
  topLeads: string[];
}> {
  try {
    const prompt = `Analyze this week's business activity:

## New Leads (${data.leads.length})
${data.leads.slice(0, 10).map(l => `- ${l.name} (${l.company || "No company"}) - ${l.email}`).join("\n")}

## Email Activity (${data.emailThreads.length} threads)
${data.emailThreads.slice(0, 10).map(e => `- ${e.subject} (${e.date})`).join("\n")}

## Meetings (${data.calendarEvents.length})
${data.calendarEvents.slice(0, 10).map(m => `- ${m.summary} (${m.start})`).join("\n")}

## Conversations (${data.recentConversations.length})
${data.recentConversations.slice(0, 5).map(c => `- ${c.content.slice(0, 100)}...`).join("\n")}

Provide JSON with:
{
  "summary": "Weekly overview paragraph",
  "highlights": ["highlight 1", "highlight 2", ...],
  "trends": ["trend 1", "trend 2", ...],
  "topLeads": ["lead name 1", "lead name 2", ...]
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a business intelligence analyst. Summarize weekly activity.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.choices[0].message;
    const content = typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);
    
    if (!content) throw new Error("No response from LLM");

    const analysis = JSON.parse(content);

    return {
      ...analysis,
      metrics: {
        newLeads: data.leads.length,
        emailsProcessed: data.emailThreads.length,
        meetingsHeld: data.calendarEvents.length,
        conversationsHad: data.recentConversations.length,
      },
    };
  } catch (error) {
    logger.error({ error }, "[AI Analyzer] Weekly analysis failed");
    
    return {
      summary: `Weekly activity: ${data.leads.length} new leads, ${data.emailThreads.length} emails, ${data.calendarEvents.length} meetings.`,
      highlights: ["Data collected successfully"],
      metrics: {
        newLeads: data.leads.length,
        emailsProcessed: data.emailThreads.length,
        meetingsHeld: data.calendarEvents.length,
        conversationsHad: data.recentConversations.length,
      },
      trends: ["Activity recorded"],
      topLeads: data.leads.slice(0, 5).map(l => l.name),
    };
  }
}
