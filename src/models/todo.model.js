const mongoose = require("mongoose");
const TodoSchema = require("./schemas/todo.schema");

const Todo = mongoose.model("todo", TodoSchema);

module.exports = Todo;
