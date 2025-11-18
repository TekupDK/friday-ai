# Sprint Plan: Week 5 - CRM Polish & Integrations

**Dato:** 2025-11-17
**Sprint Periode:** 2025-11-17 - 2025-11-24
**Duration:** 7 dage
**Team Capacity:** ~40 timer / 20 story points

## Sprint Goals

1. **Supabase Storage Integration** - Implementer faktisk file upload til Supabase Storage for documents
2. **Team 2 Rapport Forbedringer** - Test og forbedre klage-detektion i Team 2 FB Rengøring rapport
3. **CRM Feature Polish** - Forbedre eksisterende CRM features med bug fixes og UX forbedringer
4. **Testing & Quality** - Sikre kvalitet gennem testing og code review

## Sprint Backlog

### High Priority (Must Have)

1. **Supabase Storage Integration for DocumentUploader**
   - **Priority:** P1
   - **Estimated:** 6 hours / 5 story points
   - **Dependencies:** Supabase Storage setup, backend endpoint for upload
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] File upload til Supabase Storage bucket
     - [ ] Get storage URL efter upload
     - [ ] Error handling for upload failures
     - [ ] Progress indicator under upload
     - [ ] File size validation (max 10MB)
     - [ ] File type validation
     - [ ] Storage URL gemmes i database

2. **Team 2 Rapport - Test og Verificer Klage Detektion**
   - **Priority:** P1
   - **Estimated:** 3 hours / 2 story points
   - **Dependencies:** Team 2 rapport script (allerede implementeret)
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Test rapport med real data fra november 1-15
     - [ ] Verificer klage-detektion matcher Claude's analyse
     - [ ] Juster keyword patterns hvis nødvendigt
     - [ ] Verificer complaint notes vises korrekt i rapport
     - [ ] Test med forskellige email formater

3. **Fix Remaining TypeScript Errors**
   - **Priority:** P1
   - **Estimated:** 2 hours / 1 story point
   - **Dependencies:** None
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Alle TypeScript errors rettet
     - [ ] `pnpm check` passerer uden fejl
     - [ ] Ingen linter warnings

### Medium Priority (Should Have)

4. **Improve SegmentBuilder - Enhanced Rule Logic**
   - **Priority:** P2
   - **Estimated:** 4 hours / 3 story points
   - **Dependencies:** SegmentBuilder component (allerede implementeret)
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Support for complex rules (AND/OR logic)
     - [ ] More field options (totalRevenue, invoiceCount, etc.)
     - [ ] Rule preview med estimated member count
     - [ ] Save/load rules from segment metadata

5. **Enhance RelationshipGraph - Network Visualization**
   - **Priority:** P2
   - **Estimated:** 5 hours / 4 story points
   - **Dependencies:** RelationshipGraph component (allerede implementeret)
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Visual network graph (optional - kan bruge vis.js eller d3)
     - [ ] Interactive nodes og edges
     - [ ] Filter by relationship type
     - [ ] Zoom og pan funktionalitet
     - [ ] Fallback til list view hvis graph ikke implementeres

6. **Add Update Segment Endpoint**
   - **Priority:** P2
   - **Estimated:** 2 hours / 2 story points
   - **Dependencies:** Backend (crm-extensions-router)
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] `updateSegment` endpoint i backend
     - [ ] Support for updating name, description, color, rules
     - [ ] Integration i SegmentForm component
     - [ ] Test update flow

### Low Priority (Nice to Have)

7. **Add Export Functionality to Reports**
   - **Priority:** P3
   - **Estimated:** 3 hours / 2 story points
   - **Dependencies:** Team 2 rapport script
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Export rapport til PDF
     - [ ] Export rapport til CSV
     - [ ] Download button i rapport UI

8. **Improve RevenueChart Visualization**
   - **Priority:** P3
   - **Estimated:** 3 hours / 2 story points
   - **Dependencies:** RevenueChart component (allerede implementeret)
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Add chart library (Recharts eller Chart.js)
     - [ ] Visual chart med bars/lines
     - [ ] Interactive tooltips
     - [ ] Time range selector

## Daily Breakdown

### Day 1 (2025-11-17)

- Supabase Storage integration - Setup og konfiguration
- Supabase Storage integration - Upload implementation
- **Goal:** File upload til Supabase fungerer

### Day 2 (2025-11-18)

- Supabase Storage integration - Error handling og validation
- Supabase Storage integration - Testing og polish
- **Goal:** DocumentUploader er production-ready

### Day 3 (2025-11-19)

- Team 2 rapport - Test med real data
- Team 2 rapport - Verificer klage-detektion
- Team 2 rapport - Juster patterns hvis nødvendigt
- **Goal:** Rapport viser klager korrekt

### Day 4 (2025-11-20)

- Fix remaining TypeScript errors
- Code review og cleanup
- **Goal:** Alle TypeScript errors rettet

### Day 5 (2025-11-21)

- Improve SegmentBuilder - Enhanced rule logic
- Add Update Segment endpoint
- **Goal:** SegmentBuilder er forbedret

### Day 6 (2025-11-22)

- Enhance RelationshipGraph (optional network visualization)
- Integration testing
- **Goal:** Features er testet og fungerer

### Day 7 (2025-11-23)

- Documentation updates
- Final testing
- Code review
- **Goal:** Sprint ready for merge

## Milestones & Checkpoints

### Milestone 1: Supabase Integration Complete (Day 2)

- DocumentUploader med Supabase Storage - ✅
- File upload fungerer - ✅
- **Verification:** Upload et dokument og verificer det gemmes i Supabase

### Milestone 2: Team 2 Rapport Verified (Day 3)

- Klage-detektion testet - ✅
- Rapport genereres korrekt - ✅
- **Verification:** Kør rapport og sammenlign med Claude's analyse

### Milestone 3: TypeScript Clean (Day 4)

- Alle TypeScript errors rettet - ✅
- Code review completed - ✅
- **Verification:** `pnpm check` passerer

### Milestone 4: Feature Enhancements (Day 6)

- SegmentBuilder forbedret - ✅
- RelationshipGraph forbedret (optional) - ✅
- **Verification:** Features fungerer som forventet

## Risk Assessment

### High Risk

- **Supabase Storage Setup** - Kan kræve konfiguration og permissions
  - **Mitigation:** Tjek Supabase setup først, dokumenter requirements

### Medium Risk

- **Klage-detektion Accuracy** - Kan misser nogle klager eller false positives
  - **Mitigation:** Test med real data, juster patterns iterativt

### Low Risk

- **Network Visualization Complexity** - Kan blive kompleks
  - **Mitigation:** Start med simple list view, udvid til graph hvis tid tillader

## Success Criteria

- [ ] Supabase Storage integration fungerer
- [ ] Team 2 rapport viser klager korrekt
- [ ] Alle TypeScript errors rettet
- [ ] SegmentBuilder forbedret
- [ ] Update Segment endpoint implementeret
- [ ] No critical bugs introduced
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated

## Velocity Projection

**Previous Velocity:** ~20 story points (Week 1-4: CRM UI implementation)
**Sprint Capacity:** 20 story points
**Committed:** 18 story points (P1 + P2 tasks)
**Buffer:** 10% (for unexpected work)

## Dependencies

### External Dependencies

- Supabase Storage bucket setup - ⚠️ Need to verify
- Supabase Storage permissions - ⚠️ Need to configure
- Backend endpoints - ✅ Already available

### Internal Dependencies

- Supabase Storage integration must complete before testing DocumentUploader
- Team 2 rapport testing requires real calendar/email data
- SegmentBuilder improvements can be done in parallel

## Notes

- Supabase Storage integration er kritisk for document management
- Team 2 rapport forbedringer baseret på bruger feedback
- Fokus på polish og quality denne sprint
- Test med real data er vigtigt
