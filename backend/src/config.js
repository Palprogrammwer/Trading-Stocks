import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  port: Number(process.env.PORT ?? 4000),
  dbPath: process.env.DB_PATH ?? path.join(root, "data", "app.db"),
  sessionCookieName: "trading_research_sid",
  sessionTtlMs: 1000 * 60 * 60 * 24 * 7,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173"
};
