const path = require('path')
const express = require('express')
const xss = require('xss')
const RoomsService = require('./Rooms-service')
const MessagesService = require('../messages/messages-service')
const roomsRouter = express.Router()
const jsonParser = express.json()


const serializeRoom = room => ({
    id: room.id,
    name: xss(room.name),
    modified: room.modified
})
const serializeMessage = message => ({
    id: message.id,
    name: xss(message.name),
    user_name: xss(message.user_name),
    modified: message.modified,
    message: xss(message.message)
})

roomsRouter
    .route('/:id/messages')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        RoomsService.getmessagesbyroomId(knexInstance, req.params.id)
            .then(messages => {
                res.json(messages.map(serializeMessage))
            })
            .catch(next)
    })
roomsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        RoomsService.getAll(knexInstance)
            .then(rooms => {
                res.json(rooms.map(serializeRoom))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        // for (const [key, value] of Object.entries(newRoom)) {
        //     if (value == null) {
        //         return res.status(400).json({
        //             error: { message: `Missing '${key}' in request body` }
        //         })
        //     }
        // }
        const { name } = req.body
        const newRoom = { name }

        RoomsService.insert(
            req.app.get('db'),
            newRoom
        )
            .then(room => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${room.name}`))
                    .json(serializeRoom(room))
            })
            .catch(next)
    })

roomsRouter
    .route('/:id')
    .all((req, res, next) => {
        RoomsService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(room => {
                if (!room) {
                    return res.status(404).json({
                        error: { message: `Room doesn't exist` }
                    })
                }
                res.room = room
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeRoom(res.room))
    })
    .delete((req, res, next) => {
        MessagesService.deleteMessagesForRoom(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                RoomsService.deleteRoom(
                    req.app.get('db'),
                    req.params.id
                )
                    .then(numRowsAffected => {
                        res.status(204).end()
                    })
                    .catch(next)
            })
            .catch(next)
    })

// roomsRouter
//     .route('/:id/users/:userId')
//     .post((req, res, next) => {
//         RoomsService.joinRoom(
//             req.app.get('db'),
//             req.params.id,
//             req.params.userId
//         )
//             .then(() => res.status(200).send())
//             .catch(next)
//     })
//     .delete((req, res, next) => {
//         RoomsService.leaveRoom(
//             req.app.get('db'),
//             req.params.id,
//             req.params.userId
//         )
//             .then(() => res.status(200).send())
//             .catch(next)
//     })

module.exports = roomsRouter