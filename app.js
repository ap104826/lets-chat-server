require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const roomsRouter = require('./rooms/rooms-router')
// const bookmarksRouter = require('./bookmarks/bookmarks-router')
const usersRouter = require('./users/users-router')


const app = express()

app.use(morgan())
app.use(helmet())
app.use(cors())

app.use('/api/rooms', roomsRouter)
app.use('/api/users', usersRouter)

// app.use('/api/bookmarks', bookmarksRouter)

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

module.exports = app