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

//var SOCKET_LIST = [];
var PLAYER_LIST = [];
var ROOM_LIST = [];

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	
	socket.id = Math.random();
	//SOCKET_LIST[socket.id] = socket;
	
	var p = Player.create(socket, socket.id);
	
	//Pick a random color for the circle
	var color = 'rgb('+
		Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+')';
	p.color = color;
	
	PLAYER_LIST[p.id] = p;
	var pack = {
		id:p.id,
		x:p.x,
		y:p.y,
		color: p.color
	}
	socket.emit('playerCreated', pack);
	
	console.log('socket connection');
	
	socket.on('disconnect', function(){
		//delete SOCKET_LIST[socket.id];
		for(var i in PLAYER_LIST){
			var player = PLAYER_LIST[i];
			for(var j in player.connectedPlayers){
				if(socket.id === player.connectedPlayers[j]){
					delete player.connectedPlayers[j];
				}
			}
		}
		delete PLAYER_LIST[socket.id];
	});
	
	socket.on('keypress', function(data){
		if(data.inputId === 'left')
			p.pressingLeft = data.state;
		if(data.inputId === 'right')
			p.pressingRight = data.state;
		if(data.inputId === 'up')
			p.pressingUp = data.state;
		if(data.inputId === 'down')
			p.pressingDown = data.state;
	});
	
	socket.on('connectPlayers', function(){
		for(var i in PLAYER_LIST){
			var player = PLAYER_LIST[i];
			for(var j in PLAYER_LIST){
				player.addPlayer(PLAYER_LIST[j]);
			}
		}
		
		for(var i in PLAYER_LIST){
			var player = PLAYER_LIST[i];
			console.log(player.id + "    " + player.connectedPlayers.length);
		}
	});
});

setInterval(function(){
	for(var i in PLAYER_LIST){
		var socket = PLAYER_LIST[i].socket;
		var player = PLAYER_LIST[i];
		player.updatePosition();
		
		socket.emit('updateSelf', {
			id:player.id,
			x:player.x,
			y:player.y,
			color: player.color
		});
		
		var pack = [];
		pack = player.getConnectedPlayersData();
		socket.emit('updateOthers', pack);
	}
	
	/*var pack = [];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			id:player.id,
			x:player.x,
			y:player.y,
			color: player.color
		});
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('update', pack);
	}*/
}, 1000 / 25);

//OBJECTS

var Player = {
	socket: null,
	id: null,
	health: 100,
	x: 250,
	y: 250,
	connectedPlayers: [],
	pressingRight: false,
	pressingLeft: false,
	pressingUp: false,
	pressingDown: false,
	speed: 10,
	
	create: function(socket, id){
		var obj = Object.create(this);
		this.socket = socket;
		this.id = id;
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
	
	addPlayer: function(player){
		//check if player is already in the list first
		this.connectedPlayers.push(player);
		if(!(this.id === player.id)){
			var found = false;
			if(this.findPlayer(player) != -1){
				found = true;
			}
			
			if(!found){
				//this.connectedPlayers.push(player);
			}
		}
	},
	
	removePlayer: function(id){
		for(var i = this.connectedPlayers.length; i > -1; i--){
			if(this.connectedPlayers[i].id === id){
				this.connectedPlayers.splice(i, 1);
			}
		}
	},
	
	getConnectedPlayersData: function(){
		var pack = [];
		for(var i in this.connectedPlayers){
			var player = this.connectedPlayers[i];
			pack.push({
				id: player.id,
				x: player.x,
				y: player.y,
				color: player.color
			});
		}
		return pack;
	},
	
	findPlayer: function(player){
		var place = -1;
		var id = player.id;
		for(var i = 0; i < this.connectedPlayers.length; i++){
			if(this.connectedPlayers[i].id === id){
				place = i;
			}
		}
		return place;
	}
};

var Room = {
	id: null,
	color: 'blue',
	players: [],
	
	create: function(id){
		var obj = Object.create(this);
		this.id = id;
		return obj;
	},
	
	addPlayer: function(player){
		players.push(player);
	},
	
	removePlayer: function(id){
		for(var i = players.length; i > -1; i--){
			if(players[i].id === id){
				players.splice(i, 1);
			}
		}
	},
	
	getPlayers: function(){
		return players;
	},
	
	getNumPlayers: function(){
		return players.length;
	}
};













































