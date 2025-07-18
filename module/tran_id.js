const mongoose = require('mongoose');

const Trans_UTR_Schema = new mongoose.Schema({
    Time: String,
    UTR: String,
}, { timestamps: true });

module.exports = mongoose.model('UTR', Trans_UTR_Schema);