"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers 
} = require('./utils/users');
const { getRooms } = require('./utils/rooms');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

  io.emit('rooms', getRooms(getAllUsers()));

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit('globalMessage', 'You connected as ' + user.username);
    socket.broadcast.to(user.room).emit('globalMessage', user.username + ' has joined');

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

    io.emit('rooms', getRooms(getAllUsers()));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      socket.broadcast.to(user.room).emit('globalMessage', user.username + ' has disconnected!');

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

    io.emit('rooms', getRooms(getAllUsers()));
  });

  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id);

    socket.emit('yourMessage', message);
    socket.broadcast.to(user.room).emit('inputMessage', formatMessage(user.username, message));

  });

});

const PORT = 4000 || process.env.PORT;

server.listen(PORT, () => console.log('Server running on port ' + PORT));