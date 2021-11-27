const mongoose = require('./mongoose')

const discussionSchema = new mongoose.Schema({
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            read: {
                type: Date,
                default: null
            }
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ]
}, {timestamps: true})

const MessageModel = mongoose.model('discussion', discussionSchema)

module.exports = MessageModel