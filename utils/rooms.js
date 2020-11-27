function getRooms(users) {
  const rooms = [];
  var roomsWithoutDuplicate = [];
  for (var i = 0; i != users.length; i++) {
    if (users[i].room.slice(0, 5) != 'priv-') {
      rooms.push(users[i].room);
    }
  }
  roomsWithoutDuplicate = Array.from(new Set(rooms));
  return roomsWithoutDuplicate;
}

function generateRandomRoom() {
  const length = 4;
  const part = 4;
  var result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i2 = 0; i2 != part; i2++) {
    for (var i = 0; i != length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
  }
  result = result.substring(0, result.length - 1);
  return result;
}

module.exports = {
  getRooms,
  generateRandomRoom
}

/*
const allRooms = [];

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function getRooms(users) {
  const rooms = [];
  var roomsWithoutDuplicate = [];
  for (var i = 0; i != users.length; i++) {
    //if (users[i].room.slice(0, 5) != 'priv-') {
    rooms.push(users[i].room);
    //}

  }
  roomsWithoutDuplicate = Array.from(new Set(rooms));
  for (var i = 0; i != allRooms.length; i++) {
    if (!roomsWithoutDuplicate.includes(allRooms[i].room)) {
      allRooms.slice(i);
    }
    console.log('removed');
  }
  for (var i = 0; i != rooms.length; i++) {
    if (!allRooms.includes(roomsWithoutDuplicate[i])) {
      allRooms.push({ room: roomsWithoutDuplicate[i], private: false });
    }
    console.log('pushed');
  }
  console.log(roomsWithoutDuplicate, allRooms)
  return roomsWithoutDuplicate;
}
*/