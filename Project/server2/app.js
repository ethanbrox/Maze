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
var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
	//Create a socket with a random id.
	socket.id = Math.random();
	
	//add the socket to a player object, players id is the same as the sockets id.
	var player = Player.create(socket, socket.id);
	
	var color = 'rgb('+
		Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+','+
      	Math.floor(Math.random()*256)+')';
	player.color = color;
	
	//add the new player to the list of connected players
	PLAYER_LIST[socket.id] = player;
	
	console.log('socket connection: ' + player.socket.id);
	
	
	
	
	
	socket.on('disconnect', function(){
		delete PLAYER_LIST[socket.id];
	});
	
	socket.on('connectPlayers', function(){
		var l = Math.random();
		console.log(l);
		for(var i in PLAYER_LIST){
			PLAYER_LIST[i].connectionCode = l;
		}
	});
	
	socket.on('keypress', function(data){
		console.log(PLAYER_LIST[socket.id]);
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		if(data.inputId === 'right')
			player.pressingRight = data.state;
		if(data.inputId === 'up')
			player.pressingUp = data.state;
		if(data.inputId === 'down')
			player.pressingDown = data.state;
	});
	
});

setInterval(function(){
	//Go through each player and their connection
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		var socket = player.socket;

		player.updatePosition();

		var pack = [];
		for(var i in PLAYER_LIST){
			var player = PLAYER_LIST[i];
			pack.push({
				id: player.id,
				x: player.x,
				y: player.y,
				color: player.color
			});
		}
		//add the playert to the pack
		//var pack = [];

		//pack.push({
		//	id: player.id,
		//	x: player.x,
		//	y: player.y,
		//	color: player.color
		//});

		//gothrough the list of players for each player and add only the ones
		//that share the same connectionCode, ignore all others.
		/*for(var k in PLAYER_LIST){
			var tempPlayer = PLAYER_LIST[k];
			if(player.connectionCode && player.connectionCode === tempPlayer.connectionCode){
				if(player.id != tempPlayer.id){
					pack.push({
						id: tempPlayer.id,
						x: tempPlayer.x,
						y: tempPlayer.y,
						color: tempPlayer.color
					});
				}
			}
		}*/

		/*for(var k in PLAYER_LIST){
			var tPlayer = PLAYER_LIST[k];
			if(player.id != tPlayer.id){
				pack.push({
					id: tPlayer.id,
					x: tPlayer.x,
					y: tPlayer.y,
					color: tPlayer.color
				});
			}
		}*/

		//emit the update package to the client
		socket.emit('update', pack);
	}
		
}, 1000 / 25);





var Player = {
	socket: null,
	id: null,
	connectionCode: null,
	x: 250,
	y: 250,
	pressingRight: false,
	pressingLeft: false,
	pressingUp: false,
	pressingDown: false,
	speed: 5,
	
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
};










