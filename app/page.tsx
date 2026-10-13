'use client'
import { useState, useEffect, useRef } from 'react';

// 1. Univerzálna funkcia pre trackovanie eventov (gtag -> fallback konzola)
function trackEvent(eventName: string, eventData: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, eventData);
  } else {
    // Fallback - log do konzoly pre vývoj/test
    // eslint-disable-next-line no-console
    console.log(`[Analytics][${eventName}]`, eventData);
  }
}

export default function Page() {
  // Stav pro interaktivní kalkulačku
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000); // v CZK
  const [horizon, setHorizon] = useState(10); // v letech

  // Stav pro lead magnet formulář
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Nový stav na variant v hero sekcii
  const [variant, setVariant] = useState<'taxes' | 'wealth'>('taxes');

  // Ref pre jednoduché "run once" sledovanie focusu
  const formStarted = useRef(false);

  // 2. Sledovanie page_view + variant/referrer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('variant');
      const variantValue = v === 'wealth' ? 'wealth' : 'taxes';
      setVariant(variantValue);
      trackEvent('page_view', {
        variant: variantValue,
        referrer: document.referrer || null,
        path: window.location.pathname + window.location.search,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mapovanie premenných pre nadpisy podľa variantu
  const headings: Record<
    'taxes' | 'wealth',
    { h1: string; subtitle: string }
  > = {
    taxes: {
      h1: 'Platíte 15 % nebo 35 % z amerických dividend?',
      subtitle:
        'Srovnání VOO, QQQ a SCHD pro české investory. Zjistěte, jak správně využít zamezení dvojímu zdanění a neplatit zbytečné poplatky.',
    },
    wealth: {
      h1: 'VOO vs. QQQ vs. SCHD: Které ETF buduje bohatství nejrychleji?',
      subtitle:
        'Porovnali jsme reálné zhodnocení a poplatky českých investorů za posledních 10 let.',
    },
  };

  // 🟩 Nové hodnoty dividendových výnosov (% ročne)
  const dividendYields: Record<'VOO' | 'QQQ' | 'SCHD', number> = {
    VOO: 1.3,
    QQQ: 0.6,
    SCHD: 3.4,
  };

  // 🟩 Upravený výpočet podľa časového testu a dividend
  // TER stále zohľadňuje nákladovosť, ale zdanenie kapitálového zisku = 0
  // Ročný výnos = capital appreciation + dividend yield
  // Capital gain je po 3+ rokoch oslobodený od dane
  // Na dividendách vďaka W-8BEN je rozdiel 20% (35% vs 15%) – treba ukázať CZK úsporu!
  const calculateReturns = (
    annualRate: number,
    ter: number,
    dividendYield: number
  ) => {
    const totalMonths = horizon * 12;
    const netAppreciationRate = annualRate - ter; // čistý rast ceny
    const totalInvested = monthlyInvestment * totalMonths;

    // Výpočet budúcej hodnoty investície (len z capital appreciation)
    let futureValue = 0;
    for (let i = 0; i < totalMonths; i++) {
      futureValue = (futureValue + monthlyInvestment) * (1 + netAppreciationRate / 100 / 12);
    }

    // Výpočet čistého zisku (oslobodeného od dane), časový test splnený
    const netProfit = futureValue - totalInvested;

    // Výpočet dividend za celé obdobie (obe zdanenia: s W-8BEN aj bez W-8BEN)
    let totalDividends = 0;
    let dividendsWithTreatyCZK = 0;
    let dividendsNoTreatyCZK = 0;
    let monthlyDividendRate = dividendYield / 100 / 12;

    // Priemerný stav majetku každý mesiac (dividenda vyplácaná mesačne z priemernej hodnoty)
    // Simulujeme linearizovane: každý mesiac pridaný vklad + zhodnotená hodnota
    let portfolio = 0;
    for (let i = 0; i < totalMonths; i++) {
      portfolio = (portfolio + monthlyInvestment) * (1 + netAppreciationRate / 100 / 12);
      const thisMonthDividend = portfolio * monthlyDividendRate;
      totalDividends += thisMonthDividend;
      // S W-8BEN: zdanené 15%
      dividendsWithTreatyCZK += thisMonthDividend * 0.85;
      // Bez W-8BEN: zdanené 35%
      dividendsNoTreatyCZK += thisMonthDividend * 0.65;
    }
    // Ročná úspora je úspora na dani z dividend za rok (čiže mesačné portfólio po roku)
    // Tu zbierame rozdiel medzi 35% a 15% zdanením na vyplatených dividendach
    let lastYearCZK = 0;
    let lastYearTreaty = 0;
    let lastYearNoTreaty = 0;
    portfolio = 0;
    for (let i = 0; i < 12; i++) {
      portfolio = (portfolio + monthlyInvestment) * (1 + netAppreciationRate / 100 / 12);
      const divVal = portfolio * monthlyDividendRate;
      lastYearCZK += divVal;
      lastYearTreaty += divVal * 0.85;
      lastYearNoTreaty += divVal * 0.65;
    }
    const w8benAnnualSavings = lastYearTreaty - lastYearNoTreaty;

    return {
      finalAmount: Math.round(futureValue + dividendsWithTreatyCZK),
      totalInvested: Math.round(totalInvested),
      netProfit: Math.round((futureValue + dividendsWithTreatyCZK) - totalInvested),
      w8benAnnualSavings: Math.round(w8benAnnualSavings),
    };
  };

  // 🟩 Pre každé ETF použijeme správny dividendYield
  const voo = calculateReturns(9.0, 0.03, dividendYields.VOO);
  const qqq = calculateReturns(11.0, 0.20, dividendYields.QQQ);
  const schd = calculateReturns(8.0, 0.06, dividendYields.SCHD);

  // 3. Sledovanie zmien posuvníkov kalkulačky
  const handleInvestmentChange = (val: number) => {
    setMonthlyInvestment(val);
    trackEvent('calculator_interaction', {
      type: 'monthly_investment',
      value: val,
      horizon,
      variant,
    });
  };
  const handleHorizonChange = (val: number) => {
    setHorizon(val);
    trackEvent('calculator_interaction', {
      type: 'horizon',
      value: val,
      monthlyInvestment,
      variant,
    });
  };

  // 4. Sledovanie začatia formulára (onFocus, len raz)
  const handleFormStart = () => {
    if (!formStarted.current) {
      formStarted.current = true;
      trackEvent('form_start', { variant });
    }
  };

  // 5. Sledovanie generate_lead pri submit
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      trackEvent('generate_lead', {
        email,
        variant,
        time: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. HERO SECTION */}
      <header className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950 pt-6 pb-10 lg:pt-8 lg:pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Aktualizováno pro rok 2026 • Data z SEC & Yahoo Finance
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            {headings[variant].h1}
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            {headings[variant].subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Žádné vstupní poplatky
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Detailní analýza nákladů (TER)
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Daňová optimalizace
            </div>
          </div>

        </div>
      </header>

      {/* 2. INTERAKTIVNÍ KALKULAČKA DANÍ A POPLATKŮ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Interaktivní kalkulačka výnosů</h2>
            <p className="text-slate-400 text-sm">
              Porovnejte celkový čistý stav majetku po zohlednění TER a 15% srážkové daně z dividend (při vyplněném formuláři W-8BEN).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Slider 1: Měsíční investice */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Měsíční investice</label>
                <span className="text-emerald-400 font-bold text-lg">{monthlyInvestment.toLocaleString()} CZK</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={monthlyInvestment}
                onChange={(e) => handleInvestmentChange(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 000 CZK</span>
                <span>25 000 CZK</span>
                <span>50 000 CZK</span>
              </div>
            </div>

            {/* Slider 2: Investiční horizont */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Investiční horizont</label>
                <span className="text-emerald-400 font-bold text-lg">
                  {horizon} {horizon === 1 ? 'rok' : (horizon >= 2 && horizon <= 4) ? 'roky' : 'let'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={horizon}
                onChange={(e) => handleHorizonChange(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 rok</span>
                <span>15 let</span>
                <span>30 let</span>
              </div>
            </div>
          </div>

          {/* Výsledkové karty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* VOO */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0,03 %
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Vanguard VOO</h3>
                <p className="text-xs text-slate-400 mb-4">S&P 500 Index (Core Growth)</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Celkem investováno:</span>
                    <span className="font-medium text-slate-300">{voo.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (osvobozeno od daně):</span>
                    <span className="font-medium text-emerald-400">+{voo.netProfit.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Roční úspora díky W-8BEN:</span>
                    <span className="font-medium text-emerald-300">
                      +{voo.w8benAnnualSavings.toLocaleString()} CZK/rok
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolia:</div>
                <div className="text-xl font-extrabold text-white">{voo.finalAmount.toLocaleString()} CZK</div>
              </div>
            </div>

            {/* QQQ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0,20 %
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Invesco QQQ</h3>
                <p className="text-xs text-slate-400 mb-4">Nasdaq-100 (Tech Focus)</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Celkem investováno:</span>
                    <span className="font-medium text-slate-300">{qqq.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (osvobozeno od daně):</span>
                    <span className="font-medium text-emerald-400">+{qqq.netProfit.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Roční úspora díky W-8BEN:</span>
                    <span className="font-medium text-emerald-300">
                      +{qqq.w8benAnnualSavings.toLocaleString()} CZK/rok
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolia:</div>
                <div className="text-xl font-extrabold text-white">{qqq.finalAmount.toLocaleString()} CZK</div>
              </div>
            </div>

            {/* SCHD */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0,06 %
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Schwab SCHD</h3>
                <p className="text-xs text-slate-400 mb-4">US Dividend Equity</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Celkem investováno:</span>
                    <span className="font-medium text-slate-300">{schd.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (osvobozeno od daně):</span>
                    <span className="font-medium text-emerald-400">+{schd.netProfit.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Roční úspora díky W-8BEN:</span>
                    <span className="font-medium text-emerald-300">
                      +{schd.w8benAnnualSavings.toLocaleString()} CZK/rok
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolia:</div>
                <div className="text-xl font-extrabold text-white">{schd.finalAmount.toLocaleString()} CZK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. & 4. LEAD MAGNET FORMULÁŘ / THANK-YOU STATE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {!isSubmitted ? (
            <>
              <div className="inline-block p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Stáhněte si kompletní PDF srovnání + Excel kalkulačku zdanění
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
                Získejte detailní návod na správné vyplnění formuláře W-8BEN, podrobné srovnání nákladů a přehled legislativy pro rok 2026.
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Váš e-mail (např. jan@primlad.cz)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleFormStart}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/25 text-sm whitespace-nowrap cursor-pointer"
                  >
                    Získat srovnání zdarma
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Žádný spam. Jen PDF shrnutí a Excel kalkulačka. Odhlásit se můžete kdykoliv.
                </p>
              </form>
            </>
          ) : (
            <div className="py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Skvělé, materiály jsou připravené!</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Odkaz ke stažení PDF a Excel kalkulačky jsme odeslali na adresu <span className="text-emerald-400 font-medium">{email}</span>.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => alert('Simulace: Stahování PDF a Excelu spuštěno...')}
                  className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/25 text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Stáhnout PDF ihned
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto space-y-3">
          <p>
            Zdroj dat: SEC Filings (Form 10-K), Yahoo Finance. Údaje slouží pouze pro informaci.
          </p>
          <p className="text-slate-400">
            Upozornění: Nejde o investiční doporučení. Investování do cenných papírů je spojeno s rizikem ztráty kapitálu. Minulé výnosy nejsou zárukou budoucích výsledků.
          </p>
          {/* Podrobná poznámka k výpočtům podle legislativy ČR/SR */}
          <div className="text-[11px] text-slate-500 mt-2 mb-0 space-y-1">
            <div>
              Metodika výpočtu: Kapitálový zisk je osvobozen od daně z příjmů (0 %) na základě splnění 3letého časového testu pro cenné papíry v ČR/SR.
            </div>
            <div>
              Úspora na dani z dividend (W-8BEN): Udává roční rozdíl mezi 35% srážkovou daní (bez W-8BEN) a 15% smluvní daní (s W-8BEN).
            </div>
          </div>
          <p className="pt-2 text-slate-400">
            © 2026 ETF Srovnávač. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>

    </div>
  );
}