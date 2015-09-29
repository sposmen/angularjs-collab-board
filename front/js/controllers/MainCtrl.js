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