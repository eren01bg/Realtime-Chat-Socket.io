const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot'

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        // socket.emit - will emit to the user that is connecting
        socket.emit('message', formatMessage(botName,'welcome to chatcord!'));
    
        // When a user connects. Broadcast - will emit to everybody except the user that connected.
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        
    })
    
    
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
    
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })
    // When a user disconnects.
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })

})


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log('server listening on port', PORT);
});