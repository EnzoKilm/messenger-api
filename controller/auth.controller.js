const express = require('express')
const {validationResult, body} = require("express-validator");
const router = express.Router()
const UserModel = require('../model/user.model')
const jsonwebtoken = require('jsonwebtoken')
const {secret} = require('../config')
const lib = require('../lib')

/**
 * Login to an account
 * @body-param {String} username - Username of the user
 * @body-param {String} password - Password of the user
 */
router.post('/login',
    body('username')
        .notEmpty()
        .withMessage('Username is required.'),
    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
    lib.checkErrors,
    async (req, res) => {
        const user = await UserModel.findOne({username: req.body.username})
        if (!user) {
            return res.status(404).send({message: 'User not found.'})
        }
        const samePassword = await user.comparePassword(req.body.password)
        if (!samePassword) {
            return res.status(400).send({message: 'Invalid password.'})
        }

        const token = jsonwebtoken.sign({
            _id: user._id
        }, secret)

        res.cookie('jwt', token, {maxAge: 14400000})

        res.send({
            user: user,
            token: token
        })
    }
)

/**
 * Logout of your account
 */
router.delete('/logout', async (req,res) => {
    res.cookie('jwt', '', {maxAge: 0})
    res.send({message: 'Logout successful.'})
})

module.exports = router