const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const User = require("../../../src/models/user.model");

describe("API - GET /api/todo/list", function() {
  let user;
  let token;

  this.beforeEach(async function() {
    user = await new User({
      name: "admin",
      password: bcrypt.hashSync("adminpass"),
      role: 1
    }).save();

    const res = await requester.post("/api/auth/login").send({
      name: "admin",
      password: "adminpass"
    });

    token = res.body.token;
  });

  it("Should send status 401 if no token is provided", async function() {
    const res = await requester.get("/api/todo/list");

    expect(res).to.have.status(401);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Authorization token missing!");
  });

  it("Should send status 401 if token is invalid", async function() {
    const res = await requester
      .get("/api/todo/list")
      .set("Authorization", `Bearer invalid`);

    expect(res).to.have.status(401);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Error validating token");
  });

  it("Should send status 200 if token is valid", async function() {
    const res = await requester
      .get("/api/todo/list")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
  });
});
