#!/usr/bin/env node
/**
 * Test LiteLLM with Real Lead Data
 * Tests with actual leads from rengøring.nu, Leadpoint, etc.
 *
 * IMPORTANT: READ ONLY - NO EMAILS WILL BE SENT!
 */

import "dotenv/config";
import pg from "pg";
const { Client } = pg;

const LITELLM_BASE_URL =
  process.env.LITELLM_BASE_URL || "http://localhost:4000";

console.log("🧪 Testing LiteLLM with REAL Lead Data\n");
console.log("⚠️  READ ONLY MODE - NO EMAILS WILL BE SENT!\n");

// Connect to database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For development with Supabase
  },
});

try {
  await client.connect();
  console.log("✅ Connected to database\n");

  // Get recent leads from specified sources
  const leadQuery = `
    SELECT 
      l.id,
      l.name,
      l.email,
      l.phone,
      l.source,
      l.service_type,
      l.notes,
      l.created_at,
      l.status
    FROM friday_ai.leads l
    WHERE l.source IN ('rengøring.nu', 'Rengøring Århus', 'Leadpoint', 'Netberrau')
      AND l.created_at > NOW() - INTERVAL '30 days'
    ORDER BY l.created_at DESC
    LIMIT 5
  `;

  const leadResult = await client.query(leadQuery);
  const leads = leadResult.rows;

  console.log(
    `📊 Found ${leads.length} recent leads from specified sources:\n`
  );

  if (leads.length === 0) {
    console.log("⚠️  No leads found from these sources in last 30 days");
    console.log(
      "   Sources searched: rengøring.nu, Rengøring Århus, Leadpoint, Netberrau\n"
    );
  }

  // Test each lead with different AI tasks
  for (const lead of leads) {
    console.log("=".repeat(70));
    console.log(`\n📝 Lead #${lead.id}: ${lead.name}`);
    console.log(`   Source: ${lead.source}`);
    console.log(`   Service: ${lead.service_type || "N/A"}`);
    console.log(`   Status: ${lead.status}`);
    console.log(
      `   Created: ${new Date(lead.created_at).toLocaleDateString("da-DK")}`
    );

    if (lead.notes) {
      console.log(
        `   Notes: ${lead.notes.substring(0, 100)}${lead.notes.length > 100 ? "..." : ""}`
      );
    }

    // Test 1: Lead Analysis
    console.log("\n   🤖 Test 1: Lead Analysis (via LiteLLM)");
    try {
      const analysisPrompt = `Analyser denne lead og vurder prioritet og næste skridt:
      
Kunde: ${lead.name}
Email: ${lead.email || "Ingen email"}
Telefon: ${lead.phone || "Ingen telefon"}
Service: ${lead.service_type || "Ikke specificeret"}
Kilde: ${lead.source}
Noter: ${lead.notes || "Ingen noter"}

Giv en kort analyse (max 150 ord) på dansk.`;

      const startTime = Date.now();
      const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openrouter/z-ai/glm-4.5-air:free",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.error) {
        console.log(`      ❌ Failed: ${data.error.message}`);
      } else {
        const analysis = data.choices[0].message.content;
        console.log(`      ✅ Success in ${responseTime}ms`);
        console.log(`      Analysis: ${analysis.substring(0, 150)}...`);
        console.log(
          `      Tokens: ${data.usage.total_tokens} | Cost: $${data.usage.cost || 0}`
        );
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }

    // Test 2: Email Draft (NOT SENT!)
    if (lead.email && lead.status !== "lost") {
      console.log("\n   📧 Test 2: Email Draft Generation (NOT SENT!)");
      try {
        const draftPrompt = `Skriv et kort, professionelt follow-up email til denne kunde:

Til: ${lead.name}
Service efterspurgt: ${lead.service_type || "rengøring"}
Noter: ${lead.notes || "Ingen specifikke noter"}

Email skal være venlig, professionel og max 100 ord på dansk.`;

        const startTime = Date.now();
        const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openrouter/z-ai/glm-4.5-air:free",
            messages: [{ role: "user", content: draftPrompt }],
            max_tokens: 150,
          }),
        });

        const data = await response.json();
        const responseTime = Date.now() - startTime;

        if (data.error) {
          console.log(`      ❌ Failed: ${data.error.message}`);
        } else {
          const draft = data.choices[0].message.content;
          console.log(`      ✅ Draft generated in ${responseTime}ms`);
          console.log(`      Preview: ${draft.substring(0, 100)}...`);
          console.log(`      ⚠️  NOT SENT - Read only mode!`);
        }
      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
      }
    }

    console.log("");
  }

  console.log("=".repeat(70));
  console.log("\n✅ Real Lead Testing Complete!");
  console.log("⚠️  NO EMAILS WERE SENT - All tests were read-only\n");
} catch (error) {
  console.error("❌ Database error:", error.message);
  console.error("\nMake sure:");
  console.error("  1. DATABASE_URL is set in .env.dev");
  console.error("  2. Database is running");
  console.error("  3. friday_ai schema exists\n");
} finally {
  await client.end();
}
