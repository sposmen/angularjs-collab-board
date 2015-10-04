function StickyNoteCtrl($scope, $element, socketConnector) {
  var self = this;

  this.scope = $scope;
  this.note = $scope.note;
  this.oldNote = _.clone(this.note);
  this.element = $element;
  this.socket = socketConnector;

  this.scope.$on('angular-resizable.resizeEnd', function (event, info) {
    console.log(info);
  });

  this.setDraggable();

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
      self.updateNote();
    }
  });
};

StickyNoteCtrl.prototype.onKeyChanged = {
  position: function (data) {
    if (data.id == this.note.id) {
      this.animate();
    }
  }
};

StickyNoteCtrl.prototype.onNoteUpdated = function (data) {
  var self = this;
  if (data.id == this.note.id) {
    ['title', 'body', 'position'].forEach(function (key) {
      if (data.hasOwnProperty(key) && !_.isEqual(data[key], self.note[key])) {
        self.note[key] = data[key];
        if (self.onKeyChanged.hasOwnProperty(key))
          self.onKeyChanged[key].call(self, data);
      }
    });
  }
  this.oldNote = _.clone(this.note);
};

StickyNoteCtrl.prototype.updateNote = function () {
  this.socket.emit('updateNote', _.extend({id: this.note.id}, this.getDiff()));
  this.oldNote = _.clone(this.note);
};

StickyNoteCtrl.prototype.getDiff = function () {
  var self = this,
    diff = {};
  ['title', 'body', 'position'].forEach(function (key) {
    if (!_.isEqual(self.oldNote[key], self.note[key])) {
      diff[key] = self.note[key];
    }
  });
  return diff;
};

StickyNoteCtrl.$inject = ['$scope', '$element', 'socketConnector'];

angular.module('stickyApp.directives.controllers', ['stickyApp.factories'])
  .controller('StickyNoteCtrl', StickyNoteCtrl);