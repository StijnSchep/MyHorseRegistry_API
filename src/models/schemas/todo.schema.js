const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  user: {
    type: String,
    required: [true, "Name is required"]
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  updated_at: {
    type: Date,
    default: new Date()
  },
  updated: {
    type: Boolean,
    default: false
  },
  declined: {
    type: Boolean,
    default: false
  },
  done: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: [true, "To-Do title is required"]
  },
  content: {
    type: String,
    required: [true, "To-Do content is required"]
  },
  doBefore: Date
});

TodoSchema.pre("save", function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = TodoSchema;
