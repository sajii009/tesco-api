const mongoose = require('mongoose');

const adminRegisterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const AdminRegister = mongoose.model('AdminRegister', adminRegisterSchema);

module.exports = AdminRegister;
