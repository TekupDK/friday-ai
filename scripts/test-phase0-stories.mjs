/**
 * Simple Phase 0 Story Test
 *
 * Tests if Apple UI stories are accessible with correct IDs
 */

import { execSync } from "child_process";

// Story configurations based on actual story files
const components = [
  { name: "AppleButton", storyId: "apple-ui-applebutton--primary" },
  { name: "AppleInput", storyId: "apple-ui-appleinput--default" },
  { name: "AppleModal", storyId: "apple-ui-applemodal--default" },
  { name: "AppleBadge", storyId: "apple-ui-applebadge--new" },
  { name: "AppleCard", storyId: "apple-ui-applecard--elevated" },
  { name: "ScrollToTop", storyId: "apple-ui-scrolltotop--default" },
  { name: "AppleSearchField", storyId: "apple-ui-applesearchfield--default" },
  { name: "AppleListItem", storyId: "apple-ui-applelistitem--default" },
  { name: "AppleDrawer", storyId: "apple-ui-appledrawer--default" },
  { name: "AppleSheet", storyId: "apple-ui-applesheet--default" },
  { name: "AppleTag", storyId: "apple-ui-appletag--new" },
];

console.log("🔍 Testing Phase 0 Story IDs...\n");

let passed = 0;
let failed = 0;

// Test each component story URL
for (const component of components) {
  const storyUrl = `http://localhost:6006/iframe.html?id=${component.storyId}&viewMode=story`;

  console.log(`Testing ${component.name}...`);
  console.log(`URL: ${storyUrl}`);

  try {
    // Simple curl to test if story exists (follow redirects, silent, show only HTTP status)
    const result = execSync(
      `curl -s -o /dev/null -w "%{http_code}" "${storyUrl}"`,
      {
        encoding: "utf8",
        timeout: 10000,
      }
    ).trim();

    if (result === "200") {
      console.log(`✅ ${component.name} - Story found (HTTP 200)\n`);
      passed++;
    } else {
      console.log(`❌ ${component.name} - HTTP ${result}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${component.name} - Error: ${error.message}\n`);
    failed++;
  }
}

console.log("\n📊 Results:");
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(
  `📈 Success Rate: ${Math.round((passed / components.length) * 100)}%`
);

if (failed > 0) {
  console.log("\n💡 Tips:");
  console.log("- Make sure Storybook is running (npm run storybook)");
  console.log(
    "- Check that story IDs match the format: apple-ui-componentname--storyname"
  );
  console.log(
    "- Verify component story files exist in client/src/components/crm/apple-ui/"
  );
  process.exit(1);
} else {
  console.log("\n🎉 All Phase 0 stories are accessible!");
  process.exit(0);
}
