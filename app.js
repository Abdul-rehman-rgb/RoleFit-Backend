const path = require("path");
const { createBaseApp } = require("./lib/expressBase");

const uploadRoute = require(path.join(__dirname, "routes/uploads"));
const analyzeRoute = require(path.join(__dirname, "routes/analyze"));
const authRoutes = require(path.join(__dirname, "routes/auth.routes"));
const interviewRoutes = require(path.join(__dirname, "routes/interview.routes"));

const { app, withDb, attachErrorHandler } = createBaseApp();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/upload", withDb, uploadRoute);
app.use("/api/analyze", withDb, analyzeRoute);
app.use("/api/auth", withDb, authRoutes);
app.use("/api/interview", withDb, interviewRoutes);

attachErrorHandler(app);

module.exports = app;
