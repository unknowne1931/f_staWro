const mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

module.exports = mongoose.model('Balance', BalanceSchema);