import http from "node:http";
import { URL } from "node:url";
import { config } from "./config.js";
import { getDb } from "./database.js";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getUserBySession,
  hashPassword,
  parseCookies,
  sessionCookie,
  validateRegistration,
  validateTicker,
  verifyPassword
} from "./auth.js";
import { applyPlanToAnalysis, planFor } from "./services/featureGate.js";
import { analyzeSnapshot } from "./services/analysisEngine.js";
import { findAsset, getMarketSnapshot, searchAssets } from "./services/marketData.js";
import {
  addWatchlistItem,
  countWatchlist,
  ensureSettings,
  listHistory,
  listWatchlist,
  publicUser,
  removeWatchlistItem,
  saveAnalysis,
  updateSettings
} from "./repositories.js";

const routes = {
  "POST /api/auth/register": register,
  "POST /api/auth/login": login,
  "POST /api/auth/logout": logout,
  "GET /api/me": profile,
  "GET /api/search": search,
  "GET /api/watchlist": watchlist,
  "POST /api/watchlist": watchlistAdd,
  "DELETE /api/watchlist": watchlistDelete,
  "GET /api/history": history,
  "GET /api/settings": settingsGet,
  "PUT /api/settings": settingsPut,
  "POST /api/analyze": analyze
};

getDb();

export const server = http.createServer(async (req, res) => {
  try {
    setCors(req, res);
    if (req.method === "OPTIONS") return send(res, 204);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const route = routes[`${req.method} ${url.pathname}`];
    if (!route) return sendJson(res, 404, { error: "Route nicht gefunden." });

    const cookies = parseCookies(req.headers.cookie);
    const user = getUserBySession(cookies[config.sessionCookieName]);
    const context = { req, res, url, user, sessionId: cookies[config.sessionCookieName] };
    return await route(context);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Ein unerwarteter Serverfehler ist aufgetreten." });
  }
});

if (process.argv[1]?.endsWith("server.js")) {
  server.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

async function register({ req, res }) {
  const body = await readJson(req);
  const validationError = validateRegistration(body);
  if (validationError) return sendJson(res, 400, { error: validationError });

  const email = body.email.trim().toLowerCase();
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return sendJson(res, 409, { error: "Diese E-Mail ist bereits registriert." });

  const result = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)").run(
    body.name.trim(),
    email,
    hashPassword(body.password)
  );
  ensureSettings(result.lastInsertRowid);
  const user = db.prepare("SELECT id, name, email, plan, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
  const session = createSession(user.id);

  return sendJson(res, 201, { user: publicUser(user), settings: ensureSettings(user.id), plan: planFor(user) }, [
    ["Set-Cookie", sessionCookie(session.id, session.expiresAt)]
  ]);
}

async function login({ req, res }) {
  const { email, password } = await readJson(req);
  const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(String(email ?? "").trim().toLowerCase());
  if (!user || !verifyPassword(String(password ?? ""), user.password_hash)) {
    return sendJson(res, 401, { error: "E-Mail oder Passwort ist falsch." });
  }

  const session = createSession(user.id);
  return sendJson(res, 200, { user: publicUser(user), settings: ensureSettings(user.id), plan: planFor(user) }, [
    ["Set-Cookie", sessionCookie(session.id, session.expiresAt)]
  ]);
}

async function logout({ res, sessionId }) {
  deleteSession(sessionId);
  return sendJson(res, 200, { ok: true }, [["Set-Cookie", clearSessionCookie()]]);
}

async function profile(context) {
  const user = requireUser(context);
  if (!user) return;
  return sendJson(context.res, 200, { user: publicUser(user), settings: ensureSettings(user.id), plan: planFor(user) });
}

async function search(context) {
  const user = requireUser(context);
  if (!user) return;
  const query = context.url.searchParams.get("q");
  const matches = searchAssets(query);
  return sendJson(context.res, 200, { matches });
}

async function watchlist(context) {
  const user = requireUser(context);
  if (!user) return;
  return sendJson(context.res, 200, { items: listWatchlist(user.id) });
}

async function watchlistAdd(context) {
  const user = requireUser(context);
  if (!user) return;
  const { ticker, query } = await readJson(context.req);
  const asset = findAsset(ticker ?? query);
  const validation = validateTicker(asset?.ticker ?? ticker ?? query);
  if (validation.error) return sendJson(context.res, 400, { error: validation.error });
  const plan = planFor(user);
  const exists = listWatchlist(user.id).some((item) => item.ticker === validation.ticker);
  if (!exists && countWatchlist(user.id) >= plan.watchlistLimit) {
    return sendJson(context.res, 403, { error: `Free-Limit erreicht: maximal ${plan.watchlistLimit} Watchlist-Eintraege. Premium ist dafuer vorbereitet.` });
  }
  const snapshot = await getMarketSnapshot(validation.ticker);
  return sendJson(context.res, 201, { items: addWatchlistItem(user.id, snapshot.ticker, snapshot.name), plan });
}

async function watchlistDelete(context) {
  const user = requireUser(context);
  if (!user) return;
  const validation = validateTicker(context.url.searchParams.get("ticker"));
  if (validation.error) return sendJson(context.res, 400, { error: validation.error });
  return sendJson(context.res, 200, { items: removeWatchlistItem(user.id, validation.ticker) });
}

async function history(context) {
  const user = requireUser(context);
  if (!user) return;
  return sendJson(context.res, 200, { items: listHistory(user.id, planFor(user).historyLimit) });
}

async function settingsGet(context) {
  const user = requireUser(context);
  if (!user) return;
  return sendJson(context.res, 200, { settings: ensureSettings(user.id) });
}

async function settingsPut(context) {
  const user = requireUser(context);
  if (!user) return;
  return sendJson(context.res, 200, { settings: updateSettings(user.id, await readJson(context.req)) });
}

async function analyze(context) {
  const user = requireUser(context);
  if (!user) return;
  const { ticker, query } = await readJson(context.req);
  const rawQuery = ticker ?? query;
  const matches = searchAssets(rawQuery);
  const exactAsset = findAsset(rawQuery);
  const isExactTicker = matches.some((match) => match.ticker.toLowerCase() === String(rawQuery ?? "").trim().toLowerCase());
  if (!isExactTicker && matches.length > 1) {
    return sendJson(context.res, 409, { error: "Mehrere Aktien passen zu deiner Suche. Bitte einen Treffer auswaehlen.", matches });
  }
  const validation = validateTicker(exactAsset?.ticker ?? matches[0]?.ticker ?? rawQuery);
  if (validation.error) return sendJson(context.res, 400, { error: validation.error });

  const snapshot = await getMarketSnapshot(validation.ticker);
  const fullAnalysis = analyzeSnapshot(snapshot, ensureSettings(user.id).criteria);
  saveAnalysis(user.id, fullAnalysis);
  const plan = planFor(user);
  const analysis = applyPlanToAnalysis(fullAnalysis, plan);
  return sendJson(context.res, 201, { analysis, history: listHistory(user.id, plan.historyLimit), plan });
}

function requireUser({ res, user }) {
  if (!user) {
    sendJson(res, 401, { error: "Bitte anmelden, um fortzufahren." });
    return null;
  }
  return user;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin === config.frontendOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
}

function sendJson(res, status, payload, headers = []) {
  return send(res, status, JSON.stringify(payload), [["Content-Type", "application/json"], ...headers]);
}

function send(res, status, body = "", headers = []) {
  for (const [key, value] of headers) res.setHeader(key, value);
  res.writeHead(status);
  res.end(body);
}
