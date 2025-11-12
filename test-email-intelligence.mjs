/**
 * Email Intelligence Test
 * Test email summary and label suggestions
 */

const OPENROUTER_API_KEY =
  "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const emailTests = [
  {
    name: "Email Summary - Customer Inquiry",
    type: "summary",
    email: {
      subject: "Forespørgsel om badværelsesrenovering",
      body: `Hej Rendetalje,

Jeg vil gerne have et tilbud på komplet renovering af vores badeværelse. 
Det er et badeværelse på ca. 8 kvm, og vi ønsker nye fliser både på gulv og vægge,
nyt badekar, håndvask og toilet. Vi vil også gerne have installeret en glascabine.

Projektet skal gerne være færdigt inden sommerferien i juli måned.
Hvornår kan I komme ud og se på opgaven?

Vi bor i København Ø, Østerbrogade 120.

Med venlig hilsen,
Maria Jensen
Tlf: 12345678`,
    },
    expectedLength: 150, // Max 150 chars
    expectedDanish: true,
  },
  {
    name: "Email Labels - Lead Detection",
    type: "labels",
    email: {
      subject: "Ny kunde: Renovering af kælder",
      from: "peter@email.dk",
      body: "Hej, jeg har hørt godt om jeres arbejde og vil gerne have et tilbud på renovering af min kælder. Jeg har 50 kvm der skal males og nyt gulv.",
    },
    expectedLabels: ["Lead"],
    minConfidence: 85,
  },
  {
    name: "Email Labels - Booking Detection",
    type: "labels",
    email: {
      subject: "Aftale om besigtigelse",
      from: "info@kunde.dk",
      body: "Tak for tilbuddet. Vi vil gerne have besigtigelse næste onsdag kl 10. Passer det?",
    },
    expectedLabels: ["Booking"],
    minConfidence: 70,
  },
  {
    name: "Email Labels - Finance Detection",
    type: "labels",
    email: {
      subject: "Faktura 12345",
      from: "billing@customer.dk",
      body: "Vi har modtaget jeres faktura på 25.000 kr. Betalingen vil blive overført i dag.",
    },
    expectedLabels: ["Finance"],
    minConfidence: 90,
  },
];

async function testEmailSummary(model, test) {
  // Simplified, direct prompt
  const prompt = `Lav en kort dansk sammenfatning af denne email (max 150 tegn):

Emne: ${test.email.subject}
Fra: Kunde

${test.email.body.substring(0, 500)}

Sammenfatning (kun tekst, max 150 tegn):`;

  // Retry logic
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://tekup.dk",
          "X-Title": "Friday AI Test",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(
          `   ⚠️ Attempt ${attempt} failed: ${response.status} - ${errorText.substring(0, 100)}`
        );
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim() || "";

      if (!summary || summary.length === 0) {
        console.log(`   ⚠️ Attempt ${attempt}: Empty response`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }

      const lengthOk =
        summary.length > 0 && summary.length <= test.expectedLength;
      const isDanish =
        /[æøåÆØÅ]/.test(summary) ||
        /\b(er|på|med|til|for|og|i|af|som|en|det|har|kan|vil)\b/.test(
          summary.toLowerCase()
        );

      return {
        success: lengthOk && isDanish && summary.length > 0,
        summary,
        length: summary.length,
        lengthOk,
        isDanish,
        attempts: attempt,
      };
    } catch (error) {
      console.log(`   ⚠️ Attempt ${attempt} error: ${error.message}`);
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return {
        success: false,
        error: error.message,
        attempts: attempt,
      };
    }
  }
}

async function testEmailLabels(model, test) {
  // Much simpler, direct prompt
  const prompt = `Analyser denne email og find det bedste label:

Labels: Lead (ny kunde), Booking (aftale), Finance (faktura/betaling), Support (problem), Newsletter

Email:
Fra: ${test.email.from}
Emne: ${test.email.subject}
${test.email.body.substring(0, 300)}

Svar KUN med JSON:
[{"label": "Lead", "confidence": 90}]`;

  // Retry logic
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://tekup.dk",
          "X-Title": "Friday AI Test",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ⚠️ Attempt ${attempt} failed: ${response.status}`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";

      if (!content || content.length === 0) {
        console.log(`   ⚠️ Attempt ${attempt}: Empty response`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
      }

      // Extract JSON array - try multiple patterns
      let jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        // Try to find single object and wrap it
        const objMatch = content.match(/\{[\s\S]*?\}/);
        if (objMatch) {
          jsonMatch = [`[${objMatch[0]}]`];
        }
      }

      if (!jsonMatch) {
        console.log(
          `   ⚠️ Attempt ${attempt}: No JSON found in: ${content.substring(0, 100)}`
        );
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        return {
          success: false,
          error: "No JSON array in response",
          rawOutput: content.substring(0, 200),
          attempts: attempt,
        };
      }

      const labels = JSON.parse(jsonMatch[0]);

      // Check if expected labels are present with sufficient confidence
      const foundExpectedLabels = test.expectedLabels.every(expectedLabel => {
        const found = labels.find(l => l.label === expectedLabel);
        return found && found.confidence >= test.minConfidence;
      });

      const highConfidenceLabels = labels.filter(
        l => l.confidence >= test.minConfidence
      );

      return {
        success: foundExpectedLabels && labels.length > 0,
        labels,
        highConfidenceLabels,
        foundExpectedLabels,
        avgConfidence:
          labels.reduce((sum, l) => sum + l.confidence, 0) / labels.length,
        attempts: attempt,
      };
    } catch (error) {
      console.log(`   ⚠️ Attempt ${attempt} error: ${error.message}`);
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return {
        success: false,
        error: error.message,
        attempts: attempt,
      };
    }
  }
}

async function runEmailTests() {
  console.log("📧 Friday AI - Email Intelligence Testing");
  console.log("============================================\n");

  const models = [
    { id: "z-ai/glm-4.5-air:free", name: "GLM-4.5 Air" },
    { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B" },
  ];

  const results = [];

  for (const model of models) {
    console.log(`\n🤖 Testing: ${model.name}`);
    console.log("─".repeat(60));

    for (const test of emailTests) {
      console.log(`\n📝 ${test.name}`);

      let result;
      if (test.type === "summary") {
        result = await testEmailSummary(model.id, test);

        if (result.success) {
          console.log(
            `   ✅ Summary (${result.length} chars): "${result.summary}"`
          );
        } else if (result.error) {
          console.log(`   ❌ Error: ${result.error}`);
        } else {
          console.log(
            `   ⚠️ Length: ${result.length}/${test.expectedLength} ${result.lengthOk ? "✅" : "❌"}`
          );
          console.log(`   ⚠️ Danish: ${result.isDanish ? "✅" : "❌"}`);
          console.log(`   Output: "${result.summary}"`);
        }
      } else if (test.type === "labels") {
        result = await testEmailLabels(model.id, test);

        if (result.success) {
          console.log(`   ✅ Labels detected:`);
          result.highConfidenceLabels.forEach(l => {
            console.log(
              `      - ${l.label}: ${l.confidence}% (${l.reasoning})`
            );
          });
        } else if (result.error) {
          console.log(`   ❌ Error: ${result.error}`);
          if (result.rawOutput) {
            console.log(`   Raw: ${result.rawOutput}...`);
          }
        } else {
          console.log(
            `   ⚠️ Expected labels not found with sufficient confidence`
          );
          console.log(`   Found labels:`, result.labels);
        }
      }

      results.push({
        model: model.name,
        test: test.name,
        type: test.type,
        ...result,
      });

      // Wait 1.5 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Summary
  console.log("\n\n📊 Email Intelligence Summary");
  console.log("============================================");

  for (const model of models) {
    const modelResults = results.filter(r => r.model === model.name);
    const successful = modelResults.filter(r => r.success).length;

    const summaryTests = modelResults.filter(r => r.type === "summary");
    const labelTests = modelResults.filter(r => r.type === "labels");

    console.log(`\n${model.name}:`);
    console.log(
      `  Overall Success: ${successful}/${modelResults.length} (${Math.round((successful / modelResults.length) * 100)}%)`
    );
    console.log(
      `  Email Summaries: ${summaryTests.filter(r => r.success).length}/${summaryTests.length}`
    );
    console.log(
      `  Label Detection: ${labelTests.filter(r => r.success).length}/${labelTests.length}`
    );
  }

  const totalSuccess = results.filter(r => r.success).length;
  const totalTests = results.length;
  console.log(
    `\n📧 Overall Success Rate: ${totalSuccess}/${totalTests} (${Math.round((totalSuccess / totalTests) * 100)}%)`
  );
}

runEmailTests().catch(console.error);
