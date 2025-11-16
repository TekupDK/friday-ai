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

  // CRITICAL EMAIL DUPLICATE CHECK
  {
    id: "MEMORY_2",
    priority: "HIGH",
    category: "EMAIL",
    rule: "Gmail duplicate check før tilbud",
    description: "Søg i Gmail før nye tilbud sendes",
    enforcement: async context => {
      if (!context.customerEmail || !context.isOffer) return true;

      console.log("[MEMORY_2] Checking Gmail for duplicates...");
      context.requiresGmailCheck = true;
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

      // Parse the time string (format: "HH:MM" or "HH:MM:SS")
      const timeMatch = context.proposedTime.match(/^(\d{1,2}):(\d{2})/);
      if (!timeMatch) {
        console.warn("[MEMORY_15] ⚠️ Invalid time format");
        return true; // Skip validation if format is invalid
      }

      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);

      // Round to nearest half hour (0 or 30 minutes)
      // Ties round down (e.g., 15 rounds to 0, 45 rounds to 30)
      // 0-15 → round to :00 (15 is tie, round down)
      // 16-44 → round to :30
      // 45 → tie, round down to :30
      // 46-59 → round to :00 (next hour, but we keep current hour)
      let roundedMinutes: number;
      if (minutes <= 15) {
        roundedMinutes = 0; // Round down to :00 (including tie at 15)
      } else if (minutes <= 45) {
        roundedMinutes = 30; // Round to :30 (including tie at 45)
      } else {
        roundedMinutes = 0; // 46+ rounds to :00 (next hour, but keep current hour)
      }

      if (minutes !== roundedMinutes) {
        console.warn(
          "[MEMORY_15] ⚠️ Ikke rund tid - retter til nærmeste halve time"
        );
        // Preserve hours and update minutes
        context.proposedTime = `${hours.toString().padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;
        return false;
      }
      return true;
    },
  },

  // CRITICAL FLYTTE RULES
  {
    id: "MEMORY_16",
    priority: "CRITICAL",
    category: "LEAD",
    rule: "Altid anmod om billeder for flytterengøring",
    description: "BLOCK quote sending until photos received",
    enforcement: async context => {
      if (!context.lead || !context.isFlytterengøring) return true;

      if (!context.hasPhotos) {
        console.error(
          "[MEMORY_16] ❌ KRITISK: Må IKKE sende tilbud uden billeder!"
        );
        context.blockQuoteSending = true;
        context.requiresPhotos = true;
        return false; // Block quote
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

  // CRITICAL INVOICE RULES
  {
    id: "MEMORY_17",
    priority: "CRITICAL",
    category: "LEAD",
    rule: "Faktura-udkast kun, aldrig auto-godkend",
    description: "Alle fakturaer skal være draft, 349 kr/time/person",
    enforcement: async context => {
      if (!context.invoice) return true;

      if (context.invoice.state !== "draft") {
        console.error("[MEMORY_17] ❌ KRITISK: Faktura skal være draft!");
        context.invoice.state = "draft";
        return false;
      }

      // Verify price
      const hasCorrectPrice = context.invoice.lines?.some(
        (line: any) => line.unitPrice === 349
      );
      if (!hasCorrectPrice && context.invoice.lines?.length > 0) {
        console.warn("[MEMORY_17] ⚠️ Pris skal være 349 kr/time");
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

  // LEAD NAME VERIFICATION
  {
    id: "MEMORY_25",
    priority: "MEDIUM",
    category: "LEAD",
    rule: "Verify lead name against actual email",
    description: "Brug navn fra email signatur, ikke lead system",
    enforcement: async context => {
      if (!context.lead || !context.email) return true;

      const leadName = context.lead.name?.toLowerCase();
      const emailName = context.email.signatureName?.toLowerCase();

      if (leadName && emailName && leadName !== emailName) {
        console.warn("[MEMORY_25] ⚠️ Navn mismatch - brug email signatur navn");
        context.useEmailName = true;
        return false;
      }

      return true;
    },
  },

  // CRITICAL JOB COMPLETION
  {
    id: "MEMORY_24",
    priority: "CRITICAL",
    category: "LEAD",
    rule: "Job completion kræver 6-step checklist",
    description: "Faktura, team, betaling, tid, kalender, labels",
    enforcement: async context => {
      if (!context.jobCompletion) return true;

      const checklist = {
        invoice: !!context.jobCompletion.invoiceId,
        team: !!context.jobCompletion.team,
        payment: !!context.jobCompletion.paymentMethod,
        time: !!context.jobCompletion.actualTime,
        calendar: !!context.jobCompletion.calendarUpdated,
        labels: !!context.jobCompletion.labelsRemoved,
      };

      const allComplete = Object.values(checklist).every(v => v === true);
      if (!allComplete) {
        console.error(
          "[MEMORY_24] ❌ Job completion mangler steps:",
          checklist
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
