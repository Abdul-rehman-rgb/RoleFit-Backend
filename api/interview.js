const path = require("path");
const { createBaseApp } = require("../lib/expressBase");

const interviewRoutes = require(path.join(
  __dirname,
  "..",
  "routes/interview.routes"
));

const { app, withDb, attachErrorHandler } = createBaseApp();

app.use("/api/interview", withDb, interviewRoutes);
attachErrorHandler(app);

module.exports = app;
