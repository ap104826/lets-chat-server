const knex = require('knex')
const app = require('./app')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { PORT, DATABASE_URL } = require('./config')
const { isPrimitive } = require('util')

io.on('connection', socket => {
    socket.on('message', ({ roomId, message }) => {
        io.sockets.emit('message', { roomId, message })
    })
})

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})
app.set('db', db)


http.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})