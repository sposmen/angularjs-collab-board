function Config($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/'
  }).state('stickynotes', {
    url: "/{id}"
  });
}

Config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

var app = angular.module('app', ['ui.router']);

app.config(Config);

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
    
    socketConnector.on('onNoteUpdated', function (data) {
      // Update if the same note
      if (data.id == scope.note.id) {
        scope.note.title = data.title;
        scope.note.body = data.body;
      }
    });

    // Outgoing
    scope.updateNote = function (note) {
      socketConnector.emit('updateNote', note);
    };

    scope.deleteNote = function (id) {
      scope.ondelete({
        id: id
      });
    };

    // Some DOM initiation to make it nice
    element.css('left', '10px');
    element.css('top', '50px');
    element.hide().fadeIn();
  };

  var controller = function ($scope) {
    // Incoming
    
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