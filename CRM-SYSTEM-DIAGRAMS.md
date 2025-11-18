# CRM System - Komplet Visualisering

## 1. System Arkitektur (High-Level)

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend<br/>Vite + TypeScript]
        AppleUI[Apple UI System<br/>15 Components]
    end

    subgraph "API Layer"
        tRPC[tRPC Router<br/>Type-Safe API]
        Router1[crm.customer<br/>22 endpoints]
        Router2[crm.lead<br/>4 endpoints]
        Router3[crm.booking<br/>6 endpoints]
        Router4[crm.serviceTemplate<br/>5 endpoints]
        Router5[crm.stats<br/>1 endpoint]
        Router6[crm.activity<br/>5 endpoints]
        Router7[crm.extensions<br/>20 endpoints]
    end

    subgraph "Business Logic Layer"
        CustomerDB[customer-db.ts]
        LeadDB[lead-db.ts]
        HealthScore[Health Scoring Engine]
        SegmentEngine[Segmentation Engine]
        AuditLogger[GDPR Audit Logger]
    end

    subgraph "Data Access Layer"
        Drizzle[Drizzle ORM]
        Cache[Query Cache<br/>5min TTL]
    end

    subgraph "Database Layer"
        PostgreSQL[(PostgreSQL<br/>15 Tables<br/>30+ Indexes)]
    end

    subgraph "External Integrations"
        Billy[Billy API<br/>Invoices]
        Google[Google Calendar<br/>Events]
        Supabase[Supabase Storage<br/>Files]
        ChromaDB[ChromaDB<br/>AI Embeddings]
        Email[Email System<br/>IMAP/SMTP]
    end

    UI --> tRPC
    AppleUI --> UI
    tRPC --> Router1
    tRPC --> Router2
    tRPC --> Router3
    tRPC --> Router4
    tRPC --> Router5
    tRPC --> Router6
    tRPC --> Router7

    Router1 --> CustomerDB
    Router2 --> LeadDB
    Router3 --> CustomerDB
    Router4 --> CustomerDB
    Router5 --> CustomerDB
    Router6 --> CustomerDB
    Router7 --> CustomerDB

    CustomerDB --> HealthScore
    CustomerDB --> SegmentEngine
    CustomerDB --> AuditLogger

    CustomerDB --> Drizzle
    LeadDB --> Drizzle
    HealthScore --> Drizzle
    SegmentEngine --> Drizzle
    AuditLogger --> Drizzle

    Drizzle --> Cache
    Cache --> PostgreSQL

    CustomerDB --> Billy
    CustomerDB --> Google
    CustomerDB --> Supabase
    CustomerDB --> ChromaDB
    CustomerDB --> Email
```

## 2. Database Schema & Relationships

```mermaid
erDiagram
    customer_profiles ||--o{ customer_properties : has
    customer_profiles ||--o{ customer_notes : has
    customer_profiles ||--o{ customer_activities : has
    customer_profiles ||--o{ customer_health_scores : has
    customer_profiles ||--o{ customer_emails : has
    customer_profiles ||--o{ customer_invoices : has
    customer_profiles ||--o{ bookings : schedules
    customer_profiles ||--o{ opportunities : has
    customer_profiles ||--o{ customer_segment_members : belongs_to
    customer_profiles ||--o{ customer_documents : owns
    customer_profiles ||--o{ customer_relationships : participates_in
    customer_profiles ||--o{ subscriptions : subscribes_to

    leads ||--o| customer_profiles : converts_to
    leads ||--o{ opportunities : generates

    customer_segments ||--o{ customer_segment_members : contains

    service_templates ||--o{ bookings : used_in

    subscriptions ||--o{ subscription_usage : tracks
    subscriptions ||--o{ subscription_history : logs

    customer_profiles {
        uuid id PK
        uuid userId FK
        string name
        string email
        string phone
        enum status
        jsonb tags
        text aiResume
        timestamp createdAt
        timestamp updatedAt
    }

    customer_properties {
        uuid id PK
        uuid customerId FK
        string propertyName
        string address
        float latitude
        float longitude
        jsonb metadata
    }

    customer_notes {
        uuid id PK
        uuid customerId FK
        uuid userId FK
        text content
        timestamp createdAt
        timestamp updatedAt
    }

    customer_activities {
        uuid id PK
        uuid customerId FK
        uuid userId FK
        enum activityType
        text description
        jsonb metadata
        timestamp activityDate
    }

    customer_health_scores {
        uuid id PK
        uuid customerId FK
        int score
        enum riskLevel
        jsonb factors
        timestamp calculatedAt
    }

    leads {
        uuid id PK
        uuid userId FK
        string name
        string email
        string phone
        enum status
        text source
        float aiScore
        uuid convertedToCustomerId FK
        timestamp createdAt
    }

    opportunities {
        uuid id PK
        uuid customerId FK
        uuid userId FK
        string title
        decimal value
        enum stage
        int probability
        date expectedCloseDate
        date actualCloseDate
        jsonb metadata
    }

    customer_segments {
        uuid id PK
        uuid userId FK
        string name
        enum type
        jsonb rules
        string color
    }

    customer_segment_members {
        uuid segmentId FK
        uuid customerId FK
        timestamp addedAt
    }

    bookings {
        uuid id PK
        uuid customerId FK
        uuid serviceTemplateId FK
        uuid userId FK
        enum status
        timestamp scheduledStart
        timestamp scheduledEnd
        timestamp actualStart
        timestamp actualEnd
        text notes
    }

    service_templates {
        uuid id PK
        uuid userId FK
        string name
        text description
        int durationMinutes
        decimal price
        boolean active
    }

    customer_documents {
        uuid id PK
        uuid customerId FK
        uuid userId FK
        string fileName
        string fileUrl
        enum category
        jsonb tags
        int version
        timestamp uploadedAt
    }

    customer_invoices {
        uuid id PK
        uuid customerId FK
        string billyInvoiceId
        decimal amount
        string currency
        enum status
        date dueDate
        timestamp createdAt
    }

    customer_emails {
        uuid id PK
        uuid customerId FK
        string emailId
        string subject
        timestamp sentAt
        text snippet
    }

    customer_relationships {
        uuid id PK
        uuid fromCustomerId FK
        uuid toCustomerId FK
        string relationshipType
        jsonb metadata
    }

    subscriptions {
        uuid id PK
        uuid customerId FK
        string planName
        decimal monthlyPrice
        enum status
        date startDate
        date endDate
        jsonb metadata
    }

    subscription_usage {
        uuid id PK
        uuid subscriptionId FK
        string metric
        int value
        timestamp recordedAt
    }

    subscription_history {
        uuid id PK
        uuid subscriptionId FK
        string action
        jsonb oldValues
        jsonb newValues
        timestamp changedAt
    }

    audit_log {
        uuid id PK
        uuid userId FK
        string entityType
        uuid entityId
        string action
        jsonb oldValues
        jsonb newValues
        string ipAddress
        string userAgent
        timestamp createdAt
    }
```

## 3. API Router Structure

```mermaid
graph LR
    subgraph "tRPC API Endpoints"
        subgraph "crm.customer (22)"
            C1[createProfile]
            C2[listProfiles]
            C3[getProfile]
            C4[updateProfile]
            C5[deleteProfile]
            C6[searchProfiles]
            C7[listProperties]
            C8[createProperty]
            C9[updateProperty]
            C10[deleteProperty]
            C11[addNote]
            C12[listNotes]
            C13[updateNote]
            C14[deleteNote]
            C15[getEmailHistory]
            C16[linkEmailToCustomer]
            C17[getHealthScore]
            C18[recalculateHealthScore]
            C19[getInvoices]
            C20[syncBillyInvoices]
            C21[exportToCSV]
            C22[bulkUpdate]
        end

        subgraph "crm.lead (5)"
            L1[createLead]
            L2[listLeads]
            L3[getLead]
            L4[updateLeadStatus]
            L5[convertLeadToCustomer]
        end

        subgraph "crm.booking (6)"
            B1[createBooking]
            B2[listBookings]
            B3[getBooking]
            B4[updateBooking]
            B5[deleteBooking]
            B6[getUpcomingBookings]
        end

        subgraph "crm.serviceTemplate (5)"
            ST1[createTemplate]
            ST2[listTemplates]
            ST3[getTemplate]
            ST4[updateTemplate]
            ST5[deleteTemplate]
        end

        subgraph "crm.stats (1)"
            S1[getDashboardStats]
        end

        subgraph "crm.activity (5)"
            A1[logActivity]
            A2[listActivities]
            A3[getActivityStats]
            A4[updateActivity]
            A5[deleteActivity]
        end

        subgraph "crm.extensions (20)"
            E1[Opportunities: create/list/get/update/delete/updateStage]
            E2[Segments: create/list/get/update/delete]
            E3[Documents: upload/list/delete]
            E4[AuditLog: getAuditLog/exportAuditLog]
            E5[Relationships: create/list/delete]
        end
    end
```

## 4. Frontend Component Hierarchy

```mermaid
graph TD
    App[App.tsx]

    App --> CRMLayout[CRMLayout.tsx<br/>Consistent wrapper]

    CRMLayout --> Dashboard[CRMDashboard.tsx<br/>KPIs & Charts]
    CRMLayout --> CustomerList[CustomerList.tsx<br/>Search & Export]
    CRMLayout --> CustomerDetail[CustomerDetail.tsx<br/>Profile view]
    CRMLayout --> LeadPipeline[LeadPipeline.tsx<br/>Kanban board]
    CRMLayout --> OpportunityPipeline[OpportunityPipeline.tsx<br/>Sales stages]
    CRMLayout --> SegmentList[SegmentList.tsx]
    CRMLayout --> SegmentDetail[SegmentDetail.tsx]
    CRMLayout --> BookingCalendar[BookingCalendar.tsx]

    Dashboard --> RevenueChart[RevenueChart.tsx]
    Dashboard --> HealthScoreWidget[HealthScoreWidget]
    Dashboard --> ActivityTimeline[ActivityTimeline]

    CustomerDetail --> CustomerNotes[Notes section]
    CustomerDetail --> CustomerActivities[Activities section]
    CustomerDetail --> CustomerProperties[Properties section]
    CustomerDetail --> CustomerDocuments[DocumentList.tsx]
    CustomerDetail --> CustomerInvoices[Invoices section]
    CustomerDetail --> CustomerSubscriptions[SubscriptionCard.tsx]

    OpportunityPipeline --> OpportunityColumn[OpportunityColumn.tsx x6]
    OpportunityColumn --> OpportunityCard[OpportunityCard.tsx xN]

    SegmentDetail --> SegmentBuilder[SegmentBuilder.tsx<br/>Rule engine]
    SegmentDetail --> RelationshipGraph[RelationshipGraph.tsx<br/>Network viz]

    CustomerDocuments --> DocumentUploader[DocumentUploader.tsx]

    subgraph "Apple UI System (15 components)"
        AppleButton[AppleButton]
        AppleCard[AppleCard]
        AppleModal[AppleModal]
        AppleDrawer[AppleDrawer]
        AppleInput[AppleInput]
        AppleSearchField[AppleSearchField]
        AppleTag[AppleTag]
        AppleBadge[AppleBadge]
        AppleToast[AppleToast]
        AppleDropdown[AppleDropdown]
        AppleCheckbox[AppleCheckbox]
        AppleToggle[AppleToggle]
        BlurView[BlurView]
        ScrollReveal[ScrollReveal]
        SpringTransition[SpringTransition]
    end

    Dashboard -.uses.-> AppleCard
    Dashboard -.uses.-> AppleButton
    CustomerList -.uses.-> AppleSearchField
    CustomerList -.uses.-> AppleButton
    CustomerDetail -.uses.-> AppleModal
    CustomerDetail -.uses.-> AppleDrawer
    OpportunityCard -.uses.-> AppleBadge
    SegmentBuilder -.uses.-> AppleInput
```

## 5. Integration Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant tRPC
    participant CRM_Logic
    participant Database
    participant Billy
    participant Google
    participant Supabase
    participant ChromaDB
    participant Email

    Note over User,Email: Complete Customer Lifecycle Flow

    %% Lead Creation from Email
    User->>Email: Send inquiry email
    Email->>CRM_Logic: Receive email
    CRM_Logic->>ChromaDB: Analyze email sentiment
    ChromaDB-->>CRM_Logic: AI score + classification
    CRM_Logic->>Database: Create lead with AI score
    CRM_Logic->>Email: Send auto-response

    %% Lead Qualification
    User->>Frontend: View leads in pipeline
    Frontend->>tRPC: crm.lead.listLeads()
    tRPC->>Database: Query leads
    Database-->>Frontend: Return leads
    Frontend->>User: Display kanban board

    User->>Frontend: Convert lead to customer
    Frontend->>tRPC: crm.lead.convertLeadToCustomer()
    tRPC->>CRM_Logic: Convert logic
    CRM_Logic->>Database: Create customer_profile
    CRM_Logic->>Database: Log audit_log
    CRM_Logic->>Database: Update lead status
    Database-->>Frontend: Return new customer

    %% Customer Enrichment
    Frontend->>tRPC: crm.customer.syncBillyInvoices()
    tRPC->>Billy: Fetch invoices
    Billy-->>CRM_Logic: Invoice data
    CRM_Logic->>Database: Store customer_invoices

    Frontend->>tRPC: crm.customer.getEmailHistory()
    tRPC->>Email: Fetch email threads
    Email-->>CRM_Logic: Email history
    CRM_Logic->>Database: Link customer_emails

    %% Health Score Calculation
    CRM_Logic->>Database: Query activities
    CRM_Logic->>Database: Query invoices
    CRM_Logic->>Database: Query bookings
    CRM_Logic->>CRM_Logic: Calculate health score algorithm
    CRM_Logic->>Database: Update customer_health_scores

    %% Automatic Segmentation
    CRM_Logic->>Database: Query customer_segments (type=automatic)
    Database-->>CRM_Logic: Segment rules
    CRM_Logic->>CRM_Logic: Evaluate rules against customer
    CRM_Logic->>Database: Update customer_segment_members

    %% Booking Creation
    User->>Frontend: Create booking
    Frontend->>tRPC: crm.booking.createBooking()
    tRPC->>Google: Create calendar event
    Google-->>CRM_Logic: Event created
    CRM_Logic->>Database: Store booking
    CRM_Logic->>Database: Log activity (type=booking_created)
    CRM_Logic->>Database: Log audit_log
    Database-->>Frontend: Confirmation

    %% Document Upload
    User->>Frontend: Upload contract
    Frontend->>tRPC: crm.extensions.uploadDocument()
    tRPC->>Supabase: Upload file
    Supabase-->>CRM_Logic: File URL
    CRM_Logic->>Database: Store customer_documents
    CRM_Logic->>Database: Log audit_log

    %% Opportunity Pipeline
    User->>Frontend: Create opportunity
    Frontend->>tRPC: crm.extensions.createOpportunity()
    tRPC->>Database: Insert opportunity
    CRM_Logic->>Database: Log activity
    CRM_Logic->>Database: Recalculate health score

    User->>Frontend: Move to 'won' stage
    Frontend->>tRPC: crm.extensions.updateStage()
    tRPC->>Database: Update opportunity
    CRM_Logic->>Database: Log audit (old/new values)
    CRM_Logic->>Database: Update customer status to 'vip'

    %% GDPR Export
    User->>Frontend: Request GDPR export
    Frontend->>tRPC: crm.extensions.exportAuditLog()
    tRPC->>Database: Query all customer data
    Database-->>CRM_Logic: All related records
    CRM_Logic->>CRM_Logic: Generate JSON export
    CRM_Logic-->>Frontend: Download file
    Frontend-->>User: GDPR compliant export
```

## 6. Data Flow: Health Score Calculation

```mermaid
flowchart TD
    Start([Customer Created/Updated]) --> Trigger{Trigger Health<br/>Score Calc}

    Trigger -->|Auto| Schedule[Scheduled Job<br/>Every 24h]
    Trigger -->|Manual| API[API Call<br/>recalculateHealthScore]

    Schedule --> Collect
    API --> Collect

    Collect[Collect Data Points] --> Activities[Query Activities<br/>Last 90 days]
    Collect --> Invoices[Query Invoices<br/>Payment history]
    Collect --> Bookings[Query Bookings<br/>Completion rate]
    Collect --> Emails[Query Emails<br/>Response time]
    Collect --> Subscriptions[Query Subscriptions<br/>Active/Cancelled]

    Activities --> Calculate
    Invoices --> Calculate
    Bookings --> Calculate
    Emails --> Calculate
    Subscriptions --> Calculate

    Calculate[Calculate Score Algorithm] --> Factor1[Activity Factor<br/>+20 points]
    Calculate --> Factor2[Revenue Factor<br/>+25 points]
    Calculate --> Factor3[Engagement Factor<br/>+20 points]
    Calculate --> Factor4[Payment Factor<br/>+20 points]
    Calculate --> Factor5[Recency Factor<br/>+15 points]

    Factor1 --> Sum[Sum Total<br/>0-100]
    Factor2 --> Sum
    Factor3 --> Sum
    Factor4 --> Sum
    Factor5 --> Sum

    Sum --> Risk{Determine<br/>Risk Level}

    Risk -->|0-40| Critical[CRITICAL]
    Risk -->|41-60| High[HIGH]
    Risk -->|61-80| Medium[MEDIUM]
    Risk -->|81-100| Low[LOW]

    Critical --> Store
    High --> Store
    Medium --> Store
    Low --> Store

    Store[Store in<br/>customer_health_scores] --> AutoSegment[Trigger Auto<br/>Segmentation]

    AutoSegment --> CheckRules{Check Segment<br/>Rules}
    CheckRules -->|Match| AddToSegment[Add to Segment]
    CheckRules -->|No Match| RemoveFromSegment[Remove from Segment]

    AddToSegment --> End([Update Complete])
    RemoveFromSegment --> End
```

## 7. User Journey: Lead to Customer

```mermaid
journey
    title Customer Acquisition Journey
    section Lead Generation
      Email inquiry received: 5: Email System
      AI analyzes sentiment: 7: ChromaDB
      Lead created in CRM: 8: CRM System
      Auto-response sent: 6: Email System
    section Lead Qualification
      Sales views lead: 7: Sales Team
      Lead scored by AI: 8: ChromaDB
      Contact attempt logged: 6: Sales Team
      Lead qualified: 8: Sales Team
    section Conversion
      Lead converted to customer: 9: CRM System
      Customer profile created: 9: CRM System
      Initial health score: 7: Health Engine
      Welcome email sent: 8: Email System
    section Enrichment
      Billy invoices synced: 8: Billy API
      Calendar events linked: 7: Google API
      Email history imported: 7: Email System
      Documents uploaded: 6: Sales Team
    section Relationship Building
      First booking scheduled: 9: Sales Team
      Service completed: 9: Service Team
      Invoice paid on time: 9: Customer
      Health score improves: 9: Health Engine
    section Growth
      Opportunity created: 8: Sales Team
      Proposal sent: 7: Sales Team
      Deal won: 10: Sales Team
      Customer upgraded to VIP: 10: CRM System
```

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Frontend (Port 5174)"
            Vite[Vite Dev Server<br/>React App]
            HMR[Hot Module Replacement<br/>WebSocket]
        end

        subgraph "Backend (Port 3000)"
            Node[Node.js Server<br/>tRPC + Express]
            WS[WebSocket Server<br/>Real-time updates]
        end

        subgraph "Database (Port 3307)"
            MySQL[PostgreSQL<br/>Docker Container]
            PGAdmin[pgAdmin<br/>Management UI]
        end

        subgraph "External Services"
            Billy2[Billy API<br/>Invoicing]
            Google2[Google Calendar<br/>OAuth2]
            Supabase2[Supabase<br/>File Storage]
            ChromaDB2[ChromaDB<br/>Vector DB]
            SMTP[Email Server<br/>IMAP/SMTP]
        end
    end

    subgraph "Docker Development"
        DockerCompose[docker-compose.yml]
        Volume1[Read-Write Volumes<br/>Live editing]
        Volume2[node_modules Volume<br/>Performance]
    end

    Vite --> Node
    Vite --> HMR
    Node --> WS
    Node --> MySQL

    Node --> Billy2
    Node --> Google2
    Node --> Supabase2
    Node --> ChromaDB2
    Node --> SMTP

    DockerCompose --> Vite
    DockerCompose --> Node
    DockerCompose --> MySQL
    Volume1 --> Vite
    Volume1 --> Node
    Volume2 --> Node

    MySQL --> PGAdmin
```

## 9. Test Coverage Map

```mermaid
mindmap
  root((CRM Tests<br/>73 Total))
    E2E Tests - 60
      Customer Management - 15
        Create customer
        Edit customer
        Delete customer
        Search customers
        Export CSV
        View customer details
        Add notes
        Update notes
        Delete notes
        Add properties
        Health score display
        Activity log
        Invoice sync
        Email history
        Bulk operations
      Lead Pipeline - 12
        Create lead
        Move lead stages
        Convert to customer
        Lead search
        AI scoring
        Lead export
        Duplicate detection
        Lead assignment
        Lead notes
        Lead activities
        Lead source tracking
        Lost reason capture
      Opportunities - 10
        Create opportunity
        Update stage
        Win opportunity
        Lose opportunity
        Revenue calculation
        Probability weighting
        Expected close date
        Metadata handling
        Opportunity export
        Pipeline visualization
      Segmentation - 8
        Create manual segment
        Create auto segment
        Rule builder
        Segment members
        Bulk actions
        Color coding
        Segment export
        Dynamic updates
      Documents - 6
        Upload document
        Download document
        Delete document
        Version control
        Tag search
        Category filter
      Bookings - 5
        Create booking
        Update booking
        Cancel booking
        Calendar view
        Service templates
      GDPR - 4
        Audit log view
        Export audit data
        Data retention
        Consent tracking
    Unit Tests - 10
      CSV Export - 10
        Customer export
        Lead export
        Opportunity export
        CSV escaping
        Date formatting
        Special characters
        Empty data
        Large datasets
        Column headers
        Encoding
    Integration Tests - 3
      Billy API
      Google Calendar
      Email sync
```

## 10. Performance Optimization Map

```mermaid
graph LR
    subgraph "Database Optimizations"
        Idx1[30+ Indexes<br/>Strategic placement]
        Idx2[Composite Indexes<br/>userId + createdAt]
        Idx3[Foreign Key Indexes<br/>All relations]
        Param[Parameterized Queries<br/>SQL injection prevention]
    end

    subgraph "Caching Strategy"
        QueryCache[Query Cache<br/>5min TTL]
        TanStack[TanStack Query<br/>Client-side cache]
        Stale[Stale-while-revalidate<br/>Pattern]
    end

    subgraph "API Optimizations"
        TypeSafe[tRPC Type Safety<br/>No runtime overhead]
        Batch[Batch Queries<br/>Reduce round-trips]
        Lazy[Lazy Loading<br/>Code splitting]
    end

    subgraph "Frontend Optimizations"
        Virt[Virtual Scrolling<br/>Large lists]
        Memo[React.memo<br/>Component caching]
        Debounce[Debounced Search<br/>Reduce API calls]
        Prefetch[Prefetch on Hover<br/>Instant navigation]
    end

    Idx1 --> Fast[Fast Queries<br/><100ms]
    Idx2 --> Fast
    Idx3 --> Fast
    Param --> Fast

    QueryCache --> Fast
    TanStack --> Fast
    Stale --> Fast

    TypeSafe --> Fast
    Batch --> Fast
    Lazy --> Fast

    Virt --> Fast
    Memo --> Fast
    Debounce --> Fast
    Prefetch --> Fast

    Fast --> Target[Target: <200ms<br/>Response time]
```

---

## Legend

- **Boxes**: Components/Modules
- **Cylinders**: Databases
- **Diamonds**: Decision points
- **Arrows**: Data flow / Dependencies
- **Dotted lines**: Optional/conditional flows
- **Subgraphs**: Logical groupings

## File Locations Reference

- **Frontend Pages**: `/client/src/pages/crm/`
- **Frontend Components**: `/client/src/components/crm/`
- **Apple UI**: `/client/src/components/crm/apple-ui/`
- **Backend Routers**: `/server/routers/crm-*.ts`
- **Database Helpers**: `/server/db/customer-db.ts`, `/server/db/lead-db.ts`
- **Database Schema**: `/drizzle/schema.ts` (lines 181-1099)
- **Tests**: `/tests/crm/` (E2E), `/tests/unit/csv-export.test.ts`
- **Utils**: `/client/src/utils/csv-export.ts`
