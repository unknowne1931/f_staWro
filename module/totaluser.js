const mongoose = require('mongoose');

const TotalUserSchema = new mongoose.Schema({
    Time: String,
    user : String,
}, { timestamps: true });

module.exports = mongoose.model('Total_users_played', TotalUserSchema);