const mongoose = require('mongoose');

const user_s_otpSchema = new mongoose.Schema({
    Time: String,
    username : String,
    otp : String
}, { timestamps: true });

module.exports = mongoose.model('Users_OTP', user_s_otpSchema);