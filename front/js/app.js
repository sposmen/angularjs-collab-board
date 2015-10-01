var app = angular.module('stickyApp', [
  'ui.router',
  'stickyApp.factories',
  'stickyApp.controllers',
  'stickyApp.directives'
]);

app.config(Config);
