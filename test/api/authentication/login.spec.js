const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - POST /api/auth/login", function() {
  let user;

  this.beforeEach(async function() {
    user = await new User({
      name: "admin",
      password: bcrypt.hashSync("adminpass"),
      role: 1
    }).save();
  });

  it("Should send status 400 if name is missing", async function() {
    const res = await requester.post("/api/auth/login").send({
      password: "adminpass"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Incorrect name or password");
  });

  it("Should send status 400 if password is missing", async function() {
    const res = await requester.post("/api/auth/login").send({
      name: "admin"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Incorrect name or password");
  });

  it("Should send status 400 if password is incorrect", async function() {
    const res = await requester.post("/api/auth/login").send({
      name: "admin",
      password: "pass"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Incorrect name or password");
  });

  it("Should send status 400 if name is incorrect", async function() {
    const res = await requester.post("/api/auth/login").send({
      name: "not-admin",
      password: "adminpass"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Incorrect name or password");
  });

  it("Should send status 200, token and role if credentials are correct", async function() {
    const res = await requester.post("/api/auth/login").send({
      name: "admin",
      password: "adminpass"
    });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("token");
    expect(res.body)
      .to.have.property("role")
      .that.equals(1);
  });
});
