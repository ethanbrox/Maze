var express = require('express');
var app = express();
var serv = require('http').Server(app);
var gameport = 2000;

//add in required files to create objects
var Chunk = require("./Chunk");
var Maze = require("./Maze");
var Player = require("./Player");

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

var maze = new Maze(125, 125, 5, 150);
maze.createMaze();

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {

    //Create the socket and Player, add the socket to the Player
    socket.id = Math.random();
    var player = new Player(maze, socket, socket.id);

    var color = 'rgb(' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ',' +
        Math.floor(Math.random() * 256) + ')';
    player.color = color;

    //add the player to the list of players
    PLAYER_LIST[socket.id] = player;
    console.log('player Created: ' + player.id);

    socket.on('disconnect', function () {
        //ROOM_LIST[PLAYER_LIST[socket.id].roomId].numPlayers--;
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

    socket.emit('playerId', {
        id: player.id
    });
});

setInterval(function () {
    updatePlayers();
    maze.update();
    updateChunks();
}, 1000 / 25);

updateChunks = function () {
    for (var x in PLAYER_LIST) {
        var player = PLAYER_LIST[x];
        var socket = player.socket;
        
        var chunk = maze.getChunk(player.x, player.y);
        var neighbors = chunk.getNeighborsSquare(maze.grid, maze.cols, maze.rows);
        var r = [];
        r.push(chunk.getInfo());
        for(var i = 0; i < neighbors.length; i++){
            r.push(neighbors[i].getInfo());
        }
        if(r){
            socket.emit('map', r);
        }
        
        /*
        var pack = [];
        for (var i = 0; i < maze.grid.length; i++) {
            var chunk = maze.grid[i];
            var cx = chunk.i * chunk.size;
            var cy = chunk.j * chunk.size;
            

            if ((tx - tile.w < x && (tx + tile.w * 2) > x) && (ty - tile.w < y && (ty + tile.w * 2) > y)) {
                var r = {
                    i: tile.i,
                    j: tile.j,
                    w: tile.w,
                    id: tile.id
                }
                pack.push(r);
            }
        }

        socket.emit('tiles', pack);
        */
    }
}

updatePlayers = function () {
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition(maze);
        var pack = [];
        pack.push(player.getData());

        for (var k in PLAYER_LIST) {
            var p = PLAYER_LIST[k];
            if (p.id != player.id) {
                //if (p.roomId != null && player.roomId != null) {
                if (p.roomId == player.roomId) {
                    pack.push(p.getData());
                }
                //}
            }
        }
        player.socket.emit('updatePlayers', pack);
    }
};
