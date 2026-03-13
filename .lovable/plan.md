

# Dodanie Polityki Prywatności i Regulaminu

## Co robimy
Dodajemy do stopki linki do dwóch nowych podstron: "Polityka prywatności" i "Regulamin". Każda podstrona będzie osobną stroną z edytowalną treścią.

## Plan

### 1. Nowe strony
- `src/pages/PrivacyPolicy.tsx` — strona z nagłówkiem, treścią polityki prywatności (placeholder do edycji), Header i Footer
- `src/pages/Terms.tsx` — strona z nagłówkiem, treścią regulaminu (placeholder do edycji), Header i Footer

Obie strony będą miały spójny layout: Header na górze, sekcja `prose` z treścią (nagłówki, paragrafy), Footer na dole.

### 2. Routing — `src/App.tsx`
Dodanie dwóch nowych tras:
- `/polityka-prywatnosci` → `PrivacyPolicy`
- `/regulamin` → `Terms`

### 3. Stopka — `src/components/Footer.tsx`
W kolumnie "Nawigacja" dodanie dwóch nowych linków:
- `Polityka prywatności` → `/polityka-prywatnosci`
- `Regulamin` → `/regulamin`

Linki będą używać `<a href="...">` (lub `Link` z react-router-dom) do nawigacji.

