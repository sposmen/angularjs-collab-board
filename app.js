var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  notes = {};

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
  socket.on('createNote', function (data) {
    notes[data.id] = data;
    socket.broadcast.emit('onNoteCreated', data);
  });

  socket.on('updateNote', function (data) {
    notes[data.id] = data;
    socket.broadcast.emit('onNoteUpdated', data);
  });

  socket.on('moveNote', function (data) {
    notes[data.id].position = data.position;
    socket.broadcast.emit('onNoteMoved', data);
  });

  socket.on('deleteNote', function (data) {
    delete notes[data.id];
    socket.broadcast.emit('onNoteDeleted', data);
  });

  socket.emit('onCurrentNotes', notes)
});

server.listen(1337);