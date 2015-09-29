function Config($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/'
  }).state('board', {
    url: "/board/:boardId"
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
function StickyNoteDirective() {
  return {
    restrict: 'A',
    controller: 'StickyNoteCtrl'
  };
}


app.directive('stickyNote', StickyNoteDirective);
function MainCtrl($scope, $stateParams, $state, socketConnector) {
  var self = this;

  this.$scope = $scope;
  this.$stateParams = $stateParams;
  this.$state = $state;
  this.socketConnector = socketConnector;
  this.$scope.notes = {};
  $scope.$on('$stateChangeSuccess', function () {
    self.checkBoard();
  });

  $scope.styles = {
    background: "url(/images/bg_corkboard.jpg) top left repeat fixed"
  };

  // Incoming
  this.initSocket();

  // Outgoing
  this.$scope.createNote = function () {
    self.createNote()
  };

  this.$scope.deleteNote = function (data) {
    self.deleteNote(data)
  };
}

MainCtrl.prototype.initSocket = function () {
  var self = this;
  this.socketConnector.on('onNoteCreated', function (data) {
    self.$scope.notes[data.id] = data;
  });

  this.socketConnector.on('onNoteDeleted', function (data) {
    if (self.$scope.notes.hasOwnProperty(data.id)) {
      delete self.$scope.notes[data.id];
    }
  });

  this.socketConnector.on('onCurrentNotes', function (data) {
    data.forEach(function(note){
      self.$scope.notes[note.id] = note;
    });
  });
};

MainCtrl.prototype.createNote = function () {
  this.socketConnector.emit('createNote');
};

MainCtrl.prototype.deleteNote = function (id) {
  delete this.$scope.notes[id];
  this.socketConnector.emit('deleteNote', {id: id});
};

MainCtrl.prototype.checkBoard = function () {
  if (this.$stateParams.boardId) {
    this.board = this.$stateParams.boardId;
    this.socketConnector.emit('getNotesFromBoard', {board: this.board});
  } else {
    this.board = new Date().getTime();
    this.$state.transitionTo("board", {boardId: this.board})
  }
};


MainCtrl.$inject = ['$scope', '$stateParams', '$state', 'socketConnector'];


app.controller('MainCtrl', MainCtrl);
function StickyNoteCtrl($scope, $element, socketConnector) {
  var self = this;

  this.scope = $scope;
  this.note = $scope.note;
  this.element = $element;
  this.socket = socketConnector;

  this.setDraggable();

  this.socket.on('onNoteMoved', function (data) {
    self.onNoteMoved(data);
  });

  this.socket.on('onNoteUpdated', function (data) {
    self.onNoteUpdated(data);
  });

  // Outgoing
  this.scope.updateNote = function () {
    self.updateNote();
  };

  // Some DOM initiation to make it nice
  this.element.css('left', '10px');
  this.element.css('top', '50px');
  this.element.hide().fadeIn(400, function () {
    self.animate();
  });
}

StickyNoteCtrl.prototype.animate = function () {
  if (this.note.position) {
    this.element.animate(this.note.position);
  }
};

StickyNoteCtrl.prototype.setDraggable = function () {
  var self = this;
  this.element.draggable({
    stop: function (event, ui) {
      self.note.position = {left: ui.position.left, top: ui.position.top};

      self.socket.emit('moveNote', {
        id: self.note.id,
        position: self.note.position
      });
    }
  });
};

StickyNoteCtrl.prototype.onNoteMoved = function (data) {
  if (data.id == this.note.id) {
    this.note.position = data.position;
    this.animate()
  }
};

StickyNoteCtrl.prototype.onNoteUpdated = function (data) {
  if (data.id == this.note.id) {
    this.note.title = data.title;
    this.note.body = data.body;
  }
};

StickyNoteCtrl.prototype.updateNote = function () {
  this.socket.emit('updateNote', {
    id: this.note.id,
    title: this.note.title,
    body: this.note.body
  });
};

StickyNoteCtrl.$inject = ['$scope', '$element', 'socketConnector'];

app.controller('StickyNoteCtrl', StickyNoteCtrl);