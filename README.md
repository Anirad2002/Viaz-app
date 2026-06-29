# Viaz — Platforma Analizy Danych

> Zadanie rekrutacyjne — Frontend Developer

W pełni funkcjonalny prototyp frontendu zbudowany w **Vue 3 + Vuestic UI**, implementujący kreator onboardingu, zarządzanie skanami, panel główny i przeglądarkę raportów dla platformy do wykrywania wrażliwych danych.

---

## Uruchomienie projektu

```bash
npm install
npm run dev       # serwer deweloperski na http://localhost:5173
npm run build     # build produkcyjny → dist/
npm run preview   # podgląd builda produkcyjnego
```

Brak backendu — wszystkie dane są mockowane lokalnie w `src/data/mock.js`.

> **Uwaga:** Kod źródłowy znajduje się w folderze `src/`. Folder `dist/` zawiera zminifikowany build produkcyjny.

---

## Co zostało zbudowane

### A — Kreator onboardingu 

1. **Powitanie** — ekran hero z logo, hasłem przewodnim, podglądem kroków i CTA
2. **Połącz źródło** — 8 typów źródeł (PostgreSQL, S3, Google Drive…), formularz z symulowanym testem połączenia (bezczynny → łączenie → sukces/błąd z opóźnieniem 1,8 s)
3. **Skonfiguruj zakres** — wybór kategorii (Dane osobowe, Dane finansowe, Zdrowie, Poświadczenia, Umowy, Akta HR), głębokość skanu (Szybki/Standardowy/Głęboki), harmonogram (jednorazowo/tygodniowo/miesięcznie)
4. **Przejrzyj i uruchom** — podsumowanie wszystkich wyborów przed potwierdzeniem
5. **Postęp skanu** — animowany pasek postępu, przewijany log konsolowy z datownikami i typami wiadomości, podgląd wstępnych wyników po 60%, podsumowanie zakończenia z CTA do panelu lub szczegółów skanu

### B — Skany 

- Lista z wyszukiwaniem i filtrem statusu
- Kolorowe chipy statusu z animowaną pulsującą kropką dla aktywnych skanów
- Minipasek postępu w tabeli dla skanów w toku
- Modal szybkiego startu do dodania skanu z poziomu listy
- Widok szczegółu: karta postępu dla aktywnych, karta błędu dla nieudanych, wiersz statystyk + filtrowalna tabela wyników dla zakończonych

### C — Panel główny 

- 6 kart KPI ze wskaźnikami trendu
- Wykres słupkowy — wykryte elementy w czasie (widok 6-miesięczny)
- Wykres pierścieniowy — rozkład ryzyka (czysty SVG, bez zewnętrznej biblioteki)
- Poziome paski — elementy według kategorii
- Kanał ostatniej aktywności z kolorowym oznaczeniem typów zdarzeń

### D — Raporty 

- Siatka kart z chipami statusu i podglądami opisów
- Dwuetapowy kreator generowania: wybierz skan → edytuj sekcje → zapisz
- Edytor sekcji: tekst wypełniany automatycznie z danych skanu, możliwość edycji każdego pola, usunięcia lub dodania nowej sekcji
- Widok szczegółu zaprojektowany jako czytelny dokument: oznaczenie badge, duży tytuł, układ dwukolumnowy z numerowanymi sekcjami, duży interlinia

### Elementy przekrojowe

- Wspólny sidebar i topbar z obsługą aktywnego stanu routingu
- Przełącznik trybu jasnego/ciemnego (system tokenów CSS, brak hardkodowanych kolorów)
- Responsywność: sidebar ukrywa się na mobile, siatki przepływają, tabele ukrywają drugorzędne kolumny
- Daty w formacie `pl-PL`

---

## Decyzje wizualne

**Paleta — głęboki indygo na prawie czarnym tle**

| Nazwa | Hex | Zastosowanie |
|---|---|---|
| Podstawowy | `#6366f1` | CTA, aktywne stany, akcenty |
| Poświata | `rgba(99,102,241,0.2)` | Tło zaznaczonych/aktywnych elementów |
| Tło | `#0f0f13` | Kanwa aplikacji |
| Powierzchnia | `#16161d` | Karty, sidebar |
| Powierzchnia-2 | `#1e1e28` | Wgłębienia, inputy, tło hover |
| Obramowanie | `#2a2a38` | Wszystkie separatory i kontury |
| Sukces | `#10b981` | Połączono, zakończono |
| Niebezpieczeństwo | `#ef4444` | Błędy, oznaczenia wysokiego ryzyka |
| Ostrzeżenie | `#f59e0b` | Średnie ryzyko, w toku |

Ciemna paleta to świadomy wybór dla narzędzia bezpieczeństwa i zgodności — użytkownicy tego typu aplikacji często pracują w słabym oświetleniu, przeglądają wyjście terminala i oczekują gęstego interfejsu. Jasne palety konsumenckich aplikacji SaaS byłyby tonalnie nieodpowiednie dla czegoś, co mówi „znaleźliśmy 305 rekordów wysokiego ryzyka w Twojej bazie danych". Indygo jako kolor podstawowy wyróżnia się na tle generycznego koloru turkusowego lub niebieskiego większości SaaS, pozostając jednocześnie profesjonalnym.

**Typografia**

- **Inter** — krój UI. Technicznie doskonały dla gęstego tekstu interfejsu, świetne renderowanie cyfr na małych rozmiarach. Używany do wszystkich etykiet, treści i nawigacji.
- **JetBrains Mono** — czcionka o stałej szerokości dla nazw pól, hostnamów, logów skanowania, liczb i wartości procentowych. Komunikuje „to są dane, nie proza" bez wizualnego obciążenia.

Brak dekoracyjnego kroju display, bo treść *jest* wyświetlaczem — znalezienie 1 842 wrażliwych rekordów samo w sobie jest dramatyczne.

**Charakterystyczny element — log skanu**

Przewijający się log w stylu konsoli w kroku postępu onboardingu to element, który zostaje w pamięci. Pożycza wizualny język, który użytkownicy kojarzą z „coś naprawdę się dzieje" (pipeline CI, buildy Docker, migracje baz danych). Kolorowany według typu wiadomości (info/sukces/ostrzeżenie), z datownikami, autoscrolling. Przekształca mock w coś, co *czuje się* jak live.

---

## Świadome kompromisy

**Co zostało dopracowane:**
- Kreator onboardingu ma największy poziom wykończenia: wszystkie 5 stanów, animowane przejścia między krokami, walidacja formularza, animowany test połączenia, symulacja live skanu
- Każdy ważny stan jest obsłużony: pusta lista, aktywny skan z postępem, nieudany skan z kartą błędu, trasy not-found

**Co zostało uproszczone:**
- Wykresy zbudowane w czystym SVG/CSS zamiast biblioteki. Oszczędza to zależność i zmniejsza rozmiar bundla, ale w buildzie produkcyjnym użyłabym Recharts lub Chart.js dla interaktywności, tooltipów i dostępności
- Brak persystencji localStorage — odświeżenie resetuje do onboardingu. Build produkcyjny przechowywałby `onboardingDone` w localStorage lub Pinia + plugin persist
- Brak TypeScript — zadanie określa go jako „mile widziany", nie wymagany; priorytetem było dostarczenie pełnego zakresu w dostępnym czasie
- Brak MSW — opóźnienia i przejścia stanów obsługiwane bezpośrednio przez `setTimeout`

**Mając więcej czasu, dorobiłabym:**
1. Pełną nawigację klawiaturową przez kroki onboardingu (Tab, Enter, Escape)
2. `<Suspense>` i właściwe szkielety ładowania dla każdej trasy async
3. Bibliotekę wykresów z tooltipami i animowanym wejściem
4. Stronę Ustawień do zarządzania połączonymi źródłami
5. Powiadomienia toast (Vuestic ma `useToast`) dla zdarzeń start/koniec skanu
6. Testy jednostkowe dla store i composables (Vitest)

---

## Struktura projektu

```
src/
├── components/
│   ├── AppLayout.vue        # Sidebar + topbar
│   ├── BlankLayout.vue      # Minimalne opakowanie dla onboardingu
│   └── StepProgress.vue     # Wskaźnik kroków z linią wypełnienia
├── data/
│   └── mock.js              # Wszystkie dane mock: skany, raporty, KPI, wykresy
├── router/
│   └── index.js             # Trasy vue-router z meta layoutu
├── stores/
│   └── app.js               # Pinia store: skany, raporty, tryb ciemny
├── views/
│   ├── OnboardingView.vue   # Kreator 5-krokowy
│   ├── DashboardView.vue    # KPI + wykresy + aktywność
│   ├── ScansView.vue        # Lista skanów z filtrem
│   ├── ScanDetailView.vue   # Postęp skanu + wyniki
│   ├── ReportsView.vue      # Siatka raportów + modal generowania
│   └── ReportDetailView.vue # Przeglądarka raportów w stylu dokumentu
└── App.vue                  # Korzeń z przełączaniem layoutu
```
