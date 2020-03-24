module.exports.create = async function(reservation) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    const res = await NeoSession.run(`
          MATCH (h: Horse {_id: ${JSON.stringify(
            reservation.horseId
          )}})-[:HAS]->(:Reservation {active: 'true'}) RETURN h
        `);

    if (res.records.length != 0) {
      return "ActiveReservation";
    }
  } catch (err) {
    NeoSession.close();
    return err;
  }

  try {
    await NeoSession.run(`
          MATCH (h: Horse {_id: ${JSON.stringify(reservation.horseId)}})
          CREATE (r : Reservation {
                _id: ${JSON.stringify(reservation._id)},
                active: ${JSON.stringify(reservation.active)},
                activated_on: ${JSON.stringify(reservation.activated_on)},
                deactivated_on: ${JSON.stringify(reservation.deactivated_on)},
                customerName: ${JSON.stringify(reservation.customerName)},
                customerCountry: ${JSON.stringify(reservation.customerCountry)}
           })-[:BELONGS_TO]->(h)-[:HAS]->(r)
        `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.update = async function(reservation) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
                MATCH(r: Reservation {_id: ${JSON.stringify(reservation._id)}})
                SET r.active = ${JSON.stringify(reservation.active)}
                SET r.deactivated_on = ${JSON.stringify(
                  reservation.deactivated_on
                )}
                SET r.customerName = ${JSON.stringify(reservation.customerName)}
                SET r.customerCountry = ${JSON.stringify(
                  reservation.customerCountry
                )}
                RETURN r._id
            `);

    return;
  } catch (err) {
    NeoSession.close();
    return err;
  }
};

module.exports.delete = async function(_id) {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    await NeoSession.run(`
            MATCH (r:Reservation {_id: ${JSON.stringify(_id)}}) DETACH DELETE r
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
    let reservation = record._fields[0].properties;
    let horse = record._fields[1].properties;
    horse.price = horse.price.low;
    horse.heigth = horse.height.low;
    horse.yearOfBirth = horse.yearOfBirth.low;

    reservation.horse = horse;
    response.push(reservation);
  });

  return response;
}

module.exports.getList = async function() {
  const NeoSession = require("../config/neo4j.config").session;

  try {
    const res = await NeoSession.run(`
            MATCH(r: Reservation)-[:BELONGS_TO]->(h:Horse)
            RETURN r, h
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
