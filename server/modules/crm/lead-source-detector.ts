/**
 * Phase 9.2: Intelligent Lead Source Detection
 *
 * AI-powered lead source detection with confidence scoring.
 * Combines pattern matching with intelligent analysis.
 */

export type LeadSource =
  | "rengoring_nu"
  | "rengoring_aarhus"
  | "adhelp"
  | "website"
  | "referral"
  | "phone"
  | "social_media"
  | "billy_import"
  | "direct"
  | "unknown";

export interface SourceDetection {
  source: LeadSource;
  confidence: number; // 0-100 confidence score
  reasoning: string; // Why this source was detected
  patterns: string[]; // Matched patterns
}

export interface SourcePattern {
  source: LeadSource;
  patterns: {
    domains?: string[];
    subjects?: string[];
    body?: string[];
    headers?: string[];
  };
  weight: number; // Confidence weight for this source
}

interface EmailData {
  from: string;
  to: string;
  subject: string;
  body: string;
}

/**
 * Phase 9.2: Enhanced source pattern definitions
 */
const SOURCE_PATTERNS: SourcePattern[] = [
  {
    source: "rengoring_nu",
    weight: 95,
    patterns: {
      domains: ["leadmail.no", "nettbureau", "leadmail.com"],
      subjects: ["rengøring.nu", "rengoring nu", "leadmail"],
      body: ["leadmail.no", "nettbureau", "rengøring.nu"],
    },
  },
  {
    source: "rengoring_aarhus",
    weight: 90,
    patterns: {
      domains: ["leadpoint.dk", "leadpoint.com"],
      subjects: ["rengøring århus", "rengoring aarhus", "leadpoint"],
      body: ["leadpoint.dk", "rengøring århus"],
    },
  },
  {
    source: "adhelp",
    weight: 85,
    patterns: {
      domains: ["adhelp.dk", "mw.adhelp.dk", "sp.adhelp.dk"],
      subjects: ["adhelp", "marketing help"],
      body: ["adhelp.dk", "adhelp"],
    },
  },
  {
    source: "website",
    weight: 70,
    patterns: {
      subjects: ["kontaktformular", "website", "hjemmeside", "online"],
      body: ["kontaktformular", "website", "hjemmeside", "online forespørgsel"],
    },
  },
  {
    source: "referral",
    weight: 60,
    patterns: {
      subjects: ["henvisning", "anbefaling", "referral"],
      body: ["henvisning", "anbefalet af", "refereret af"],
    },
  },
  {
    source: "phone",
    weight: 75,
    patterns: {
      subjects: ["opkald", "telefon", "ringte"],
      body: ["ringte", "telefonopkald", "opkald i dag"],
    },
  },
  {
    source: "social_media",
    weight: 65,
    patterns: {
      domains: ["facebook.com", "linkedin.com", "instagram.com"],
      subjects: ["facebook", "linkedin", "instagram", "social media"],
      body: ["facebook", "linkedin", "instagram"],
    },
  },
  {
    source: "billy_import",
    weight: 100,
    patterns: {
      subjects: ["billy", "regnskab", "import"],
      body: ["billy", "regnskabsimport"],
    },
  },
];

/**
 * Phase 9.2: Intelligent lead source detection with confidence scoring
 *
 * Uses pattern matching with confidence analysis and reasoning.
 */
export function detectLeadSourceIntelligent(email: EmailData): SourceDetection {
  const from = email.from.toLowerCase();
  const to = email.to.toLowerCase();
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();

  const matches: Array<{
    source: LeadSource;
    confidence: number;
    reasoning: string;
    patterns: string[];
  }> = [];

  // Analyze each source pattern
  for (const pattern of SOURCE_PATTERNS) {
    const matchedPatterns: string[] = [];
    let confidence = 0;

    // Check domain patterns
    if (pattern.patterns.domains) {
      for (const domain of pattern.patterns.domains) {
        if (from.includes(domain) || to.includes(domain)) {
          matchedPatterns.push(`domain: ${domain}`);
          confidence += pattern.weight * 0.6; // Domain is strongest signal
        }
      }
    }

    // Check subject patterns
    if (pattern.patterns.subjects) {
      for (const subj of pattern.patterns.subjects) {
        if (subject.includes(subj)) {
          matchedPatterns.push(`subject: ${subj}`);
          confidence += pattern.weight * 0.3; // Subject is medium signal
        }
      }
    }

    // Check body patterns
    if (pattern.patterns.body) {
      for (const bodyPattern of pattern.patterns.body) {
        if (body.includes(bodyPattern)) {
          matchedPatterns.push(`body: ${bodyPattern}`);
          confidence += pattern.weight * 0.1; // Body is weakest signal
        }
      }
    }

    // If we found matches, add to results
    if (matchedPatterns.length > 0) {
      matches.push({
        source: pattern.source,
        confidence: Math.min(confidence, 100), // Cap at 100
        reasoning: `Matched ${matchedPatterns.length} patterns for ${pattern.source}`,
        patterns: matchedPatterns,
      });
    }
  }

  // Sort by confidence and return best match
  if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    const best = matches[0];

    return {
      source: best.source,
      confidence: best.confidence,
      reasoning: best.reasoning,
      patterns: best.patterns,
    };
  }

  // Fallback to unknown with low confidence
  return {
    source: "unknown",
    confidence: 20,
    reasoning: "No specific patterns detected, classified as unknown",
    patterns: [],
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use detectLeadSourceIntelligent instead
 */
export function detectLeadSource(email: EmailData): LeadSource | null {
  const detection = detectLeadSourceIntelligent(email);
  return detection.source;
}

/**
 * Phase 9.2: Batch source detection for multiple emails
 */
export function detectLeadSourcesBatch(emails: EmailData[]): SourceDetection[] {
  return emails.map(email => detectLeadSourceIntelligent(email));
}

/**
 * Phase 9.2: Get source statistics for analytics
 */
export function getSourceStatistics(detections: SourceDetection[]): {
  total: number;
  bySource: Record<LeadSource, number>;
  averageConfidence: number;
  highConfidenceCount: number; // confidence > 80
} {
  const total = detections.length;
  const bySource = {} as Record<LeadSource, number>;
  let totalConfidence = 0;
  let highConfidenceCount = 0;

  for (const detection of detections) {
    const source = detection.source || "unknown";
    bySource[source] = (bySource[source] || 0) + 1;
    totalConfidence += detection.confidence;
    if (detection.confidence > 80) {
      highConfidenceCount++;
    }
  }

  return {
    total,
    bySource,
    averageConfidence: total > 0 ? totalConfidence / total : 0,
    highConfidenceCount,
  };
}
