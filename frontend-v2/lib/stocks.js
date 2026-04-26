const stocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    aliases: ["apple", "iphone", "apple inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/apple.com",
    sector: "Technology",
    industry: "Consumer Electronics",
    description: "Globaler Technologieanbieter mit starkem Oekosystem aus Hardware, Services und Software."
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    aliases: ["tesla", "tesla motors"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/tesla.com",
    sector: "Automotive / Energy",
    industry: "Electric Vehicles",
    description: "Wachstumsorientierter Hersteller von Elektrofahrzeugen, Batterien und Energieprodukten."
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    aliases: ["sap", "sap se"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/sap.com",
    sector: "Enterprise Software",
    industry: "Cloud ERP",
    description: "Europaeischer Softwarekonzern mit Fokus auf ERP, Cloud-Migration und Unternehmensdaten."
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    aliases: ["nvidia", "nvidia corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/nvidia.com",
    sector: "Semiconductors",
    industry: "AI Accelerators",
    description: "Halbleiterunternehmen mit fuehrender Position bei GPUs, KI-Beschleunigern und Rechenzentren."
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    aliases: ["microsoft", "microsoft corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/microsoft.com",
    sector: "Technology",
    industry: "Cloud Software",
    description: "Diversifizierter Software- und Cloudanbieter mit starken Plattform- und KI-Geschaeften."
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. Class A",
    aliases: ["alphabet", "google"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/abc.xyz",
    sector: "Communication Services",
    industry: "Search / Cloud / Ads",
    description: "Digitalplattform mit Suchmaschine, Werbung, YouTube, Cloud und KI-Forschung."
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    aliases: ["amazon", "amazon.com", "aws"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/amazon.com",
    sector: "Consumer / Cloud",
    industry: "E-Commerce / Cloud",
    description: "E-Commerce- und Cloudkonzern mit AWS, Marktplatz, Logistik und Advertising."
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    aliases: ["meta", "facebook", "instagram"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/meta.com",
    sector: "Communication Services",
    industry: "Social Platforms",
    description: "Plattformunternehmen mit starken Werbeerlösen, Social Apps und KI-Infrastruktur."
  }
];

function searchStocks(query) {
  const normalized = normalize(query);
  if (!normalized) return [];

  return stocks
    .map((stock) => ({ stock, score: matchScore(stock, normalized) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.stock.name.localeCompare(b.stock.name))
    .slice(0, 6)
    .map((result) => createQuote(result.stock));
}

function findStock(query) {
  const normalized = normalize(query);
  return stocks.find((stock) => stock.ticker.toLowerCase() === normalized)
    || stocks.find((stock) => stock.aliases.some((alias) => normalize(alias) === normalized))
    || stocks.find((stock) => normalize(stock.name).includes(normalized));
}

function createQuote(stock) {
  const price = seededNumber(`${stock.ticker}-price`, stock.currency === "EUR" ? 80 : 95, stock.ticker === "NVDA" ? 920 : 640);
  const change = seededNumber(`${stock.ticker}-change`, -4.6, 5.4);
  const revenueGrowth = seededNumber(`${stock.ticker}-rev`, -2.5, 29);
  const earningsGrowth = seededNumber(`${stock.ticker}-eps`, -4, 34);
  const pe = seededNumber(`${stock.ticker}-pe`, 12, 56);
  const volatility = seededNumber(`${stock.ticker}-vol`, 13, 62);
  const marketCap = seededNumber(`${stock.ticker}-cap`, 65, 3200) * 1_000_000_000;
  const grossMargin = seededNumber(`${stock.ticker}-gross`, 28, 74);
  const fcfYield = seededNumber(`${stock.ticker}-fcf`, 1.1, 8.8);
  const beta = seededNumber(`${stock.ticker}-beta`, 0.72, 1.92);
  const analystScore = seededNumber(`${stock.ticker}-analyst`, 54, 91);
  const analysis = analyze({ revenueGrowth, earningsGrowth, pe, volatility, change, grossMargin, fcfYield });

  return {
    ...stock,
    price,
    change,
    marketCap,
    pe,
    revenueGrowth,
    earningsGrowth,
    volatility,
    grossMargin,
    fcfYield,
    beta,
    analystScore,
    dividendYield: seededNumber(`${stock.ticker}-div`, 0, 3.8),
    debtToEquity: seededNumber(`${stock.ticker}-debt`, 0.08, 2.8),
    chart: buildChart(stock.ticker, price, 72),
    analysis
  };
}

function analyze(metrics) {
  const growth = clamp(metrics.revenueGrowth * 1.7 + metrics.earningsGrowth * 1.25 + metrics.grossMargin * 0.18);
  const valuation = clamp(108 - metrics.pe * 1.18 + metrics.fcfYield * 3.2);
  const trend = clamp(54 + metrics.change * 6.6);
  const risk = clamp(100 - metrics.volatility * 1.08);
  const score = clamp(growth * 0.32 + valuation * 0.24 + trend * 0.24 + risk * 0.2);

  return {
    score,
    verdict: score >= 76 ? "Premium-wuerdiges Research-Profil" : score >= 60 ? "Solide Watchlist-Kandidatin" : "Gemischtes Profil mit Pruefpunkten",
    pillars: { growth, valuation, trend, risk },
    summary: [
      `Wachstum: Umsatz und Gewinn ergeben zusammen ${growth}/100 Punkte.`,
      `Bewertung: KGV und Free-Cashflow-Qualitaet fuehren zu ${valuation}/100 Punkten.`,
      `Trend: Tagesbewegung und Momentum liefern ${trend}/100 Punkte.`,
      `Risiko: Volatilitaet und Stabilitaet ergeben ${risk}/100 Punkte.`
    ]
  };
}

function buildChart(ticker, price, length) {
  return Array.from({ length }, (_, index) => {
    const wave = Math.sin(index / 4) * price * 0.032;
    const drift = index * seededNumber(`${ticker}-drift`, -0.32, 0.86);
    const noise = seededNumber(`${ticker}-${index}`, -price * 0.017, price * 0.017);
    return Number(Math.max(1, price * 0.78 + wave + drift + noise).toFixed(2));
  });
}

function matchScore(stock, normalized) {
  if (stock.ticker.toLowerCase() === normalized) return 100;
  if (stock.ticker.toLowerCase().startsWith(normalized)) return 86;
  if (normalize(stock.name) === normalized) return 96;
  if (normalize(stock.name).startsWith(normalized)) return 84;
  if (normalize(stock.name).includes(normalized)) return 76;
  if (stock.aliases.some((alias) => normalize(alias) === normalized)) return 94;
  if (stock.aliases.some((alias) => normalize(alias).startsWith(normalized))) return 82;
  if (stock.aliases.some((alias) => normalize(alias).includes(normalized))) return 70;
  return 0;
}

function seededNumber(seed, min, max) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Number((min + (hash % 1000) / 1000 * (max - min)).toFixed(2));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = { findStock, searchStocks };
