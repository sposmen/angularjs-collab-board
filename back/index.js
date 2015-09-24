var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  Notes = require('./model/Notes'),
  notes = new Notes(),
  SocketNotes = require('./lib/SocketNotes'),
  socketNotes = new SocketNotes(server);

app.use(express.static(__dirname + '/../public'));

socketNotes.registerNotes(notes);

server.listen(1337);