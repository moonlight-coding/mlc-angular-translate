const gulp = require('gulp');
const concat = require('gulp-concat');
const templateCache = require('gulp-angular-templatecache');
const path = require('path');
const babel = require('gulp-babel');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

// ============================================
//            ANGULARJS APPLICATION
// ============================================

/**
 * Template cache: We transpile .html into .js files
 *//*
gulp.task('index-application.templatecache', function() {
  return gulp.src('src/frontend/partials/** /*.html')
    .pipe(templateCache('tmp', {
      module: 'CalendarTestApp',
      base: path.normalize(__dirname) + '/src/frontend/partials',
      // root doesn't accept 'http://', need to use transformUrl
      transformUrl: function(url) {
        return 'http://calendar-test-app.local/' + url;
      }
    }))
    .pipe(concat('index.js'))
    .pipe(gulp.dest('tmp/frontend/templatecache'));
});*/

/**
 * Concatenate all the .js src of the angularjs application into 1 single file
 */
gulp.task('mlc-translate', function() {
  // collect the sources of the application (src + templates in js cache)
  return gulp.src([
    'src/mlc-translate/**/*.js'
  ])
    // concat the sources
    .pipe(concat('mlc-translate.js'))
    // transpile from ES6 to ES5
    .pipe(babel({
      plugins: ['@babel/transform-runtime']
    }))
    // save the result in web/applications/index.js
    .pipe(gulp.dest('dist'));
});

/*gulp.task('less', function() {
  return gulp.src(['./less/** /*.less'])
    .pipe(less('').on('error', function(err) {
      console.log(err);
    }))
    .pipe(concat('site.css'))
    .pipe(gulp.dest('./web/'))
    .pipe(cssmin('').on('error', function(err) {
      console.log(err);
    }))
    .pipe(rename('site.min.css'))
    .pipe(gulp.dest('./web/'));
});*/

// index-application: task to build the application of the / (index) endpoint
/*gulp.task('index-application', gulp.parallel(
  gulp.series(
    'index-application.templatecache', 
    'index-application.concat-js'
  ),
  'less'
));*/

// ============================================
//                DEFAULT TASK
// ============================================

/**
 * The default task is run by `gulp` without parameters.
 * We build the libraries
 */ 
gulp.task('default', gulp.series('mlc-translate'));

