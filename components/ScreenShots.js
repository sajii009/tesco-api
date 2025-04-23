const mongoose = require('mongoose');

const ScreenShotSchema = new mongoose.Schema({
    image1: {
        type: String,
        required: true
    },
    payerId: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0 
    },
    verify: {
        type: Boolean,
        default: false
    },
    scam: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const ScreenShots = mongoose.model('ScreenShot', ScreenShotSchema);

module.exports = ScreenShots;
