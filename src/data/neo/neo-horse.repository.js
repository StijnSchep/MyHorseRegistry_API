module.exports.create = async function(data) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(
      `CREATE (h : Horse {
                _id: ${JSON.stringify(data._id)},
                officialName: ${JSON.stringify(data.officialName)},
                commonName: ${JSON.stringify(data.commonName)},
                category: ${JSON.stringify(data.category)},
                yearOfBirth: ${JSON.stringify(data.yearOfBirth)},
                gender: ${JSON.stringify(data.gender)},
                color: ${JSON.stringify(data.color)},
                height: ${JSON.stringify(data.height)},
                price: ${JSON.stringify(data.price)},
                date_added: ${JSON.stringify(data.date_added)},
                date_sold: ${JSON.stringify(data.date_sold)},
                title: ${JSON.stringify(data.title)},
                description: ${JSON.stringify(data.description)},
                status: ${JSON.stringify(data.status)}
            }) RETURN h._id`
    );

    return;
  } catch (err) {
    NeoSession.close();

    return err;
  }
};

module.exports.update = async function(data) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
            MATCH(h: Horse {_id: ${JSON.stringify(data._id)}})
            SET h.officialName = ${JSON.stringify(data.officialName)}
            SET h.commonName = ${JSON.stringify(data.commonName)}
            SET h.category = ${JSON.stringify(data.category)}
            SET h.yearOfBirth = ${JSON.stringify(data.yearOfBirth)}
            SET h.gender = ${JSON.stringify(data.gender)}
            SET h.color = ${JSON.stringify(data.color)}
            SET h.height = ${JSON.stringify(data.height)}
            SET h.price = ${JSON.stringify(data.price)}
            SET h.date_sold = ${JSON.stringify(data.date_sold)}
            SET h.title = ${JSON.stringify(data.title)}
            SET h.description = ${JSON.stringify(data.description)}
            SET h.status = ${JSON.stringify(data.status)}
            RETURN h._id
        `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.delete = async function(_id) {
  const NeoSession = require("../config/neo4j.config").session;
  let res;
  try {
    // Check if horse is attached to any website
    res = await NeoSession.run(
      `MATCH (h:Horse {_id: ${JSON.stringify(
        _id
      )}})-[r:ADVERTISED_ON]->(w:Website) RETURN h, r, w`
    );
    if (res.records.length > 0) {
      return "WebsiteAttached";
    }
  } catch (err) {
    NeoSession.close();
    return err;
  }

  try {
    // Remove attached reservations
    await NeoSession.run(`
            MATCH (h:Horse {_id: ${JSON.stringify(
              _id
            )}})-[r:HAS]->(res:Reservation)-[r2:BELONGS_TO]->(h) DELETE r, r2, res
        `);
  } catch (err) {
    NeoSession.close();
    return err;
  }

  try {
    // Remove Horse
    await NeoSession.run(`
            MATCH (h:Horse {_id: ${JSON.stringify(_id)}}) DELETE h
        `);
    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

function parseRecordList(records) {
  let response = [];

  records.forEach(record => {
    let horseData = record._fields[0].properties;

    if (record._fields[1]) {
      horseData.active_reservation = record._fields[1].properties;
    }

    horseData.price = horseData.price.low;
    horseData.yearOfBirth = horseData.yearOfBirth.low;
    horseData.height = horseData.height.low;

    response.push(horseData);
  });

  return response;
}

module.exports.getList = async function() {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    const res = await NeoSession.run(`
      MATCH(h: Horse)
      OPTIONAL MATCH (h)-[:HAS]->(r:Reservation {active: 'true'})
      RETURN h, r
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
