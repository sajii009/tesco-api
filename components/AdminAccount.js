const mongoose = require('mongoose');

const AdminAccountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: new Date()
    }
});

const AdminAccount = mongoose.model('AdminAccount', AdminAccountSchema);

module.exports = AdminAccount;
