/**
 * AI Test Data Generator
 *
 * Generates realistic test data for Friday AI testing:
 * - Danish business conversations
 * - Email scenarios
 * - Calendar events
 * - Customer interactions
 */

export class FridayAITestDataGenerator {
  // Generate realistic Danish business emails
  static generateEmails(count: number = 5) {
    const emailTemplates = [
      {
        from: "jensen@kontor.dk",
        subject: "Prisforespørgsel - kontorrengøring",
        body: "Kære Rendetalje,\n\nVi er en virksomhed med 200m2 kontorlokaler i København og ønsker et tilbud på ugentlig rengøring. Kan I give os en pris?\n\nMed venlig hilsen\nJensen Kontor",
        type: "pricing",
      },
      {
        from: "maria@bioferm.dk",
        subject: "Booking - vinduespudsning",
        body: "Hej Rendetalje,\n\nVi ønsker at booke vinduespudsning på fredag mellem 9-12. Har I ledigt?\n\nHilsen Maria\nBioferm",
        type: "booking",
      },
      {
        from: "kunde@billig.dk",
        subject: "Klage over rengøring",
        body: "Hej,\n\nVi er utilfredse med rengøringen i går. Gulvene er ikke rene og badeværelset mangler opmærksomhed. Venligst kom og ret det.\n\nUtilfreds kunde",
        type: "complaint",
      },
      {
        from: "info@nycirkel.dk",
        subject: "Møde om rengøringsaftale",
        body: "Kære Rendetalje,\n\nVi vil gerne mødes for at drøfte en længerevarende rengøringsaftale for vores 3 afdelinger. Hvornår har I tid?\n\nMed venlig hilsen\nNY Cirkel",
        type: "meeting",
      },
      {
        from: "økonomi@firma.dk",
        subject: "Spørgsmål om faktura",
        body: "Hej,\n\nJeg har modtaget faktura #12345 men kan ikke genkende ydelsen. Kan I sende specifikation?\n\nHilsen Økonomiafdelingen",
        type: "invoice",
      },
    ];

    const emails = [];
    for (let i = 0; i < count; i++) {
      const template = emailTemplates[i % emailTemplates.length];
      emails.push({
        id: `email-${i + 1}`,
        ...template,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        read: Math.random() > 0.5,
        important: Math.random() > 0.7,
      });
    }

    return emails;
  }

  // Generate realistic calendar events
  static generateCalendarEvents(count: number = 5) {
    const eventTemplates = [
      {
        title: "Kontorrengøring - Jensen AS",
        startTime: "09:00",
        endTime: "11:00",
        location: "København Ø, Strandvejen 123",
        type: "cleaning",
        customer: "Jensen AS",
      },
      {
        title: "Hovedrengøring - Bioferm",
        startTime: "13:00",
        endTime: "15:30",
        location: "Frederiksberg, Smallegade 45",
        type: "deep_cleaning",
        customer: "Bioferm",
      },
      {
        title: "Vinduespudsning - NY Cirkel",
        startTime: "16:00",
        endTime: "17:00",
        location: "Valby, Toftegårds Plads 1",
        type: "window_cleaning",
        customer: "NY Cirkel",
      },
      {
        title: "Møde - ny kunde",
        startTime: "10:00",
        endTime: "11:00",
        location: "Online - Teams",
        type: "meeting",
        customer: "Potentiel kunde",
      },
      {
        title: "Opfølgning - eksisterende kunde",
        startTime: "14:00",
        endTime: "14:30",
        location: "Telefon",
        type: "followup",
        customer: "Eksisterende kunde",
      },
    ];

    const events = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const template = eventTemplates[i % eventTemplates.length];
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + Math.floor(Math.random() * 7) - 3); // ±3 days

      events.push({
        id: `event-${i + 1}`,
        ...template,
        date: eventDate.toISOString().split("T")[0],
        priority: Math.random() > 0.7 ? "high" : "normal",
        status: Math.random() > 0.8 ? "completed" : "pending",
      });
    }

    return events;
  }

  // Generate realistic customer data
  static generateCustomers(count: number = 10) {
    const firstNames = [
      "Lars",
      "Mette",
      "Jens",
      "Anne",
      "Peter",
      "Helle",
      "Morten",
      "Susanne",
      "Thomas",
      "Camilla",
    ];
    const lastNames = [
      "Hansen",
      "Jensen",
      "Nielsen",
      "Pedersen",
      "Andersen",
      "Christensen",
      "Larsen",
      "Sørensen",
      "Rasmussen",
      "Jørgensen",
    ];
    const companyNames = ["A/S", "ApS", "I/S", "K/S", "IVS"];
    const cities = [
      "København",
      "Aarhus",
      "Odense",
      "Aalborg",
      "Esbjerg",
      "Randers",
      "Kolding",
      "Horsens",
      "Vejle",
      "Roskilde",
    ];

    const customers = [];

    for (let i = 0; i < count; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const company =
        companyNames[Math.floor(Math.random() * companyNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      customers.push({
        id: `customer-${i + 1}`,
        name: `${firstName} ${lastName}`,
        company: `${firstName} ${lastName} ${company}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace("/", "")}.dk`,
        phone: `+45 20${Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")}`,
        address: `${Math.floor(Math.random() * 999) + 1} ${["Vej", "Gade", "Allé", "Plads"][Math.floor(Math.random() * 4)]}`,
        city: city,
        zipCode: `${Math.floor(Math.random() * 9000) + 1000}`,
        customerType: ["business", "residential", "corporate"][
          Math.floor(Math.random() * 3)
        ],
        status: ["active", "inactive", "prospect"][
          Math.floor(Math.random() * 3)
        ],
        value: Math.floor(Math.random() * 50000) + 5000, // 5k-55k DKK/month
        joinDate: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return customers;
  }

  // Generate realistic conversation scenarios
  static generateConversationScenarios() {
    return [
      {
        name: "New Customer Inquiry",
        userMessage: "Hej Friday, jeg er ny kunde. Hvad kan du hjælpe med?",
        expectedIntent: "introduction",
        expectedTopics: ["services", "pricing", "booking"],
        context: {},
      },
      {
        name: "Email Summary Request",
        userMessage: "Opsummer mine vigtige emails i dag",
        expectedIntent: "email_summary",
        expectedTopics: ["emails", "priorities", "actions"],
        context: { hasEmails: true },
      },
      {
        name: "Calendar Scheduling",
        userMessage: "Find en ledig tid på onsdag til kundemøde",
        expectedIntent: "scheduling",
        expectedTopics: ["calendar", "availability", "booking"],
        context: { hasCalendar: true },
      },
      {
        name: "Invoice Status Check",
        userMessage: "Hvilke fakturaer skal følges op på?",
        expectedIntent: "invoice_status",
        expectedTopics: ["invoices", "payments", "followup"],
        context: { hasInvoices: true },
      },
      {
        name: "Business Advice",
        userMessage: "Hvordan kan jeg forbedre min rengøringsvirksomhed?",
        expectedIntent: "business_advice",
        expectedTopics: ["optimization", "growth", "efficiency"],
        context: {},
      },
      {
        name: "Customer Complaint",
        userMessage: "En kunde klager over rengøringen. Hvad skal jeg gøre?",
        expectedIntent: "complaint_handling",
        expectedTopics: ["customer service", "quality", "resolution"],
        context: {},
      },
      {
        name: "Lead Generation",
        userMessage: "Find nye potentielle kunder i København",
        expectedIntent: "lead_generation",
        expectedTopics: ["leads", "prospects", "marketing"],
        context: {},
      },
      {
        name: "Staff Scheduling",
        userMessage: "Hvordan skal jeg planlægge medarbejdere næste uge?",
        expectedIntent: "staff_scheduling",
        expectedTopics: ["staffing", "planning", "optimization"],
        context: {},
      },
    ];
  }

  // Generate AI test prompts for quality validation
  static generateQualityTestPrompts() {
    return [
      {
        category: "Danish Language",
        prompts: [
          "Skriv en professionel email til en ny kunde",
          "Forklar dine ydelser på dansk",
          "Hvad koster det at rengøre et kontor på 150m2?",
        ],
      },
      {
        category: "Business Context",
        prompts: [
          "Analyser min forretning og giv forslag til forbedring",
          "Hvordan kan jeg øge min omsætning?",
          "Optimer mine rengøringsruter",
        ],
      },
      {
        category: "Task Completion",
        prompts: [
          "Book et møde med Jens Hansen på tirsdag",
          "Send en faktura til Maria Jensen",
          "Opsummer dagens vigtigste opgaver",
        ],
      },
      {
        category: "Context Awareness",
        prompts: [
          "Brug de valgte emails til at lave en handlingsplan",
          "Tjek kalenderen og foreslå optimale tider",
          "Analyser de seneste fakturaer og find forsinkede betalinger",
        ],
      },
    ];
  }

  // Generate performance test scenarios
  static generatePerformanceTests() {
    return [
      {
        name: "Rapid Fire Messages",
        description: "Send 10 messages quickly and measure response times",
        messages: Array(10).fill("Test besked"),
        expectedAvgResponseTime: 5000, // 5 seconds
        expectedSuccessRate: 1.0, // 100%
      },
      {
        name: "Long Message Processing",
        description: "Send very long messages and test processing",
        messages: [
          "Dette er en meget lang besked der tester om Friday AI kan håndtere komplekse anmodninger med mange detaljer om rengøring, kunder, booking, fakturering og forretningsstrategi. ".repeat(
            10
          ),
        ],
        expectedAvgResponseTime: 8000,
        expectedSuccessRate: 1.0,
      },
      {
        name: "Context Switching",
        description: "Test switching between different contexts",
        messages: [
          "Tjek min kalender",
          "Opsummer mine emails",
          "Vis mig fakturaer",
          "Find nye kunder",
          "Book et møde",
        ],
        expectedAvgResponseTime: 6000,
        expectedSuccessRate: 1.0,
      },
    ];
  }
}

// Export for use in tests
export default FridayAITestDataGenerator;
