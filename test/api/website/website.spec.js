const chai = require("chai");
const assertArrays = require("chai-arrays");
chai.use(assertArrays);
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - /api/horse/", function() {
  let admintoken;
  let horse;
  let website1;
  let website2;

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
      .post("/api/website")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        name: "Facebook",
        URL: "www.facebook.com",
        monthlyPrice: 0,
        pricePerAd: 0
      });

    website1 = res.body;

    res = await requester
      .post("/api/website")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        name: "Instagram",
        URL: "www.instagram.com",
        monthlyPrice: 0,
        pricePerAd: 0
      });

    website2 = res.body;

    await requester
      .put(`/api/website/${website1._id}/horse/${horse._id}`)
      .set("Authorization", `Bearer ${admintoken}`);
  });

  it("GET list should return 2 websites with horses if available", async function() {
    const res = await requester
      .get("/api/website/list")
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(200);
    expect(res.body)
      .to.be.an.array()
      .ofSize(2);
  });

  it("Should fail to delete a website with horses attached", async function() {
    const res = await requester
      .delete(`/api/website/${website1._id}`)
      .set("Authorization", `Bearer ${admintoken}`);

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("This website still advertises horses!");
  });
});
