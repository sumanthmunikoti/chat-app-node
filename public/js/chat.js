const socket = io()

socket.on('message', (msg) => {
    console.log(msg)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.inputMessage.value
    socket.emit('sendMessage', message)
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolcation not supported by this browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
         
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }

        socket.emit('send-location', location)
    })
})

