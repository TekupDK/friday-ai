/**
 * AI Docs Generator - Document Generator
 *
 * Generates markdown documentation from analyzed data
 */

import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";

import type { Analysis } from "./analyzer";
import type { CollectedData } from "./data-collector";

/**
 * Generate lead documentation
 */
export function generateLeadDocument(
  data: CollectedData,
  analysis: Analysis
): string {
  const sections: string[] = [];

  // Header
  sections.push(`# 🤝 Lead: ${data.lead.company || data.lead.name}`);
  sections.push("");

  // AI Summary Badge
  const priorityEmoji = {
    low: "🟢",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  }[analysis.priority];

  const sentimentEmoji = {
    positive: "😊",
    neutral: "😐",
    negative: "😞",
  }[analysis.sentiment];

  sections.push(
    `> ${priorityEmoji} **Priority:** ${analysis.priority.toUpperCase()} | ${sentimentEmoji} **Sentiment:** ${analysis.sentiment}`
  );
  sections.push("");

  // Overview
  sections.push(`## 📋 Overview`);
  sections.push("");
  sections.push(`- **Contact:** ${data.lead.name}`);
  sections.push(`- **Company:** ${data.lead.company || "N/A"}`);
  sections.push(`- **Email:** ${data.lead.email}`);
  sections.push(`- **Phone:** ${data.lead.phone || "N/A"}`);
  sections.push(`- **Status:** ${data.lead.status}`);
  sections.push(`- **First Contact:** ${formatDate(data.lead.createdAt)}`);
  sections.push(`- **Last Activity:** ${formatDate(data.lead.updatedAt)}`);
  sections.push("");

  // AI Executive Summary
  sections.push(`## 🤖 AI Executive Summary`);
  sections.push("");
  sections.push(analysis.summary);
  sections.push("");

  // Key Topics
  if (analysis.keyTopics.length > 0) {
    sections.push(`### 🎯 Key Topics Discussed`);
    sections.push("");
    analysis.keyTopics.forEach(topic => {
      sections.push(`- ${topic}`);
    });
    sections.push("");
  }

  // Communication History
  sections.push(`## 📧 Communication History`);
  sections.push("");

  // Email Threads
  if (data.emailThreads.length > 0) {
    sections.push(`### Email Threads (${data.emailThreads.length})`);
    sections.push("");

    data.emailThreads.slice(0, 15).forEach((thread, i) => {
      const timeAgo = formatDistanceToNow(new Date((thread as any).date), {
        addSuffix: true,
        locale: da,
      });

      sections.push(`#### ${i + 1}. ${thread.subject}`);
      sections.push(`**Date:** ${formatDate((thread as any).date)} (${timeAgo})`);
      sections.push(`**From:** ${(thread as any).from_email}`);
      sections.push(`**To:** ${(thread as any).to_email}`);
      sections.push("");
      sections.push(`> ${thread.snippet}`);
      sections.push("");
    });
  } else {
    sections.push(`*No email communication recorded*`);
    sections.push("");
  }

  // Calendar Events
  if (data.calendarEvents.length > 0) {
    sections.push(`### 📅 Meetings (${data.calendarEvents.length})`);
    sections.push("");

    data.calendarEvents.forEach((event, i) => {
      const timeAgo = formatDistanceToNow(new Date(event.start), {
        addSuffix: true,
        locale: da,
      });

      sections.push(`#### ${i + 1}. ${event.summary}`);
      sections.push(`**Date:** ${formatDate(event.start)} (${timeAgo})`);
      if (event.attendees.length > 0) {
        sections.push(`**Attendees:** ${event.attendees.join(", ")}`);
      }
      if (event.description) {
        sections.push("");
        sections.push(`**Notes:**`);
        sections.push(`> ${event.description}`);
      }
      sections.push("");
    });
  }

  // Chat Conversations
  if (data.chatMessages.length > 0) {
    sections.push(`### 💬 Chat Conversations (${data.chatMessages.length})`);
    sections.push("");

    data.chatMessages.slice(0, 5).forEach((msg, i) => {
      const timeAgo = formatDistanceToNow(new Date(msg.timestamp), {
        addSuffix: true,
        locale: da,
      });

      sections.push(`#### ${i + 1}. Chat from ${msg.userId}`);
      sections.push(`**Time:** ${formatDate(msg.timestamp)} (${timeAgo})`);
      sections.push("");
      sections.push(
        `> ${msg.content.slice(0, 300)}${msg.content.length > 300 ? "..." : ""}`
      );
      sections.push("");
    });
  }

  // AI Analysis Section
  sections.push(`## 🔍 AI Analysis`);
  sections.push("");

  // Action Items
  if (analysis.actionItems.length > 0) {
    sections.push(`### ✅ Action Items`);
    sections.push("");
    analysis.actionItems.forEach(item => {
      sections.push(`- [ ] ${item}`);
    });
    sections.push("");
  }

  // Decisions Made
  if (analysis.decisions.length > 0) {
    sections.push(`### 📌 Decisions Made`);
    sections.push("");
    analysis.decisions.forEach(decision => {
      sections.push(`- ✓ ${decision}`);
    });
    sections.push("");
  }

  // Open Questions
  if (analysis.openQuestions.length > 0) {
    sections.push(`### ❓ Open Questions`);
    sections.push("");
    analysis.openQuestions.forEach(question => {
      sections.push(`- ${question}`);
    });
    sections.push("");
  }

  // Risks
  if (analysis.risks.length > 0) {
    sections.push(`### ⚠️ Risk Assessment`);
    sections.push("");
    analysis.risks.forEach(risk => {
      sections.push(`- 🚨 ${risk}`);
    });
    sections.push("");
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    sections.push(`### 💡 Recommendations`);
    sections.push("");
    analysis.recommendations.forEach(rec => {
      sections.push(`- ${rec}`);
    });
    sections.push("");
  }

  // Footer
  sections.push(`---`);
  sections.push("");
  sections.push(`**📊 Document Statistics**`);
  sections.push(`- Email threads analyzed: ${data.emailThreads.length}`);
  sections.push(`- Meetings recorded: ${data.calendarEvents.length}`);
  sections.push(`- Chat messages: ${data.chatMessages.length}`);
  sections.push(`- Generated: ${new Date().toLocaleString("da-DK")}`);
  sections.push(`- Source: AI-powered analysis`);
  sections.push("");
  sections.push(
    `*This document was automatically generated by Friday AI. Please review and update as needed.*`
  );

  return sections.join("\n");
}

/**
 * Generate weekly digest document
 */
export function generateWeeklyDigest(
  weeklyData: {
    leads: any[];
    emailThreads: any[];
    calendarEvents: any[];
    recentConversations: any[];
  },
  analysis: {
    summary: string;
    highlights: string[];
    metrics: any;
    trends: string[];
    topLeads: string[];
  }
): string {
  const sections: string[] = [];

  const weekNumber = getWeekNumber(new Date());
  const year = new Date().getFullYear();

  // Header
  sections.push(`# 📊 Weekly Digest: Week ${weekNumber}, ${year}`);
  sections.push("");
  sections.push(`**Period:** ${getWeekDateRange()}`);
  sections.push("");

  // Executive Summary
  sections.push(`## 🎯 Executive Summary`);
  sections.push("");
  sections.push(analysis.summary);
  sections.push("");

  // Metrics Dashboard
  sections.push(`## 📈 Key Metrics`);
  sections.push("");
  sections.push(`| Metric | Count |`);
  sections.push(`|--------|-------|`);
  sections.push(`| 🆕 New Leads | ${analysis.metrics.newLeads} |`);
  sections.push(
    `| 📧 Emails Processed | ${analysis.metrics.emailsProcessed} |`
  );
  sections.push(`| 📅 Meetings Held | ${analysis.metrics.meetingsHeld} |`);
  sections.push(`| 💬 Conversations | ${analysis.metrics.conversationsHad} |`);
  sections.push("");

  // Highlights
  if (analysis.highlights.length > 0) {
    sections.push(`## ⭐ Week Highlights`);
    sections.push("");
    analysis.highlights.forEach((highlight, i) => {
      sections.push(`${i + 1}. ${highlight}`);
    });
    sections.push("");
  }

  // Trends
  if (analysis.trends.length > 0) {
    sections.push(`## 📊 Trends & Insights`);
    sections.push("");
    analysis.trends.forEach(trend => {
      sections.push(`- 📈 ${trend}`);
    });
    sections.push("");
  }

  // Top Leads
  if (analysis.topLeads.length > 0) {
    sections.push(`## 🏆 Top Leads This Week`);
    sections.push("");
    analysis.topLeads.forEach((lead, i) => {
      sections.push(`${i + 1}. **${lead}**`);
    });
    sections.push("");
  }

  // New Leads Detail
  if (weeklyData.leads.length > 0) {
    sections.push(`## 🆕 New Leads (${weeklyData.leads.length})`);
    sections.push("");
    weeklyData.leads.slice(0, 10).forEach(lead => {
      sections.push(`- **${lead.name}** (${lead.company || "No company"})`);
      sections.push(`  - Email: ${lead.email}`);
      sections.push(`  - Status: ${lead.status}`);
      sections.push(`  - Added: ${formatDate(lead.createdAt)}`);
    });
    sections.push("");
  }

  // Recent Meetings
  if (weeklyData.calendarEvents.length > 0) {
    sections.push(
      `## 📅 Recent Meetings (${weeklyData.calendarEvents.length})`
    );
    sections.push("");
    weeklyData.calendarEvents.slice(0, 10).forEach(event => {
      sections.push(`- **${event.summary}**`);
      sections.push(`  - Date: ${formatDate(event.start)}`);
      if (event.attendees.length > 0) {
        sections.push(
          `  - Attendees: ${event.attendees.slice(0, 3).join(", ")}${event.attendees.length > 3 ? "..." : ""}`
        );
      }
    });
    sections.push("");
  }

  // Footer
  sections.push(`---`);
  sections.push("");
  sections.push(`*Generated: ${new Date().toLocaleString("da-DK")}*`);
  sections.push(`*AI-powered weekly digest by Friday AI*`);

  return sections.join("\n");
}

/**
 * Helper: Format date
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("da-DK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Helper: Get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Helper: Get week date range
 */
function getWeekDateRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return `${startOfWeek.toLocaleDateString("da-DK")} - ${endOfWeek.toLocaleDateString("da-DK")}`;
}
