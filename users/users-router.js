const path = require('path')
const express = require('express')
const xss = require('xss')
const AuthService = require('./Auth-service')
const UsersService = require('./Users-service')
const usersRouter = express.Router()
const jsonParser = express.json()
const bcrypt = require('bcryptjs')


usersRouter
    .route('/')
    .post(jsonParser, (req, res, next) => {

        const { userName, password } = req.body

        bcrypt.hash(password, 10)
            .then(hash => {
                const newUser = {
                    user_name: userName,
                    password: hash
                }

                for (const [key, value] of Object.entries(newUser)) {
                    if (!value) {
                        return res.status(400).json({
                            error: { message: `Missing '${key}' in request body` }
                        })
                    }
                }

                UsersService.insert(
                    req.app.get('db'),
                    newUser
                )
                    .then(user => {
                        const sub = user.user_name
                        const payload = { user_id: user.id }
                        res
                            .location(path.posix.join(req.originalUrl, `/${user.id}`))
                            .status(201)
                            .json({
                                authToken: AuthService.createJwt(sub, payload),
                                userName
                            })
                    })
                    .catch(next)
            })


    })

usersRouter
    .route('/login')
    .post(jsonParser, (req, res, next) => {
        const { userName, password } = req.body

        UsersService.getByUserName(
            req.app.get('db'),
            userName
        )
            .then(user => {
                if (!user) {
                    return res.status(400).json({
                        error: { message: `user doesn't exist` }
                    })
                }

                bcrypt.compare(password, user.password)
                    .then((passwordsMatch) => {
                        if (!passwordsMatch) {
                            return res.status(400).json({ error: 'Incorrect user_name or password' })
                        }

                        const sub = user.user_name
                        const payload = { user_id: user.id }

                        res.json({
                            authToken: AuthService.createJwt(sub, payload),
                            userName
                        })
                        next()
                    })


            })
            .catch(next)
    })

module.exports = usersRouter