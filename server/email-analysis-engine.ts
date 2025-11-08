/**
 * Phase 9.9: Intelligent Email Assistant
 * 
 * Shortwave-inspired email suggestion system
 * AI generates suggestions, human chooses and sends
 */

import { detectLeadSourceIntelligent } from "./lead-source-detector";
import { getWorkflowFromDetection } from "./lead-source-workflows";
// BUSINESS_CONSTANTS vil blive implementeret senere

export interface EmailSuggestion {
  id: string;
  title: string;
  content: string;
  confidence: number;
  source: string;
  category: "quote" | "question" | "information" | "booking";
  metadata: {
    estimatedPrice?: number;
    estimatedHours?: string;
    proposedTime?: string;
    jobType?: string;
    location?: string;
  };
  reasoning: string;
}

export interface EmailAnalysis {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  jobType: string;
  location: string;
  urgency: "high" | "medium" | "low";
  estimatedPrice: number;
  estimatedHours: string;
  specialRequirements: string[];
  sourceDetection: any;
}

/**
 * Phase 9.9: Email Analysis Engine
 * Analyzes incoming email and extracts key information
 */
export class EmailAnalysisEngine {
  
  /**
   * Analyze email content and extract business-relevant information
   */
  analyzeEmail(emailData: {
    from: string;
    subject: string;
    body: string;
  }): EmailAnalysis {
    const { from, subject, body } = emailData;
    
    // Extract customer information
    const customerName = this.extractCustomerName(from);
    const customerEmail = this.extractCustomerEmail(from);
    const customerPhone = this.extractPhoneFromEmail(body);
    
    // Detect job type
    const jobType = this.detectJobType(subject, body);
    
    // Extract location
    const location = this.extractLocation(subject, body);
    
    // Assess urgency
    const urgency = this.assessUrgency(subject, body);
    
    // Calculate estimates
    const { estimatedPrice, estimatedHours } = this.calculateEstimates(jobType, body);
    
    // Extract special requirements
    const specialRequirements = this.extractSpecialRequirements(subject, body);
    
    // Source detection
    const sourceDetection = detectLeadSourceIntelligent({
      from,
      to: "",
      subject,
      body,
    });

    return {
      customerName,
      customerEmail,
      customerPhone,
      jobType,
      location,
      urgency,
      estimatedPrice,
      estimatedHours,
      specialRequirements,
      sourceDetection,
    };
  }

  /**
   * Generate email suggestions based on analysis
   */
  generateSuggestions(analysis: EmailAnalysis): EmailSuggestion[] {
    const suggestions: EmailSuggestion[] = [];
    const workflow = getWorkflowFromDetection(analysis.sourceDetection);
    
    // Generate quote suggestion
    suggestions.push(this.generateQuoteSuggestion(analysis, workflow));
    
    // Generate information request suggestion
    suggestions.push(this.generateInformationSuggestion(analysis, workflow));
    
    // Generate booking suggestion
    suggestions.push(this.generateBookingSuggestion(analysis, workflow));
    
    // Generate custom suggestions based on source
    const customSuggestions = this.generateSourceSpecificSuggestions(analysis, workflow);
    suggestions.push(...customSuggestions);
    
    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate price quote suggestion
   */
  private generateQuoteSuggestion(analysis: EmailAnalysis, workflow: any): EmailSuggestion {
    const { customerName, jobType, location, estimatedPrice, estimatedHours } = analysis;
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din henvendelse vedrørende ${jobType} i ${location}.\n\n`;
    
    // Source-specific content
    switch (analysis.sourceDetection.source) {
      case "rengoring_nu":
        content += `Vi har modtaget din forespørgsel via Rengøring.nu og vil gerne give dig et uforpligtende tilbud.\n\n`;
        break;
      case "rengoring_aarhus":
        content += `Vi har modtaget din forespørgsel via Leadpoint og ser frem til at hjælpe dig med rengøring i Aarhus området.\n\n`;
        break;
      case "website":
        content += `Tak for din interesse i Rendetalje.dk. Vi er specialister i professionel rengøring og vil gerne give dig et tilbud.\n\n`;
        break;
      default:
        content += `Tak for din henvendelse. Vi vil gerne give dig et uforpligtende tilbud på ${jobType}.\n\n`;
    }
    
    content += `**Prisoverslag:**\n`;
    content += `- Opgavetype: ${jobType}\n`;
    content += `- Estimeret tid: ${estimatedHours}\n`;
    content += `- Pris: ${estimatedPrice} kr. ekskl. moms\n\n`;
    
    content += `Dette prisoverslag er baseret på den information, du har givet. Endelig pris kan variere afhængigt af opgavens konkrete omfang.\n\n`;
    
    content += `Hvis du ønsker at gå videre, kan vi tilbyde følgende:\n`;
    content += `- Gratis besigtigelse og endeligt tilbud\n`;
    content += `- Fleksibel booking, inkl. weekender\n`;
    content += `- Forsikring og garanti\n\n`;
    
    content += `Jeg vil gerne høre mere om dine specifikke behov, så vi kan give dig det bedst mulige tilbud.\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `[Dit Navn]\n`;
    content += `Rendetalje.dk\n`;
    content += `Telefon: [Dit Telefonnummer]\n`;

    return {
      id: "quote-suggestion",
      title: "Send prisoverslag",
      content,
      confidence: 85,
      source: analysis.sourceDetection.source,
      category: "quote",
      metadata: {
        estimatedPrice,
        estimatedHours,
        jobType,
        location,
      },
      reasoning: `Standard prisoverslag baseret på ${jobType} med ${estimatedHours} estimeret tid`,
    };
  }

  /**
   * Generate information request suggestion
   */
  private generateInformationSuggestion(analysis: EmailAnalysis, workflow: any): EmailSuggestion {
    const { customerName, jobType, location } = analysis;
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din henvendelse vedrørende ${jobType} i ${location}.\n\n`;
    content += `For at kunne give dig det mest præcise tilbud, har jeg brug for lidt mere information:\n\n`;
    
    content += `**Spørgsmål:**\n`;
    content += `1. Hvor stort er arealet (i m²)?\n`;
    content += `2. Hvor ofte skal rengøringen udføres? (engang, ugentligt, månedligt)\n`;
    content += `3. Er der særlige områder, der kræver ekstra opmærksomhed?\n`;
    content += `4. Ønskes rengøring af udstyr (gulve, vinduer, badeværelser)?\n`;
    content += `5. Er der adgang til parkering ved adressen?\n\n`;
    
    content += `Når jeg har disse informationer, kan jeg give dig et detaljeret og uforpligtende tilbud.\n\n`;
    content += `Du kan også sende billeder af området, så kan jeg vurdere opgaven endnu bedre.\n\n`;
    content += `Jeg ser frem til at høre fra dig!\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `[Dit Navn]\n`;
    content += `Rendetalje.dk\n`;

    return {
      id: "info-suggestion",
      title: "Bed om mere information",
      content,
      confidence: 75,
      source: analysis.sourceDetection.source,
      category: "question",
      metadata: {
        jobType,
        location,
      },
      reasoning: "Information request for better quote accuracy",
    };
  }

  /**
   * Generate booking suggestion
   */
  private generateBookingSuggestion(analysis: EmailAnalysis, workflow: any): EmailSuggestion {
    const { customerName, jobType, location, estimatedHours } = analysis;
    
    // Calculate proposed time based on urgency
    let proposedTime = "";
    switch (analysis.urgency) {
      case "high":
        proposedTime = "i morgen eller overmorgen";
        break;
      case "medium":
        proposedTime = "næste uge";
        break;
      case "low":
        proposedTime = "inden for 2-3 uger";
        break;
    }
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din henvendelse vedrørende ${jobType} i ${location}.\n\n`;
    content += `Vi har ledige kapacitet og kan tilbyde at udføre opgaven ${proposedTime}.\n\n`;
    
    content += `**Forslag til tidspunkt:**\n`;
    content += `- Ugedage: 8:00 - 17:00\n`;
    content += `- Lørdage: 9:00 - 14:00\n`;
    content += `- Estimeret varighed: ${estimatedHours}\n\n`;
    
    content += `Hvis disse tidspunkter passer dig, kan jeg reservere tiden med det samme. \n`;
    content += `Ellers kan vi finde et andet tidspunkt, der passer bedre i din kalender.\n\n`;
    
    content += `For at booke opgaven beder jeg dig bekræfte:\n`;
    content += `1. Ønsket dato og tidspunkt\n`;
    content += `2. Adresse (hvis ikke allerede angivet)\n`;
    content += `3. Kontaktoplysninger (telefonnummer)\n\n`;
    
    content += `Jeg ser frem til at hjælpe dig med ${jobType}!\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `[Dit Navn]\n`;
    content += `Rendetalje.dk\n`;

    return {
      id: "booking-suggestion",
      title: "Foreslå booking tidspunkt",
      content,
      confidence: 70,
      source: analysis.sourceDetection.source,
      category: "booking",
      metadata: {
        estimatedHours,
        proposedTime,
        jobType,
        location,
      },
      reasoning: `Booking suggestion based on ${analysis.urgency} urgency and availability`,
    };
  }

  /**
   * Generate source-specific suggestions
   */
  private generateSourceSpecificSuggestions(analysis: EmailAnalysis, workflow: any): EmailSuggestion[] {
    const suggestions: EmailSuggestion[] = [];
    
    switch (analysis.sourceDetection.source) {
      case "rengoring_nu":
        suggestions.push(this.generateRengoringNuSuggestion(analysis));
        break;
      case "rengoring_aarhus":
        suggestions.push(this.generateRengoringAarhusSuggestion(analysis));
        break;
      case "website":
        suggestions.push(this.generateWebsiteSuggestion(analysis));
        break;
    }
    
    return suggestions;
  }

  /**
   * Rengøring.nu specific suggestion
   */
  private generateRengoringNuSuggestion(analysis: EmailAnalysis): EmailSuggestion {
    const { customerName, estimatedPrice } = analysis;
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din interesse via Rengøring.nu. Vi er en lokal rengøringsvirksomhed med mange års erfaring.\n\n`;
    content += `Som kunde via Rengøring.nu får du:\n`;
    content += `- Fast lav pris: ${estimatedPrice} kr./time\n`;
    content += `- Ingen skjulte gebyrer\n`;
    content += `- Forsikring og garanti\n`;
    content += `- Fleksibel aftale\n\n`;
    content += `Vi kan normalt starte inden for 3-5 hverdage. Er det noget for dig?\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `Rendetalje.dk`;

    return {
      id: "rengoring-nu-special",
      title: "Rengøring.nu tilbud",
      content,
      confidence: 90,
      source: "rengoring_nu",
      category: "quote",
      metadata: {
        estimatedPrice,
      },
      reasoning: "Specialtilbud til Rengøring.nu kunder med fast pris",
    };
  }

  /**
   * Rengøring Aarhus specific suggestion
   */
  private generateRengoringAarhusSuggestion(analysis: EmailAnalysis): EmailSuggestion {
    const { customerName, location } = analysis;
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din henvendelse vedrørende rengøring i Aarhus. Vi dækker hele Aarhus kommune.\n\n`;
    content += `Vi har stor erfaring med:\n`;
    content += `- Erhvervsrengøring i Aarhus C\n`;
    content += `- Privat rengøring i alle bydele\n`;
    content += `- Flytterengøring i Aarhus området\n`;
    content += `- Hovedrengøring og vedligeholdelse\n\n`;
    content += `Aarhus priser starter fra 450 kr./time for privat og 550 kr./time for erhverv.\n\n`;
    content += `Hvilken type rengøring søger du i ${location}?\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `Rendetalje.dk`;

    return {
      id: "aarhus-special",
      title: "Aarhus specialtilbud",
      content,
      confidence: 85,
      source: "rengoring_aarhus",
      category: "information",
      metadata: {
        location,
      },
      reasoning: "Specialiseret tilbud til Aarhus område med lokale priser",
    };
  }

  /**
   * Website specific suggestion
   */
  private generateWebsiteSuggestion(analysis: EmailAnalysis): EmailSuggestion {
    const { customerName } = analysis;
    
    let content = `Kære ${customerName},\n\n`;
    content += `Tak for din henvendelse via vores hjemmeside rendetalje.dk. Vi er glade for din interesse!\n\n`;
    content += `Som direkte kunde via vores hjemmeside får du:\n`;
    content += `- Personlig service og rådgivning\n`;
    content += `- Konkurrencedygtige priser uden mellemmand\n`;
    content += `- Fleksible løsninger skræddersyet til dine behov\n`;
    content += `- Lokal service med hurtig respons\n\n`;
    content += `Jeg vil gerne ringe dig op for en uforpligtende snak om dine behov. `;
    content += `Hvornår passer det dig godt?\n\n`;
    content += `Med venlig hilsen,\n`;
    content += `Rendetalje.dk`;

    return {
      id: "website-special",
      title: "Personlig opfølgning",
      content,
      confidence: 80,
      source: "website",
      category: "information",
      metadata: {},
      reasoning: "Personlig service til direkte henvendelser via hjemmeside",
    };
  }

  // Helper methods for email analysis
  private extractCustomerName(from: string): string {
    const match = from.match(/^(.+?)\s*</);
    return match ? match[1].trim().replace(/['"]/g, "") : "Kunde";
  }

  private extractCustomerEmail(from: string): string {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  }

  private extractPhoneFromEmail(body: string): string | undefined {
    const phoneRegex = /(\+45|45)?\s*[2-9]\d{7}/g;
    const match = body.match(phoneRegex);
    return match ? match[0].replace(/\s/g, "") : undefined;
  }

  private detectJobType(subject: string, body: string): string {
    const text = (subject + " " + body).toLowerCase();
    
    if (text.includes("flytte") || text.includes("flytterengøring")) {
      return "Flytterengøring";
    } else if (text.includes("hovedrengøring") || text.includes("grundrengøring")) {
      return "Hovedrengøring";
    } else if (text.includes("vinduespudsning") || text.includes("vinduer")) {
      return "Vinduespudsning";
    } else if (text.includes("trappevask") || text.includes("trappe")) {
      return "Trappevask";
    } else if (text.includes("erhverv") || text.includes("kontor")) {
      return "Erhvervsrengøring";
    } else {
      return "Almindelig rengøring";
    }
  }

  private extractLocation(subject: string, body: string): string {
    const text = subject + " " + body;
    
    // Extract city names
    const cityMatch = text.match(/(Aarhus|Århus|København|Odense|Aalborg|Esbjerg|Randers|Kolding|Horsens|Vejle|Roskilde|Hillerød|Helsingør|Frederiksberg|Gentofte|Lyngby|Virum|Holte|Ballerup|Herlev|Gladsaxe|Rødovre|Hvidovre|Brøndby|Glostrup|Albertslund|Taastrup|Høje Taastrup|Ishøj|Vallensbæk|Greve|Solrød|Køge|Ringsted|Næstved|Slagelse|Kalundborg|Holbæk|Roskilde|Frederikssund|Hillerød|Helsingør|Hørsholm|Rudersdal|Gentofte|Lyngby-Taarbæk|Gladsaxe|Herlev|Ballerup|Furesø|Allerød|Egedal|Rødovre|Hvidovre|Brøndby|Vallensbæk|Ishøj|Høje-Taastrup|Greve|Solrød|Køge|Faxe|Næstved|Vordingborg|Guldborgsund|Lolland|Falster)/i);
    
    if (cityMatch) {
      return cityMatch[1];
    }
    
    // Extract postal codes
    const postalMatch = text.match(/\b(1[0-4]\d{3}|[2-9]\d{3})\b/);
    if (postalMatch) {
      return `Postnummer ${postalMatch[1]}`;
    }
    
    return "Ikke specificeret";
  }

  private assessUrgency(subject: string, body: string): "high" | "medium" | "low" {
    const text = (subject + " " + body).toLowerCase();
    
    if (text.includes("haster") || text.includes("akut") || text.includes("hurtigst muligt") || text.includes("i dag")) {
      return "high";
    } else if (text.includes("snart") || text.includes("næste uge") || text.includes("inden længe")) {
      return "medium";
    } else {
      return "low";
    }
  }

  private calculateEstimates(jobType: string, body: string): { estimatedPrice: number; estimatedHours: string } {
    const basePrices = {
      "Flytterengøring": { price: 2500, hours: "4-6 timer" },
      "Hovedrengøring": { price: 1800, hours: "3-4 timer" },
      "Vinduespudsning": { price: 800, hours: "1-2 timer" },
      "Trappevask": { price: 1200, hours: "2-3 timer" },
      "Erhvervsrengøring": { price: 550, hours: "pr. time" },
      "Almindelig rengøring": { price: 1500, hours: "2-3 timer" },
    };

    const estimate = basePrices[jobType as keyof typeof basePrices] || basePrices["Almindelig rengøring"];
    
    return {
      estimatedPrice: estimate.price,
      estimatedHours: estimate.hours,
    };
  }

  private extractSpecialRequirements(subject: string, body: string): string[] {
    const text = (subject + " " + body).toLowerCase();
    const requirements: string[] = [];
    
    if (text.includes("kælder") || text.includes("basement")) requirements.push("Kælder");
    if (text.includes("loft") || text.includes("attic")) requirements.push("Loft");
    if (text.includes("garage")) requirements.push("Garage");
    if (text.includes("have") || text.includes("garden")) requirements.push("Have");
    if (text.includes("børn") || text.includes("children")) requirements.push("Børnevenlig rengøring");
    if (text.includes("dyr") || text.includes("pet") || text.includes("hund") || text.includes("kat")) requirements.push("Dyrevenlig rengøring");
    if (text.includes("allergi") || text.includes("allergy")) requirements.push("Allergivenlig rengøring");
    
    return requirements;
  }
}

// Singleton instance
export const emailAnalysisEngine = new EmailAnalysisEngine();
