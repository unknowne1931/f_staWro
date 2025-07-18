const mongoose = require('mongoose');

const WonSchema = new mongoose.Schema({
    Time: String,
    user : String,
    no : String,
    ID : String
}, { timestamps: true });

module.exports = mongoose.model('Won', WonSchema);