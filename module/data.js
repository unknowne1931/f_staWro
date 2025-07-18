const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
      
    Time : String,
    pass : String,
    email : String,
    username : String,
    name : String,
    valid : String
});

module.exports = mongoose.model('pass', UsersSchema);
