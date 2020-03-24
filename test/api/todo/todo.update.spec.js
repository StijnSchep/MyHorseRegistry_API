const chai = require("chai");
const expect = chai.expect;
const bcrypt = require("bcrypt-nodejs");

const requester = require("../../requester.spec");
const Todo = require("../../../src/models/todo.model");
const User = require("../../../src/models/user.model");

describe("API - PUT /api/todo/:id", function() {
  let todo;
  let admintoken;
  let advertisertoken;

  beforeEach(async function() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    todo = await new Todo({
      user: "The Boss",
      title: "New Horse",
      content: "Horse Details",
      updated_at: yesterday
    }).save();

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

  it("Should send status 404 when id is not found", async function() {
    const res = await requester
      .put("/api/todo/unknown")
      .set("Authorization", `Bearer ${admintoken}`);
    expect(res).to.have.status(404);
    expect(res.body)
      .to.have.property("message")
      .that.equals("No Todo found to update");
  });

  it("Should send status 200 when todo is updated", async function() {
    const res = await requester
      .put("/api/todo/" + todo._id.toString())
      .set("Authorization", `Bearer ${admintoken}`)
      .send({
        _id: todo._id,
        user: todo.user,
        content: "Corrected Horse Details"
      });
    expect(res).to.have.status(200);

    const TodoFromDB = await Todo.findOne({ _id: todo._id });
    expect(TodoFromDB)
      .to.have.property("content")
      .that.equals("Corrected Horse Details");
  });
});
