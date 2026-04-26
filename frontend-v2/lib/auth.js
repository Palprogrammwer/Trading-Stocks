const COOKIE_NAME = "rd_v2_demo_session";

function validateUserInput(body, requireName = false) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (requireName && name.length < 2) {
    return { error: "Der Name muss mindestens 2 Zeichen lang sein." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Bitte gib eine gueltige E-Mail-Adresse ein." };
  }

  if (password.length < 8) {
    return { error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  }

  return { user: { name: name || email.split("@")[0], email, plan: "free" } };
}

function createSessionCookie(user) {
  const payload = Buffer.from(JSON.stringify({
    name: user.name,
    email: user.email,
    plan: user.plan || "free",
    createdAt: new Date().toISOString()
  })).toString("base64url");

  return `${COOKIE_NAME}=${payload}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const payload = cookie.split("=")[1];
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return { name: user.name, email: user.email, plan: user.plan || "free" };
  } catch {
    return null;
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  readJson,
  readSession,
  sendJson,
  validateUserInput
};
