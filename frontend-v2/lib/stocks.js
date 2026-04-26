const stocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    aliases: ["apple", "iphone", "apple inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/apple.com",
    sector: "Technology"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    aliases: ["tesla", "tesla motors"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/tesla.com",
    sector: "Automotive / Energy"
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    aliases: ["sap", "sap se"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/sap.com",
    sector: "Enterprise Software"
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    aliases: ["nvidia", "nvidia corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/nvidia.com",
    sector: "Semiconductors"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    aliases: ["microsoft", "microsoft corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/microsoft.com",
    sector: "Technology"
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. Class A",
    aliases: ["alphabet", "google"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/abc.xyz",
    sector: "Communication Services"
  }
];

function searchStocks(query) {
  const normalized = normalize(query);
  if (!normalized) return [];

  return stocks
    .map((stock) => ({ stock, score: matchScore(stock, normalized) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
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
  const analysis = analyze({ revenueGrowth, earningsGrowth, pe, volatility, change });

  return {
    ...stock,
    price,
    change,
    marketCap,
    pe,
    revenueGrowth,
    earningsGrowth,
    volatility,
    chart: Array.from({ length: 32 }, (_, index) => {
      const wave = Math.sin(index / 3) * price * 0.028;
      const drift = index * seededNumber(`${stock.ticker}-drift`, -0.35, 0.9);
      const noise = seededNumber(`${stock.ticker}-${index}`, -price * 0.018, price * 0.018);
      return Number(Math.max(1, price * 0.82 + wave + drift + noise).toFixed(2));
    }),
    analysis
  };
}

function analyze(metrics) {
  const growth = clamp(metrics.revenueGrowth * 2 + metrics.earningsGrowth * 1.4);
  const valuation = clamp(100 - metrics.pe * 1.25);
  const trend = clamp(52 + metrics.change * 7);
  const risk = clamp(100 - metrics.volatility * 1.15);
  const score = clamp(growth * 0.32 + valuation * 0.24 + trend * 0.24 + risk * 0.2);

  return {
    score,
    verdict: score >= 72 ? "Starkes Research-Profil" : score >= 56 ? "Solide, aber selektiv pruefen" : "Gemischtes Profil mit klaren Risiken",
    pillars: { growth, valuation, trend, risk },
    summary: [
      `Wachstum: Umsatz und Gewinn liefern zusammen ${growth}/100 Punkte.`,
      `Bewertung: Das KGV ergibt im einfachen Modell ${valuation}/100 Punkte.`,
      `Trend: Die Tagesbewegung und das Momentum ergeben ${trend}/100 Punkte.`,
      `Risiko: Volatilitaet und Stabilitaet ergeben ${risk}/100 Punkte.`
    ]
  };
}

function matchScore(stock, normalized) {
  if (stock.ticker.toLowerCase() === normalized) return 100;
  if (stock.ticker.toLowerCase().startsWith(normalized)) return 85;
  if (normalize(stock.name) === normalized) return 95;
  if (normalize(stock.name).includes(normalized)) return 75;
  if (stock.aliases.some((alias) => normalize(alias) === normalized)) return 92;
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
