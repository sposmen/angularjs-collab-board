var SocketIo = require('socket.io');

function SocketNotes(server) {
  this.server = server;
  this.io = SocketIo.listen(this.server);
}

SocketNotes.prototype.registerNotes = function (notes) {
  var self = this;
  this.notes = notes;
  this.io.sockets.on('connection', function (socket) {
    self.onConnection(socket)
  });
};

SocketNotes.prototype.onConnection = function (socket) {
  var self = this;

  socket.on('createNote', function (data) {
    self.notes.createNote(data, function () {
      socket.broadcast.emit('onNoteCreated', data);
    });
  });

  socket.on('updateNote', function (data) {
    self.notes.updateNote(data, function () {
      socket.broadcast.emit('onNoteUpdated', data);
    });
  });

  socket.on('moveNote', function (data) {
    self.notes.moveNote(data, function () {
      socket.broadcast.emit('onNoteMoved', data);
    });
  });

  socket.on('deleteNote', function (data) {
    self.notes.deleteNote(data, function () {
      socket.broadcast.emit('onNoteDeleted', data);
    });

  });

  socket.emit('onCurrentNotes', this.notes.getNotes());
};

module.exports = SocketNotes;