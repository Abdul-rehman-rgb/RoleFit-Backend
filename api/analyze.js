const path = require("path");
const { createBaseApp } = require("../lib/expressBase");

const analyzeRoute = require(path.join(__dirname, "..", "routes/analyze"));

const { app, withDb, attachErrorHandler } = createBaseApp();

app.use("/api/analyze", withDb, analyzeRoute);
attachErrorHandler(app);

module.exports = app;
