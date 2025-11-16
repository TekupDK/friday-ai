# 🧪 PHASE 1 TEST GUIDE - Email Center Design Improvements

**Dato:** November 9, 2025
**Status:** Testing Phase 1 forbedringer
**URL:** <http://localhost:3002>

---

## ✅ TESTING CHECKLIST

### 1. VISUAL DESIGN - Badge Reduction

**Test:**

1. Åbn Email Center (Email tab)
1. Se på email listen

**Forventet resultat:**

- ✅ Emails har INGEN badges (hvis lead score < 70)
- ✅ Hot leads (score >= 70) har KUN 1 🔥 badge
- ✅ INGEN source badges (🟢 Rengøring.nu, etc.)
- ✅ INGEN urgency badges (⏰ Urgent)
- ✅ INGEN intelligence row (📍 Location | 🎯 Job | 💰 Value)

**Før (Information overload):**

```text
[🔥 75] [●] Navn  12:45  [🟢 Rengøring.nu] [⏰ Urgent]
    Emne
    📍 Aarhus | 🎯 Type | 💰 2.000 kr | ✓ 85%

```text

**Efter (Clean design):**

```text
[●] Navn                           12:45  [🔥 75]
    Emne
    Snippet text...

```text

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 2. QUICK ACTIONS - Hover Functionality

**Test:**

1. Hover over en email i listen
1. Se efter quick actions (🗑️📂⭐ icons)
1. Klik på hver action

**Forventet resultat:**

- ✅ Actions vises ved hover (smooth fade-in)
- ✅ Archive icon (📂) synlig
- ✅ Star icon (⭐) synlig
- ✅ Delete icon (🗑️) synlig
- ✅ More menu (⋯) synlig
- ✅ Console logs vises ved klik (Archive:, Star:, Delete:)
- ✅ Actions forsvinder når mouse flyttes væk

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 3. COMPACT LAYOUT

**Test:**

1. Find density toggle (hvis tilgængelig)
1. Skift til "Compact" view
1. Se email list design

**Forventet resultat:**

- ✅ Emails fylder mindre i højden
- ✅ Layout: [●] Navn Emne Tid [Badge]
- ✅ Ingen snippet synlig
- ✅ Quick actions stadig synlige på hover
- ✅ Clean, minimal design

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 4. COMFORTABLE LAYOUT (Default)

**Test:**

1. Skift til "Comfortable" view (eller standard)
1. Se email list design

**Forventet resultat:**

- ✅ 3 linjer per email:
  - Line 1: Navn + Tid + Hot Badge + Quick Actions
  - Line 2: Emne + Attachment icon (hvis relevant)
  - Line 3: Snippet (2 lines max)
- ✅ Mere læsbart end compact
- ✅ Snippet tekst synlig
- ✅ Clean spacing

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 5. HOT LEAD BADGE - Conditional Rendering

**Test:**

1. Find emails med forskellige lead scores
1. Verificer badge display logic

**Forventet resultat:**

- ✅ Lead score < 70: INGEN badge synlig
- ✅ Lead score >= 70: 🔥 badge synlig med score
- ✅ Badge placeret til højre (ved tid)
- ✅ Badge color: Red/orange for hot leads

**Test eksempler:**

- Score 85 → Skal vise [🔥 85]
- Score 70 → Skal vise [🔥 70]
- Score 69 → INGEN badge
- Score 50 → INGEN badge

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 6. UNREAD INDICATOR

**Test:**

1. Find ulæste emails
1. Verificer unread indicator

**Forventet resultat:**

- ✅ Ulæste emails har blå dot (●) til venstre
- ✅ Ulæste emails har fed skrift på navn
- ✅ Læste emails har normal font weight

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 7. ATTACHMENT ICON

**Test:**

1. Find emails med attachments
1. Verificer paperclip icon

**Forventet resultat:**

- ✅ Emails med attachment har 📎 icon
- ✅ Icon placeret ved emne (eller efter tid i compact)
- ✅ Subtle color (muted gray)

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 8. CHECKBOX SELECTION

**Test:**

1. Hover over email
1. Klik checkbox
1. Multi-select flere emails

**Forventet resultat:**

- ✅ Checkbox vises på hover (fade-in)
- ✅ Checkbox virker (kan selectes)
- ✅ Multi-selection virker
- ✅ Selected emails highlightes

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 9. EMAIL CLICK - Open Detail View

**Test:**

1. Klik på en email
1. Verificer detail view åbner

**Forventet resultat:**

- ✅ Email detail view åbner
- ✅ Full email content vises
- ✅ Intelligence data vises i detail (ikke list!)
- ✅ Back navigation virker

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 10. SCROLLING PERFORMANCE

**Test:**

1. Scroll hurtigt gennem email listen
1. Test virtualized scrolling
1. Check for lag eller jank

**Forventet resultat:**

- ✅ Smooth scrolling (ingen lag)
- ✅ Virtual scrolling virker
- ✅ Emails renderer korrekt
- ✅ Ingen visual glitches

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 11. SPLITS SIDEBAR INTERACTION

**Test:**

1. Klik på forskellige splits (Hot Leads, Venter, etc.)
1. Verificer filtering virker

**Forventet resultat:**

- ✅ Splits switching virker
- ✅ Email list opdateres korrekt
- ✅ Badge counts opdateres
- ✅ Smooth transitions

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

### 12. RESPONSIVE DESIGN

**Test:**

1. Resize browser vindue
1. Test på forskellige skærmstørrelser

**Forventet resultat:**

- ✅ Layout tilpasser sig viewport
- ✅ Ingen horizontal scroll
- ✅ Email list stadig læsbar
- ✅ Quick actions stadig tilgængelige

**Test status:** [ ] PASSED / [ ] FAILED

**Noter:**

---

---

## 🐛 BUG TRACKING

### Critical Bugs (Must fix before Phase 2)

```text

1. [BUG-ID] Description
   - Expected: ...
   - Actual: ...
   - Fix: ...
   - Status: [ ] FIXED

(Add more as found)

```text

### Minor Issues (Can defer)

```text

1. [ISSUE-ID] Description
   - Impact: Low/Medium
   - Priority: Low
   - Notes: ...

(Add more as found)

```

---

## 🎯 OVERALL PHASE 1 ASSESSMENT

### Visual Improvements

- [ ] Badge clutter DRASTICALLY reduced
- [ ] Clean Shortwave-style design achieved
- [ ] Professional look & feel
- [ ] Improved readability

### Functional Improvements

- [ ] Quick Actions work smoothly
- [ ] Hover interactions feel natural
- [ ] Performance is good (no lag)
- [ ] All core features still work

### User Experience

- [ ] Faster email scanning
- [ ] Less visual noise
- [ ] More focus on content
- [ ] Professional workflow

---

## ✅ APPROVAL FOR PHASE 2

**Prerequisites for Phase 2:**

- [ ] No critical bugs found
- [ ] All core features work
- [ ] Visual design meets expectations
- [ ] Performance is acceptable
- [ ] User is satisfied with Phase 1

**If all checked → Ready for Phase 2! 🚀**

---

## 📝 TEST NOTES

**Tester:** **********\_\_\_**********
**Dato:** **********\_\_\_**********
**Browser:** **********\_\_\_**********
**Screen Size:** **********\_\_\_**********

**General feedback:**

---

---

---

**Phase 2 readiness:** [ ] YES / [ ] NO

**Reason (if NO):**

---

---
