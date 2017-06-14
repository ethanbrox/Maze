var express = require('express');
var app = express();
var serv = require('http').Server(app);

//If the query is anything not otherwise specified do this.
app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
//If the server specifies something specific but it has to be in the client folder.
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('server started');

var player = {
	id: null,
	health: 100,
	x: 50,
	y: 50,
	players: [],
	
	create: function(id){
		var obj = Object.create(this);
		this.id = id;
		return obj;
	}
};

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	var p = player.create(socket.id);
	PLAYER_LIST[p.id] = p;
	
	console.log('socket connection');
	
	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[p.id];
	})
});

setInterval(function(){
	for(var i in PLAYER_LIST){
		var p = PLAYER_LIST[i];
		var players = [];
		for(var i in PLAYER_LIST){
			
		}
		socket.emit('players', {
			id: socket.id
		});
	}
}, 1000 / 25);