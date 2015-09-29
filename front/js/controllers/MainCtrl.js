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

  this.$scope.deleteNote = function () {
    self.deleteNote.apply(self, arguments)
  };
}

MainCtrl.prototype.initSocket = function () {
  var self = this;
  this.socketConnector.on('onNoteCreated', function (data) {
    if(self.board == data.board)
      self.$scope.notes[data.id] = data;
  });

  this.socketConnector.on('onNoteDeleted', function (data) {
    delete self.$scope.notes[data.id];
  });

  this.socketConnector.on('onCurrentNotes', function (data) {
    var note;
    for (note in data) {
      if (data.hasOwnProperty(note))
        self.$scope.notes[note] = data[note];
    }
  });
};

MainCtrl.prototype.createNote = function () {

  var note = {
    id: new Date().getTime(),
    title: 'New Note',
    body: 'Pending',
    board: this.board
  };

  this.$scope.notes[note.id] = note;
  this.socketConnector.emit('createNote', note);
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