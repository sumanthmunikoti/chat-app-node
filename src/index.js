const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.emit('message', generateMessage('Welcome, new user!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined'))

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('No curse words allowed!')
        }

        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has disconnected'))
    })

    socket.on('send-location', (location, callback) => {
        io.emit('location-message', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
        callback()
    })
})

server.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})
