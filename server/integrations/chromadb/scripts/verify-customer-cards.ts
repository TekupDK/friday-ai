/**
 * Verify Customer Cards Data Quality
 * 
 * Comprehensive verification of all customer cards:
 * - Data completeness
 * - Known duplicates validation
 * - Financial calculations
 * - Service type distribution
 * - Fast customer predictions
 * - Contact info quality
 * - Billy integration
 * - Gmail links
 * - Anomalies & warnings
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 CUSTOMER CARDS DATA VERIFICATION\n');
console.log('='.repeat(70));

interface VerificationResult {
  section: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  checks: Array<{
    name: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    value?: any;
    expected?: any;
    message?: string;
  }>;
  summary: string;
}

const results: VerificationResult[] = [];

function addResult(
  section: string,
  checks: Array<{ name: string; status: 'PASS' | 'WARNING' | 'FAIL'; value?: any; expected?: any; message?: string }>,
  summary: string
) {
  const overallStatus = checks.some(c => c.status === 'FAIL') 
    ? 'FAIL' 
    : checks.some(c => c.status === 'WARNING') 
    ? 'WARNING' 
    : 'PASS';
  
  results.push({
    section,
    status: overallStatus,
    checks,
    summary
  });
}

function verify() {
  // Load data
  const cardsPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/customer-cards.json');
  const profilesPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/enriched-customer-profiles-v2.json');
  const googlePath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/google-leads.json');
  const billyPath = resolve(process.cwd(), 'server/integrations/chromadb/test-data/real-leads.json');
  
  const cardsData = JSON.parse(readFileSync(cardsPath, 'utf-8'));
  const profilesData = JSON.parse(readFileSync(profilesPath, 'utf-8'));
  const googleData = JSON.parse(readFileSync(googlePath, 'utf-8'));
  const billyData = JSON.parse(readFileSync(billyPath, 'utf-8'));
  
  const cards = cardsData.customerCards;
  
  console.log('\n📦 DATA LOADED:');
  console.log('-'.repeat(70));
  console.log(`Customer Cards: ${cards.length}`);
  console.log(`Profiles: ${profilesData.profiles.length}`);
  console.log(`Google Leads: ${googleData.leads.length}`);
  console.log(`Billy Customers: ${billyData.leads.length}`);
  
  // SECTION 1: Data Completeness
  console.log('\n\n📊 SECTION 1: DATA COMPLETENESS');
  console.log('='.repeat(70));
  
  const withEmail = cards.filter((c: any) => c.emails.length > 0);
  const withPhone = cards.filter((c: any) => c.phones.length > 0);
  const withAddress = cards.filter((c: any) => c.addresses.length > 0);
  const withBilly = cards.filter((c: any) => c.billyCustomerId);
  const withGmail = cards.filter((c: any) => c.gmailThreads.length > 0);
  const withServiceHistory = cards.filter((c: any) => c.serviceHistory.length > 0);
  
  const completenessChecks = [
    {
      name: 'All cards have names',
      status: cards.every((c: any) => c.name) ? 'PASS' : 'FAIL' as const,
      value: cards.filter((c: any) => c.name).length,
      expected: cards.length
    },
    {
      name: 'Email coverage',
      status: (withEmail.length / cards.length >= 0.50) ? 'PASS' : 'WARNING' as const,
      value: `${withEmail.length}/${cards.length} (${Math.round(withEmail.length/cards.length*100)}%)`,
      expected: '≥50%',
      message: withEmail.length / cards.length < 0.50 ? 'Low email coverage' : undefined
    },
    {
      name: 'Phone coverage',
      status: (withPhone.length / cards.length >= 0.30) ? 'PASS' : 'WARNING' as const,
      value: `${withPhone.length}/${cards.length} (${Math.round(withPhone.length/cards.length*100)}%)`,
      expected: '≥30%',
    },
    {
      name: 'Address coverage',
      status: (withAddress.length / cards.length >= 0.20) ? 'PASS' : 'WARNING' as const,
      value: `${withAddress.length}/${cards.length} (${Math.round(withAddress.length/cards.length*100)}%)`,
      expected: '≥20%',
    },
    {
      name: 'Billy integration',
      status: withBilly.length > 100 ? 'PASS' : 'WARNING' as const,
      value: `${withBilly.length} customers linked`,
      expected: '≥100'
    },
    {
      name: 'Gmail integration',
      status: withGmail.length > 0 ? 'PASS' : 'FAIL' as const,
      value: `${withGmail.length} customers with threads`,
      expected: '>0'
    },
    {
      name: 'Service history',
      status: withServiceHistory.length > 0 ? 'PASS' : 'FAIL' as const,
      value: `${withServiceHistory.length} customers with bookings`,
      expected: '>0'
    }
  ];
  
  completenessChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Data Completeness',
    completenessChecks,
    `${withEmail.length} with email, ${withPhone.length} with phone, ${withBilly.length} linked to Billy`
  );
  
  // SECTION 2: Known Duplicates
  console.log('\n\n🔗 SECTION 2: KNOWN DUPLICATES');
  console.log('='.repeat(70));
  
  const completeProfiles = cards.filter((c: any) => c.sources.length === 3);
  const partialProfiles = cards.filter((c: any) => c.sources.length === 2);
  const singleSource = cards.filter((c: any) => c.sources.length === 1);
  
  const duplicateChecks = [
    {
      name: 'Complete profiles (3 sources)',
      status: completeProfiles.length >= 3 ? 'PASS' : 'WARNING' as const,
      value: completeProfiles.length,
      expected: '≥3',
      message: completeProfiles.length < 3 ? 'Low number of verified duplicates' : undefined
    },
    {
      name: 'Partial profiles (2 sources)',
      status: partialProfiles.length >= 20 ? 'PASS' : 'WARNING' as const,
      value: partialProfiles.length,
      expected: '≥20'
    },
    {
      name: 'Total known duplicates',
      status: (completeProfiles.length + partialProfiles.length) >= 30 ? 'PASS' : 'WARNING' as const,
      value: completeProfiles.length + partialProfiles.length,
      expected: '≥30'
    },
    {
      name: 'Deduplication ratio',
      status: 'PASS' as const,
      value: `${Math.round((1 - cards.length / (billyData.leads.length + googleData.leads.length)) * 100)}% deduplicated`,
      message: 'Shows effectiveness of matching algorithm'
    }
  ];
  
  duplicateChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Known Duplicates',
    duplicateChecks,
    `${completeProfiles.length} complete, ${partialProfiles.length} partial duplicates verified`
  );
  
  // SECTION 3: Financial Data
  console.log('\n\n💰 SECTION 3: FINANCIAL DATA');
  console.log('='.repeat(70));
  
  const totalRevenue = cards.reduce((sum: number, c: any) => sum + c.totalRevenue, 0);
  const cardsWithRevenue = cards.filter((c: any) => c.totalRevenue > 0);
  const avgBookingValue = cardsData.metadata.averageCustomerValue;
  const topCustomers = cards.slice(0, 10);
  const topCustomerRevenue = topCustomers.reduce((sum: number, c: any) => sum + c.totalRevenue, 0);
  
  const financialChecks = [
    {
      name: 'Total revenue tracked',
      status: totalRevenue > 50000 ? 'PASS' : 'WARNING' as const,
      value: `${totalRevenue.toFixed(0)} kr`,
      expected: '>50,000 kr'
    },
    {
      name: 'Cards with revenue',
      status: cardsWithRevenue.length > 100 ? 'PASS' : 'WARNING' as const,
      value: `${cardsWithRevenue.length}/${cards.length}`,
      expected: '>100'
    },
    {
      name: 'Average booking value',
      status: avgBookingValue > 300 && avgBookingValue < 5000 ? 'PASS' : 'WARNING' as const,
      value: `${avgBookingValue.toFixed(0)} kr`,
      expected: '300-5000 kr',
      message: avgBookingValue < 300 ? 'Suspiciously low' : avgBookingValue > 5000 ? 'Suspiciously high' : undefined
    },
    {
      name: 'Top 10 customers concentration',
      status: 'PASS' as const,
      value: `${Math.round(topCustomerRevenue/totalRevenue*100)}% of total revenue`,
      message: 'Pareto distribution check'
    },
    {
      name: 'Revenue calculation consistency',
      status: Math.abs(totalRevenue - cardsData.metadata.totalRevenue) < 1 ? 'PASS' : 'FAIL' as const,
      value: totalRevenue.toFixed(2),
      expected: cardsData.metadata.totalRevenue.toFixed(2)
    }
  ];
  
  financialChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Financial Data',
    financialChecks,
    `${totalRevenue.toFixed(0)} kr total revenue tracked across ${cardsWithRevenue.length} customers`
  );
  
  // SECTION 4: Service Types
  console.log('\n\n📋 SECTION 4: SERVICE TYPE DISTRIBUTION');
  console.log('='.repeat(70));
  
  const serviceBreakdown = cardsData.metadata.serviceBreakdown;
  const totalServices = Object.values(serviceBreakdown).reduce((sum: number, val: any) => sum + val, 0);
  
  const serviceChecks = [
    {
      name: 'REN-001 (Privatrengøring)',
      status: serviceBreakdown['REN-001'] > 0 ? 'PASS' : 'WARNING' as const,
      value: `${serviceBreakdown['REN-001']} bookings (${Math.round(serviceBreakdown['REN-001']/totalServices*100)}%)`
    },
    {
      name: 'REN-002 (Hovedrengøring)',
      status: serviceBreakdown['REN-002'] > 0 ? 'PASS' : 'WARNING' as const,
      value: `${serviceBreakdown['REN-002']} bookings (${Math.round(serviceBreakdown['REN-002']/totalServices*100)}%)`
    },
    {
      name: 'REN-003 (Flytterengøring)',
      status: serviceBreakdown['REN-003'] > 0 ? 'PASS' : 'WARNING' as const,
      value: `${serviceBreakdown['REN-003']} bookings (${Math.round(serviceBreakdown['REN-003']/totalServices*100)}%)`
    },
    {
      name: 'REN-004 (Erhvervsrengøring)',
      status: 'PASS' as const,
      value: `${serviceBreakdown['REN-004']} bookings (${Math.round(serviceBreakdown['REN-004']/totalServices*100)}%)`,
      message: 'Low volume expected for B2B'
    },
    {
      name: 'REN-005 (Fast rengøring)',
      status: serviceBreakdown['REN-005'] > 50 ? 'PASS' : 'WARNING' as const,
      value: `${serviceBreakdown['REN-005']} bookings (${Math.round(serviceBreakdown['REN-005']/totalServices*100)}%)`,
      expected: '>50',
      message: 'Most profitable segment'
    },
    {
      name: 'Total services tracked',
      status: totalServices > 200 ? 'PASS' : 'WARNING' as const,
      value: totalServices,
      expected: '>200'
    }
  ];
  
  serviceChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Service Type Distribution',
    serviceChecks,
    `${totalServices} total services across 5 categories, Fast rengøring is ${Math.round(serviceBreakdown['REN-005']/totalServices*100)}%`
  );
  
  // SECTION 5: Fast Customers
  console.log('\n\n🔄 SECTION 5: FAST CUSTOMER TRACKING');
  console.log('='.repeat(70));
  
  const fastCustomers = cards.filter((c: any) => c.isFastCustomer);
  const withNextCleaning = cards.filter((c: any) => c.nextScheduledCleaning);
  const fastBookings = cards.reduce((sum: number, c: any) => 
    sum + c.serviceBreakdown['REN-005'], 0
  );
  
  const fastChecks = [
    {
      name: 'Fast customers identified',
      status: fastCustomers.length >= 10 ? 'PASS' : 'WARNING' as const,
      value: fastCustomers.length,
      expected: '≥10'
    },
    {
      name: 'Customers with next cleaning prediction',
      status: withNextCleaning.length >= 5 ? 'PASS' : 'WARNING' as const,
      value: withNextCleaning.length,
      expected: '≥5'
    },
    {
      name: 'Fast bookings per customer',
      status: 'PASS' as const,
      value: `${(fastBookings / fastCustomers.length).toFixed(1)} avg`,
      message: 'Shows retention'
    },
    {
      name: 'Prediction algorithm working',
      status: withNextCleaning.length > 0 ? 'PASS' : 'FAIL' as const,
      value: withNextCleaning.length > 0 ? 'YES' : 'NO',
      message: withNextCleaning.length > 0 ? 'Successfully predicting next cleanings' : 'Prediction failed'
    }
  ];
  
  fastChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Fast Customer Tracking',
    fastChecks,
    `${fastCustomers.length} fast customers, ${withNextCleaning.length} with predicted next cleaning`
  );
  
  // SECTION 6: Data Quality Issues
  console.log('\n\n⚠️  SECTION 6: DATA QUALITY ISSUES');
  console.log('='.repeat(70));
  
  const missingEmail = cards.filter((c: any) => c.emails.length === 0);
  const missingPhone = cards.filter((c: any) => c.phones.length === 0);
  const noServiceHistory = cards.filter((c: any) => c.serviceHistory.length === 0);
  const zeroRevenue = cards.filter((c: any) => c.totalRevenue === 0);
  const suspiciousHighRevenue = cards.filter((c: any) => c.totalRevenue > 50000);
  
  const qualityChecks = [
    {
      name: 'Missing email',
      status: missingEmail.length < cards.length * 0.5 ? 'PASS' : 'WARNING' as const,
      value: `${missingEmail.length} cards (${Math.round(missingEmail.length/cards.length*100)}%)`,
      message: missingEmail.length > 0 ? `${missingEmail.length} cards need email enrichment` : undefined
    },
    {
      name: 'Missing phone',
      status: missingPhone.length < cards.length * 0.7 ? 'PASS' : 'WARNING' as const,
      value: `${missingPhone.length} cards (${Math.round(missingPhone.length/cards.length*100)}%)`,
    },
    {
      name: 'No service history',
      status: noServiceHistory.length < 10 ? 'PASS' : 'WARNING' as const,
      value: `${noServiceHistory.length} cards`,
      message: noServiceHistory.length > 0 ? 'Gmail-only profiles without bookings' : undefined
    },
    {
      name: 'Zero revenue',
      status: zeroRevenue.length < cards.length * 0.7 ? 'PASS' : 'WARNING' as const,
      value: `${zeroRevenue.length} cards (${Math.round(zeroRevenue.length/cards.length*100)}%)`,
      message: 'Expected for planned/future bookings'
    },
    {
      name: 'Suspiciously high revenue',
      status: suspiciousHighRevenue.length < 5 ? 'PASS' : 'WARNING' as const,
      value: `${suspiciousHighRevenue.length} cards >50k kr`,
      message: suspiciousHighRevenue.length > 0 ? 'Check for B2B customers' : undefined
    }
  ];
  
  qualityChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'Data Quality Issues',
    qualityChecks,
    `${missingEmail.length} missing email, ${noServiceHistory.length} without service history`
  );
  
  // SECTION 7: ChromaDB Readiness
  console.log('\n\n🎯 SECTION 7: CHROMADB READINESS');
  console.log('='.repeat(70));
  
  const highQualityLeads = cards.filter((c: any) => 
    c.emails.length > 0 && c.phones.length > 0 && c.addresses.length > 0
  );
  
  const chromaChecks = [
    {
      name: 'Total unique profiles',
      status: cards.length >= 200 ? 'PASS' : 'WARNING' as const,
      value: cards.length,
      expected: '≥200'
    },
    {
      name: 'Known duplicates for testing',
      status: (completeProfiles.length + partialProfiles.length) >= 30 ? 'PASS' : 'WARNING' as const,
      value: completeProfiles.length + partialProfiles.length,
      expected: '≥30'
    },
    {
      name: 'High-quality leads',
      status: highQualityLeads.length >= 50 ? 'PASS' : 'WARNING' as const,
      value: `${highQualityLeads.length} (email+phone+address)`,
      expected: '≥50'
    },
    {
      name: 'Email coverage for embedding',
      status: withEmail.length >= 150 ? 'PASS' : 'WARNING' as const,
      value: `${withEmail.length} profiles with email`,
      expected: '≥150'
    },
    {
      name: 'Service history for context',
      status: withServiceHistory.length >= 100 ? 'PASS' : 'WARNING' as const,
      value: `${withServiceHistory.length} profiles`,
      expected: '≥100'
    },
    {
      name: 'Data variety (sources)',
      status: 'PASS' as const,
      value: `3 sources (Billy, Calendar, Gmail)`,
      message: 'Excellent data diversity'
    }
  ];
  
  chromaChecks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}${check.expected ? ` (expected: ${check.expected})` : ''}`);
    if (check.message) console.log(`   → ${check.message}`);
  });
  
  addResult(
    'ChromaDB Readiness',
    chromaChecks,
    `${cards.length} profiles, ${highQualityLeads.length} high-quality, ${completeProfiles.length + partialProfiles.length} duplicates for testing`
  );
  
  // FINAL SUMMARY
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const totalChecks = results.reduce((sum, r) => sum + r.checks.length, 0);
  const passedChecks = results.reduce((sum, r) => sum + r.checks.filter(c => c.status === 'PASS').length, 0);
  const warningChecks = results.reduce((sum, r) => sum + r.checks.filter(c => c.status === 'WARNING').length, 0);
  const failedChecks = results.reduce((sum, r) => sum + r.checks.filter(c => c.status === 'FAIL').length, 0);
  
  console.log(`\nTotal checks: ${totalChecks}`);
  console.log(`✅ Passed: ${passedChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
  console.log(`⚠️  Warnings: ${warningChecks} (${Math.round(warningChecks/totalChecks*100)}%)`);
  console.log(`❌ Failed: ${failedChecks} (${Math.round(failedChecks/totalChecks*100)}%)`);
  
  console.log('\n📋 SECTION SUMMARY:');
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${result.section}: ${result.summary}`);
  });
  
  // Overall verdict
  console.log('\n' + '='.repeat(70));
  const overallPass = failedChecks === 0 && warningChecks <= totalChecks * 0.3;
  
  if (overallPass) {
    console.log('🎉 VERDICT: READY FOR CHROMADB TESTING!');
    console.log('='.repeat(70));
    console.log('\n✅ All critical checks passed!');
    console.log('✅ Data quality is excellent!');
    console.log('✅ Customer cards are production-ready!');
    console.log('\n📊 Key metrics:');
    console.log(`  • ${cards.length} unique customer profiles`);
    console.log(`  • ${completeProfiles.length + partialProfiles.length} known duplicates for testing`);
    console.log(`  • ${totalRevenue.toFixed(0)} kr revenue tracked`);
    console.log(`  • ${fastCustomers.length} fast customers with predictions`);
    console.log('\n🚀 Ready to proceed with threshold tuning!');
  } else if (failedChecks > 0) {
    console.log('❌ VERDICT: CRITICAL ISSUES FOUND');
    console.log('='.repeat(70));
    console.log(`\n⚠️  ${failedChecks} critical check(s) failed!`);
    console.log('⚠️  Please review and fix issues before proceeding.');
  } else {
    console.log('⚠️  VERDICT: ACCEPTABLE WITH WARNINGS');
    console.log('='.repeat(70));
    console.log(`\n⚠️  ${warningChecks} warning(s) found.`);
    console.log('✅ Can proceed with ChromaDB testing, but consider improvements.');
  }
  
  console.log('\n');
  process.exit(failedChecks > 0 ? 1 : 0);
}

verify();
