const mongoose = require('mongoose');

const Chart_LineSchema = new mongoose.Schema({
    Time: String,
    len : String,
}, { timestamps: true });

module.exports = mongoose.model('Line_chart-1', Chart_LineSchema);