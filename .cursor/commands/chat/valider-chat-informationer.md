# Valider Chat Informationer

Tjek om noget er modstridende eller mangler.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Valider informationer fra chatten
- **Quality:** Nøjagtig, komplet, klar

## TASK

Tjek chat informationer:
- Er noget modstridende?
- Mangler der informationer?
- Er filer korrekte?
- Er kode snippets korrekte?
- Er beslutninger konsistente?

## OUTPUT FORMAT

```markdown
## Validering Resultat

### ✅ Korrekt
- [Information 1] - ✅ Verified
- [Information 2] - ✅ Verified

### ❌ Modstridende
- [Information 1] vs [Information 2] - [Konflikt] - [Løsning]

### ⚠️ Mangler
- [Information 1] - [Hvad mangler]

### ❌ Forkert
- [Information 1] - [Forventet] vs [Faktisk] - [Fix]
```

## GUIDELINES

- **Systematisk:** Tjek alle informationer
- **Nøjagtig:** Verificer mod codebase
- **Klar:** Marker issues tydeligt
- **Actionable:** Giv fixes for issues

---

**CRITICAL:** Læs chatten, tjek alle informationer for modstrid, mangler, og fejl, og rapporter resultater klart.
