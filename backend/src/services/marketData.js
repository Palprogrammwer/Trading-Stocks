export const assetCatalog = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    aliases: ["apple", "apple inc", "iphone"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Technology",
    website: "apple.com",
    logoUrl: "https://logo.clearbit.com/apple.com"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    aliases: ["tesla", "tesla motors"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Consumer Cyclical",
    website: "tesla.com",
    logoUrl: "https://logo.clearbit.com/tesla.com"
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    aliases: ["sap", "sap se"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    sector: "Enterprise Software",
    website: "sap.com",
    logoUrl: "https://logo.clearbit.com/sap.com"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    aliases: ["microsoft", "microsoft corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Technology",
    website: "microsoft.com",
    logoUrl: "https://logo.clearbit.com/microsoft.com"
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    aliases: ["nvidia", "nvidia corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Semiconductors",
    website: "nvidia.com",
    logoUrl: "https://logo.clearbit.com/nvidia.com"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    aliases: ["amazon", "amazon.com", "aws"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Consumer / Cloud",
    website: "amazon.com",
    logoUrl: "https://logo.clearbit.com/amazon.com"
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. Class A",
    aliases: ["alphabet", "google", "google class a"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Communication Services",
    website: "abc.xyz",
    logoUrl: "https://logo.clearbit.com/abc.xyz"
  },
  {
    ticker: "GOOG",
    name: "Alphabet Inc. Class C",
    aliases: ["alphabet", "google", "google class c"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Communication Services",
    website: "abc.xyz",
    logoUrl: "https://logo.clearbit.com/abc.xyz"
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    aliases: ["meta", "facebook", "meta platforms"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Communication Services",
    website: "meta.com",
    logoUrl: "https://logo.clearbit.com/meta.com"
  }
];

export function searchAssets(query) {
  const normalized = normalize(query);
  if (!normalized) return [];

  return assetCatalog
    .map((asset) => ({ asset, score: scoreAsset(asset, normalized) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.asset.name.localeCompare(b.asset.name))
    .slice(0, 6)
    .map(({ asset }) => publicAsset(asset));
}

export function findAsset(query) {
  const normalized = normalize(query);
  return assetCatalog.find((asset) => asset.ticker.toLowerCase() === normalized)
    ?? assetCatalog.find((asset) => asset.aliases.some((alias) => normalize(alias) === normalized))
    ?? null;
}

export async function getMarketSnapshot(query) {
  const asset = findAsset(query) ?? fallbackAsset(query);
  const symbol = asset.ticker;
  const price = seededNumber(symbol, symbol === "SAP" ? 85 : 42, symbol === "NVDA" ? 980 : 860);
  const change = seededNumber(`${symbol}-change`, -4.8, 5.2);
  const marketCap = seededNumber(`${symbol}-cap`, 42, 3200) * 1_000_000_000;
  const revenueGrowth = seededNumber(`${symbol}-rev`, -4, 28);
  const earningsGrowth = seededNumber(`${symbol}-growth`, -8, 34);
  const pe = seededNumber(`${symbol}-pe`, 8, 54);
  const margin = seededNumber(`${symbol}-margin`, 7, 39);
  const volatility = seededNumber(`${symbol}-vol`, 12, 68);
  const chart = buildChart(symbol, price, 72);

  return {
    ...publicAsset(asset),
    price,
    change,
    marketCap,
    revenueGrowth,
    earningsGrowth,
    pe,
    margin,
    debtToEquity: seededNumber(`${symbol}-debt`, 0.1, 3.4),
    volatility,
    beta: seededNumber(`${symbol}-beta`, 0.7, 1.9),
    freeCashFlowYield: seededNumber(`${symbol}-fcf`, 1.2, 8.5),
    grossMargin: seededNumber(`${symbol}-gross`, 32, 72),
    analystSentiment: seededNumber(`${symbol}-sentiment`, 52, 91),
    chart
  };
}

export function publicAsset(asset) {
  return {
    ticker: asset.ticker,
    name: asset.name,
    exchange: asset.exchange,
    country: asset.country,
    currency: asset.currency,
    sector: asset.sector,
    website: asset.website,
    logoUrl: asset.logoUrl
  };
}

function scoreAsset(asset, normalized) {
  if (asset.ticker.toLowerCase() === normalized) return 100;
  if (asset.ticker.toLowerCase().startsWith(normalized)) return 85;
  if (normalize(asset.name) === normalized) return 95;
  if (normalize(asset.name).includes(normalized)) return 70;
  if (asset.aliases.some((alias) => normalize(alias) === normalized)) return 92;
  if (asset.aliases.some((alias) => normalize(alias).includes(normalized))) return 68;
  return 0;
}

function fallbackAsset(query) {
  const ticker = String(query ?? "ASSET").trim().toUpperCase().replace(/[^A-Z.]/g, "").slice(0, 8) || "ASSET";
  return {
    ticker,
    name: `${ticker} Research Asset`,
    aliases: [ticker.toLowerCase()],
    exchange: "Mock Exchange",
    country: "N/A",
    currency: "USD",
    sector: "Unklassifiziert",
    website: "example.com",
    logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(ticker)}&background=111827&color=38bdf8&bold=true`
  };
}

function buildChart(symbol, price, length) {
  return Array.from({ length }, (_, index) => {
    const wave = Math.sin(index / 4) * price * 0.035;
    const drift = index * seededNumber(`${symbol}-drift`, -0.55, 1.1);
    const noise = seededNumber(`${symbol}-${index}`, -price * 0.025, price * 0.025);
    return Math.max(1, Number((price * 0.78 + wave + drift + noise).toFixed(2)));
  });
}

function seededNumber(seed, min, max) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Number((min + (hash % 1000) / 1000 * (max - min)).toFixed(2));
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}
