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