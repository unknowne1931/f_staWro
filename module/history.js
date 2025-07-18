const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
      
    Time : String,
    user : String,
    rupee : String,
    type : String,
    tp : String

});

module.exports = mongoose.model('History', HistorySchema);
