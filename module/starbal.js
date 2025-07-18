const mongoose = require('mongoose');

const StarBalSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

module.exports = mongoose.model('users_stars_balance', StarBalSchema);