/**
 * Team 2 FB Rengøring Rapport
 *
 * Analyserer de sidste 14 dages opgaver for Team 2 medarbejdere på "fb rengøring" opgaver.
 * Sammenligner:
 * - Kalendertid (fra kalenderopgaver)
 * - Aftalt tid (fra Gmail tråde)
 * - Faktureret tid (fra fakturaer)
 * - Faktisk arbejdstid (fra Gmail tråde)
 *
 * Pricing:
 * - Løn: 90 DKK/time pr. person (fakturerbar tid)
 * - Faktureret: 349 DKK/time (fakturerbar tid)
 */

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import {
  calendarEvents,
  customerInvoices,
  customerProfiles,
  emails,
} from "../../drizzle/schema";
import { getDb } from "../db";

interface TaskAnalysis {
  calendarEventId: number;
  title: string;
  customerEmail: string | null;
  date: string;

  // Tidsdata
  calendarTime: number; // Timer fra kalender (startTime til endTime)
  calendarTimeMinutes: number;
  agreedTime: number; // Timer aftalt i Gmail
  invoicedTime: number; // Timer faktureret
  actualWorkTime: number; // Timer faktisk arbejdet (fra Gmail)

  // Team info
  teamInfo: string | null;
  numberOfPeople: number;

  // Beregninger
  calendarCost: number; // Kalendertid × antal personer × 90 DKK
  agreedCost: number; // Aftalt tid × antal personer × 90 DKK
  invoicedCost: number; // Faktureret tid × antal personer × 90 DKK (løn)
  actualCost: number; // Faktisk tid × antal personer × 90 DKK
  invoicedRevenue: number; // Faktureret tid × 349 DKK/time (indtjening)
  profit: number; // Indtjening - Løn (invoicedRevenue - invoicedCost)

  // Metadata
  invoiceId: number | null;
  emailThreadId: string | null;
  notes: string[];
  
  // Klager og henvendelser
  complaints: Array<{
    date: string;
    type: "klage" | "henvendelse" | "problem" | "forsinkelse" | "kvalitet" | "pris";
    description: string;
    resolved: boolean;
    resolution?: string;
    compensation?: string;
  }>;
  hasComplaints: boolean;
}

/**
 * Parse team info from calendar event
 */
function parseTeamInfo(event: any): string | null {
  const desc = (event?.description || "").toLowerCase();
  const summary = (event?.title || "").toLowerCase();
  const combined = `${summary} ${desc}`;

  // Try to parse "Team X" or team member names - expanded patterns
  const teamPatterns = [
    /team\s*[:#]?\s*(\d+)/i,
    /team\s*(\d+)/i,
    /t\.?\s*(\d+)/i, // "T.2" or "T2"
    /team\s*to/i, // "Team to" (Danish "to" = two)
    /team\s*2/i,
  ];

  for (const pattern of teamPatterns) {
    const match = desc.match(pattern) || summary.match(pattern) || combined.match(pattern);
    if (match) {
      const teamNum = match[1] || "2"; // Default to 2 if "Team to" matched
      return teamNum;
    }
  }

  // Check for Team 2 member names (common names for Team 2)
  const team2Names = ["souha", "mandi", "souhaila"];
  const hasTeam2Name = team2Names.some(name => combined.includes(name));
  if (hasTeam2Name) {
    return "2";
  }

  return null;
}

/**
 * Extract number of people from calendar event
 */
function extractNumberOfPeople(event: any): number {
  const desc = event?.description || "";
  const summary = event?.title || "";
  const attendees = event?.attendees || null;

  // Try to parse from attendees JSON
  if (attendees) {
    try {
      const attendeesData =
        typeof attendees === "string" ? JSON.parse(attendees) : attendees;
      if (Array.isArray(attendeesData) && attendeesData.length > 0) {
        return attendeesData.length;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Try to parse from description/summary
  const peopleMatch =
    desc.match(/(\d+)\s*(?:personer|pers|people)/i) ||
    summary.match(/(\d+)\s*(?:personer|pers|people)/i);
  if (peopleMatch) {
    return parseInt(peopleMatch[1]);
  }

  // Try to parse team members from parentheses (e.g., "Team 2 (Souha + Mandi)")
  const membersMatch = summary.match(/\(([^)]+)\)/);
  if (membersMatch) {
    const members = membersMatch[1];
    const memberCount = members.split(/[+&]/).length;
    if (memberCount > 0) return memberCount;
  }

  // Default: assume 2 people for Team 2
  return 2;
}

/**
 * Extract time from text (hours)
 */
function extractTimeFromText(text: string): number {
  if (!text) return 0;

  // Match "X timer" or "X timer" or "X arbejdstimer"
  const hoursMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:timer|arbejdstimer|hours?)/i
  );
  if (hoursMatch) {
    return parseFloat(hoursMatch[1].replace(",", "."));
  }

  // Match "X personer × Y timer"
  const personHoursMatch = text.match(
    /(\d+)\s*personer?\s*[×x*]\s*(\d+(?:[.,]\d+)?)\s*timer/i
  );
  if (personHoursMatch) {
    const persons = parseInt(personHoursMatch[1]);
    const hours = parseFloat(personHoursMatch[2].replace(",", "."));
    return persons * hours;
  }

  return 0;
}

/**
 * Calculate duration in hours from start and end time
 */
function calculateDurationHours(
  startTime: string | null,
  endTime: string | null
): number {
  if (!startTime || !endTime) return 0;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  } catch (e) {
    return 0;
  }
}

/**
 * Extract customer email from calendar event
 */
function extractCustomerEmail(event: any): string | null {
  const desc = event?.description || "";

  // Try to parse email from description
  const emailMatch = desc.match(
    /(?:mailto:|href="|>|Kontakt:)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  );
  if (emailMatch) return emailMatch[1];

  return null;
}

/**
 * Detect complaints and issues from email text
 */
function detectComplaints(emailText: string): Array<{
  type: "klage" | "henvendelse" | "problem" | "forsinkelse" | "kvalitet" | "pris";
  description: string;
}> {
  const text = emailText.toLowerCase();
  const complaints: Array<{
    type: "klage" | "henvendelse" | "problem" | "forsinkelse" | "kvalitet" | "pris";
    description: string;
  }> = [];

  // Klage keywords
  const complaintPatterns = [
    { type: "klage" as const, keywords: ["klage", "utilfreds", "dårlig", "ikke godt nok", "ikke tilfreds"] },
    { type: "forsinkelse" as const, keywords: ["forsinket", "forsinkelse", "kom for sent", "anmod senere"] },
    { type: "kvalitet" as const, keywords: ["ikke ren", "dårlig rengøring", "mangler", "ikke gjort", "glemt"] },
    { type: "pris" as const, keywords: ["for dyrt", "pris", "faktura", "billigere", "rabat", "kompensation"] },
    { type: "problem" as const, keywords: ["problem", "fejl", "gik galt", "ikke som aftalt"] },
  ];

  for (const pattern of complaintPatterns) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      // Extract relevant sentence
      const sentences = emailText.split(/[.!?]\s+/);
      const relevantSentence = sentences.find(s => 
        pattern.keywords.some(k => s.toLowerCase().includes(k))
      );
      
      if (relevantSentence) {
        complaints.push({
          type: pattern.type,
          description: relevantSentence.trim().substring(0, 200),
        });
      }
    }
  }

  return complaints;
}

/**
 * Extract customer name from calendar event title or description
 */
function extractCustomerName(event: any): string | null {
  const title = event?.title || "";
  const desc = event?.description || "";
  
  // Try to extract name from title (usually first part before comma or dash)
  const nameMatch = title.match(/^([^,–-]+)/);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  
  return null;
}

/**
 * Check if event is "fb rengøring" or "fast rengøring"
 */
function isFbRengoring(event: any): boolean {
  const title = (event?.title || "").toLowerCase();
  const desc = (event?.description || "").toLowerCase();
  const combined = `${title} ${desc}`;

  // Normalize text - remove accents and special characters for better matching
  const normalized = combined
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s]/g, " "); // Replace special chars with space

  // Expanded patterns for FB/Fast rengøring
  const patterns = [
    "fb rengoring",
    "fb rengøring",
    "fast rengoring",
    "fast rengøring",
    "fast rengoring",
    "fast rengøring",
    "fbrengoring",
    "fbrengøring",
    "fastrengoring",
    "fastrengøring",
    "fb ren",
    "fast ren",
  ];

  // Check if any pattern matches
  for (const pattern of patterns) {
    if (normalized.includes(pattern) || combined.includes(pattern)) {
      return true;
    }
  }

  // Also check title separately (more weight to title)
  const normalizedTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");
  
  for (const pattern of patterns) {
    if (normalizedTitle.includes(pattern) || title.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Main analysis function
 */
export async function analyzeTeam2FbRengoring(
  userId: number,
  daysBack: number | string = 14,
  endDateOverride?: string
): Promise<{
  summary: {
    totalTasks: number;
    totalCalendarHours: number;
    totalAgreedHours: number;
    totalInvoicedHours: number;
    totalActualHours: number;
    totalCalendarCost: number;
    totalAgreedCost: number;
    totalInvoicedCost: number;
    totalActualCost: number;
  };
  tasks: TaskAnalysis[];
  report: string;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Calculate date range
  let startDate: Date;
  let endDate: Date;

  if (endDateOverride) {
    // Specific date range provided: daysBack is start date, endDateOverride is end date
    if (typeof daysBack === "string" && daysBack.match(/^\d{4}-\d{2}-\d{2}$/)) {
      startDate = new Date(daysBack);
      endDate = new Date(endDateOverride);
    } else {
      // daysBack is number of days, endDateOverride is start date
      startDate = new Date(endDateOverride);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (daysBack as number) - 1); // -1 to include start date
    }
  } else if (
    typeof daysBack === "string" &&
    daysBack.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    // Start date provided as string (no end date override)
    startDate = new Date(daysBack);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14); // Default 14 days from start
  } else {
    // Last N days from today
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysBack as number));
  }

  // Set time to start/end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  console.log(
    `[Team2 Report] Analyzing from ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  // Get calendar events from the date range
  // Note: We check status but also include events without status filter to catch all
  const calendarEventsList = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.startTime, startDate.toISOString()),
        lte(calendarEvents.startTime, endDate.toISOString())
        // Removed status filter to catch all events, we'll filter later if needed
      )
    )
    .orderBy(desc(calendarEvents.startTime));

  // Also try without status filter to see if that's the issue
  const allEventsCount = calendarEventsList.length;
  const confirmedEventsCount = calendarEventsList.filter(
    e => e.status === "confirmed"
  ).length;

  console.log(
    `[Team2 Report] Total events in range: ${allEventsCount} (confirmed: ${confirmedEventsCount})`
  );

  console.log(
    `[Team2 Report] Found ${calendarEventsList.length} calendar events`
  );

  // Debug: Log sample events for analysis
  if (calendarEventsList.length > 0) {
    console.log(
      `[Team2 Report] Sample events (first 5):`,
      calendarEventsList.slice(0, 5).map(e => ({
        id: e.id,
        title: e.title,
        startTime: e.startTime,
        status: e.status,
      }))
    );
  }

  // Filter for Team 2 and fb rengøring with detailed logging
  const team2Events = calendarEventsList.filter(event => {
    const teamInfo = parseTeamInfo(event);
    const isTeam2 = teamInfo === "2" || teamInfo === "Team 2";
    const isFb = isFbRengoring(event);
    
    // Debug logging for events that don't match
    if (!isTeam2 || !isFb) {
      console.log(
        `[Team2 Report] Event filtered out:`,
        {
          id: event.id,
          title: event.title,
          teamInfo,
          isTeam2,
          isFb,
          reason: !isTeam2 ? "Not Team 2" : "Not FB rengøring",
        }
      );
    }
    
    return isTeam2 && isFb;
  });

  console.log(
    `[Team2 Report] Found ${team2Events.length} Team 2 fb rengøring events`
  );

  // Debug: Log details of matched events
  if (team2Events.length > 0) {
    console.log(
      `[Team2 Report] Matched events:`,
      team2Events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.startTime,
        teamInfo: parseTeamInfo(e),
      }))
    );
  } else {
    console.warn(
      `[Team2 Report] WARNING: No Team 2 FB rengøring events found!`
    );
    console.warn(
      `[Team2 Report] This could indicate:`
    );
    console.warn(
      `  - No events match Team 2 criteria (check parseTeamInfo logic)`
    );
    console.warn(
      `  - No events match FB rengøring criteria (check isFbRengoring logic)`
    );
    console.warn(
      `  - Events exist but don't match both criteria`
    );
    console.warn(
      `  - Date range might be incorrect`
    );
  }

  const tasks: TaskAnalysis[] = [];

  // Analyze each event
  for (const event of team2Events) {
    const customerEmail = extractCustomerEmail(event);
    const teamInfo = parseTeamInfo(event);
    const numberOfPeople = extractNumberOfPeople(event);

    // Calculate calendar time
    const calendarTime = calculateDurationHours(event.startTime, event.endTime);
    const calendarTimeMinutes = calendarTime * 60;

    // Initialize task analysis
    const task: TaskAnalysis = {
      calendarEventId: event.id,
      title: event.title || "Ukendt",
      customerEmail,
      date: event.startTime
        ? new Date(event.startTime).toISOString().split("T")[0]
        : "",
      calendarTime,
      calendarTimeMinutes,
      agreedTime: 0,
      invoicedTime: 0,
      actualWorkTime: 0,
      teamInfo,
      numberOfPeople,
      calendarCost: calendarTime * numberOfPeople * 90,
      agreedCost: 0,
      invoicedCost: 0,
      actualCost: 0,
      invoicedRevenue: 0, // Indtjening fra faktura
      profit: 0, // Profit = indtjening - løn
      invoiceId: null,
      emailThreadId: null,
      notes: [],
      complaints: [],
      hasComplaints: false,
    };

    // Try to find related email thread
    if (customerEmail) {
      try {
        const relatedEmails = await db
          .select()
          .from(emails)
          .where(
            and(
              eq(emails.userId, userId),
              eq(emails.fromEmail, customerEmail),
              gte(emails.receivedAt, startDate.toISOString()),
              lte(emails.receivedAt, endDate.toISOString())
            )
          )
          .orderBy(desc(emails.receivedAt))
          .limit(5);

        // Extract agreed time, actual work time, and complaints from emails
        for (const email of relatedEmails) {
          const emailText = `${email.subject || ""} ${email.text || ""} ${email.body || ""}`;
          const emailDate = email.receivedAt 
            ? new Date(email.receivedAt).toISOString().split("T")[0]
            : task.date;

          // Look for agreed time (in quotes, confirmations, etc.)
          const agreedTime = extractTimeFromText(emailText);
          if (agreedTime > 0 && task.agreedTime === 0) {
            task.agreedTime = agreedTime;
            task.emailThreadId = email.threadId || null;
          }

          // Look for actual work time (often mentioned as "arbejdstimer" or "vi brugte X timer")
          const actualTimeMatch = emailText.match(
            /(?:vi\s+brugte|arbejdede|faktisk|brugt)\s*(\d+(?:[.,]\d+)?)\s*(?:timer|arbejdstimer)/i
          );
          if (actualTimeMatch) {
            const actualTime = parseFloat(actualTimeMatch[1].replace(",", "."));
            if (actualTime > 0) {
              task.actualWorkTime = actualTime;
            }
          }

          // Detect complaints and issues
          const detectedComplaints = detectComplaints(emailText);
          for (const complaint of detectedComplaints) {
            // Check if we already have this complaint type
            const existing = task.complaints.find(c => 
              c.type === complaint.type && 
              c.description.substring(0, 50) === complaint.description.substring(0, 50)
            );
            
            if (!existing) {
              task.complaints.push({
                date: emailDate,
                type: complaint.type,
                description: complaint.description,
                resolved: false, // Will be updated if we find resolution
              });
              task.hasComplaints = true;
            }
          }

          // Check for resolution indicators
          const resolutionKeywords = [
            "løst", "afklaret", "kompenseret", "rabat", "tilfreds", 
            "accepteret", "godkendt", "betalt", "tak"
          ];
          const hasResolution = resolutionKeywords.some(keyword => 
            emailText.toLowerCase().includes(keyword)
          );
          
          if (hasResolution && task.complaints.length > 0) {
            // Mark most recent complaint as resolved
            const latestComplaint = task.complaints[task.complaints.length - 1];
            if (!latestComplaint.resolved) {
              latestComplaint.resolved = true;
              // Try to extract resolution details
              const resolutionMatch = emailText.match(
                /(?:rabat|kompensation|reduktion|tilbagebetalt)[:\s]+([^\n.]+)/i
              );
              if (resolutionMatch) {
                latestComplaint.resolution = resolutionMatch[1].trim();
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          `[Team2 Report] Error fetching emails for ${customerEmail}:`,
          error
        );
        task.notes.push(
          `Kunne ikke hente emails: ${error instanceof Error ? error.message : "Ukendt fejl"}`
        );
      }

      // Update costs based on agreed and actual time
      if (task.agreedTime > 0) {
        task.agreedCost = task.agreedTime * numberOfPeople * 90;
      }
      if (task.actualWorkTime > 0) {
        task.actualCost = task.actualWorkTime * numberOfPeople * 90;
      }
    }

    // Check calendar event description for complaints/issues
    const eventDesc = event?.description || "";
    const eventTitle = event?.title || "";
    const combinedEventText = `${eventTitle} ${eventDesc}`.toLowerCase();
    
    // Check for complaint indicators in calendar notes
    if (combinedEventText.includes("klage") || 
        combinedEventText.includes("problem") ||
        combinedEventText.includes("forsinket") ||
        combinedEventText.includes("overfladisk")) {
      const complaintType = combinedEventText.includes("klage") ? "klage" as const :
                            combinedEventText.includes("forsinket") ? "forsinkelse" as const :
                            combinedEventText.includes("overfladisk") ? "kvalitet" as const :
                            "problem" as const;
      
      task.complaints.push({
        date: task.date,
        type: complaintType,
        description: eventDesc.substring(0, 200) || eventTitle,
        resolved: false,
      });
      task.hasComplaints = true;
    }

    // Try to find related invoice
    if (customerEmail) {
      try {
        // First, try to find customer profile by email
        const customerProfile = await db
          .select()
          .from(customerProfiles)
          .where(
            and(
              eq(customerProfiles.userId, userId),
              eq(customerProfiles.email, customerEmail)
            )
          )
          .limit(1);

        if (customerProfile.length > 0) {
          const customerId = customerProfile[0].id;

          // Find invoices for this customer in the date range
          // Use entryDate if available, otherwise createdAt
          // Use SQL COALESCE to handle nullable entryDate
          const invoices = await db
            .select()
            .from(customerInvoices)
            .where(
              and(
                eq(customerInvoices.userId, userId),
                eq(customerInvoices.customerId, customerId),
                // Use COALESCE to fallback to createdAt if entryDate is null
                gte(
                  sql`COALESCE(${customerInvoices.entryDate}, ${customerInvoices.createdAt})`,
                  startDate.toISOString()
                ),
                lte(
                  sql`COALESCE(${customerInvoices.entryDate}, ${customerInvoices.createdAt})`,
                  endDate.toISOString()
                )
              )
            )
            .orderBy(
              desc(
                sql`COALESCE(${customerInvoices.entryDate}, ${customerInvoices.createdAt})`
              )
            );

          // Extract invoiced time from invoice description or amount
          // Pricing constants
          const HOURLY_RATE = 349; // DKK per hour (faktureret)
          const LABOR_COST = 90; // DKK per hour (løn)
          
          for (const invoice of invoices) {
            // Try to extract hours from invoice amount
            // Or from description
            const invoiceAmount = Number(invoice.amount || 0);
            const estimatedHours = invoiceAmount / HOURLY_RATE;

            // Also try to extract from description
            const description = `${invoice.invoiceNumber || ""}`;
            const hoursFromDesc = extractTimeFromText(description);

            if (hoursFromDesc > 0) {
              task.invoicedTime = hoursFromDesc;
            } else if (estimatedHours > 0 && estimatedHours < 20) {
              // Sanity check
              task.invoicedTime = estimatedHours;
            }

            if (task.invoicedTime > 0) {
              task.invoiceId = invoice.id;
              // Løn: fakturerbar tid × 90 DKK/time
              task.invoicedCost = task.invoicedTime * LABOR_COST;
              // Indtjening: fakturerbar tid × 349 DKK/time
              task.invoicedRevenue = task.invoicedTime * HOURLY_RATE;
              // Profit: indtjening - løn
              task.profit = task.invoicedRevenue - task.invoicedCost;
              break;
            }
          }
        }
      } catch (error) {
        console.warn(
          `[Team2 Report] Error fetching invoices for ${customerEmail}:`,
          error
        );
        task.notes.push(
          `Kunne ikke hente fakturaer: ${error instanceof Error ? error.message : "Ukendt fejl"}`
        );
      }
    }

    tasks.push(task);
  }

  // Calculate summary
  const summary = {
    totalTasks: tasks.length,
    totalCalendarHours: tasks.reduce((sum, t) => sum + t.calendarTime, 0),
    totalAgreedHours: tasks.reduce((sum, t) => sum + t.agreedTime, 0),
    totalInvoicedHours: tasks.reduce((sum, t) => sum + t.invoicedTime, 0),
    totalActualHours: tasks.reduce((sum, t) => sum + t.actualWorkTime, 0),
    totalCalendarCost: tasks.reduce((sum, t) => sum + t.calendarCost, 0),
    totalAgreedCost: tasks.reduce((sum, t) => sum + t.agreedCost, 0),
    totalInvoicedCost: tasks.reduce((sum, t) => sum + t.invoicedCost, 0),
    totalActualCost: tasks.reduce((sum, t) => sum + t.actualCost, 0),
    totalInvoicedRevenue: tasks.reduce((sum, t) => sum + t.invoicedRevenue, 0),
    totalProfit: tasks.reduce((sum, t) => sum + t.profit, 0),
  };

  // Generate report
  const report = generateReport(summary, tasks, startDate, endDate);

  return {
    summary,
    tasks,
    report,
  };
}

/**
 * Generate markdown report
 */
function generateReport(
  summary: any,
  tasks: TaskAnalysis[],
  startDate: Date,
  endDate: Date
): string {
  const lines: string[] = [];

  lines.push("# Team 2 FB Rengøring Rapport");
  lines.push("");
  lines.push(
    `**Periode:** ${startDate.toLocaleDateString("da-DK")} - ${endDate.toLocaleDateString("da-DK")}`
  );
  lines.push(`**Antal opgaver:** ${summary.totalTasks}`);
  lines.push(`**Lønpris:** 90 DKK/time pr. person`);
  lines.push("");

  lines.push("## Oversigt");
  lines.push("");
  lines.push("| Metrik | Timer | Omkostning (DKK) |");
  lines.push("|--------|-------|------------------|");
  lines.push(
    `| Kalendertid | ${summary.totalCalendarHours.toFixed(2)} | ${summary.totalCalendarCost.toFixed(2)} |`
  );
  lines.push(
    `| Aftalt tid | ${summary.totalAgreedHours.toFixed(2)} | ${summary.totalAgreedCost > 0 ? summary.totalAgreedCost.toFixed(2) : "Ikke fundet"} |`
  );
  lines.push(
    `| Faktureret tid | ${summary.totalInvoicedHours.toFixed(2)} | ${summary.totalInvoicedCost > 0 ? summary.totalInvoicedCost.toFixed(2) : "Ikke fundet"} |`
  );
  lines.push(
    `| Faktisk arbejdstid | ${summary.totalActualHours.toFixed(2)} | ${summary.totalActualCost > 0 ? summary.totalActualCost.toFixed(2) : "Ikke fundet"} |`
  );
  lines.push("");
  
  // Indtjening og profit
  if (summary.totalInvoicedRevenue > 0) {
    lines.push("## Økonomi");
    lines.push("");
    lines.push("| Metrik | Beløb (DKK) |");
    lines.push("|--------|-------------|");
    lines.push(
      `| Indtjening (349 DKK/time) | ${summary.totalInvoicedRevenue.toFixed(2)} |`
    );
    lines.push(
      `| Løn (90 DKK/time) | ${summary.totalInvoicedCost.toFixed(2)} |`
    );
    lines.push(
      `| **Profit** | **${summary.totalProfit > 0 ? "+" : ""}${summary.totalProfit.toFixed(2)}** |`
    );
    lines.push("");
    if (summary.totalInvoicedRevenue > 0) {
      const margin = (summary.totalProfit / summary.totalInvoicedRevenue) * 100;
      lines.push(
        `**Profit margin:** ${margin.toFixed(1)}%`
      );
    }
    lines.push("");
  }

  // Beregn gennemsnit per opgave
  if (summary.totalTasks > 0) {
    lines.push("### Gennemsnit per opgave");
    lines.push("");
    lines.push(
      `- Gennemsnitlig kalendertid: ${(summary.totalCalendarHours / summary.totalTasks).toFixed(2)} timer`
    );
    if (summary.totalAgreedHours > 0) {
      lines.push(
        `- Gennemsnitlig aftalt tid: ${(summary.totalAgreedHours / summary.totalTasks).toFixed(2)} timer`
      );
    }
    if (summary.totalInvoicedHours > 0) {
      lines.push(
        `- Gennemsnitlig faktureret tid: ${(summary.totalInvoicedHours / summary.totalTasks).toFixed(2)} timer`
      );
    }
    if (summary.totalActualHours > 0) {
      lines.push(
        `- Gennemsnitlig faktisk tid: ${(summary.totalActualHours / summary.totalTasks).toFixed(2)} timer`
      );
    }
    lines.push("");
  }

  lines.push("## Detaljeret opgaveliste");
  lines.push("");

  if (tasks.length === 0) {
    lines.push("Ingen opgaver fundet i perioden.");
  } else {
    // Kompakt oversigtstabel
    lines.push("### Oversigtstabel");
    lines.push("");
    lines.push(
      "| Dato | Kunde | Opgavetitel | Tid samlet | Tid pr. person | Personer | Løn pr. person | Løn samlet | Indtjening | Profit | Noter |"
    );
    lines.push(
      "|------|-------|-------------|------------|----------------|----------|----------------|------------|------------|--------|-------|"
    );

    for (const task of tasks) {
      const customer = task.customerEmail?.split("@")[0] || "Ukendt";
      const title =
        task.title.length > 30
          ? task.title.substring(0, 30) + "..."
          : task.title;
      
      // Calculate time: 
      // - timePerPerson = fysisk tid på stedet (kalendertid)
      // - totalTime = fakturerbar tid (timer × antal personer)
      const timePerPerson = task.calendarTime > 0 
        ? task.calendarTime 
        : (task.agreedTime > 0 ? task.agreedTime : task.actualWorkTime);
      const totalTime = timePerPerson * task.numberOfPeople; // Fakturerbar tid
      
      // Calculate cost per person and total
      const costPerPerson = timePerPerson * 90; // Løn pr. person baseret på fysisk tid
      const totalCost = totalTime * 90; // Løn samlet baseret på fakturerbar tid
      
      // Build notes column with complaints
      const notesParts: string[] = [];
      if (task.hasComplaints) {
        const complaintTypes = task.complaints.map(c => {
          const typeLabels: Record<string, string> = {
            klage: "Klage",
            henvendelse: "Henvendelse",
            problem: "Problem",
            forsinkelse: "Forsinkelse",
            kvalitet: "Kvalitet",
            pris: "Pris",
          };
          return typeLabels[c.type] || c.type;
        });
        notesParts.push(`⚠️ ${complaintTypes.join(", ")}`);
      }
      if (task.notes.length > 0) {
        notesParts.push(...task.notes);
      }
      const notesColumn = notesParts.length > 0 ? notesParts.join("; ") : "-";

      // Format time display: 
      // - totalTime = fakturerbar tid (timer × personer)
      // - timePerPerson = fysisk tid på stedet
      const timeDisplay = totalTime > 0 
        ? `${totalTime.toFixed(2)}t` // Fakturerbar tid
        : "-";
      const timePerPersonDisplay = timePerPerson > 0
        ? `${timePerPerson.toFixed(2)}t` // Fysisk tid på stedet
        : "-";
      
      // Format cost display
      const costPerPersonDisplay = costPerPerson > 0
        ? `${costPerPerson.toFixed(2)} kr`
        : "-";
      const totalCostDisplay = totalCost > 0
        ? `${totalCost.toFixed(2)} kr`
        : "-";
      
      // Pricing constants
      const HOURLY_RATE = 349; // DKK per hour (faktureret)
      
      // Calculate revenue and profit
      const revenue = task.invoicedTime > 0 ? task.invoicedTime * HOURLY_RATE : 0;
      const profit = task.profit || (revenue - totalCost);
      const revenueDisplay = revenue > 0
        ? `${revenue.toFixed(2)} kr`
        : "-";
      const profitDisplay = profit !== 0
        ? `${profit > 0 ? "+" : ""}${profit.toFixed(2)} kr`
        : "-";

      lines.push(
        `| ${task.date} | ${customer} | ${title} | ${timeDisplay} | ${timePerPersonDisplay} | ${task.numberOfPeople} | ${costPerPersonDisplay} | ${totalCostDisplay} | ${revenueDisplay} | ${profitDisplay} | ${notesColumn} |`
      );
    }

    lines.push("");
    lines.push("### Detaljerede opgaver");
    lines.push("");

    // Detaljeret beskrivelse af hver opgave
    for (const task of tasks) {
      lines.push(`#### ${task.title}`);
      lines.push("");
      lines.push(`- **Dato:** ${task.date}`);
      lines.push(`- **Kunde:** ${task.customerEmail || "Ukendt"}`);
      lines.push(`- **Team:** ${task.teamInfo || "Ikke angivet"}`);
      lines.push(`- **Antal personer:** ${task.numberOfPeople}`);
      lines.push("");
      lines.push("**Tidsdata:**");
      
      // Show time breakdown:
      // - timePerPerson = fysisk tid på stedet (kalendertid)
      // - totalTime = fakturerbar tid (timer × antal personer)
      if (task.calendarTime > 0) {
        const totalTime = task.calendarTime * task.numberOfPeople; // Fakturerbar tid
        lines.push(
          `- Kalendertid: ${task.calendarTime.toFixed(2)} timer pr. person (fysisk på stedet), ${totalTime.toFixed(2)} timer samlet (fakturerbart) (${task.calendarTimeMinutes.toFixed(0)} minutter)`
        );
      }
      if (task.agreedTime > 0) {
        const totalTime = task.agreedTime * task.numberOfPeople; // Fakturerbar tid
        lines.push(`- Aftalt tid: ${task.agreedTime.toFixed(2)} timer pr. person, ${totalTime.toFixed(2)} timer samlet (fakturerbart)`);
      } else {
        lines.push(`- Aftalt tid: Ikke fundet i Gmail tråde`);
      }
      if (task.invoicedTime > 0) {
        // invoicedTime er allerede fakturerbar tid, så divider med personer for at få pr. person
        const timePerPerson = task.invoicedTime / task.numberOfPeople;
        lines.push(`- Faktureret tid: ${timePerPerson.toFixed(2)} timer pr. person, ${task.invoicedTime.toFixed(2)} timer samlet (fakturerbart)`);
      } else {
        lines.push(`- Faktureret tid: Ikke fundet i fakturaer`);
      }
      if (task.actualWorkTime > 0) {
        const totalTime = task.actualWorkTime * task.numberOfPeople; // Fakturerbar tid
        lines.push(
          `- Faktisk arbejdstid: ${task.actualWorkTime.toFixed(2)} timer pr. person, ${totalTime.toFixed(2)} timer samlet (fakturerbart)`
        );
      } else {
        lines.push(`- Faktisk arbejdstid: Ikke rapporteret i Gmail tråde`);
      }
      lines.push("");
      lines.push("**Omkostninger (90 DKK/time pr. person):**");
      
      // Show cost breakdown: per person and total
      if (task.calendarCost > 0) {
        const costPerPerson = task.numberOfPeople > 0 
          ? task.calendarCost / task.numberOfPeople 
          : task.calendarCost;
        lines.push(`- Kalendertid: ${costPerPerson.toFixed(2)} kr pr. person, ${task.calendarCost.toFixed(2)} kr samlet`);
      }
      if (task.agreedCost > 0) {
        const costPerPerson = task.numberOfPeople > 0 
          ? task.agreedCost / task.numberOfPeople 
          : task.agreedCost;
        lines.push(`- Aftalt tid: ${costPerPerson.toFixed(2)} kr pr. person, ${task.agreedCost.toFixed(2)} kr samlet`);
      }
      if (task.actualCost > 0) {
        const costPerPerson = task.numberOfPeople > 0 
          ? task.actualCost / task.numberOfPeople 
          : task.actualCost;
        lines.push(`- Faktisk tid: ${costPerPerson.toFixed(2)} kr pr. person, ${task.actualCost.toFixed(2)} kr samlet`);
      }
      if (task.invoicedCost > 0) {
        const costPerPerson = task.numberOfPeople > 0 
          ? task.invoicedCost / task.numberOfPeople 
          : task.invoicedCost;
        lines.push(`- Faktureret tid (løn): ${costPerPerson.toFixed(2)} kr pr. person, ${task.invoicedCost.toFixed(2)} kr samlet`);
      }
      
      // Indtjening og profit
      if (task.invoicedRevenue > 0) {
        lines.push("");
        lines.push("**Økonomi:**");
        lines.push(`- Indtjening: ${task.invoicedRevenue.toFixed(2)} kr (${task.invoicedTime.toFixed(2)} timer × 349 DKK/time)`);
        lines.push(`- Løn: ${task.invoicedCost.toFixed(2)} kr (${task.invoicedTime.toFixed(2)} timer × 90 DKK/time)`);
        lines.push(`- **Profit: ${task.profit > 0 ? "+" : ""}${task.profit.toFixed(2)} kr**`);
        if (task.invoicedRevenue > 0) {
          const margin = (task.profit / task.invoicedRevenue) * 100;
          lines.push(`- Profit margin: ${margin.toFixed(1)}%`);
        }
      }

      // Vis forskelle
      if (task.agreedTime > 0 && task.calendarTime > 0) {
        const diff = task.calendarTime - task.agreedTime;
        if (Math.abs(diff) > 0.1) {
          lines.push(
            `- **Forskel kalender vs. aftalt:** ${diff > 0 ? "+" : ""}${diff.toFixed(2)} timer`
          );
        }
      }
      if (task.actualWorkTime > 0 && task.calendarTime > 0) {
        const diff = task.actualWorkTime - task.calendarTime;
        if (Math.abs(diff) > 0.1) {
          lines.push(
            `- **Forskel faktisk vs. kalender:** ${diff > 0 ? "+" : ""}${diff.toFixed(2)} timer`
          );
        }
      }
      if (task.invoicedTime > 0 && task.actualWorkTime > 0) {
        const diff = task.invoicedTime - task.actualWorkTime;
        if (Math.abs(diff) > 0.1) {
          lines.push(
            `- **Forskel faktureret vs. faktisk:** ${diff > 0 ? "+" : ""}${diff.toFixed(2)} timer`
          );
        }
      }

      lines.push("");
      if (task.notes.length > 0) {
        lines.push("**Noter:**");
        for (const note of task.notes) {
          lines.push(`- ${note}`);
        }
        lines.push("");
      }

      // Add complaints section if any
      if (task.hasComplaints && task.complaints.length > 0) {
        lines.push("**Klager og henvendelser:**");
        for (const complaint of task.complaints) {
          const statusIcon = complaint.resolved ? "✅" : "⚠️";
          const typeLabels: Record<string, string> = {
            klage: "Klage",
            henvendelse: "Henvendelse",
            problem: "Problem",
            forsinkelse: "Forsinkelse",
            kvalitet: "Kvalitet",
            pris: "Pris",
          };
          lines.push(
            `- ${statusIcon} **${typeLabels[complaint.type] || complaint.type}** (${complaint.date}): ${complaint.description}`
          );
          if (complaint.resolved && complaint.resolution) {
            lines.push(`  - Løst: ${complaint.resolution}`);
          }
          if (complaint.compensation) {
            lines.push(`  - Kompensation: ${complaint.compensation}`);
          }
        }
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }
  }

  // Add summary section for complaints
  const tasksWithComplaints = tasks.filter(t => t.hasComplaints);
  if (tasksWithComplaints.length > 0) {
    lines.push("");
    lines.push("## Klager og henvendelser - Oversigt");
    lines.push("");
    lines.push(`**Total opgaver med klager/henvendelser:** ${tasksWithComplaints.length} af ${tasks.length}`);
    lines.push("");
    
    const complaintCounts: Record<string, number> = {};
    let resolvedCount = 0;
    let unresolvedCount = 0;
    
    for (const task of tasksWithComplaints) {
      for (const complaint of task.complaints) {
        complaintCounts[complaint.type] = (complaintCounts[complaint.type] || 0) + 1;
        if (complaint.resolved) {
          resolvedCount++;
        } else {
          unresolvedCount++;
        }
      }
    }
    
    lines.push("**Fordeling efter type:**");
    const typeLabels: Record<string, string> = {
      klage: "Klager",
      henvendelse: "Henvendelser",
      problem: "Problemer",
      forsinkelse: "Forsinkelser",
      kvalitet: "Kvalitet",
      pris: "Pris",
    };
    for (const [type, count] of Object.entries(complaintCounts)) {
      lines.push(`- ${typeLabels[type] || type}: ${count}`);
    }
    lines.push("");
    lines.push(`**Status:** ${resolvedCount} løst, ${unresolvedCount} uafklaret`);
    lines.push("");
  }

  lines.push("");
  lines.push("## Noter");
  lines.push("");
  lines.push(
    "- Kalendertid: Beregnet fra startTime til endTime i kalenderopgaver"
  );
  lines.push(
    "- Aftalt tid: Ekstraheret fra Gmail tråde (tilbud, bekræftelser)"
  );
  lines.push(
    "- Faktureret tid: Ekstraheret fra fakturaer (beskrivelse eller beløb ÷ 349 DKK/time)"
  );
  lines.push(
    "- Faktisk arbejdstid: Ekstraheret fra Gmail tråde (efterfølgende rapportering)"
  );
  lines.push("- Omkostninger: Timer × antal personer × 90 DKK/time");
  lines.push("");

  if (tasks.some(t => t.notes.length > 0)) {
    lines.push("### Særlige noter:");
    for (const task of tasks) {
      if (task.notes.length > 0) {
        lines.push(`- ${task.date} - ${task.title}: ${task.notes.join(", ")}`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * CLI entry point
 *
 * Usage: npx tsx server/scripts/team2-fb-rengoring-report.ts [daysBack] [userId]
 */
async function main() {
  try {
    // Get userId from command line or environment or use default
    const userId = parseInt(process.argv[3] || process.env.USER_ID || "1");
    // Support both number of days or specific date range
    // Usage: tsx script.ts [daysBack|startDate] [userId] [endDate]
    // Example: tsx script.ts 14 1 (last 14 days)
    // Example: tsx script.ts "2025-11-01" 1 "2025-11-15" (specific period)
    const daysBackOrStart = process.argv[2] || "14";
    const endDateOverride = process.argv[4];
    const daysBack = isNaN(Number(daysBackOrStart))
      ? daysBackOrStart
      : parseInt(daysBackOrStart);

    console.log(
      `[Team2 Report] Starting analysis for userId=${userId}, daysBack=${daysBack}`
    );

    const result = await analyzeTeam2FbRengoring(
      userId,
      daysBack,
      endDateOverride
    );

    console.log("\n" + "=".repeat(80));
    console.log(result.report);
    console.log("=".repeat(80));

    // Also save to file
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const reportPath = path.join(
      __dirname,
      `../../reports/team2-fb-rengoring-${new Date().toISOString().split("T")[0]}.md`
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, result.report, "utf-8");
    console.log(`\n[Team2 Report] Report saved to: ${reportPath}`);

    return result;
  } catch (error) {
    console.error("[Team2 Report] Error:", error);
    if (error instanceof Error) {
      console.error("[Team2 Report] Error details:", error.message);
      console.error("[Team2 Report] Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") || "")) {
  main();
}

// Export for use in other modules
export { main as runTeam2Report };
