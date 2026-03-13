

# Rozbudowa Polityki Prywatności — zgodność z RODO

## Co robimy
Rozbudowujemy stronę `src/pages/PrivacyPolicy.tsx` o pełną treść polityki prywatności zgodną z RODO (Rozporządzenie UE 2016/679) oraz polskimi przepisami o ochronie danych osobowych, wzorując się na strukturze z przykładowej strony.

## Zakres zmian

**Jeden plik**: `src/pages/PrivacyPolicy.tsx`

Obecna treść (6 krótkich sekcji) zostanie zastąpiona rozbudowaną polityką zawierającą następujące sekcje:

1. **Administrator danych** — pełna nazwa projektu Podróżówka, dane kontaktowe (kontakt@podrozowka.pl)
2. **Podstawa prawna** — odwołanie do RODO (Rozporządzenie PE i Rady UE 2016/679 z 27.04.2016), ustawy o ochronie danych osobowych
3. **Jakie dane zbieramy** — rozszerzona lista: dane konta, zamówień, rejestracji pocztówek, lokalizacji, dane techniczne (IP, przeglądarka, cookies)
4. **Cele przetwarzania** — z odwołaniami do artykułów RODO:
   - Realizacja umowy (art. 6 ust. 1 lit. b RODO)
   - Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)
   - Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)
   - Obowiązki prawne (art. 6 ust. 1 lit. c RODO)
5. **Przekazywanie danych** — lista kategorii odbiorców (hosting, IT, płatności, logistyka)
6. **Bezpieczeństwo danych** — szyfrowanie SSL, ograniczony dostęp, monitoring
7. **Twoje prawa (RODO)** — pełna lista z artykułami:
   - Prawo dostępu (art. 15)
   - Prawo sprostowania (art. 16)
   - Prawo usunięcia / bycia zapomnianym (art. 17)
   - Prawo ograniczenia przetwarzania (art. 18)
   - Prawo przenoszenia danych (art. 20)
   - Prawo sprzeciwu (art. 21)
   - Prawo skargi do PUODO (art. 77)
   - Prawo wycofania zgody
8. **Czas przechowywania danych** — do cofnięcia zgody, przepisy podatkowe/rachunkowe
9. **Przekazywanie do państw trzecich** — informacja o zabezpieczeniach
10. **Profilowanie** — informacja o braku zautomatyzowanego profilowania
11. **Pliki cookies** — rozbudowana sekcja: rodzaje (sesyjne/stałe), cele, zarządzanie w przeglądarce
12. **Postanowienia końcowe** — charakter informacyjny, kontakt, zmiany polityki

Layout i styl strony (Header, Footer, `prose` container) pozostają bez zmian.

