module.exports.create = async function(website) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(
      `CREATE (w : Website {
                    _id: ${JSON.stringify(website._id)},
                    name: ${JSON.stringify(website.name)},
                    URL: ${JSON.stringify(website.URL)},
                    monthlyPrice: ${JSON.stringify(website.monthlyPrice)},
                    pricePerAd: ${JSON.stringify(website.pricePerAd)}
                }) RETURN w._id`
    );

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.update = async function(website) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
                MATCH(w: Website {_id: ${JSON.stringify(website._id)}})
                SET w.name = ${JSON.stringify(website.name)}
                SET w.URL = ${JSON.stringify(website.URL)}
                SET w.monthlyPrice = ${JSON.stringify(website.monthlyPrice)}
                SET w.pricePerAd = ${JSON.stringify(website.pricePerAd)}
                RETURN w._id
            `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.addHorse = async function(websiteId, horseId) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
            MATCH(w: Website {_id: ${JSON.stringify(websiteId)}})
            MATCH(h: Horse {_id: ${JSON.stringify(horseId)}})
            MERGE (w)-[:ADVERTISES]->(h)-[:ADVERTISED_ON]->(w)
            RETURN w._id
        `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.removeHorse = async function(websiteId, horseId) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
            MATCH (w:Website {_id: ${JSON.stringify(
              websiteId
            )}})-[r:ADVERTISES]->(h:Horse {_id: ${JSON.stringify(
      horseId
    )}})-[r2:ADVERTISED_ON]->(w)
            DELETE r, r2
        `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

function parseRecordList(records) {
  /*
        Record: 
        {
            _fields: [
                {
                    properties: {
                        <<WEBSITE PROPERTIES>>
                    }
                },
                <<HORSE _ID>>,
                <<HORSE OFFICIAL NAME>>,
                <<HORSE COMMON NAME>>,
                <<HORSE STATUS>>
            ]
        }
    */

  let response = [];

  records.forEach(record => {
    const website = record._fields[0].properties;
    website.monthlyPrice = website.monthlyPrice.low;
    website.pricePerAd = website.pricePerAd.low;
    const savedWebsite = response.find(
      rWebsite => rWebsite._id === website._id
    );

    if (savedWebsite) {
      if (record._fields[1]) {
        savedWebsite.horses.push({
          _id: record._fields[1],
          officialName: record._fields[2],
          commonName: record._fields[3],
          status: record._fields[4]
        });
      }
    } else {
      website.horses = [];
      if (record._fields[1]) {
        website.horses.push({
          _id: record._fields[1],
          officialName: record._fields[2],
          commonName: record._fields[3],
          status: record._fields[4]
        });
      }

      response.push(website);
    }
  });
  return response;
}

module.exports.getList = async function() {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    const res = await NeoSession.run(`
            MATCH (w: Website)
            OPTIONAL MATCH (w)-[:ADVERTISES]->(h:Horse)-[:ADVERTISED_ON]->(w)
            RETURN w, h._id, h.officialName, h.commonName, h.status
        `);

    return {
      err: null,
      result: parseRecordList(res.records)
    };
  } catch (err) {
    NeoSession.close();
    return {
      err: err,
      result: null
    };
  }
};

module.exports.delete = async function(_id) {
  const NeoSession = require("../config/neo4j.config").session;

  let res;
  try {
    // Check if horse is attached to any website
    res = await NeoSession.run(
      `MATCH (w: Website {_id: ${JSON.stringify(
        _id
      )}})-[r:ADVERTISES]->(h:Horse) RETURN w`
    );
    if (res.records.length > 0) {
      return "HorseAttached";
    }
  } catch (err) {
    NeoSession.close();
    return err;
  }

  try {
    // Remove Website
    await NeoSession.run(`
                MATCH (w: Website {_id: ${JSON.stringify(_id)}}) DELETE w
            `);
    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};
