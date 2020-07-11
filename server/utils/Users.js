const _ = require('lodash');

[
  {
    id: '',
    name: '',
    room: '',
    isReady: false,
  },
];

class Users {
  constructor() {
    this.users = [];
  }

  addUser(id, name, room) {
    var user = { id, name, room, isReady: false };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    var user = this.users.filter(user => user.id === id)[0];
    if (user) {
      this.users = this.users.filter(user => user.id !== id);
    }
    return user;
  }

  getUser(id) {
    return this.users.filter(user => user.id === id)[0];
  }

  readyUser(id, room, isReady) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id && this.users[i].room === room) {
        this.users[i].isReady = isReady;
        break;
      }
    }
  }

  areReady(room) {
    console.log('Checking user status...');
    var users = this.users.filter(user => user.room === room);
    let user = users.length > 2 ? users.find(user => user.isReady === false) : true;
    console.log(user);
    return user ? false : true;
  }

  getUserList(room) {
    var users = this.users.filter(user => user.room === room);
    //var namesArray = users.map((user) => user.name);

    return users;
  }
}

module.exports = { Users };
