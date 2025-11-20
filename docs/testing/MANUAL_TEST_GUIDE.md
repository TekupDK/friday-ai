# Manual Test Guide - AI Ghostwriter & Follow-up Reminders

Denne guide beskriver hvordan du manuelt tester de nye features.

## Forudsætninger

1. Database er migreret med de nye tabeller
2. Serveren kører (`npm run dev`)
3. Du er logget ind i applikationen

## Test 1: Follow-up Reminders

### 1.1 Opret Follow-up Reminder via API

**Via tRPC Client (i browser console):**
```javascript
// Åbn browser console på http://localhost:5173 (eller din dev URL)

// Opret reminder
const result = await trpc.email.createFollowupReminder.mutate({
  threadId: "test-thread-123",
  reminderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dage fra nu
  priority: "normal",
  notes: "Test reminder"
});

console.log("Created reminder:", result);
```

**Forventet resultat:**
- Reminder oprettet med ID
- Status: "pending"
- ReminderDate: 3 dage fra nu

### 1.2 List Follow-up Reminders

```javascript
// List alle pending reminders
const reminders = await trpc.email.listFollowupReminders.query({
  status: "pending"
});

console.log("Pending reminders:", reminders);
```

**Forventet resultat:**
- Array af reminders
- Hver reminder har: id, threadId, reminderDate, status, priority

### 1.3 Mark Reminder as Complete

```javascript
// Marker første reminder som fuldført
const reminderId = reminders[0].id;
const completed = await trpc.email.markFollowupComplete.mutate({
  followupId: reminderId
});

console.log("Completed:", completed);
```

**Forventet resultat:**
- Status ændret til "completed"
- completedAt timestamp sat

### 1.4 Update Reminder Date

```javascript
// Opdater reminder dato
const newDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
const updated = await trpc.email.updateFollowupDate.mutate({
  followupId: reminderId,
  reminderDate: newDate
});

console.log("Updated:", updated);
```

**Forventet resultat:**
- reminderDate opdateret
- updatedAt timestamp opdateret

### 1.5 Cancel Reminder

```javascript
// Annuller reminder
const cancelled = await trpc.email.cancelFollowup.mutate({
  followupId: reminderId
});

console.log("Cancelled:", cancelled);
```

**Forventet resultat:**
- Status ændret til "cancelled"
- cancelledAt timestamp sat

### 1.6 Test Auto-Detection

```javascript
// Test om email kræver follow-up
// Dette kræver en faktisk email thread
const needsFollowup = await shouldCreateFollowup(
  "actual-thread-id",
  userId,
  "Email med spørgsmål?",
  "Hej, hvornår kan du levere?"
);

console.log("Needs follow-up:", needsFollowup);
```

**Forventet resultat:**
- Returnerer true for emails med spørgsmål
- Returnerer false hvis bruger sendte sidste besked

## Test 2: AI Ghostwriter

### 2.1 Get Writing Style

```javascript
// Hent brugerens skrivestil
const style = await trpc.email.getWritingStyle.query();

console.log("Writing style:", style);
```

**Forventet resultat:**
- null hvis ingen stil er analyseret endnu
- Eller objekt med: tone, averageLength, formalityLevel, commonPhrases, etc.

### 2.2 Analyze Writing Style

```javascript
// Analyser skrivestil fra sendte emails
const analyzed = await trpc.email.analyzeWritingStyle.mutate({
  sampleSize: 20
});

console.log("Analyzed style:", analyzed);
```

**Forventet resultat:**
- Objekt med analyseret stil
- Eller null hvis ingen sendte emails findes

**Note:** Dette kræver at brugeren har sendt emails. Hvis ikke, vil det returnere null.

### 2.3 Generate Ghostwriter Reply

```javascript
// Generer svar i brugerens stil
const reply = await trpc.email.generateGhostwriterReply.mutate({
  threadId: "test-thread-123",
  subject: "Test Email",
  from: "test@example.com",
  body: "Hej, kan du hjælpe mig med at forstå hvordan systemet virker?",
  previousMessages: []
});

console.log("Generated reply:", reply);
```

**Forventet resultat:**
- String med genereret svar
- Svar matcher brugerens stil (hvis analyseret)
- Eller generisk professionelt svar hvis ingen stil

### 2.4 Learn from Feedback

```javascript
// Lær fra brugerens redigeringer
const feedback = await trpc.email.updateWritingStyleFromFeedback.mutate({
  originalSuggestion: "Tak for din mail",
  editedResponse: "Tak for din mail. Jeg vender tilbage snarest.",
  threadId: "test-thread-123"
});

console.log("Feedback saved:", feedback);
```

**Forventet resultat:**
- { success: true }
- Feedback gemt i database
- System lærer fra ændringerne

## Test 3: Frontend Components

### 3.1 Follow-up Reminders Component

1. Naviger til inbox siden
2. Find en email der kræver follow-up
3. Klik på "Create Follow-up" knap (hvis implementeret)
4. Verificer at reminder vises i FollowupReminders komponenten
5. Test at markere reminder som fuldført
6. Test at annullere reminder

**Forventet resultat:**
- Reminders vises i UI
- Badges vises på emails med reminders
- Actions virker (complete, cancel, update)

### 3.2 Ghostwriter Reply Component

1. Åbn en email thread
2. Klik på "Reply" knap
3. Find "AI Ghostwriter" sektionen
4. Klik på "Generer Svar"
5. Verificer at svar genereres
6. Rediger svaret
7. Send email
8. Verificer at feedback gemmes

**Forventet resultat:**
- Svar genereres i brugerens stil
- Redigering virker
- Feedback gemmes når email sendes

## Test 4: Background Scheduler

### 4.1 Test Follow-up Scheduler

**Via Terminal:**
```bash
# Kør scheduler manuelt
dotenv -e .env.dev -- tsx -e "
import { runFollowupScheduler } from './server/modules/email/followup-scheduler';
runFollowupScheduler().then(() => process.exit(0));
"
```

**Forventet resultat:**
- Scheduler kører uden fejl
- Due reminders markeres som overdue
- Notifikationer sendes (hvis implementeret)
- Auto-created follow-ups oprettes

### 4.2 Test Auto-Create Follow-ups

```bash
# Test auto-create funktionalitet
dotenv -e .env.dev -- tsx -e "
import { autoCreateFollowups } from './server/email-intelligence/followup-reminders';
autoCreateFollowups(1).then(result => {
  console.log('Created:', result);
  process.exit(0);
});
"
```

**Forventet resultat:**
- Returnerer antal oprettede follow-ups
- Follow-ups oprettes for emails der kræver svar

## Test 5: Database Schema

### 5.1 Verificer Tabeller

**Via Database Client:**
```sql
-- Tjek at tabeller eksisterer
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'friday_ai' 
AND table_name IN ('email_followups', 'user_writing_styles', 'email_response_feedback');

-- Tjek email_followups struktur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'friday_ai' 
AND table_name = 'email_followups';

-- Tjek user_writing_styles struktur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'friday_ai' 
AND table_name = 'user_writing_styles';

-- Tjek email_response_feedback struktur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'friday_ai' 
AND table_name = 'email_response_feedback';
```

**Forventet resultat:**
- Alle tre tabeller eksisterer
- Kolonner matcher schema definition

### 5.2 Test Indekser

```sql
-- Tjek indekser
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'friday_ai' 
AND tablename IN ('email_followups', 'user_writing_styles', 'email_response_feedback');
```

**Forventet resultat:**
- Indekser eksisterer for:
  - email_followups: userId, threadId, status, reminderDate
  - user_writing_styles: userId (unique)
  - email_response_feedback: userId, threadId, createdAt

## Test 6: Integration Tests

### 6.1 End-to-End Follow-up Flow

1. Modtag en email med spørgsmål
2. System opretter automatisk follow-up (hvis auto-detection er aktiveret)
3. Vent til reminder date
4. Modtag notifikation
5. Åbn email og svar
6. Marker follow-up som fuldført

**Forventet resultat:**
- Hele flowet virker fra start til slut

### 6.2 End-to-End Ghostwriter Flow

1. Analyser skrivestil fra sendte emails
2. Generer svar til ny email
3. Rediger AI-forslaget
4. Send email
5. Verificer at feedback gemmes
6. Generer nyt svar og verificer at det er forbedret

**Forventet resultat:**
- System lærer og forbedrer sig over tid

## Troubleshooting

### Problem: Database fejl
**Løsning:** Kør database migration:
```bash
npm run db:push
```

### Problem: tRPC endpoints ikke fundet
**Løsning:** Verificer at serveren er genstartet efter ændringer

### Problem: Ghostwriter returnerer null
**Løsning:** 
- Tjek at brugeren har sendt emails
- Kør `analyzeWritingStyle` først
- Tjek AI API nøgler i .env

### Problem: Follow-up reminders oprettes ikke automatisk
**Løsning:**
- Tjek at scheduler kører
- Verificer at `shouldCreateFollowup` returnerer true
- Tjek logger for fejl

## Success Criteria

✅ Alle API endpoints virker
✅ Database operationer virker
✅ Frontend komponenter viser data korrekt
✅ Background scheduler kører uden fejl
✅ Auto-detection virker
✅ Ghostwriter genererer svar
✅ Feedback system lærer fra redigeringer
