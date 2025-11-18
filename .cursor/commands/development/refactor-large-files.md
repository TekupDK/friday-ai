# Refactor Large Files

You are a senior engineer refactoring large files in Friday AI Chat. You split them into smaller, maintainable modules.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Large Files:** db.ts (900+ lines), google-api.ts (1400+ lines), intent-actions.ts (1100+ lines)
- **Goal:** Split into smaller, focused modules
- **Pattern:** Feature-based organization

## TASK

Refactor large files by splitting them into smaller, focused modules following Friday AI Chat patterns.

## REFACTORING STRATEGY

### Step 1: Analyze File

1. **Identify responsibilities:**
   - What does the file do?
   - What are the main functions?
   - What are the dependencies?

2. **Group by feature:**
   - Group related functions
   - Identify natural boundaries
   - Plan module structure

### Step 2: Split Strategy

1. **Feature-based:**
   - One module per feature
   - Related functions together
   - Clear exports

2. **Maintain compatibility:**
   - Re-export from main file
   - Keep existing imports working
   - Gradual migration

### Step 3: Implementation

1. **Create new modules:**
   - Extract functions to new files
   - Update imports
   - Add exports

2. **Update main file:**
   - Re-export from modules
   - Remove extracted code
   - Keep compatibility layer

## EXAMPLE: Refactoring db.ts

### Current Structure

```typescript
// server/db.ts (900+ lines)
export async function getConversations() { ... }
export async function createConversation() { ... }
export async function getCustomers() { ... }
export async function createCustomer() { ... }
// ... many more functions
```

### Refactored Structure

```typescript
// server/conversation-db.ts
export async function getConversations() { ... }
export async function createConversation() { ... }

// server/customer-db.ts
export async function getCustomers() { ... }
export async function createCustomer() { ... }

// server/db.ts (re-exports for compatibility)
export * from "./conversation-db";
export * from "./customer-db";
```

## IMPLEMENTATION STEPS

1. **Analyze file:**
   - Read entire file
   - Identify responsibilities
   - Group by feature

2. **Plan split:**
   - Decide module structure
   - Plan file names
   - Plan exports

3. **Extract modules:**
   - Create new files
   - Move functions
   - Update imports

4. **Update main file:**
   - Re-export from modules
   - Remove extracted code
   - Keep compatibility

5. **Update imports:**
   - Update files using old imports
   - Or keep re-exports for compatibility

6. **Verify:**
   - Typecheck passes
   - Tests pass
   - No regressions

## OUTPUT FORMAT

```markdown
### Refactoring: [File Name]

**Original:** [file] - [lines] lines
**Split Into:**

- [module1] - [responsibility]
- [module2] - [responsibility]
- [module3] - [responsibility]

**Files Created:**

- [list]

**Files Modified:**

- [list]

**Verification:**

- ✅ Typecheck: PASSED
- ✅ Tests: PASSED
- ✅ No regressions: VERIFIED
```
