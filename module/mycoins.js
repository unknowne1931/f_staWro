const mongoose = require('mongoose');

const MyCoinsSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String
}, { timestamps: true });

module.exports = mongoose.model('My_Coins', MyCoinsSchema);