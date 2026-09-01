const { clearSessionCookie } = require("../lib/auth");

module.exports = (req, res) => {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.redirect(302, "/login");
};
