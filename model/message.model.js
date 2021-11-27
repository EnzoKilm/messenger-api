const mongoose = require('./mongoose')

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
        ref: 'User'
    },
    discussion: {
        type: String,
        required: false,
        ref: 'Discussion'
    }
}, {timestamps: true})

const MessageModel = mongoose.model('message', messageSchema)

module.exports = MessageModel