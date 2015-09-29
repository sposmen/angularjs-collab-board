function Config($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/'
  }).state('board', {
    url: "/board/:boardId"
  });
}

Config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
