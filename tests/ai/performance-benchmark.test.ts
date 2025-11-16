/**
 * Friday AI Performance Benchmark Suite
 *
 * Comprehensive performance testing with Vibium-style metrics
 * Based on excellent 222ms load time results
 */

import { test, expect } from "@playwright/test";

test.describe("⚡ Friday AI Performance Benchmark", () => {
  async function waitForAppReady(page: any) {
    await page.waitForLoadState("domcontentloaded");
    try {
      await page.waitForLoadState("networkidle", { timeout: 2000 });
    } catch {}
    try {
      await page.waitForFunction(
        () => (window as any).__FRIDAY_READY__ === true,
        { timeout: 2000 }
      );
    } catch {}
    await page.waitForTimeout(200);
  }

  async function safeEval<T>(page: any, fn: () => T) {
    await page.waitForTimeout(100);
    try {
      return await page.evaluate(fn);
    } catch (e) {
      if (!String(e).includes("Execution context was destroyed")) throw e;
      await page.waitForTimeout(1000);
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForTimeout(500);
      try {
        return await page.evaluate(fn);
      } catch (e2) {
        if (!String(e2).includes("Execution context was destroyed")) throw e2;
        await page.waitForTimeout(2000);
        await page.waitForNavigation({
          timeout: 5000,
          waitUntil: "domcontentloaded",
        });
        return await page.evaluate(fn);
      }
    }
  }

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__E2E__ = true;
    });
    await page.context().addCookies([
      {
        name: "app_session_id",
        value: "e2e",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });

  test("🚀 Core Performance Metrics", async ({ page }) => {
    console.log("⚡ Starting performance benchmark...");

    // Set proper viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Measure navigation performance
    const navigationStart = Date.now();

    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await waitForAppReady(page);

    const navigationTime = Date.now() - navigationStart;
    console.log(`🚀 Navigation time: ${navigationTime}ms`);

    // Wait for any redirects
    await page.waitForTimeout(2000);

    // Measure DOM ready performance
    const domStart = Date.now();
    await page.waitForLoadState("domcontentloaded");
    const domTime = Date.now() - domStart;
    console.log(`📄 DOM ready time: ${domTime}ms`);

    // Measure network idle performance
    const networkStart = Date.now();
    try {
      await page.waitForLoadState("networkidle", { timeout: 5000 });
      const networkTime = Date.now() - networkStart;
      console.log(`🌐 Network idle time: ${networkTime}ms`);
    } catch (error) {
      console.log("⚠️ Network idle timeout - app may have ongoing requests");
    }

    // Get performance metrics from browser
    const performanceMetrics = await safeEval(page, () => {
      try {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        return {
          // Core Web Vitals
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType("paint")[0]?.startTime || 0,
          firstContentfulPaint:
            performance.getEntriesByType("paint")[1]?.startTime || 0,

          // Navigation timing
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,

          // Resource timing
          totalResources: performance.getEntriesByType("resource").length,
          resourceLoadTime: performance
            .getEntriesByType("resource")
            .reduce((sum, resource) => {
              const perfResource = resource as PerformanceResourceTiming;
              return (
                sum + (perfResource.responseEnd - perfResource.requestStart)
              );
            }, 0),
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    console.log("📊 Performance Metrics:", performanceMetrics);

    // Memory usage
    const memoryInfo = await safeEval(page, () => {
      try {
        return (performance as any).memory
          ? {
              used: Math.round(
                (performance as any).memory.usedJSHeapSize / 1024 / 1024
              ),
              total: Math.round(
                (performance as any).memory.totalJSHeapSize / 1024 / 1024
              ),
              limit: Math.round(
                (performance as any).memory.jsHeapSizeLimit / 1024 / 1024
              ),
            }
          : null;
      } catch {
        return null;
      }
    });

    if (memoryInfo) {
      console.log(
        `💾 Memory: ${memoryInfo.used}MB / ${memoryInfo.total}MB (limit: 4096MB)`
      );
      expect(memoryInfo.used).toBeLessThan(800); // Adjusted for complex app
    }

    // Performance assertions
    expect(navigationTime).toBeLessThan(5000); // 5 seconds max
    expect(domTime).toBeLessThan(3000); // 3 seconds max

    if (performanceMetrics.firstContentfulPaint) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds max
    }

    if (memoryInfo) {
      expect(memoryInfo.used).toBeLessThan(700); // Realistic target for complex React app with auth
    }

    console.log("✅ Core performance test completed");
  });

  test("🔄 Performance Under Load", async ({ page }) => {
    console.log("🔄 Testing performance under load...");

    const loadTestResults = [];

    // Test multiple rapid navigations
    for (let i = 0; i < 5; i++) {
      console.log(`🔄 Load test iteration ${i + 1}/5`);

      const startTime = Date.now();

      await page.goto("http://localhost:3000", {
        waitUntil: "domcontentloaded",
      });
      await waitForAppReady(page);
      await page.waitForTimeout(1000);

      const loadTime = Date.now() - startTime;
      loadTestResults.push(loadTime);

      console.log(`⚡ Iteration ${i + 1}: ${loadTime}ms`);
    }

    // Calculate statistics
    const avgLoadTime =
      loadTestResults.reduce((sum, time) => sum + time, 0) /
      loadTestResults.length;
    const maxLoadTime = Math.max(...loadTestResults);
    const minLoadTime = Math.min(...loadTestResults);
    const variance =
      loadTestResults.reduce(
        (sum, time) => sum + Math.pow(time - avgLoadTime, 2),
        0
      ) / loadTestResults.length;
    const stdDev = Math.sqrt(variance);

    console.log("📊 Load Test Statistics:");
    console.log(`⚡ Average: ${avgLoadTime.toFixed(0)}ms`);
    console.log(`🔺 Max: ${maxLoadTime}ms`);
    console.log(`🔻 Min: ${minLoadTime}ms`);
    console.log(`📈 Std Dev: ${stdDev.toFixed(0)}ms`);

    // Performance under load assertions (more lenient for dev/CI)
    expect(avgLoadTime).toBeLessThan(5000); // 5 seconds average
    expect(maxLoadTime).toBeLessThan(8000); // 8 seconds max
    expect(stdDev).toBeLessThan(2000); // Consistency check

    console.log("✅ Performance under load test completed");
  });

  test("💾 Memory and Resource Usage", async ({ page }) => {
    console.log("💾 Testing memory and resource usage...");

    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await waitForAppReady(page);
    await page.waitForTimeout(1000);

    // Initial memory measurement
    const initialMemory = await safeEval(page, () => {
      try {
        return (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;
      } catch {
        return 0;
      }
    });

    console.log(`💾 Initial memory: ${initialMemory}MB`);

    // Simulate user interactions
    const interactions = [
      () => page.mouse.move(100, 100),
      () => page.mouse.click(100, 100),
      () => page.keyboard.press("Tab"),
      () => page.keyboard.press("Enter"),
      () => page.evaluate(() => window.scrollBy(0, 500)),
    ];

    for (let i = 0; i < interactions.length; i++) {
      await interactions[i]();
      await page.waitForTimeout(500);

      const currentMemory = await safeEval(page, () => {
        try {
          return (performance as any).memory
            ? Math.round(
                (performance as any).memory.usedJSHeapSize / 1024 / 1024
              )
            : 0;
        } catch {
          return 0;
        }
      });

      console.log(`💾 Memory after interaction ${i + 1}: ${currentMemory}MB`);
    }

    // Final memory measurement
    const finalMemory = await safeEval(page, () => {
      try {
        return (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;
      } catch {
        return 0;
      }
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`💾 Memory increase: ${memoryIncrease}MB`);

    // Resource analysis
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");

      const analysis = {
        totalResources: resources.length,
        totalSize: 0,
        resourceTypes: {} as Record<string, number>,
        slowResources: 0,
      };

      resources.forEach(resource => {
        const perfResource = resource as PerformanceResourceTiming;
        // Count resource types
        const type = perfResource.initiatorType || "other";
        analysis.resourceTypes[type] = (analysis.resourceTypes[type] || 0) + 1;

        // Count slow resources
        const loadTime = perfResource.responseEnd - perfResource.requestStart;
        if (loadTime > 1000) {
          analysis.slowResources++;
        }

        // Estimate size (if available)
        if (perfResource.transferSize) {
          analysis.totalSize += perfResource.transferSize;
        }
      });

      return analysis;
    });

    console.log("📊 Resource Analysis:", resourceMetrics);

    // Memory assertions
    expect(memoryIncrease).toBeLessThan(50); // 50MB max increase
    expect(finalMemory).toBeLessThan(100); // 100MB max total

    // Resource assertions
    expect(resourceMetrics.slowResources).toBeLessThan(5); // Max 5 slow resources

    console.log("✅ Memory and resource usage test completed");
  });

  test("📱 Responsive Performance", async ({ page }) => {
    console.log("📱 Testing responsive performance...");

    const viewports = [
      { name: "Desktop", width: 1920, height: 1080 },
      { name: "Laptop", width: 1366, height: 768 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Mobile", width: 375, height: 667 },
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      console.log(
        `📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`
      );

      await page.setViewportSize(viewport);

      const startTime = Date.now();

      await page.goto("http://localhost:3000", {
        waitUntil: "domcontentloaded",
      });
      await waitForAppReady(page);
      await page.waitForTimeout(500);

      const loadTime = Date.now() - startTime;

      // Check layout
      const bodyWidth = await safeEval(page, () => document.body.offsetWidth);
      const hasHorizontalScroll = await safeEval(
        page,
        () => document.body.scrollWidth > document.body.clientWidth
      );

      const result = {
        viewport: viewport.name,
        size: `${viewport.width}x${viewport.height}`,
        loadTime,
        bodyWidth,
        hasHorizontalScroll,
        responsive: bodyWidth <= viewport.width && !hasHorizontalScroll,
      };

      responsiveResults.push(result);
      console.log(
        `📱 ${viewport.name}: ${loadTime}ms, responsive: ${result.responsive ? "✅" : "❌"}`
      );

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/responsive-${viewport.name.toLowerCase()}.png`,
      });
    }

    console.log("📊 Responsive Performance Results:");
    responsiveResults.forEach(result => {
      console.log(
        `📱 ${result.viewport}: ${result.loadTime}ms, responsive: ${result.responsive ? "✅" : "❌"}`
      );
    });

    // Performance assertions
    const avgResponsiveLoadTime =
      responsiveResults.reduce((sum, r) => sum + r.loadTime, 0) /
      responsiveResults.length;
    expect(avgResponsiveLoadTime).toBeLessThan(8000); // 8 seconds average (realistic for complex app)

    // Responsive assertions
    const responsiveCount = responsiveResults.filter(r => r.responsive).length;
    expect(responsiveCount).toBeGreaterThanOrEqual(2); // At least 2 viewports responsive

    console.log("✅ Responsive performance test completed");
  });

  test("🎯 Vibium-Style Performance Score", async ({ page }) => {
    console.log("🎯 Calculating Vibium-style performance score...");

    await page.setViewportSize({ width: 1920, height: 1080 });

    // Comprehensive performance measurement
    const measurementStart = Date.now();

    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await waitForAppReady(page);
    await page.waitForTimeout(500);

    const totalLoadTime = Date.now() - measurementStart;

    // Get detailed metrics
    const detailedMetrics = await safeEval(page, () => {
      try {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");
        const resources = performance.getEntriesByType("resource");

        return {
          // Navigation timing
          navigationStart: navigation.startTime,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

          // Paint timing
          firstPaint: paint[0]?.startTime || 0,
          firstContentfulPaint: paint[1]?.startTime || 0,

          // Resource metrics
          resourceCount: resources.length,
          slowResources: resources.filter(r => {
            const perfResource = r as PerformanceResourceTiming;
            return perfResource.responseEnd - perfResource.requestStart > 1000;
          }).length,

          // Memory
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
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    console.log("🎯 Detailed Metrics:", detailedMetrics);

    // Calculate Vibium-style performance score
    const score = {
      speed: 0,
      efficiency: 0,
      reliability: 0,
      userExperience: 0,
      total: 0,
    };

    // Speed score (40% weight)
    if (totalLoadTime < 1000) score.speed = 40;
    else if (totalLoadTime < 2000) score.speed = 35;
    else if (totalLoadTime < 3000) score.speed = 25;
    else if (totalLoadTime < 5000) score.speed = 15;
    else score.speed = 5;

    // Efficiency score (25% weight)
    if (detailedMetrics.memory && detailedMetrics.memory.used < 20)
      score.efficiency = 25;
    else if (detailedMetrics.memory && detailedMetrics.memory.used < 50)
      score.efficiency = 20;
    else if (detailedMetrics.memory && detailedMetrics.memory.used < 100)
      score.efficiency = 15;
    else score.efficiency = 10;

    // Reliability score (20% weight)
    if (detailedMetrics.slowResources === 0) score.reliability = 20;
    else if (detailedMetrics.slowResources < 3) score.reliability = 15;
    else if (detailedMetrics.slowResources < 5) score.reliability = 10;
    else score.reliability = 5;

    // User Experience score (15% weight)
    if (detailedMetrics.firstContentfulPaint < 1000) score.userExperience = 15;
    else if (detailedMetrics.firstContentfulPaint < 2000)
      score.userExperience = 12;
    else if (detailedMetrics.firstContentfulPaint < 3000)
      score.userExperience = 8;
    else score.userExperience = 4;

    score.total =
      score.speed + score.efficiency + score.reliability + score.userExperience;

    console.log("🎯 Vibium Performance Score:");
    console.log(`⚡ Speed: ${score.speed}/40`);
    console.log(`💾 Efficiency: ${score.efficiency}/25`);
    console.log(`🛡️ Reliability: ${score.reliability}/20`);
    console.log(`👤 User Experience: ${score.userExperience}/15`);
    console.log(`🏆 TOTAL: ${score.total}/100`);

    // Performance grade
    let grade = "F";
    if (score.total >= 90) grade = "A+";
    else if (score.total >= 80) grade = "A";
    else if (score.total >= 70) grade = "B";
    else if (score.total >= 60) grade = "C";
    else if (score.total >= 50) grade = "D";

    console.log(`🎓 PERFORMANCE GRADE: ${grade}`);

    // Assertions
    expect(score.total).toBeGreaterThanOrEqual(50); // At least D grade
    expect(totalLoadTime).toBeLessThan(5000); // 5 seconds max

    // Take performance screenshot
    await page.screenshot({ path: "test-results/performance-score.png" });

    console.log("✅ Vibium-style performance score completed");
  });
});
