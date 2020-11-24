'use strict';

var roomList;
$(document).ready(function() {
  roomList = document.getElementById('room-list');
  radioChange(true);
});

const allRooms = [];

const socket = io();

socket.on('rooms', message => {
  console.log('refresh')
  outputRooms(message);
})

function outputRooms(rooms) {
  roomList.innerHTML = '';
  rooms.forEach(room=>{
    const option = document.createElement('option');
    option.innerText = room;
    allRooms.push(room);
    roomList.appendChild(option);
  });
  console.log(rooms);
}

function radioChange(isItJoin) {
  console.log('changed');
  if(isItJoin == true) {
      $('#room-list').prop('required',true).prop('checked', true).prop('disabled', false);
      $('#new-room').prop('required',false).prop('disabled', false).prop('disabled', true);
      console.log('checked');
  } else {
      $('#room-list').prop('required',false).prop('disabled', false).prop('disabled', true);
      $('#new-room').prop('required',true).prop('disabled', true).prop('disabled', false);
      console.log('unchecked');
  }
}

function validate() {
  if($('#create').prop('checked') == true && allRooms.includes($('#new-room').val())) {
    alert('Sorry, but a room with this name already exists');
    return false;
  }
  return true;
}