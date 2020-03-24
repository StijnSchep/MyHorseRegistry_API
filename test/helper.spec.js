const logger = require("../src/config/appconfig").logger;
const mongoConfig = require("../src/data/config/mongo.config");
const neoConfig = require("../src/data/config/neo4j.config");

before(function(done) {
  mongoConfig.initDBConnection(err => {
    if (err) {
      logger.error("MongoDB connection failed");
      logger.error(err);
      return;
    }

    logger.info("MongoDB connection established");
    done();
  });
});

beforeEach(async function() {
  await mongoConfig.dropData();
  await neoConfig.dropData();
});
