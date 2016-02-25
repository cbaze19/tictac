var socket = io();

var id;
var turn;
var piece;

socket.on('start game', function(data) {
	id = '/#' + socket.id;
	console.log('game starting!');
	$('#waiting').hide();
	$('#board-div').show();

	for (var i = 0; i < data.moves.length; i++) {
		console.log(data.moves[i].sector);
		$('#' + data.moves[i].sector + ' #' + data.moves[i].piece + '-img').show();
	}

	turn = data.turn;
	piece = data.piece;

	$('p').remove();
	$('body').append('<p>You are: ' + data.name);
	$('body').append('<p>Your Piece: ' + piece);

	console.log(turn);
	console.log(id);
});

socket.on('move-confirm', function(data) {
	$('#' + data.sector + ' #' + data.piece + '-img').show();
});

socket.on('game won', function(data) {
	$('body').html('<h>' + data.winnerName + ' Wins!</h>');
	$('body').append('<p>Refresh Page to restart game!</p>');
});

socket.on('game reset', function(data) {
	$('body').html('');
	$('body').html(data.quitter + ' left.  Please refresh page to play again.');
});

$(function() {

	$('#board-div').hide();
	$('.sector img').hide();

	$('.sector').on('click', function() {

		console.log(turn);
		console.log(id);
		console.log(socket.id);
		
		socket.emit('move', {id: id, piece: piece, sector: $(this).attr('id')});
		
	});

});