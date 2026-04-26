const { clearSessionCookie, sendJson } = require("../lib/auth");

module.exports = function logout(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Only POST requests are allowed." });
  }

  return sendJson(res, 200, { message: "Logout erfolgreich." }, {
    "Set-Cookie": clearSessionCookie()
  });
};
