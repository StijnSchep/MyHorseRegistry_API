const logger = require("./src/config/appconfig").logger;
const app = require("./src/config/app");
const mongoConfig = require("./src/data/config/mongo.config");

app.on("dataready", function() {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    logger.info(`server is listening on port ${PORT}`);
  });
});

mongoConfig.initDBConnection(err => {
  if (err) {
    logger.error("MongoDB connection failed");
    logger.error(err);
    return;
  }

  logger.info("MongoDB connection established");
  app.emit("dataready");
});
