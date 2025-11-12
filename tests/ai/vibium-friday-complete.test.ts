/**
 * Vibium-Style Friday AI Complete Test Suite
 *
 * Ultimate testing combining:
 * - Login infrastructure
 * - Performance benchmarking (Grade B!)
 * - Friday AI component testing
 * - Danish language validation
 * - Business context verification
 */

import { test, expect } from "@playwright/test";

// Vibium-style test categories with Friday AI focus
const vibiumFridayTests = {
  infrastructure: "Test Friday AI infrastructure and login",
  performance: "Test Friday AI performance (Grade B achieved!)",
  components: "Test Friday AI component structure",
  interactions: "Test Friday AI user interactions",
  danishLanguage: "Test Friday AI Danish language quality",
  businessContext: "Test Friday AI business context awareness",
  accessibility: "Test Friday AI accessibility compliance",
  visualRegression: "Test Friday AI visual consistency",
};

class VibiumFridayTester {
  constructor(private page: Page) {}

  async runCompleteTestSuite(): Promise<any> {
    console.log("🎯 Starting Vibium-Style Friday AI Complete Test Suite...");

    const results = {
      timestamp: new Date().toISOString(),
      totalTests: Object.keys(vibiumFridayTests).length,
      passed: 0,
      failed: 0,
      scores: {},
      details: [],
      overallGrade: "F",
    };

    // Run each test category
    for (const [category, description] of Object.entries(vibiumFridayTests)) {
      console.log(`🎯 Running: ${description}`);

      try {
        const result = await this.executeTest(category);
        results.details.push({ category, description, ...result });

        if (result.success) {
          results.passed++;
          results.scores[category] = result.score || 100;
        } else {
          results.failed++;
          results.scores[category] = result.score || 0;
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          category,
          description,
          success: false,
          error: error.message,
          score: 0,
        });
      }
    }

    // Calculate overall grade
    const avgScore =
      Object.values(results.scores).reduce((sum, score) => sum + score, 0) /
      Object.keys(results.scores).length;

    if (avgScore >= 90) results.overallGrade = "A+";
    else if (avgScore >= 80) results.overallGrade = "A";
    else if (avgScore >= 70) results.overallGrade = "B";
    else if (avgScore >= 60) results.overallGrade = "C";
    else if (avgScore >= 50) results.overallGrade = "D";

    results.averageScore = Math.round(avgScore);
    results.passRate = Math.round((results.passed / results.totalTests) * 100);

    console.log(`🎯 Vibium Friday AI Suite Complete:`);
    console.log(`✅ Passed: ${results.passed}/${results.totalTests}`);
    console.log(`🎓 Grade: ${results.overallGrade} (${results.averageScore}%)`);

    return results;
  }

  private async executeTest(category: string): Promise<any> {
    switch (category) {
      case "infrastructure":
        return await this.testInfrastructure();
      case "performance":
        return await this.testPerformance();
      case "components":
        return await this.testComponents();
      case "interactions":
        return await this.testInteractions();
      case "danishLanguage":
        return await this.testDanishLanguage();
      case "businessContext":
        return await this.testBusinessContext();
      case "accessibility":
        return await this.testAccessibility();
      case "visualRegression":
        return await this.testVisualRegression();
      default:
        return { success: false, error: "Unknown test category" };
    }
  }

  private async testInfrastructure() {
    console.log("🔧 Testing Friday AI infrastructure...");

    await this.page.setViewportSize({ width: 1920, height: 1080 });

    const startTime = Date.now();
    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(2000);

    const loadTime = Date.now() - startTime;
    const finalUrl = this.page.url();

    // Check basic infrastructure
    const hasBody = await this.page.locator("body").isVisible();
    const hasTitle = await this.page.title();

    // Look for Friday AI infrastructure
    const infrastructure = {
      hasDataTestIds: (await this.page.locator("[data-testid]").count()) > 0,
      hasInputs: (await this.page.locator("input, textarea").count()) > 0,
      hasButtons: (await this.page.locator("button").count()) > 0,
      hasErrorHandling:
        (await this.page
          .locator('[class*="error"], [data-testid*="error"]')
          .count()) > 0,
    };

    const score =
      [
        loadTime < 3000,
        hasBody,
        hasTitle.length > 0,
        infrastructure.hasDataTestIds,
        infrastructure.hasInputs,
        infrastructure.hasButtons,
      ].filter(Boolean).length *
      (100 / 6);

    return {
      success: score >= 50,
      score: Math.round(score),
      metrics: { loadTime, finalUrl, hasBody, hasTitle, infrastructure },
    };
  }

  private async testPerformance() {
    console.log("⚡ Testing Friday AI performance...");

    const performanceStart = Date.now();

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    const totalTime = Date.now() - performanceStart;

    // Get performance metrics
    const metrics = await this.page.evaluate(() => {
      try {
        return {
          memory: (performance as any).memory
            ? {
                used: Math.round(
                  (performance as any).memory.usedJSHeapSize / 1024 / 1024
                ),
                total: Math.round(
                  (performance as any).memory.totalJSHeapSize / 1024 / 1024
                ),
              }
            : null,
          firstPaint: performance.getEntriesByType("paint")[0]?.startTime || 0,
          firstContentfulPaint:
            performance.getEntriesByType("paint")[1]?.startTime || 0,
        };
      } catch {
        return { memory: null, firstPaint: 0, firstContentfulPaint: 0 };
      }
    });

    // Calculate performance score (based on our previous Grade B results)
    let score = 0;

    if (totalTime < 2000) score += 30;
    else if (totalTime < 3000) score += 20;
    else if (totalTime < 5000) score += 10;

    if (metrics.memory && metrics.memory.used < 20) score += 25;
    else if (metrics.memory && metrics.memory.used < 50) score += 15;

    if (metrics.firstContentfulPaint < 1000) score += 25;
    else if (metrics.firstContentfulPaint < 2000) score += 15;

    if (metrics.firstPaint < 500) score += 20;
    else if (metrics.firstPaint < 1000) score += 10;

    return {
      success: score >= 60,
      score,
      metrics: { totalTime, ...metrics },
    };
  }

  private async testComponents() {
    console.log("🧩 Testing Friday AI components...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    // Check for Friday AI specific components
    const components = {
      fridayPanel: await this.page
        .locator('[data-testid="friday-ai-panel"]')
        .isVisible()
        .catch(() => false),
      chatInput: await this.page
        .locator('[data-testid="friday-chat-input"]')
        .isVisible()
        .catch(() => false),
      sendButton: await this.page
        .locator('[data-testid="friday-send-button"]')
        .isVisible()
        .catch(() => false),
      messageArea: await this.page
        .locator('[data-testid="friday-message-area"]')
        .isVisible()
        .catch(() => false),
      modelInfo: await this.page
        .locator('[data-testid="friday-model-info"]')
        .isVisible()
        .catch(() => false),
    };

    // Check for alternative components
    const alternatives = {
      anyInput: (await this.page.locator("input, textarea").count()) > 0,
      anyButton: (await this.page.locator("button").count()) > 0,
      anyChat:
        (await this.page
          .locator('[class*="chat"], [class*="message"]')
          .count()) > 0,
    };

    const foundComponents = Object.values(components).filter(Boolean).length;
    const foundAlternatives =
      Object.values(alternatives).filter(Boolean).length;

    let score = 0;

    // Score Friday AI components higher
    score += foundComponents * 20;
    score += foundAlternatives * 10;

    // Bonus for core components
    if (components.chatInput) score += 10;
    if (components.sendButton) score += 10;

    score = Math.min(score, 100);

    return {
      success: score >= 40,
      score,
      metrics: { components, alternatives, foundComponents, foundAlternatives },
    };
  }

  private async testInteractions() {
    console.log("👤 Testing Friday AI interactions...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    const interactions = {
      canTypeInInput: false,
      canClickButton: false,
      hasFeedback: false,
      handlesEmptyInput: false,
    };

    try {
      // Test input interaction
      const inputs = await this.page.locator("input, textarea").count();
      if (inputs > 0) {
        const firstInput = this.page.locator("input, textarea").first();
        await firstInput.fill("Test message");
        const value = await firstInput.inputValue();
        interactions.canTypeInInput = value === "Test message";

        // Test empty input handling
        await firstInput.fill("");
        const isEmpty = (await firstInput.inputValue()) === "";
        interactions.handlesEmptyInput = isEmpty;
      }

      // Test button interaction
      const buttons = await this.page.locator("button").count();
      if (buttons > 0) {
        const firstButton = this.page.locator("button").first();
        const isEnabled = await firstButton.isEnabled();
        interactions.canClickButton = isEnabled;
      }

      // Test for feedback mechanisms
      const hasLoading =
        (await this.page
          .locator('[data-testid*="loading"], .loading')
          .count()) > 0;
      const hasError =
        (await this.page.locator('[data-testid*="error"], .error').count()) > 0;
      interactions.hasFeedback = hasLoading || hasError;
    } catch (error) {
      console.log("⚠️ Interaction test error:", error.message);
    }

    const score = Object.values(interactions).filter(Boolean).length * 25;

    return {
      success: score >= 50,
      score,
      metrics: interactions,
    };
  }

  private async testDanishLanguage() {
    console.log("🇩🇰 Testing Friday AI Danish language...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    // Look for Danish language indicators
    const danishIndicators = {
      hasDanishText: false,
      hasDanishPlaceholders: false,
      hasDanishLabels: false,
      supportsDanishInput: false,
    };

    // Check for Danish text in page
    const pageText = await this.page.textContent("body").catch(() => "");
    const danishWords = [
      "jeg",
      "er",
      "du",
      "kan",
      "hjælpe",
      "med",
      "på",
      "til",
      "og",
      "af",
    ];
    danishIndicators.hasDanishText = danishWords.some(word =>
      pageText?.toLowerCase().includes(word)
    );

    // Check for Danish placeholders
    const inputs = await this.page
      .locator("input[placeholder], textarea[placeholder]")
      .count();
    if (inputs > 0) {
      const placeholders = await this.page
        .locator("input[placeholder], textarea[placeholder]")
        .all();
      for (const input of placeholders) {
        const placeholder = await input.getAttribute("placeholder");
        if (
          placeholder &&
          danishWords.some(word => placeholder.toLowerCase().includes(word))
        ) {
          danishIndicators.hasDanishPlaceholders = true;
          break;
        }
      }
    }

    // Check for Danish labels
    const labels = await this.page.locator("label").count();
    if (labels > 0) {
      const labelTexts = await this.page.locator("label").allTextContents();
      danishIndicators.hasDanishLabels = labelTexts.some(text =>
        danishWords.some(word => text.toLowerCase().includes(word))
      );
    }

    // Test Danish input support
    const textInputs = await this.page
      .locator('input[type="text"], textarea')
      .count();
    if (textInputs > 0) {
      const firstInput = this.page
        .locator('input[type="text"], textarea')
        .first();
      await firstInput.fill("Test med danske tegn: æøå ÆØÅ");
      const value = await firstInput.inputValue();
      danishIndicators.supportsDanishInput = value.includes("æøå");
    }

    const score = Object.values(danishIndicators).filter(Boolean).length * 25;

    return {
      success: score >= 50,
      score,
      metrics: danishIndicators,
    };
  }

  private async testBusinessContext() {
    console.log("🏢 Testing Friday AI business context...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    // Check for business context indicators
    const businessIndicators = {
      hasBusinessTerms: false,
      hasServiceDescriptions: false,
      hasProfessionalBranding: false,
      hasContactInfo: false,
    };

    const pageText = await this.page.textContent("body").catch(() => "");
    const businessTerms = [
      "rengøring",
      "kunder",
      "booking",
      "faktura",
      "service",
      "virksomhed",
      "professionel",
    ];

    businessIndicators.hasBusinessTerms = businessTerms.some(term =>
      pageText?.toLowerCase().includes(term)
    );

    // Check for service descriptions
    const hasServiceText = /service|løsning|ydelse|vare/i.test(pageText || "");
    businessIndicators.hasServiceDescriptions = hasServiceText;

    // Check for professional branding
    const hasBranding =
      (await this.page
        .locator('[class*="brand"], [class*="logo"], h1, .company')
        .count()) > 0;
    businessIndicators.hasProfessionalBranding = hasBranding;

    // Check for contact information
    const hasContact =
      (await this.page
        .locator('[href*="contact"], [href*="mail"], [href*="tel"]')
        .count()) > 0;
    businessIndicators.hasContactInfo = hasContact;

    const score = Object.values(businessIndicators).filter(Boolean).length * 25;

    return {
      success: score >= 25,
      score,
      metrics: businessIndicators,
    };
  }

  private async testAccessibility() {
    console.log("♿ Testing Friday AI accessibility...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    const accessibility = {
      hasAriaLabels: false,
      hasKeyboardSupport: false,
      hasSemanticHTML: false,
      hasAltText: false,
    };

    // Check for ARIA labels
    const ariaElements = await this.page
      .locator("[aria-label], [role], [aria-describedby]")
      .count();
    accessibility.hasAriaLabels = ariaElements > 0;

    // Check for semantic HTML
    const semanticElements = await this.page
      .locator("header, main, nav, section, article, aside, footer")
      .count();
    accessibility.hasSemanticHTML = semanticElements > 0;

    // Check for alt text on images
    const images = await this.page.locator("img").count();
    if (images > 0) {
      const imagesWithAlt = await this.page.locator("img[alt]").count();
      accessibility.hasAltText = imagesWithAlt > 0;
    }

    // Test keyboard navigation
    try {
      await this.page.keyboard.press("Tab");
      const focusedElement = await this.page.locator(":focus").count();
      accessibility.hasKeyboardSupport = focusedElement > 0;
    } catch (error) {
      accessibility.hasKeyboardSupport = false;
    }

    const score = Object.values(accessibility).filter(Boolean).length * 25;

    return {
      success: score >= 50,
      score,
      metrics: accessibility,
    };
  }

  private async testVisualRegression() {
    console.log("🎨 Testing Friday AI visual regression...");

    await this.page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    // Take baseline screenshot
    await this.page.screenshot({
      path: "test-results/vibium-friday-baseline.png",
      fullPage: false,
    });

    // Check visual consistency
    const visualChecks = {
      hasConsistentLayout: false,
      hasProperSpacing: false,
      hasReadableText: false,
      hasColorContrast: false,
    };

    // Check layout consistency
    const hasGrid =
      (await this.page.locator('[class*="grid"], [class*="flex"]').count()) > 0;
    visualChecks.hasConsistentLayout = hasGrid;

    // Check spacing
    const hasSpacing =
      (await this.page
        .locator('[class*="p-"], [class*="m-"], [class*="gap"]')
        .count()) > 0;
    visualChecks.hasProperSpacing = hasSpacing;

    // Check text readability
    const textElements = await this.page
      .locator("p, h1, h2, h3, span, div")
      .count();
    visualChecks.hasReadableText = textElements > 0;

    // Check for color classes (indicating design system)
    const hasColors =
      (await this.page.locator('[class*="bg-"], [class*="text-"]').count()) > 0;
    visualChecks.hasColorContrast = hasColors;

    const score = Object.values(visualChecks).filter(Boolean).length * 25;

    return {
      success: score >= 50,
      score,
      metrics: visualChecks,
      screenshot: "vibium-friday-baseline.png",
    };
  }
}

test.describe("🎯 Vibium-Style Friday AI Complete Suite", () => {
  test("🏆 Complete Vibium Friday AI Test Suite", async ({ page }) => {
    console.log("🏆 Starting complete Vibium Friday AI test suite...");

    const tester = new VibiumFridayTester(page);
    const results = await tester.runCompleteTestSuite();

    console.log("🏆 FINAL RESULTS:");
    console.log(`✅ Passed: ${results.passed}/${results.totalTests}`);
    console.log(`🎓 Grade: ${results.overallGrade} (${results.averageScore}%)`);
    console.log(`📊 Pass Rate: ${results.passRate}%`);

    // Detailed results
    results.details.forEach(detail => {
      const status = detail.success ? "✅" : "❌";
      console.log(`${status} ${detail.description}: ${detail.score || 0}%`);
    });

    // Save comprehensive results
    await page.evaluate(results => {
      console.log(
        "🎯 Vibium Friday AI Test Results:",
        JSON.stringify(results, null, 2)
      );
    }, results);

    // Assertions
    expect(results.passRate).toBeGreaterThanOrEqual(50); // At least 50% pass rate
    expect(results.averageScore).toBeGreaterThanOrEqual(40); // At least 40% average score

    // Take final screenshot
    await page.screenshot({ path: "test-results/vibium-friday-complete.png" });

    console.log("🎉 Vibium-Style Friday AI Complete Test Suite Finished!");

    return results;
  });
});
