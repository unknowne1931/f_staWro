const mongoose = require('mongoose');

const QuestionListSchema = new mongoose.Schema({
    Time: String,
    user: String,
    lang :String,
    list : [],
    oldlist : [],
}, { timestamps: true });

module.exports = mongoose.model('Question_List', QuestionListSchema);