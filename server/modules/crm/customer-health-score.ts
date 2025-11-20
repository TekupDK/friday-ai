import { and, desc, eq, gte, sql } from "drizzle-orm";

import {
  bookings,
  customerActivities,
  customerHealthScores,
  customerInvoices,
  customerProfiles,
  emailThreads,
} from "../../../drizzle/schema";

import { getDb } from "./db";

/**
 * Customer Health Score Calculator
 *
 * Calculates a 0-100 health score based on:
 * - Email engagement (40%): Response rate, last contact
 * - Payment behavior (30%): On-time payments, outstanding balance
 * - Booking frequency (20%): Regular bookings, recent activity
 * - Activity level (10%): Notes, calls, meetings
 */

interface HealthScoreFactors {
  email_engagement: number; // 0-100
  payment_speed: number; // 0-100
  booking_frequency: number; // 0-100
  activity_level: number; // 0-100
}

interface HealthScoreResult {
  score: number; // 0-100 weighted average
  riskLevel: "low" | "medium" | "high" | "critical";
  churnProbability: number; // 0-100 percentage
  factors: HealthScoreFactors;
}

/**
 * Calculate email engagement score
 */
async function calculateEmailEngagement(
  customerProfileId: number,
  customerEmail: string,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 50; // Default to neutral

  // Get email threads involving this customer
  const threads = await db
    .select()
    .from(emailThreads)
    .where(
      and(
        eq(emailThreads.userId, userId),
        sql`${emailThreads.participants}::text LIKE ${"%" + customerEmail.toLowerCase() + "%"}`
      )
    )
    .orderBy(desc(emailThreads.lastMessageAt))
    .limit(20);

  if (threads.length === 0) return 0;

  // Calculate days since last email
  const lastEmailDate = threads[0]?.lastMessageAt;
  if (!lastEmailDate) return 0;

  const daysSinceLastEmail = Math.floor(
    (Date.now() - new Date(lastEmailDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Score based on recency (100 if within 7 days, 0 if >90 days)
  let recencyScore = 100;
  if (daysSinceLastEmail > 90) recencyScore = 0;
  else if (daysSinceLastEmail > 60) recencyScore = 25;
  else if (daysSinceLastEmail > 30) recencyScore = 50;
  else if (daysSinceLastEmail > 14) recencyScore = 75;

  // Volume score (more threads = more engaged)
  const volumeScore = Math.min(100, threads.length * 10);

  // Average the two
  return Math.round((recencyScore + volumeScore) / 2);
}

/**
 * Calculate payment behavior score
 */
async function calculatePaymentSpeed(
  customerProfileId: number,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 50;

  // Get recent invoices
  const invoices = await db
    .select()
    .from(customerInvoices)
    .where(eq(customerInvoices.customerId, customerProfileId))
    .orderBy(desc(customerInvoices.createdAt))
    .limit(10);

  if (invoices.length === 0) return 100; // No invoices = no risk

  let totalScore = 0;
  let paidInvoices = 0;

  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.paidAt && invoice.dueDate) {
      paidInvoices++;
      const dueDate = new Date(invoice.dueDate);
      const paidDate = new Date(invoice.paidAt);
      const daysDiff = Math.floor(
        (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Score based on payment timing
      if (daysDiff <= 0)
        totalScore += 100; // Paid on time or early
      else if (daysDiff <= 7)
        totalScore += 80; // 1 week late
      else if (daysDiff <= 14)
        totalScore += 60; // 2 weeks late
      else if (daysDiff <= 30)
        totalScore += 40; // 1 month late
      else totalScore += 20; // Very late
    } else if (invoice.status === "overdue") {
      totalScore += 0; // Overdue = 0 score
    }
  }

  // Check for outstanding balance
  const profile = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.id, customerProfileId))
    .limit(1);

  const balance = profile[0]?.balance || 0;
  const balancePenalty = Math.min(30, Math.floor(balance / 1000)); // -1 point per 1000 DKK outstanding

  const avgScore = paidInvoices > 0 ? totalScore / paidInvoices : 50;
  return Math.max(0, Math.round(avgScore - balancePenalty));
}

/**
 * Calculate booking frequency score
 */
async function calculateBookingFrequency(
  customerProfileId: number,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 50;

  // Get bookings from last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.customerProfileId, customerProfileId),
        gte(bookings.scheduledStart, sixMonthsAgo.toISOString())
      )
    )
    .orderBy(desc(bookings.scheduledStart));

  if (recentBookings.length === 0) return 0;

  // Score based on frequency
  const monthlyAverage = recentBookings.length / 6;
  let frequencyScore = 0;

  if (monthlyAverage >= 2)
    frequencyScore = 100; // 2+ per month
  else if (monthlyAverage >= 1)
    frequencyScore = 80; // 1 per month
  else if (monthlyAverage >= 0.5)
    frequencyScore = 60; // Every other month
  else frequencyScore = 40; // Less frequent

  // Check recency of last booking
  const lastBooking = recentBookings[0];
  if (lastBooking) {
    const daysSinceLastBooking = Math.floor(
      (Date.now() - new Date(lastBooking.scheduledStart).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let recencyBonus = 0;
    if (daysSinceLastBooking <= 30) recencyBonus = 20;
    else if (daysSinceLastBooking <= 60) recencyBonus = 10;

    frequencyScore = Math.min(100, frequencyScore + recencyBonus);
  }

  return frequencyScore;
}

/**
 * Calculate activity level score
 */
async function calculateActivityLevel(
  customerProfileId: number,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 50;

  // Get activities from last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const activities = await db
    .select()
    .from(customerActivities)
    .where(
      and(
        eq(customerActivities.customerProfileId, customerProfileId),
        gte(customerActivities.createdAt, threeMonthsAgo.toISOString())
      )
    );

  if (activities.length === 0) return 0;

  // Score based on activity count
  const activityScore = Math.min(100, activities.length * 15);

  // Bonus for variety (calls, meetings, notes)
  const activityTypes = new Set(activities.map(a => a.activityType));
  const varietyBonus = activityTypes.size * 5;

  return Math.min(100, activityScore + varietyBonus);
}

/**
 * Calculate overall health score and risk level
 */
export async function calculateCustomerHealthScore(
  customerProfileId: number,
  userId: number
): Promise<HealthScoreResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Get customer email
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerProfileId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Calculate all factors
  const [emailEngagement, paymentSpeed, bookingFrequency, activityLevel] =
    await Promise.all([
      calculateEmailEngagement(customerProfileId, customer.email, userId),
      calculatePaymentSpeed(customerProfileId, userId),
      calculateBookingFrequency(customerProfileId, userId),
      calculateActivityLevel(customerProfileId, userId),
    ]);

  const factors: HealthScoreFactors = {
    email_engagement: emailEngagement,
    payment_speed: paymentSpeed,
    booking_frequency: bookingFrequency,
    activity_level: activityLevel,
  };

  // Weighted average: email(40%), payment(30%), booking(20%), activity(10%)
  const score = Math.round(
    emailEngagement * 0.4 +
      paymentSpeed * 0.3 +
      bookingFrequency * 0.2 +
      activityLevel * 0.1
  );

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical";
  if (score >= 75) riskLevel = "low";
  else if (score >= 50) riskLevel = "medium";
  else if (score >= 25) riskLevel = "high";
  else riskLevel = "critical";

  // Calculate churn probability (inverse of score)
  const churnProbability = Math.round(100 - score);

  return {
    score,
    riskLevel,
    churnProbability,
    factors,
  };
}

/**
 * Update health score in database
 */
export async function updateCustomerHealthScore(
  customerProfileId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const result = await calculateCustomerHealthScore(customerProfileId, userId);

  // Check if score exists
  const existing = await db
    .select()
    .from(customerHealthScores)
    .where(eq(customerHealthScores.customerProfileId, customerProfileId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(customerHealthScores)
      .set({
        score: result.score,
        riskLevel: result.riskLevel,
        churnProbability: result.churnProbability,
        factors: result.factors as any,
        lastCalculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customerHealthScores.customerProfileId, customerProfileId));
  } else {
    // Insert new
    await db.insert(customerHealthScores).values({
      customerProfileId,
      score: result.score,
      riskLevel: result.riskLevel,
      churnProbability: result.churnProbability,
      factors: result.factors as any,
    });
  }
}

/**
 * Get health score from database (cached)
 */
export async function getCustomerHealthScore(
  customerProfileId: number
): Promise<HealthScoreResult | null> {
  const db = await getDb();
  if (!db) return null;

  const [score] = await db
    .select()
    .from(customerHealthScores)
    .where(eq(customerHealthScores.customerProfileId, customerProfileId))
    .limit(1);

  if (!score) return null;

  return {
    score: score.score,
    riskLevel: score.riskLevel as "low" | "medium" | "high" | "critical",
    churnProbability: score.churnProbability || 0,
    factors: score.factors as HealthScoreFactors,
  };
}
