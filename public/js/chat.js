'use strict';

if (window.location.href.includes('method=createjoin-priv') && !window.location.href.includes('room=priv-')) window.location.href = window.location.href.replace('room=', 'room=priv-')

let messageBox,
  chatMessages,
  roomName,
  userList;
$(document).ready(function () {
  messageBox = document.getElementById('message');
  chatMessages = document.getElementById('chat-messages');
  roomName = document.getElementById('room-name');
  userList = document.getElementById('user-list');
});

let isPrivate = false;

let { username, method, room } = Qs.parse(location.search, {
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

socket.on('inputMessageWithFile', ({message, file}) => {
  inputMessageWithFile(message, file);
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

socket.on('yourMessageWithFile', ({message, file}) => {
  console.log(file);
  outputMessageWithFile(message, file);
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

function upload() {
  const caller = document.getElementById('file')
  //console.log(URL.createObjectURL(caller.files[0]));
  readImage($(caller)).done(function (base64Data) {
    $('#preview').prop('src', base64Data);
    return base64Data;
  });
}

function readImage(inputElement) {
  let deferred = $.Deferred();

  let files = inputElement.get(0).files;
  if (files && files[0]) {
    let fr = new FileReader();
    fr.onload = function (e) {
      deferred.resolve(e.target.result);
    };
    fr.readAsDataURL(files[0]);
  } else {
    deferred.resolve(undefined);
  }

  return deferred.promise();
}

function changeFileCheckbox(caller) {
  if ($(caller).prop('checked')) {
    $("#file").prop('disabled', false);
  } else {
    $("#file").prop('disabled', true);
  }
}

function submitMessage() {
  const message = messageBox.value;

  console.log();

  if ($('#file-checkbox').prop('checked')) {
    //most have been copied upload() because of a bug
    const caller = document.getElementById('file')
    //console.log(URL.createObjectURL(caller.files[0]));
    readImage($(caller)).done(function (base64Data) {
      $('#preview').prop('src', base64Data);
      socket.emit('chatMessageWithFile', {
        file: base64Data,
        comment: message
      }
      );
    });
  } else {
    socket.emit('chatMessageWithFile', message);
  }

  return false;
}

function outputMessage(message) {
  let div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function outputMessageWithFile(message, file) {
  let div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.comment) + '</p><img class="message-file" src="' + file + '" />';
  chatMessages.appendChild(div);
}

function inputMessage(message) {
  let div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function inputMessageWithFile(message) {
  let div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function outputInvite(message) {
  let div = document.createElement('div');
  div.classList.add('outgoing-message', 'conversation');
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + message.text + ' <a target="_blank" href="' + message.link + '&username=' + username + '">Join</a></p>';
  chatMessages.appendChild(div);
}

function inputInvite(message) {
  let div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + message.text + ' <a target="_blank" href="' + message.link + '&username=' + username + '">Join</a></p>';
  chatMessages.appendChild(div);
}

function globalMessage(message) {
  let div = document.createElement('div');
  div.classList.add('global-message');
  div.innerHTML = '<p>' + urlify(message) + '</p>';
  chatMessages.appendChild(div);
}

/*
function getTime(format) {
  let currentTime = new Date();
  let hours = currentTime.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  let minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (format == true) { //12h
    let part = 'am';
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
  if (text == '' || text == undefined || text == null) {
    text = '';
  }

  let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
  let urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;

  return text.replace(urlRegex, function (url) {
    if (url.search(emailRegex) !== -1) {
      return '<a target="_blank" href="mailto:' + url + '">' + url + '</a>';
    } else {
      if (url.search('://') == -1) {
        return '<a target="_blank" href="http://' + url.slice(0, url.search('://')) + '">' + url + '</a>';
      } else {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
      }
    }
  })
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}