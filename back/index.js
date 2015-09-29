var path = require('path'),
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  Notes = require('./models/Note'),
  NotesController = require('./controllers/NotesController'),
  notesController = new NotesController(server),
  index = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/../public'));

app.use('/', index);

server.listen(1337);

console.log("Server started at port 1337");