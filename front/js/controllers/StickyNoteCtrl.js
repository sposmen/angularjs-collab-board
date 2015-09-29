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