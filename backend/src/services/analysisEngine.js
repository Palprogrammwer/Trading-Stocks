function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function analyzeSnapshot(snapshot, criteria = defaultCriteria()) {
  const growth = clamp(snapshot.revenueGrowth * 2.2 + snapshot.earningsGrowth * 1.4 + snapshot.margin);
  const valuation = clamp(105 - snapshot.pe * 1.55 + snapshot.margin * 0.6);
  const trend = clamp(50 + snapshot.change * 7 + momentum(snapshot.chart));
  const risk = clamp(100 - snapshot.volatility * 1.05 - snapshot.debtToEquity * 9);

  const weighted =
    growth * criteria.growth +
    valuation * criteria.valuation +
    trend * criteria.trend +
    risk * criteria.risk;
  const totalWeight = criteria.growth + criteria.valuation + criteria.trend + criteria.risk;
  const score = clamp(weighted / totalWeight);

  return {
    ticker: snapshot.ticker,
    companyName: snapshot.name,
    asset: {
      ticker: snapshot.ticker,
      name: snapshot.name,
      exchange: snapshot.exchange,
      country: snapshot.country,
      currency: snapshot.currency,
      sector: snapshot.sector,
      website: snapshot.website,
      logoUrl: snapshot.logoUrl
    },
    generatedAt: new Date().toISOString(),
    score,
    verdict: verdictFor(score),
    pillars: { growth, valuation, trend, risk },
    metrics: {
      price: snapshot.price,
      change: snapshot.change,
      revenueGrowth: snapshot.revenueGrowth,
      earningsGrowth: snapshot.earningsGrowth,
      pe: snapshot.pe,
      margin: snapshot.margin,
      marketCap: snapshot.marketCap,
      debtToEquity: snapshot.debtToEquity,
      volatility: snapshot.volatility,
      premiumMetrics: {
        beta: snapshot.beta,
        freeCashFlowYield: snapshot.freeCashFlowYield,
        grossMargin: snapshot.grossMargin,
        analystSentiment: snapshot.analystSentiment
      }
    },
    chart: snapshot.chart,
    notes: buildNotes({ growth, valuation, trend, risk, score }),
    explanations: {
      growth: explainGrowth(snapshot, growth),
      valuation: explainValuation(snapshot, valuation),
      trend: explainTrend(snapshot, trend),
      risk: explainRisk(snapshot, risk)
    }
  };
}

export function defaultCriteria() {
  return { growth: 0.3, valuation: 0.25, trend: 0.25, risk: 0.2 };
}

function momentum(chart) {
  if (!chart.length) return 0;
  const first = chart[0];
  const last = chart.at(-1);
  return ((last - first) / first) * 120;
}

function verdictFor(score) {
  if (score >= 78) return "Starkes Research-Profil";
  if (score >= 62) return "Solide mit Beobachtungspunkten";
  if (score >= 45) return "Gemischt, genauer pruefen";
  return "Erhoehtes Risiko";
}

function buildNotes({ growth, valuation, trend, risk, score }) {
  const notes = [];
  notes.push(score >= 62 ? "Das Gesamtprofil wirkt fuer ein Research-Dashboard konstruktiv." : "Das Gesamtprofil braucht vor einer positiven Einstufung mehr Bestaetigung.");
  notes.push(growth >= 65 ? "Wachstum und Margen stuetzen den Score." : "Wachstumsdaten sind aktuell kein klarer Treiber.");
  notes.push(valuation >= 65 ? "Die Bewertung wirkt im Modell verhaeltnismaessig attraktiv." : "Die Bewertung belastet das Chance-Risiko-Verhaeltnis.");
  notes.push(trend >= 60 ? "Der Trend ist kurzfristig freundlich." : "Der Trend bleibt technisch verhalten.");
  notes.push(risk >= 60 ? "Das Risikoprofil ist kontrollierbar." : "Volatilitaet oder Verschuldung erhoehen das Risiko.");
  return notes;
}

function explainGrowth(snapshot, score) {
  return `Umsatzwachstum von ${snapshot.revenueGrowth}% und Gewinnwachstum von ${snapshot.earningsGrowth}% ergeben einen Wachstumsscore von ${score}/100.`;
}

function explainValuation(snapshot, score) {
  return `Das KGV von ${snapshot.pe} wird mit Margenqualitaet kombiniert und fuehrt zu ${score}/100 in der Bewertungsdimension.`;
}

function explainTrend(snapshot, score) {
  return `Tagesveraenderung und Kursmomentum sprechen fuer einen Trendscore von ${score}/100.`;
}

function explainRisk(snapshot, score) {
  return `Volatilitaet von ${snapshot.volatility}% und Verschuldung werden als Risiko-/Qualitaetswert von ${score}/100 abgebildet.`;
}
