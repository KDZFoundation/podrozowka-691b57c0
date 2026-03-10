

# Plan naprawy: Ranking ambasadorów i Cultural Impact

## Problem

Widok `profiles_public` został utworzony w poprzedniej migracji, ale uprawnienia `GRANT SELECT` nie zostały poprawnie zastosowane. Zapytania do tego widoku zwracają błąd **401 "permission denied for table profiles"**.

Dotyczy to:
- **Strona główna**: sekcja "Top Ambasadorów Polski" (komponent `UserRanking`) — nie ładuje danych
- **Dashboard**: karta Cultural Impact (`RankCard`) działa poprawnie (odpytuje bezpośrednio tabelę `profiles` z RLS na własny profil), ale `CulturalMissions` jest zaimportowany i nigdy nie renderowany w szablonie

## Przyczyna

Polecenia `GRANT SELECT ON public.profiles_public TO authenticated/anon` z migracji nie zostały zastosowane — tabela `information_schema.role_table_grants` nie zawiera żadnych uprawnień dla tego widoku.

## Plan naprawy

### 1. Migracja SQL — ponowne nadanie uprawnień
Utworzenie nowej migracji, która:
- Upewni się, że widok `profiles_public` jest `SECURITY DEFINER` (ponowne CREATE OR REPLACE)
- Nadaje `GRANT SELECT` dla ról `authenticated` i `anon`

### 2. Renderowanie CulturalMissions w Dashboard
Komponent `CulturalMissions` jest zaimportowany w `Dashboard.tsx`, ale nigdy nie jest wyświetlany. Dodanie go do zakładki "overview" za flagą `cultural_missions`:

```
{flags?.cultural_missions && <CulturalMissions />}
```

## Efekt
- Ranking na stronie głównej zacznie się ładować
- Cultural Missions pojawi się w dashboardzie (gdy flaga zostanie włączona w panelu admina)

