const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - DELETE /api/horse/:id", function() {
  let admintoken;
  let horse;

  this.beforeEach(async function() {
    await new User({
      name: "admin",
      password: bcrypt.hashSync("adminpass"),
      role: 1
    }).save();

    let res = await requester.post("/api/auth/login").send({
      name: "admin",
      password: "adminpass"
    });

    admintoken = res.body.token;

    res = await requester
      .post("/api/horse")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        officialName: "Horsalot",
        commonName: "Horsy",
        category: "dressuur",
        yearOfBirth: 2005,
        gender: "ruin",
        color: "zwart",
        height: 172,
        price: 4300,
        title: "Een lief paard",
        description: "Beschrijving"
      });
    horse = res.body;
  });

  it("Should return status 200 when deleting a horse with no relationships", async function() {
    const res = await requester
      .delete(`/api/horse/${horse._id}`)
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(200);
  });

  it("Should return status 400 when deleting a horse with a website relationship", async function() {
    const NeoSession = require("../../../src/data/config/neo4j.config").session;

    await NeoSession.run(`
            MATCH(h:Horse {_id: ${JSON.stringify(horse._id)}})
            MERGE (h)-[:ADVERTISED_ON]->(:Website)-[:ADVERTISES]->(h)
        `);

    const res = await requester
      .delete(`/api/horse/${horse._id}`)
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("This horse is still attached to a website!");
  });
});
