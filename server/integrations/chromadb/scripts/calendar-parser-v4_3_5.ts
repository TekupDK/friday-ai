/**
 * V4.3.5: Hybrid Calendar Event Parser
 * 
 * Intelligent parsing with AI fallback to regex extraction
 */

import { parseCalendarEventWithAI, AICalendarParsing } from './ai-calendar-parser';

// ============================================================================
// REGEX-BASED FALLBACK PARSER
// ============================================================================

function parseWithRegex(summary: string, description: string): AICalendarParsing {
  const desc = description || '';
  
  // Extract customer name
  let customerName: string | null = null;
  const nameMatch = desc.match(/(?:Kunde|👤 Kunde):\s*([^\n]+)/i);
  if (nameMatch) {
    customerName = nameMatch[1].trim();
  } else {
    // Try from summary: "Name - Service"
    const summaryMatch = summary.match(/[-–]\s*([^#]+?)(?:\s*#|$)/);
    if (summaryMatch) {
      customerName = summaryMatch[1].trim();
    }
  }

  // Extract email
  let email: string | null = null;
  const emailMatch = desc.match(/(?:📧\s*Email:|Kontakt:.*?)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) {
    email = emailMatch[1].trim();
  }

  // Extract phone
  let phone: string | null = null;
  const phoneMatch = desc.match(/(?:📞\s*Tlf:|📞\s*Telefon:|Kontakt:.*?)(\d[\d\s]{7,})/);
  if (phoneMatch) {
    phone = phoneMatch[1].replace(/\s+/g, '');
  }

  // Extract address
  let address: string | null = null;
  const addressMatch = desc.match(/(?:🏠\s*)?Adresse:\s*([^\n]+)/i);
  if (addressMatch) {
    address = addressMatch[1].trim();
  }

  // Extract property size
  let propertySize: number | null = null;
  const sizeMatch = desc.match(/(?:Størrelse:|Size:)?\s*(\d+)\s*m²/i);
  if (sizeMatch) {
    propertySize = parseInt(sizeMatch[1], 10);
  }

  // Extract property type
  let propertyType: string | null = null;
  if (desc.match(/lejlighed/i)) propertyType = 'lejlighed';
  else if (desc.match(/hus/i)) propertyType = 'hus';
  else if (desc.match(/rækkehus/i)) propertyType = 'rækkehus';

  // Extract service type
  let serviceType: string | null = null;
  if (summary.match(/FAST\s+RENGØRING/i) || desc.match(/fast.*rengøring/i)) serviceType = 'fast';
  else if (summary.match(/FLYTTERENGØRING/i) || desc.match(/flytterengøring/i)) serviceType = 'flytter';
  else if (summary.match(/HOVEDRENGØRING/i) || desc.match(/hovedrengøring/i)) serviceType = 'hoved';
  else if (summary.match(/INTRODUKTION/i)) serviceType = 'introduktion';

  // Extract frequency
  let frequency: string | null = null;
  if (desc.match(/hver\s+14\.?\s*dag|biweekly|hver\s+anden\s+uge/i)) frequency = 'biweekly';
  else if (desc.match(/hver\s+uge|ugentlig|weekly/i)) frequency = 'weekly';
  else if (desc.match(/hver\s+3\.?\s*uge|hver\s+tredje\s+uge/i)) frequency = 'triweekly';
  else if (desc.match(/månedlig|monthly|hver\s+måned/i)) frequency = 'monthly';
  else if (serviceType === 'flytter' || serviceType === 'hoved') frequency = 'one-time';

  // Extract estimated hours
  let estimatedHours: number | null = null;
  const hoursMatch = desc.match(/(?:Estimeret tid:|⏱️.*?)(\d+(?:[,\.]\d+)?)\s*(?:-\s*(\d+(?:[,\.]\d+)?))?\s*timer?/i);
  if (hoursMatch) {
    const h1 = parseFloat(hoursMatch[1].replace(',', '.'));
    const h2 = hoursMatch[2] ? parseFloat(hoursMatch[2].replace(',', '.')) : h1;
    estimatedHours = (h1 + h2) / 2;
  }

  // Extract estimated price
  let estimatedPrice: number | null = null;
  const priceMatch = desc.match(/(?:Pris:|💰.*?)(\d+(?:\.\d+)?(?:,\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?(?:,\d+)?))?\s*kr/i);
  if (priceMatch) {
    const p1 = parseFloat(priceMatch[1].replace('.', '').replace(',', '.'));
    const p2 = priceMatch[2] ? parseFloat(priceMatch[2].replace('.', '').replace(',', '.')) : p1;
    estimatedPrice = (p1 + p2) / 2;
  }

  // Extract number of workers
  let numberOfWorkers: number | null = null;
  const workersMatch = desc.match(/(?:Medarbejdere?:|Team:)\s*(\d+)/i);
  if (workersMatch) {
    numberOfWorkers = parseInt(workersMatch[1], 10);
  }

  // Extract booking number
  let bookingNumber: number | null = null;
  const bookingMatch = summary.match(/#(\d+)/);
  if (bookingMatch) {
    bookingNumber = parseInt(bookingMatch[1], 10);
  }

  // Detect quality signals
  const hasComplaints = desc.match(/klage|complaint|ikke\s+tilfredsstillende|problem/i) !== null;
  const hasSpecialNeeds = desc.match(/SPECIALKRAV|VIGTIGT|special|særlig/i) !== null;
  const isRepeatBooking = bookingNumber !== null && bookingNumber > 1;

  // Determine customer type
  let customerType: 'standard' | 'premium' | 'problematic' | 'unknown' = 'standard';
  if (hasComplaints) customerType = 'problematic';
  else if (hasSpecialNeeds || (estimatedPrice && estimatedPrice > 2000)) customerType = 'premium';

  // Extract special requirements
  const specialRequirements: string[] = [];
  if (desc.match(/sæbespåner/i)) specialRequirements.push('sæbespåner');
  if (desc.match(/egen nøgle|nøglesæt/i)) specialRequirements.push('egen_nøgle');
  if (desc.match(/afkalkning|kalk/i)) specialRequirements.push('afkalkning');
  if (desc.match(/svanemærket/i)) specialRequirements.push('svanemærket');

  return {
    customer: {
      name: customerName,
      email,
      phone,
      address,
      propertySize,
      propertyType,
    },
    service: {
      type: serviceType,
      category: 'privatrengøring',
      frequency,
      estimatedHours,
      estimatedPrice,
      actualHours: null,
      actualPrice: null,
      numberOfWorkers,
    },
    specialRequirements,
    qualitySignals: {
      isRepeatBooking,
      bookingNumber,
      hasComplaints,
      hasSpecialNeeds,
      customerType,
      confidence: (customerName && email) ? 'high' : (customerName || email) ? 'medium' : 'low',
    },
    notes: null,
  };
}

// ============================================================================
// HYBRID PARSER
// ============================================================================

export async function parseCalendarEvent(
  summary: string,
  description: string,
  useAI: boolean = true
): Promise<AICalendarParsing> {
  if (useAI) {
    try {
      return await parseCalendarEventWithAI(summary, description);
    } catch (error: any) {
      console.warn(`   ⚠️  AI parsing failed, using regex fallback: ${error.message}`);
      return parseWithRegex(summary, description);
    }
  }
  
  return parseWithRegex(summary, description);
}

export { AICalendarParsing };
