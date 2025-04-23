const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    requestId:{
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', HistorySchema);

module.exports = History;
