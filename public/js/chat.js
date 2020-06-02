const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    //height of the message container
    const containerHeight = $messages.scrollHeight

    //height of the top of the scrollbar from the top + visible height
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('location-message', (username, { url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})  

socket.on('roomData', ({ users, room }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})