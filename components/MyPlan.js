const mongoose = require('mongoose');

const myplanSchema = new mongoose.Schema({
    planId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    investment: {
        type: Number,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    dailyProfit: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    lastClaim: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    }
});

const MyPlan = mongoose.model('MyPlan', myplanSchema);

module.exports = MyPlan;
