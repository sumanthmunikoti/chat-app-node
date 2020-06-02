const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message', ({ text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('location-message', (message) => {
    const html = Mustache.render(locationTemplate, {
        message
    })
    $messages.insertAdjacentHTML('beforeend', html)
})  

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.inputMessage.value

    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            console.log(error)
        }
        console.log('Message delivered')
    })

})

document.querySelector('#send-location').addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation) {
        return alert('Geolocation not supported by this browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
         
        $sendLocationButton.removeAttribute('disabled')

        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }

        socket.emit('send-location', location, () => {
            console.log('Location details delivered')
        })
    })
})

