const express = require('express')
const DiscussionModel = require('../model/discusion.model')
const {body, param, validationResult} = require("express-validator");
const router = express.Router()
const lib = require('../lib')
const UserModel = require("../model/user.model");
const MessageModel = require("../model/message.model");

/**
 * Find all discussions
 * @query-param {Integer} page - Selected page
 * @query-param {Integer} limit - Number of discussions per page
 */
router.get('/', async(req, res) => {
    console.log("test")
    if (!req.query.page && !req.query.limit) {
        console.log("test2")
        const discussions = await DiscussionModel.find({'members.user': req.user._id})
        console.log(discussions.length)
        return res.send({discussions: discussions})
    }

    if (!req.query.page) {
        return res.status(400).send({message: `Please provide a page number.`})
    }

    let page = parseInt(req.query.page)-1
    let limit = 10
    if (req.query.limit) {
        limit = parseInt(req.query.limit)
    }

    const discussions = await DiscussionModel.find({'members': req.user._id}).skip(page*limit).limit(limit)
    return res.send({discussions: discussions})
})

/**
 * Create a discussion
 * @body-param {Array} members - Array containing strings which are ids of the users that we want in the discussion
 */
router.post('/new',
    body('members')
        .notEmpty(),
    lib.checkErrors,
    async (req, res) => {
        try {
            req.body.members.push(req.user._id)

            let discussion = new DiscussionModel(req.body)
            discussion = await discussion.save()
            res.status(201).send({discussion: discussion})
        } catch (e) {
            res.status(400).send(e);
        }
    }
)

/**
 * Find by id
 * @url-param {String} id - ID of the targeted discussion
 */
router.get('/:id',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        const discussion = await DiscussionModel.findOne({_id: req.params.id})
        if (!discussion) {
            return res.status(404).send({message: 'Discussion not found.'})
        }
        res.send({discussion: discussion})
    }
)

/**
 * Add user
 * @url-param {String} id - ID of the targeted discussion
 * @url-param {String} user - ID of the targeted user
 */
router.post('/:id/add/:user',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    param('user')
        .notEmpty()
        .withMessage('User ID is required.')
        .isMongoId()
        .withMessage('User ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        let discussion = await DiscussionModel.findOne({_id: req.params.id})
        if (!discussion) {
            return res.status(404).send({message: 'Discussion not found.'})
        }

        for (let i=0; i < discussion.members.length; i++) {
            if (discussion.members[i].user == req.params.user) {
                res.status(400).send({message: 'The user is already in the discussion.'})
            }
        }

        discussion.members.push({
            user: req.params.user
        })
        discussion = await discussion.save()
        return res.send({discussion: discussion})
    }
)

/**
 * Get discussion messages
 * @url-param {String} id - ID of the targeted discussion
 */
router.get('/:id/messages',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        const discussion = await DiscussionModel.findOne({_id: req.params.id})
        if (!discussion) {
            return res.status(404).send({message: 'Discussion not found.'})
        }

        let message
        let messages = []
        for (let i=0; i < discussion.messages.length; i++) {
            message = await MessageModel.findOne({_id: discussion.messages[i]})
            messages.push(message)
        }

        return res.send({messages: messages})
    }
)

/**
 * Set a discussion as read
 * @url-param {String} id - ID of the targeted discussion
 */
router.put('/:id/read',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        let discussion = await DiscussionModel.findOne({_id: req.params.id})
        if (!discussion) {
            return res.status(404).send({message: 'Discussion not found.'})
        }

        for (let i=0; i < discussion.members.length; i++) {
            if (discussion.members[i].user.toString() === req.user._id) {
                discussion.members[i].read = new Date()
                discussion = await discussion.save()
                break
            }
        }

        return res.send({discussion: discussion})
    }
)

module.exports = router