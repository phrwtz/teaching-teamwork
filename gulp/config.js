var app = './app';
var dest = './dist';
var bower = './bower_components';

module.exports = {
  js: {
    src: app + '/src/app.js',
    allSrc: app + '/src/**/*',
    dest: dest + '/js'
  },
  activities: {
    src: './activities/**/*',
    base: './',
    dest: dest
  },
  public: {
    src: app + '/public/**/*',
    base: app + '/public/',
    dest: dest
  },
  vendor: {
    src: [bower + '/breadboard/**/*'],
    base: bower + '/',
    dest: dest + '/vendor'
  }
};
