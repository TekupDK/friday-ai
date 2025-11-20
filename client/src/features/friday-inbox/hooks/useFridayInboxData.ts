import { useCallback, useEffect, useMemo, useState } from "react";

import { UI_CONSTANTS } from "@/constants/business";
import { useEmailContext } from "@/contexts/EmailContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { trpc } from "@/lib/trpc";
import type { EnhancedEmailMessage } from "@/types/enhanced-email";

export interface FridayBatchIntelligence {
  [threadId: string]: {
    category?: {
      category: string;
      subcategory: string | null;
      confidence: number;
    };
    priority?: {
      level: string;
      score: number;
      reasoning: string | null;
    };
  };
}

export interface FridayInboxSegments {
  hot: EnhancedEmailMessage[];
  followUp: EnhancedEmailMessage[];
  finance: EnhancedEmailMessage[];
  done: EnhancedEmailMessage[];
}

export interface FridayInboxStats {
  total: number;
  unread: number;
  hot: number;
  followUp: number;
  finance: number;
  completionRate: number;
  totalValue: number;
}

export interface FridayInboxSuggestion {
  threadId: string;
  contactName: string;
  subject: string;
  priority: "urgent" | "high" | "medium" | "low";
  action: string;
  reason: string;
  estimatedValue?: number;
}

interface UseFridayInboxOptions {
  query?: string;
  maxResults?: number;
}

interface UseFridayInboxDataResult {
  emails: EnhancedEmailMessage[];
  segments: FridayInboxSegments;
  stats: FridayInboxStats;
  suggestions: FridayInboxSuggestion[];
  intelligence: FridayBatchIntelligence;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedThreadId: string | null;
  selectEmail: (threadId: string) => void;
  refetchAll: () => Promise<void>;
}

const FALLBACK_QUERY = "in:inbox";

export function useFridayInboxData(
  options: UseFridayInboxOptions = {}
): UseFridayInboxDataResult {
  const { query = FALLBACK_QUERY, maxResults = 35 } = options;
  const emailContext = useEmailContext();
  const rateLimit = useRateLimit();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const {
    data: emailData,
    isLoading,
    isFetching,
    refetch: refetchEmails,
  } = trpc.inbox.email.listPaged.useQuery(
    {
      maxResults: query.trim() && query !== FALLBACK_QUERY ? UI_CONSTANTS.MAX_PAGE_SIZE : maxResults,
      query,
      pageToken: undefined,
    },
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      staleTime: UI_CONSTANTS.STALE_TIME,
      gcTime: UI_CONSTANTS.GC_TIME,
      retry: (failureCount: number, error: unknown) => {
        if (rateLimit.isRateLimitError(error)) {
          return false;
        }
        return failureCount < 2;
      },
      enabled: !rateLimit.isRateLimited,
    }
  );

  const emails = useMemo<EnhancedEmailMessage[]>(() => {
    const rawEmails = (emailData as any)?.threads || [];
    return rawEmails.map((email: EnhancedEmailMessage): EnhancedEmailMessage => {
      const normalizedSubject = email.subject?.toLowerCase() ?? "";

      const jobType = normalizedSubject.includes("hovedrengøring")
        ? "Hovedrengøring"
        : normalizedSubject.includes("flytterengøring")
          ? "Flytterengøring"
          : "Anden";

      const location = normalizedSubject.includes("aarhus")
        ? "Aarhus"
        : normalizedSubject.includes("københavn")
          ? "København"
          : "Anden";

      return {
        ...email,
        aiAnalysis: {
          leadScore: email.aiAnalysis?.leadScore ?? 70,
          source: email.aiAnalysis?.source ?? null,
          estimatedValue: email.aiAnalysis?.estimatedValue ?? 2500,
          urgency: email.unread ? "high" : "medium",
          jobType,
          location,
          confidence: email.aiAnalysis?.confidence ?? 80,
        },
      };
    });
  }, [emailData]);

  const visibleThreadIds = useMemo(
    () => emails.map(email => email.threadId).slice(0, 50),
    [emails]
  );

  const {
    data: batchIntelligence = {},
    isFetching: isFetchingIntelligence,
    refetch: refetchIntelligence,
  } = trpc.emailIntelligence.getBatchIntelligence.useQuery(
    { threadIds: visibleThreadIds },
    {
      enabled: visibleThreadIds.length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  );

  const getContactName = useCallback((from: string) => {
    const match = from?.match(/(.+?)\s*<(.+?)>/);
    if (match?.[1]) {
      return match[1].replace(/"/g, "").trim();
    }
    return from?.split("@")[0] || "Ukendt kontakt";
  }, []);

  const segments = useMemo<FridayInboxSegments>(() => {
    const buckets: FridayInboxSegments = {
      hot: [],
      followUp: [],
      finance: [],
      done: [],
    };

    emails.forEach(email => {
      const intel = batchIntelligence[email.threadId];
      const normalizedLabels = email.labels?.map(label => label.toLowerCase()) ?? [];
      const hasSentOffer = normalizedLabels.some(label => label.includes("sent-offer"));
      const replied = normalizedLabels.some(
        label => label.includes("replied") || label.includes("done")
      );
      const isFinance =
        intel?.category?.category === "finance" ||
        normalizedLabels.some(label => label.includes("invoice") || label.includes("finance"));
      const isCompleted = normalizedLabels.some(
        label =>
          label.includes("archived") ||
          label.includes("done") ||
          label.includes("completed")
      );

      const priorityScore =
        intel?.priority?.score ?? (email.unread ? 80 : email.aiAnalysis?.leadScore ?? 60);

      if (isCompleted) {
        buckets.done.push(email);
        return;
      }

      if (isFinance) {
        buckets.finance.push(email);
      }

      if (hasSentOffer && !replied) {
        buckets.followUp.push(email);
      }

      if (
        (intel?.priority?.level === "urgent" ||
          intel?.priority?.level === "high" ||
          priorityScore >= 75) &&
        email.unread
      ) {
        buckets.hot.push(email);
      }
    });

    return buckets;
  }, [emails, batchIntelligence]);

  const stats = useMemo<FridayInboxStats>(() => {
    const total = emails.length;
    const unread = emails.filter(email => email.unread).length;
    const completionRate =
      total === 0 ? 0 : Math.round((segments.done.length / total) * 100);
    const totalValue = emails.reduce((sum, email) => {
      return sum + (email.aiAnalysis?.estimatedValue ?? 0);
    }, 0);

    return {
      total,
      unread,
      hot: segments.hot.length,
      followUp: segments.followUp.length,
      finance: segments.finance.length,
      completionRate,
      totalValue,
    };
  }, [emails, segments]);

  const suggestions = useMemo<FridayInboxSuggestion[]>(() => {
    const deriveAction = (
      email: EnhancedEmailMessage,
      intel: FridayBatchIntelligence[string] | undefined
    ) => {
      if (intel?.category?.category === "finance") {
        return "Send faktura-opfølgning";
      }
      if (email.labels?.includes("sent-offer")) {
        return "Følg op på tilbud";
      }
      if (intel?.priority?.level === "urgent") {
        return "Svar hurtigst muligt";
      }
      if (email.labels?.includes("waiting")) {
        return "Gentag påmindelse";
      }
      return "Triager email";
    };

    const deriveReason = (
      email: EnhancedEmailMessage,
      intel: FridayBatchIntelligence[string] | undefined
    ) => {
      if (intel?.priority?.reasoning) {
        return intel.priority.reasoning;
      }
      if (email.aiAnalysis?.leadScore && email.aiAnalysis.leadScore >= 80) {
        return "AI vurderer høj leadscore baseret på indhold";
      }
      if (email.unread) {
        return "Ulæst i indbakken";
      }
      return "Standard opgave";
    };

    return emails.slice(0, 10).map(email => {
      const intel = batchIntelligence[email.threadId];
      const priorityLevel = intel?.priority?.level as
        | FridayInboxSuggestion["priority"]
        | undefined;
      const allowedPriorities: FridayInboxSuggestion["priority"][] = [
        "urgent",
        "high",
        "medium",
        "low",
      ];
      const candidatePriority =
        priorityLevel && allowedPriorities.includes(priorityLevel)
          ? priorityLevel
          : email.unread
            ? "high"
            : "medium";

      return {
        threadId: email.threadId,
        contactName: getContactName(email.from),
        subject: email.subject,
        priority: candidatePriority,
        action: deriveAction(email, intel),
        reason: deriveReason(email, intel),
        estimatedValue: email.aiAnalysis?.estimatedValue,
      };
    });
  }, [emails, batchIntelligence, getContactName]);

  const selectEmail = useCallback(
    (threadId: string) => {
      const email = emails.find(item => item.threadId === threadId);
      if (!email) {
        return;
      }

      setSelectedThreadId(threadId);
      emailContext.setSelectedEmail({
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        labels: email.labels || [],
        threadLength: 1,
      });
    },
    [emails, emailContext]
  );

  useEffect(() => {
    if (!selectedThreadId && emails.length > 0) {
      selectEmail(emails[0].threadId);
    }
  }, [emails, selectedThreadId, selectEmail]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchEmails(), refetchIntelligence()]);
  }, [refetchEmails, refetchIntelligence]);

  return {
    emails,
    segments,
    stats,
    suggestions,
    intelligence: batchIntelligence,
    isLoading,
    isRefreshing: isFetching || isFetchingIntelligence,
    selectedThreadId,
    selectEmail,
    refetchAll,
  };
}
