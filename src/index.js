const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error) {
            return callback(error)
        }
        
        socket.join(room)

        socket.emit('message', generateMessage('Admin', `Welcome, ${username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage(username, `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const { username, room } = getUser(socket.id)

        if (filter.isProfane(message)) {
            return callback('No curse words allowed!')
        }

        io.to(room).emit('message', generateMessage(username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has disconnected`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('send-location', ({ latitude, longitude }, callback) => {
        const { username, room } = getUser(socket.id)

        io.to(room).emit('location-message', username, generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })
})

server.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})
