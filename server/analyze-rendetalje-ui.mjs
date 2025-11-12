/**
 * UI Analyse af Rendetalje CRM Idéer
 * Kører AI-vurdering af vores UI koncepter
 */

import { analyzeUIWithAI } from "./modules/ui-analysis.ts";

async function analyzeRendetaljeUI() {
  console.log("🧠 ANALYSERER RENDETALJE CRM UI IDÉER MED AI\n");
  console.log("=".repeat(60) + "\n");

  // Vores 4 hoved UI koncepter
  const uiConcepts = [
    {
      name: "🏠 Ejendom Dashboard",
      concept: `Smart ejendomsoverblik med AI insights for rengøringsfirma:
- PropertyCard med type-specifikke ikoner (🏠 Villa, 🏢 Apartment, 🏢 Office, 🏕️ Vacation Home)
- Smart Scheduling med AI-forslagede optimale tider baseret på kundens præferencer
- Access Code Manager til sikker opbevaring af adgangskoder
- Lifetime Value og Repeat Rate analytics
- Auto-tagging baseret på ejendomstype og størrelse`,
      context:
        "CRM system for dansk rengøringsbranche med fokus på ejendomsdata og kundepræferencer",
      audience: "Rengøringsvirksomhedsejere og deres medarbejdere",
    },
    {
      name: "📱 Mobile Field Worker App",
      concept: `Real-time job execution interface:
- GPS Clock-in ved ankomst til ejendom
- Task checklist med photo-before/after upload
- Voice commands: "Færdig køkken", "Tag billede badeværelse"
- Offline mode med sync når online igen
- Emergency SOS one-tap kontakt
- Route optimization med real-time trafikdata`,
      context: "Mobile app til rengøringsmedarbejdere der arbejder på farten",
      audience: "Rengøringsmedarbejdere og field workers",
    },
    {
      name: "🤖 AI-Powered Lead Intake",
      concept: `Smart lead intake med AI analyse:
- Address input med automatisk ejendomsdata hentning
- AI estimering af rengøringsbehov og prisforslag
- Lead scoring baseret på ejendomsstørrelse, lokation, timing
- Auto-suggestions: "Hot lead - kontakt inden 24 timer"
- Integration med Google Maps for lokationsanalyse
- Multi-property support for ejendomsselskaber`,
      context:
        "Automatiseret lead håndtering for rengøringsvirksomhed med AI-drevet beslutningsstøtte",
      audience: "CRM operatører og sælgere i rengøringsbranchen",
    },
    {
      name: "🇩🇰 Danish Business Logic",
      concept: `Dansk-specifikke CRM features:
- 14-dages faktureringscyklus med automatisk påmindelser
- Holiday calendar med blokering af helligdage
- Seasonal pricing adjustments (sommerhus boom, jule-rengøring)
- Municipal permits tracking for kommunale tilladelser
- Local tax calculations (moms håndtering)
- Danish communication templates og email integration`,
      context: "Lokaliserede business processer for dansk rengøringsmarked",
      audience:
        "Danske rengøringsvirksomheder og deres administrative personale",
    },
  ];

  const results = [];

  for (const concept of uiConcepts) {
    console.log(`🔍 ANALYSERER: ${concept.name}`);
    console.log("-".repeat(40));

    try {
      const analysis = await analyzeUIWithAI({
        uiConcept: concept.concept,
        context: concept.context,
        targetAudience: concept.audience,
      });

      console.log(`📊 Score: ${analysis.score}/100`);
      console.log(`♿ Accessibility: ${analysis.accessibilityScore}/100`);
      console.log(`👥 Usability: ${analysis.usabilityScore}/100`);
      console.log(`🚀 Innovation: ${analysis.innovationScore}/100`);
      console.log("");

      console.log("✨ STRENGTHS:");
      analysis.strengths.forEach(strength => console.log(`  • ${strength}`));
      console.log("");

      console.log("⚠️ WEAKNESSES:");
      analysis.weaknesses.forEach(weakness => console.log(`  • ${weakness}`));
      console.log("");

      console.log("💡 TOP RECOMMENDATIONS:");
      analysis.recommendations
        .slice(0, 3)
        .forEach(rec => console.log(`  • ${rec}`));
      console.log("");

      console.log("🎯 ACTIONABLE SUGGESTIONS:");
      analysis.suggestions
        .slice(0, 3)
        .forEach(sug => console.log(`  • ${sug}`));
      console.log("");

      console.log("📝 ANALYSIS SUMMARY:");
      console.log(analysis.detailedAnalysis.substring(0, 300) + "...");
      console.log("");

      results.push({
        name: concept.name,
        analysis,
      });
    } catch (error) {
      console.error(`❌ Error analyzing ${concept.name}:`, error.message);
      results.push({
        name: concept.name,
        error: error.message,
      });
    }

    console.log("=".repeat(60) + "\n");
  }

  // Sammendrag
  console.log("🎊 ANALYSE SAMMENDRAG");
  console.log("=".repeat(30));

  const validResults = results.filter(r => !r.error);
  const avgScore =
    validResults.reduce((sum, r) => sum + r.analysis.score, 0) /
    validResults.length;

  console.log(`📈 Gennemsnitlig Score: ${avgScore.toFixed(1)}/100`);
  console.log(
    `✅ Koncepter Analyseret: ${validResults.length}/${uiConcepts.length}`
  );

  console.log("\n🏆 TOP PERFORMERS:");
  validResults
    .sort((a, b) => b.analysis.score - a.analysis.score)
    .forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}: ${result.analysis.score}/100`);
    });

  console.log("\n🚀 NEXT STEPS:");
  console.log("1. Implementer højst scorende koncepter først");
  console.log("2. Adresser identificerede weaknesses");
  console.log("3. Fokuser på accessibility forbedringer");
  console.log("4. Iterer baseret på AI anbefalinger");

  return results;
}

// Kør analysen
analyzeRendetaljeUI()
  .then(() => {
    console.log("\n✅ Rendetalje UI Analyse Fuldført!");
  })
  .catch(error => {
    console.error("❌ UI Analyse Fejlede:", error);
  });
