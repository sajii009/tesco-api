const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    lock: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
