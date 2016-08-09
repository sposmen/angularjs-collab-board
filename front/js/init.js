
angular.module('stickyApp.controllers', []);
angular.module('stickyApp.factories', []);

angular.module('stickyApp.directives.controllers', [
  'angular-flippy',
  'stickyApp.factories'
]);

angular.module('stickyApp.directives', [
  'stickyApp.directives.controllers'
]);
