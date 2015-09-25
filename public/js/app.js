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
function StickyNoteDirective() {
  return {
    restrict: 'A',
    controller: 'StickyNoteCtrl'
  };
}


app.directive('stickyNote', StickyNoteDirective);
function MainCtrl($scope, $stateParams, socketConnector) {
  var self = this;

  this.$scope = $scope;
  this.$stateParams = $stateParams;
  this.socketConnector = socketConnector;
  this.$scope.notes = {};

  $scope.styles = {
    background: "url(/images/bg_corkboard.jpg) top left repeat fixed"
  };

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
  this.socket.emit('updateNote', this.note);
};

StickyNoteCtrl.$inject = ['$scope', '$element', 'socketConnector'];

app.controller('StickyNoteCtrl', StickyNoteCtrl);