var SocketIo = require('socket.io'),
  Note = require('../models/Note');

function NotesController(server) {
  var self = this;
  this.server = server;
  this.io = SocketIo.listen(this.server);
  this.io.sockets.on('connection', function (socket) {
    self.onConnection(socket)
  });
}


NotesController.prototype.onConnection = function (socket) {
  socket.on('createNote', function () {
    Note({
      title: 'New Note',
      body: 'Pending',
      board: socket.currentBoard
    }).save()
      .then(function (note) {
        socket.emit('onNoteCreated', note);
        socket.broadcast.to(socket.currentBoard).emit('onNoteCreated', note);
      });
  });

  socket.on('updateNote', function (data) {
    Note.get(data.id).update(data).run().then(function () {
      socket.broadcast.to(socket.currentBoard).emit('onNoteUpdated', data);
    });
  });

  socket.on('moveNote', function (data) {
    Note.get(data.id).update(data).run().then(function () {
      socket.broadcast.to(socket.currentBoard).emit('onNoteMoved', data);
    });
  });

  socket.on('deleteNote', function (data) {
    Note.get(data.id).delete().run().then(function () {
      socket.broadcast.to(socket.currentBoard).emit('onNoteDeleted', data);
    });

  });

  socket.on('getNotesFromBoard', function (data) {
    socket.join(data.board);
    socket.currentBoard = data.board;
    Note.filter({board: parseInt(data.board)}).run().then(function (notes) {
      socket.emit('onCurrentNotes', notes);
    });

  });

};

module.exports = NotesController;