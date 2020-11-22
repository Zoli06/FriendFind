function getRooms(users) {
  const rooms = [];
  var roomsWithoutDuplicate = [];
  for (var i=0; i != users.length; i++) {
    rooms.push(users[i].room);
  }
  roomsWithoutDuplicate = Array.from(new Set(rooms));
  return roomsWithoutDuplicate;
}

module.exports = {
  getRooms
}