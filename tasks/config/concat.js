/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = function(grunt) {

	grunt.config.set('concat', {
		js: {
			src: require('../pipeline').jsFilesToInject,
			dest: 'public/js/app.js'
		},
		jsProd: {
			src: require('../pipeline').jsFilesToInject,
			dest: 'public/concat/production.js'
		},
		cssProd: {
			src: require('../pipeline').cssFilesToInject,
			dest: 'public/concat/production.css'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
