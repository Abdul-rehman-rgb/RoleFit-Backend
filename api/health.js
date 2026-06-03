const { createBaseApp } = require("../lib/expressBase");

const { app, attachErrorHandler } = createBaseApp();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
attachErrorHandler(app);

module.exports = app;
