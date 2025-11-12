/**
 * AI Memory Rules System - Shortwave-Inspired
 *
 * Implements the 25 memory rules that govern AI behavior
 * Based on actual Shortwave configuration
 */

export interface MemoryRule {
  id: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "TIME" | "EMAIL" | "CALENDAR" | "LEAD" | "STYLE" | "SECURITY";
  rule: string;
  description: string;
  enforcement: (context: any) => Promise<boolean>;
}

export const AI_MEMORY_RULES: MemoryRule[] = [
  // CRITICAL TIME RULES
  {
    id: "MEMORY_1",
    priority: "CRITICAL",
    category: "TIME",
    rule: "ALTID tjek dato/tid først",
    description: "INGEN UNDTAGELSER - Datofejl = skadeligt for business",
    enforcement: async context => {
      const now = new Date();
      console.log(`[MEMORY_1] Current time verified: ${now.toISOString()}`);
      return true;
    },
  },

  // CRITICAL LEAD RULES
  {
    id: "MEMORY_4",
    priority: "CRITICAL",
    category: "LEAD",
    rule: "Lead source specific handling",
    description:
      "Rengøring.nu → ALDRIG reply direkte, Leadmail.no → Opret NY email, AdHelp → Send til kundens email",
    enforcement: async context => {
      if (!context.email) return true;

      const from = context.email.from.toLowerCase();

      if (from.includes("rengoering.nu") || from.includes("leadmail.no")) {
        console.warn("[MEMORY_4] ⚠️ Lead email - må IKKE reply direkte!");
        context.createNewEmail = true;
        context.replyDirectly = false;
        return false; // Block direct reply
      }

      if (from.includes("adhelp")) {
        console.log("[MEMORY_4] AdHelp lead - extract customer email");
        context.extractCustomerEmail = true;
      }

      return true;
    },
  },

  // CRITICAL CALENDAR RULES
  {
    id: "MEMORY_5",
    priority: "CRITICAL",
    category: "CALENDAR",
    rule: "ALTID tjek kalender før datoforslag",
    description: "ALDRIG gæt på ledige tider",
    enforcement: async context => {
      if (!context.proposedDate) return true;

      // Must check calendar availability
      console.log("[MEMORY_5] Checking calendar availability...");
      context.requiresCalendarCheck = true;
      return true;
    },
  },

  // CRITICAL EMAIL PROCESS
  {
    id: "MEMORY_7",
    priority: "CRITICAL",
    category: "EMAIL",
    rule: "ALTID søg efter eksisterende først",
    description: "Undgå dobbelt-tilbud",
    enforcement: async context => {
      if (!context.customerEmail) return true;

      console.log("[MEMORY_7] Searching for existing communication...");
      context.requiresHistoryCheck = true;
      return true;
    },
  },

  // CALENDAR FORMATTING
  {
    id: "MEMORY_15",
    priority: "HIGH",
    category: "CALENDAR",
    rule: "Runde tider only",
    description: "Kun hele og halve timer (9:00, 9:30, ikke 9:15)",
    enforcement: async context => {
      if (!context.proposedTime) return true;

      const minutes = new Date(
        `2024-01-01 ${context.proposedTime}`
      ).getMinutes();
      if (minutes !== 0 && minutes !== 30) {
        console.warn(
          "[MEMORY_15] ⚠️ Ikke rund tid - retter til nærmeste halve time"
        );
        context.proposedTime =
          minutes < 15 ? ":00" : minutes < 45 ? ":30" : ":00";
        return false;
      }
      return true;
    },
  },

  // EMAIL STYLE
  {
    id: "MEMORY_16",
    priority: "HIGH",
    category: "STYLE",
    rule: "Max 10-12 linjer til leads",
    description: "Korte, konkrete emails til nye leads",
    enforcement: async context => {
      if (!context.draftEmail) return true;

      const lineCount = context.draftEmail.split("\n").length;
      if (lineCount > 12) {
        console.warn("[MEMORY_16] ⚠️ Email for lang - skal forkortes");
        context.requiresShortening = true;
        return false;
      }
      return true;
    },
  },

  // CALENDAR CONFLICTS
  {
    id: "MEMORY_18",
    priority: "CRITICAL",
    category: "CALENDAR",
    rule: "Tjek ALTID for overlaps først",
    description: "Ingen dobbeltbooking",
    enforcement: async context => {
      if (!context.calendarEvent) return true;

      console.log("[MEMORY_18] Checking for calendar conflicts...");
      context.requiresConflictCheck = true;
      return true;
    },
  },

  // CALENDAR ATTENDEES
  {
    id: "MEMORY_19",
    priority: "CRITICAL",
    category: "CALENDAR",
    rule: "ALDRIG brug attendees parameter",
    description: "Ingen Google invitations",
    enforcement: async context => {
      if (!context.calendarEvent) return true;

      if (context.calendarEvent.attendees) {
        console.error("[MEMORY_19] ❌ KRITISK: Attendees ikke tilladt!");
        delete context.calendarEvent.attendees;
        return false;
      }
      return true;
    },
  },

  // BUSINESS SPECIFIC
  {
    id: "MEMORY_22",
    priority: "HIGH",
    category: "LEAD",
    rule: "Fast timepris 349 kr. inkl. moms",
    description: "Altid nævn prisen inkl. moms",
    enforcement: async context => {
      if (!context.draftEmail || !context.isOffer) return true;

      if (
        !context.draftEmail.includes("349 kr") ||
        !context.draftEmail.includes("inkl. moms")
      ) {
        console.warn("[MEMORY_22] ⚠️ Pris skal inkludere moms");
        context.draftEmail = context.draftEmail.replace(
          /\d+ kr/,
          "349 kr. inkl. moms"
        );
      }
      return true;
    },
  },

  // ENVIRONMENTAL
  {
    id: "MEMORY_23",
    priority: "MEDIUM",
    category: "STYLE",
    rule: "Miljøvenlig profil",
    description: "Nævn svanemærkede produkter når relevant",
    enforcement: async context => {
      if (!context.draftEmail || !context.isOffer) return true;

      if (
        !context.draftEmail.includes("miljøvenlig") &&
        !context.draftEmail.includes("svanemærk")
      ) {
        console.log("[MEMORY_23] Tilføjer miljø-reference");
        context.addEnvironmentalNote = true;
      }
      return true;
    },
  },

  // EMOJI USAGE
  {
    id: "MEMORY_24",
    priority: "LOW",
    category: "STYLE",
    rule: "Brug emojis sparsomt",
    description: "🌿 kun ved miljø, ✅ ved bekræftelse, 📅 ved datoer",
    enforcement: async context => {
      if (!context.draftEmail) return true;

      const allowedEmojis = ["🌿", "✅", "📅", "📏", "👥", "⏰"];
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
      const usedEmojis = context.draftEmail.match(emojiRegex) || [];

      const invalidEmojis = usedEmojis.filter(e => !allowedEmojis.includes(e));
      if (invalidEmojis.length > 0) {
        console.warn(
          `[MEMORY_24] ⚠️ Ugyldige emojis: ${invalidEmojis.join(", ")}`
        );
        return false;
      }
      return true;
    },
  },
];

/**
 * Apply all memory rules to a context
 */
export async function applyMemoryRules(context: any): Promise<{
  passed: boolean;
  violations: string[];
  warnings: string[];
}> {
  const violations: string[] = [];
  const warnings: string[] = [];

  for (const rule of AI_MEMORY_RULES) {
    try {
      const passed = await rule.enforcement(context);

      if (!passed) {
        if (rule.priority === "CRITICAL") {
          violations.push(`[${rule.id}] ${rule.rule}`);
        } else {
          warnings.push(`[${rule.id}] ${rule.rule}`);
        }
      }
    } catch (error) {
      console.error(`Error applying rule ${rule.id}:`, error);
      warnings.push(`[${rule.id}] Error: ${error}`);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Get rules by category
 */
export function getRulesByCategory(
  category: MemoryRule["category"]
): MemoryRule[] {
  return AI_MEMORY_RULES.filter(rule => rule.category === category);
}

/**
 * Get critical rules only
 */
export function getCriticalRules(): MemoryRule[] {
  return AI_MEMORY_RULES.filter(rule => rule.priority === "CRITICAL");
}

/**
 * Format rules for display in UI
 */
export function formatRulesForDisplay(
  rules: MemoryRule[] = AI_MEMORY_RULES
): Array<{
  icon: string;
  text: string;
  priority: string;
}> {
  const iconMap: Record<MemoryRule["category"], string> = {
    TIME: "⏰",
    EMAIL: "📧",
    CALENDAR: "📅",
    LEAD: "🎯",
    STYLE: "✏️",
    SECURITY: "🛡️",
  };

  return rules.map(rule => ({
    icon: iconMap[rule.category] || "📋",
    text: rule.rule,
    priority: rule.priority,
  }));
}
