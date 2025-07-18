const mongoose = require('mongoose');

const Questions_usersSchema = new mongoose.Schema({
    Time: String,
    user: String,
    img : String,
    Questio : String,
    qno : String,
    a : String,
    b : String,
    c : String,
    d : String,
    Ans : String,
    lang :String,
    tough : String,
    seconds : String,
}, { timestamps: true });

module.exports = mongoose.model('Questions_Bank', Questions_usersSchema);