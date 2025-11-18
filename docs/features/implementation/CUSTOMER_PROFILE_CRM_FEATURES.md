# Customer Profile - CRM Features

## ✅ Implementeret (Nu aktiv)

### Auto-Sync System

- **Automatisk datahentning** ved åbning af kundeprofil
- **Smart caching**: Data caches i 5 minutter for at undgå unødige API-kald
- **Stille background sync**: Spinner vises kun i faner, ikke blokererende
- **Persistent tracking**: Husker sidste sync per kunde i localStorage

### Quick Actions Bar

- **Send Email**: Åbner mailto-link med kundens email
- **Ny Aftale**: Placeholder for kalender-integration
- **Ny Faktura**: Placeholder for Billy-integration
- **Tilføj Note**: Placeholder for note-system

### UI/UX Forbedringer

- **Sidepanel (840px)** i stedet for modal → bevar indbakke-kontekst
- **Åbner på Emails-fanen** når klikket fra inbox
- **Status badge**: "Aktiv kunde" badge i header
- **Sidste kontakt dato** vises prominent
- **Lazy-load per fane**: Data hentes kun når fane er aktiv
- **Prefetch ved klik**: Profil-data loades før åbning
- **Subtile sync-indikatorer**: Små spinners i faner + "• Syncing..." tekst

## 🚧 Næste skridt (forslag)

### Activity Timeline

- **Unified tidslinje** af emails, fakturaer, kalender, noter
- **Kronologisk sortering** med nyeste først
- **Filtrerbar** (kun emails, kun fakturaer, etc.)
- **Interaktiv**: Klik email → åbn i inbox, klik faktura → vis detaljer

### Klikbare Emails

- Klik email i profil → åbn email-tråd i hovedvinduet
- Valgfri auto-luk af sidepanel
- Smooth navigation mellem profil og inbox

### Forbedret Lead/Kunde Metadata

- **Dynamiske status badges**: Ny lead, Aktiv, Inaktiv, VIP, etc.
- **Tags system**: Erhverv, Flytterengøring, Fast kunde, etc.
- **Quick stats bar**: Total faktureret, Gennemsnitlig responstid, etc.

### AI-forbedringer

- **"Chat med Friday om denne kunde"** knap → åbner chat med context
- **Auto-generer resumé** ved første åbning (hvis mangler)
- **AI-forslag**: Næste trin, Risk flags, Upsell muligheder

### Invoice Deep-dive

- **Klikbar faktura** → modal med fuld detalje
- **Quick actions**: Send påmindelse, Marker som betalt
- **Visual status**: Bedre color-coding

### Kalender Improvements

- **Bedre estimat-parsing**: Timer, pris, team-størrelse
- **Color-coding** efter service-type
- **"Opret lignende"** knap for gentagende opgaver

## 🔧 Teknisk implementation

### Auto-sync Logic

```typescript
// Tjekker om data er ældre end 5 minutter
const isStale = now - lastSync > 5 *60* 1000;

if (isStale) {
  // Sync i baggrund uden at blokere
  Promise.all([
    syncGmail.mutateAsync({ customerId: profile.id }),
    syncBilly.mutateAsync({ customerId: profile.id }),
  ]);
}

```text

### Caching Strategy

- **LocalStorage** per kunde: `customer-last-sync-${customerId}`
- **5 minutters TTL** for at balance freshness vs. API-load
- **Auto-invalidation** ved manuel refresh

### Performance

- **Lazy-load**: Hver fane loader sin data kun når aktiv
- **Prefetch**: Profil-data hentes før sidepanel åbnes
- **Optimistic UI**: Viser cached data med diskret sync-indikator

## 📊 Dataflow

```text
Klik på afsender → Resolve/Create Lead → Prefetch profil
                                              ↓
                                        Åbn sidepanel
                                              ↓
                                    Tjek cache (5 min TTL)
                                              ↓
                          Cache fresh?  ←  Ja  →  Vis data
                                ↓ Nej
                        Auto-sync (stille)
                                ↓
                          Opdater UI

```

## 🎯 Sammenligning: Før vs. Nu

| Feature             | Før                    | Nu                               |
| ------------------- | ---------------------- | -------------------------------- |
| Visning             | Centered modal (500px) | Højre sidepanel (840px)          |
| Default fane        | Overview               | Emails (fra inbox)               |
| Data-hentning       | Manuel klik            | Auto-sync (5 min cache)          |
| API-kald ved åbning | 4 (alt samtidig)       | 1-2 (lazy per fane)              |
| Quick actions       | 0                      | 4 (Email, Aftale, Faktura, Note) |
| Sync-feedback       | Stor spinner           | Lille fane-spinner + tekst       |
| Åbne-hastighed      | ~800ms                 | ~200ms (prefetch)                |

## 💡 Best Practices

1. **Auto-sync interval**: 5 min er balancen mellem freshness og API-cost
1. **Manual refresh**: Altid tilgængelig via ghost-knap i hver fane
1. **Error handling**: Stille failures → data vises fra cache, ingen toast spam
1. **Mobile-ready**: Sidepanel width responsiv (`sm:max-w-[840px]`)

## 🔄 Workflow Eksempel

1. Bruger klikker på afsender "<rendetalje@gmail.com>" i inbox
1. Lead resolves eller oprettes automatisk
1. Profil-data prefetches
1. Sidepanel glider ind fra højre → Emails-fanen
1. Hvis data > 5 min gammelt: auto-sync starter stille
1. Lille spinner i "Emails" og "Invoices" faner
1. Data opdateres uden UX-disruption
1. Bruger kan klikke Quick Actions eller browse faner

---

**Sidst opdateret**: 6. november 2025
