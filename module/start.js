const mongoose = require('mongoose');

const StartValidSchema = new mongoose.Schema({
    Time: String,
    user: String,
    valid: String,
}, { timestamps: true });

module.exports = mongoose.model('valid_users_to_play', StartValidSchema);