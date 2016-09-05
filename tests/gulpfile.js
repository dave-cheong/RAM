var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var tslint = require('gulp-tslint');
var ts = require('gulp-typescript');
var url = require('url');
var args = require('yargs').argv;

var tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('ts:lint', function () {
  return gulp.src(['typescript/{**,./}/*.ts'])
    .pipe(tslint())
    .pipe(tslint.report('verbose', {
      emitError: false
    }));
});

gulp.task('default', ['ts:compile', 'test'], function () {
  return gulp.watch(['typescript/{**,./}/*.ts', 'typescript/{**,./}/*.html'], ['ts:compile', 'test']);
});

gulp.task('ts:compile',['ts:lint'], function () {
    return gulp.src(['typescript/{**,./}/*.ts','../commons/{**,./}/*.ts'])
        .pipe(ts(tsProject, { sortOutput: true }))
        .pipe(gulp.dest('dist/'));

});

gulp.task('test', ['ts:compile'], function () {
  var pattern = ['dist/{**,./}/*.spec.js'];
  if (args.test) {
    pattern = ['dist/{**,./}/' + args.test + '.spec.js'];
  }
  console.log('\nRunning tests with pattern ' + args.test);
  return gulp.src(pattern).pipe(
    jasmine({
      verbose: true,
      includeStackTrace: true,
      config: {
        stopSpecOnExpectationFailure: false,
        random: false
      }
    })
  );
});
