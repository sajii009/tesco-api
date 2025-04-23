const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
    sender: {
        type: String,
    },
    receiver: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    pending: {
        type: Boolean,
        default: true
    },
    scam: {
        type: Boolean,
        default: false,
    },
    charges: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Withdraw = mongoose.model('Withdraw', WithdrawSchema);

module.exports = Withdraw;
