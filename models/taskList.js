const mongoose = require('mongoose');

var TasksSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  time: {
    type: String,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _journal: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  }
});

var TaskList = mongoose.model('TaskList', TasksSchema);

module.exports = { TaskList };