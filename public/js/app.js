'use strict';

var messageBox;
var chatMessages;
$(document).ready(function() {
  messageBox = document.getElementById('message');
  chatMessages = document.getElementById('chat-messages');
});

const socket = io();

socket.on('inputMessage', message => {
  console.log(message);
  inputMessage(message);
  scrollAndClearMsg();
});

socket.on('yourMessage', message => {
  console.log(message);
  outputMessage(message);
  scrollAndClearMsg();
});

socket.on('globalMessage', message => {
  console.log(message);
  globalMessage(message);
  scrollAndClearMsg();
});

function submitMessage(caller) {
  const message = messageBox.value;

  socket.emit('chatMessage', message);

  return false;
}

function outputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  var currentTime = Date.now();
  div.innerHTML = '<p class="meta">Me <span>' + getTime(true) + '</span></p><p class="message-text">' + message + '</p>';
  chatMessages.appendChild(div);
}

function inputMessage(message) {
  var div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  var currentTime = Date.now();
  div.innerHTML = '<p class="meta">Me <span>' + getTime(true) + '</span></p><p class="message-text">' + message + '</p>';
  chatMessages.appendChild(div);
}

function globalMessage(message) {
  var div = document.createElement('div');
  div.classList.add('global-message');
  var currentTime = Date.now();
  div.innerHTML = '<p>' + message + '</p>';
  chatMessages.appendChild(div);
}

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
  if(format == true) { //12h
    var part = 'am';
    if(hours > 12) {
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

function scrollAndClearMsg() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  messageBox.value = '';
  messageBox.focus();
}