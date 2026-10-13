# ETF Porovnávač (VOO vs. QQQ vs. SCHD) – Landing Page

Konverzná landing page vytvorená pre českých a slovenských drobných investorov prichádzajúcich z mobilnej reklamy. Page funguje ako **lead magnet**: najprv používateľovi poskytne hodnotu vo forme interaktívnej kalkulačky výnosov a daňových úspor a až následne ponúka na stiahnutie detailný PDF manuál a Excel kalkulačku výmenou za e-mailový kontakt.

🚀 **Živá aplikácia (Vercel):** https://etf-kappa-eosin.vercel.app/

- **Variant A (Dane):** `https://etf-kappa-eosin.vercel.app/?variant=taxes`
- **Variant B (Bohatstvo):** `https://etf-kappa-eosin.vercel.app/?variant=wealth`

---

## 🎯 1. Cieľová skupina & Lead Magnet

- **Cieľová skupina:** Drobní investori z ČR/SR (vek 25–45 rokov), ktorí investujú alebo chcú začať investovať do amerických ETF (VOO, QQQ, SCHD) prostredníctvom moderných brokerov (Trading 212, XTB, Interactive Brokers).
- **Potreby a bolestné body:** Optimalizácia poplatkov (TER), neprehľadná daňová legislatíva a nesprávne uplatňovanie zamedzenia dvojitého zdanenia (rozdiel medzi 35 % a 15 % daňou z US dividend).
- **Lead Magnet (Hodnota pre používateľa):** Kompletný PDF manuál pre správne vyplnenie formulára W-8BEN, podrobné porovnanie nákladov a Excel kalkulačka zdaňovania pre rok 2026.
- **Moment požiadania o kontakt:** O e-mail požiadame **až po tom**, čo si návštevník interaktívne vyskúša kalkulačku a uvidí vypočítanú ročnú finančnú úsporu v CZK vďaka W-8BEN. Hodnota je jasná ešte pred vyplnením formulára.

---

## 📢 2. Návrh dvoch verzií reklamy

- **Verzia A (Zameraná na dane a W-8BEN):**
  - **Nadpis:** _Platíte 15 % nebo 35 % z US dividend?_
  - **Text:** _Zistite, ako českí a slovenskí investori strácajú peniaze na zlej dani z US dividend. Stiahnite si bezplatný manuál k W-8BEN a Excel kalkulačku._
  - **Target URL:** `/?variant=taxes`

- **Verzia B (Zameraná na rast bohatstva a výnosy):**
  - **Nadpis:** _VOO vs. QQQ vs. SCHD: Které ETF buduje bohatství nejrychleji?_
  - **Text:** _Porovnali sme reálne výnosy, TER poplatky a daňové zaťaženie za posledných 10 let. Vyskúšajte interaktívnu kalkulačku._
  - **Target URL:** `/?variant=wealth`

---

## 📐 3. Odôvodnenie poradia sekcií (UX & CRO)

Poradie sekcií je navrhnuté na základe AIDA modelu (Attention, Interest, Desire, Action):

1. **Hero sekcia (Attention & Relevance):** Návštevník z reklamy okamžite vidí dynamický nadpis presne zodpovedajúci prísľubu z inzerátu. Dôveryhodné štítky (SEC Filings, Yahoo Finance) budujú okamžitú kredibilitu.
2. **Interaktívna kalkulačka výnosov a úspor (Interest & Value First):** Namiesto statického textu dostane používateľ interaktívny nástroj. Okamžite vidí výsledky pre VOO, QQQ a SCHD aj s vyčíslovanou ročnou úsporou W-8BEN.
3. **Lead Magnet formulár / Thank-You state (Desire & Action):** Ponuka stiahnutia PDF/Excelu prichádza až po zobrazení hodnoty. Formulár vyžaduje iba 1 pole (e-mail) pre minimálne trenie. Po odoslaní okamžite prechádza do Thank-You stavu.
4. **Footer a disclaimery (Compliance):** Umiestnené na konci, aby nerušili konverzný tok, no spĺňajú legislatívne požiadavky (časový test, riziko investovania, zdroje dát).

---

## 💡 4. Finančná a daňová logika (ČR / SR)

- **Časový test (0 % daň):** V kalkulačke uplatňujeme 0% daň z kapitálového zisku pri predaji, čo zodpovedá splneniu 3-ročného časového testu pre cenné papiere v ČR a SR (dovysvetlené vo footri).
- **Úspora W-8BEN (15 % vs. 35 %):** Kalkulačka započítava ročný dividendový výnos (VOO: 1,3 %, QQQ: 0,6 %, SCHD: 3,4 %) a vyčísľuje ročnú úsporu v CZK pri uplatnení zmluvy o zamedzení dvojitého zdanenia.
- **Nákladovosť (TER):** Zapčítaná reálna nákladovosť fondov (VOO: 0,03 %, QQQ: 0,20 %, SCHD: 0,06 %).

---

## 📈 5. Očakávaná konverzia & A/B Test Hypotézy

- **Cieľová konverzná miera (Conversion Rate):** **4,5 % – 6,5 %** _(založená na vysoko cielenom mobilnom traffiku, 1-políčkovom formulári a hodnotovom prístupe)_.

### Hypotézy na A/B testovanie (zoradené podľa očakávaného dopadu):

1. **Hypotéza 1 (Najvyšší dopad) – Plávajúce CTA tlačidlo:** Pridanie plávajúceho tlačidla _"Stiahnuť prepočet v PDF"_ pri interakcii s kalkulačkou zvýši konverziu o **15–20 %**, keďže používateľ nemusí scrollovať nižšie.
2. **Hypotéza 2 – Personalizácia výstupu na e-mail:** Ponuka odoslania nameraných výsledkov z kalkulačky priamo na e-mail zvyšuje motiváciu na zanechanie kontaktu o **10 %**.
3. **Hypotéza 3 – Social Proof nad formulárom:** Pridanie indikátora (napr. _"Tento týždeň si manuál stiahlo už 420 investorov"_) zvýši dôveryhodnosť a konverziu o **5–8 %**.

---

## 🛠️ 6. Technická architektúra & Event Tracking

- **Event Tracking:** Implementovaný 4-krokový lievik (`page_view` s variantom a referrerom, `calculator_interaction`, `form_start`, `generate_lead`) s fallbackom do konzoly a pripravenou integráciou pre Google Analytics 4 (`gtag`).
- **Nasadenie:** Vercel Hosting (Next.js App Router).

### Odporúčania pre ďalší vývoj (Production Roadmap):

- **Routing:** Do budúcna nahradiť `window.location.search` za Next.js hook `useSearchParams()` zabalený v `<Suspense>`.
- **Kódová architektúra:** Vyčleniť kalkulačku do samostatného klientskeho komponentu (`components/Calculator.tsx`) pre lepšiu modularitu a SSR optimalizáciu.
- **Assets:** Pomenovanie obrázkových assetov upraviť na štandardizovaný format bez medzier a diakritiky (napr. `porovnanie-etf-dane-vynosy.png`).
