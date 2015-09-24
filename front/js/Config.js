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
