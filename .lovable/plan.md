

## Analiza spójności: specyfikacja z pliku vs kod w aplikacji

### Podsumowanie

Specyfikacja z ChatGPT i obecna implementacja sa w duzej mierze **spójne**. Oto szczegółowa analiza:

---

### Elementy SPÓJNE (poprawnie zaimplementowane)

| Element ze spec | Status w kodzie |
|---|---|
| **Dwa statusy w `inventory_units`**: `fulfillment_status` (operacyjny) + `business_status` (biznesowy) | Zaimplementowane poprawnie w bazie |
| **`fulfillment_status` enumy**: `in_stock`, `reserved`, `qr_generated`, `qr_applied`, `shipped`, `voided`, `damaged` | Zgodne z enumem w bazie |
| **`business_status`**: `purchased` / `registered` (bez `wręczona`) | Zgodne — spec mówi "usunmy status wreczona" |
| **`inventory_units` kluczowe pola**: `card_design_id`, `traveler_user_id`, `order_id`, `order_item_id`, `public_claim_code`, `public_claim_token_hash`, `qr_generated_at`, `shipped_at`, `registered_at` | Wszystkie obecne w tabeli |
| **`recipient_registrations`**: `inventory_unit_id` (UNIQUE), `recipient_name`, `message`, `email`, `contact_opt_in` | Zgodne (pola: `recipient_name`, `recipient_message`, `recipient_email`, `contact_opt_in`) |
| **`inventory_unit_events`**: audit log z `event_type`, `actor_type`, `actor_id`, `payload_json` | Zaimplementowane |
| **`card_designs`**: `country_id`, `language_code`, `view_no`, `title`, `thank_you_text`, `image_front_url`, `active` | Zgodne |
| **`countries`**: `iso2`, `iso3`, `name_pl`, `slug`, `active` | Zgodne (dodano `active` i `iso3`) |
| **`orders` + `order_items` + `shipments`** | Wszystkie tabele istnieja z poprawnymi polami |
| **`stock_batches`** | Zaimplementowane |
| **`qr_print_jobs` + `qr_print_job_items`** | Zgodne ze spec |
| **Role**: `traveler`, `admin` w osobnej tabeli `user_roles` | Poprawnie (enum `app_role` + osobna tabela) |
| **Panel podróżnika — statystyki**: kupione, zarejestrowane, % skuteczności, per kraj | `UserStats.tsx` pokazuje: "Wszystkie kartki", "Kupione (aktywne)", "Zarejestrowane", "% Rejestracji" + statystyki per kraj |
| **Gamifikacja**: `total_points`, `current_rank` w `profiles` | Zaimplementowane z triggerami |
| **Formuła punktów**: `(units*10) + (countries*50) + (registrations*100)` | Funkcja `calculate_user_impact_points` w bazie — zgodna |
| **Rangi**: Zwiadowca (<500), Ambasador (<2500), Misjonarz Kultury (<7500), Legenda Podróżówki (>=7500) | Zgodne w DB i w komponentach frontend |
| **QR prowadzi do `/claim/...` z tokenem** | Edge function `register-postcard` obsługuje to |

---

### Drobne RÓŻNICE (nie-krytyczne)

| Element | Spec | Kod | Ocena |
|---|---|---|---|
| **`internal_inventory_code` format** | Spec: `UNIT-CN-04-2026-000123` | Kod: `INV-[ISO2]-V[XX]-[YYY]` | Drobna różnica nazewnictwa — logika jest ta sama |
| **`public_claim_code` format** | Spec: `PDZ-7KQ4-9MX2` | Kod: `PDZ-XXXX-XXXX` (funkcja `generate_claim_code`) | Zgodne co do struktury |
| **Lifecycle operacyjny** | Spec: `in_stock -> reserved -> qr_generated -> qr_applied -> shipped` | Kod: ten sam flow + trigger `on_shipment_shipped` | Zgodne. Spec wspomina o `packed` ale potem go sam usuwa |
| **`stock_batches` pola** | Spec: `total_units`, `received_at`, `notes` | Kod: `quantity`, `name`, `description` | Nazwy inne, funkcja ta sama |
| **Profil - `postcards_given`** | Spec wcześniej miała to pole | Kod ma `postcards_purchased`, `postcards_received` | Zgodne z finalną decyzją (usunięto "wręczona") |

---

### Wnioski

Kod aplikacji jest **spójny ze specyfikacją**. Kluczowe decyzje architektoniczne (dwa statusy biznesowy/operacyjny, brak statusu "wręczona", QR per sztuka, model magazynowy per unit, rejestracja obdarowanego) zostały poprawnie przełożone na implementację. Różnice dotyczą wyłącznie konwencji nazewniczych, które nie wpływają na logikę.

Jedynym elementem, który jest w spec ale nie w kodzie, jest **email notification do Podróżnika** gdy ktoś zarejestruje kartkę — ale to jest opisane jako "najlepiej też maila", więc jest to feature do wdrożenia w przyszłości.

