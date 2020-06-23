const path = require('path');
const http = require('http');
const express= require('express');
const socketIO = require('socket.io');

// const {generateMessage, generateLocationMessage} = require('./utils/message.js');
// const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io= socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('new user');

    socket.on('join', (params, callback) => {

        /*
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        }
        */

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        
        // socket.emit('statusMessage', generateMessage('Admin', 'Welcome to the chatapp!'));
        socket.emit('statusMessage', {from: 'Admin', message: 'Welcome ' + params.name + ' to the game!'});

        // socket.broadcast.to(params.room).emit('statusMessage', generateMessage('Admin', params.name +' joined!'));
        //
        //

        console.log(users)
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

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        // socket.emit('statusMessage', generateMessage('Admin', 'Welcome to the chatapp!'));
        socket.emit('statusMessage', {from: 'Admin', message: params.name + 'left the game!'});

        // socket.broadcast.to(params.room).emit('statusMessage', generateMessage('Admin', params.name +' joined!'));
        //
        //
        console.log('an user left the room', params.room)
        callback();
    });

    /* socket.on('createMessage', (newMess, callback) => {
        console.log(newMess);
               
        io.emit('newMessage', generateMessage(newMess.from, newMess.text));
        callback();
    }); */

    socket.on('createMessage', (newMess, callback) => {
        var user= users.getUser(socket.id);

        if(user && isRealString(newMess.text)){
            socket.emit('newMessageForSender', generateMessage(user.name, newMess.text));
            socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.name, newMess.text));
         }
            
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);

        if(user){
            socket.emit('newLocationMessageForSender', generateLocationMessage(user.name, coords.latitude, coords.longitude));
            socket.broadcast.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            // io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
            socket.broadcast.to(user.room).emit('statusMessage', {from: 'Admin', message: `${user.name} has left the room`});
            console.log('An User left the room.')
        } else {
            console.log('An User left the server.')
        }
    })
});

server.listen(port, () =>{
    console.log('Server is on port ' + port);
});