const path = require("path");
const { createBaseApp } = require("../lib/expressBase");

const authRoutes = require(path.join(__dirname, "..", "routes/auth.routes"));

const { app, withDb, attachErrorHandler } = createBaseApp();

app.use("/api/auth", withDb, authRoutes);
attachErrorHandler(app);

module.exports = app;
