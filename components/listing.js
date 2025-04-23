const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountURL: {
        type: String,
        required: true,
    },
    accountAge: {
        type: Number,
        required: true,
        min: 0
    },
    accountType: {
        type: String,
        required: true,
    },
    uploadImage: {
        type: String,
        required: true
    },
    accountDescription: {
        type: String,
        required: true
    },
    accountPrice: {
        type: Number,
        min: 0
    },
    contactEmail: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    followers: {
        type: Number,
        min: 0
    },
    engagement: {
        type: Number,
        min: 0
    },
    revenue: {
        type: Number,
        min: 0
    },
    platform: {
        type: String,
        required: true
    },
    transactionType: {
        sell: {
            type: Boolean,
            default: true
        },
        valuation: {
            type: Boolean,
            default: false
        },
        exchange: {
            type: Boolean,
            default: false
        }
    },
    exchangeRequirements: {
        type: String
    },
    preferredPayment: {
        type: String,
        default: 'paypal'
    },
    termsAgree: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    estimatedValue: {
        type: Number,
        default: 0
    },
    valuationNote: {
        type: String,
        default: 'empty'
    },
}, { timestamps: true });

const listing = mongoose.model('Account', accountSchema);
module.exports = listing;