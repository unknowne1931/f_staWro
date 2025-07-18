const mongoose = require('mongoose');

const CuponSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    type : String,
    user : String,
    no : String
}, { timestamps: true });

module.exports = mongoose.model('Cupon_s', CuponSchema);