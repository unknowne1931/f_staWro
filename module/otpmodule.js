const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    Time: String,
    username : String,
    OTP : String,
}, { timestamps: true });

module.exports = mongoose.model('OTP_Data', OTPSchema);