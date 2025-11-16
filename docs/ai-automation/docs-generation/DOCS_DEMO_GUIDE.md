# 📚 Documentation System - Demo Guide

**Tid:** 10 minutter
**Kræver:** Running dev server + Login

---

## 🎯 Quick Start Test

### Step 1: Navigate til Docs (30 sek)

```text

1. Login til Friday AI (http://localhost:3000)
2. Klik dit user menu (top right)
3. Vælg "Documentation" eller gå til /docs
4. Du skulle se: "Documents (340)"

```text

**✅ Success indicators:**

- Grøn "Live" badge (WebSocket connected)
- 340 dokumenter vist
- Search bar synlig
- Template dropdown synlig

---

## 🧪 Test All Features

### Feature 1: Search (1 min)

```text

1. Klik i search box (eller press Ctrl+K)
2. Skriv "email"
3. Se resultaterne filtrere real-time
4. Clear search

```text

**Expected:** ~117 "Email System" docs vises

### Feature 2: Filters (1 min)

```text

1. Klik "Category" dropdown
2. Vælg "Email System"
3. Se docs filtreret til 117
4. Klik "Tag" dropdown
5. Vælg "⚠️ Needs Review"
6. Se outdated docs (orange border)

```text

**Expected:** Docs med orange border vises

### Feature 3: Templates (2 min)

```text

1. Klik "Template" dropdown
2. Vælg "🎯 Feature Spec"
3. Se editor load med pre-filled content
4. Ændre title til: "Test Feature"
5. Switch til "Preview" tab
6. Se formatted markdown
7. Press Ctrl+S (eller click Save)
8. Toast: "Document created successfully!"

```text

**Expected:** Ny doc oprettes, du redirectes til list

### Feature 4: Edit Document (1 min)

```text

1. Find dit "Test Feature" doc
2. Click ⋮ (three dots)
3. Click "Edit"
4. Ændre noget i content
5. Press Ctrl+P to toggle Preview
6. Press Ctrl+S to save
7. Toast: "Document updated successfully!"

```text

**Expected:** Changes saved, preview works

### Feature 5: Comments (2 min)

```text

1. Click et dokument for at view
2. Scroll ned til "Comments" sektion
3. Skriv "Test comment" i textarea
4. Click "Add Comment"
5. Toast: "Comment added!"
6. Se din comment appear
7. Click ✓ (resolve button)
8. Toast: "Comment resolved!"
9. Comment moves to "Resolved" section

```text

**Expected:** Comments fungerer, resolve virker

### Feature 6: Quick Actions (1 min)

```text

1. Hover over et doc card
2. Click ⋮ menu
3. Click "Copy Link"
4. Toast: "Link copied to clipboard!"
5. Paste link i browser (Ctrl+V) - virker ikke endnu da auth kræves

```text

**Expected:** Toast appears, link kopieret

### Feature 7: Keyboard Shortcuts (1 min)

```text

1. På docs list page
2. Press Ctrl+K → Search får focus
3. Type noget
4. Press Esc → Search cleared
5. Press Ctrl+N → New doc dialog
6. Press Esc → Cancelled
7. Click ⌨️ icon (top right)
8. Se shortcuts modal

```bash

**Expected:** Alle shortcuts virker

---

## 📊 What to Look For

### UI Elements

- ✅ Clean, modern design
- ✅ Smooth animations
- ✅ Responsive layout
- ✅ Icons everywhere
- ✅ Color-coded categories

### Performance

- ✅ Search real-time (<100ms)
- ✅ Filters instant
- ✅ No lag
- ✅ Smooth scrolling

### Data

- ✅ 340 docs showing
- ✅ Correct categories
- ✅ Tags visible
- ✅ Timestamps formatted

### Real-time

- ✅ Green "Live" badge
- ✅ No errors in console
- ✅ WebSocket connected

---

## 🐛 Troubleshooting

### Problem: "Documents (0)"

**Solution:**

- Check if import script ran: `node scripts/check-imported-docs.mjs`
- Should show 340 docs in database

### Problem: WebSocket "Offline"

**Solution:**

- Check server logs for "[WSHub] WebSocket server started"
- Port 3002 should be open
- Docs service should show "[Docs] Service started"

### Problem: Can't access /docs

**Solution:**

- Route is protected, requires login
- Use dev login or proper auth
- Should redirect to login if not authenticated

### Problem: Keyboard shortcuts don't work

**Solution:**

- Make sure focus is on docs page
- Some shortcuts only work in specific contexts
- Ctrl+K requires list view
- Ctrl+S requires editor

### Problem: Templates don't load

**Solution:**

- Check browser console for errors
- Templates should auto-fill when selected
- Try refresh page (Ctrl+R)

---

## 🎨 Visual Tour

### List View

```text
┌─────────────────────────────────────────┐
│ 📚 Documentation          🔴 Live ⌨️   │
├─────────────────────────────────────────┤
│ [Search...] [Category▼] [Tag▼]         │
│ [Template▼] [New Document]              │
├─────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐      │
│ │ 📄 Doc 1    │ │ 📄 Doc 2    │      │
│ │ Email System│ │ Invoices    │      │
│ │ #email #api │ │ #billy      │      │
│ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────┘

```text

### Document View

```text
┌─────────────────────────────────────────┐
│ ← Back          📄 My Document    [Edit]│
├─────────────────────────────────────────┤
│ Category: Email System                  │
│ Tags: #email #api #urgent               │
│ Author: system | Updated 2 hours ago    │
├─────────────────────────────────────────┤
│ # Document Content                      │
│                                         │
│ Here's the markdown rendered...         │
│                                         │
├─────────────────────────────────────────┤
│ 💬 Comments (3)                         │
│ ┌─────────────────────────────────────┐│
│ │ 👤 user1: Great doc!                ││
│ │    2 hours ago              [✓]     ││
│ └─────────────────────────────────────┘│
│ [Add comment...]                [Send] │
└─────────────────────────────────────────┘

```text

### Editor View

```text
┌─────────────────────────────────────────┐
│ ← Cancel     Create Document  [Save]    │
├─────────────────────────────────────────┤
│ Title: [My Feature Spec]                │
│ Category: [Planning]  Tags: [feature]  │
├─────────────────────────────────────────┤
│ [Edit] [Preview]                        │
│ ┌─────────────────────────────────────┐│
│ │ # My Feature                        ││
│ │                                     ││
│ │ ## Overview                         ││
│ │ Description here...                 ││
│ │                                     ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

```

---

## 🎯 Success Criteria

After completing this demo, you should have:

✅ **Seen all 340 docs**

- Browsed multiple categories
- Filtered by tags
- Searched successfully

✅ **Created a document**

- Used a template
- Saw markdown preview
- Saved successfully

✅ **Tested collaboration**

- Added a comment
- Resolved a comment
- Saw timestamps

✅ **Used shortcuts**

- Ctrl+K for search
- Ctrl+S to save
- Ctrl+P for preview
- Esc to cancel

✅ **Verified real-time**

- WebSocket "Live" status
- No console errors
- Toast notifications

---

## 📝 Next Steps After Demo

### If Everything Works

1. ✅ Start using for real documentation
1. ✅ Create meeting notes
1. ✅ Document features
1. ✅ Track bugs

### If Issues Found

1. Check console for errors
1. Verify database has 340 docs
1. Ensure WebSocket connected
1. Review server logs

### To Improve

1. Add AI auto-categorization
1. Implement semantic search
1. Add tree view
1. Enhance markdown editor

---

## 💡 Tips & Tricks

### Power User Tips

- Use Ctrl+K to quickly jump to search
- Use templates for consistency
- Mark old docs as outdated with ⋮ menu
- Resolve comments to keep discussions clean
- Use tags to organize cross-category docs

### Team Collaboration

- Comment on docs to discuss
- Mark docs outdated when replaced
- Use "Needs Review" filter to find work
- Create new docs with templates for consistency

### Organization

- Keep categories clean (9 main ones)
- Use tags liberally
- Add meaningful titles
- Write good commit messages (auto-commit enabled)

---

## 🎉 You're Ready

If you completed all steps successfully, your docs system is **fully operational**!

**Start documenting! 📝**
