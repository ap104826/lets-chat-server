const knex = require('knex')
const app = require('./app')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { PORT, DATABASE_URL } = require('./config')
const { isPrimitive } = require('util')
const MessagesService = require('./messages/messages-service')
const RoomsService = require('./rooms/Rooms-service')
const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})
app.set('db', db)



io.on('connection', socket => {
    socket.on('userJoined', ({ roomId, userId }) => {
        RoomsService.joinRoom(db, roomId, userId)
            .catch((reason) => console.log(reason))
    })

    socket.on('userLeft', ({ roomId, userId }) => {
        RoomsService.leaveRoom(db, roomId, userId)
            .catch((reason) => console.log(reason))
    })

    socket.on('message', (data) => {
        console.log('message', JSON.stringify(data))
        const newMessage = {
            message: data.message,
            user_name: data.user,
            rooms_id: data.room_id
        }
        io.sockets.emit('message', data)
        MessagesService.insert(
            db,
            newMessage
        )
    })
})




http.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})