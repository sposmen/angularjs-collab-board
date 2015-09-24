/**
 * Gruntfile
 *
 * This Node script is executed when you run `grunt` or `sails lift`.
 * It's purpose is to load the Grunt tasks in your project's `tasks`
 * folder, and allow you to add and remove tasks as you see fit.
 * For more information on how this works, check out the `README.md`
 * file that was generated in your `tasks` folder.
 *
 * WARNING:
 * Unless you know what you're doing, you shouldn't change this file.
 * Check out the `tasks` directory instead.
 */

module.exports = function(grunt) {


  // Load the include-all library in order to require all of our grunt
  // configurations and task registrations dynamically.
  var includeAll = require('include-all');

  function loadTasks(relPath) {
    return includeAll({
        dirname: require('path').resolve(__dirname, relPath),
        filter: /(.+)\.js$/
      }) || {};
  }

  function invokeConfigFn(tasks) {
    for (var taskName in tasks) {
      if (tasks.hasOwnProperty(taskName)) {
        tasks[taskName](grunt);
      }
    }
  }

  // Load task functions
  var taskConfigurations = loadTasks('./tasks/config'),
    registerDefinitions = loadTasks('./tasks/register');

  // (ensure that a default task exists)
  if (!registerDefinitions.default) {
    registerDefinitions.default = function (grunt) { grunt.registerTask('default', []); };
  }

  // Run task functions to configure Grunt.
  invokeConfigFn(taskConfigurations);
  invokeConfigFn(registerDefinitions);

};
