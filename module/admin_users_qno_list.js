const mongoose = require('mongoose');

const Quest_Summery_Schema = new mongoose.Schema({
    Time: String,
    user: String,
    Qno_sel : [],
}, { timestamps: true });

module.exports = mongoose.model('Users_Posted_Quest_Data', Quest_Summery_Schema);