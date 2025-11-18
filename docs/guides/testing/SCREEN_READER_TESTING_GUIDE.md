# Manual Screen Reader Testing Guide

**Date:** January 28, 2025  
**Project:** Friday AI Chat (TekupDK)  
**Purpose:** Guide for conducting manual screen reader testing with NVDA and VoiceOver

## Overview

This guide provides detailed procedures for testing the Friday AI Chat application with screen readers. Manual testing is essential to ensure a good experience for users who rely on assistive technology.

---

## Screen Readers to Test

### Priority 1: Most Common
- **NVDA** (Windows) - Free, open-source
- **VoiceOver** (macOS/iOS) - Built-in

### Priority 2: Additional Coverage
- **JAWS** (Windows) - Commercial
- **TalkBack** (Android) - Built-in

---

## Testing Setup

### NVDA (Windows)

1. **Download and Install:**
   - Visit: https://www.nvaccess.org/download/
   - Download latest version
   - Install and start NVDA

2. **Basic Commands:**
   - `Insert + Q` - Quit NVDA
   - `Insert + S` - Toggle speech
   - `Insert + N` - NVDA menu
   - `Insert + H` - Help

3. **Navigation Commands:**
   - `H` - Next heading
   - `Shift + H` - Previous heading
   - `1-6` - Navigate to heading level
   - `L` - Next link
   - `F` - Next form field
   - `B` - Next button
   - `D` - Next landmark
   - `K` - Next list
   - `T` - Next table

### VoiceOver (macOS)

1. **Enable VoiceOver:**
   - Press `Cmd + F5`
   - Or: System Settings → Accessibility → VoiceOver → Enable

2. **Basic Commands:**
   - `Ctrl + Option` - VoiceOver modifier key
   - `Ctrl + Option + F5` - Toggle VoiceOver
   - `Ctrl + Option + Right Arrow` - Read next item
   - `Ctrl + Option + Left Arrow` - Read previous item

3. **Navigation Commands:**
   - `Ctrl + Option + H` - Navigate headings
   - `Ctrl + Option + L` - Navigate links
   - `Ctrl + Option + F` - Navigate forms
   - `Ctrl + Option + B` - Navigate buttons
   - `Ctrl + Option + R` - Navigate regions
   - `Ctrl + Option + A` - Start reading from cursor

---

## User Flows to Test

### 1. Login Flow

**Steps:**
1. Navigate to login page
2. Tab through form fields
3. Enter credentials
4. Submit form
5. Verify success/error messages

**What to Check:**
- [ ] Page title is announced
- [ ] Form labels are announced correctly
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Loading state is announced
- [ ] Success state is announced
- [ ] Focus management is correct

**Expected Announcements:**
- "Login page"
- "Email, edit text"
- "Password, edit text, password"
- "Log in, button"
- "Error: [message]" (if error)
- "Loading, please wait" (during auth)
- "Login successful" (on success)

### 2. Email Browsing Flow

**Steps:**
1. Navigate to email list
2. Use arrow keys to navigate emails
3. Select an email
4. Read email content
5. Use email actions

**What to Check:**
- [ ] Email list is announced as listbox
- [ ] Email items are announced with sender, subject, read status
- [ ] Selected email is indicated
- [ ] Email content is readable
- [ ] Actions are accessible
- [ ] Keyboard shortcuts work

**Expected Announcements:**
- "Email list, listbox"
- "Email from [sender], [subject], [read/unread], option 1 of 10"
- "Selected, email from [sender]"
- "Reply, button"
- "Archive, button"

### 3. Settings Configuration Flow

**Steps:**
1. Open settings dialog
2. Navigate through sections
3. Change settings
4. Save changes
5. Close dialog

**What to Check:**
- [ ] Dialog title is announced
- [ ] Section headings are announced
- [ ] Switch controls have labels and descriptions
- [ ] Changes are announced
- [ ] Save button is accessible
- [ ] Close button is accessible
- [ ] Focus is trapped in dialog

**Expected Announcements:**
- "Settings, dialog"
- "Appearance, heading level 2"
- "Email notifications, switch, off"
- "Email notifications description: [text]"
- "Settings saved" (on save)

### 4. Chat Interface Flow

**Steps:**
1. Navigate to chat input
2. Type message
3. Send message
4. Read AI response
5. Use chat actions

**What to Check:**
- [ ] Chat input is announced
- [ ] Messages are announced in order
- [ ] Loading states are announced
- [ ] Error messages are announced
- [ ] Actions are accessible

**Expected Announcements:**
- "Message input, edit text"
- "Message from user: [content]"
- "Message from AI: [content]"
- "Sending message, please wait"
- "Message sent successfully"

### 5. Navigation Flow

**Steps:**
1. Use skip links
2. Navigate main navigation
3. Navigate between pages
4. Use keyboard shortcuts

**What to Check:**
- [ ] Skip links are functional
- [ ] Navigation landmarks are announced
- [ ] Page titles change
- [ ] Focus management is correct
- [ ] Keyboard shortcuts work

**Expected Announcements:**
- "Skip to main content, link"
- "Navigation, region"
- "Main content, region"
- "[Page name], heading level 1"

---

## Testing Checklist Template

### For Each User Flow

**Page/Component:** [Name]  
**Date:** YYYY-MM-DD  
**Tester:** [Name]  
**Screen Reader:** NVDA / VoiceOver / Other  
**Version:** [Version]

#### Navigation
- [ ] Can navigate to page
- [ ] Page title is announced
- [ ] Skip links work
- [ ] Landmarks are announced
- [ ] Heading hierarchy is logical

#### Forms
- [ ] All form fields have labels
- [ ] Labels are announced correctly
- [ ] Required fields are indicated
- [ ] Error messages are announced
- [ ] Error messages are associated with fields
- [ ] Success messages are announced

#### Interactive Elements
- [ ] Buttons have clear labels
- [ ] Links have descriptive text
- [ ] Icons have ARIA labels
- [ ] State changes are announced
- [ ] Disabled elements are indicated

#### Content
- [ ] Text is readable
- [ ] Images have alt text
- [ ] Lists are announced correctly
- [ ] Tables are navigable
- [ ] Dynamic content is announced

#### Keyboard Navigation
- [ ] All elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Keyboard shortcuts work

#### Dialog/Modal
- [ ] Dialog title is announced
- [ ] Dialog description is announced
- [ ] Focus is trapped in dialog
- [ ] Escape key closes dialog
- [ ] Focus returns to trigger

#### Issues Found
1. [Issue description]
   - **Location:** [Where]
   - **Impact:** [Who is affected]
   - **Priority:** P1/P2/P3
   - **WCAG:** X.X.X
   - **Fix:** [Recommended solution]

---

## Common Issues to Look For

### Missing Labels
- **Symptom:** Screen reader says "edit text" without context
- **Fix:** Add `aria-label` or associate with `Label` component

### Unclear Button Purpose
- **Symptom:** Screen reader says "button" without purpose
- **Fix:** Add descriptive `aria-label`

### Missing State Announcements
- **Symptom:** State changes not announced
- **Fix:** Add `aria-live` regions or `aria-atomic`

### Focus Management
- **Symptom:** Focus jumps unexpectedly
- **Fix:** Review focus management in dialogs/modals

### Missing Error Associations
- **Symptom:** Error messages not associated with fields
- **Fix:** Use `aria-describedby` to link errors

---

## Documenting Results

### Location
Create test results in: `docs/accessibility-audits/screen-reader-tests/`

### Naming Convention
- Format: `YYYY-MM-DD-[flow-name]-screen-reader.md`
- Example: `2025-01-28-login-flow-nvda.md`

### Template

```markdown
# Screen Reader Test - [Flow Name]

**Date:** YYYY-MM-DD  
**Tester:** [Name]  
**Screen Reader:** NVDA [version] / VoiceOver [version]  
**Browser:** Chrome [version] / Safari [version]  
**OS:** Windows [version] / macOS [version]

## Test Flow

[Describe the flow being tested]

## Results

### Navigation
- ✅/❌ [Result]

### Forms
- ✅/❌ [Result]

### Interactive Elements
- ✅/❌ [Result]

### Issues Found

1. [Issue]
   - **Location:** [Where]
   - **Impact:** [Who]
   - **Priority:** P1/P2/P3
   - **WCAG:** X.X.X
   - **Fix:** [Solution]

## Recommendations

[Recommendations for improvements]
```

---

## Regular Testing Schedule

- **Weekly:** Critical flows (Login, Email browsing)
- **Monthly:** All Priority 1 flows
- **Quarterly:** All user flows (full test)
- **Before Release:** All user flows (full test)

---

## Resources

- **NVDA Documentation:** https://www.nvaccess.org/about-nvda/
- **VoiceOver Guide:** https://support.apple.com/guide/voiceover/
- **Accessibility Testing Guide:** `docs/ACCESSIBILITY_TESTING_GUIDE.md`
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Contact

For questions about screen reader testing:
- **Development Team:** See project README
- **Accessibility Lead:** [To be assigned]

---

**Last Updated:** January 28, 2025  
**Next Review:** After first test cycle

