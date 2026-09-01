const { checkCredentials, createSessionCookie, isAuthenticated } = require("../lib/auth");
const { renderLoginPage } = require("../lib/render");

module.exports = (req, res) => {
  if (req.method === "GET") {
    if (isAuthenticated(req)) {
      return res.redirect(302, "/");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(renderLoginPage());
  }

  if (req.method === "POST") {
    const { email, password } = req.body || {};
    if (checkCredentials(email, password)) {
      res.setHeader("Set-Cookie", createSessionCookie());
      return res.redirect(302, "/");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(401).send(renderLoginPage({ error: "Incorrect email or password." }));
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).send("Method Not Allowed");
};
