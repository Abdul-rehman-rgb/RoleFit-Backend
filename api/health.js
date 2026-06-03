const { createCorsMiddleware } = require("../config/cors");

const express = require("express");
const app = express();

app.use(createCorsMiddleware());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

module.exports = app;
