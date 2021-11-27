const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jsonwebtoken = require('jsonwebtoken')
const app = express()
const port = 3000
const UserController = require('./controller/user.controller')
const AuthController = require('./controller/auth.controller')
const MessageController = require('./controller/message.controller')
const DiscussionController = require('./controller/discussion.controller')
const {secret} = require('./config')

function isLoggedIn(req, res, next) {
    if (!req.user) {
        return res.status(401).send({message: 'Unauthorized.'})
    }
    next()
}

app.use(bodyParser.json())
app.use(cookieParser())
app.use((req, res, next) => {
    if (!req.cookies.jwt) {
        return next()
    }
    req.user = jsonwebtoken.verify(req.cookies.jwt, secret)
    next()
})

app.use('/api/users', UserController)
app.use('/api/auth', AuthController)
app.use('/api/message', isLoggedIn, MessageController)
app.use('/api/discussion', isLoggedIn, DiscussionController)

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})