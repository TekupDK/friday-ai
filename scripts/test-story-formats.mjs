/**
 * Simple Phase 0 Story Test (Windows Compatible)
 * 
 * Tests story URLs manually to find correct IDs
 */

import { execSync } from 'child_process';

// Test different story ID formats
const testStoryIds = async () => {
  console.log('🔍 Testing Phase 0 Story ID Formats...\n');
  
  const components = [
    { name: 'AppleButton', formats: [
      'apple-ui-applebutton--primary',
      'apple-ui-applebutton',
      'applebutton--primary',
      'crm-apple-ui-applebutton--primary'
    ]},
    { name: 'AppleInput', formats: [
      'apple-ui-appleinput--default',
      'apple-ui-appleinput',
      'appleinput--default',
      'crm-apple-ui-appleinput--default'
    ]},
    { name: 'AppleModal', formats: [
      'apple-ui-applemodal--default',
      'apple-ui-applemodal',
      'applemodal--default',
      'crm-apple-ui-applemodal--default'
    ]},
    { name: 'AppleBadge', formats: [
      'apple-ui-applebadge--new',
      'apple-ui-applebadge',
      'applebadge--new',
      'crm-apple-ui-applebadge--new'
    ]},
    { name: 'AppleCard', formats: [
      'apple-ui-applecard--elevated',
      'apple-ui-applecard',
      'applecard--elevated',
      'crm-apple-ui-applecard--elevated'
    ]},
    { name: 'ScrollToTop', formats: [
      'apple-ui-scrolltotop--default',
      'apple-ui-scrolltotop',
      'scrolltotop--default',
      'crm-apple-ui-scrolltotop--default'
    ]}
  ];
  
  let totalFound = 0;
  
  for (const component of components) {
    console.log(`Testing ${component.name}...`);
    let found = false;
    
    for (const storyId of component.formats) {
      const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;
      
      try {
        // Use PowerShell on Windows for better compatibility
        const command = `powershell -Command "try { \$response = Invoke-WebRequest -Uri '${url}' -TimeoutSec 5; \$response.StatusCode } catch { '404' }"`;
        const result = execSync(command, { encoding: 'utf8' }).trim();
        
        if (result === '200') {
          console.log(`  ✅ Found: ${storyId}`);
          found = true;
          totalFound++;
          break;
        } else {
          console.log(`  ❌ Failed: ${storyId}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${storyId} - ${error.message}`);
      }
    }
    
    if (!found) {
      console.log(`  ⚠️  No working format found for ${component.name}`);
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Results: ${totalFound}/${components.length} components found`);
  
  if (totalFound < components.length) {
    console.log('\n💡 Next steps:');
    console.log('1. Check Storybook sidebar for actual story names');
    console.log('2. Visit http://localhost:6006 to see available stories');
    console.log('3. Check story file titles in client/src/components/crm/apple-ui/');
  }
};

// Run the test
testStoryIds().catch(console.error);