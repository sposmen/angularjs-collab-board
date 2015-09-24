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
function StickyNoteDirective(socket) {
  var linker = function (scope, element, attrs) {
    element.draggable({
      stop: function (event, ui) {
        socket.emit('moveNote', {
          id: scope.note.id,
          x: ui.position.left,
          y: ui.position.top
        });
      }
    });

    socket.on('onNoteMoved', function (data) {
      // Update if the same note
      if (data.id == scope.note.id) {
        element.animate({
          left: data.x,
          top: data.y
        });
      }
    });

    // Some DOM initiation to make it nice
    element.css('left', '10px');
    element.css('top', '50px');
    element.hide().fadeIn();
  };

  var controller = function ($scope) {
    // Incoming
    socket.on('onNoteUpdated', function (data) {
      // Update if the same note
      if (data.id == $scope.note.id) {
        $scope.note.title = data.title;
        $scope.note.body = data.body;
      }
    });

    // Outgoing
    $scope.updateNote = function (note) {
      socket.emit('updateNote', note);
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

StickyNoteDirective.$inject = ['socket'];

app.directive('stickyNote', StickyNoteDirective);
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