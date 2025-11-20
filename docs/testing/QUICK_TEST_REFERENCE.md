# Quick Test Reference

## Hurtige Tests Du Kan Køre Nu

### 1. Strukturel Test (Kører Uden Database)
```bash
npx tsx server/scripts/test-features-simple.ts
```
**Resultat:** ✅ 26/26 tests passed

### 2. TypeScript Compilation Check
```bash
npm run check
```
**Forventet:** Ingen fejl

### 3. Linter Check
```bash
npm run lint
```
**Forventet:** Ingen fejl

## Tests Der Kræver Database

### 4. Follow-up Reminders Test
```bash
# Først: Sæt testUserId i filen til dit faktiske user ID
# Derefter:
npm run test:followup-reminders
```

**Hvad det tester:**
- Database connection
- Opret reminder
- List reminders
- Mark complete
- Auto-detection
- Cleanup

### 5. Ghostwriter Test
```bash
# Først: Sæt testUserId i filen til dit faktiske user ID
# Derefter:
npm run test:ghostwriter
```

**Hvad det tester:**
- Database connection
- Get writing style
- Analyze writing style
- Generate reply
- Learn from feedback

## Browser Console Tests

### Test Follow-up Reminders API
```javascript
// I browser console på http://localhost:5173
const trpc = window.trpc; // eller hvordan du importerer trpc

// Opret reminder
await trpc.email.createFollowupReminder.mutate({
  threadId: "test-123",
  reminderDate: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
  priority: "normal"
});

// List reminders
await trpc.email.listFollowupReminders.query({ status: "pending" });
```

### Test Ghostwriter API
```javascript
// Get writing style
await trpc.email.getWritingStyle.query();

// Analyze style
await trpc.email.analyzeWritingStyle.mutate({ sampleSize: 20 });

// Generate reply
await trpc.email.generateGhostwriterReply.mutate({
  threadId: "test-123",
  subject: "Test",
  from: "test@example.com",
  body: "Hej, kan du hjælpe?"
});
```

## Database Verification

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'friday_ai' 
AND table_name IN ('email_followups', 'user_writing_styles', 'email_response_feedback');
```

### Check Data
```sql
-- Follow-up reminders
SELECT * FROM friday_ai.email_followups LIMIT 10;

-- Writing styles
SELECT * FROM friday_ai.user_writing_styles;

-- Feedback
SELECT * FROM friday_ai.email_response_feedback LIMIT 10;
```

## Troubleshooting

**Problem:** "Database not available"
- Løsning: Tjek DATABASE_URL i .env.dev
- Løsning: Kør `npm run dev:db` for at starte database

**Problem:** "User not found"
- Løsning: Opdater testUserId i test scripts til faktisk user ID

**Problem:** "Module not found"
- Løsning: Kør `npm install`
- Løsning: Verificer at serveren er genstartet

**Problem:** "tRPC endpoint not found"
- Løsning: Genstart serveren
- Løsning: Tjek at email-router.ts er korrekt importeret i routers.ts
