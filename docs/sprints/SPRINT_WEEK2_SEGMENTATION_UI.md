# Sprint Plan: Week 2 - Segmentation UI

**Dato:** 2025-01-28
**Sprint Periode:** 2025-01-28 - 2025-02-04
**Duration:** 7 dage
**Team Capacity:** ~40 timer / 20 story points

## Sprint Goals

1. **SegmentList Page** - Vis alle customer segments med member counts
2. **SegmentBuilder Component** - Rule-based UI for at oprette automatiske segments
3. **SegmentActions Component** - Bulk operations for at tilføje/fjerne customers fra segments

## Sprint Backlog

### High Priority (Must Have)

1. **SegmentList Page** - Display segments with member counts
   - **Priority:** P1
   - **Estimated:** 4 hours / 3 story points
   - **Dependencies:** `trpc.crm.extensions.listSegments`
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Page viser alle segments for brugeren
     - [ ] Hvert segment viser navn, type (manual/automatic), member count
     - [ ] Kan klikke på segment for at se detaljer
     - [ ] Loading og error states håndteret
     - [ ] Responsive design

2. **SegmentCard Component** - Segment detail card
   - **Priority:** P1
   - **Estimated:** 3 hours / 2 story points
   - **Dependencies:** SegmentList page
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Viser segment navn, type, description
     - [ ] Viser member count
     - [ ] Viser color badge
     - [ ] Edit og Delete actions
     - [ ] Apple UI styling

3. **SegmentForm Modal** - Create/Edit segment
   - **Priority:** P1
   - **Estimated:** 4 hours / 3 story points
   - **Dependencies:** SegmentCard component
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Form med name, description, type, color fields
     - [ ] Type dropdown (manual/automatic)
     - [ ] Color picker eller dropdown
     - [ ] Rules editor for automatic segments
     - [ ] Create og Update mutations
     - [ ] Validation og error handling

### Medium Priority (Should Have)

4. **SegmentBuilder Component** - Rule-based UI for auto segments
   - **Priority:** P2
   - **Estimated:** 6 hours / 5 story points
   - **Dependencies:** SegmentForm modal
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Visual rule builder interface
     - [ ] Support for healthScore, status, tags rules
     - [ ] Add/remove rule conditions
     - [ ] Preview segment members
     - [ ] Save rules to segment metadata

5. **SegmentActions Component** - Bulk operations
   - **Priority:** P2
   - **Estimated:** 4 hours / 3 story points
   - **Dependencies:** SegmentList page
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] Add customers to segment (bulk)
     - [ ] Remove customers from segment (bulk)
     - [ ] Multi-select customer list
     - [ ] Confirmation dialogs
     - [ ] Success/error notifications

### Low Priority (Nice to Have)

6. **Segment Members View** - View customers in segment
   - **Priority:** P3
   - **Estimated:** 3 hours / 2 story points
   - **Dependencies:** SegmentList page
   - **Owner:** Developer
   - **Acceptance Criteria:**
     - [ ] List customers in segment
     - [ ] Search og filter
     - [ ] Remove individual customers
     - [ ] Navigate to customer profile

## Daily Breakdown

### Day 1 (2025-01-28)

- SegmentList page - Setup og data fetching
- SegmentCard component - Basic structure
- **Goal:** SegmentList viser segments med data

### Day 2 (2025-01-29)

- SegmentCard component - Complete styling og actions
- SegmentForm modal - Create segment
- **Goal:** Kan oprette nye segments

### Day 3 (2025-01-30)

- SegmentForm modal - Edit segment
- SegmentForm modal - Rules editor (basic)
- **Goal:** Kan redigere segments

### Day 4 (2025-01-31)

- SegmentBuilder component - Rule builder UI
- SegmentBuilder component - Rule preview
- **Goal:** Rule-based segment creation

### Day 5 (2025-02-01)

- SegmentActions component - Add to segment
- SegmentActions component - Remove from segment
- **Goal:** Bulk operations fungerer

### Day 6 (2025-02-02)

- Integration testing
- Bug fixes
- Polish UI
- **Goal:** Feature complete og testet

### Day 7 (2025-02-03)

- Documentation
- Code review
- Final testing
- **Goal:** Ready for merge

## Milestones & Checkpoints

### Milestone 1: SegmentList Complete (Day 1)

- SegmentList page - ✅
- SegmentCard component - ✅
- **Verification:** Kan se alle segments i liste

### Milestone 2: CRUD Operations (Day 3)

- Create segment - ✅
- Edit segment - ✅
- Delete segment - ✅
- **Verification:** Alle CRUD operations fungerer

### Milestone 3: Advanced Features (Day 5)

- Rule builder - ✅
- Bulk operations - ✅
- **Verification:** Alle features fungerer

## Risk Assessment

### High Risk

- **Rule Builder Complexity** - Rule builder kan blive kompleks
  - **Mitigation:** Start med simple rules, udvid gradvist

### Medium Risk

- **Performance med mange segments** - Kan blive langsomt
  - **Mitigation:** Implementer pagination og virtual scrolling

### Low Risk

- **UI/UX consistency** - Skal matche eksisterende design
  - **Mitigation:** Brug Apple UI components konsekvent

## Success Criteria

- [ ] All high priority tasks completed
- [ ] SegmentList page fungerer
- [ ] Kan oprette og redigere segments
- [ ] Rule builder fungerer for automatic segments
- [ ] Bulk operations fungerer
- [ ] No critical bugs introduced
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated

## Velocity Projection

**Previous Velocity:** ~20 story points (Week 1: Opportunities UI)
**Sprint Capacity:** 20 story points
**Committed:** 18 story points (P1 + P2 tasks)
**Buffer:** 10% (for unexpected work)

## Dependencies

### External Dependencies

- Backend endpoints - ✅ Already available (`crm-extensions-router.ts`)
- Apple UI components - ✅ Already available

### Internal Dependencies

- SegmentList must complete before SegmentActions
- SegmentForm must complete before SegmentBuilder
- SegmentCard must complete before SegmentForm

## Notes

- Backend er 100% klar - alle endpoints eksisterer
- Følg samme patterns som Opportunities UI
- Brug Apple UI components konsekvent
- Test med real data
