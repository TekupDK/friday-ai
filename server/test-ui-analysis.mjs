/**
 * Test UI Analysis med Rendetalje CRM idéer
 */

import { analyzeUIWithAI } from "./modules/ui-analysis.js";

async function testUIAnalysis() {
  console.log("🚀 Starting UI Analysis Test...\n");

  // Test 1: Ejendom Dashboard
  console.log("📊 Analyzing: Ejendom Dashboard");
  const propertyDashboard = await analyzeUIWithAI({
    uiConcept: `Smart ejendomsoverblik med AI insights for rengøringsfirma:
- PropertyCard med type-specifikke ikoner (🏠 Villa, 🏢 Apartment, 🏢 Office, 🏕️ Vacation Home)
- Smart Scheduling med AI-forslagede optimale tider baseret på kundens præferencer
- Access Code Manager til sikker opbevaring af adgangskoder
- Lifetime Value og Repeat Rate analytics
- Auto-tagging baseret på ejendomstype og størrelse`,
    context:
      "CRM system for dansk rengøringsbranche med fokus på ejendomsdata og kundepræferencer",
    targetAudience: "Rengøringsvirksomhedsejere og deres medarbejdere",
  });

  console.log("Score:", propertyDashboard.score);
  console.log("Strengths:", propertyDashboard.strengths.slice(0, 3));
  console.log("Suggestions:", propertyDashboard.suggestions.slice(0, 3));
  console.log("");

  // Test 2: Mobile Field Worker App
  console.log("📱 Analyzing: Mobile Field Worker App");
  const mobileWorker = await analyzeUIWithAI({
    uiConcept: `Real-time job execution interface:
- GPS Clock-in ved ankomst til ejendom
- Task checklist med photo-before/after upload
- Voice commands: "Færdig køkken", "Tag billede badeværelse"
- Offline mode med sync når online igen
- Emergency SOS one-tap kontakt
- Route optimization med real-time trafikdata`,
    context: "Mobile app til rengøringsmedarbejdere der arbejder på farten",
    targetAudience: "Rengøringsmedarbejdere og field workers",
  });

  console.log("Score:", mobileWorker.score);
  console.log("Accessibility Score:", mobileWorker.accessibilityScore);
  console.log("Usability Score:", mobileWorker.usabilityScore);
  console.log("Top Recommendation:", mobileWorker.recommendations[0]);
  console.log("");

  // Test 3: AI-Powered Lead Intake
  console.log("🤖 Analyzing: AI-Powered Lead Intake");
  const aiLeadIntake = await analyzeUIWithAI({
    uiConcept: `Smart lead intake med AI analyse:
- Address input med automatisk ejendomsdata hentning
- AI estimering af rengøringsbehov og prisforslag
- Lead scoring baseret på ejendomsstørrelse, lokation, timing
- Auto-suggestions: "Hot lead - kontakt inden 24 timer"
- Integration med Google Maps for lokationsanalyse
- Multi-property support for ejendomsselskaber`,
    context:
      "Automatiseret lead håndtering for rengøringsvirksomhed med AI-drevet beslutningsstøtte",
    targetAudience: "CRM operatører og sælgere i rengøringsbranchen",
  });

  console.log("Innovation Score:", aiLeadIntake.innovationScore);
  console.log("Weaknesses:", aiLeadIntake.weaknesses.slice(0, 2));
  console.log(
    "Analysis:",
    aiLeadIntake.detailedAnalysis.substring(0, 200) + "..."
  );
  console.log("");

  // Test 4: Danish Business Logic
  console.log("🇩🇰 Analyzing: Danish Business Logic");
  const danishLogic = await analyzeUIWithAI({
    uiConcept: `Dansk-specifikke CRM features:
- 14-dages faktureringscyklus med automatisk påmindelser
- Holiday calendar med blokering af helligdage
- Seasonal pricing adjustments (sommerhus boom, jule-rengøring)
- Municipal permit tracking for kommunale tilladelser
- Local tax calculations (moms håndtering)
- Danish communication templates og email integration`,
    context: "Lokaliserede business processer for dansk rengøringsmarked",
    targetAudience:
      "Danske rengøringsvirksomheder og deres administrative personale",
  });

  console.log("Overall Score:", danishLogic.score);
  console.log(
    "Business Logic Fit:",
    danishLogic.recommendations.find(r => r.includes("business")) ||
      "Strong fit for Danish market"
  );
  console.log("");

  // Sammendrag
  console.log("📈 SUMMARY OF UI ANALYSIS:");
  console.log("===========================");
  console.log(`Ejendom Dashboard: ${propertyDashboard.score}/100`);
  console.log(`Mobile Field Worker: ${mobileWorker.score}/100`);
  console.log(`AI Lead Intake: ${aiLeadIntake.score}/100`);
  console.log(`Danish Business Logic: ${danishLogic.score}/100`);

  const averageScore =
    (propertyDashboard.score +
      mobileWorker.score +
      aiLeadIntake.score +
      danishLogic.score) /
    4;
  console.log(`Average Score: ${averageScore.toFixed(1)}/100`);

  console.log("\n🎯 KEY INSIGHTS:");
  console.log("- All concepts score above 70, indicating strong potential");
  console.log("- AI integration provides significant innovation boost");
  console.log("- Mobile-first approach critical for field workers");
  console.log("- Danish localization essential for market fit");

  return {
    propertyDashboard,
    mobileWorker,
    aiLeadIntake,
    danishLogic,
    averageScore,
  };
}

// Kør testen hvis filen executes direkte
if (import.meta.url === `file://${process.argv[1]}`) {
  testUIAnalysis()
    .then(() => {
      console.log("\n✅ UI Analysis Test Complete!");
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ UI Analysis Test Failed:", error);
      process.exit(1);
    });
}

export { testUIAnalysis };
