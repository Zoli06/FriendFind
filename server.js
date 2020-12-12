"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers,
  getCurrentUserByName
} = require('./utils/users');
const {
  getRooms,
  generateRandomRoom
} = require('./utils/rooms');
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

  io.emit('rooms', getRooms(getAllUsers()));

  socket.on('joinRoom', ({ username, room, isPrivate, method }) => {
    //Validate
    if ((room.slice(0, 5) != 'priv-' && isPrivate) || (room.slice(0, 5) == 'priv-' && !isPrivate) || username == '' || room == '' || (isPrivate != false && isPrivate != true) || method == '') {
      socket.emit('redirect', '/?alert=Error! Wait a bit, reload and then try again');
      return;
    }

    //Check for equal usernames
    let roomUsersUsernames = [];
    for (let i = 0; i != getRoomUsers(room).length; i++) {
      roomUsersUsernames.push(getRoomUsers(room)[i].username)
    }
    if (roomUsersUsernames.includes(username)) {
      socket.emit('redirect', '/?alert=Error! This username is already taken in this room');
      return;
    }

    const user = userJoin(socket.id, username, room, isPrivate);
    socket.join(user.room);

    socket.emit('globalMessage', 'You are connected as ' + user.username);
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

    socket.emit('yourMessage', formatMessage(user.username, message));
    socket.broadcast.to(user.room).emit('inputMessage', formatMessage(user.username, message));
  });

  socket.on('chatMessageWithFile', message => {
    const user = getCurrentUser(socket.id);
    if (message.file.slice(0, 11) != 'data:image/') {
      socket.emit('alert', 'Unsupported file format! We only accept images.');
    } else {
      socket.emit('yourMessageWithFile', { message: formatMessage(user.username, message.comment), file: message.file });
      socket.broadcast.to(user.room).emit('inputMessageWithFile', { message: formatMessage(user.username, message.comment), file: message.file });
    }
  });

  socket.on('sendPrivate', targetName => {
    const user = getCurrentUser(socket.id);
    const target = getCurrentUserByName(targetName);
    const url = 'http://localhost:4000/chat.html?method=createjoin-priv&room=priv-' + generateRandomRoom();

    if (target.id == user.id) {
      socket.emit('alert', 'You can\'t invite yourself!');
    } else {
      socket.emit('yourInvite', formatMessage(user.username, 'You invited ' + target.username + ' to a private chat room.', url));
      io.to(target.id).emit('inputInvite', formatMessage(user.username, user.username + ' invited you to a private room.', url));
    }
  })

});

const PORT = 4000 || process.env.PORT;

server.listen(PORT, () => console.log('Server running on port ' + PORT));