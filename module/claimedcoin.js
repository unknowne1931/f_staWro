const mongoose = require('mongoose');

const ClimedReqSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String
}, { timestamps: true });

module.exports = mongoose.model('Claimed_coins', ClimedReqSchema);