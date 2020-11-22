const users = [];

function userJoin(id, username, room) {
  const user = { id, username, room};
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function getAllUsers() {
  return users;
}

function getAllRooms() {
  const rooms = [];
  var roomsWithoutDuplicate = [];
  for (var i=0; i != users.length; i++) {
    rooms.push(users[i].room);
  }
  roomsWithoutDuplicate = Array.from(new Set(rooms));
  return roomsWithoutDuplicate;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers
}