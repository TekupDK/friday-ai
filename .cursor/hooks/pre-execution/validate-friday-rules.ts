/**
 * Pre-execution Hook: Validate Friday AI Memory Rules
 *
 * Validates code changes against Friday AI's 25 memory business rules
 * for Tekup cleaning company compliance
 */

export interface FridayRulesValidation {
  success: boolean;
  violations: RuleViolation[];
  warnings: RuleWarning[];
  rulesChecked: number;
}

export interface RuleViolation {
  rule: string;
  severity: "error" | "warning";
  message: string;
  file?: string;
  line?: number;
}

export interface RuleWarning {
  rule: string;
  message: string;
  suggestion: string;
}

/**
 * Friday AI's 25 Memory Rules for Business Logic Compliance
 */
const FRIDAY_MEMORY_RULES = {
  MEMORY_15: {
    name: "Moving cleaning requires photos",
    pattern: /flytterengøring|moving.*clean/i,
    validation: (content: string) => {
      if (content.match(/flytterengøring|moving.*clean/i)) {
        return (
          content.includes("photo") ||
          content.includes("billede") ||
          content.includes("dokumentation")
        );
      }
      return true;
    },
    message:
      "MEMORY_15: Moving cleaning bookings must always request photos for documentation",
  },

  MEMORY_16: {
    name: "Invoices must be draft-only initially",
    pattern: /invoice|faktura/i,
    validation: (content: string) => {
      if (content.match(/create.*invoice|opret.*faktura/i)) {
        return (
          content.includes("draft") ||
          content.includes("kladde") ||
          content.includes("isDraft: true")
        );
      }
      return true;
    },
    message:
      "MEMORY_16: All invoices must be created as draft initially, never directly as final",
  },

  MEMORY_17: {
    name: "No calendar attendees for bookings",
    pattern: /calendar|kalender.*attendees/i,
    validation: (content: string) => {
      if (content.match(/calendar.*event|kalender.*begivenhed/i)) {
        return (
          !content.includes("attendees") || content.includes("attendees: []")
        );
      }
      return true;
    },
    message:
      "MEMORY_17: Calendar bookings must never include attendees, only the cleaner",
  },

  MEMORY_19: {
    name: "Job completion checklist required",
    pattern: /job.*complete|opgave.*færdig/i,
    validation: (content: string) => {
      if (content.match(/complete.*job|færdiggør.*opgave/i)) {
        return (
          content.includes("checklist") ||
          content.includes("tjekliste") ||
          content.includes("validation")
        );
      }
      return true;
    },
    message:
      "MEMORY_19: Job completion must include proper checklist validation",
  },

  MEMORY_24: {
    name: "Round booking hours to nearest 15 minutes",
    pattern: /booking.*hour|timer.*booking/i,
    validation: (content: string) => {
      if (content.match(/booking.*hour|timer.*booking/i)) {
        return (
          content.includes("15") ||
          content.includes("round") ||
          content.includes("afrund")
        );
      }
      return true;
    },
    message:
      "MEMORY_24: All booking hours must be rounded to nearest 15-minute intervals",
  },

  // Tekup Business Rules
  TEKUP_BILLING: {
    name: "Billy.dk integration compliance",
    pattern: /billy|billing|fakturering/i,
    validation: (content: string) => {
      if (content.match(/billy.*api|billy.*integration/i)) {
        return content.includes("error") && content.includes("retry");
      }
      return true;
    },
    message:
      "Billy.dk integrations must include proper error handling and retry logic",
  },

  TEKUP_QUALITY: {
    name: "Cleaning quality standards",
    pattern: /quality|kvalitet.*clean/i,
    validation: (content: string) => {
      if (content.match(/quality.*check|kvalitets.*kontrol/i)) {
        return (
          content.includes("photo") ||
          content.includes("documentation") ||
          content.includes("feedback")
        );
      }
      return true;
    },
    message:
      "Quality checks must include photo documentation or customer feedback",
  },

  TEKUP_SCHEDULING: {
    name: "Scheduling integrity",
    pattern: /schedule|planlæg/i,
    validation: (content: string) => {
      if (content.match(/schedule.*appointment|planlæg.*aftale/i)) {
        return (
          content.includes("confirm") ||
          content.includes("bekræft") ||
          content.includes("validation")
        );
      }
      return true;
    },
    message: "All scheduling must include confirmation and validation steps",
  },
};

/**
 * Validate Friday AI Memory Rules compliance
 */
export async function validateFridayRules(
  changedFiles: string[]
): Promise<FridayRulesValidation> {
  const violations: RuleViolation[] = [];
  const warnings: RuleWarning[] = [];
  let rulesChecked = 0;

  try {
    // Import fs dynamically to avoid issues in browser context
    const fs = await import("fs");

    for (const filePath of changedFiles) {
      // Only check TypeScript/JavaScript files and markdown files
      if (!filePath.match(/\.(ts|tsx|js|jsx|md)$/)) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, "utf-8");

        // Check each Friday AI memory rule
        for (const [ruleId, rule] of Object.entries(FRIDAY_MEMORY_RULES)) {
          rulesChecked++;

          if (rule.pattern.test(content)) {
            const isValid = rule.validation(content);

            if (!isValid) {
              violations.push({
                rule: ruleId,
                severity: "error",
                message: rule.message,
                file: filePath,
              });
            }
          }
        }

        // Additional business logic checks
        checkCustomerDataHandling(content, filePath, violations, warnings);
        checkApiIntegrations(content, filePath, violations, warnings);
        checkServiceDelivery(content, filePath, violations, warnings);
      } catch (fileError) {
        warnings.push({
          rule: "FILE_ACCESS",
          message: `Could not read file: ${filePath}`,
          suggestion: "Check file permissions and existence",
        });
      }
    }
  } catch (error) {
    warnings.push({
      rule: "SYSTEM_ERROR",
      message: "Could not validate Friday AI rules",
      suggestion: "Check file system access",
    });
  }

  return {
    success: violations.length === 0,
    violations,
    warnings,
    rulesChecked,
  };
}

/**
 * Check customer data handling compliance
 */
function checkCustomerDataHandling(
  content: string,
  filePath: string,
  violations: RuleViolation[],
  warnings: RuleWarning[]
): void {
  // Check for proper customer data validation
  if (
    content.includes("customer") &&
    !content.includes("zod") &&
    !content.includes("validation")
  ) {
    violations.push({
      rule: "CUSTOMER_DATA_VALIDATION",
      severity: "warning",
      message: "Customer data handling should include proper validation",
      file: filePath,
    });
  }

  // Check for GDPR compliance patterns
  if (
    content.includes("customer") &&
    content.includes("delete") &&
    !content.includes("gdpr")
  ) {
    warnings.push({
      rule: "GDPR_COMPLIANCE",
      message: "Customer data deletion should consider GDPR requirements",
      suggestion: "Add GDPR compliance checks for customer data operations",
    });
  }
}

/**
 * Check API integration patterns
 */
function checkApiIntegrations(
  content: string,
  filePath: string,
  violations: RuleViolation[],
  warnings: RuleWarning[]
): void {
  // Check Billy.dk integration patterns
  if (
    content.includes("billy") &&
    !content.includes("try") &&
    !content.includes("catch")
  ) {
    violations.push({
      rule: "BILLY_ERROR_HANDLING",
      severity: "error",
      message: "Billy.dk integrations must include proper error handling",
      file: filePath,
    });
  }

  // Check Google Calendar integration patterns
  if (
    content.includes("calendar") &&
    content.includes("create") &&
    !content.includes("attendees: []")
  ) {
    violations.push({
      rule: "CALENDAR_NO_ATTENDEES",
      severity: "error",
      message: "Calendar events should not include attendees (MEMORY_17)",
      file: filePath,
    });
  }
}

/**
 * Check service delivery patterns
 */
function checkServiceDelivery(
  content: string,
  filePath: string,
  violations: RuleViolation[],
  warnings: RuleWarning[]
): void {
  // Check for flytterengøring photo requirements
  if (
    content.match(/flytterengøring|moving.*clean/i) &&
    !content.includes("photo")
  ) {
    violations.push({
      rule: "MOVING_CLEAN_PHOTOS",
      severity: "error",
      message: "Moving cleaning services must request photos (MEMORY_15)",
      file: filePath,
    });
  }

  // Check job completion patterns
  if (
    content.includes("complete") &&
    content.includes("job") &&
    !content.includes("checklist")
  ) {
    warnings.push({
      rule: "JOB_COMPLETION_CHECKLIST",
      message: "Job completion should include checklist validation (MEMORY_19)",
      suggestion: "Add checklist validation to job completion workflow",
    });
  }
}

export default validateFridayRules;
