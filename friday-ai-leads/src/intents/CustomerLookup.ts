/**
 * Customer Lookup Intent Handler
 * Handles all customer search and information retrieval
 */

import { Customer, CustomerSearchQuery } from "../types/customer.types";
import { FridayAIIntent, FridayAIResponse } from "../types/friday.types";

export class CustomerLookupIntent {
  /**
   * Process customer lookup intent
   */
  async execute(
    intent: FridayAIIntent,
    chromaCollection: any
  ): Promise<FridayAIResponse> {
    try {
      const { identifier, searchType = "all" } = intent.parameters;

      if (!identifier) {
        return {
          success: false,
          message: "Mangler kunde identifikation (email, telefon eller navn)",
          data: null,
        };
      }

      // Build search query based on type
      const searchQuery = this.buildSearchQuery(identifier, searchType);

      // Search in ChromaDB
      const results = await chromaCollection.query({
        queryTexts: [searchQuery],
        nResults: searchType === "all" ? 5 : 1,
        include: ["documents", "metadatas", "distances"],
      });

      if (!results.documents || results.documents[0].length === 0) {
        return {
          success: false,
          message: `Ingen kunde fundet for: ${identifier}`,
          data: null,
        };
      }

      // Parse and format customer data
      const customers = results.documents[0].map(
        (doc: string, index: number) => {
          const customerData = JSON.parse(doc);
          const confidence = 1 - (results.distances?.[0]?.[index] || 0);

          return this.formatCustomerResponse(customerData, confidence);
        }
      );

      // Return single or multiple customers based on search type
      const responseData = searchType === "all" ? customers : customers[0];

      return {
        success: true,
        message: `Fundet ${customers.length} kunde${customers.length > 1 ? "r" : ""}`,
        data: {
          results: responseData,
          totalFound: customers.length,
          searchQuery: identifier,
        },
      };
    } catch (error) {
      console.error("CustomerLookupIntent error:", error);
      return {
        success: false,
        message: "Fejl ved kundesøgning",
        error: error instanceof Error ? error.message : "Ukendt fejl",
      };
    }
  }

  /**
   * Build search query based on identifier type
   */
  private buildSearchQuery(identifier: string, searchType: string): string {
    // Check if email
    if (identifier.includes("@")) {
      return identifier.toLowerCase();
    }

    // Check if phone (8 digits)
    if (/^\d{8}$/.test(identifier)) {
      return identifier;
    }

    // Assume it's a name
    return identifier;
  }

  /**
   * Format customer data for response
   */
  private formatCustomerResponse(customerData: any, confidence: number): any {
    const lastBooking = customerData.calendar?.startTime
      ? new Date(customerData.calendar.startTime)
      : null;

    const daysSinceLastBooking = lastBooking
      ? Math.floor((Date.now() - lastBooking.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      // Basic info
      id: customerData.id,
      name: customerData.customerName || customerData.name || "Ukendt",
      email: customerData.customerEmail || customerData.email,
      phone: customerData.phone || customerData.customerPhone,
      address: customerData.address || customerData.calendar?.location,

      // Business metrics
      totalBookings: customerData.customer?.totalBookings || 0,
      lifetimeValue: customerData.customer?.lifetimeValue || 0,
      avgBookingValue: customerData.customer?.avgBookingValue || 0,
      lastBookingDate: lastBooking?.toISOString(),
      daysSinceLastBooking,

      // Intelligence
      customerType: customerData.customer?.customerType || "unknown",
      isRecurring: customerData.customer?.isRecurring || false,
      isActive: customerData.customer?.isActive || false,
      recurringFrequency: customerData.customer?.recurringFrequency || null,

      // Quality signals
      hasComplaints: customerData.customer?.hasComplaints || false,
      hasSpecialNeeds: customerData.customer?.hasSpecialNeeds || false,
      specialRequirements: customerData.customer?.specialRequirements || [],

      // AI insights
      insights: this.generateInsights(customerData, daysSinceLastBooking),
      recommendations: this.generateRecommendations(
        customerData,
        daysSinceLastBooking
      ),

      // Meta
      confidence,
      source: this.determineSource(customerData),
    };
  }

  /**
   * Generate insights about customer
   */
  private generateInsights(
    customerData: any,
    daysSince: number | null
  ): string[] {
    const insights: string[] = [];

    // Booking frequency insight
    if (customerData.customer?.isRecurring) {
      insights.push(
        `📅 ${customerData.customer.recurringFrequency} kunde med ${customerData.customer.totalBookings} bookinger`
      );
    }

    // Value insight
    if (customerData.customer?.lifetimeValue > 10000) {
      insights.push(
        `💰 Høj værdi kunde: ${Math.round(customerData.customer.lifetimeValue).toLocaleString("da-DK")} kr lifetime`
      );
    }

    // Overdue insight
    if (daysSince && customerData.customer?.recurringFrequency) {
      const expectedDays = this.getExpectedDays(
        customerData.customer.recurringFrequency
      );
      if (daysSince > expectedDays * 1.5) {
        insights.push(
          `⚠️ Forsinket booking: ${daysSince - expectedDays} dage over forventet`
        );
      }
    }

    // Quality insight
    if (customerData.customer?.hasComplaints) {
      insights.push("🚨 Har uløste klager - kræver opmærksomhed");
    }

    if (customerData.customer?.customerType === "premium") {
      insights.push("⭐ Premium kunde - prioriter service");
    }

    // Special requirements
    if (customerData.customer?.specialRequirements?.length > 0) {
      insights.push(
        `📋 Special krav: ${customerData.customer.specialRequirements.join(", ")}`
      );
    }

    // Missing bookings
    if (
      customerData.calendar?.aiParsed?.qualitySignals?.bookingNumber >
      customerData.customer?.totalBookings
    ) {
      const missing =
        customerData.calendar.aiParsed.qualitySignals.bookingNumber -
        customerData.customer.totalBookings;
      insights.push(`❓ ${missing} manglende historiske bookinger`);
    }

    return insights;
  }

  /**
   * Generate recommendations for customer
   */
  private generateRecommendations(
    customerData: any,
    daysSince: number | null
  ): string[] {
    const recommendations: string[] = [];

    // Rebooking recommendation
    if (daysSince && customerData.customer?.recurringFrequency) {
      const expectedDays = this.getExpectedDays(
        customerData.customer.recurringFrequency
      );
      if (daysSince > expectedDays) {
        recommendations.push(
          `📞 Send rebooking reminder - ${daysSince - expectedDays} dage forsinket`
        );
      }
    }

    // Upsell recommendation
    if (
      customerData.customer?.customerType === "standard" &&
      customerData.customer?.totalBookings > 3
    ) {
      recommendations.push("📈 Tilbyd premium service opgradering");
    }

    // Quality follow-up
    if (customerData.customer?.hasComplaints) {
      recommendations.push("☎️ Planlæg kvalitets opfølgning samtale");
    }

    // Frequency optimization
    if (
      customerData.customer?.recurringFrequency === "monthly" &&
      customerData.customer?.totalBookings > 6
    ) {
      recommendations.push("🔄 Foreslå øget booking frekvens til biweekly");
    }

    // Win-back
    if (daysSince && daysSince > 90 && !customerData.customer?.isRecurring) {
      recommendations.push("🎁 Win-back kampagne med 20% rabat");
    }

    // Payment follow-up
    if (customerData.calculated?.financial?.outstandingAmount > 0) {
      recommendations.push(
        `💳 Opkræv udestående: ${Math.round(customerData.calculated.financial.outstandingAmount).toLocaleString("da-DK")} kr`
      );
    }

    return recommendations;
  }

  /**
   * Get expected days between bookings
   */
  private getExpectedDays(frequency: string): number {
    const frequencyMap: Record<string, number> = {
      weekly: 7,
      biweekly: 14,
      triweekly: 21,
      monthly: 30,
      quarterly: 90,
    };

    return frequencyMap[frequency] || 30;
  }

  /**
   * Determine data source
   */
  private determineSource(customerData: any): string[] {
    const sources: string[] = [];

    if (customerData.gmail) sources.push("Gmail");
    if (customerData.calendar) sources.push("Calendar");
    if (customerData.billy) sources.push("Billy");

    return sources;
  }
}
