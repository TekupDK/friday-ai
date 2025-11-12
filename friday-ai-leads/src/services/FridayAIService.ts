/**
 * Main Friday AI Service for Lead Intelligence
 * Integrates with ChromaDB and provides intelligent customer insights
 */

import { ChromaClient, Collection } from "chromadb";
import {
  Customer,
  CustomerSearchQuery,
  CustomerIntelligence,
} from "../types/customer.types";
import {
  BookingPrediction,
  RevenueOpportunity,
} from "../types/analytics.types";
import { FridayAIResponse, FridayAIIntent } from "../types/friday.types";

export class FridayAIService {
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;
  private readonly collectionName: string = "leads_v4_3_3";

  constructor(chromaUrl: string = "http://localhost:8000") {
    this.chromaClient = new ChromaClient({ path: chromaUrl });
  }

  /**
   * Initialize the service and connect to ChromaDB
   */
  async initialize(): Promise<void> {
    try {
      // Get or create collection
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        metadata: {
          description: "RenDetalje lead data with AI-enhanced intelligence",
          version: "4.3.5",
        },
      });

      console.log(
        `✅ Friday AI connected to ChromaDB collection: ${this.collectionName}`
      );
    } catch (error) {
      console.error("❌ Failed to initialize Friday AI Service:", error);
      throw error;
    }
  }

  /**
   * Get customer context by identifier (email, phone, or name)
   */
  async getCustomerContext(identifier: string): Promise<FridayAIResponse> {
    if (!this.collection) {
      throw new Error("Friday AI Service not initialized");
    }

    try {
      // Search for customer in ChromaDB
      const results = await this.collection.query({
        queryTexts: [identifier],
        nResults: 1,
        include: ["documents", "metadatas", "distances"],
      });

      if (!results.documents || results.documents[0].length === 0) {
        return {
          success: false,
          message: `No customer found for: ${identifier}`,
          data: null,
        };
      }

      // Parse customer data
      const customerData = JSON.parse(results.documents[0][0] as string);
      const metadata = results.metadatas?.[0]?.[0] || {};

      // Extract intelligence
      const intelligence = this.extractCustomerIntelligence(customerData);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        customerData,
        intelligence
      );

      return {
        success: true,
        message: `Customer found: ${customerData.name}`,
        data: {
          customer: customerData,
          intelligence,
          recommendations,
          confidence: 1 - (results.distances?.[0]?.[0] || 0),
        },
      };
    } catch (error) {
      console.error("Error getting customer context:", error);
      return {
        success: false,
        message: "Error retrieving customer data",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Predict next booking for a customer
   */
  async predictNextBooking(customerId: string): Promise<BookingPrediction> {
    const customerContext = await this.getCustomerContext(customerId);

    if (!customerContext.success || !customerContext.data) {
      throw new Error("Customer not found");
    }

    const { customer, intelligence } = customerContext.data;

    // Calculate next booking based on frequency
    const lastBooking = customer.lastBookingDate
      ? new Date(customer.lastBookingDate)
      : new Date();
    const frequency = intelligence.recurringFrequency || "monthly";

    const daysToAdd = this.getFrequencyDays(frequency);
    const nextDate = new Date(lastBooking);
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    // Assess churn risk
    const daysSinceLastBooking = Math.floor(
      (Date.now() - lastBooking.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysSinceLastBooking > daysToAdd;
    const churnRisk = this.calculateChurnRisk(daysSinceLastBooking, daysToAdd);

    return {
      customerId,
      nextBookingDate: nextDate,
      isOverdue,
      daysOverdue: isOverdue ? daysSinceLastBooking - daysToAdd : 0,
      churnRisk,
      suggestedService: customer.lastService || "Standard rengøring",
      estimatedPrice: customer.averageBookingValue || 2500,
      confidence: intelligence.isRecurring ? 0.85 : 0.5,
      recommendation: isOverdue
        ? `Send reminder immediately - ${daysSinceLastBooking - daysToAdd} days overdue`
        : `Schedule follow-up for ${nextDate.toLocaleDateString("da-DK")}`,
    };
  }

  /**
   * Find revenue opportunities across all customers
   */
  async findRevenueOpportunities(): Promise<RevenueOpportunity[]> {
    if (!this.collection) {
      throw new Error("Friday AI Service not initialized");
    }

    const opportunities: RevenueOpportunity[] = [];

    try {
      // Get all customers
      const results = await this.collection.get({
        limit: 1000,
        include: ["documents", "metadatas"],
      });

      if (!results.documents) return opportunities;

      for (const doc of results.documents) {
        const customer = JSON.parse(doc as string);
        const intelligence = this.extractCustomerIntelligence(customer);

        // Check for upsell opportunity
        if (
          intelligence.customerType === "standard" &&
          customer.totalBookings > 3
        ) {
          opportunities.push({
            type: "upsell",
            customerId: customer.id,
            customerName: customer.name,
            potential: customer.averageBookingValue * 0.2 * 12, // 20% increase annually
            confidence: 0.75,
            suggestion: "Upgrade to premium service tier",
            priority: "medium",
          });
        }

        // Check for frequency optimization
        if (
          intelligence.recurringFrequency === "monthly" &&
          customer.totalBookings > 6
        ) {
          opportunities.push({
            type: "frequency",
            customerId: customer.id,
            customerName: customer.name,
            potential: customer.averageBookingValue * 2 * 12, // 2 extra bookings per year
            confidence: 0.65,
            suggestion: `Increase frequency from ${intelligence.recurringFrequency} to biweekly`,
            priority: "low",
          });
        }

        // Check for win-back opportunity
        const daysSinceLastBooking = customer.lastBookingDate
          ? Math.floor(
              (Date.now() - new Date(customer.lastBookingDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999;

        if (daysSinceLastBooking > 60 && customer.totalBookings > 0) {
          opportunities.push({
            type: "winback",
            customerId: customer.id,
            customerName: customer.name,
            potential: customer.averageBookingValue * 6, // 6 bookings recovery
            confidence: 0.5,
            suggestion: "Win-back campaign with 20% discount",
            priority: "high",
          });
        }

        // Check for premium upgrade
        if (
          intelligence.customerType === "premium" &&
          !customer.hasPremiumPlan
        ) {
          opportunities.push({
            type: "premium",
            customerId: customer.id,
            customerName: customer.name,
            potential: customer.averageBookingValue * 0.15 * 12, // 15% premium pricing
            confidence: 0.8,
            suggestion: "Offer premium membership with priority booking",
            priority: "medium",
          });
        }
      }

      // Sort by potential value
      opportunities.sort((a, b) => b.potential - a.potential);
    } catch (error) {
      console.error("Error finding revenue opportunities:", error);
    }

    return opportunities;
  }

  /**
   * Handle natural language query
   */
  async handleQuery(query: string): Promise<FridayAIResponse> {
    // Detect intent from query
    const intent = this.detectIntent(query);

    switch (intent.type) {
      case "customer_lookup":
        return this.getCustomerContext(intent.parameters.identifier);

      case "booking_prediction":
        const prediction = await this.predictNextBooking(
          intent.parameters.customerId
        );
        return {
          success: true,
          message: "Booking prediction generated",
          data: prediction,
        };

      case "revenue_opportunities":
        const opportunities = await this.findRevenueOpportunities();
        return {
          success: true,
          message: `Found ${opportunities.length} revenue opportunities`,
          data: opportunities,
        };

      case "quality_check":
        return this.checkQualityIssues();

      default:
        return {
          success: false,
          message: "Intent not recognized",
          data: null,
        };
    }
  }

  /**
   * Check for quality issues across customers
   */
  private async checkQualityIssues(): Promise<FridayAIResponse> {
    if (!this.collection) {
      throw new Error("Friday AI Service not initialized");
    }

    try {
      const results = await this.collection.get({
        where: { hasComplaints: true },
        limit: 100,
        include: ["documents", "metadatas"],
      });

      const issues =
        results.documents?.map(doc => {
          const customer = JSON.parse(doc as string);
          return {
            customerId: customer.id,
            customerName: customer.name,
            issue:
              customer.complaintHistory?.[0]?.description ||
              "Quality issue detected",
            severity: customer.complaintHistory?.[0]?.severity || "medium",
            lastBooking: customer.lastBookingDate,
            action: "Contact customer for quality review",
          };
        }) || [];

      return {
        success: true,
        message: `Found ${issues.length} quality issues`,
        data: issues,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error checking quality issues",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract customer intelligence from raw data
   */
  private extractCustomerIntelligence(customerData: any): CustomerIntelligence {
    return {
      customerType: customerData.customer?.customerType || "unknown",
      isRecurring: customerData.customer?.isRecurring || false,
      isActive: customerData.customer?.isActive || false,
      isPremium: customerData.customer?.customerType === "premium",
      recurringFrequency: customerData.customer?.recurringFrequency || null,
      hasComplaints: customerData.customer?.hasComplaints || false,
      hasSpecialNeeds: customerData.customer?.hasSpecialNeeds || false,
      specialRequirements: customerData.customer?.specialRequirements || [],
      aiParsedData: customerData.calendar?.aiParsed
        ? {
            confidence:
              customerData.calendar.aiParsed.qualitySignals?.confidence || 0,
            lastUpdated: new Date(),
            insights: this.generateInsights(customerData),
          }
        : undefined,
    };
  }

  /**
   * Generate insights from customer data
   */
  private generateInsights(customerData: any): string[] {
    const insights: string[] = [];

    if (customerData.customer?.isRecurring) {
      insights.push(
        `Recurring ${customerData.customer.recurringFrequency} customer`
      );
    }

    if (customerData.customer?.hasComplaints) {
      insights.push("Has unresolved complaints - needs attention");
    }

    if (customerData.customer?.customerType === "premium") {
      insights.push("Premium customer - prioritize service");
    }

    if (
      customerData.calendar?.aiParsed?.qualitySignals?.bookingNumber >
      customerData.customer?.totalBookings
    ) {
      insights.push("Missing historical bookings detected");
    }

    return insights;
  }

  /**
   * Generate recommendations based on customer data
   */
  private generateRecommendations(
    customerData: any,
    intelligence: CustomerIntelligence
  ): string[] {
    const recommendations: string[] = [];

    // Check for overdue booking
    if (customerData.lastBookingDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(customerData.lastBookingDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const expectedDays = this.getFrequencyDays(
        intelligence.recurringFrequency || "monthly"
      );

      if (daysSince > expectedDays * 1.5) {
        recommendations.push(
          `Send rebooking reminder - ${daysSince - expectedDays} days overdue`
        );
      }
    }

    // Upsell opportunities
    if (
      intelligence.customerType === "standard" &&
      customerData.totalBookings > 3
    ) {
      recommendations.push("Offer premium service upgrade");
    }

    // Quality follow-up
    if (intelligence.hasComplaints) {
      recommendations.push("Schedule quality review call");
    }

    // Frequency optimization
    if (
      intelligence.recurringFrequency === "monthly" &&
      customerData.totalBookings > 6
    ) {
      recommendations.push("Suggest increased booking frequency");
    }

    return recommendations;
  }

  /**
   * Detect intent from natural language query
   */
  private detectIntent(query: string): FridayAIIntent {
    const lowerQuery = query.toLowerCase();

    // Customer lookup patterns
    if (
      lowerQuery.includes("info om") ||
      lowerQuery.includes("customer") ||
      lowerQuery.includes("kunde")
    ) {
      const identifier = this.extractIdentifier(query);
      return {
        type: "customer_lookup",
        confidence: 0.9,
        parameters: { identifier },
      };
    }

    // Booking prediction patterns
    if (
      lowerQuery.includes("næste booking") ||
      lowerQuery.includes("next booking") ||
      lowerQuery.includes("hvornår")
    ) {
      return {
        type: "booking_prediction",
        confidence: 0.85,
        parameters: { customerId: this.extractIdentifier(query) },
      };
    }

    // Revenue opportunities
    if (
      lowerQuery.includes("revenue") ||
      lowerQuery.includes("opportunities") ||
      lowerQuery.includes("upsell")
    ) {
      return {
        type: "revenue_opportunities",
        confidence: 0.8,
        parameters: {},
      };
    }

    // Quality check
    if (
      lowerQuery.includes("quality") ||
      lowerQuery.includes("complaints") ||
      lowerQuery.includes("klager")
    ) {
      return {
        type: "quality_check",
        confidence: 0.8,
        parameters: {},
      };
    }

    return {
      type: "unknown",
      confidence: 0,
      parameters: {},
    };
  }

  /**
   * Extract identifier from query
   */
  private extractIdentifier(query: string): string {
    // Try to extract email
    const emailMatch = query.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) return emailMatch[0];

    // Try to extract phone
    const phoneMatch = query.match(/\d{8}/);
    if (phoneMatch) return phoneMatch[0];

    // Extract name (simple heuristic - words after "om" or "customer")
    const nameMatch = query.match(
      /(?:om|customer|kunde)\s+([^,.\s]+(?:\s+[^,.\s]+)?)/i
    );
    if (nameMatch) return nameMatch[1];

    return query; // Return full query as fallback
  }

  /**
   * Get days for frequency
   */
  private getFrequencyDays(frequency: string): number {
    switch (frequency) {
      case "weekly":
        return 7;
      case "biweekly":
        return 14;
      case "triweekly":
        return 21;
      case "monthly":
        return 30;
      default:
        return 30;
    }
  }

  /**
   * Calculate churn risk
   */
  private calculateChurnRisk(daysSince: number, expectedDays: number): number {
    const overdueFactor = daysSince / expectedDays;

    if (overdueFactor <= 1) return 0;
    if (overdueFactor <= 1.5) return 25;
    if (overdueFactor <= 2) return 50;
    if (overdueFactor <= 3) return 75;
    return 90;
  }
}
