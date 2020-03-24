const chai = require("chai");
const expect = chai.expect;

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - POST /api/auth/register", function() {
  it("Should return status 400 if name is missing", async function() {
    const res = await requester.post("/api/auth/register").send({
      password: "secret",
      role: 1
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("A user requires a name");
  });

  it("Should return status 400 if password is missing", async function() {
    const res = await requester.post("/api/auth/register").send({
      name: "secret",
      role: 1
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("A user requires a password");
  });

  it("Should return status 400 if role is missing", async function() {
    const res = await requester.post("/api/auth/register").send({
      name: "secret",
      password: "secret"
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("A user requires a valid role");
  });

  it("Should return status 400 if role is invalid", async function() {
    const res = await requester.post("/api/auth/register").send({
      name: "secret",
      password: "secret",
      role: 4
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("A user requires a valid role");
  });

  it("Should return status 200 if user is valid", async function() {
    const res = await requester.post("/api/auth/register").send({
      name: "secret",
      password: "secret",
      role: 1
    });

    expect(res).to.have.status(200);
    expect(res.body)
      .to.have.property("message")
      .that.equals("User was succesfully registered");

    const userFromDB = await User.findOne({ name: "secret" });
    expect(userFromDB).to.not.be.null;
    expect(userFromDB)
      .to.have.property("role")
      .that.equals(1);
  });

  it("Should return status 400 if username already exists", async function() {
    await requester.post("/api/auth/register").send({
      name: "secret",
      password: "secret",
      role: 1
    });

    const res = await requester.post("/api/auth/register").send({
      name: "secret",
      password: "secret",
      role: 1
    });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Username already exists");
  });
});
