var neo4j = require("neo4j-driver").v1;
var logger = require("../../config/appconfig").logger;

const conn = process.env.NEO_CONN_STRING || "bolt://localhost";
const user = process.env.NEO_USER || "neo4j";
const pass = process.env.NEO_PASS || "1234";

logger.debug("Neo4j Connection: " + conn);

var driver = neo4j.driver(conn, neo4j.auth.basic(user, pass));
module.exports.session = driver.session();

module.exports.dropData = async function() {
  const NeoSession = this.session;

  await NeoSession.run(`
    MATCH (n)
    DETACH DELETE n
    `);
  NeoSession.close();
};
