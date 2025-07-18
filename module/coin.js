const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String
}, { timestamps: true });

module.exports = mongoose.model('Coins', CoinSchema);