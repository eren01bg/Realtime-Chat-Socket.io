const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const usersContainer = document.querySelector('#users');
const roomName = document.querySelector('#room-name');


const params = parseQueryStrings();

const username = params.get('username') ? params.get('username') : '';
const room = params.get('room') ? params.get('room') : '';

const socket = io();

socket.emit('joinRoom', {username, room});

socket.on('roomUsers', ({room ,users}) => {
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msgHolder = e.target.elements.msg;
    const msg = msgHolder.value;

    // Emitting a message to the server.
    socket.emit('chatMessage', msg);
    msgHolder.value = '';
    msgHolder.focus();


})

function outputMessage(message) {

    const username = message.username;
    const time = message.time;
    const text = message.text;

    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = 
    `<p class="meta">${username}<span> ${time}</span></p>
    <p class="text">
       ${text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);

}

function outputRoomName(room) {

    roomName.innerText = room;

}

function outputUsers(users) {

    usersContainer.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

function parseQueryStrings() {
    const url = new URL(window.location);
    const params = url.searchParams;
    return params ? params : {};
}
