import test from "node:test";
import assert from "node:assert/strict";
import { findAsset, getMarketSnapshot, searchAssets } from "../backend/src/services/marketData.js";

test("company name search resolves common stocks", async () => {
  assert.equal(findAsset("Apple").ticker, "AAPL");
  assert.equal(findAsset("Tesla").ticker, "TSLA");

  const matches = searchAssets("google");
  assert.ok(matches.length >= 2);
  assert.ok(matches.some((match) => match.ticker === "GOOGL"));

  const snapshot = await getMarketSnapshot("SAP");
  assert.equal(snapshot.ticker, "SAP");
  assert.equal(snapshot.name, "SAP SE");
  assert.ok(snapshot.logoUrl.includes("sap.com"));
  assert.ok(snapshot.price > 0);
});
