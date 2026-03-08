

## Przebudowa backendu Podróżówka - plan

### Problem

Obecna struktura bazy (`postcards`) traktuje kartki jak wpisy tworzone przez użytkownika po wręczeniu. Nowy model wymaga, by **każda fizyczna kartka istniała w systemie od momentu produkcji** (5000 sztuk), a dopiero potem była przypisywana do kupującego i rejestrowana przez obdarowanego via QR.

### Nowa architektura bazy danych

```text
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  countries   │────<│   designs    │────<│   postcards  │
│             │     │              │     │  (5000 szt.) │
│ id, name,   │     │ id, country, │     │ id, design,  │
│ code, flag  │     │ view_name,   │     │ qr_token,    │
│             │     │ image_url    │     │ status,      │
└─────────────┘     └──────────────┘     │ buyer_id,    │
                                          │ buyer_name,  │
                                          │ recipient_*  │
                                          └──────────────┘
```

### Migracja SQL - nowe tabele i przebudowa

**1. Tabela `countries` (50 krajów)**
- `id` UUID PK
- `name` TEXT NOT NULL UNIQUE (np. "Niemcy")
- `code` TEXT NOT NULL UNIQUE (np. "DE")
- `flag` TEXT (emoji flagi)
- `language_code` TEXT NOT NULL (język na kartce)
- `language_name` TEXT NOT NULL

**2. Tabela `designs` (500 wzorów: 50 krajów × 10 widoków)**
- `id` UUID PK
- `country_id` UUID FK → countries
- `view_name` TEXT NOT NULL (nazwa widoku, np. "Brama Brandenburska")
- `image_url` TEXT (grafika wzoru)
- `sort_order` INTEGER DEFAULT 0

**3. Przebudowa tabeli `postcards` (5000 rekordów: 500 wzorów × 10 sztuk)**

Usunięcie starej tabeli i utworzenie nowej z polami:
- `id` UUID PK
- `design_id` UUID FK → designs NOT NULL
- `serial_number` INTEGER NOT NULL (1-10 w ramach wzoru)
- `qr_token` TEXT NOT NULL UNIQUE (losowy, bezpieczny token do QR)
- `status` TEXT NOT NULL DEFAULT 'available' CHECK (available, purchased, registered)
- `buyer_id` UUID (FK logiczny do auth.users) — NULL dopóki nie kupiona
- `buyer_display_name` TEXT — imię Podróżnika widoczne po skanie
- `purchased_at` TIMESTAMPTZ
- `order_reference` TEXT — numer zamówienia z WooCommerce
- `recipient_name` TEXT — imię obdarowanego (po rejestracji)
- `recipient_message` TEXT — krótka wiadomość
- `recipient_email` TEXT — opcjonalny email kontaktowy
- `registered_at` TIMESTAMPTZ
- `created_at`, `updated_at` TIMESTAMPTZ

Constraint UNIQUE na `(design_id, serial_number)`.

**4. Aktualizacja `platform_stats`**
- Dodanie kolumny `total_registered` (zamiast total_given)
- Aktualizacja triggerów do nowych statusów

**5. Aktualizacja `profiles`**
- Zmiana `postcards_given` → `postcards_purchased`
- `postcards_received` pozostaje (kartki zarejestrowane przez obdarowanego, jeśli ma konto)

### Polityki RLS

| Tabela | SELECT | INSERT | UPDATE |
|---|---|---|---|
| `countries` | publiczny | brak (dane seedowane) | brak |
| `designs` | publiczny | brak | brak |
| `postcards` | publiczny: tylko `status`, `design_id`, `buyer_display_name`, `registered_at` przez widok; pełne dane: owner | brak kliencki (edge function) | rejestracja: edge function |
| `platform_stats` | publiczny | brak | brak |

**Kluczowa zasada bezpieczeństwa**: Klient nigdy nie przypisuje sobie kartki bezpośrednio. Dwie operacje wymagają Edge Functions z service_role:

1. **`assign-postcards`** — wywoływane po potwierdzeniu wysyłki (webhook z WooCommerce). Przyjmuje `order_reference`, listę `design_id` + ilości, `buyer_id`. Losuje dostępne sztuki, ustawia status `purchased`, generuje QR tokeny (jeśli jeszcze nie wygenerowane).

2. **`register-postcard`** — wywoływane przez obdarowanego po skanie QR. Przyjmuje `qr_token`, `recipient_name`, `recipient_message`, `recipient_email` (opcjonalny). Waliduje token, sprawdza status=purchased, ustawia status=registered.

### Widoki SQL (bezpieczeństwo)

- **`postcards_public`** — widok publiczny pokazujący tylko: kraj, wzór, buyer_display_name, status, registered_at (bez emaili, tokenów QR, order_reference)
- **`postcards_country_stats`** — agregacja po krajach do mapy

### Strona QR i flow rejestracji

Nowa strona `/r/:qr_token`:
- Pobiera dane kartki przez edge function (nie bezpośrednio z bazy)
- Pokazuje imię Podróżnika i wzór kartki
- Formularz: imię, krótka wiadomość, opcjonalny email
- Nie wymaga logowania/rejestracji konta

### Seedowanie danych

Edge function lub migracja SQL do wygenerowania:
- 50 rekordów w `countries`
- 500 rekordów w `designs` (placeholder nazwy widoków)
- 5000 rekordów w `postcards` ze statusem `available` i unikalnymi `qr_token`

### Aktualizacja kodu frontendowego

- Przebudowa `RegisterPostcardForm` → usunięcie (kupowanie odbywa się przez WooCommerce)
- Nowa strona `/r/:qr_token` do rejestracji kartki przez obdarowanego
- Aktualizacja `MyPostcards` do nowych pól (design_id + join z designs/countries)
- Aktualizacja `UserStats` do nowych statusów (purchased/registered)
- Aktualizacja `DistributionMap` do pobierania z nowego widoku
- Aktualizacja `PlatformStats` do nowych kolumn

### Kolejność implementacji

1. Migracja: nowe tabele `countries`, `designs`, przebudowa `postcards`
2. Migracja: widoki publiczne, triggery, seedowanie 5000 kartek
3. Edge function: `register-postcard`
4. Edge function: `assign-postcards` (webhook WooCommerce)
5. Strona `/r/:qr_token` — formularz rejestracji obdarowanego
6. Aktualizacja komponentów dashboard (MyPostcards, UserStats)
7. Aktualizacja komponentów landing page (PlatformStats, DistributionMap)

