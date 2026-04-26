const { readSession, sendJson } = require("../lib/auth");

module.exports = function me(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Only GET requests are allowed." });
  }

  const user = readSession(req);
  if (!user) {
    return sendJson(res, 401, { authenticated: false, user: null });
  }

  return sendJson(res, 200, { authenticated: true, user });
};
