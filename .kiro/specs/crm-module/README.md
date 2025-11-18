# CRM Module Specification - FINAL

**Version**: 1.0.0
**Status**: ✅ **APPROVED - READY FOR IMPLEMENTATION**
**Date**: November 11, 2025
**Project**: Friday AI CRM Module for Rendetalje

---

## 📋 Executive Summary

This specification defines a comprehensive **Apple-inspired CRM module** integrated within the Friday AI platform, specifically tailored for Rendetalje's cleaning business operations. The module extends the existing lead intelligence system to provide full customer lifecycle management, from lead capture through service delivery and invoicing.

### Key Highlights

- **100% Custom UI**: Apple-inspired design with frosted glass effects, spring animations, and SF Symbols-style icons
- **Cross-Platform**: Works seamlessly on iOS, Android, Windows, macOS, and Linux
- **Backend Ready**: All backend routers and database schema already implemented
- **Type-Safe**: Full TypeScript coverage with TRPC end-to-end
- **Accessible**: WCAG 2.1 AA compliant with reduced motion support
- **Performance**: Adaptive rendering, browser fallbacks, 60 FPS animations
- **Timeline**: 4-month implementation (16 weeks)

---

## 📚 Specification Documents

### 1. [requirements.md](./requirements.md)

**20 User Stories with EARS-Compliant Acceptance Criteria**

Covers all CRM functionality:

- Customer Profile Management
- Property (Ejendom) Management
- Service Template Configuration
- Booking Management
- Lead Assignment and Conversion
- CRM Dashboard and Analytics
- Customer Search and Filtering
- Task Management Integration
- Email Integration
- Invoice Integration (Billy)
- Mobile Field Worker Interface
- Capacity Planning and Scheduling
- Customer Status Automation
- AI-Powered Lead Intelligence
- CRM Navigation and Routing
- Data Export and Reporting
- Customer Notes and Activity Timeline
- Permission and Access Control
- Seasonal Business Logic (Rendetalje-specific)
- Offline Support for Mobile Workers

**Status**: ✅ Complete

---

### 2. [design.md](./design.md)

**Comprehensive Design Document with Apple-Inspired System**

Includes:

- **Architecture**: System diagrams, tech stack, component structure
- **Apple Design System**: Typography, colors, spacing, shadows, materials
- **Animation System**: Spring physics, easings, durations
- **Component Patterns**: Buttons, cards, inputs, modals, drawers
- **Cross-Platform Support**: iOS, Android, Windows, macOS, Linux optimizations
- **Browser Compatibility**: Fallbacks, feature detection, progressive enhancement
- **Performance**: Tier detection, adaptive rendering, performance budget
- **Accessibility**: Reduced motion, WCAG 2.1 AA compliance
- **Storybook Setup**: Component documentation and testing
- **Integration Points**: Billy, Google Calendar, Email, ChromaDB
- **UI Component Library**: 100+ components specified
- **Backend Status**: All routers already implemented

**Status**: ✅ Complete

---

### 3. [tasks.md](./tasks.md)

**110+ Implementation Tasks Across 5 Phases**

#### Fase 0: Apple Design System Foundation (Uge 0)

- 14 tasks for building Apple UI primitives
- AppleButton, AppleCard, AppleInput, AppleModal, AppleDrawer
- BlurView, VibrancyView, ParallaxView
- Storybook setup and component documentation
- Browser compatibility testing
- Reduced motion support

#### Fase 1: Manual CRM Foundation (Måned 1)

- Infrastructure setup
- Customer Management UI (Apple style)
- Customer Profile Drawer (840px, frosted glass)
- Property Management
- Lead Management UI with Kanban board

#### Fase 2: Rendetalje Customization (Måned 2)

- Service Template Management
- Booking Management with Calendar
- CRM Dashboard with KPI widgets
- Mobile Field Worker Interface

#### Fase 3: Integration & Intelligence (Måned 3)

- Billy Invoice Integration
- Email Integration
- AI Features (optional, feature-flagged)
- Capacity Planning
- Customer Status Automation

#### Fase 4: Optimization & Launch (Måned 4)

- Performance Optimization
- Data Export and Reporting
- Seasonal Business Logic
- Testing & QA (unit, integration, E2E)
- Production Launch

**Status**: ✅ Complete

---

## 🎨 Design Philosophy

### Apple Human Interface Guidelines (HIG)

The CRM module follows Apple's three core design principles:

1. **Clarity**: Text is legible, icons are precise, functionality is intuitive
1. **Deference**: UI helps understanding without competing for attention
1. **Depth**: Visual layers and realistic motion provide hierarchy and vitality

### Key Design Features

- **Frosted Glass Effects**: Backdrop-filter with fallbacks for older browsers
- **Spring Animations**: iOS/macOS-style spring physics (Framer Motion)
- **SF Symbols Style**: Lucide icons configured with Apple aesthetics
- **8pt Grid System**: Consistent spacing throughout
- **San Francisco Typography**: System font stack with Apple-inspired scale
- **Apple System Colors**: Full color palette with dark mode support
- **Smooth Scrolling**: Lenis for buttery-smooth scroll experience
- **Gesture Support**: Swipe-to-close, pull-to-refresh, drag-and-drop

---

## 🏗️ Technical Architecture

### Frontend Stack

````typescript
{
  "core": {
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "styling": {
    "tailwindcss": "^3.4.0",
    "css-modules": "CSS Modules for components"
  },
  "animation": {
    "framer-motion": "^11.0.0",
    "gsap": "^3.12.0",
    "lenis": "^1.0.0"
  },
  "ui": {
    "lucide-react": "^0.400.0",
    "@use-gesture/react": "^10.3.0"
  },
  "data": {
    "@tanstack/react-query": "TanStack Query",
    "@trpc/client": "TRPC client",
    "react-hook-form": "Forms",
    "zod": "Validation"
  },
  "dev": {
    "storybook": "^8.0.0",
    "@storybook/addon-a11y": "Accessibility testing"
  }
}

```text

### Backend Stack (Already Implemented ✅)

```typescript
{
  "routers": [
    "crm-customer-router.ts",  // Customer profiles & properties CRUD
    "crm-lead-router.ts",      // Lead management & conversion
    "crm-booking-router.ts"    // Booking management
  ],
  "database": "PostgreSQL (Supabase) + Drizzle ORM",
  "api": "TRPC (type-safe)",
  "validation": "Zod schemas"
}

```text

### Available Backend Endpoints

**Customer Router** (`crm.customer.*`):

- `listProfiles({ search?, limit?, offset? })`
- `getProfile({ id })`
- `listProperties({ customerProfileId })`
- `createProperty({ customerProfileId, address, ... })`
- `updateProperty({ id, address?, ... })`
- `deleteProperty({ id })`

**Lead Router** (`crm.lead.*`):

- `listLeads({ status?, limit?, offset? })`
- `getLead({ id })`
- `updateLeadStatus({ id, status })`
- `convertLeadToCustomer({ id })`

**Booking Router** (`crm.booking.*`):

- `listBookings({ customerProfileId?, start?, end?, limit?, offset? })`
- `createBooking({ customerProfileId, scheduledStart, ... })`
- `updateBookingStatus({ id, status })`
- `deleteBooking({ id })`

---

## 🌍 Cross-Platform Support

### Supported Platforms

| Platform    | Browser         | Support Level | Notes                                              |
| ----------- | --------------- | ------------- | -------------------------------------------------- |
| **iOS**     | Safari 9+       | ✅ Premium    | Full frosted glass, safe areas, momentum scrolling |
| **Android** | Chrome 76+      | ✅ Excellent  | Material ripple effects, larger touch targets      |
| **Windows** | Chrome/Edge 76+ | ✅ Excellent  | Custom scrollbars, Ctrl shortcuts, focus outlines  |
| **macOS**   | Safari 9+       | ✅ Premium    | Cmd shortcuts, overlay scrollbars, native feel     |
| **Linux**   | Firefox 103+    | ✅ Excellent  | All features working, proper scrollbars            |

### Adaptive Features

- **Touch Targets**: 44px on mobile, 36px on desktop
- **Animations**: Platform-specific spring configurations
- **Keyboard Shortcuts**: Cmd on Mac, Ctrl on Windows/Linux
- **Scrollbars**: Platform-native styling
- **Input Method**: Automatic touch vs mouse detection
- **Performance**: Adaptive rendering based on device capabilities

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
- ✅ **Screen Reader Support**: Proper ARIA labels and roles
- ✅ **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- ✅ **Focus Indicators**: Visible focus states (2px blue outline)
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion: reduce`
- ✅ **Touch Targets**: Minimum 44px for mobile (iOS standard)
- ✅ **Error Messages**: Clear, descriptive error messages
- ✅ **Form Labels**: All inputs have associated labels

### Reduced Motion Support

```typescript
// Automatic detection and adaptation
const prefersReducedMotion = useReducedMotion();

// Animations disabled or simplified for users who prefer reduced motion
// All spring animations fallback to instant transitions

```text

---

## 🚀 Performance

### Performance Budget

- **Bundle Size**: Max 200KB for UI components
- **Initial Load**: Max 500KB for initial page load
- **FCP**: Max 1.8s (First Contentful Paint)
- **LCP**: Max 2.5s (Largest Contentful Paint)
- **TTI**: Max 3.8s (Time to Interactive)
- **CLS**: Max 0.1 (Cumulative Layout Shift)
- **FPS**: Min 60 frames per second

### Optimizations

- **Code Splitting**: Lazy load CRM pages and heavy components
- **Virtual Scrolling**: For lists with 100+ items
- **Adaptive Rendering**: Disable heavy effects on low-end devices
- **Performance Tier Detection**: High/medium/low device classification
- **Caching**: TanStack Query (5 min stale time)
- **Image Lazy Loading**: Only load images when visible
- **Frosted Glass Fallbacks**: Solid backgrounds on unsupported browsers

---

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests**: Component logic, utilities, hooks
- **Integration Tests**: API integration, form submissions, workflows
- **E2E Tests**: Complete user journeys (Playwright)
- **Accessibility Tests**: Automated a11y checks in Storybook
- **Performance Tests**: Load testing, FPS monitoring
- **Cross-Browser Tests**: Chrome, Firefox, Safari, Edge

### Testing Tools

- **Vitest**: Unit and integration tests
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Storybook**: Component documentation and visual testing
- **@storybook/addon-a11y**: Accessibility testing

---

## 📅 Implementation Timeline

### 4-Month Roadmap (16 Weeks)

**Måned 1 (Uge 0-4)**: Foundation

- Uge 0: Apple Design System Foundation (14 tasks)
- Uge 1-2: Infrastructure, Customer Management
- Uge 3-4: Customer Profile Drawer, Property Management, Lead Management

**Måned 2 (Uge 5-8)**: Rendetalje Customization

- Uge 5-6: Service Templates, Booking Management
- Uge 7-8: CRM Dashboard, Mobile Field Worker Interface

**Måned 3 (Uge 9-12)**: Integration & Intelligence

- Uge 9-10: Billy Integration, Email Integration
- Uge 11-12: AI Features (opt-in), Capacity Planning

**Måned 4 (Uge 13-16)**: Optimization & Launch

- Uge 13-14: Performance Optimization, Testing
- Uge 15-16: Production Launch, Monitoring

---

## 🎯 Success Metrics

### Technical Metrics

- ✅ 100% TypeScript coverage
- ✅ WCAG 2.1 AA compliance
- ✅ <500ms API response times
- ✅ 60 FPS animations
- ✅ 99.9% uptime

### Business Metrics

- ✅ 80% daily user adoption
- ✅ 50% reduction in manual data entry
- ✅ 25% improvement in customer retention
- ✅ 30% increase in team productivity

### User Experience Metrics

- ✅ Consistent design across all platforms
- ✅ Intuitive workflows for CRM tasks
- ✅ Mobile-responsive on all devices
- ✅ Fast performance even with large datasets

---

## 🔐 Security

- **Authentication**: JWT-protected TRPC endpoints
- **Authorization**: Role-based access control (Admin vs User)
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **XSS Prevention**: DOMPurify for user-generated content
- **CSRF Protection**: SameSite cookies
- **Audit Logging**: All CRM mutations logged

---

## 📦 Deliverables

### Phase 0: Apple Design System

- [ ] 10 Apple UI primitive components
- [ ] Design system tokens (colors, typography, spacing)
- [ ] Animation utilities (springs, easings)
- [ ] Storybook setup with stories
- [ ] Browser compatibility utilities

### Phase 1: Manual CRM Foundation

- [ ] Customer Management UI
- [ ] Customer Profile Drawer
- [ ] Property Management
- [ ] Lead Management with Kanban

### Phase 2: Rendetalje Customization

- [ ] Service Template Management
- [ ] Booking Management
- [ ] CRM Dashboard
- [ ] Mobile Field Worker Interface

### Phase 3: Integration & Intelligence

- [ ] Billy Invoice Integration
- [ ] Email Integration
- [ ] AI Features (optional)
- [ ] Capacity Planning

### Phase 4: Optimization & Launch

- [ ] Performance Optimization
- [ ] Comprehensive Testing
- [ ] Production Deployment
- [ ] User Training & Documentation

---

## 👥 Team & Roles

**Frontend Development**: Apple UI components, CRM pages, animations
**Backend Development**: Already complete ✅
**Design**: Storybook stories, component documentation
**QA**: Testing, accessibility audits, cross-browser testing
**DevOps**: Deployment, monitoring, performance tracking

---

## 📞 Next Steps

### Immediate Actions

1. ✅ **Spec Approved** - This document
1. 🚀 **Start Fase 0** - Apple Design System Foundation
1. 📚 **Setup Storybook** - Component documentation
1. 🎨 **Build First Components** - AppleButton, AppleCard
1. 🧪 **Test Cross-Platform** - iOS, Android, Windows, Mac, Linux

### Getting Started

```bash
# Install dependencies
npm install framer-motion gsap lenis @use-gesture/react

# Setup Storybook
npx storybook@latest init

# Start development
npm run dev

# Start Storybook
npm run storybook

````

---

## 📄 Document History

| Version | Date       | Changes                        | Author  |
| ------- | ---------- | ------------------------------ | ------- |
| 1.0.0   | 2025-11-11 | Initial specification approved | Kiro AI |

---

## ✅ Approval

**Specification Status**: ✅ **APPROVED FOR IMPLEMENTATION**

**Approved By**: User
**Date**: November 11, 2025

**Ready for**: Fase 0 - Apple Design System Foundation

---

**This specification is complete, comprehensive, and ready for implementation. All requirements, design decisions, and implementation tasks are clearly defined. The backend is already implemented, allowing full focus on building the premium Apple-inspired frontend experience.**

🚀 **Let's build something amazing!**
