const mongoose = require('mongoose');

const PendingNotiSchema = new mongoose.Schema({
      
    Time : String,
    user : String,
    idd : String,
    type : String,
    title : String,
    sub : String,

});

module.exports = mongoose.model('Pending_Noti', PendingNotiSchema);
