var gulp        = require('gulp');
var config      = require('../config').public;

gulp.task('copy-public', function(){
  gulp.src(config.src, { base: config.base })
    .pipe(gulp.dest(config.dest));
});
