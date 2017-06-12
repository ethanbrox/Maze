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

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	console.log('socket connection');
})