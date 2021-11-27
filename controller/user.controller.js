const express = require('express')
const UserModel = require('../model/user.model')
const {validationResult, param} = require("express-validator");
const router = express.Router()
const lib = require('../lib')

/**
 * Create a user
 * @body-param {String} username - Username of the user
 * @body-param {String} password - Password of the user
 */
router.post('/', async (req, res) => {
    try {
        let user = new UserModel(req.body)
        user = await user.save()
        res.status(201).send({user: user})
    } catch (e) {
        res.status(400).send(e);
    }
})

/**
 * Find all users
 */
router.get('/', async (req, res) => {
    const users = await UserModel.find()
    res.send(users)
})

/**
 * Find the current user
 */
router.get('/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).send({message: 'Unauthorized.'})
    }
    const user = await UserModel.findOne({_id: req.user._id})
    if (!user) {
        return res.status(404).send({message: 'User not found.'})
    }
    res.send({user: user})
})

/**
 * Find by id
 * @url-param {String} id - ID of the targetted user
 */
router.get('/:id',
    param('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isMongoId()
        .withMessage('ID needs to be a MongoDB ID.'),
    lib.checkErrors,
    async (req, res) => {
        const user = await UserModel.findOne({_id: req.params.id})
        if (!user) {
            return res.status(404).send({message: 'User not found.'})
        }
        res.send({user})
    }
)

module.exports = router;