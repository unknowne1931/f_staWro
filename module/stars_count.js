const mongoose = require('mongoose');

const Stars_CountsSchema = new mongoose.Schema({
    Time: String,
    stars: String,
    count: String,
}, { timestamps: true });

module.exports = mongoose.model('stars_range', Stars_CountsSchema);