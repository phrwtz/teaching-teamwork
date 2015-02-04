var gulp        = require('gulp');
var config      = require('../config').vendor;

gulp.task('copy-vendor', function(){
  gulp.src(config.src, { base: config.base })
    .pipe(gulp.dest(config.dest));
});
