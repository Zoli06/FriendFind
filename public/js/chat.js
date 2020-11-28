'use strict';

if (window.location.href.includes('method=createjoin-priv') && !window.location.href.includes('room=priv-')) window.location.href = window.location.href.replace('room=', 'room=priv-')

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

var isPrivate = false;

var { username, method, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

if (method == 'createjoin-priv') {
  isPrivate = true;
} else {
  isPrivate = false;
}

const socket = io();

socket.emit('joinRoom', { username, room, isPrivate, method });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('inputMessage', message => {
  inputMessage(message);
  scroll();
});

socket.on('inputInvite', message => {
  inputInvite(message);
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

socket.on('yourInvite', message => {
  outputInvite(message);
  scroll();
  clearMsg();
});

socket.on('redirect', function (destination) {
  window.location.href = destination;
});

socket.on('alert', message => {
  alert(message);
});

function submitMessage(caller) {
  const message = messageBox.value;

  socket.emit('chatMessage', message);

  return false;
}

function outputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function inputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function outputInvite(message) {
  var div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + message.text + ' <a target="_blank" href="' + message.link + '&username=' + username + '">Join</a></p>';
  chatMessages.appendChild(div);
}

function inputInvite(message) {
  var div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + message.text + ' <a target="_blank" href="' + message.link + '&username=' + username + '">Join</a></p>';
  chatMessages.appendChild(div);
}

function globalMessage(message) {
  var div = document.createElement('div');
  div.classList.add('global-message');
  div.innerHTML = '<p>' + urlify(message) + '</p>';
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
  if (room.slice(0, 5) != 'priv-') {
    roomName.innerText = room;
  } else {
    roomName.innerText = room.substring(5) + ' (private room)';
  }
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user => {
    const div = document.createElement('div');
    const li = document.createElement('li');
    const i = document.createElement('i');
    li.classList.add('user');
    i.classList.add('fas', 'fa-envelope', 'private');
    i.addEventListener("click", function () {
      sendPrivate(this);
    });
    li.innerText = user.username;
    div.appendChild(li);
    div.appendChild(i);
    userList.appendChild(div);
  });
}

function sendPrivate(caller) {
  const targetName = caller.parentNode.firstChild.innerText;
  socket.emit('sendPrivate', targetName);
}

function urlify(text) {
  var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
  var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;

  return text.replace(urlRegex, function (url) {
    if (url.includes('@')) {
      return '<a target="_blank" href="mailto:' + url + '">' + url + '</a>';
    } else {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    }
  })
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

var text = 'zolixvagyok@gmail.com';
var html = urlify(text);

console.log(html)