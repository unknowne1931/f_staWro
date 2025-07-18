const mongoose = require('mongoose');

const UPI_BANKSchema = new mongoose.Schema({
    Time: String,
    user: String,
    ac_h_nme: String,
    bank_nme : {
        default : "No",
        type : String
    },
    Acc_no : String,
    ifsc : {
        default : "No",
        type : String
    },
    app : {
        default : "No",
        type : String
    },
    type : String

}, { timestamps: true });

module.exports = mongoose.model('Baank_UPI', UPI_BANKSchema);