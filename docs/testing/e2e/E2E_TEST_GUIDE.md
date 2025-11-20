# E2E Test Guide - Follow-up Reminders & Ghostwriter

## Oversigt

Denne guide beskriver hvordan man kører end-to-end tests for Follow-up Reminders og Ghostwriter features.

## Test Filer

### 1. Vitest E2E Test
**Fil:** `server/__tests__/e2e-followup-ghostwriter.test.ts`

Struktur:
- Setup: Opretter test user
- Follow-up Reminders tests (5 tests)
- Ghostwriter tests (4 tests)
- Integration flow tests (2 tests)
- Database integrity tests (2 tests)
- Cleanup: Sletter test data

### 2. Executable Test Script
**Fil:** `server/scripts/test-e2e-followup-ghostwriter.ts`

Standalone script der:
- Tester alle endpoints
- Verificerer database
- Logger detaljerede resultater
- Rydder op automatisk

## Forudsetninger

### 1. Installer Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Migrer schema til database
npm run db:push
```

### 3. Environment Variables
Opret `.env.dev` fil eller sæt environment variables:
```bash
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=no-verify
OWNER_OPEN_ID=your-open-id
# ... andre nødvendige variabler
```

## Kørsel

### Metode 1: NPM Script (Anbefalet)
```bash
npm run test:e2e-followup-ghostwriter
```

### Metode 2: Direkte med tsx
```bash
npx tsx server/scripts/test-e2e-followup-ghostwriter.ts
```

### Metode 3: Med Vitest (hvis installeret)
```bash
npm test server/__tests__/e2e-followup-ghostwriter.test.ts
```

## Test Scenarier

### Follow-up Reminders

#### Test 1: Opret Follow-up
```typescript
const followup = await caller.inbox.email.createFollowupReminder({
  threadId: "test-thread-123",
  reminderDate: new Date().toISOString(),
  priority: "normal",
  notes: "Test reminder"
});
```
**Forventet:** ID returneret, status = "pending"

#### Test 2: List Follow-ups
```typescript
const reminders = await caller.inbox.email.listFollowupReminders({
  status: "pending"
});
```
**Forventet:** Array med vores reminder inkluderet

#### Test 3: Update Date
```typescript
const updated = await caller.inbox.email.updateFollowupDate({
  followupId: followup.id,
  reminderDate: newDate.toISOString()
});
```
**Forventet:** Dato opdateret korrekt

#### Test 4: Mark Complete
```typescript
const completed = await caller.inbox.email.markFollowupComplete({
  followupId: followup.id
});
```
**Forventet:** Status = "completed", completedAt sat

#### Test 5: Filter by Status
```typescript
const completed = await caller.inbox.email.listFollowupReminders({
  status: "completed"
});
```
**Forventet:** Kun completed reminders

### Ghostwriter

#### Test 1: Get Writing Style
```typescript
const style = await caller.inbox.email.getWritingStyle();
```
**Forventet:** null (hvis ingen style) eller style objekt

#### Test 2: Generate Reply
```typescript
const reply = await caller.inbox.email.generateGhostwriterReply({
  threadId: "test-thread",
  subject: "Test",
  from: "test@example.com",
  body: "Hej, kan du hjælpe?"
});
```
**Forventet:** String med reply (kan fejle hvis AI API ikke tilgængelig)

#### Test 3: Save Feedback
```typescript
const result = await caller.inbox.email.updateWritingStyleFromFeedback({
  originalSuggestion: "Tak for din mail",
  editedResponse: "Tak for din mail. Jeg vender tilbage.",
  threadId: "test-thread"
});
```
**Forventet:** success = true, feedback gemt i database

#### Test 4: Analyze Style
```typescript
const analysis = await caller.inbox.email.analyzeWritingStyle({
  sampleSize: 10
});
```
**Forventet:** Analysis objekt eller null (hvis ingen emails)

## Forventede Output

### Success
```
🧪 Starting E2E Test - Follow-up Reminders & Ghostwriter

📋 Setting up test user...
✅ Test user ID: 1

📝 Test 1: Create Follow-up Reminder
   ✅ Created follow-up ID: 123
   ✅ Thread ID: test-thread-abc
   ✅ Status: pending
   ✅ Priority: normal

📋 Test 2: List Follow-up Reminders
   ✅ Found 1 pending reminders
   ✅ Our reminder found in list

📅 Test 3: Update Follow-up Date
   ✅ Updated follow-up ID: 123
   ✅ New reminder date: 2025-01-31T12:00:00.000Z

✅ Test 4: Mark Follow-up Complete
   ✅ Completed follow-up ID: 123
   ✅ Status: completed
   ✅ Completed at: 2025-01-28T12:00:00.000Z

🔍 Test 5: Filter Reminders by Status
   ✅ Found 1 completed reminders
   ✅ Our reminder found in completed list

✍️  Test 6: Get Writing Style
   ℹ️  No writing style yet (expected if no sent emails)

🤖 Test 7: Generate Ghostwriter Reply
   ✅ Generated reply (245 chars)
   ✅ Preview: Tak for din mail. Jeg kan hjælpe dig med...

💬 Test 8: Save Feedback
   ✅ Feedback saved: true
   ✅ Feedback verified in database (ID: 456)

🔬 Test 9: Analyze Writing Style
   ℹ️  No sent emails found for analysis (expected)

🔒 Test 10: User Isolation
   ✅ All reminders belong to test user

🗄️  Test 11: Database Integrity
   ✅ Follow-up integrity verified

🎉 All E2E tests passed!

🧹 Cleaning up test data...
   ✅ Deleted 1 follow-ups
   ✅ Deleted 1 feedback entries
   ✅ Cleaned up writing style

✅ E2E test completed successfully!
```

### Fejl Cases

#### Database Connection Error
```
❌ E2E test failed:
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Løsning:** Verificer DATABASE_URL og at database kører

#### Table Does Not Exist
```
❌ E2E test failed:
Error: relation "email_followups" does not exist
```
**Løsning:** Kør `npm run db:push` for at migrere schema

#### AI API Error (Acceptabel)
```
🤖 Test 7: Generate Ghostwriter Reply
   ℹ️  AI API not available: API key not found (this is OK for e2e test)
```
**Note:** Dette er OK - test fortsætter

## Troubleshooting

### Problem: "Cannot find package 'dotenv'"
**Løsning:** Installer dependencies:
```bash
npm install
```

### Problem: "Cannot find package 'drizzle-orm'"
**Løsning:** Installer dependencies:
```bash
npm install
```

### Problem: "Table does not exist"
**Løsning:** Migrer database:
```bash
npm run db:push
```

### Problem: "Connection refused"
**Løsning:** 
1. Verificer database kører
2. Check DATABASE_URL i .env.dev
3. Verificer network connectivity

### Problem: "Test user not found"
**Løsning:**
1. Check OWNER_OPEN_ID i environment
2. Verificer user kan oprettes i database

## Test Coverage

### Endpoints
- ✅ `inbox.email.createFollowupReminder`
- ✅ `inbox.email.listFollowupReminders`
- ✅ `inbox.email.updateFollowupDate`
- ✅ `inbox.email.markFollowupComplete`
- ✅ `inbox.email.getWritingStyle`
- ✅ `inbox.email.generateGhostwriterReply`
- ✅ `inbox.email.updateWritingStyleFromFeedback`
- ✅ `inbox.email.analyzeWritingStyle`

### Database Tables
- ✅ `email_followups` - CRUD
- ✅ `email_response_feedback` - Create/Read
- ✅ `user_writing_styles` - Read

### Business Logic
- ✅ User isolation
- ✅ Status transitions
- ✅ Data persistence
- ✅ Referential integrity

## Næste Skridt Efter Test

1. **Hvis alle tests passerer:**
   - Features er klar til brug
   - Database schema er korrekt
   - API endpoints virker

2. **Hvis tests fejler:**
   - Læs error messages
   - Check troubleshooting sektion
   - Verificer forudsetninger
   - Fix issues og kør igen

3. **Manual Testing:**
   - Test i UI (se MANUAL_TEST_GUIDE.md)
   - Verificer frontend integration
   - Test med rigtige emails

## Noter

- Tests bruger `ENV.ownerOpenId` for test user
- Alle test data ryddes automatisk
- Tests er idempotente (kan køres flere gange)
- AI API fejl er acceptable (tests fortsætter)
- Tests isolerer user data korrekt
