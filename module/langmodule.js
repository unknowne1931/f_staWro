const mongoose = require('mongoose');

const Lang_SelSchema = new mongoose.Schema({
    Time: String,
    lang : [],
    user : String
}, { timestamps: true });

module.exports = mongoose.model('Language_select', Lang_SelSchema);