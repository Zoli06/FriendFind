function getRooms(users) {
  const rooms = [];
  var roomsWithoutDuplicate = [];
  for (var i=0; i != users.length; i++) {
    rooms.push(users[i].room);
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