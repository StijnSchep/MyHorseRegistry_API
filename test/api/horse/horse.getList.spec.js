const chai = require("chai");
const assertArrays = require("chai-arrays");
chai.use(assertArrays);
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - GET /api/horse/list", function() {
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

  it("Should return a list with 1 horse in it", async function() {
    const res = await requester
      .get("/api/horse/list")
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.be.an.array()
      .ofSize(1);
  });
});
