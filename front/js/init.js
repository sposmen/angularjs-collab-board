
angular.module('stickyApp.controllers', []);
angular.module('stickyApp.factories', []);

angular.module('stickyApp.directives.controllers', [
  'stickyApp.factories'
]);

angular.module('stickyApp.directives', [
  'stickyApp.directives.controllers'
]);
