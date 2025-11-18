# Implementation Plan - CRM Module Frontend

## Overview

This implementation plan focuses on building the **frontend UI** for the CRM module. The backend is already implemented with functional TRPC routers (`crm-customer-router`, `crm-lead-router`, `crm-booking-router`).

All tasks build incrementally, with each task integrating into the previous work. Tasks are organized into 4 phases matching the deployment strategy.

---

## ✅ Current Status (Updated: 12. november 2025)

- **Backend:** Phase 1-6 complete — 51 TRPC endpoints and 12 CRM tables implemented and tested.

- **Phase 2-6 (Opportunities, Segments, Documents, Audit, Relationships):** Backend ✅ Complete

- **Frontend Tasks:** Remaining — UI components for Phase 2-6 to be implemented by Kiro.

- **Tests:** Full backend test suite available: `server/scripts/test-crm-extensions.ts`

---

## 🛠️ Phase 2-6 Frontend Tasks (Kiro)

These tasks reflect the UI work required to consume the Phase 2-6 backend we've implemented. Prioritize Kanban + revenue visualization first.

### Week 1: Opportunities UI

- [ ] `OpportunityPipeline` - Kanban board with stages and drag-drop (trpc.crm.extensions.listOpportunities, trpc.crm.extensions.updateOpportunity)

- [ ] `OpportunityCard` - Deal detail card (value, probability, customer) with quick actions (Edit, Move Stage, Delete)

- [ ] `OpportunityForm` - Create/Edit modal for opportunity (createOpportunity, updateOpportunity)

- [ ] `RevenueChart` - Forecast visualization using `getPipelineStats` and `getRevenueForecast`

### Week 2: Segmentation UI

- [ ] `SegmentList` - Display segments with member counts (listSegments)

- [ ] `SegmentBuilder` - Rule-based UI for auto segments (createSegment)

- [ ] `SegmentActions` - Bulk operations (addToSegment, removeFromSegment)

### Week 3: Documents & Audit UI

- [ ] `DocumentUploader` - Integration with Supabase Storage (createDocument)

- [ ] `DocumentList` - List and search by tags (listDocuments)

- [ ] `AuditTimeline` - Show audit logs per entity (getAuditLog)

### Week 4: Relationships UI

- [ ] `RelationshipGraph` - Network visualization for customer relationships (getRelationships)

- [ ] `RelationshipForm` - Add/Edit relationship (createRelationship)

---

---

## Fase 0: Apple Design System Foundation (Uge 0)

### - [ ] 0. Build Apple UI Component Library

Create reusable Apple-inspired UI primitives before building CRM features.

- [x] 0.1 Setup design system foundation ✅

  - Install dependencies: `framer-motion@^11.0.0`, `gsap@^3.12.0`, `lenis@^1.0.0`

  - Create `client/src/styles/apple-design-system/` folder

  - Create `tokens.ts` with all design tokens (colors, typography, spacing, shadows)

  - Create `animations.ts` with spring configurations and easings

  - Create `materials.ts` with frosted glass effect utilities

  - _Requirements: All (foundation)_

- [x] 0.2 Build Apple Button components ✅

  - Create `AppleButton.tsx` with base button logic

  - Implement variants: primary (filled), secondary (outline), tertiary (text)

  - Add spring press animation (scale 0.95 on tap)

  - Add ripple effect on click

  - Add loading state with spinner

  - Add disabled state styling

  - Create `AppleButton.module.css` with Apple styling

  - _Requirements: All (buttons used everywhere)_

- [x] 0.3 Build Apple Card components ✅

  - Create `AppleCard.tsx` with base card logic

  - Implement variants: elevated (shadow), filled (solid), glass (frosted), outlined

  - Add hover lift animation (translateY -4px)

  - Add spring physics for smooth animations

  - Create `AppleCard.module.css` with Apple styling

  - _Requirements: 1.1, 2.1, 4.1_

- [x] 0.4 Build Apple Input components ✅

  - Create `AppleInput.tsx` with iOS-style input

  - Add focus ring animation

  - Add floating label animation

  - Add error state with shake animation

  - Create `AppleSearchField.tsx` with search icon

  - Add clear button (X) that appears on input

  - _Requirements: 7.1, 2.5_

- [x] 0.5 Build Apple Modal/Drawer components ✅

  - Create `AppleModal.tsx` with center modal

  - Create `AppleSheet.tsx` with bottom sheet (iOS style)

  - Create `AppleDrawer.tsx` with side drawer (840px)

  - Add frosted glass backdrop

  - Add swipe-to-close gesture support

  - Add spring slide-in animation

  - Implement focus trap for accessibility

  - _Requirements: 2.5, 3.1, 5.5_

- [x] 0.6 Build Apple Effects components ✅

  - Create `BlurView.tsx` for frosted glass effect

  - Create `SpringTransition.tsx` wrapper for spring animations

  - Create `ScrollReveal.tsx` for scroll-triggered animations

  - _Requirements: All (visual effects)_

- [x] 0.7 Build Apple List components ✅

  - Create `AppleListItem.tsx` with iOS list item style

  - Add chevron indicator

  - Add separator lines

  - _Requirements: 2.2, 3.2_

- [x] 0.8 Build Apple Badge/Tag components ✅

  - Create `AppleBadge.tsx` with system colors

  - Add variants for each status (new, active, vip, at_risk)

  - Add scale-in animation

  - Create `AppleTag.tsx` for removable tags

  - Add remove button with spring animation

  - _Requirements: 1.1, 2.1_

- [x] 0.9 Setup smooth scrolling ✅

  - Install and configure Lenis for smooth scrolling

  - Add scroll-to-top button (iOS style)

  - Create `useSmoothScroll` hook

  - Create `ScrollToTop` component

  - _Requirements: All (smooth scrolling everywhere)_

- [x] 0.10 Create Apple icon system ✅

  - Configure Lucide icons with SF Symbols styling (strokeWidth: 2.5)

  - Create `AppleIcon.tsx` wrapper component

  - Export commonly used icons with Apple styling

  - Create icon size scale (xs, sm, md, lg, xl)

  - _Requirements: All (icons everywhere)_

- [x] 0.11 Setup Storybook for component documentation ✅

  - Install Storybook with Vite

  - Configure Storybook with Apple design system theme

  - Create `.storybook/preview.ts` with global decorators

  - Add dark mode toggle addon

  - Configure viewport addon for responsive testing (iPhone, iPad, Desktop)

  - _Requirements: All (component documentation)_

- [x] 0.12 Create Storybook stories for Apple UI primitives ✅

  - Create `AppleButton.stories.tsx` with all variants

  - Add interactive controls for all props

  - _Requirements: All (component showcase)_

- [x] 0.13 Setup browser compatibility testing ✅

  - Create feature detection utilities (`useFeatureDetection`)

  - Implement backdrop-filter fallbacks (in materials.ts)

  - Add performance tier detection (`usePerformanceTier`)

  - Create adaptive rendering hooks (`useAdaptiveRendering`)

  - _Requirements: All (cross-browser support)_

- [x] 0.14 Implement reduced motion support ✅

  - Create `useReducedMotion` hook

  - Add global CSS for reduced motion

  - All components respect `prefers-reduced-motion`

  - Adaptive animation variants based on user preferences

  - _Requirements: All (accessibility)_

---

## Fase 1: Manual CRM Foundation (Måned 1)

### - [ ] 1. Setup CRM Infrastructure and Apple Design System

Create the foundational structure for CRM module with Apple-inspired design system.

- [ ] 1.1 Create CRM folder structure

  - Create `client/src/pages/crm/` directory

  - Create `client/src/components/crm/apple-ui/` directory (Apple primitives)

  - Create `client/src/components/crm/domain/` directory (CRM components)

  - Create `client/src/hooks/crm/` directory

  - Create `client/src/styles/apple-design-system/` directory

  - _Requirements: 15.1, 15.2_

- [ ] 1.2 Setup Apple Design System

  - Create `apple-design-system/tokens.ts` with design tokens (colors, typography, spacing)

  - Create `apple-design-system/animations.ts` with spring configurations

  - Create `apple-design-system/materials.ts` with frosted glass effects

  - Create `apple-design-system/utils.ts` with helper functions

  - Install dependencies: `framer-motion`, `gsap`, `lenis`, `@use-gesture/react`

  - _Requirements: All (design foundation)_

- [ ] 1.3 Setup TRPC client for CRM

  - Create `client/src/lib/trpc-crm.ts` with CRM router types

  - Configure TanStack Query for CRM endpoints

  - Add error handling and retry logic

  - _Requirements: 1.5, 7.1_

- [ ] 1.3 Add CRM navigation to WorkspaceLayout

  - Update `client/src/pages/WorkspaceLayout.tsx` with CRM nav items

  - Add routes: `/crm/dashboard`, `/crm/customers`, `/crm/leads`, `/crm/bookings`

  - Add CRM icons (Users, Target, Calendar, BarChart)

  - Implement active route highlighting

  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 1.4 Create Apple UI Primitives

  - Create `AppleButton` component with variants (primary, secondary, tertiary)

  - Create `AppleCard` component with variants (elevated, filled, glass, outlined)

  - Create `AppleInput` component with Apple styling

  - Create `AppleSelect` component with Apple dropdown style

  - Create `AppleBadge` component for status indicators

  - _Requirements: 1.1, 4.1_

- [ ] 1.5 Create Apple Effects Components

  - Create `BlurView` component for frosted glass effect

  - Create `VibrancyView` component for vibrancy effect

  - Create `ParallaxView` component for parallax scrolling

  - Create `SpringTransition` wrapper for spring animations

  - _Requirements: All (visual effects)_

---

### - [ ] 2. Customer Management UI (Apple Style)

Build the customer list and profile interfaces with Apple-inspired design.

- [ ] 2.1 Create CustomerCard component (Apple style)

  - Use `AppleCard` with glass variant for frosted glass effect

  - Display customer avatar with gradient background (SF Symbols style)

  - Show customer name with SF Pro Display typography

  - Add status badge with Apple system colors

  - Display contact info with Lucide icons (SF Symbols style)

  - Show tags as rounded chips with subtle background

  - Add financial summary bar with Apple Card aesthetic

  - Implement hover lift animation with spring physics

  - Add chevron indicator (iOS style)

  - _Requirements: 1.1, 1.2, 7.2_

- [ ] 2.2 Create CustomerList page (Apple style)

  - Implement responsive grid layout with Apple spacing (8pt grid)

  - Add page transition animation (fade + slide)

  - Fetch customers using `trpc.crm.customer.listProfiles`

  - Display CustomerCard with stagger animation (cards appear one by one)

  - Add shimmer loading skeletons (Apple style)

  - Implement smooth scroll with Lenis

  - Add scroll-reveal animations for cards

  - Implement error handling with Apple-style toast notifications

  - _Requirements: 1.1, 7.1, 7.5_

- [ ] 2.3 Implement customer search and filters (Apple style)

  - Create `AppleSearchField` with iOS-style search bar

  - Add search icon with SF Symbols styling

  - Implement real-time search with smooth debounce (300ms)

  - Create `AppleFilterSheet` (iOS bottom sheet style)

  - Add status filter with Apple segmented control style

  - Add tag filter with checkbox list (iOS Settings style)

  - Implement filter animations (slide + fade)

  - Add "Clear Filters" button with spring animation

  - Show active filter count badge

  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 2.4 Add pagination to customer list

  - Implement pagination component (50 records per page)

  - Add page navigation controls

  - Show total count and current page

  - Persist pagination state in URL params

  - _Requirements: 7.5_

- [ ] 2.5 Create CustomerFormModal component

  - Build form with React Hook Form + Zod validation

  - Add fields: name, email, phone, status, tags, customer type

  - Implement create customer mutation

  - Implement update customer mutation

  - Add success/error toast notifications

  - _Requirements: 1.1, 1.5_

---

### - [ ] 3. Customer Profile Drawer (Apple Style)

Build detailed customer profile view with Apple-inspired drawer.

- [ ] 3.1 Create CustomerProfileDrawer component (Apple style)

  - Implement slide-in drawer (840px width) with spring animation

  - Add frosted glass backdrop with blur effect

  - Add iOS-style handle bar at top

  - Implement swipe-to-close gesture (iOS style)

  - Fetch customer data using `trpc.crm.customer.getProfile`

  - Display customer header with large avatar and SF Pro typography

  - Add status badge with Apple system colors

  - Implement shimmer loading skeleton

  - Add error state with Apple-style alert

  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.2 Implement Overview tab (Apple style)

  - Create iOS-style segmented control for tabs

  - Display financial summary in Apple Card style cards

  - Add animated number counters for metrics

  - Show activity metrics with SF Symbols icons

  - Display AI resume in inset list style (iOS Settings)

  - Add quick action buttons with spring animations

  - Implement pull-to-refresh gesture (iOS style)

  - Add haptic feedback simulation on interactions

  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 3.3 Implement Properties tab

  - Fetch properties using `trpc.crm.customer.listProperties`

  - Display PropertyCard for each property

  - Show primary property badge

  - Add "Add Property" button

  - _Requirements: 2.2, 2.3_

- [ ] 3.4 Implement Bookings tab

  - Fetch bookings using `trpc.crm.booking.listBookings`

  - Display BookingCard for each booking

  - Show booking status and date

  - Add "Create Booking" button

  - _Requirements: 4.1, 4.3_

- [ ] 3.5 Implement Notes tab

  - Display customer notes in chronological order

  - Add "Add Note" button with textarea

  - Implement note creation

  - Show note author and timestamp

  - _Requirements: 17.1, 17.2_

---

### - [ ] 4. Property Management

Build property CRUD interfaces.

- [ ] 4.1 Create PropertyCard component

  - Display address, city, postal code

  - Show property type icon (villa, lejlighed, kontor, sommerhus)

  - Display "Primary" badge if isPrimary

  - Show access code and parking info

  - Add edit and delete buttons

  - _Requirements: 2.2, 2.3_

- [ ] 4.2 Create PropertyFormModal component

  - Build form with address, city, postal code fields

  - Add PropertyTypeSelect dropdown

  - Add isPrimary checkbox

  - Add attributes fields (size, floors, access code, parking)

  - Add notes textarea

  - Implement create property mutation

  - Implement update property mutation

  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 4.3 Implement property delete confirmation

  - Create DeleteConfirmModal component

  - Show warning message

  - Implement delete property mutation

  - Update property list after deletion

  - _Requirements: 2.1_

- [ ] 4.4 Implement primary property toggle

  - Add radio button to select primary property

  - Ensure only one property is primary per customer

  - Update property using `trpc.crm.customer.updateProperty`

  - _Requirements: 2.4_

---

### - [ ] 5. Lead Management UI

Build lead pipeline and conversion interfaces.

- [ ] 5.1 Create LeadCard component

  - Display lead name, email, phone

  - Show lead status badge

  - Display lead score badge (0-100)

  - Show source and last contacted date

  - Add quick action buttons (Assign, Convert, Edit)

  - _Requirements: 5.1, 5.2, 14.1_

- [ ] 5.2 Create LeadList page

  - Fetch leads using `trpc.crm.lead.listLeads`

  - Display LeadCard for each lead

  - Add status filter tabs (New, Contacted, Qualified, Proposal, Won, Lost)

  - Implement loading and error states

  - _Requirements: 5.2, 15.3_

- [ ] 5.3 Create LeadPipelineBoard component

  - Implement Kanban board with drag-and-drop

  - Create columns for each lead status

  - Use `@dnd-kit/core` for drag-and-drop

  - Update lead status on drop using `trpc.crm.lead.updateLeadStatus`

  - Show lead count per column

  - _Requirements: 5.1, 5.5_

- [ ] 5.4 Create AssignLeadModal component

  - Build form to assign lead to user

  - Add user selection dropdown

  - Add optional notes textarea

  - Implement lead assignment (extend backend if needed)

  - _Requirements: 5.1, 5.2_

- [ ] 5.5 Create LeadConversionModal component

  - Show lead details for confirmation

  - Add "Convert to Customer" button

  - Call `trpc.crm.lead.convertLeadToCustomer`

  - Navigate to new customer profile on success

  - Show success toast notification

  - _Requirements: 5.3, 5.4, 5.5_

---

## Fase 2: Rendetalje Customization (Måned 2)

### - [ ] 6. Service Template Management

Build service template library and configuration.

- [ ] 6.1 Create ServiceTemplateCard component

  - Display template title and description

  - Show category badge

  - Display price in DKK and duration in minutes

  - Add active/inactive toggle

  - Add edit and delete buttons

  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 6.2 Create ServiceTemplates page

  - Fetch service templates (extend backend with router)

  - Display templates grouped by category

  - Add "Create Template" button

  - Implement category filter tabs

  - _Requirements: 3.2, 3.5_

- [ ] 6.3 Create ServiceTemplateFormModal component

  - Build form with title, description, category fields

  - Add ServiceCategorySelect dropdown

  - Add duration (minutes) and price (DKK) inputs

  - Add metadata fields (materials, checklist, photo requirements)

  - Implement create and update mutations

  - _Requirements: 3.1, 3.3_

- [ ] 6.4 Implement template activation toggle

  - Add switch component to ServiceTemplateCard

  - Update isActive field using mutation

  - Filter out inactive templates in booking creation

  - _Requirements: 3.4, 3.5_

---

### - [ ] 7. Booking Management

Build booking creation and calendar interfaces.

- [ ] 7.1 Create BookingCard component

  - Display booking date and time

  - Show customer name and property address

  - Display booking status badge

  - Show assigned field worker

  - Add quick action buttons (Edit, Cancel, Complete)

  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 7.2 Create BookingFormModal component

  - Build wizard-style form (4 steps)

  - Step 1: Select customer (CustomerSelect dropdown)

  - Step 2: Select property (PropertySelect dropdown)

  - Step 3: Select service template (ServiceTemplateSelect)

  - Step 4: Set date/time and notes

  - Pre-fill title and duration from template

  - Implement create booking mutation

  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7.3 Create BookingCalendar page

  - Implement calendar grid view

  - Use `react-big-calendar` or similar library

  - Fetch bookings using `trpc.crm.booking.listBookings`

  - Display bookings on calendar

  - Add "Create Booking" button

  - Implement date range navigation

  - _Requirements: 4.1, 12.1, 15.4_

- [ ] 7.4 Implement booking status updates

  - Add status dropdown to BookingCard

  - Update status using `trpc.crm.booking.updateBookingStatus`

  - Show confirmation for status changes

  - Trigger invoice creation on "completed" status

  - _Requirements: 4.5, 10.1_

- [ ] 7.5 Implement booking assignment

  - Add field worker selection dropdown

  - Update booking with assigneeUserId

  - Send notification to assigned worker (extend backend)

  - _Requirements: 4.4_

---

### - [ ] 8. CRM Dashboard

Build dashboard with KPI widgets and charts.

- [ ] 8.1 Create CRMDashboard page

  - Implement dashboard grid layout (2x3 widgets)

  - Add loading skeleton for widgets

  - Implement responsive layout (1/2/3 columns)

  - _Requirements: 6.1, 15.1_

- [ ] 8.2 Create dashboard KPI widgets

  - TotalCustomersWidget (total, active, vip, at_risk counts)

  - RevenueWidget (total revenue, paid, outstanding balance)

  - BookingsWidget (planned, in-progress, completed counts)

  - LeadConversionWidget (conversion rate)

  - Fetch data using dashboard stats endpoint (extend backend)

  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.3 Implement revenue chart

  - Create RevenueChart component using Recharts

  - Display line chart for last 6 months

  - Fetch revenue data by month (extend backend)

  - Add hover tooltips with details

  - _Requirements: 6.2_

- [ ] 8.4 Implement recent activity feed

  - Create ActivityList component

  - Display recent bookings, conversions, completions

  - Show activity type icons

  - Add "View All" link

  - _Requirements: 6.1, 17.2_

- [ ] 8.5 Add dashboard metric click navigation

  - Make widgets clickable

  - Navigate to filtered views (e.g., VIP customers, at-risk customers)

  - Pass filter params via URL

  - _Requirements: 6.5_

---

### - [ ] 9. Mobile Field Worker Interface

Build mobile-optimized booking interface.

- [ ] 9.1 Create MobileFieldWorker page

  - Implement mobile-first layout

  - Display today's bookings in chronological order

  - Add large touch targets for buttons

  - Implement pull-to-refresh

  - _Requirements: 11.1, 11.2_

- [ ] 9.2 Implement booking detail view

  - Display customer name and contact info

  - Show property address and access codes

  - Display service notes and checklist

  - Add large "Start Booking" button

  - _Requirements: 11.2_

- [ ] 9.3 Implement booking start/complete flow

  - Add "Start" button to update status to "in_progress"

  - Record start time in metadata

  - Add "Complete" button to update status to "completed"

  - Record completion time

  - _Requirements: 11.3, 11.5_

- [ ] 9.4 Implement photo upload

  - Add photo upload button with camera access

  - Allow multiple photos with labels (before, during, after)

  - Store photos in metadata

  - Show photo preview thumbnails

  - _Requirements: 11.4_

- [ ] 9.5 Implement offline support

  - Cache today's bookings using service worker

  - Queue mutations when offline

  - Sync queued changes when online

  - Show offline indicator

  - _Requirements: 20.1, 20.2, 20.3, 20.4_

---

## Fase 3: Integration & Intelligence (Måned 3)

### - [ ] 10. Billy Invoice Integration

Integrate invoice creation and sync with Billy.

- [ ] 10.1 Implement invoice creation trigger

  - Hook into booking completion event

  - Call Billy API to create invoice draft (extend backend)

  - Store Billy invoice ID in customer_invoices table

  - Show success notification

  - _Requirements: 10.1, 10.2_

- [ ] 10.2 Display invoices in customer profile

  - Add Invoices tab to CustomerProfileDrawer

  - Fetch invoices using existing endpoint

  - Display invoice list with status and amounts

  - Add "View in Billy" link

  - _Requirements: 10.3_

- [ ] 10.3 Implement invoice sync

  - Poll Billy API for invoice updates (extend backend)

  - Update invoice status and paid amount

  - Show sync indicator in UI

  - _Requirements: 10.4, 10.5_

---

### - [ ] 11. Email Integration

Link emails to customer profiles automatically.

- [ ] 11.1 Implement email auto-linking

  - Hook into email receive event (extend backend)

  - Match email address to customer profile

  - Create customer_emails association

  - Update customer email count

  - _Requirements: 9.1, 9.5_

- [ ] 11.2 Display emails in customer profile

  - Add Emails tab to CustomerProfileDrawer

  - Fetch customer emails

  - Display email list with subject and date

  - Add "View in Email Center" link

  - _Requirements: 9.2_

- [ ] 11.3 Implement email click navigation

  - Navigate to Email Center panel on email click

  - Open specific email thread

  - Maintain customer profile context

  - _Requirements: 9.3_

- [ ] 11.4 Handle multiple customer matches

  - Show disambiguation modal when email matches multiple customers

  - Allow user to select correct customer

  - Create manual email association

  - _Requirements: 9.4_

---

### - [ ] 12. AI Features (Optional - Feature Flagged)

Add AI-powered insights and suggestions.

- [ ]\* 12.1 Display AI customer resume

  - Show AI-generated customer summary in Overview tab

  - Add "Regenerate" button

  - Show confidence score

  - _Requirements: 1.4, 14.3_

- [ ]\* 12.2 Display AI lead score

  - Show lead score badge on LeadCard

  - Add tooltip explaining score factors

  - Update score on lead data changes

  - _Requirements: 14.1_

- [ ]\* 12.3 Implement AI suggested actions

  - Display suggested next actions in lead detail view

  - Show action buttons (Call, Email, Schedule Meeting)

  - Track action completion

  - _Requirements: 14.2_

- [ ]\* 12.4 Implement actionable insights dashboard

  - Create InsightsWidget for dashboard

  - Display prioritized opportunities (missing bookings, at-risk, upsell)

  - Add "View Details" links

  - _Requirements: 14.5_

---

### - [ ] 13. Capacity Planning

Build scheduling and capacity views.

- [ ] 13.1 Implement capacity calendar view

  - Add "Capacity" view toggle to BookingCalendar

  - Group bookings by assigned field worker

  - Display worker names as columns

  - Show total hours per worker

  - _Requirements: 12.1, 12.4_

- [ ] 13.2 Implement scheduling conflict detection

  - Check for overlapping bookings on create/update

  - Show warning modal if conflict detected

  - Highlight conflicting bookings in red

  - _Requirements: 12.2, 12.3_

- [ ] 13.3 Implement capacity warnings

  - Calculate capacity percentage per worker

  - Show warning when exceeding 80% capacity

  - Suggest alternative dates/workers

  - _Requirements: 12.5_

---

### - [ ] 14. Customer Status Automation

Implement automatic status updates based on activity.

- [ ] 14.1 Implement status automation rules (backend)

  - Create background job to check customer activity

  - Update status to "at_risk" if no bookings for 90 days

  - Update status to "vip" if total invoiced > 50000 DKK

  - Update status to "active" if 3+ completed bookings

  - Update status to "inactive" if no activity for 180 days

  - _Requirements: 13.1, 13.2, 13.4, 13.5_

- [ ] 14.2 Display status change notifications

  - Show toast notification when status changes

  - Add status change to activity timeline

  - Allow manual status override

  - _Requirements: 13.1, 13.3_

---

## Fase 4: Optimization & Launch (Måned 4)

### - [ ] 15. Performance Optimization

Optimize loading times and user experience.

- [ ] 15.1 Implement code splitting

  - Lazy load CRM pages

  - Dynamic import for heavy components

  - Add loading suspense boundaries

  - _Requirements: All_

- [ ] 15.2 Implement virtual scrolling

  - Add virtual scrolling to customer list (>100 items)

  - Add virtual scrolling to booking list

  - Use `react-window` library

  - _Requirements: 7.5_

- [ ] 15.3 Implement optimistic updates

  - Update UI immediately on mutations

  - Rollback on error

  - Show loading indicators

  - _Requirements: 1.5, 4.5_

- [ ] 15.4 Add caching strategy

  - Configure TanStack Query stale time (5 minutes)

  - Implement cache invalidation on mutations

  - Add prefetching for common routes

  - _Requirements: All_

---

### - [ ] 16. Data Export and Reporting

Build export functionality for customers and bookings.

- [ ] 16.1 Implement customer export

  - Add "Export" button to CustomerList

  - Generate CSV with all customer fields

  - Include calculated metrics (revenue, balance)

  - Apply current filters to export

  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 16.2 Implement booking export

  - Add "Export" button to BookingCalendar

  - Generate CSV with booking details

  - Include customer and property info

  - Apply date range filter to export

  - _Requirements: 16.1, 16.3_

- [ ] 16.3 Implement background export for large datasets

  - Show progress indicator for exports >1000 records

  - Process export in background (extend backend)

  - Notify user when export is ready

  - _Requirements: 16.5_

- [ ] 16.4 Add timestamp to export filenames

  - Format: `customers_export_2025-11-11_14-30.csv`

  - Auto-download file

  - _Requirements: 16.4_

---

### - [ ] 17. Seasonal Business Logic

Implement Rendetalje-specific seasonal features.

- [ ] 17.1 Display seasonal indicators

  - Show "Flytterengøring Peak Season" banner (May-September)

  - Add seasonal icon to dashboard

  - _Requirements: 19.1_

- [ ] 17.2 Implement capacity warnings for peak season

  - Highlight weeks exceeding 80% capacity

  - Show warning when creating bookings in peak season

  - _Requirements: 19.2, 19.3_

- [ ] 17.3 Implement seasonal trends chart

  - Add seasonal trends chart to dashboard

  - Display historical booking patterns

  - Show year-over-year comparison

  - _Requirements: 19.5_

- [ ] 17.4 Send capacity alerts

  - Notify admin users when capacity increases

  - Send email alerts for peak season planning

  - _Requirements: 19.4_

---

### - [ ] 18. Testing and Quality Assurance

Comprehensive testing before production launch.

- [ ]\* 18.1 Write unit tests for components

  - Test CustomerCard, BookingCard, LeadCard

  - Test form validation logic

  - Test utility functions

  - _Requirements: All_

- [ ]\* 18.2 Write integration tests

  - Test customer CRUD flow

  - Test booking creation flow

  - Test lead conversion flow

  - _Requirements: 1, 4, 5_

- [ ]\* 18.3 Write E2E tests

  - Test complete booking workflow

  - Test customer profile navigation

  - Test dashboard interactions

  - _Requirements: All_

- [ ]\* 18.4 Perform accessibility audit

  - Test keyboard navigation

  - Test screen reader compatibility

  - Verify color contrast ratios

  - Add ARIA labels where needed

  - _Requirements: All_

- [ ]\* 18.5 Perform performance testing

  - Test with 1000+ customers

  - Test with 500+ bookings

  - Measure page load times

  - Optimize slow queries

  - _Requirements: All_

---

### - [ ] 19. Documentation and Training

Prepare documentation and training materials.

- [ ]\* 19.1 Write user documentation

  - Create user guide for CRM features

  - Document common workflows

  - Add screenshots and examples

  - _Requirements: All_

- [ ]\* 19.2 Create video tutorials

  - Record tutorial for customer management

  - Record tutorial for booking creation

  - Record tutorial for mobile field worker interface

  - _Requirements: 1, 4, 11_

- [ ]\* 19.3 Conduct user training sessions

  - Train Rendetalje employees on CRM features

  - Gather feedback and questions

  - Document common issues

  - _Requirements: All_

---

### - [ ] 20. Production Launch

Deploy CRM module to production.

- [ ] 20.1 Deploy to staging environment

  - Test all features in staging

  - Verify integrations (Billy, Google Calendar)

  - Perform smoke tests

  - _Requirements: All_

- [ ] 20.2 Setup monitoring and alerts

  - Configure error tracking (Sentry)

  - Setup performance monitoring

  - Add custom metrics for CRM features

  - _Requirements: All_

- [ ] 20.3 Deploy to production

  - Deploy CRM module with feature flag

  - Enable for beta users first

  - Monitor error rates and performance

  - _Requirements: All_

- [ ] 20.4 Gradual rollout

  - Enable CRM for all users

  - Monitor adoption metrics

  - Gather user feedback

  - _Requirements: All_

---

## Summary

**Total Tasks**: 20 main tasks, 100+ sub-tasks
**Estimated Timeline**: 4 months (16 weeks)
**Focus**: Frontend UI implementation connecting to existing backend APIs

**Key Milestones**:

- **Month 1**: Manual CRM foundation (Customer, Lead, Property management)

- **Month 2**: Rendetalje customization (Service templates, Bookings, Dashboard)

- **Month 3**: Integration & Intelligence (Billy, Email, AI features)

- **Month 4**: Optimization & Launch (Performance, Testing, Production)

**Note**: Tasks marked with `*` are optional (testing, documentation) and can be adjusted based on priorities.
