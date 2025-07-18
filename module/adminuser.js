const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
    Time: String,
    username : String,
    pass : String,
}, { timestamps: true });

module.exports = mongoose.model('Admin_Users', AdminUserSchema);