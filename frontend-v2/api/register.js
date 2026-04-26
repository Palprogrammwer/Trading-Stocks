const { createSessionCookie, readJson, sendJson, validateUserInput } = require("../lib/auth");

module.exports = async function register(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Only POST requests are allowed." });
  }

  try {
    const body = await readJson(req);
    const result = validateUserInput(body, true);
    if (result.error) return sendJson(res, 400, { error: result.error });

    // Demo-auth: no database is used yet. Replace this layer later with persistent storage.
    return sendJson(res, 201, {
      message: "Registrierung erfolgreich.",
      user: result.user
    }, {
      "Set-Cookie": createSessionCookie(result.user)
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }
};
