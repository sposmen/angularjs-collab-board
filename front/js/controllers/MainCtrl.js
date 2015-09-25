function MainCtrl($scope, $stateParams, socketConnector) {
  var self = this;

  this.$scope = $scope;
  this.$stateParams = $stateParams;
  this.socketConnector = socketConnector;
  this.$scope.notes = {};

  // Incoming
  this.initSocket();

  // Outgoing
  this.$scope.createNote = function(){ self.createNote() };

  this.$scope.deleteNote = function(){ self.deleteNote() };
}

MainCtrl.prototype.initSocket = function () {
  var self = this;
  this.socketConnector.on('onNoteCreated', function (data) {
    self.$scope.notes[data.id] = data;
  });

  this.socketConnector.on('onNoteDeleted', function (data) {
    delete self.$scope.notes[data.id];
  });

  this.socketConnector.on('onCurrentNotes', function (data) {
    var note;
    for (note in data) {
      if(data.hasOwnProperty(note))
        self.$scope.notes[note] = data[note];
    }
  });
};

MainCtrl.prototype.createNote = function(){
  var note = {
    id: new Date().getTime(),
    title: 'New Note',
    body: 'Pending'
  };

  this.$scope.notes[note.id] = note;
  this.socketConnector.emit('createNote', note);
};

MainCtrl.prototype.deleteNote = function (id) {
  delete self.$scope.notes[id];

  self.socketConnector.emit('deleteNote', {id: id});
};




MainCtrl.$inject = ['$scope', '$stateParams', 'socketConnector'];


app.controller('MainCtrl', MainCtrl);