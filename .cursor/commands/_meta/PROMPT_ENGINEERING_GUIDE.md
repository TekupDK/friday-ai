# Prompt Engineering Guide - Friday AI Chat Commands

This document explains the prompt engineering techniques used in Friday AI Chat commands, aligned with OpenAI's latest best practices (2025).

## Core Prompt Engineering Techniques

### 1. **ROLE & CONTEXT** (Role Definition + Context Setting)

**Technique:** Clear role definition with project-specific context

**Why it works:**

- Sets AI's "persona" and expertise level
- Provides domain-specific knowledge
- Reduces ambiguity about scope and constraints

**Example:**

```markdown
## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Framework:** tRPC 11 with Express 4
- **Database:** Drizzle ORM with MySQL/TiDB
- **Approach:** Minimal safe patches, preserve existing behavior
```

**OpenAI Best Practice:** "Be clear and specific" - Define the role explicitly

---

### 2. **CODEBASE PATTERNS** (Few-Shot Examples)

**Technique:** Provide concrete code examples from the actual codebase

**Why it works:**

- Shows exact patterns to follow
- Reduces style inconsistencies
- Helps AI understand project conventions
- Acts as "few-shot learning" examples

**Example:**

````markdown
## CODEBASE PATTERNS (Follow These Exactly)

### Example: Mutation Pattern

```typescript
createOpportunity: protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ ctx, input }) => {
    // Exact pattern from codebase
  })
```
````

````

**OpenAI Best Practice:** "Few-shot prompting" - Show examples of desired output

---

### 3. **CRITICAL: START IMMEDIATELY** (Action-Oriented Instructions)

**Technique:** Explicit instructions to act, not just plan

**Why it works:**
- Reduces "analysis paralysis"
- Forces immediate execution
- Clarifies expected behavior (DO vs DO NOT)

**Example:**
```markdown
## CRITICAL: START FIXING IMMEDIATELY

**DO NOT:**
- Just describe the bug
- Wait for approval
- Show a plan without fixing

**DO:**
- Start investigating immediately
- Fix using tools
- Verify the fix works
````

**OpenAI Best Practice:** "Clear instructions" - Be explicit about what to do

---

### 4. **IMPLEMENTATION STEPS** (Step-by-Step Reasoning)

**Technique:** Break complex tasks into numbered, sequential steps

**Why it works:**

- Guides AI through logical flow
- Ensures nothing is missed
- Makes process transparent
- Enables verification at each step

**Example:**

```markdown
## IMPLEMENTATION STEPS

1. **Determine documentation type:**
   - Feature doc? → `docs/[feature].md`
   - API doc? → `docs/API_REFERENCE.md`

2. **Write overview:**
   - What it does
   - Why it exists
   - Key concepts
```

**OpenAI Best Practice:** "Chain-of-thought" - Break down complex tasks

---

### 5. **VERIFICATION** (Output Validation)

**Technique:** Checklist to verify completion and quality

**Why it works:**

- Ensures completeness
- Provides self-check mechanism
- Reduces errors
- Sets quality standards

**Example:**

```markdown
## VERIFICATION

After implementation:

- ✅ Clear overview provided
- ✅ API documented (if applicable)
- ✅ Examples included
- ✅ Follows project standards
```

**OpenAI Best Practice:** "Iterative refinement" - Check and verify output

---

### 6. **OUTPUT FORMAT** (Structured Output)

**Technique:** Define exact format for AI's response

**Why it works:**

- Ensures consistent structure
- Makes output parseable
- Reduces formatting errors
- Improves readability

**Example:**

````markdown
## OUTPUT FORMAT

```markdown
### Documentation Added: [Feature/Code]

**Type:** [Feature Doc / API Doc / Inline / README]

**Location:**

- `docs/[feature].md` - [if feature doc]

**Sections Added:**

- Overview: [summary]
- API Reference: [if applicable]
```
````

````

**OpenAI Best Practice:** "Output formatting" - Specify desired structure

---

## Advanced Techniques

### 7. **REFERENCE TEXTS** (Context Injection)

**Technique:** Include specific reference materials, documentation, or examples in the prompt

**Why it works:**
- Provides exact context AI should use
- Reduces hallucination
- Ensures accuracy
- Improves relevance

**Example:**
```markdown
## REFERENCE MATERIALS

**Architecture Documentation:**
- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/API_REFERENCE.md` - API endpoints and patterns

**Code Examples:**
- `server/routers/crm-extensions-router.ts` - CRM router patterns
- `server/db.ts` - Database helper patterns
````

**OpenAI Best Practice:** "Give reference texts" - Include specific materials to use

---

### 8. **REASONING STEPS** (Give Model Time to Think)

**Technique:** Explicitly ask AI to reason through steps before answering

**Why it works:**

- Improves accuracy by forcing logical flow
- Reduces errors from rushing
- Makes thinking process transparent
- Enables better problem-solving

**Example:**

```markdown
## REASONING PROCESS

Before implementing, think through:

1. **Understand the problem:**
   - What is the exact issue?
   - What is the expected behavior?
   - What is the current behavior?

2. **Analyze the code:**
   - Where is the problem located?
   - What patterns are used?
   - What dependencies exist?

3. **Design the solution:**
   - What is the minimal fix?
   - What are the edge cases?
   - What tests are needed?

4. **Implement:**
   - Apply the fix
   - Verify it works
   - Test edge cases
```

**OpenAI Best Practice:** "Give model time to think" - Request step-by-step reasoning

---

### 9. **TOOL USAGE** (External Tools Integration)

**Technique:** Explicitly instruct AI to use available tools

**Why it works:**

- Ensures AI uses tools instead of guessing
- Improves accuracy
- Enables real-time data access
- Reduces errors

**Example:**

```markdown
## TOOL USAGE

**Use these tools:**

- `read_file` - Read code files to understand patterns
- `codebase_search` - Search for similar implementations
- `grep` - Find specific patterns in code
- `run_terminal_cmd` - Run tests and commands

**DO NOT:**

- Guess file contents
- Assume patterns exist
- Skip verification steps
```

**OpenAI Best Practice:** "Use external tools" - Integrate with tools and databases

---

### 10. **TONE SPECIFICATION** (Communication Style)

**Technique:** Explicitly define the tone and style of output

**Why it works:**

- Ensures consistent communication style
- Matches audience expectations
- Improves readability
- Sets professional standards

**Example:**

```markdown
## COMMUNICATION STYLE

- **Tone:** Professional, clear, concise
- **Audience:** Senior engineers familiar with TypeScript
- **Style:** Technical but accessible
- **Format:** Markdown with code examples
- **Language:** English (or Danish for Danish commands)
```

**OpenAI Best Practice:** "Specify tone" - Use descriptive adjectives for desired tone

---

### 11. **ITERATIVE REFINEMENT** (Test and Adjust)

**Technique:** Explicitly include iterative improvement process

**Why it works:**

- Encourages quality improvement
- Enables error correction
- Supports learning from feedback
- Improves final output

**Example:**

```markdown
## ITERATIVE PROCESS

1. **Initial Implementation:**
   - Implement basic solution
   - Follow patterns
   - Add basic tests

2. **Review and Refine:**
   - Check for errors
   - Verify patterns match
   - Improve code quality
   - Add edge case handling

3. **Final Verification:**
   - Run all tests
   - Check type safety
   - Verify documentation
   - Confirm standards compliance
```

**OpenAI Best Practice:** "Test and adjust" - Iteratively refine prompts and outputs

---

### 12. **TASK Definition** (Clear Objective)

**Technique:** Single, clear statement of what to accomplish

**Why it works:**

- Focuses AI on primary goal
- Reduces scope creep
- Makes success criteria clear

**Example:**

```markdown
## TASK

Add comprehensive documentation for code/feature following Friday AI Chat documentation patterns exactly.
```

---

### 13. **GUIDELINES** (Constraints & Best Practices)

**Technique:** List of constraints, preferences, and best practices

**Why it works:**

- Prevents common mistakes
- Enforces project standards
- Guides decision-making
- Sets boundaries

**Example:**

```markdown
## GUIDELINES

- **Be precise:** Only commit files you modified in this session
- **Verify:** Check `git diff` before committing
- **Exclude:** Don't commit files that were already modified
```

---

## Prompt Engineering Pattern Template

Use this template for all new commands:

```markdown
# [Command Name]

You are [role] doing [task] for Friday AI Chat. [Key constraint/approach].

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** [relevant tech stack]
- **Approach:** [key approach/philosophy]
- **Quality:** [quality standards]

## TASK

[Clear, single-sentence objective]

## COMMUNICATION STYLE

- **Tone:** [Professional / Friendly / Technical]
- **Audience:** [Senior engineers / Developers / etc.]
- **Style:** [Clear, concise, technical]
- **Format:** [Markdown with code examples]

## REFERENCE MATERIALS

- `docs/[relevant-doc].md` - [Description]
- `[code-file].ts` - [Pattern example]

## CRITICAL: [If immediate action needed]

**DO NOT:**

- [What not to do]

**DO:**

- [What to do]

## TOOL USAGE

**Use these tools:**

- `read_file` - [When to use]
- `codebase_search` - [When to use]
- `grep` - [When to use]

## REASONING PROCESS

Before implementing, think through:

1. [Reasoning step 1]
2. [Reasoning step 2]

## CODEBASE PATTERNS (Follow These Exactly)

[Concrete examples from codebase]

## IMPLEMENTATION STEPS

1. **Step 1:**
   - Sub-step
   - Sub-step

2. **Step 2:**
   - Sub-step

## VERIFICATION

After completion:

- ✅ [Check 1]
- ✅ [Check 2]

## ITERATIVE REFINEMENT

1. **Initial:** [Basic implementation]
2. **Review:** [Check and improve]
3. **Final:** [Verify quality]

## OUTPUT FORMAT

[Structured output template]

## GUIDELINES

- **Guideline 1:** [explanation]
- **Guideline 2:** [explanation]
```

---

## OpenAI Best Practices Alignment

| Technique             | OpenAI Best Practice       | Our Implementation                   | Status      |
| --------------------- | -------------------------- | ------------------------------------ | ----------- |
| ROLE & CONTEXT        | "Be clear and specific"    | ✅ Explicit role + project context   | ✅ Complete |
| CODEBASE PATTERNS     | "Few-shot prompting"       | ✅ Real code examples                | ✅ Complete |
| REFERENCE TEXTS       | "Give reference texts"     | ✅ Documentation and code references | ✅ Complete |
| REASONING STEPS       | "Give model time to think" | ✅ Step-by-step reasoning process    | ✅ Complete |
| TOOL USAGE            | "Use external tools"       | ✅ Explicit tool usage instructions  | ✅ Complete |
| TONE SPECIFICATION    | "Specify tone"             | ✅ Communication style definition    | ✅ Complete |
| CRITICAL Instructions | "Clear instructions"       | ✅ DO/DO NOT lists                   | ✅ Complete |
| IMPLEMENTATION STEPS  | "Chain-of-thought"         | ✅ Numbered sequential steps         | ✅ Complete |
| VERIFICATION          | "Output validation"        | ✅ Completion checklists             | ✅ Complete |
| ITERATIVE REFINEMENT  | "Test and adjust"          | ✅ Iterative improvement process     | ✅ Complete |
| OUTPUT FORMAT         | "Output formatting"        | ✅ Structured templates              | ✅ Complete |
| TASK Definition       | "Specific objectives"      | ✅ Single clear goal                 | ✅ Complete |
| GUIDELINES            | "Constraints"              | ✅ Best practices list               | ✅ Complete |

---

## Key Principles

1. **Specificity > Generality** - Be specific about project, stack, patterns
2. **Examples > Descriptions** - Show code, don't just describe
3. **Reference > Assumption** - Include reference materials and context
4. **Reasoning > Rushing** - Give model time to think through steps
5. **Tools > Guessing** - Use available tools explicitly
6. **Tone > Ambiguity** - Specify communication style clearly
7. **Action > Planning** - Encourage immediate execution when appropriate
8. **Structure > Freeform** - Define output format explicitly
9. **Verification > Assumption** - Always include verification steps
10. **Iteration > Perfection** - Include iterative refinement process
11. **Context > Isolation** - Provide project-specific context
12. **Constraints > Freedom** - Set clear boundaries and guidelines

---

## ChatGPT 101 Specific Techniques

Based on [ChatGPT 101: A Guide to Your AI Superassistant](https://academy.openai.com/public/videos/chatgpt-101-a-guide-to-your-ai-superassistant-recording) and [Resource Guide](https://academy.openai.com/public/clubs/work-users-ynjqu/resources/chatgpt-101-webinar-resource-guide):

### Practical Applications

1. **Brainstorming & Ideation:**
   - Use for marketing ideas, feature planning, problem-solving
   - Structure: "Brainstorm [topic] considering [constraints]"

2. **Customer Communication:**
   - Write emails, responses, documentation
   - Specify tone, audience, and key points

3. **Data Analysis:**
   - Upload data files for analysis
   - Request specific insights and visualizations

4. **Content Creation:**
   - Generate images, code, documentation
   - Specify format, style, and requirements

### Advanced Features

1. **Voice Mode & Dictation:**
   - Use for hands-free interaction
   - Effective for brainstorming and note-taking

2. **Web Search Integration:**
   - Enable web search for real-time information
   - Combine with codebase knowledge

3. **Custom GPTs:**
   - Create specialized assistants for specific tasks
   - Include knowledge base and instructions

4. **Tool Integration:**
   - Connect with internal tools and databases
   - Use for automated workflows

### Navigation & Customization

1. **Settings & Preferences:**
   - Customize model behavior
   - Set default tone and style

2. **Project Organization:**
   - Organize conversations by project
   - Use folders and naming conventions

3. **Context Management:**
   - Maintain conversation context
   - Reference previous messages

---

## Role-Specific Use Cases & Prompts

Based on OpenAI Academy role-specific resources:

### For Engineers

From [ChatGPT for Engineers](https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-engineers):

#### Research & Benchmarking

- **Evaluate cloud providers:** "I'm an infrastructure engineer evaluating cloud migration options. Context: We're moving from on-prem to the cloud for a fintech backend. Output: Compare AWS, GCP, and Azure for scalability, pricing, compliance, and developer tooling. Include citations."
- **Research frameworks:** "I'm building a real-time collaboration tool. Context: We need low-latency and scalability. Output: Compare top frameworks (e.g., SignalR, Socket.io, WebRTC) with use cases, pros/cons, and current usage by other SaaS companies. Include sources."
- **Benchmark observability tools:** "Benchmark the top observability tools. Context: We want to move from basic logging to full-stack monitoring. Output: Create a comparison table of features, pricing, integrations for Datadog, New Relic, Prometheus, and OpenTelemetry. Include sources."

#### Technical Reviews & Documentation

- **Review system design doc:** "I've drafted a technical design document for [insert project or feature]. Review it for clarity, architectural soundness, and completeness. Highlight any missing considerations or questions reviewers may raise."
- **Document internal API:** "I need to document how this internal API works for other developers. Here's the relevant code, schema, and usage examples: [insert materials]. Create clear documentation including endpoints, input/output formats, and expected behavior."
- **Write migration plan:** "Create a migration plan from [old system] to [new system]. Context: [specific constraints]. Output: Step-by-step plan with risk assessment and rollback strategy."

#### Code Generation & Debugging

- **Generate test cases:** "Generate comprehensive test cases for [function/component]. Context: [requirements]. Output: Unit tests, integration tests, and edge cases."
- **Debug performance issues:** "Analyze this performance issue: [description]. Context: [system details]. Output: Root cause analysis, potential fixes, and prevention strategies."
- **Refactor code:** "Refactor this code to improve [specific aspect]. Context: [constraints]. Output: Refactored code with explanation of changes."

#### Data Analysis & Visualization

- **Identify trends in logs:** "Analyze this CSV of product usage logs. Context: We want to identify usage trends over time and across user segments. Output: Summary stats + line or bar charts highlighting key trends."
- **Visualize error rates:** "Plot error rates over time from this dataset. Context: It contains application logs from the last month. Output: A time-series chart with callouts for error spikes and a short interpretation."
- **Analyze performance tests:** "Analyze this set of performance test results. Context: It compares two versions of our backend service. Output: Side-by-side comparison charts + text summary of improvements or regressions."

#### System Architecture & Visualization

- **Create component diagram:** "I need to visualize the architecture of [insert system or service]. Generate a component diagram showing key services, data flows, and third-party integrations. Use clear labels and group components logically."
- **Visualize system architecture:** "Create an image of the system architecture. Context: It's a microservices-based e-commerce platform with services for payments, catalog, and user profiles. Output: Diagram with labeled services and data flow arrows."
- **Explain CI/CD pipeline:** "Create an image that explains our CI/CD process. Context: This is for a presentation to business stakeholders. Output: Diagram showing dev → build → test → deploy steps with basic icons and short descriptions."

### For IT Professionals

From [ChatGPT for IT](https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-it):

#### System Administration

- **Automate system monitoring:** "Create a script to monitor [system/service]. Context: [requirements]. Output: Monitoring script with alerts and logging."
- **Generate troubleshooting guides:** "Create a detailed troubleshooting guide for [issue type]. Context: [environment details]. Output: Step-by-step instructions with common solutions."
- **Document infrastructure:** "Document our infrastructure setup. Context: [system details]. Output: Infrastructure documentation with diagrams and configuration details."

#### Security & Compliance

- **Security audit:** "Perform a security audit of [system/process]. Context: [details]. Output: Security checklist with recommendations."
- **Compliance review:** "Review our [regulation] compliance. Context: [system details]. Output: Compliance checklist with gaps and remediation steps."

### For Product Teams

From [ChatGPT for Product](https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-product):

#### Market Research & Competitive Analysis

- **Analyze competitors:** "Research how three key competitors structure their onboarding flow for new users. Include screenshots, key steps, and points of friction or delight."
- **Market trends:** "Analyze current trends in [market/industry]. Context: [specific focus]. Output: Summary of trends, opportunities, and threats."
- **User research:** "Analyze this user feedback data. Context: [details]. Output: Key themes, sentiment analysis, and actionable insights."

#### Product Planning & Documentation

- **Product requirements:** "Create a PRD for [feature/product]. Context: [requirements]. Output: Complete PRD with user stories, acceptance criteria, and technical considerations."
- **Feature prioritization:** "Prioritize these features based on [criteria]. Context: [constraints]. Output: Prioritized list with rationale."
- **Roadmap planning:** "Create a product roadmap for [timeframe]. Context: [goals]. Output: Roadmap with milestones and dependencies."

#### User Experience & Design

- **User journey mapping:** "Create a user journey map for [user type] using [product/feature]. Context: [details]. Output: Journey map with touchpoints, emotions, and pain points."
- **Feature design:** "Design the UX flow for [feature]. Context: [requirements]. Output: User flow diagram with wireframes and interactions."

---

## References

- OpenAI Prompt Engineering Best Practices: https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt
- OpenAI Academy - Advanced Prompt Engineering: https://academy.openai.com/public/videos/advanced-prompt-engineering-2025-02-13
- OpenAI Academy - Introduction to Prompt Engineering: https://academy.openai.com/public/videos/introduction-to-prompt-engineering-2025-02-13
- ChatGPT 101: A Guide to Your AI Superassistant: https://academy.openai.com/public/videos/chatgpt-101-a-guide-to-your-ai-superassistant-recording
- ChatGPT 101 Webinar Resource Guide: https://academy.openai.com/public/clubs/work-users-ynjqu/resources/chatgpt-101-webinar-resource-guide
- ChatGPT for Engineers: https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-engineers
- ChatGPT for IT: https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-it
- ChatGPT for Product: https://academy.openai.com/public/clubs/work-users-ynjqu/resources/use-cases-product

---

**Last Updated:** 2025-11-16
**Version:** 2.2.0

## Changelog

### v2.0.0 (2025-11-16)

- ✅ Added REFERENCE TEXTS technique
- ✅ Added REASONING STEPS technique
- ✅ Added TOOL USAGE technique
- ✅ Added TONE SPECIFICATION technique
- ✅ Added ITERATIVE REFINEMENT technique
- ✅ Updated template with all new techniques
- ✅ Expanded principles from 7 to 12
- ✅ Complete alignment with OpenAI 2025 best practices

### v2.1.0 (2025-11-16)

- ✅ Added ChatGPT 101 specific techniques
- ✅ Added practical applications section (brainstorming, customer communication, data analysis, content creation)
- ✅ Added advanced features section (voice mode, web search, custom GPTs, tool integration)
- ✅ Added navigation & customization tips
- ✅ Updated references with ChatGPT 101 resources

### v2.2.0 (2025-11-16)

- ✅ Added role-specific use cases section
- ✅ Added Engineers use cases (research, documentation, code generation, data analysis, architecture)
- ✅ Added IT Professionals use cases (system administration, security, compliance)
- ✅ Added Product Teams use cases (market research, planning, UX design)
- ✅ Included specific prompt examples for each role
- ✅ Updated references with role-specific resources
