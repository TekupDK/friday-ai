# 📚 Documentation Templates

Templates for creating consistent, high-quality documentation.

## Available Templates

### 1. **Feature Spec** (`feature-spec.md`)

Use when: Planning a new feature or major change

**Includes:**

- Overview & requirements
- Technical design
- Implementation plan
- Timeline & risks

**Example:** `Email Sync Implementation Spec`

---

### 2. **Bug Report** (`bug-report.md`)

Use when: Documenting a bug or issue

**Includes:**

- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Fix tracking

**Example:** `Bug: Email Thread Not Loading`

---

### 3. **Guide** (`guide.md`)

Use when: Writing a how-to or tutorial

**Includes:**

- Prerequisites
- Step-by-step instructions
- Verification steps
- Troubleshooting

**Example:** `Guide: Setting Up Email Integration`

---

### 4. **Meeting Notes** (`meeting-notes.md`)

Use when: Documenting meetings or discussions

**Includes:**

- Agenda & attendees
- Discussion summary
- Decisions made
- Action items

**Example:** `Meeting: Q1 Planning Session`

---

## How to Use

### Via UI (Recommended)

1. Go to `/docs`
1. Click "New Document"
1. Select template from dropdown
1. Fill in the template
1. Save

### Via CLI

```bash
cd cli/tekup-docs
pnpm run dev create --template feature-spec --title "My Feature"

```text

### Manual

```bash
cp server/docs/templates/feature-spec.md docs/my-feature-spec.md
# Edit the file

```text

---

## Template Guidelines

### 1. Always Fill Out Metadata

```markdown
---
**Status:** [Draft/Active/Deprecated]
**Author:** [Your name]
**Created:** [Date]
**Last Updated:** [Date]
---

```text

### 2. Use Consistent Naming

```text
✅ Good:

- Email-Sync-Implementation-Spec.md
- Bug-Invoice-Calculate-Error.md
- Guide-Setting-Up-Calendar.md

❌ Bad:

- spec.md
- bug.md
- notes.md

```text

### 3. Link Related Docs

Always link to:

- Related features
- API references
- Design docs
- Similar issues

### 4. Keep It Updated

When doc becomes outdated:

- Add `[DEPRECATED]` to title
- Link to replacement doc
- Add `#outdated` tag

---

## Creating Custom Templates

### Step 1: Create Template File

```bash
# Create new template
echo "# My Template" > server/docs/templates/my-template.md

```text

### Step 2: Add to Template List

Edit `server/docs/service.ts` to include your template.

### Step 3: Test It

```bash
# Create doc from template
pnpm run dev create --template my-template

```

---

## Best Practices

### ✅ Do

- Use templates for consistency
- Fill out all sections (even "N/A")
- Link to related docs
- Update metadata regularly
- Add relevant tags

### ❌ Don't

- Leave sections empty
- Create duplicate docs
- Forget to categorize
- Skip troubleshooting section in guides
- Ignore action items in meeting notes

---

## Future Templates (Planned)

- `api-reference.md` - API endpoint documentation
- `architecture.md` - System architecture
- `postmortem.md` - Incident analysis
- `changelog.md` - Release notes
- `rfcs.md` - Request for comments

---

## Questions

See: [DOCS_STRATEGY.md](../DOCS_STRATEGY.md) for overall documentation approach.
