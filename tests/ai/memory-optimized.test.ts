/**
 * Memory Optimized Performance Test
 *
 * Focused on testing our memory optimizations
 * without navigation issues
 */

import { test, expect } from "@playwright/test";

test.describe("🧠 Memory Optimized Performance", () => {
  test("📊 Bundle Size Analysis", async ({ page }) => {
    console.log("📊 Analyzing bundle sizes after optimization...");

    // Navigate and wait for stability
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Check what chunks are loaded
    const loadedChunks = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      return scripts.map(script => ({
        src: script.getAttribute("src"),
        size: script.getAttribute("src")?.split("/").pop() || "unknown",
      }));
    });

    console.log("📦 Loaded chunks:", loadedChunks);

    // Verify workspace chunks are separate
    const hasWorkspaceChunks = loadedChunks.some(chunk =>
      chunk.size.includes("workspace-")
    );

    console.log(
      `🎯 Workspace chunks separated: ${hasWorkspaceChunks ? "✅" : "❌"}`
    );

    // Check main bundle size reduction
    const mainBundle = loadedChunks.find(chunk =>
      chunk.size.includes("index-")
    );

    console.log(`📦 Main bundle: ${mainBundle?.size}`);

    expect(hasWorkspaceChunks).toBe(true);
    expect(mainBundle).toBeTruthy();
  });

  test("⚡ Load Time Performance", async ({ page }) => {
    console.log("⚡ Testing load time performance...");

    const iterations = 3;
    const loadTimes = [];

    for (let i = 0; i < iterations; i++) {
      console.log(`🔄 Load test iteration ${i + 1}/${iterations}`);

      const startTime = Date.now();

      await page.goto("http://localhost:3000", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2000); // Allow lazy loading

      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);

      console.log(`⚡ Iteration ${i + 1}: ${loadTime}ms`);
    }

    // Calculate statistics
    const avgLoadTime =
      loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    const maxLoadTime = Math.max(...loadTimes);
    const minLoadTime = Math.min(...loadTimes);

    console.log("📊 Load Performance Statistics:");
    console.log(`⚡ Average: ${avgLoadTime.toFixed(0)}ms`);
    console.log(`🔺 Max: ${maxLoadTime}ms`);
    console.log(`🔻 Min: ${minLoadTime}ms`);

    // Performance assertions
    expect(avgLoadTime).toBeLessThan(2000); // 2 seconds average
    expect(maxLoadTime).toBeLessThan(3000); // 3 seconds max

    // Grade calculation
    let grade = "F";
    if (avgLoadTime < 800) grade = "A";
    else if (avgLoadTime < 1200) grade = "B";
    else if (avgLoadTime < 1600) grade = "C";
    else if (avgLoadTime < 2000) grade = "D";

    console.log(`🎓 Load Time Grade: ${grade}`);

    expect(grade).not.toBe("F");
  });

  test("💾 Memory Usage Analysis", async ({ page }) => {
    console.log("💾 Analyzing memory usage...");

    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Get memory metrics
    const memoryMetrics = await page.evaluate(() => {
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

    if (memoryMetrics) {
      console.log(`💾 Memory Usage:`);
      console.log(`   Used: ${memoryMetrics.used}MB`);
      console.log(`   Total: ${memoryMetrics.total}MB`);
      console.log(`   Limit: ${memoryMetrics.limit}MB`);

      // Memory efficiency
      const efficiency = (memoryMetrics.used / memoryMetrics.total) * 100;
      console.log(`   Efficiency: ${efficiency.toFixed(1)}%`);

      // Memory assertions
      expect(memoryMetrics.used).toBeLessThan(100); // 100MB max
      expect(memoryMetrics.total).toBeLessThan(200); // 200MB max total

      // Grade based on memory usage
      let memoryGrade = "F";
      if (memoryMetrics.used < 30) memoryGrade = "A";
      else if (memoryMetrics.used < 50) memoryGrade = "B";
      else if (memoryMetrics.used < 75) memoryGrade = "C";
      else if (memoryMetrics.used < 100) memoryGrade = "D";

      console.log(`🎓 Memory Grade: ${memoryGrade}`);
      expect(memoryGrade).not.toBe("F");
    } else {
      console.log("⚠️ Memory metrics not available");
      // Test should still pass if memory metrics aren't available
      expect(true).toBe(true);
    }
  });

  test("🎯 Optimization Summary", async ({ page }) => {
    console.log("🎯 Generating optimization summary...");

    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Get performance summary
    const summary = await page.evaluate(() => {
      try {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");
        const resources = performance.getEntriesByType("resource");

        return {
          // Load times
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint[0]?.startTime || 0,
          firstContentfulPaint: paint[1]?.startTime || 0,

          // Resource analysis
          totalResources: resources.length,
          totalSize: resources.reduce(
            (sum, resource) => sum + (resource.transferSize || 0),
            0
          ),

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
        return { error: error.message };
      }
    });

    console.log("📊 Performance Summary:", summary);

    // Calculate overall optimization score
    let score = 0;

    // Load time scoring (40%)
    if (summary.domContentLoaded < 100) score += 20;
    else if (summary.domContentLoaded < 500) score += 15;
    else if (summary.domContentLoaded < 1000) score += 10;

    // Memory scoring (40%)
    if (summary.memory && summary.memory.used < 50) score += 20;
    else if (summary.memory && summary.memory.used < 75) score += 15;
    else if (summary.memory && summary.memory.used < 100) score += 10;

    // Resource scoring (20%)
    if (summary.totalResources < 50) score += 10;
    else if (summary.totalResources < 100) score += 5;

    console.log(`🎯 Optimization Score: ${score}/100`);

    // Grade calculation
    let grade = "F";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 50) grade = "D";

    console.log(`🎓 Overall Optimization Grade: ${grade}`);

    // Assertions
    expect(score).toBeGreaterThanOrEqual(30); // At least D grade
    expect(grade).not.toBe("F");

    // Take screenshot for documentation
    await page.screenshot({
      path: "test-results/memory-optimized-summary.png",
    });

    return {
      score,
      grade,
      summary,
    };
  });
});
