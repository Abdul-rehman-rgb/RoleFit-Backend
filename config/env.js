function isProduction() {
  return (
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
  );
}

function getAllowedOrigins() {
  const raw =
    process.env.CLIENT_URL ||
    (isProduction() ? "" : "http://localhost:5173");

  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

module.exports = { isProduction, getAllowedOrigins };
