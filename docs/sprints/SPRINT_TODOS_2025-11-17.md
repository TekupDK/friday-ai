# Sprint TODOs: Week 5 - CRM Polish & Integrations

**Sprint Periode:** 2025-11-17 - 2025-11-24
**Duration:** 7 dage
**Total Story Points:** 18 (P1 + P2)

## High Priority Tasks (P1) - 8 Story Points

### 1. Supabase Storage Integration for DocumentUploader

- [ ] **Setup Supabase Storage**
  - [ ] Verify Supabase Storage bucket exists
  - [ ] Configure bucket permissions
  - [ ] Test storage access
  - **Estimate:** 1 hour

- [ ] **Implement File Upload**
  - [ ] Install Supabase client library (if needed)
  - [ ] Create upload function
  - [ ] Get storage URL after upload
  - [ ] Handle upload errors
  - **Estimate:** 3 hours

- [ ] **Integrate with DocumentUploader**
  - [ ] Replace placeholder URL with actual upload
  - [ ] Add progress indicator
  - [ ] Add file validation (size, type)
  - [ ] Test upload flow
  - **Estimate:** 2 hours

**Total:** 6 hours / 5 story points

### 2. Team 2 Rapport - Test og Verificer Klage Detektion

- [ ] **Test med Real Data**
  - [ ] Kør rapport script med november 1-15 data
  - [ ] Verificer events bliver fundet
  - [ ] Check klage-detektion accuracy
  - **Estimate:** 1 hour

- [ ] **Verificer mod Claude's Analyse**
  - [ ] Sammenlign fundne klager med Claude's dokument
  - [ ] Identificer manglende klager
  - [ ] Identificer false positives
  - **Estimate:** 1 hour

- [ ] **Juster Patterns hvis Nødvendigt**
  - [ ] Opdater keyword patterns
  - [ ] Forbedre complaint detection logic
  - [ ] Test igen
  - **Estimate:** 1 hour

**Total:** 3 hours / 2 story points

### 3. Fix Remaining TypeScript Errors

- [ ] **Find alle TypeScript Errors**
  - [ ] Kør `pnpm check`
  - [ ] Liste alle errors
  - **Estimate:** 0.5 hour

- [ ] **Fix Errors**
  - [ ] Fix hver error systematisk
  - [ ] Verificer fixes
  - **Estimate:** 1.5 hours

**Total:** 2 hours / 1 story point

## Medium Priority Tasks (P2) - 10 Story Points

### 4. Improve SegmentBuilder - Enhanced Rule Logic

- [ ] **Add Complex Rule Support**
  - [ ] Support AND/OR logic between rules
  - [ ] Add rule groups
  - [ ] Visual rule builder improvements
  - **Estimate:** 2 hours

- [ ] **Add More Field Options**
  - [ ] Add totalRevenue field
  - [ ] Add invoiceCount field
  - [ ] Add lastContactDate field
  - [ ] Add customerType field
  - **Estimate:** 1 hour

- [ ] **Add Rule Preview**
  - [ ] Preview estimated member count
  - [ ] Show matching customers (sample)
  - [ ] Real-time preview update
  - **Estimate:** 1 hour

**Total:** 4 hours / 3 story points

### 5. Enhance RelationshipGraph - Network Visualization

- [ ] **Research Visualization Library**
  - [ ] Evaluate vis.js vs d3.js vs react-force-graph
  - [ ] Choose library
  - **Estimate:** 0.5 hour

- [ ] **Implement Network Graph (Optional)**
  - [ ] Install chosen library
  - [ ] Create graph component
  - [ ] Render nodes and edges
  - [ ] Add interactivity (zoom, pan)
  - **Estimate:** 3 hours

- [ ] **Fallback til List View**
  - [ ] Keep existing list view
  - [ ] Add toggle between graph/list
  - **Estimate:** 1.5 hours

**Total:** 5 hours / 4 story points (kan reduceres hvis graph ikke implementeres)

### 6. Add Update Segment Endpoint

- [ ] **Backend: Update Segment Endpoint**
  - [ ] Create `updateSegment` procedure
  - [ ] Add validation
  - [ ] Test endpoint
  - **Estimate:** 1 hour

- [ ] **Frontend: Integrate Update**
  - [ ] Update SegmentForm to use update endpoint
  - [ ] Test update flow
  - **Estimate:** 1 hour

**Total:** 2 hours / 2 story points

## Low Priority Tasks (P3) - 4 Story Points

### 7. Add Export Functionality to Reports

- [ ] **PDF Export**
  - [ ] Install PDF library (jsPDF eller react-pdf)
  - [ ] Create PDF generation function
  - [ ] Add download button
  - **Estimate:** 2 hours

- [ ] **CSV Export**
  - [ ] Create CSV generation function
  - [ ] Add download button
  - **Estimate:** 1 hour

**Total:** 3 hours / 2 story points

### 8. Improve RevenueChart Visualization

- [ ] **Add Chart Library**
  - [ ] Install Recharts eller Chart.js
  - [ ] Setup chart component
  - **Estimate:** 1 hour

- [ ] **Implement Chart**
  - [ ] Create bar/line chart
  - [ ] Add tooltips
  - [ ] Add time range selector
  - **Estimate:** 2 hours

**Total:** 3 hours / 2 story points

## Task Selection Rationale

**Selected Tasks:**

- **P1 Tasks (8 SP):** Kritisk for production readiness
  - Supabase Storage er nødvendig for document management
  - Team 2 rapport skal være korrekt
  - TypeScript errors skal fixes

- **P2 Tasks (10 SP):** Vigtige forbedringer
  - SegmentBuilder forbedringer gør feature mere brugbar
  - RelationshipGraph forbedringer (optional)
  - Update Segment endpoint mangler

**Not Selected (P3):**

- Export functionality - Nice to have, kan vente
- RevenueChart improvements - Allerede fungerer, kan forbedres senere

## Estimated Effort

**Total Committed:** 18 story points

- P1: 8 story points (44%)
- P2: 10 story points (56%)

**Total Hours:** ~25 timer

- P1: ~11 timer
- P2: ~14 timer

## Daily Breakdown

### Day 1 (2025-11-17) - Supabase Setup

- [ ] Supabase Storage setup (1h)
- [ ] File upload implementation (3h)
- **Goal:** Upload fungerer

### Day 2 (2025-11-18) - Supabase Polish

- [ ] Error handling og validation (1h)
- [ ] Testing og polish (1h)
- [ ] Start Team 2 rapport testing (1h)
- **Goal:** DocumentUploader production-ready

### Day 3 (2025-11-19) - Team 2 Rapport

- [ ] Test med real data (1h)
- [ ] Verificer klage-detektion (1h)
- [ ] Juster patterns (1h)
- **Goal:** Rapport korrekt

### Day 4 (2025-11-20) - TypeScript & Code Quality

- [ ] Fix TypeScript errors (2h)
- [ ] Code review (1h)
- **Goal:** Clean codebase

### Day 5 (2025-11-21) - Segment Improvements

- [ ] SegmentBuilder enhancements (4h)
- **Goal:** SegmentBuilder forbedret

### Day 6 (2025-11-22) - Backend & Graph

- [ ] Update Segment endpoint (2h)
- [ ] RelationshipGraph enhancements (3h)
- **Goal:** Features complete

### Day 7 (2025-11-23) - Testing & Documentation

- [ ] Integration testing (2h)
- [ ] Documentation (1h)
- [ ] Final review (1h)
- **Goal:** Sprint ready

## Success Criteria

- [ ] Supabase Storage integration fungerer
- [ ] Team 2 rapport viser klager korrekt
- [ ] Alle TypeScript errors rettet
- [ ] SegmentBuilder forbedret
- [ ] Update Segment endpoint implementeret
- [ ] No critical bugs
- [ ] Code review completed
- [ ] Tests passing

## Risk Items

1. **Supabase Storage Setup** - Kan kræve ekstra konfiguration
2. **Klage-detektion Accuracy** - Kan kræve flere iterationer
3. **Network Visualization** - Kan blive kompleks, fallback til list view OK
