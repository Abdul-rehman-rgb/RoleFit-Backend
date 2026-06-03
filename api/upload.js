const path = require("path");
const { createBaseApp } = require("../lib/expressBase");

const uploadRoute = require(path.join(__dirname, "..", "routes/uploads"));

const { app, withDb, attachErrorHandler } = createBaseApp();

app.use("/api/upload", withDb, uploadRoute);
attachErrorHandler(app);

module.exports = app;
