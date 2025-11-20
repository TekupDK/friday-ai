# UTF-8 Encoding Fix for Tests

**Dato:** 2025-01-28  
**Status:** ✅ Implementeret  
**Formål:** Sikre korrekt visning af danske tegn (åøæ) og checkmarks (✓) i test output

---

## 🔍 Problem

Windows PowerShell viser ikke UTF-8 tegn korrekt som standard:
- Checkmarks (✓) vises som `Ô£ô`
- Danske tegn (åøæ) kan vises forkert

---

## ✅ Løsning

### Automatisk UTF-8 Encoding Script

Vi har oprettet `scripts/test-with-utf8.ps1` der automatisk sætter UTF-8 encoding.

**Brug:**
```bash
pnpm test:utf8 [test files...]
```

**Eksempler:**
```bash
# Kør alle tests med UTF-8
pnpm test:utf8

# Kør specifik test fil
pnpm test:utf8 server/__tests__/security.test.ts

# Kør flere test filer
pnpm test:utf8 server/__tests__/security.test.ts server/__tests__/dev-login-security.test.ts
```

---

## 🔧 Hvad gør scriptet?

Scriptet:
1. Sætter UTF-8 encoding i PowerShell
2. Ændrer code page til 65001 (UTF-8)
3. Kører vitest med korrekt encoding
4. Sikrer at både danske tegn og checkmarks vises korrekt

---

## 📝 Manuelt Setup (Hvis nødvendigt)

Hvis du vil sætte encoding manuelt i PowerShell:

```powershell
# Sæt UTF-8 encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Ændr code page til UTF-8
chcp 65001

# Kør tests
pnpm test
```

---

## 🎯 Resultat

Efter fix:
- ✅ Checkmarks (✓) vises korrekt
- ✅ Danske tegn (åøæ) vises korrekt
- ✅ Alle tests passerer stadig (100%)

---

## 📊 Test Resultater

**Før fix:**
```
Ô£ô server/__tests__/security.test.ts > Security Regression Tests > ...
```

**Efter fix:**
```
✓ server/__tests__/security.test.ts > Security Regression Tests > ...
```

---

## ⚠️ Note

Encoding problemet påvirker **kun visningen** i terminalen. Test resultaterne er korrekte uanset encoding:
- ✅ Test Files: 1 passed (1)
- ✅ Tests: 15 passed (15)
- ✅ Exit code: 0 (success)

---

**Dato:** 2025-01-28  
**Status:** ✅ Implementeret og testet

