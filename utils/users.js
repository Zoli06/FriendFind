const users = [];

function userJoin(id, username, room, isPrivate) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find(user => user.id == id);
}

function getCurrentUserByName(username) {
  return users.find(user => user.username == username);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id == id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room == room);
}

function getAllUsers() {
  return users;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getAllUsers,
  getCurrentUserByName
}