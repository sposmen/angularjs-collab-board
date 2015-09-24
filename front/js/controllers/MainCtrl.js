function MainCtrl($scope, socketConnector) {
  $scope.notes = [];

  // Incoming
  socketConnector.on('onNoteCreated', function (data) {
    $scope.notes.push(data);
  });

  socketConnector.on('onNoteDeleted', function (data) {
    $scope.handleDeletedNoted(data.id);
  });

  // Outgoing
  $scope.createNote = function () {
    var note = {
      id: new Date().getTime(),
      title: 'New Note',
      body: 'Pending'
    };

    $scope.notes.push(note);
    socketConnector.emit('createNote', note);
  };

  $scope.deleteNote = function (id) {
    $scope.handleDeletedNoted(id);

    socketConnector.emit('deleteNote', {id: id});
  };

  $scope.handleDeletedNoted = function (id) {
    var oldNotes = $scope.notes,
      newNotes = [];

    angular.forEach(oldNotes, function (note) {
      if (note.id !== id) newNotes.push(note);
    });

    $scope.notes = newNotes;
  }
}

MainCtrl.$inject = ['$scope', 'socketConnector'];


app.controller('MainCtrl', MainCtrl);