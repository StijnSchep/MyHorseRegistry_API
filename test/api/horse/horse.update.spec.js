const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - PUT /api/horse/:id", function() {
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

  it("Should return the updated horse with status 200 when all data is available", async function() {
    horse.title = "Nieuwe titel";
    const res = await requester
      .put(`/api/horse/${horse._id}`)
      .set("Authorization", `Bearer ${admintoken}`)
      .send(horse);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("title")
      .that.equals("Nieuwe titel");
  });
});
