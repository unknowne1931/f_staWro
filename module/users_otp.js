const mongoose = require('mongoose');

const users_otpSchema = new mongoose.Schema({
    Time: String,
    username : String,
    otp : String
}, { timestamps: true });

module.exports = mongoose.model('Employes_otp', users_otpSchema);