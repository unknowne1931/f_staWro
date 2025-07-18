const mongoose = require('mongoose');

const RupeeSchema = new mongoose.Schema({
    Time: String,
    username : String,
    rupee : String,
}, { timestamps: true });

module.exports = mongoose.model('Rupee', RupeeSchema);