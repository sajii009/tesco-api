const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    sender: {
        type: String,
    },
    receiver: {
        type: String,
    },
    heading: {
        type: String
    },
    subHeading: {
        type: String
    },
    path: {
        type: String
    },
    seen: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: new Date()
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
