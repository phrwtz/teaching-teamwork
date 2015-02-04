var gulp        = require('gulp');
var config      = require('../config').activities;

gulp.task('copy-activities', function(){
  gulp.src(config.src, { base: config.base })
    .pipe(gulp.dest(config.dest));
});
