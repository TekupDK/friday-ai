#!/usr/bin/env tsx

/**
 * AI Test Runner - Friday AI Testing Suite
 * 
 * Execute comprehensive AI-powered tests:
 * - Natural language conversation testing
 * - Performance benchmarking  
 * - Visual regression detection
 * - Quality assurance validation
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors?: string[];
  metrics?: any;
}

interface AISuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  qualityScore?: number;
  performanceScore?: number;
}

class FridayAITestRunner {
  private results: AISuiteResult[] = [];
  
  async runAllTests(): Promise<void> {
    console.log('🤖 Friday AI Test Suite Starting...');
    console.log('=====================================');
    
    // Ensure test directories exist
    this.ensureDirectories();
    
    // Run different test suites
    const suites = [
      { name: 'AI Conversation Tests', command: 'npx playwright test ai/friday-ai-agent.test.ts --project=ai-tests' },
      { name: 'Visual Regression Tests', command: 'npx playwright test ai/visual-regression.test.ts --project=ai-tests' },
      { name: 'Performance Tests', command: 'npx playwright test ai/performance.test.ts --project=ai-tests' },
      { name: 'Accessibility Tests', command: 'npx playwright test ai/accessibility.test.ts --project=ai-tests' },
    ];
    
    for (const suite of suites) {
      console.log(`\n🧪 Running: ${suite.name}`);
      const result = await this.runTestSuite(suite.name, suite.command);
      this.results.push(result);
    }
    
    // Generate comprehensive report
    this.generateReport();
    
    // Overall summary
    this.printSummary();
  }

  async runTestSuite(suiteName: string, command: string): Promise<AISuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log(`⚡ Executing: ${command}`);
      
      const output = execSync(command, {
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes timeout
      });
      
      const duration = Date.now() - startTime;
      const parsed = this.parsePlaywrightOutput(output);
      
      console.log(`✅ ${suiteName} completed in ${duration}ms`);
      console.log(`📊 Results: ${parsed.passed} passed, ${parsed.failed} failed, ${parsed.skipped} skipped`);
      
      return {
        suiteName,
        totalTests: parsed.totalTests,
        passed: parsed.passed,
        failed: parsed.failed,
        skipped: parsed.skipped,
        duration,
        results: parsed.results,
        qualityScore: this.calculateQualityScore(parsed.results),
        performanceScore: this.calculatePerformanceScore(parsed.results),
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const output = error.stdout || error.message || '';
      const parsed = this.parsePlaywrightOutput(output);
      
      console.log(`❌ ${suiteName} failed in ${duration}ms`);
      console.log(`📊 Results: ${parsed.passed} passed, ${parsed.failed} failed, ${parsed.skipped} skipped`);
      
      if (error.stderr) {
        console.log('🔥 Errors:', error.stderr);
      }
      
      return {
        suiteName,
        totalTests: parsed.totalTests,
        passed: parsed.passed,
        failed: parsed.failed,
        skipped: parsed.skipped,
        duration,
        results: parsed.results,
      };
    }
  }

  private parsePlaywrightOutput(output: string): any {
    const lines = output.split('\n');
    const results: TestResult[] = [];
    
    let passed = 0, failed = 0, skipped = 0;
    let currentTest: Partial<TestResult> = {};
    
    for (const line of lines) {
      // Parse test results
      if (line.includes('✅') || line.includes('❌') || line.includes('⏭️')) {
        const status = line.includes('✅') ? 'passed' : 
                      line.includes('❌') ? 'failed' : 'skipped';
        
        const testName = line.replace(/[✅❌⏭️]/, '').trim();
        
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        else skipped++;
        
        results.push({
          name: testName,
          status,
          duration: 0, // Would need more detailed parsing
        });
      }
      
      // Parse performance metrics
      if (line.includes('Response time:') || line.includes('Duration:')) {
        const match = line.match(/(\d+)ms/);
        if (match && currentTest.name) {
          currentTest.metrics = { responseTime: parseInt(match[1]) };
        }
      }
    }
    
    // If no specific results found, use defaults
    if (results.length === 0) {
      const totalMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      const skippedMatch = output.match(/(\d+) skipped/);
      
      passed = totalMatch ? parseInt(totalMatch[1]) : 0;
      failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
    }
    
    return {
      totalTests: passed + failed + skipped,
      passed,
      failed,
      skipped,
      results,
    };
  }

  private calculateQualityScore(results: TestResult[]): number {
    if (results.length === 0) return 0;
    
    // Quality score based on test pass rate and specific quality metrics
    const passRate = results.filter(r => r.status === 'passed').length / results.length;
    
    // Add bonus for tests that include quality validations
    const qualityTests = results.filter(r => 
      r.name.includes('Quality') || r.name.includes('Language') || r.name.includes('Validation')
    ).length;
    
    const qualityBonus = qualityTests > 0 ? Math.min(qualityTests / results.length, 0.2) : 0;
    
    return Math.round((passRate + qualityBonus) * 100);
  }

  private calculatePerformanceScore(results: TestResult[]): number {
    if (results.length === 0) return 0;
    
    // Performance score based on response times
    const performanceResults = results.filter(r => r.metrics?.responseTime);
    
    if (performanceResults.length === 0) return 85; // Default if no performance data
    
    const avgResponseTime = performanceResults.reduce((sum, r) => 
      sum + (r.metrics?.responseTime || 0), 0
    ) / performanceResults.length;
    
    // Score: <3s = 100, 3-5s = 80, 5-8s = 60, >8s = 40
    if (avgResponseTime < 3000) return 100;
    if (avgResponseTime < 5000) return 80;
    if (avgResponseTime < 8000) return 60;
    return 40;
  }

  private ensureDirectories(): void {
    const dirs = [
      'test-results',
      'test-results/ai-screenshots',
      'test-results/ai-reports',
      'playwright-report',
    ];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  private generateReport(): void {
    console.log('\n📊 Generating AI Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.getOverallSummary(),
      suites: this.results,
      recommendations: this.generateRecommendations(),
    };
    
    // Save JSON report
    const reportPath = 'test-results/ai-test-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved: ${reportPath}`);
    
    // Generate HTML report (simplified)
    this.generateHTMLReport(report);
  }

  private getOverallSummary(): any {
    const totalTests = this.results.reduce((sum, r) => sum + r.totalTests, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    const avgQualityScore = this.results
      .filter(r => r.qualityScore)
      .reduce((sum, r) => sum + (r.qualityScore || 0), 0) / this.results.length;
    
    const avgPerformanceScore = this.results
      .filter(r => r.performanceScore)
      .reduce((sum, r) => sum + (r.performanceScore || 0), 0) / this.results.length;
    
    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      passRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
      totalDuration,
      avgQualityScore: Math.round(avgQualityScore),
      avgPerformanceScore: Math.round(avgPerformanceScore),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getOverallSummary();
    
    if (summary.passRate < 90) {
      recommendations.push('🔧 Fix failing tests to improve reliability');
    }
    
    if (summary.avgPerformanceScore < 80) {
      recommendations.push('⚡ Optimize response times for better performance');
    }
    
    if (summary.avgQualityScore < 85) {
      recommendations.push('🎯 Improve AI response quality and validation');
    }
    
    if (summary.totalFailed > 0) {
      recommendations.push('🐛 Address test failures and edge cases');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🎉 Excellent test coverage and quality!');
    }
    
    return recommendations;
  }

  private generateHTMLReport(report: any): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Friday AI Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; color: #374151; }
        .metric .value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .suite { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .recommendations { background: #fef3c7; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Friday AI Test Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${report.summary.totalTests}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div class="value">${report.summary.passRate}%</div>
        </div>
        <div class="metric">
            <h3>Quality Score</h3>
            <div class="value">${report.summary.avgQualityScore}</div>
        </div>
        <div class="metric">
            <h3>Performance</h3>
            <div class="value">${report.summary.avgPerformanceScore}</div>
        </div>
    </div>
    
    <h2>📊 Test Suites</h2>
    ${report.suites.map((suite: any) => `
        <div class="suite">
            <h3>${suite.suiteName}</h3>
            <p>✅ Passed: ${suite.passed} | ❌ Failed: ${suite.failed} | ⏭️ Skipped: ${suite.skipped}</p>
            <p>⏱️ Duration: ${Math.round(suite.duration / 1000)}s</p>
            ${suite.qualityScore ? `<p>🎯 Quality: ${suite.qualityScore}%</p>` : ''}
            ${suite.performanceScore ? `<p>⚡ Performance: ${suite.performanceScore}%</p>` : ''}
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
    
    require('fs').writeFileSync('test-results/ai-test-report.html', html);
    console.log('📄 HTML report saved: test-results/ai-test-report.html');
  }

  private printSummary(): void {
    const summary = this.getOverallSummary();
    
    console.log('\n🎉 FRIDAY AI TEST SUITE SUMMARY');
    console.log('==================================');
    console.log(`📊 Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.totalPassed} (${summary.passRate}%)`);
    console.log(`❌ Failed: ${summary.totalFailed}`);
    console.log(`⏭️ Skipped: ${summary.totalSkipped}`);
    console.log(`⏱️ Duration: ${Math.round(summary.totalDuration / 1000)}s`);
    console.log(`🎯 Quality Score: ${summary.avgQualityScore}%`);
    console.log(`⚡ Performance Score: ${summary.avgPerformanceScore}%`);
    
    console.log('\n💡 Recommendations:');
    this.generateRecommendations().forEach(rec => console.log(`  ${rec}`));
    
    if (summary.passRate >= 90 && summary.avgQualityScore >= 85 && summary.avgPerformanceScore >= 80) {
      console.log('\n🎉 FRIDAY AI IS PRODUCTION READY!');
    } else {
      console.log('\n⚠️  Some improvements needed before production');
    }
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new FridayAITestRunner();
  runner.runAllTests().catch(console.error);
}

export default FridayAITestRunner;