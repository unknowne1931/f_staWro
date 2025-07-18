const mongoose = require('mongoose');

const WishSchema = new mongoose.Schema({
    Time: String,
    IP: String,
    City : String,
}, { timestamps: true });

module.exports = mongoose.model('Wish_Ip', WishSchema);