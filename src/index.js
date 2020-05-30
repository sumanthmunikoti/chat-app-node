const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket ) => {
    console.log('New websocket connection')

    socket.emit('message', 'Welcome, new user!')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has disconnected')
    })

    socket.on('send-location', (location) => {
        io.emit('message', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
    })
})

server.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})
