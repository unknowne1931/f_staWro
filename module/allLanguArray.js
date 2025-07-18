const mongoose = require('mongoose');

const AllLanguagesSchema = new mongoose.Schema({
    Time: String,
    lang : []
}, { timestamps: true });

module.exports = mongoose.model('All_Languages', AllLanguagesSchema);