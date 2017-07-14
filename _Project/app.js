var express = require('express');
var app = express();
var serv = require('http').Server(app);
var gameport = 2000;

//If the query is anything not otherwise specified do this.
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
//If the server specifies something specific but it has to be in the client folder.
app.use('/client', express.static(__dirname + '/client'));

serv.listen(gameport);
console.log('server started');

var PLAYER_LIST = {};
var ROOM_LIST = {};
var GRID = [];

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

    create: function () {
        var obj = Object.create(this);
        return obj;
    },

    updatePosition: function () {
        if (this.pressingRight) {
            this.x += this.speed;
        }
        if (this.pressingLeft) {
            this.x -= this.speed;
        }
        if (this.pressingUp) {
            this.y -= this.speed;
        }
        if (this.pressingDown) {
            this.y += this.speed;
        }
    },

    getData: function () {
        var r = {
            id: this.id,
            x: this.x,
            y: this.y,
            color: this.color,
            health: this.health,
        };
        return r;
    },
};

var Room = {
    id: null,
    numPlayers: 0,
    color: 'black',
    width: 200,
    height: 200,

    create: function () {
        var obj = Object.create(this);
        return obj;
    },

    getData: function () {
        var r = {
            color: this.color,
            width: this.width,
            height: this.height,
            numPlayers: this.numPlayers,
        };
        return r;
    }
};

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {

    //Create the socket and Player, add the socket to the Player
    socket.id = Math.random();
    var player = Player.create();
    player.id = socket.id;
    player.socket = socket;

    var color = 'rgb(' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ')';
    player.color = color;

    var room = Room.create();
    room.id = Math.random();
    room.numPlayers++;

    color = 'rgb(' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ')';
    room.color = color;

    //add the room to the list
    ROOM_LIST[room.id] = room;
    //add the room id to the player
    player.roomId = room.id;

    //add the player to the list of players
    PLAYER_LIST[socket.id] = player;
    console.log('player Created: ' + player.id);

    socket.on('disconnect', function () {
        ROOM_LIST[PLAYER_LIST[socket.id].roomId].numPlayers--;
        delete PLAYER_LIST[socket.id];
    });

    socket.on('keypress', function (data) {
        if (data.inputId === 'left') {
            player.pressingLeft = data.state;
        }
        if (data.inputId === 'right') {
            player.pressingRight = data.state;
        }
        if (data.inputId === 'up') {
            player.pressingUp = data.state;
        }
        if (data.inputId === 'down') {
            player.pressingDown = data.state;
        }
    });

    socket.on('join', function (data) {
        var room = Room.create();
        room.id = Math.random();

        color = 'rgb(' +
            Math.floor(Math.random() * 256) + ',' +
            Math.floor(Math.random() * 256) + ',' +
            Math.floor(Math.random() * 256) + ')';
        room.color = color;

        for (var i in PLAYER_LIST) {
            var player = PLAYER_LIST[i];
            for (var k in ROOM_LIST) {
                if (ROOM_LIST[k].roomId === player.roomId) {
                    ROOM_LIST[k].numPlayers--;
                }
            }
            player.roomId = room.id;
            room.numPlayers += 1;
        }

        ROOM_LIST[room.id] = room;
    });

    socket.emit('playerId', {
        id: player.id
    });
});

setInterval(function () {
    updateRooms();
    updatePlayers();
}, 1000 / 25);

updatePlayers = function () {
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition();
        var pack = [];
        pack.push(player.getData());

        for (var k in PLAYER_LIST) {
            var p = PLAYER_LIST[k];
            if (p.id != player.id) {
                if (p.roomId != null && player.roomId != null) {
                    if (p.roomId == player.roomId) {
                        pack.push(p.getData());
                    }
                }
            }
        }
        player.socket.emit('updatePlayers', pack);
    }
};

updateRooms = function () {
    for (var i in ROOM_LIST) {
        if (ROOM_LIST[i].numPlayers < 1) {
            delete ROOM_LIST[i];
        }
    }

    for (var l in ROOM_LIST) {
        var room = ROOM_LIST[l];
        //rooom.update???
        for (var k in PLAYER_LIST) {
            var player = PLAYER_LIST[k];
            if (player.roomId == room.id) {
                player.socket.emit('updateRooms', room.getData());
            }
        }
    }
};
