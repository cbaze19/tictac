var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8080;

// Define Paths for media files and public views
app.use('/media', express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/public'));

// Root path to index.html
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var players = [];
var turn;
var moves = [];

io.on('connection', function(socket) {
	//console.log('User connected...');

	if (players.length <= 1) {
		players.push(socket);

		if (players.length == 2) {
			turn = players[0].id;

			players[0].emit('start game', {turn: turn, piece: 'x', name: 'Player 1', moves: moves});
			players[1].emit('start game', {turn: turn, piece: 'o', name: 'Player 2', moves: moves});
		}
	}

	socket.on('move', function(data) {

		var moved = moves.filter(function(o) {
			return o.sector == data.sector;
		});

		if (moved[0] == null ) {
			if (data.id == turn) {

				io.emit('move-confirm', {sector: data.sector, piece: data.piece, turn: turn});
				moves.push(data);

				checkWin();

				if (turn == players[0].id) {
					turn = players[1].id;
				} else {
					turn = players[0].id;
				}

			}
			
		}

	});

	socket.on('disconnect', function() {
		//console.log('User disconnected...');
		players.splice(players.indexOf(socket), 1);
	});

});

http.listen(port, function() {
	//console.log('listening on ' + port);
});

function checkWin() {

	var wins = [
		['sector-tl','sector-tm','sector-tr'],
		['sector-ml','sector-mm','sector-mr'],
		['sector-bl','sector-bm','sector-br'],
		['sector-tl','sector-ml','sector-bl'],
		['sector-tm','sector-mm','sector-bm'],
		['sector-tr','sector-mr','sector-br'],
		['sector-tl','sector-mm','sector-br'],
		['sector-tr','sector-mm','sector-bl']
	];

	var p1_moves = [];
	var p2_moves = [];

	for (var i = 0; i < moves.length; i++) {
		if (moves[i].id == players[0].id) {
			p1_moves.push(moves[i].sector);
		} else {
			p2_moves.push(moves[i].sector);
		}
	}

	for (var c = 0; c < wins.length; c++) {

		if (p1_moves.indexOf(wins[c][0]) != -1 && p1_moves.indexOf(wins[c][1]) != -1 && p1_moves.indexOf(wins[c][2]) != -1) {
			io.emit('game won', {winnerID: players[0].id, winnerName: 'Player 1'});
			moves = [];
		}

		if (p2_moves.indexOf(wins[c][0]) != -1 && p2_moves.indexOf(wins[c][1]) != -1 && p2_moves.indexOf(wins[c][2]) != -1) {
			io.emit('game won', {winnerID: players[0].id, winnerName: 'Player 2'});
			moves = [];
		}

	}

	if (moves.length >= 9) {
		io.emit('game won', {winnerID: 'sleepyCat', winnerName: 'Cat'});
		moves = [];
	}
	
}