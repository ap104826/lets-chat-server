const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')
const MessagesService = require('./Messages/Messages-service')
const RoomsService = require('./rooms/Rooms-service')
const UsersService = require('./users/Users-service')
const AuthService = require('./users/Auth-service')
const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})
app.set('db', db)

const server = app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})

const io = require('socket.io')(server, { origins: '*:*' })

io.on('connection', socket => {
    socket.on('userJoined', ({ roomId, authToken }) => {
        const payload = AuthService.verifyJwt(authToken)
        const userId = payload.user_id
        const userName = payload.sub

        RoomsService.joinRoom(db, roomId, userId)
            .catch((reason) => {
                console.log(reason)
            })
            .finally(() => {
                io.sockets.emit('userJoined', { id: userId, user_name: userName, roomId })
            })


    })

    socket.on('userLeft', ({ roomId, authToken }) => {
        const payload = AuthService.verifyJwt(authToken)
        const userId = payload.user_id
        io.sockets.emit('userLeft', { id: userId, roomId })

        RoomsService.leaveRoom(db, roomId, userId)
            .catch((reason) => console.log(reason))
    })

    socket.on('message', ({ message, authToken }) => {

        const payload = AuthService.verifyJwt(authToken)
        const userId = parseInt(payload.user_id)

        const newMessage = {
            message: message.message,
            rooms_id: message.room_id,
            user_id: userId
        }
        MessagesService.insert(
            db,
            newMessage
        ).then((createdMessage) => {
            //get the message with the user_name
            UsersService.getById(db, userId)
                .then(storedUser => {
                    createdMessage.user_name = storedUser.user_name
                    io.sockets.emit('message', createdMessage)
                })
        })
    })
})

