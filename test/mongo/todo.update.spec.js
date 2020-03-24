const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const Todo = require("../../src/models/todo.model");

describe("Mongo - Todo Model Updating", function() {
  it("Should set updated_at to current date", async function() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todo = new Todo({
      user: "The Boss",
      title: "New Horse",
      content: "Horse details",
      created_at: yesterday,
      updated_at: yesterday
    });

    // Before saving it should be "created" yesterday
    expect(todo.updated_at.year).to.equal(yesterday.year);
    expect(todo.updated_at.month).to.equal(yesterday.month);
    expect(todo.updated_at.day).to.equal(yesterday.day);
    await expect(todo.save()).to.be.fulfilled;

    // After saving it should be "updated" just now
    const TodoFromDB = await Todo.findOne({ _id: todo._id });
    expect(TodoFromDB.updated_at.year).to.equal(today.year);
    expect(TodoFromDB.updated_at.month).to.equal(today.month);
    expect(TodoFromDB.updated_at.day).to.equal(today.day);
  });
});
