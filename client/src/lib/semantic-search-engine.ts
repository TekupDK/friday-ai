/**
 * Semantic Search Engine - Shortwave-Inspired
 *
 * Implements the EXACT search decision logic from Shortwave AI
 * with about vs filter strategy
 */

import type { EnhancedEmailMessage } from "@/types/enhanced-email";

export interface SearchStrategy {
  filter: string | null;
  about: string | null;
  limit: number;
  readMask: string[];
  reason: string;
}

export interface SearchAnalysis {
  hasGmailOperators: boolean;
  hasTopicWords: boolean;
  hasTimeConstraint: boolean;
  hasSpecificPerson: boolean;
  isVague: boolean;
  extractedTopic?: string;
  extractedPerson?: string;
  extractedTimeframe?: string;
}

export class SemanticSearchEngine {
  /**
   * Analyze user query to understand intent
   */
  private analyzeQuery(userQuery: string): SearchAnalysis {
    const query = userQuery.toLowerCase();

    return {
      hasGmailOperators:
        /from:|to:|subject:|label:|before:|after:|is:|has:/.test(query),
      hasTopicWords: /leads?|tilbud|faktura|rengøring|kunde|flytte|hoved/.test(
        query
      ),
      hasTimeConstraint:
        /i dag|i går|denne uge|sidste måned|nye|urgent|deadline/.test(query),
      hasSpecificPerson: this.detectPersonName(query),
      isVague:
        /find|vis|check|hvad|se|få/.test(query) && query.split(" ").length < 4,
      extractedTopic: this.extractTopic(query),
      extractedPerson: this.extractPersonName(query),
      extractedTimeframe: this.extractTimeframe(query),
    };
  }

  /**
   * Detect if query contains a person's name
   */
  private detectPersonName(query: string): boolean {
    // Danish first names (could expand this list)
    const firstNames =
      /\b(jens|mette|lars|anne|peter|maria|thomas|louise|henrik|camilla)\b/i;
    // Check for email-like patterns
    const emailPattern = /@|\.dk|\.com/;

    return firstNames.test(query) || emailPattern.test(query);
  }

  /**
   * Extract the main topic from query
   */
  private extractTopic(query: string): string {
    const topics: Record<string, string[]> = {
      "leads rengøring tilbud": ["lead", "leads", "ny kunde", "henvendelse"],
      "flytterengøring flytte": ["flytte", "flytterengøring", "fraflytning"],
      "hovedrengøring grundig": ["hoved", "hovedrengøring", "grundig"],
      "fast rengøring ugentlig": [
        "fast",
        "ugentlig",
        "månedlig",
        "regelmæssig",
      ],
      "faktura betaling": ["faktura", "betaling", "ubetalt", "regning"],
      "kalender booking møde": ["møde", "tid", "book", "kalender", "aftale"],
    };

    for (const [topicKey, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return topicKey;
      }
    }

    // Default: use the query itself
    return query.replace(/[^a-zæøå0-9\s]/g, "").trim();
  }

  /**
   * Extract person name if present
   */
  private extractPersonName(query: string): string | undefined {
    const match = query.match(
      /\b([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)?)\b/
    );
    return match ? match[1] : undefined;
  }

  /**
   * Extract timeframe constraints
   */
  private extractTimeframe(query: string): string | undefined {
    const timeframes: Record<string, string> = {
      "i dag": "newer:1d",
      "i går": "after:yesterday before:today",
      "denne uge": "newer:7d",
      "sidste uge": "after:last_week before:this_week",
      "denne måned": "newer:30d",
      "sidste måned": "after:last_month before:this_month",
      nye: "newer:3d",
      urgent: "newer:2d",
    };

    for (const [pattern, filter] of Object.entries(timeframes)) {
      if (query.includes(pattern)) {
        return filter;
      }
    }

    // Check for date patterns (e.g., "12/11" or "12. november")
    const dateMatch = query.match(/\b(\d{1,2})[\/\.\-](\d{1,2})\b/);
    if (dateMatch) {
      return `after:${dateMatch[0]}`;
    }

    return undefined;
  }

  /**
   * Main decision function - determines search strategy
   */
  public determineSearchStrategy(userQuery: string): SearchStrategy {
    const analysis = this.analyzeQuery(userQuery);

    // CASE 1: Specific Gmail query with operators
    if (analysis.hasGmailOperators && !analysis.hasTopicWords) {
      return {
        filter: userQuery,
        about: null,
        limit: 50,
        readMask: ["date", "participants", "subject", "bodySnippet"],
        reason: "Specific Gmail query - using filter only",
      };
    }

    // CASE 2: Topic-based semantic search without constraints
    if (
      analysis.hasTopicWords &&
      !analysis.hasGmailOperators &&
      !analysis.hasTimeConstraint
    ) {
      return {
        filter: null,
        about: analysis.extractedTopic || userQuery,
        limit: 50, // Not 150 for topic searches!
        readMask: ["date", "participants", "subject", "bodySnippet"],
        reason: "Topic-based semantic search - using about only",
      };
    }

    // CASE 3: Combined time constraint + topic
    if (analysis.hasTimeConstraint && analysis.hasTopicWords) {
      return {
        filter: analysis.extractedTimeframe || "newer:7d",
        about: analysis.extractedTopic || userQuery,
        limit: 30,
        readMask: ["date", "participants", "subject", "bodySnippet"],
        reason: "Combined time + topic search",
      };
    }

    // CASE 4: Person-specific search
    if (analysis.hasSpecificPerson && analysis.extractedPerson) {
      const personFilter = `from:"${analysis.extractedPerson}" OR to:"${analysis.extractedPerson}"`;
      return {
        filter: personFilter,
        about: analysis.hasTopicWords
          ? (analysis.extractedTopic ?? null)
          : null,
        limit: 20,
        readMask: ["date", "participants", "subject", "bodySnippet", "labels"],
        reason: `Person-specific search for ${analysis.extractedPerson}`,
      };
    }

    // CASE 5: Time constraint only
    if (analysis.hasTimeConstraint) {
      return {
        filter: `is:inbox ${analysis.extractedTimeframe || "newer:7d"}`,
        about: null,
        limit: 50,
        readMask: ["date", "participants", "subject", "bodySnippet"],
        reason: "Time-based filter search",
      };
    }

    // CASE 6: Vague query - broad semantic search
    if (analysis.isVague) {
      return {
        filter: "is:inbox",
        about: userQuery,
        limit: 30,
        readMask: ["date", "participants", "subject", "bodySnippet"],
        reason: "General semantic search for vague query",
      };
    }

    // DEFAULT: Semantic search with inbox filter
    return {
      filter: "is:inbox -is:trash",
      about: userQuery,
      limit: 50,
      readMask: ["date", "participants", "subject", "bodySnippet"],
      reason: "Default semantic search with inbox filter",
    };
  }

  /**
   * Build Gmail filter for common lead sources
   */
  public buildLeadSourceFilter(source: string): string {
    const sourceFilters: Record<string, string> = {
      rengoring_nu:
        'from:"rengoering.nu" OR from:"leadmail.no" OR subject:"Rengøring.nu"',
      leadpoint:
        'from:"leadpoint.dk" OR subject:"Rengøring Aarhus" OR subject:"Rengøring århus"',
      adhelp:
        'from:"adhelp.dk" OR from:"@mw.adhelp.dk" OR from:"@sp.adhelp.dk"',
      direct:
        '-from:"rengoering.nu" -from:"leadpoint" -from:"adhelp" label:leads',
    };

    return sourceFilters[source] || `from:"${source}"`;
  }

  /**
   * Real examples of search strategies
   */
  public getSearchExamples(): Array<{
    query: string;
    strategy: SearchStrategy;
  }> {
    return [
      {
        query: "Find leads fra Rengøring.nu",
        strategy: {
          filter: 'from:"rengoering.nu" OR subject:"Rengøring.nu"',
          about: "nye leads rengøring kunde",
          limit: 50,
          readMask: ["date", "participants", "subject", "bodySnippet"],
          reason: "Lead source specific search",
        },
      },
      {
        query: "Vis ubetalte fakturaer",
        strategy: {
          filter: "label:Finance -label:Paid",
          about: "faktura betaling udestående",
          limit: 30,
          readMask: [
            "date",
            "participants",
            "subject",
            "bodySnippet",
            "labels",
          ],
          reason: "Financial document search",
        },
      },
      {
        query: "Check urgent emails i dag",
        strategy: {
          filter: "is:inbox newer:1d",
          about: "urgent deadline ASAP hurtig vigtig",
          limit: 20,
          readMask: ["subject", "bodySnippet"], // Quick scan only
          reason: "Urgent time-sensitive search",
        },
      },
      {
        query: "Emails fra Mette Nielsen om flytterengøring",
        strategy: {
          filter: 'from:"Mette Nielsen" OR to:"Mette Nielsen"',
          about: "flytterengøring flytte fraflytning",
          limit: 10,
          readMask: ["date", "participants", "subject", "bodyFull"], // Need full content
          reason: "Person + topic specific search",
        },
      },
    ];
  }

  /**
   * Rank search results semantically (mock implementation)
   * In production, this would use embeddings and cosine similarity
   */
  public rankResults(
    results: EnhancedEmailMessage[],
    aboutQuery: string | null
  ): EnhancedEmailMessage[] {
    if (!aboutQuery) return results;

    // Simple keyword matching for now (should use embeddings)
    const queryKeywords = aboutQuery.toLowerCase().split(" ");

    return results
      .map(email => {
        const text = `${email.subject} ${email.snippet}`.toLowerCase();
        let relevanceScore = 0;

        // Count keyword matches
        queryKeywords.forEach(keyword => {
          if (text.includes(keyword)) relevanceScore += 1;
        });

        // Boost recent emails
        const ageInDays =
          (Date.now() - new Date(email.date).getTime()) / (1000 * 60 * 60 * 24);
        const recencyBoost = ageInDays < 7 ? 1.2 : ageInDays < 14 ? 1.1 : 1.0;

        // Boost important emails
        const importanceBoost = email.unread ? 1.3 : 1.0;

        return {
          ...email,
          semanticScore: relevanceScore * recencyBoost * importanceBoost,
        };
      })
      .sort((a: any, b: any) => b.semanticScore - a.semanticScore);
  }
}

// Export singleton instance
export const semanticSearchEngine = new SemanticSearchEngine();

/**
 * Example usage:
 *
 * const strategy = semanticSearchEngine.determineSearchStrategy('Find hot leads fra i dag');
 * console.log('Search strategy:', strategy);
 *
 * // Use the strategy with your email API
 * const results = await searchEmails({
 *   filter: strategy.filter,
 *   about: strategy.about,
 *   limit: strategy.limit
 * });
 *
 * // Rank results semantically
 * const ranked = semanticSearchEngine.rankResults(results, strategy.about);
 */
