function isProduction() {
  return (
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
  );
}

function getAllowedOrigins() {
  const raw =
    process.env.CLIENT_URL ||
    (isProduction() ? "" : "http://localhost:5173");

  const origins = raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (origins.length === 0 && process.env.VERCEL === "1") {
    return ["https://role-fit-nine.vercel.app"];
  }

  return origins;
}

module.exports = { isProduction, getAllowedOrigins };
