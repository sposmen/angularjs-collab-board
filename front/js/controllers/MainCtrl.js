function MainCtrl($scope, socketConnector) {
  $scope.notes = {};

  // Incoming
  socketConnector.on('onNoteCreated', function (data) {
    $scope.notes[data.id] = data;
  });

  socketConnector.on('onNoteDeleted', function (data) {
    $scope.handleDeletedNoted(data.id);
  });

  socketConnector.on('onCurrentNotes', function (data) {
    for(var note in data){
      $scope.notes[note] = data[note];
    }
  });


  // Outgoing
  $scope.createNote = function () {
    var note = {
      id: new Date().getTime(),
      title: 'New Note',
      body: 'Pending'
    };

    $scope.notes[note.id] = note;
    socketConnector.emit('createNote', note );
  };

  $scope.deleteNote = function (id) {
    $scope.handleDeletedNoted(id);

    socketConnector.emit('deleteNote', {id: id});
  };

  $scope.handleDeletedNoted = function (id) {
    delete $scope.notes[id];
  }
}

MainCtrl.$inject = ['$scope', 'socketConnector'];


app.controller('MainCtrl', MainCtrl);