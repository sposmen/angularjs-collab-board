function MainCtrl($scope, $stateParams, socketConnector) {
  this.$scope = $scope;
  this.$stateParams = $stateParams;
  this.socketConnector = socketConnector;
  var self = this;
  $scope.notes = {};

  // Incoming
  //this.initSocket();

  this.socketConnector.on('onNoteCreated', function (data) {
    self.$scope.notes[data.id] = data;
  });

  this.socketConnector.on('onNoteDeleted', function (data) {
    delete self.$scope.notes[data.id];
  });

  this.socketConnector.on('onCurrentNotes', function (data) {
    for (var note in data) {
      self.$scope.notes[note] = data[note];
    }
  });

  // Outgoing
  this.$scope.createNote = function () {
    var note = {
      id: new Date().getTime(),
      title: 'New Note',
      body: 'Pending'
    };

    self.$scope.notes[note.id] = note;
    self.socketConnector.emit('createNote', note);
  };

  this.$scope.deleteNote = function (id) {
    delete self.$scope.notes[id];

    self.socketConnector.emit('deleteNote', {id: id});
  };
}

MainCtrl.prototype.initSocket = function () {


};


MainCtrl.$inject = ['$scope', '$stateParams', 'socketConnector'];


app.controller('MainCtrl', MainCtrl);