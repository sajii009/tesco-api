const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    status: {
        type: Boolean,
        default: true,
    },
    level1: {
        type: Number,
    },
    level2: {
        type: Number,
    },
    level3: {
        type: Number,
    }
}, { timestamps: true });

const Commission = mongoose.model('Commission', commissionSchema);

module.exports = Commission;
