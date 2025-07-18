const mongoose = require('mongoose');

const CliamReqSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String,
    ID : String,
}, { timestamps: true });

module.exports = mongoose.model('Claim_req_Coins', CliamReqSchema);