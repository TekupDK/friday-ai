# 📋 V4.3 Lead Data Pipeline - Changelog

All notable changes to the V4.3 lead data pipeline.

---

## [4.3.5] - 2025-11-10 🤖 AI-Enhanced Edition

### ✨ Added

- **AI-Enhanced Calendar Parsing**
  - OpenRouter GLM-4.5-Air integration (FREE tier)
  - Intelligent extraction of customer, service, and quality data
  - Hybrid parser with regex fallback
  - 100% parsing success rate (218/218 events)

- **AI Frequency Validation**
  - AI validates calculated recurring frequency
  - Auto-correction for edge cases
  - Discrepancy detection and logging

- **Missing Bookings Detection**
  - AI identifies booking numbers (#1, #2, #7, etc.)
  - Flags customers where we're missing historical bookings
  - 8+ customers flagged with missing data

- **Quality Signals**
  - Customer type classification (standard/premium/problematic)
  - Complaint detection (4 customers identified)
  - Special needs identification (20 customers)
  - Confidence scoring (high/medium/low)

- **Special Requirements Extraction**
  - Auto-extracted from event descriptions
  - Unique array per customer
  - Examples: sæbespåner, egen nøgle, afkalkning

- **Enhanced Customer Metrics**
  - `customerType` field
  - `hasComplaints` boolean
  - `hasSpecialNeeds` boolean
  - `specialRequirements` array

### 🔧 Changed

- Recurring detection now uses AI booking numbers
- Single-booking customers can be tagged as recurring
- Frequency classification improved with AI validation
- Customer metrics now include AI quality signals

### 📊 Improved

- **Recurring Detection:** +26% improvement (19 → 24 customers)
- **Weekly:** 3 → 4 customers
- **Biweekly:** 6 → 7 customers
- **Triweekly:** 7 → 9 customers
- **Monthly:** 1 → 3 customers

### 📁 Files Added

- `scripts/ai-calendar-parser.ts` - OpenRouter AI parser
- `scripts/calendar-parser-v4_3_5.ts` - Hybrid parser
- `scripts/test-ai-parser.ts` - AI parser tests
- `docs/V4.3.5-README.md` - Complete documentation
- `docs/CHANGELOG.md` - This file

### 📁 Files Modified

- `scripts/1-collect-and-link-v4_3_3.ts` - Added AI parsing integration
- `scripts/3-add-recurring-tags.ts` - AI frequency validation
- `v4_3-types.ts` - Added AI quality signal types

---

## [4.3.4] - 2025-11-10 🔄 Recurring Detection

### ✨ Added

- **Recurring Customer Detection**
  - Groups leads by calendar customer name
  - Calculates frequency patterns (weekly/biweekly/triweekly/monthly/irregular)
  - Tags leads with `isRecurring` and `recurringFrequency`
  - Identifies 19 recurring customers

- **Active Lead Tagging**
  - Marks leads from Oct-Nov 2025 as `isActive`
  - 122 active leads identified (52.8%)

- **Name Normalization**
  - Removes status tags from calendar summaries
  - Handles: ✅ UDFØRT, aflyst, (REBOOKING), (FÆRDIGGØRELSE), etc.
  - Improves customer matching accuracy

### 🔧 Changed

- Customer value metrics now reflect calendar bookings
- `totalBookings` counts actual calendar events
- Recurring detection uses normalized customer names

### 📁 Files Added

- `scripts/3-add-recurring-tags.ts` - Recurring detection script

### 📁 Files Modified

- `v4_3-types.ts` - Added recurring fields to `CustomerValueMetrics`
- `v4_3-config.ts` - Added `ACTIVE_PERIOD` constant

---

## [4.3.3] - 2025-11-09 🎯 Advanced Matching

### ✨ Added

- **Advanced Matching Algorithms**
  - Fuzzy address matching (Billy ↔ Calendar)
  - Extended date proximity window (±14 days)
  - Amount matching (Calendar price ≈ Billy grossAmount)
  - Fuzzy customer name matching
  - Service type keyword extraction

- **Phone Number Extraction**
  - Extract from Gmail body snippet
  - Improves matching accuracy
  - 208 leads with phone (38.7%)

- **Enhanced Data Linking**
  - Lowered matching thresholds for better coverage
  - Calendar matching: 18% → 33.5%
  - Billy matching: Improved with fuzzy logic

- **Detailed Logging**
  - Data quality metrics
  - Coverage statistics
  - Matching success rates

### 🔧 Changed

- Time window expanded: July 1 - November 30, 2025
- Gmail matching threshold lowered
- Billy matching threshold lowered

### 📊 Improved

- Calendar coverage: 18% → 33.5%
- Data completeness: 52% → 68%
- Phone extraction: 38.7% of leads

### 📁 Files Added

- `scripts/1-collect-and-link-v4_3_3.ts` - Advanced matching
- `scripts/2-calculate-metrics-v4_3_3.ts` - Metrics calculation

---

## [4.3.2] - 2025-11-08 📅 RenOS Calendar Format

### ✨ Added

- **RenOS Calendar Format Support**
  - Parse structured event descriptions
  - Extract customer email, phone, service type, price
  - Handle emoji markers (🏠/🏢)
  - Target specific calendar ID

- **Calendar Data Enhancement**
  - Duration calculation in minutes
  - Customer info from descriptions
  - Service type extraction
  - Price parsing from descriptions

### 🔧 Changed

- Calendar collection targets RenOS Automatisk Booking
- Spam filtering for test events
- Event duration calculated properly

---

## [4.3.1] - 2025-11-07 🔍 Targeted Search

### ✨ Added

- **Targeted Gmail Search**
  - Filter by known lead sources (Leadpoint, Leadmail, Adhelp)
  - Date-range filtering
  - Label-based exclusions (spam, trash)

- **Lead Source Classification**
  - Automatic source detection from email domain
  - Rengøring.nu (Leadmail.no)
  - Leadpoint.dk (Rengøring Aarhus)

### 🔧 Changed

- Gmail query optimized for lead sources
- Reduced noise from non-lead emails

---

## [4.3.0] - 2025-11-06 🚀 Foundation

### ✨ Added

- **Multi-Source Data Collection**
  - Gmail threads integration
  - Google Calendar events
  - Billy invoices

- **Basic Data Linking**
  - Email-based matching
  - Simple date proximity
  - Initial customer metrics

- **ChromaDB Integration**
  - Vector embeddings
  - Semantic search
  - Document storage

### 📁 Files Added

- `scripts/4-upload-to-chromadb.ts` - ChromaDB upload
- `v4_3-config.ts` - Configuration
- `v4_3-types.ts` - TypeScript types

---

## Versioning

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR (4):** V4 pipeline architecture
- **MINOR (3):** Feature iteration
- **PATCH (0-5):** Bug fixes and enhancements

---

## Legend

- ✨ **Added:** New features
- 🔧 **Changed:** Changes in existing functionality
- 📊 **Improved:** Performance or quality improvements
- 🐛 **Fixed:** Bug fixes
- 📁 **Files:** File changes
- 🚀 **Major:** Major version changes
- 🤖 **AI:** AI-related changes

---

**Last Updated:** November 10, 2025
