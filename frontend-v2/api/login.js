const { createSessionCookie, readJson, sendJson, validateUserInput } = require("../lib/auth");

module.exports = async function login(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Only POST requests are allowed." });
  }

  try {
    const body = await readJson(req);
    const result = validateUserInput(body, false);
    if (result.error) return sendJson(res, 400, { error: result.error });

    return sendJson(res, 200, {
      message: "Login erfolgreich.",
      user: result.user
    }, {
      "Set-Cookie": createSessionCookie(result.user)
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }
};
