import { useState } from 'react';

export default function Page() {
  // Stav pro interaktivní kalkulačku
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000); // v CZK
  const [horizon, setHorizon] = useState(10); // v letech

  // Stav pro lead magnet formulář
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Zjednodušená simulace výpočtu pro ETF (VOO, QQQ, SCHD)
  // Předpokládaný hrubý roční výnos před poplatky: VOO (9%), QQQ (11%), SCHD (8%)
  const calculateReturns = (annualRate, ter) => {
    const totalMonths = horizon * 12;
    const netRate = annualRate - ter;
    const monthlyRate = netRate / 100 / 12;
    
    let futureValue = 0;
    for (let i = 0; i < totalMonths; i++) {
      futureValue = (futureValue + monthlyInvestment) * (1 + monthlyRate);
    }
    
    const totalInvested = monthlyInvestment * totalMonths;
    const grossProfit = futureValue - totalInvested;
    // Zohlednění 15% daně z výnosů/dividend (zjednodušeně pro ilustraci)
    const netProfit = grossProfit * 0.85; 
    const finalAmount = totalInvested + netProfit;

    return {
      finalAmount: Math.round(finalAmount),
      totalInvested: Math.round(totalInvested),
      netProfit: Math.round(netProfit),
    };
  };

  const voo = calculateReturns(9.0, 0.03);
  const qqq = calculateReturns(11.0, 0.20);
  const schd = calculateReturns(8.0, 0.06);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. HERO SECTION */}
      <header className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Aktualizované pre rok 2026 • Dáta z SEC & Yahoo Finance
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Porovnanie TOP 3 US ETF <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              pre českých a slovenských investorov (2026)
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            VOO vs. QQQ vs. SCHD: Ako na poplatky, 15% zrážkovú daň z dividend (formulár W-8BEN) a časový test / osvobození od daně.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Nulové vstupné poplatky
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Detailná analýza nákladov (TER)
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Optimalizácia daní
            </div>
          </div>

        </div>
      </header>

      {/* 2. INTERAKTIVNA KALKULAČKA DANE A POPLATKOV */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Interaktívna kalkulačka výnosov</h2>
            <p className="text-slate-400 text-sm">
              Porovnajte celkový čistý stav majetku po zohľadnení TER poplatkov a 15% zrážkovej dane (pri podpísanom W-8BEN).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Slider 1: Měsíční investice */}
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Mesačná investícia</label>
                <span className="text-emerald-400 font-bold text-lg">{monthlyInvestment.toLocaleString()} CZK</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="1000"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
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
                <label className="text-sm font-medium text-slate-300">Investičný horizont</label>
                <span className="text-emerald-400 font-bold text-lg">{horizon} {horizon === 1 ? 'rok' : horizon < 5 ? 'roky' : 'rokov'}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 rok</span>
                <span>15 rokov</span>
                <span>30 rokov</span>
              </div>
            </div>
          </div>

          {/* Výsledkové karty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* VOO */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0.03%
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Vanguard VOO</h3>
                <p className="text-xs text-slate-400 mb-4">S&P 500 Index (Core Growth)</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Vložené celkom:</span>
                    <span className="font-medium text-slate-300">{voo.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (po dani):</span>
                    <span className="font-medium text-emerald-400">+{voo.netProfit.toLocaleString()} CZK</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolio:</div>
                <div className="text-xl font-extrabold text-white">{voo.finalAmount.toLocaleString()} CZK</div>
              </div>
            </div>

            {/* QQQ */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0.20%
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Invesco QQQ</h3>
                <p className="text-xs text-slate-400 mb-4">Nasdaq-100 (Tech Focus)</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Vložené celkom:</span>
                    <span className="font-medium text-slate-300">{qqq.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (po dani):</span>
                    <span className="font-medium text-emerald-400">+{qqq.netProfit.toLocaleString()} CZK</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolio:</div>
                <div className="text-xl font-extrabold text-white">{qqq.finalAmount.toLocaleString()} CZK</div>
              </div>
            </div>

            {/* SCHD */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-bl-lg font-mono">
                TER: 0.06%
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Schwab SCHD</h3>
                <p className="text-xs text-slate-400 mb-4">US Dividend Equity</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Vložené celkom:</span>
                    <span className="font-medium text-slate-300">{schd.totalInvested.toLocaleString()} CZK</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Čistý zisk (po dani):</span>
                    <span className="font-medium text-emerald-400">+{schd.netProfit.toLocaleString()} CZK</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">Celková hodnota portfolio:</div>
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
                Stiahnite si kompletné PDF porovnanie + Excel kalkulačku zdaňovania
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
                Získajte detailný manuál pre správne vyplnenie formulára W-8BEN, podrobné srovnanie nákladov a prehľad legislatívy pre rok 2026.
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    required
                    placeholder="Váš e-mail (napr. jan@primlad.cz)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/25 text-sm whitespace-nowrap cursor-pointer"
                  >
                    Získať porovnanie zadarmo
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Žiadny spam. Iba PDF prehľad a Excel kalkulačka. Odhlásiť sa môžete kedykoľvek.
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
              <h3 className="text-2xl font-bold text-white">Skvelé, materiály sú pripravené!</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Odkaz na stiahnutie PDF a Excel kalkulačky sme odoslali na adresu <span className="text-emerald-400 font-medium">{email}</span>.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => alert('Simulácia: Sťahovanie PDF a Excelu spustené...')}
                  className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/25 text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Stiahnuť PDF ihned
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
            Zdroje dát: SEC Filings (Form 10-K), Yahoo Finance. Údaje majú iba informatívny charakter.
          </p>
          <p className="text-slate-400">
            Upozornenie: Nie je investičným odporučením. Investovanie do cenných papierov prináša riziko straty kapitálu. Minulé výnosy nie sú zárukou budúcich výsledkov.
          </p>
          <p className="pt-2 text-slate-400">
            © 2026 ETF Porovnávač. Všetky práva vyhradené.
          </p>
        </div>
      </footer>

    </div>
  );
}