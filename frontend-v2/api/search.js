const { searchStocks, createQuote, findStock } = require("../lib/stocks");
const { readJson, sendJson } = require("../lib/auth");

const VALID_TIMEFRAMES = ["1W", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

module.exports = async function search(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Only GET and POST requests are allowed." });
  }

  let query = "";
  let timeframe = "1M";

  if (req.method === "GET") {
    const url = new URL(req.url, "https://example.com");
    query = url.searchParams.get("q") || "";
    timeframe = url.searchParams.get("tf") || "1M";
  } else {
    const body = await readJson(req).catch(() => ({}));
    query = body.query || "";
    timeframe = body.timeframe || "1M";
  }

  if (!VALID_TIMEFRAMES.includes(timeframe)) timeframe = "1M";

  const results = searchStocks(query);

  // If the query is a direct ticker match, rebuild chart for requested timeframe
  const directMatch = findStock(query);
  if (directMatch && results.length > 0 && results[0].ticker === directMatch.ticker) {
    const fullQuote = createQuote(directMatch, timeframe);
    results[0] = fullQuote;
  }

  // Always return 200 with results array (may be empty)
  return sendJson(res, 200, { results });
};
