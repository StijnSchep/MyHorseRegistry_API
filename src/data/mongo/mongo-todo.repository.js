const Todo = require("../../models/todo.model");

module.exports.getAllTodos = async function() {
  const todos = await Todo.find();
  return todos;
};

module.exports.saveTodo = async function(todo) {
  const newTodo = new Todo(todo);
  return await newTodo.save();
};

module.exports.updateTodo = async function(todo) {
  let TodoFromDb;
  try {
    TodoFromDb = await Todo.findOne({ _id: todo._id });
  } catch (err) {
    return {
      status: "failed",
      error: err
    };
  }

  if (!TodoFromDb) {
    return {
      status: "Not found"
    };
  }

  TodoFromDb.user = todo.user;
  TodoFromDb.updated = true;
  TodoFromDb.content = todo.content;
  TodoFromDb.doBefore = todo.doBefore;
  await TodoFromDb.save();
  return {
    status: "done",
    todo: TodoFromDb
  };
};

module.exports.setDone = async function(todo) {
  let TodoFromDb;
  try {
    TodoFromDb = await Todo.findOne({ _id: todo._id });
  } catch (err) {
    return {
      status: "failed",
      error: err
    };
  }

  if (!TodoFromDb) {
    return {
      status: "Not found"
    };
  }

  TodoFromDb.done = true;
  TodoFromDb.declined = false;
  await TodoFromDb.save();
  return {
    status: "done",
    todo: TodoFromDb
  };
};

module.exports.setDeclined = async function(todo) {
  let TodoFromDb;
  try {
    TodoFromDb = await Todo.findOne({ _id: todo._id });
  } catch (err) {
    return {
      status: "failed",
      error: err
    };
  }

  if (!TodoFromDb) {
    return {
      status: "Not found"
    };
  }

  TodoFromDb.done = false;
  TodoFromDb.declined = true;
  await TodoFromDb.save();
  return {
    status: "done",
    todo: TodoFromDb
  };
};

module.exports.deleteTodo = async function(todo) {
  let TodoFromDb;
  try {
    TodoFromDb = await Todo.findOne({ _id: todo._id });
  } catch (err) {
    return {
      status: "failed",
      error: err
    };
  }

  if (!TodoFromDb) {
    return {
      status: "Not found"
    };
  }

  await TodoFromDb.remove();
  return {
    status: "done",
    todo: TodoFromDb
  };
};
