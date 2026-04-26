const { searchStocks } = require("../lib/stocks");
const { readJson, sendJson } = require("../lib/auth");

module.exports = async function search(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Only GET and POST requests are allowed." });
  }

  let query = "";
  if (req.method === "GET") {
    query = new URL(req.url, "https://example.com").searchParams.get("q");
  } else {
    const body = await readJson(req).catch(() => ({}));
    query = body.query;
  }

  const results = searchStocks(query);
  if (!results.length) {
    return sendJson(res, 404, { error: "Keine passende Aktie gefunden.", results: [] });
  }

  return sendJson(res, 200, { results });
};
