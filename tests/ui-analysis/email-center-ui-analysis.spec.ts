/**
 * Email Center UI Analysis - Visual Audit
 * Purpose: Comprehensive UI/UX analysis with screenshots and metrics
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Email Center Visual Analysis', () => {
  
  test('Complete UI/UX Audit with Screenshots', async ({ page }) => {
    console.log('\n🚀 Starting Email Center UI Analysis...\n');
    
    // Step 1: Navigate to homepage
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/ui-analysis/step1-homepage.png',
      fullPage: true 
    });
    console.log('✅ Step 1: Homepage screenshot captured');
    
    // Step 2: Check if we need to login or if we're already in workspace
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Try to find workspace or email elements
    const hasWorkspace = await page.locator('[class*="workspace"], [class*="Workspace"]').count() > 0;
    const hasEmailCenter = await page.locator('text=/Email Center/i').count() > 0;
    
    console.log(`   Workspace detected: ${hasWorkspace}`);
    console.log(`   Email Center detected: ${hasEmailCenter}`);
    
    // Step 3: Navigate to workspace if not there
    if (!hasWorkspace && !hasEmailCenter) {
      console.log('🔄 Navigating to /workspace...');
      await page.goto('http://localhost:3002/workspace');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/ui-analysis/step2-workspace.png',
        fullPage: true 
      });
      console.log('✅ Step 2: Workspace screenshot captured');
    }
    
    // Step 4: Wait for Email Center to load
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/ui-analysis/step3-email-center-loaded.png',
      fullPage: true 
    });
    console.log('✅ Step 3: Email Center loaded screenshot');
    
    // Step 5: COMPREHENSIVE UI ANALYSIS
    console.log('\n📊 Extracting UI Metrics...\n');
    
    const analysis = await page.evaluate(() => {
      const report: any = {
        timestamp: new Date().toISOString(),
        page: {
          title: document.title,
          url: window.location.href,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        },
        emailCenter: {
          found: false,
          headerText: null
        },
        threads: [],
        badges: [],
        buttons: [],
        actionBar: {
          hasStickyBar: false,
          buttons: []
        },
        colors: { text: [], backgrounds: [], badgeColors: [] },
        spacing: { threads: [], containers: [] },
        typography: []
      };
      
      // Find Email Center header
      const emailCenterHeader = document.evaluate(
        "//h1[contains(text(), 'Email Center')] | //h2[contains(text(), 'Email Center')] | //h3[contains(text(), 'Email Center')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      
      if (emailCenterHeader) {
        report.emailCenter.found = true;
        report.emailCenter.headerText = emailCenterHeader.textContent;
      }
      
      // Find email/thread containers with multiple strategies
      const threadSelectors = [
        '[class*="thread"]',
        '[class*="email-item"]',
        '[class*="EmailThread"]',
        '[data-thread]',
        '[role="listitem"]',
        '.group' // Common TailwindCSS pattern
      ];
      
      let threadElements: Element[] = [];
      threadSelectors.forEach(selector => {
        const found = Array.from(document.querySelectorAll(selector));
        if (found.length > 0) {
          threadElements = [...threadElements, ...found];
        }
      });
      
      // Remove duplicates
      threadElements = Array.from(new Set(threadElements));
      
      report.emailCenter.threadCount = threadElements.length;
      console.log(`Found ${threadElements.length} thread elements`);
      
      // Analyze first 5 threads
      threadElements.slice(0, 5).forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        const bbox = el.getBoundingClientRect();
        
        report.threads.push({
          index: i,
          text: el.textContent?.slice(0, 150),
          className: el.className,
          styles: {
            padding: computed.padding,
            margin: computed.margin,
            height: Math.round(bbox.height),
            backgroundColor: computed.backgroundColor,
            borderBottom: computed.borderBottom,
            gap: computed.gap,
            display: computed.display
          }
        });
      });
      
      // Find badges - multiple strategies
      const badgeSelectors = [
        '[class*="badge"]',
        '[class*="Badge"]',
        '[class*="chip"]',
        '[class*="tag"]',
        '[class*="label"]'
      ];
      
      let badgeElements: Element[] = [];
      badgeSelectors.forEach(selector => {
        const found = Array.from(document.querySelectorAll(selector));
        badgeElements = [...badgeElements, ...found];
      });
      
      badgeElements = Array.from(new Set(badgeElements));
      
      report.badges = badgeElements.slice(0, 30).map((el, i) => {
        const computed = window.getComputedStyle(el);
        return {
          index: i,
          text: el.textContent?.trim(),
          className: el.className,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          fontSize: computed.fontSize,
          borderRadius: computed.borderRadius,
          border: computed.border
        };
      });
      
      // Collect badge colors
      badgeElements.forEach(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (!report.colors.badgeColors.includes(bg)) {
          report.colors.badgeColors.push(bg);
        }
      });
      
      // Find ALL buttons
      const buttonElements = Array.from(document.querySelectorAll('button'));
      report.buttons = buttonElements.slice(0, 50).map((el, i) => {
        const computed = window.getComputedStyle(el);
        const isVisible = computed.display !== 'none' && computed.visibility !== 'hidden';
        return {
          index: i,
          text: el.textContent?.trim().slice(0, 50),
          className: el.className,
          visible: isVisible,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          fontSize: computed.fontSize
        };
      });
      
      // Check for sticky actionbar
      const stickyElements = Array.from(document.querySelectorAll('[class*="sticky"], [style*="sticky"], [style*="fixed"]'));
      stickyElements.forEach(el => {
        const text = el.textContent?.toLowerCase() || '';
        const isActionBar = text.includes('reply') || text.includes('svar') || 
                           text.includes('archive') || text.includes('arkiver') ||
                           text.includes('book') || text.includes('selected') || text.includes('valgt');
        if (isActionBar) {
          report.actionBar.hasStickyBar = true;
          const buttons = Array.from(el.querySelectorAll('button'));
          report.actionBar.buttons = buttons.map(btn => ({
            text: btn.textContent?.trim(),
            className: btn.className
          }));
        }
      });
      
      // Typography analysis - find varied text
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const spans = Array.from(document.querySelectorAll('span, div'));
      
      const allText = [...headings, ...paragraphs, ...spans.slice(0, 30)];
      
      report.typography = allText.slice(0, 40).map((el, i) => {
        const computed = window.getComputedStyle(el);
        const text = el.textContent?.trim().slice(0, 50);
        if (!text || text.length < 2) return null;
        return {
          index: i,
          tag: el.tagName,
          text,
          className: el.className,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          color: computed.color
        };
      }).filter(Boolean);
      
      // Color palette
      const colorSet = new Set<string>();
      const bgColorSet = new Set<string>();
      
      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.color) colorSet.add(computed.color);
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          bgColorSet.add(computed.backgroundColor);
        }
      });
      
      report.colors.text = Array.from(colorSet).slice(0, 40);
      report.colors.backgrounds = Array.from(bgColorSet).slice(0, 40);
      
      // Spacing analysis
      const containers = Array.from(document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="panel"]'));
      report.spacing.containers = containers.slice(0, 10).map((el, i) => {
        const computed = window.getComputedStyle(el);
        return {
          index: i,
          className: el.className,
          padding: computed.padding,
          margin: computed.margin,
          gap: computed.gap
        };
      });
      
      return report;
    });
    
    // Save full report
    const reportPath = 'test-results/ui-analysis/ui-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    
    // Console output
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎨 UI/UX ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📍 PAGE INFO:');
    console.log(`   URL: ${analysis.page.url}`);
    console.log(`   Title: ${analysis.page.title || '(empty)'}`);
    console.log(`   Viewport: ${analysis.page.viewport.width}x${analysis.page.viewport.height}`);
    
    console.log('\n📧 EMAIL CENTER:');
    console.log(`   Found: ${analysis.emailCenter.found ? '✅ YES' : '❌ NO'}`);
    console.log(`   Header: ${analysis.emailCenter.headerText || '(not found)'}`);
    console.log(`   Thread count: ${analysis.threads.length}`);
    
    console.log('\n📌 STICKY ACTION BAR:');
    console.log(`   Present: ${analysis.actionBar.hasStickyBar ? '✅ YES' : '❌ NO (PROBLEM!)'}`);
    if (analysis.actionBar.buttons.length > 0) {
      console.log(`   Buttons: ${analysis.actionBar.buttons.map((b: any) => b.text).join(', ')}`);
    }
    
    console.log('\n🏷️  BADGE ANALYSIS:');
    console.log(`   Total badges: ${analysis.badges.length}`);
    console.log(`   Unique colors: ${analysis.colors.badgeColors.length}`);
    if (analysis.badges.length > 0) {
      console.log('\n   Top 5 badges:');
      analysis.badges.slice(0, 5).forEach((badge: any, i: number) => {
        console.log(`   ${i + 1}. "${badge.text}" | BG: ${badge.backgroundColor} | Size: ${badge.fontSize}`);
      });
    }
    
    console.log('\n📐 THREAD SPACING:');
    if (analysis.threads.length > 0) {
      analysis.threads.slice(0, 3).forEach((thread: any) => {
        console.log(`   Thread ${thread.index + 1}:`);
        console.log(`      Padding: ${thread.styles.padding}`);
        console.log(`      Height: ${thread.styles.height}px`);
        console.log(`      Gap: ${thread.styles.gap}`);
      });
    } else {
      console.log('   ⚠️  No threads found!');
    }
    
    console.log('\n📝 TYPOGRAPHY SAMPLES:');
    if (analysis.typography.length > 0) {
      analysis.typography.slice(0, 8).forEach((t: any) => {
        console.log(`   ${t.tag}: "${t.text.slice(0, 40)}" | Size: ${t.fontSize} | Weight: ${t.fontWeight}`);
      });
    }
    
    console.log('\n🎨 COLOR PALETTE:');
    console.log(`   Text colors: ${analysis.colors.text.length} unique colors`);
    console.log(`   Background colors: ${analysis.colors.backgrounds.length} unique colors`);
    console.log(`   Badge colors: ${analysis.colors.badgeColors.length} unique colors`);
    
    console.log('\n🔘 BUTTONS:');
    const visibleButtons = analysis.buttons.filter((b: any) => b.visible);
    console.log(`   Total: ${analysis.buttons.length} (${visibleButtons.length} visible)`);
    if (visibleButtons.length > 0) {
      console.log('\n   Top 8 visible buttons:');
      visibleButtons.slice(0, 8).forEach((btn: any, i: number) => {
        console.log(`   ${i + 1}. "${btn.text}"`);
      });
    }
    
    console.log('\n💾 Full report saved to:', reportPath);
    console.log('📸 Screenshots saved to: test-results/ui-analysis/');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Assertions for critical issues
    expect(analysis.emailCenter.found, 'Email Center should be visible').toBe(true);
    
    // Log warnings
    if (!analysis.actionBar.hasStickyBar) {
      console.log('⚠️  WARNING: No sticky action bar found (ChatGPT feedback!)');
    }
    if (analysis.colors.badgeColors.length > 3) {
      console.log(`⚠️  WARNING: ${analysis.colors.badgeColors.length} badge colors found (too many - should be 2-3)`);
    }
    if (analysis.threads.length === 0) {
      console.log('⚠️  WARNING: No email threads found - check selectors!');
    }
  });
});
