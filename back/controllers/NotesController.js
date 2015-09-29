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
  socket.on('createNote', function (data) {
    Note(data).save()
      .then(function () {
        socket.broadcast.emit('onNoteCreated', data);
      });
  });

  socket.on('updateNote', function (data) {
    Note.get(data.id).update(data).run().then(function () {
      socket.broadcast.emit('onNoteUpdated', data);
    });
  });

  socket.on('moveNote', function (data) {
    Note.get(data.id).update(data).run().then(function () {
      socket.broadcast.emit('onNoteMoved', data);
    });
  });

  socket.on('deleteNote', function (data) {
    Note.get(data.id).delete().run().then(function () {
      socket.broadcast.emit('onNoteDeleted', data);
    });

  });

  socket.on('getNotesFromBoard', function (data) {
    Note.filter({board: parseInt(data.board)}).run().then(function (notes) {
      socket.emit('onCurrentNotes', notes);
    });

  });

};

module.exports = NotesController;