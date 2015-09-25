function StickyNoteDirective() {
  return {
    restrict: 'A',
    controller: 'StickyNoteCtrl'
  };
}


app.directive('stickyNote', StickyNoteDirective);