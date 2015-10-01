function StickyNoteDirective() {
  return {
    restrict: 'A',
    controller: 'StickyNoteCtrl'
  };
}

angular.module('stickyApp.directives')
  .directive('stickyNote', StickyNoteDirective);