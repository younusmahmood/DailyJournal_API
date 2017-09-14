const _ = require("lodash");
const mongoose = require("mongoose");
const dateFormat = require('dateformat')

var now = new Date()

var JournalSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  notes: {
    type: String,
    default: ""
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

var Journal = mongoose.model("Journal", JournalSchema);

module.exports = { Journal };