import crypto from "node:crypto";
import { config } from "./config.js";
import { getDb } from "./database.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration({ name, email, password }) {
  if (!name || name.trim().length < 2) return "Der Name muss mindestens 2 Zeichen haben.";
  if (!EMAIL_PATTERN.test(email ?? "")) return "Bitte eine gueltige E-Mail-Adresse eingeben.";
  if (!password || password.length < 8) return "Das Passwort muss mindestens 8 Zeichen haben.";
  return null;
}

export function validateTicker(ticker) {
  const normalized = String(ticker ?? "").trim().toUpperCase();
  if (!/^[A-Z.]{1,8}$/.test(normalized)) {
    return { error: "Ticker duerfen nur Buchstaben und Punkte enthalten und maximal 8 Zeichen lang sein." };
  }

  return { ticker: normalized };
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, original] = storedHash.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(original, "hex"));
}

export function createSession(userId) {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + config.sessionTtlMs;
  getDb().prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(id, userId, expiresAt);
  return { id, expiresAt };
}

export function getUserBySession(sessionId) {
  if (!sessionId) return null;

  const row = getDb().prepare(`
    SELECT users.id, users.name, users.email, users.plan, users.created_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? AND sessions.expires_at > ?
  `).get(sessionId, Date.now());

  return row ?? null;
}

export function deleteSession(sessionId) {
  if (sessionId) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function sessionCookie(sessionId, expiresAt) {
  return `${config.sessionCookieName}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookie() {
  return `${config.sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}
