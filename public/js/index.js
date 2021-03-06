'use strict';

let roomList;
$(document).ready(function () {
  roomList = document.getElementById('room-list');
  setRadioStatus();
});

const alertMessage = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

if (alertMessage['alert'] != 0 && alertMessage['alert'] != undefined && alertMessage['alert'] != null) {
  alert(alertMessage['alert']);
  window.location.href = '/';
}

const allRooms = [];

const socket = io();

socket.on('rooms', message => {
  outputRooms(message);
})

function outputRooms(rooms) {
  roomList.innerHTML = '';
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.innerText = room;
    allRooms.push(room);
    roomList.appendChild(option);
  });
}

function radioChange(isItJoin, isPrivate) {
  if (isItJoin == true && isPrivate == false) {
    $('#room-list').prop('required', true).prop('checked', true).prop('disabled', false).show();
    $('#new-room, #createjoin-priv-room').prop('required', false).prop('disabled', true).hide();
  } else if (isItJoin == false && isPrivate == false) {
    $('#room-list, #createjoin-priv-room').prop('required', false).prop('disabled', true).hide();
    $('#new-room').prop('required', true).prop('disabled', false).show();
  } else if (isItJoin == false && isPrivate == true) {
    $('#room-list, #new-room').prop('required', false).prop('disabled', true).hide();
    $('#createjoin-priv-room').prop('required', true).prop('disabled', false).show();
  }
}

function validate() {
  if ($('#create').prop('checked') && allRooms.includes($('#new-room').val())) {
    alert('Sorry, but a room with this name already exists');
    return false;
  }
  return true;
}

function setRadioStatus() {
  if ($('#createjoin-priv').prop('checked')) {
    radioChange(false, true);
  } else if ($('create').prop('checked')) {
    radioChange(false, false);
  } else {
    radioChange(true, false);
  }
}