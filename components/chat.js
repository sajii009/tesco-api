const mongoose = require('mongoose');

const chatScheme = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    listId: {
        type: String,
    },
    senderName: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    unread: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatScheme);

module.exports = Chat;
