module.exports = function (grunt) {

  grunt.config.set('jade', {
    dev: {
      files: {
        "public/index.html": require('../pipeline').jadeFilesToInject
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jade');
};
