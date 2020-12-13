'use strict';

if (window.location.href.includes('method=createjoin-priv') && !window.location.href.includes('room=priv-')) window.location.href = window.location.href.replace('room=', 'room=priv-')

let isPrivate = false;

let { username, method, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const animateDuration = 250;

let messageBox,
  chatMessages,
  roomName,
  userList;
$(document).ready(function () {
  messageBox = document.getElementById('message');
  chatMessages = document.getElementById('chat-messages');
  roomName = document.getElementById('room-name');
  userList = document.getElementById('user-list');
  document.getElementById('name').innerText = username;
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

socket.on('inputMessageWithFile', ({ message, file }) => {
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

socket.on('yourMessageWithFile', ({ message, file }) => {
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

socket.on('redirect', destination => {
  window.location.href = destination;
});

/*socket.on('disconnect', () => {
  console.log('Reconnect');
  socket.connect();
  socket.emit('joinRoom', { username, room, isPrivate, method });
})*/

socket.on('alert', message => {
  alert(message);
});

function upload() {
  const caller = document.getElementById('file')
  readImage($(caller)).done(function (base64Data) {
    if (base64Data == undefined) {
      $('#preview').prop('src', '')
    } else {
      $('#preview').prop('src', base64Data);
    }
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

function submitMessage() {
  const message = messageBox.value;

  let fileHtmlObj = document.getElementById('file');

  if (fileHtmlObj.files[0] != undefined) {
    //most have been copied from upload() because of a bug
    //console.log(URL.createObjectURL(caller.files[0]));
    readImage($(fileHtmlObj)).done(function (base64Data) {
      $('#preview').prop('src', base64Data);
      socket.emit('chatMessageWithFile', {
        file: base64Data,
        comment: message
      }
      );
      resetUpload();
    });
  } else {
    socket.emit('chatMessage', message);
  }

  return false;
}

function resetUpload() {
  let fileHtmlObj = document.getElementById('file');
  let tempFileHtmlObj = document.createElement('input');

  $(tempFileHtmlObj).prop('type', 'file').prop('id', 'file').prop('accept', 'image/*').prop('name', 'file');
  fileHtmlObj.remove();
  $('#preview').prop('src', '');
  document.getElementById('message').after(tempFileHtmlObj)
  document.getElementById('file').setAttribute('onchange', 'upload()');
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
  div.innerHTML = '<p class="meta">Me <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p><img class="message-file" src="' + file + '" />';
  chatMessages.appendChild(div);
}

function inputMessage(message) {
  let div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p>';
  chatMessages.appendChild(div);
}

function inputMessageWithFile(message, file) {
  let div = document.createElement('div');
  div.classList.add('incoming-message', 'conversation');
  div.innerHTML = '<p class="meta">' + message.username + ' <span>' + message.time + '</span></p><p class="message-text">' + urlify(message.text) + '</p><img class="message-file" src="' + file + '" />';
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

function openMenu(open) {
  if (open) {
    $('.menu-open').css({
      'display' : 'none'
    }, animateDuration);

    $('.menu-open').animate({
      'opacity': '0'
    }, animateDuration);

    $('.menu-close').css({
      'display' : 'block'
    }, animateDuration);

    $('.menu-close').animate({
      'opacity': '1',
    }, animateDuration);
    
    $('.chat').animate({
      'width' : '75%'
    }, animateDuration);
    
    $('.list').animate({
      'width' : '25%'
    }, animateDuration);

    $('.message').animate({
      'width' : '25vw'
    }, animateDuration);
  } else {
    $('.menu').animate({
      'opacity': '1',
      'position' : 'absolute',
      'margin-top' : '2vmin',
    }, animateDuration);
    
    $('.menu-close').animate({
      'opacity': '0',
      'margin-left' : '2vmin'
    }, animateDuration);

    $('.menu-close').css({
      'display' : 'none'
    }, animateDuration);

    $('.menu-open').animate({
      'margin-left' : '5vw'
    }, animateDuration);

    $('.menu-open').css({
      'display' : 'block'
    }, animateDuration);
    
    $('.list').animate({
      'width' : '0%'
    });
    
    $('.chat').animate({
      'width' : '100%'
    });

    $('.message').animate({
      'width' : '40vw'
    }, animateDuration);
  }
}