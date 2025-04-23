const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Bank = mongoose.model('Bank', BankSchema);

module.exports = Bank;
