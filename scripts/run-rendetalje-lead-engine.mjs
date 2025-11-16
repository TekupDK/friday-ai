import { workflowAutomation } from "../server/workflow-automation.ts";

async function main() {
  const res = await workflowAutomation.runRendetaljeLeadEngine({ dryRun: true, daysBack: 90 });
  console.log("\n=== Rendetalje Lead Engine Rapport (Dry-Run) ===\n");
  console.log(res.reportText);
}

main().catch(err => {
  console.error("Run failed:", err);
  process.exit(1);
});
