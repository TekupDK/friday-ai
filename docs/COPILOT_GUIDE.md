# GitHub Copilot Guide for Friday AI

This repository is optimized for GitHub Copilot. We use custom agents and prompt files to streamline development.

## 🤖 Custom Agents (@)

Use these agents in Copilot Chat to get specialized help.

### Core Agents
- **@Planner**: High-level planning. Read-only. Starts the workflow.
- **@Implementer**: The builder. Writes code, runs builds, fixes errors.
- **@Reviewer**: The gatekeeper. Reviews code for quality and security.
- **@QA**: The tester. Writes and runs Vitest/Playwright tests.

### Specialist Agents
- **@Frontend**: React, Tailwind, Shadcn, Storybook.
- **@Backend**: Node, tRPC, Zod, Express.
- **@Database**: Drizzle, Postgres, SQL.

### Workflow Example
1. Ask **@Planner**: _"Plan a new 'Notes' feature for leads."_
2. **@Planner** creates a plan. Click **"Start Implementation"** (handoff to @Implementer).
3. **@Implementer** writes the code.
4. Ask **@QA**: _"Write tests for the new Notes feature."_
5. Ask **@Reviewer**: _"Review the Notes feature."_

## ⚡ Prompt Files (/)

We sync prompts from \.cursor/commands\ to Copilot. Type \/\ in chat to see them.

- **/session-init**: Initialize a coding session with context.
- **/test-generate**: Generate comprehensive tests.
- **/doc-update**: Update documentation.
- ...and many more.

## 🛠️ Configuration

- **Prompts**: Located in \.github/prompts/\. Synced automatically via GitHub Actions.
- **Agents**: Located in \.github/agents/\.
- **Instructions**: Global instructions in \.github/copilot-instructions.md\.

## 💡 Tips

- **Be specific**: "Use @Frontend to fix the alignment on the lead card."
- **Iterate**: If an agent gets it wrong, give feedback. They maintain context.
- **Use Handoffs**: The agents are designed to work together. Use the buttons in the chat to pass context.
