var app = angular.module('app', []);
function SocketFactory($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}

SocketFactory.$inject = ['$rootScope'];

app.factory('socketConnector', SocketFactory);
function StickyNoteDirective(socketConnector) {
  var linker = function (scope, element, attrs) {

    if (scope.note.position) {
      element.animate(scope.note.position);
    }

    element.draggable({
      stop: function (event, ui) {
        scope.note.position = {left: ui.position.left, top: ui.position.top};

        socketConnector.emit('moveNote', {
          id: scope.note.id,
          position: scope.note.position
        });
      }
    });

    socketConnector.on('onNoteMoved', function (data) {
      // Update if the same note

      if (data.id == scope.note.id) {
        scope.position = data.position;
        element.animate(data.position);
      }
    });

    // Some DOM initiation to make it nice
    element.css('left', '10px');
    element.css('top', '50px');
    element.hide().fadeIn();
  };

  var controller = function ($scope) {
    // Incoming
    socketConnector.on('onNoteUpdated', function (data) {
      // Update if the same note
      if (data.id == $scope.note.id) {
        $scope.note.title = data.title;
        $scope.note.body = data.body;
      }
    });

    // Outgoing
    $scope.updateNote = function (note) {
      socketConnector.emit('updateNote', note);
    };

    $scope.deleteNote = function (id) {
      $scope.ondelete({
        id: id
      });
    };
  };

  return {
    restrict: 'A',
    link: linker,
    controller: controller,
    scope: {
      note: '=',
      ondelete: '&'
    }
  };
}

StickyNoteDirective.$inject = ['socketConnector'];

app.directive('stickyNote', StickyNoteDirective);
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