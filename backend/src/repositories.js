import { getDb } from "./database.js";
import { defaultCriteria } from "./services/analysisEngine.js";

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan ?? "free",
    createdAt: user.created_at
  };
}

export function ensureSettings(userId) {
  const db = getDb();
  const existing = db.prepare("SELECT criteria, theme FROM user_settings WHERE user_id = ?").get(userId);
  if (existing) return parseSettings(existing);

  db.prepare("INSERT INTO user_settings (user_id, criteria, theme) VALUES (?, ?, ?)").run(
    userId,
    JSON.stringify(defaultCriteria()),
    "dark"
  );
  return { criteria: defaultCriteria(), theme: "dark" };
}

export function updateSettings(userId, settings) {
  const criteria = sanitizeCriteria(settings.criteria);
  const theme = settings.theme === "dark" ? "dark" : "dark";
  getDb().prepare(`
    INSERT INTO user_settings (user_id, criteria, theme, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET criteria = excluded.criteria, theme = excluded.theme, updated_at = CURRENT_TIMESTAMP
  `).run(userId, JSON.stringify(criteria), theme);
  return { criteria, theme };
}

export function listWatchlist(userId) {
  return getDb().prepare(`
    SELECT id, ticker, name, created_at AS createdAt
    FROM watchlist_items
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);
}

export function countWatchlist(userId) {
  return getDb().prepare("SELECT COUNT(*) AS count FROM watchlist_items WHERE user_id = ?").get(userId).count;
}

export function addWatchlistItem(userId, ticker, name) {
  getDb().prepare(`
    INSERT INTO watchlist_items (user_id, ticker, name)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, ticker) DO UPDATE SET name = excluded.name
  `).run(userId, ticker, name);
  return listWatchlist(userId);
}

export function removeWatchlistItem(userId, ticker) {
  getDb().prepare("DELETE FROM watchlist_items WHERE user_id = ? AND ticker = ?").run(userId, ticker);
  return listWatchlist(userId);
}

export function saveAnalysis(userId, analysis) {
  getDb().prepare(`
    INSERT INTO analysis_history (user_id, ticker, company_name, score, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, analysis.ticker, analysis.companyName, analysis.score, JSON.stringify(analysis));
}

export function listHistory(userId, limit = 20) {
  return getDb().prepare(`
    SELECT id, ticker, company_name AS companyName, score, payload, created_at AS createdAt
    FROM analysis_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit).map((row) => ({
    id: row.id,
    ticker: row.ticker,
    companyName: row.companyName,
    score: row.score,
    createdAt: row.createdAt,
    analysis: JSON.parse(row.payload)
  }));
}

function parseSettings(row) {
  return { criteria: sanitizeCriteria(JSON.parse(row.criteria)), theme: row.theme };
}

function sanitizeCriteria(input = {}) {
  const fallback = defaultCriteria();
  const criteria = Object.fromEntries(
    Object.entries(fallback).map(([key, value]) => [key, Number.isFinite(Number(input[key])) ? Number(input[key]) : value])
  );
  const total = Object.values(criteria).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return fallback;
  return criteria;
}
