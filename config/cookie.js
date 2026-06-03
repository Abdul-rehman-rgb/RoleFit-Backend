const { isProduction } = require("./env");

function getAuthCookieOptions() {
  const production = isProduction();

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

module.exports = { getAuthCookieOptions };
