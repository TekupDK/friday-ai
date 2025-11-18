# 🚀 CRM MODUL IMPLEMENTATION GUIDE - INDE I FRIDAY-AI-V2

**Detaljeret teknisk guide til at bygge CRM modulet i jeres eksisterende arkitektur.**

---

## 📊 **ARKITEKTUR OVERBLIK - JERES SETUP**

### **Eksisterende Tech Stack (Perfekt til CRM):**

```typescript
// ✅ JERES SETUP:
Frontend: React 19 + TypeScript + Vite
UI: Shadcn/ui + TailwindCSS + Lucide Icons
Backend: Node.js + TRPC + Drizzle ORM
Database: PostgreSQL + Supabase
Auth: JWT-protected procedures
AI: ChromaDB + Claude integration
Routing: Wouter
State: TanStack Query + React Context
```

### **CRM Foundation (Allerede Eksisterende):**

```typescript
// ✅ JERES CRM DATA STRUKTUR:
tables: {
  leads: { id, userId, name, email, phone, status, score, metadata },
  customer_profiles: { id, userId, leadId, email, name, status, tags, aiResume },
  customer_invoices: { id, customerId, amount, status, paidAmount },
  tasks: { id, userId, title, status, priority, orderIndex }
}

routers: {
  friday-leads-router: {
    lookupCustomer, getCustomerIntelligence, getActionableInsights, getDashboardStats
  }
}
```

---

## 🎯 **IMPLEMENTATION ROADMAP - 4 FASES**

### **Fase 1: CRM Router & API (1-2 uger)**

```typescript
// 1. Opret server/routers/crm-router.ts
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const crmRouter = router({
  // Customer Management - Udvid eksisterende
  getCustomers: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["new", "active", "vip", "at_risk"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      return await db
        .select()
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, ctx.user.id))
        .limit(input.limit);
    }),

  // Lead Assignment - Ny funktionalitet
  assignLead: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        assignedTo: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update lead med assignment
      const db = await getDb();
      await db
        .update(leads)
        .set({
          assignedTo: input.assignedTo,
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, input.leadId));
    }),

  // Task Management - Udvid eksisterende
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        customerId: z.number().optional(),
        leadId: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Brug eksisterende task creation logic
      return await createTask({
        userId: ctx.user.id,
        title: input.title,
        priority: input.priority,
        customerId: input.customerId,
        leadId: input.leadId,
        dueDate: input.dueDate,
      });
    }),

  // Opportunity Tracking - Nyt
  createOpportunity: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        customerId: z.number(),
        value: z.number(),
        stage: z.enum([
          "prospect",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Opret ny opportunity record
      // (Tilføj til schema hvis nødvendigt)
    }),
});

// 2. Registrer router i server/_core/index.ts
import { crmRouter } from "../routers/crm-router";

export const appRouter = router({
  // Eksisterende routers...
  leads: fridayLeadsRouter,

  // 🆕 NY: CRM router
  crm: crmRouter,
});

export type AppRouter = typeof appRouter;
```

### **Fase 2: CRM UI Komponenter (2-3 uger)**

```typescript
// 1. Opret client/src/pages/crm/ mappen
mkdir client/src/pages/crm/
mkdir client/src/components/crm/

// 2. Customer Management Page
// client/src/pages/crm/CustomerManagement.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc'; // Opret denne
import { CustomerCard } from '@/components/crm/CustomerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CustomerManagement() {
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => trpc.crm.getCustomers.query({ search })
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kunder</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ny Kunde
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Søg kunder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}

// 3. CRM Navigation - Udvid WorkspaceLayout
// client/src/pages/WorkspaceLayout.tsx
import CustomerManagement from './crm/CustomerManagement';
import LeadAssignment from './crm/LeadAssignment';
import TaskBoard from './crm/TaskBoard';

// Tilføj CRM routes
<Route path="/crm/customers" component={CustomerManagement} />
<Route path="/crm/leads" component={LeadAssignment} />
<Route path="/crm/tasks" component={TaskBoard} />
```

### **Fase 3: Integration & Udvidelser (2 uger)**

```typescript
// 1. Billy Integration
// Udvid eksisterende billy integration
export const createInvoiceForCustomer = protectedProcedure
  .input(z.object({ customerId: z.number(), amount: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // Opret faktura i Billy + link til customer
  });

// 2. Calendar Integration
// Udvid eksisterende calendar integration
export const scheduleCustomerMeeting = protectedProcedure
  .input(
    z.object({
      customerId: z.number(),
      title: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Opret calendar event + link til customer
  });

// 3. Email Integration
// Udvid eksisterende email system
export const sendCustomerEmail = protectedProcedure
  .input(
    z.object({
      customerId: z.number(),
      subject: z.string(),
      body: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Send email + log aktivitet i customer historik
  });
```

### **Fase 4: AI Enhancement (Valgfri)**

```typescript
// Tilføj AI suggestions efter manuel kontrol fungerer
export const getLeadSuggestions = protectedProcedure
  .input(z.object({ leadId: z.number() }))
  .query(async ({ ctx, input }) => {
    // AI foreslår næste handlinger baseret på lead data
    return {
      suggestedActions: ["ring kunde", "send tilbud", "book møde"],
      confidence: 0.85,
    };
  });
```

---

## 🗂️ **FILSTRUKTUR - DETALJERET**

### **Server Side:**

```
server/
├── routers/
│   ├── friday-leads-router.ts     # Eksisterende CRM fundament
│   └── crm-router.ts             # 🆕 CRM UI API endpoints
├── modules/
│   └── crm/                      # 🆕 CRM business logic
│       ├── customer-service.ts
│       ├── lead-service.ts
│       └── opportunity-service.ts
└── db.ts                         # Eksisterende - udvides med CRM queries
```

### **Client Side:**

```
client/src/
├── pages/
│   ├── LeadsDemoPage.tsx         # Eksisterende demo
│   └── crm/                      # 🆕 CRM pages
│       ├── CustomerManagement.tsx
│       ├── LeadAssignment.tsx
│       ├── TaskBoard.tsx
│       └── OpportunityPipeline.tsx
├── components/
│   ├── leads/
│   │   └── CustomerCard.tsx      # Eksisterende
│   └── crm/                      # 🆕 CRM komponenter
│       ├── CustomerCard.tsx      # Udvidet version
│       ├── LeadAssignmentCard.tsx
│       ├── TaskCard.tsx
│       └── OpportunityCard.tsx
├── hooks/
│   └── useCRM.ts                 # 🆕 CRM hooks
└── lib/
    └── trpc.ts                   # 🆕 TRPC klient setup
```

### **Database Schema (Udvid Eksisterende):**

```sql
-- Eksisterende tabeller (behold):
-- leads, customer_profiles, customer_invoices, tasks

-- Nye felter til eksisterende tabeller:
ALTER TABLE leads ADD COLUMN assigned_to TEXT;
ALTER TABLE leads ADD COLUMN assigned_at TIMESTAMP;
ALTER TABLE customer_profiles ADD COLUMN preferred_times JSONB;
ALTER TABLE customer_profiles ADD COLUMN special_requests TEXT;

-- Ny tabel hvis nødvendigt:
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  title TEXT NOT NULL,
  value DECIMAL(10,2),
  stage TEXT CHECK (stage IN ('prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **TEKNISKE IMPLEMENTATION DETALJER**

### **1. TRPC Klient Setup:**

```typescript
// client/src/lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "../../../server/_core/index";

export const trpc = createTRPCReact<AppRouter>();
```

### **2. TRPC Provider Setup:**

```typescript
// client/src/main.tsx eller App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers: () => ({
        authorization: `Bearer ${getAuthToken()}`,
      }),
    }),
  ],
});

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* Din app */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### **3. Database Service Layer:**

```typescript
// server/modules/crm/customer-service.ts
import { getDb } from "../../db";
import { customerProfiles, leads } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export class CustomerService {
  static async getCustomers(userId: number, filters: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let query = db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId));

    // Apply filters
    if (filters.search) {
      query = query.where(
        sql`${customerProfiles.name} ILIKE ${`%${filters.search}%`}`
      );
    }

    if (filters.status) {
      query = query.where(eq(customerProfiles.status, filters.status));
    }

    return await query.limit(filters.limit || 50);
  }

  static async updateCustomerPreferences(customerId: number, preferences: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .update(customerProfiles)
      .set({
        preferredTimes: preferences.times,
        specialRequests: preferences.requests,
        updatedAt: new Date(),
      })
      .where(eq(customerProfiles.id, customerId));
  }
}
```

### **4. React Hooks:**

```typescript
// client/src/hooks/useCRM.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useCustomers(search = "") {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => trpc.crm.getCustomers.query({ search }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trpc.crm.assignLead.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
```

### **5. UI Komponent Patterns:**

```typescript
// client/src/components/crm/CustomerCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerProfile } from '@/types/crm'; // Type definitions

interface CustomerCardProps {
  customer: CustomerProfile;
  onEdit?: (customer: CustomerProfile) => void;
  onAssignTask?: (customer: CustomerProfile) => void;
}

export function CustomerCard({ customer, onEdit, onAssignTask }: CustomerCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          <Badge variant={getStatusVariant(customer.status)}>
            {customer.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2" />
          {customer.email}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2" />
          {customer.phone}
        </div>

        {customer.tags && customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {customer.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(customer)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => onAssignTask?.(customer)}>
            Opret Opgave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'vip': return 'default';
    case 'at_risk': return 'destructive';
    case 'active': return 'secondary';
    default: return 'outline';
  }
}
```

### **6. Navigation Integration:**

```typescript
// Udvid WorkspaceLayout med CRM navigation
// client/src/pages/WorkspaceLayout.tsx

// Tilføj CRM menu items
const navigationItems = [
  // Eksisterende...
  { icon: Bot, label: "AI Assistant", path: "/" },
  { icon: Mail, label: "Email Center", path: "/email" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },

  // 🆕 CRM Navigation
  { icon: Users, label: "Kunder", path: "/crm/customers" },
  { icon: Target, label: "Leads", path: "/crm/leads" },
  { icon: TrendingUp, label: "Opportunities", path: "/crm/opportunities" },
];
```

---

## 🎯 **IMPLEMENTATION PRIORITETER**

### **Måned 1: Core CRM (Uge 1-4)**

1. ✅ **CRM Router** - API endpoints for customers, leads, tasks
2. ✅ **Customer Management** - CRUD operations på customer profiles
3. ✅ **Lead Assignment** - Manuel lead distribution interface
4. ✅ **Task Integration** - Udvid eksisterende task system

### **Måned 2: Rendetalje Customization (Uge 5-8)**

1. ✅ **Property Fields** - Ejendom-specifikke data (størrelse, adgang, etc.)
2. ✅ **Service Templates** - Grundrengøring, flytterengøring templates
3. ✅ **Customer Preferences** - Foretrukne tider, allergier, special requests
4. ✅ **Mobile Optimization** - Field worker interfaces

### **Måned 3: Integration & Intelligence (Uge 9-11)**

1. ✅ **Billy Integration** - Auto-fakturering ved job completion
2. ✅ **Calendar Integration** - Booking system
3. ✅ **Email Integration** - Kommunikation tracking
4. ✅ **Basic Reporting** - Dashboard og analytics

### **Måned 4: AI Enhancement (Uge 12-16)**

1. ✅ **Smart Suggestions** - AI-rekommendationer (valgfrit)
2. ✅ **Predictive Analytics** - Opportunity scoring
3. ✅ **Automated Workflows** - Gradvis automatisering
4. ✅ **Performance Optimization** - Scaling og monitoring

---

## 🚀 **START IMPLEMENTATION - KONKRET PLAN**

### **Dag 1-2: Setup CRM Infrastructure**

```bash
# 1. Opret mapper
mkdir server/routers/crm-router.ts
mkdir server/modules/crm/
mkdir client/src/pages/crm/
mkdir client/src/components/crm/
mkdir client/src/hooks/

# 2. Implementer basic CRM router
# 3. Opret TRPC klient setup
# 4. Tilføj CRM navigation i WorkspaceLayout
```

### **Dag 3-5: Customer Management**

```typescript
// Implementer:
// - getCustomers endpoint
// - CustomerManagement page
// - CustomerCard komponent
// - Basic CRUD operations
```

### **Dag 6-7: Lead Assignment**

```typescript
// Implementer:
// - assignLead endpoint
// - LeadAssignment page
// - Lead assignment workflow
```

### **Dag 8-10: Task Integration**

```typescript
// Udvid eksisterende task system med:
// - Customer-linked tasks
// - Lead follow-up tasks
// - Task board interface
```

---

## 💡 **UNIKKE FORDELE VED JERES ARKITEKTUR**

### **AI-Ready Fra Start**

- ✅ **ChromaDB Integration** - Semantic search allerede opsat
- ✅ **Claude Integration** - LLM allerede tilgængelig
- ✅ **Lead Intelligence** - AI-drevet lead scoring allerede der
- ✅ **Customer AI Resume** - AI-genererede customer summaries

### **Enterprise-Grade Infrastructure**

- ✅ **Supabase** - Scalable database allerede der
- ✅ **TRPC** - Type-safe API allerede implementeret
- ✅ **A/B Testing** - Feature flags allerede tilgængelig
- ✅ **Audit Logging** - Alle ændringer tracked
- ✅ **Performance Monitoring** - System metrics opsat

### **Development Excellence**

- ✅ **TypeScript** - 100% type safety
- ✅ **Shadcn/ui** - Konsistent design system
- ✅ **Hot Reload** - Optimal development experience
- ✅ **Testing Framework** - Vitest + Playwright klar

---

## 🎯 **RISIKO MITIGATION**

### **Lav Risiko Approach**

- ✅ **Ingen Breaking Changes** - Bygger på eksisterende
- ✅ **Gradual Rollout** - Én feature ad gangen
- ✅ **Fallback til Manuel** - Kan slukke AI når som helst
- ✅ **Incremental Deployment** - Test hver komponent isoleret

### **Tekniske Safeguards**

- ✅ **Database Transactions** - Sikrer data consistency
- ✅ **Error Boundaries** - Frontend fejltolerance
- ✅ **Rollback Scripts** - Kan rulle tilbage hvis problemer
- ✅ **Monitoring** - Performance tracking fra dag 1

---

## 🚀 **KLAR TIL AT STARTE?**

**Teknisk set er dette en perfekt implementation:**

- ✅ **0 nye teknologier** - kun udvidelse af eksisterende
- ✅ **100% backward compatibility** - eksisterende features uændret
- ✅ **AI-foundation klar** - ChromaDB/Claude allerede integreret
- ✅ **Enterprise-ready** - audit logging, monitoring, testing

**CRM modulet bliver en naturlig evolution af jeres lead intelligence system!**

Hvad skal vi starte med - CRM router setup eller UI komponenter? 🤝
