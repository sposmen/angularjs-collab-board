module.exports = function (grunt) {
  grunt.registerTask('syncAssets', [
    'concat:js',
    'less:dev',
    'jade:dev'
  ]);
};
