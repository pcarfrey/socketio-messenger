var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 8080;
var users = [];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket) {
  console.log('new connection made');

  // show all users when first logged on
  socket.on('get-users', function() {
  	socket.emit('all-users', users); // note socket.emit, only broadcast to new user
  });

  // when new socket joins
  socket.on('join', function(data) {
  	// console.log(data);
  	socket.nickname = data.nickname;
  	users[socket.nickname] = socket;
  	var userObj = {
  		nickname: data.nickname,
  		socketid: socket.id
  	}
  	users.push(userObj);

  	io.emit('all-users', users); // note io.emit, broadcast to all users
  	// console.log(users);
  });

  // broadcast the message
  socket.on('send-message', function(data) {
  	// socket.broadcast.emit('message-received', data); // use broadcast to only send to other users
  	io.emit('message-received', data); // another way of do it, instead of broadcast, send to self too
  });

  // send a 'like' to the selected user
  socket.on('send-like', function(data) {
  	console.log(data);
  	socket.broadcast.to(data.like).emit('user-liked', data);
  });

  socket.on('disconnect', function() {
  	users = users.filter(function(item) {
  		return item.nickname !== socket.nickname;
  	});
  	io.emit('all-users', users);
  });

});

server.listen(port, function() {
  console.log("Listening on port " + port);
});