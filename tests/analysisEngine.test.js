import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSnapshot, defaultCriteria } from "../backend/src/services/analysisEngine.js";

test("analysis engine returns bounded pillar scores and total score", () => {
  const result = analyzeSnapshot({
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    sector: "Technology",
    website: "apple.com",
    logoUrl: "https://logo.clearbit.com/apple.com",
    price: 190,
    change: 1.7,
    marketCap: 2900000000000,
    revenueGrowth: 12,
    earningsGrowth: 14,
    pe: 28,
    margin: 31,
    debtToEquity: 1.2,
    volatility: 24,
    beta: 1.2,
    freeCashFlowYield: 3.8,
    grossMargin: 44,
    analystSentiment: 77,
    chart: [160, 164, 170, 175, 183, 190]
  }, defaultCriteria());

  assert.equal(result.ticker, "AAPL");
  assert.equal(result.asset.name, "Apple Inc.");
  assert.ok(result.score >= 0 && result.score <= 100);
  for (const score of Object.values(result.pillars)) {
    assert.ok(score >= 0 && score <= 100);
  }
  assert.equal(result.chart.length, 6);
});
