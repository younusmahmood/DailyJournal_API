const mongoose = require('mongoose');

var TaskList = mongoose.model('TaskList', {
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
    }
});

module.exports = { TaskList };