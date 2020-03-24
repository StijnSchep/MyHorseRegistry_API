const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const Todo = require("../../../src/models/todo.model");
const User = require("../../../src/models/user.model");

describe("API - POST /api/todo", function() {
  let admintoken;
  let advertisertoken;

  this.beforeEach(async function() {
    await new User({
      name: "admin",
      password: bcrypt.hashSync("adminpass"),
      role: 1
    }).save();

    await new User({
      name: "advertiser",
      password: bcrypt.hashSync("advertiserpass"),
      role: 2
    }).save();

    let res = await requester.post("/api/auth/login").send({
      name: "admin",
      password: "adminpass"
    });

    admintoken = res.body.token;

    res = await requester.post("/api/auth/login").send({
      name: "advertiser",
      password: "advertiserpass"
    });

    advertisertoken = res.body.token;
  });

  it("Should return status 400 if user is missing", async function() {
    const res = await requester
      .post("/api/todo")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        title: "New Horse",
        content: "Horse Details"
      });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Todo requires a user");
  });

  it("Should return status 400 if title is missing", async function() {
    const res = await requester
      .post("/api/todo")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        user: "The Boss",
        content: "Horse Details"
      });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Todo requires a title");
  });

  it("Should return status 400 if content is missing", async function() {
    const res = await requester
      .post("/api/todo")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        user: "The Boss",
        title: "New Horse"
      });

    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Todo requires content");
  });

  it("Should send status 401 if an advertiser tries to create a todo", async function() {
    const res = await requester
      .post("/api/todo")
      .set("Authorization", `Bearer ${advertisertoken}`)
      .send({
        user: "The Boss",
        title: "New Horse",
        content: "Horse Details"
      });

    expect(res).to.have.status(401);
    expect(res.body)
      .to.have.property("message")
      .that.equals("Not authorized to create todos");
  });

  it("Should send status 200 with todo details", async function() {
    const res = await requester
      .post("/api/todo")
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        user: "The Boss",
        title: "New Horse",
        content: "Horse Details"
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("_id");
    expect(res.body)
      .to.have.property("user")
      .that.equals("The Boss");
    expect(res.body)
      .to.have.property("updated")
      .that.equals(false);
    expect(res.body)
      .to.have.property("declined")
      .that.equals(false);
    expect(res.body)
      .to.have.property("done")
      .that.equals(false);
    expect(res.body)
      .to.have.property("title")
      .that.equals("New Horse");
    expect(res.body)
      .to.have.property("content")
      .that.equals("Horse Details");

    const TodoFromDB = await Todo.findOne({ _id: res.body._id });
    expect(TodoFromDB).to.not.be.null;
  });
});
