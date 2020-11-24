'use strict';

var messageBox,
  chatMessages,
  roomName,
  userList;
$(document).ready(function () {
  messageBox = document.getElementById('message');
  chatMessages = document.getElementById('chat-messages');
  roomName = document.getElementById('room-name');
  userList = document.getElementById('user-list');
});

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('inputMessage', message => {
  inputMessage(message);
  scroll();
});

socket.on('yourMessage', message => {
  outputMessage(message);
  scroll();
  clearMsg();
});

socket.on('globalMessage', message => {
  globalMessage(message);
  scroll();
});

function submitMessage(caller) {
  const message = messageBox.value;

  socket.emit('chatMessage', message);

  return false;
}

function outputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + message.text + '</p>';
  chatMessages.appendChild(div);
}

function inputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + message.text + '</p>';
  chatMessages.appendChild(div);
}

function globalMessage(message) {
  var div = document.createElement('div');
  div.classList.add('global-message');
  div.innerHTML = '<p>' + message + '</p>';
  chatMessages.appendChild(div);
}

/*
function getTime(format) {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  var minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (format == true) { //12h
    var part = 'am';
    if (hours > 12) {
      hours -= 12;
      part = 'pm'
    }
    if (hours < 10) {
      hours = '0' + hours;
    }
    return hours + ':' + minutes + part;
  } else {
    return hours + ':' + minutes;
  }
}
*/

function scroll() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function clearMsg() {
  messageBox.value = '';
  messageBox.focus();
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}