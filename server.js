const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  console.log('New connection...');

  socket.emit('globalMessage', 'You connected')
  socket.broadcast.emit('globalMessage', 'A user has joined');

  socket.on('disconnect', () => {
    socket.broadcast.emit('message', 'A user has disconnected!');
    console.log('Closed a connection...')
  });

  socket.on('chatMessage', message => {
    socket.emit('yourMessage', message);
    socket.broadcast.emit('inputMessage', message);
  });
});

const PORT = 4000 || process.env.PORT;

server.listen(PORT, () => console.log('Server running on port ' + PORT));