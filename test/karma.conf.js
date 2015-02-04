'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'phantomJSUserAgentShim.js',
      '../bower_components/breadboard/js/sparks.js',
      'spec/**/*Spec.js'
    ],

    reporters: [ 'dots' ],

    preprocessors: {
      'spec/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    logLevel: 'LOG_DEBUG',

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [ 'brfs', 'browserify-shim' ]
    }
  });
};
