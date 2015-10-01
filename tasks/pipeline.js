var cssFilesToInject = [
  'front/css/**/*.css'
];

var jsFilesToInject = [

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'front/js/init.js',
  'front/js/factories/*.js',
  'front/js/directives/*.js',
  'front/js/controllers/**/*.js',
  'front/js/Config.js',
  'front/js/app.js'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports = {
  cssFilesToInject: cssFilesToInject,
  jsFilesToInject: jsFilesToInject
};
