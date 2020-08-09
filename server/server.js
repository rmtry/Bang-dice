const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// const {generateMessage, generateLocationMessage} = require('./utils/message.js');
// const {isRealString} = require('./utils/validation');
const { Users } = require('./utils/users');
const { Games, Game } = require('./utils/games');
const { Player } = require('./utils/player');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
var games = new Games();
let count = 0;
let room = 0;
let readyUsers = [];
app.use(express.static(publicPath));

let gameBegin;

// take the current users in the room and generate role and character to become a "Player"
generatePlayers = (room, users) => {
  let quantity = users.length;
  console.log('generated users', users);
  let roles = [];
  let characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q'];
  let players = [];
  let roleId = undefined;
  let characterId = undefined;

  switch (quantity) {
    case 3:
      roles = ['S', 'R', 'O'];
      break;
    case 4:
      roles = ['S', 'V', 'O', 'O'];
      break;
    case 5:
      roles = ['S', 'V', 'O', 'O', 'R'];
      break;
    case 6:
      roles = ['S', 'V', 'O', 'O', 'R', 'V'];
      break;
    case 7:
      roles = ['S', 'V', 'O', 'O', 'R', 'R', 'O'];
      break;
    default:
      roles = ['S', 'V', 'O', 'O', 'R', 'V', 'O', 'R'];
      break;
  }

  console.log('generated roles', roles);

  for (let i = 0; i < users.length; i++) {
    roleId = roles[Math.floor(Math.random() * roles.length)];
    characterId = characters[Math.floor(Math.random() * characters.length)];

    let player = new Player(users[i].id, room, roleId, characterId, i);
    console.log('generated player', player);

    players.push(player);

    roles.splice(roles.indexOf(roleId), 1);
    characters.splice(characters.indexOf(characterId), 1);
    console.log('generated roles left', roles);
    console.log('generated characters left', characters);
  }

  return players;
};

io.on('connection', socket => {
  /*  if (Object.keys(users.users).length >= 4) {
    console.log('stop', Object.keys(users.users).length);
    socket.emit('stop', {
      doStop: true,
    });
  } */
  /* if (count > 4) {
    console.log('count1' + count);
    users.removeUser(socket.id);
    socket.disconnect();
  } */
  console.log('new user');

  const startTheGame = (room, socketId) => {
    let now = new Date();
    io.to(room).emit('adminMessage', {
      time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      message: 'The game has begun!',
    });

    // generate the game with users in the room
    let usersInRoom = users.getUserList(room);
    let players = generatePlayers(room, usersInRoom);
    console.log('generated players', players);
    games.addGame(room, players, true);
    console.log('generated games', games);

    let currentGame = games.getGame(room);
    console.log('current game', currentGame.players);

    // send the new generated game to client
    io.to(room).emit('gameData', {
      ...currentGame,
      players: currentGame.players.filter(player => player.id === socketId),
    });
    io.to(room).emit('adminMessage', {
      time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      message: 'Game will start soon, prepare for the battle!',
    });

    // define the first turn
    let position = currentGame.currentTurnIndex;

    // define the logic to switch the turn, each turn 5s
    let turn = position => {
      // send the current turn data to the client
      io.to(room).emit('gameData', {
        ...currentGame,
        players: currentGame.players.filter(player => player.id === socketId),
      });
      io.to(room).emit('adminMessage', {
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        message: 'Turn of player position ' + position,
      });

      console.log('Turn of ', position);

      // execute after 5s
      setTimeout(() => {
        console.log('Turn end ', position);
        io.to(room).emit('adminMessage', {
          time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
          message: 'Turn of player position ' + position + ' ended',
        });

        console.log('checking game it can be continued...');
        games.checkGameStatus(room);

        if (games.checkGameContinue(room)) {
          position++;
          if (position === currentGame.players.length) position = 0;
          console.log('Havent reached the end, game continues...');
          turn(position);
        } else {
          console.log('There is a winner, game ended...');
          let player = games.getGame(room).winner;
          console.log('The winner is', player);
          let winner;
          switch (player.roleId) {
            case 'O':
              winner = 'Outlaws';
              break;
            case 'S':
              winner = 'Sherif';
              break;
            case 'R':
              winner = 'Renegades';
              break;
          }
          io.to(room).emit('adminMessage', {
            time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
            message: `Game has ended, The ${winner} wins!`,
          });
        }
      }, 5000);

      // action in the turn
      games.useEffect(room, 'shoot', 2, position, position);
      console.log('action happened ');
      console.log(
        'Game history',
        games.getGame(room).players.map(player => ({ role: player.roleId, health: player.health })),
      );
    };

    // Actual run the turn() after 5s to let users prepare
    setTimeout(() => {
      turn(position);
    }, 1000);
  };

  socket.on('action', (params, callback) => {
    console.log(`Action from Player: ${params.name}, index ${params.index}`);
  });
  // if (Object.keys(users.users).length < 4) {
  console.log('number', Object.keys(users.users).length);
  socket.on('join', (params, callback) => {
    /*
          if (!isRealString(params.name) || !isRealString(params.room)) {
              return callback('Name and room name are required');
          }
          */

    socket.join(params.room);
    users.removeUser(socket.id);

    users.addUser(socket.id, params.name, params.room);
    console.log('sid', socket.id);
    count = Object.keys(users.getUserList(params.room)).length;
    room = params.room;

    console.log('count', count);
    console.log('room', params.room);
    if (Object.keys(users.getUserList(params.room)).length > 4) {
      users.removeUser(socket.id);
      io.to(socket.id).emit('checkCurrentUser', { count, room });
    } else {
      io.to(socket.id).emit('checkCurrentUser', { count, room });
      console.log('cc', Object.keys(users.users).length);
      let now = new Date();
      io.to(params.room).emit('adminMessage', {
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        message: `${params.name} joined the room`,
      });
      io.to(params.room).emit('updateUserList', users.getUserList(params.room));

      // socket.emit('statusMessage', generateMessage('Admin', 'Welcome to the chatapp!'));
      socket.emit('statusMessage', { from: 'Admin', message: 'Welcome ' + params.name + ' to the game!' });

      // socket.broadcast.to(params.room).emit('statusMessage', generateMessage('Admin', params.name +' joined!'));
      //
      //
      /* } else if (Object.keys(users.users).length >= 4) {
              console.log('cc1', Object.keys(users.users).length);
        
              let now = new Date();
              io.to(params.room).emit('adminMessage', {
                time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
                message: `Room is full`,
              });
            } */
      console.log(users.getUser(params.room));
      callback();
    }
  });
  //}

  socket.on('ready', (params, callback) => {
    users.readyUser(params.id, params.room, params.isReady);
    if (params.isReady) {
      readyUsers.push({ id: params.id });
    } else if (!params.isReady) {
      readyUsers.map(user => {
        if (user.id === params.id) readyUsers.pop(user);
      });
    }
    console.log('ready users', readyUsers.length);

    if (readyUsers.length === 2) {
      let now = new Date();
      io.to(params.room).emit('adminMessage', {
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        message: `Game requires 3 or more than 3 people to start`,
      });
    }

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    console.log(`User ${params.id} is ${params.isReady}`);

    if (users.areReady(params.room)) {
      console.log('All users ready, Game will be start in 4s');
      let now = new Date();
      io.to(params.room).emit('adminMessage', {
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        message: `All players ready. Game will start in a few seconds...`,
      });
      gameBegin = setTimeout(() => {
        // console.log('Game starts!')
        startTheGame(params.room, params.id);
      }, 5000);
    } else {
      if (gameBegin) {
        let now = new Date();
        io.to(params.room).emit('adminMessage', {
          time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
          message: `Game cancelled.`,
        });
      }
      clearTimeout(gameBegin);
    }

    callback();
  });

  socket.on('leave', (params, callback) => {
    /*
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        }
        */
    socket.leave(params.room);
    users.removeUser(socket.id, params.name, params.room);
    let now = new Date();
    io.to(params.room).emit('adminMessage', {
      time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      message: `${params.name} left the room`,
    });
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    // socket.emit('statusMessage', generateMessage('Admin', 'Welcome to the chatapp!'));
    socket.emit('statusMessage', { from: 'Admin', message: params.name + 'left the game!' });

    // socket.broadcast.to(params.room).emit('statusMessage', generateMessage('Admin', params.name +' joined!'));
    //
    //
    console.log('an user left the room', params.room);
    callback();
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      // io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
      socket.broadcast
        .to(user.room)
        .emit('statusMessage', { from: 'Admin', message: `${user.name} has left the room` });
      console.log('An User left the room.');
    } else {
      console.log('An User left the server.');
    }
  });
});

server.listen(port, () => {
  console.log('Server is on port ' + port);
});
