const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Todo = require("../../src/models/todo.model");

describe("Mongo - Todo Model Creation", function() {
  it("Should require a user", async function() {
    const todo = new Todo({
      title: "New Horse",
      content: "Horse details"
    });

    await expect(todo.save()).to.be.rejected;
  });

  it("Should require a title", async function() {
    const todo = new Todo({
      user: "The Boss",
      content: "Horse details"
    });

    await expect(todo.save()).to.be.rejected;
  });

  it("Should require content", async function() {
    const todo = new Todo({
      user: "The Boss",
      title: "New Horse"
    });

    await expect(todo.save()).to.be.rejected;
  });

  it("Should save with correct values", async function() {
    const todo = new Todo({
      user: "The Boss",
      title: "New Horse",
      content: "Horse details"
    });

    await expect(todo.save()).to.be.fulfilled;

    const TodoFromDB = await Todo.findOne({ _id: todo._id });
    expect(TodoFromDB).to.not.be.null;

    expect(TodoFromDB).to.have.property("created_at");
    expect(TodoFromDB.created_at.year).to.equal(new Date().year);
    expect(TodoFromDB.created_at.month).to.equal(new Date().month);
    expect(TodoFromDB.created_at.day).to.equal(new Date().day);

    expect(TodoFromDB).to.have.property("updated_at");
    expect(TodoFromDB.updated_at.year).to.equal(new Date().year);
    expect(TodoFromDB.updated_at.month).to.equal(new Date().month);
    expect(TodoFromDB.updated_at.day).to.equal(new Date().day);

    expect(TodoFromDB)
      .to.have.property("updated")
      .that.equals(false);
    expect(TodoFromDB)
      .to.have.property("declined")
      .that.equals(false);
    expect(TodoFromDB)
      .to.have.property("done")
      .that.equals(false);
  });
});
