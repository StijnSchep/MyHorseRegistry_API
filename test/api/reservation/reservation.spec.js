const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - /api/reservation", function() {
  let admintoken;
  let horse;
  let reservation;

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

    res = await requester
      .post("/api/reservation")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        horseId: horse._id,
        customerName: "Jack",
        customerCountry: "Nederland"
      });
    this.reservation = res.body;
  });

  it("Should return a list with 1 reservation", async function() {
    const res = await requester
      .get("/api/reservation/list")
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.be.an.array()
      .ofSize(1);
    expect(res.body[0])
      .to.have.property("_id")
      .that.equals(this.reservation._id);
    expect(res.body[0]).to.have.property("horse");
    expect(res.body[0].horse)
      .to.have.property("_id")
      .that.equals(horse._id);
  });

  it("Should fail to reservate a reservated horse", async function() {
    const res = await requester
      .post("/api/reservation")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        horseId: horse._id,
        customerName: "Jack",
        customerCountry: "Nederland"
      });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Horse already has an active reservation");
  });
});
