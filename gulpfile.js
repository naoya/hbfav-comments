var gulp  = require('gulp');
var util  = require('gulp-util');
var babel = require('gulp-babel');

function errorHandler (err) {
  util.log(util.colors.red('Error'), err.message);
  this.emit('end');
}

gulp.task('compile', [
  'compile-js'
]);

gulp.task('compile-js', function() {
  gulp.src("./src/**/*.{js,jsx}")
    .pipe(babel())
    .on('error', errorHandler)
    .pipe(gulp.dest("./"));
});

gulp.task('watch', ['compile'], function () {
  gulp.watch(['./src/**/*'], ['compile']);
});

gulp.task('default', ['watch']);
