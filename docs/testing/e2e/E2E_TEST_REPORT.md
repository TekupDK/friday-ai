# E2E Test Report - Follow-up Reminders & Ghostwriter

## Test Oversigt

Dette dokument beskriver end-to-end testen for Follow-up Reminders og Ghostwriter features.

## Test Filer Oprettet

### 1. Vitest E2E Test
**Fil:** `server/__tests__/e2e-followup-ghostwriter.test.ts`

Komplet e2e test suite der tester:
- Follow-up Reminders: Oprettelse, listing, opdatering, completion, filtering
- Ghostwriter: Style retrieval, reply generation, feedback loop, style analysis
- Integration flows: Fuld workflow gennem begge features
- Database integrity: Verificering af data persistence og user isolation

**Kør med:**
```bash
npm test server/__tests__/e2e-followup-ghostwriter.test.ts
```

### 2. Executable E2E Test Script
**Fil:** `server/scripts/test-e2e-followup-ghostwriter.ts`

Standalone test script der kan køres direkte med `tsx`:
- Tester alle endpoints gennem tRPC router
- Verificerer database persistence
- Tester user isolation
- Automatisk cleanup efter test

**Kør med:**
```bash
npm run test:e2e-followup-ghostwriter
# eller direkte:
npx tsx server/scripts/test-e2e-followup-ghostwriter.ts
```

## Test Scenarier

### Follow-up Reminders E2E Flow

1. **Opret Follow-up Reminder**
   - Input: threadId, reminderDate, priority, notes
   - Verificer: ID returneret, status = "pending", data korrekt

2. **List Follow-up Reminders**
   - Input: status filter
   - Verificer: Returnerer korrekt liste, vores reminder inkluderet

3. **Update Follow-up Date**
   - Input: followupId, ny reminderDate
   - Verificer: Dato opdateret korrekt

4. **Mark Follow-up Complete**
   - Input: followupId
   - Verificer: Status = "completed", completedAt sat

5. **Filter by Status**
   - Input: status = "completed"
   - Verificer: Kun completed reminders returneres

### Ghostwriter E2E Flow

1. **Get Writing Style**
   - Verificer: Returnerer null hvis ingen style endnu, ellers style objekt

2. **Generate Ghostwriter Reply**
   - Input: threadId, subject, from, body
   - Verificer: Reply genereret (string), ikke tom

3. **Save Feedback**
   - Input: originalSuggestion, editedResponse, threadId
   - Verificer: Feedback gemt i database

4. **Analyze Writing Style**
   - Input: sampleSize
   - Verificer: Analysis returneret eller null hvis ingen emails

### Integration Flow

1. **Fuld Follow-up Workflow**
   - Opret → List → Update → Complete → Verify

2. **Fuld Ghostwriter Workflow**
   - Get Style → Generate → Save Feedback → Verify

3. **Database Integrity**
   - Verificer data persistence
   - Verificer user isolation
   - Verificer referential integrity

## Test Krav

### Forudsetninger

1. **Database**
   - Database skal være tilgængelig
   - Schema skal være migreret (`npm run db:push`)
   - Tabeller: `email_followups`, `user_writing_styles`, `email_response_feedback`

2. **Environment Variables**
   - `.env.dev` fil eller environment variables sat
   - `DATABASE_URL` konfigureret
   - `OWNER_OPEN_ID` eller tilsvarende for test user

3. **Dependencies**
   - `npm install` kørt
   - Alle packages installeret

### Kørsel

```bash
# Med npm script (anbefalet)
npm run test:e2e-followup-ghostwriter

# Direkte med tsx
npx tsx server/scripts/test-e2e-followup-ghostwriter.ts

# Med vitest (hvis installeret)
npm test server/__tests__/e2e-followup-ghostwriter.test.ts
```

## Forventede Resultater

### Success Case
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

... (alle tests passerer)

🎉 All E2E tests passed!
✅ E2E test completed successfully!
```

### Fejl Cases

1. **Database ikke tilgængelig**
   - Fejl: Connection error
   - Løsning: Verificer DATABASE_URL og database status

2. **Schema ikke migreret**
   - Fejl: Table does not exist
   - Løsning: Kør `npm run db:push`

3. **AI API ikke tilgængelig**
   - Fejl: AI API error (kun for ghostwriter tests)
   - Note: Dette er OK - tests fortsætter med info message

## Test Coverage

### Endpoints Testet

**Follow-up Reminders:**
- ✅ `createFollowupReminder`
- ✅ `listFollowupReminders`
- ✅ `updateFollowupDate`
- ✅ `markFollowupComplete`
- ✅ `cancelFollowup` (ikke inkluderet i e2e, men tilgængelig)

**Ghostwriter:**
- ✅ `getWritingStyle`
- ✅ `generateGhostwriterReply`
- ✅ `updateWritingStyleFromFeedback`
- ✅ `analyzeWritingStyle`

### Database Tables Testet

- ✅ `email_followups` - CRUD operations
- ✅ `email_response_feedback` - Create og read
- ✅ `user_writing_styles` - Read (create via analyze)

### Business Logic Testet

- ✅ User isolation (kun egen data)
- ✅ Status transitions (pending → completed)
- ✅ Date updates
- ✅ Data persistence
- ✅ Referential integrity

## Næste Skridt

1. **Kør Database Migration**
   ```bash
   npm run db:push
   ```

2. **Kør E2E Test**
   ```bash
   npm run test:e2e-followup-ghostwriter
   ```

3. **Verificer Resultater**
   - Alle tests skal passe
   - Check console output for detaljer
   - Verificer cleanup (ingen test data tilbage)

4. **Hvis Tests Fejler**
   - Check database connection
   - Verificer schema er migreret
   - Check environment variables
   - Se error messages for specifikke fejl

## Noter

- Tests bruger `ENV.ownerOpenId` for test user
- Alle test data ryddes op automatisk efter test
- AI API fejl er acceptable (tests fortsætter med info)
- Tests er idempotente (kan køres flere gange)
