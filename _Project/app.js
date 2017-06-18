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





var PLAYER_LIST = {};
var ROOM_LIST = {};

var Player = {
	socket: null,
	id: null,
	health: 100,
	x: 250,
	y: 250,
	roomId: null,
	pressingRight: false,
	pressingLeft: false,
	pressingUp: false,
	pressingDown: false,
	speed: 10,
	
	create: function(){
		var obj = Object.create(this);
		return obj;
	},
	
	updatePosition: function(){
		if(this.pressingRight){
			this.x += this.speed;
		} 
		if(this.pressingLeft){
			this.x -= this.speed;
		}
		if(this.pressingUp){
			this.y -= this.speed;
		}
		if(this.pressingDown){
			this.y += this.speed;
		}
	},
	
};

var Room = {
	id: null,
	numPlayers:0,
	color:'black',
	
	create: function(){
		var obj = Object.create(this);
		return obj;
	},
};





var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	//Create the socket and Player, add the socket to the Player
	socket.id = Math.random();
	var player = Player.create();
	player.id = socket.id;
	player.socket = socket;
	
	var color = 'rgb('+
		Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+')';
	player.color = color;
	
	//add the player to the list of players
	PLAYER_LIST[socket.id] = player;
	console.log("player Created: " + player.id);
	
	//Create a Room and add the id to the player
	var room = Room.create();
	room.id = Math.random();
	room.numPlayers = 1;
	
	color = 'rgb('+
		Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+')';
	room.color = color;
	
	//add the room to the list
	ROOM_LIST[room.id] = room;
	//add the room id to the player
	player.roomId = room.id;
	
	
	
	
	
	socket.on('disconnect', function(){
		delete PLAYER_LIST[socket.id];
	});
	
	socket.on('keypress', function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		if(data.inputId === 'right')
			player.pressingRight = data.state;
		if(data.inputId === 'up')
			player.pressingUp = data.state;
		if(data.inputId === 'down')
			player.pressingDown = data.state;
	});
	
	socket.on('join', function(data){
		for(var i in PLAYER_LIST){
			var player = PLAYER_LIST[i];
			player.roomId = '1';
		}
	});
});





setInterval(function(){
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition();
		var pack = [];
		pack.push({
			x:player.x,
			y:player.y,
			color:player.color
		});
		
		for(var k in PLAYER_LIST){
			var p = PLAYER_LIST[k];
			if(p.id != player.id){
				if(p.roomId != null && player.roomId != null){
					if(p.roomId == player.roomId){
						pack.push({
							x:p.x,
							y:p.y,
							color:p.color
						});
					}
				}
			}
		}
		
		player.socket.emit('update', pack);
	}
}, 1000 / 25);