var util = require('util'),
  inherits = util.inherits,
  EventEmitter = require('events');


function Notes(){
  EventEmitter.call(this);
  this.notes = {};
}

inherits(Notes, EventEmitter);

Notes.prototype.createNote = function(data, cb){
  this.notes[data.id] = data;
  cb();
};

Notes.prototype.updateNote = function(data, cb){
  this.notes[data.id] = data;
  cb();
};

Notes.prototype.moveNote = function(data, cb){
  this.notes[data.id].position = data.position;
  cb()
};

Notes.prototype.deleteNote = function(data, cb){
  delete this.notes[data.id];
  cb();
};

Notes.prototype.getNotes = function(){
  return this.notes;
};

module.exports = Notes;