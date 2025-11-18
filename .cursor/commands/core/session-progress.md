# Session Progress

Analysér hvad der er gjort + hvad der mangler. Læs chat sessionen, tjek filer, identificér status baseret på chat diskussioner, og rapporter progress.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Analysér session progress baseret på chat + filer
- **Quality:** Nøjagtig, komplet, klar

## TASK

Analysér progress:

1. **Læs chat sessionen** - Hvad blev diskuteret? Hvad blev besluttet?
2. **Tjek filer** - Hvad er faktisk ændret? Matcher det chat diskussioner?
3. **Identificér færdigt** - Hvad er gjort baseret på chat + filer?
4. **Identificér mangler** - Hvad mangler baseret på chat diskussioner?
5. **Rapporter status** - Kort status baseret på chat + filer

## CHAT SESSION READING

**Læs chat sessionen:**

- Hvad blev diskuteret?
- Hvad blev besluttet?
- Hvad blev implementeret ifølge chat?
- Hvad mangler ifølge chat?

## OUTPUT FORMAT

```markdown
## Progress Status (baseret på chat + filer)

**Chat kontekst:** [Hvad blev diskuteret]

**Færdigt (fra chat + filer):**

- ✅ [Item 1] - [Fra chat diskussion]
- ✅ [Item 2] - [Fra chat diskussion]

**I gang (fra chat):**

- 🔄 [Item 1] - [Fra chat diskussion]

**Mangler (fra chat diskussioner):**

- ⏳ [Item 1] - [Fra chat]
- ⏳ [Item 2] - [Fra chat]

## Files ændret (matcher chat?)

- `[file path]` - [Status] - [Nævnt i chat?]
```

## GUIDELINES

- **Læs chatten:** Forstå hvad der blev diskuteret
- **Tjek filer:** Verificer mod faktisk kode
- **Match:** Sammenlign chat diskussioner med faktisk status
- **Nøjagtig:** Tjek faktisk status i filer
- **Komplet:** Dæk alt der er gjort og mangler baseret på chat

---

**CRITICAL:** Læs chat sessionen, tjek filer, sammenlign chat diskussioner med faktisk status, identificér hvad der er gjort og mangler, og rapporter progress status.
