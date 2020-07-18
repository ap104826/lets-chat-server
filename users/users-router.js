const path = require('path')
const express = require('express')
const xss = require('xss')
const AuthService = require('./Auth-service')
const UsersService = require('./Users-service')
const usersRouter = express.Router()
const jsonParser = express.json()
const bcrypt = require('bcryptjs')


const serializeUser = user => ({
    id: user.id,
    userName: xss(user.user_name),
    password: xss(user.password)
})

usersRouter
    .route('/')
    // .get((req, res, next) => {
    //     const knexInstance = req.app.get('db')
    //     UsersService.getAll(knexInstance)
    //         .then(rooms => {
    //             res.json(rooms.map(serializeRoom))
    //         })
    //         .catch(next)
    // })
    //read username and password from request and send it back in response. 
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
//
// .all((req, res, next) => {
//     UsersService.getById(
//         req.app.get('db'),
//         req.params.id
//     )
//         .then(room => {
//             if (!room) {
//                 return res.status(404).json({
//                     error: { message: `Room doesn't exist` }
//                 })
//             }
//             res.room = room
//             next()
//         })
//         .catch(next)
// })
// .get((req, res, next) => {
//     res.json(serializeUser(res.room))
// })
// .delete((req, res, next) => {
//     MessagesService.deleteMessagesForRoom(
//         req.app.get('db'),
//         req.params.id
//     )
//         .then(() => {
//             UsersService.deleteRoom(
//                 req.app.get('db'),
//                 req.params.id
//             )
//                 .then(numRowsAffected => {
//                     res.status(204).end()
//                 })
//                 .catch(next)
//         })
//         .catch(next)
// })

module.exports = usersRouter