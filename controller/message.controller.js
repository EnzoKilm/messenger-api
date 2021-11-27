const express = require('express')
const MessageModel = require('../model/message.model')
const DiscussionModel = require("../model/discusion.model");
const {body, param} = require("express-validator");
const router = express.Router()
const lib = require('../lib')

/**
 * Find all messages
 * @query-param {Integer} page - Selected page
 * @query-param {Integer} limit - Number of discussions per page
 */
router.get('/',
    async (req, res) => {
        if (!req.query.page && !req.query.limit) {
            const messages = await MessageModel.find({author: req.user._id})
            return res.send({messages: messages})
        }

        if (!req.query.page) {
            return res.status(400).send({message: `Please provide a page number.`})
        }

        let page = parseInt(req.query.page)-1
        let limit = 10
        if (req.query.limit) {
            limit = parseInt(req.query.limit)
        }

        const messages = await MessageModel.find({author: req.user._id}).skip(page*limit).limit(limit)
        return res.send({messages: messages})
    }
)

/**
 * Create a message
 * @body-param {String} content - Content of the message
 * @body-param {String} [receiver] - ID of the person who will receive the message
 * @body-param {String} [discussion] - ID of the discussion where the message will be sent
 */
router.post('/new',
    body('content')
        .escape(),
    lib.checkErrors,
    async (req, res) => {
        try {
            req.body.author = req.user._id

            if (req.body.discussion && req.body.receiver) {
                return res.status(400).json({message: 'You must provide a discussion ID or a receiver ID, not both.'})
            }

            if (!req.body.discussion) {
                if (!req.body.receiver) {
                    return res.status(400).json({message: 'Please provide either a discussion ID or a receiver ID.'})
                }

                let discussion = await DiscussionModel.findOne({members:{$all:[req.user._id, req.body.receiver], $size: 2} })

                if (!discussion) {
                    discussion = new DiscussionModel({members: [req.user._id, req.body.receiver]})
                }
                let message = new MessageModel(req.body)
                message.discussion = discussion._id
                message = await message.save()

                discussion.messages.push(message._id)
                discussion = await discussion.save()

                return res.status(201).send({message: message})
            }

            let message = new MessageModel(req.body)
            message = await message.save()

            let discussion = await DiscussionModel.findOne({_id: message.discussion})
            discussion.messages.push(message._id)
            discussion = await discussion.save()

            res.status(201).send({message: message})
        } catch (e) {
            res.status(400).send(e);
        }
    }
)

/**
 * Find by id
 * @url-param {String} id - ID of the targeted message
 */
router.get('/:id',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        const message = await MessageModel.findOne({_id: req.params.id})
        if (!message) {
            return res.status(404).send({message: 'Message not found.'})
        }
        res.send({message})
    }
)

/**
 * Edit message content
 * @url-param {String} id - ID of the targeted message
 * @body-param {String} content - Content of the message
 */
router.put('/:id/edit',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        let message = await MessageModel.findOne({_id: req.params.id})
        if (!message) {
            return res.status(404).send({message: 'Message not found.'})
        }

        if (!req.body.content) {
            return res.status(400).send({message: 'Please provide a valid content.'})
        }

        message.content = req.body.content
        message = await message.save()

        res.send({message})
    }
)

module.exports = router