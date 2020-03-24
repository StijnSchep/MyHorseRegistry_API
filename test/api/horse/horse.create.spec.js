const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - POST /api/horse/", function() {
  let admintoken;

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
  });

  it("Should return status 400 if details are missing", async function() {
    const res = await requester
      .post("/api/horse")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({});

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("A horse requires a valid official name");
  });

  it("Should return status 200 with horse details when everything is correct", async function() {
    const res = await requester
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
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("_id");
    expect(res.body).to.have.property("date_added");
    expect(res.body).to.have.property("date_sold");
    expect(res.body)
      .to.have.property("status")
      .that.equals("Actief");
  });
});
