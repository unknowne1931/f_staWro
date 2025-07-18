const mongoose = require('mongoose');

const user_login_admin_Schema = new mongoose.Schema({
    Time: String,
    username : String,
    password : String,
    language : String,
    email : String
}, { timestamps: true });

module.exports = mongoose.model('Employes_data', user_login_admin_Schema);