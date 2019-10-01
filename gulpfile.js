const gulp = require('gulp');
const concat = require('gulp-concat');
const templateCache = require('gulp-angular-templatecache');
const path = require('path');
const babel = require('gulp-babel');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');

// ============================================
//            MLC TRANSLATE
// ============================================

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

// ============================================
//            MLC TRANSLATE TOOLBOX
// ============================================

/**
 * Template cache: We transpile .html into .js files
 */
gulp.task('mlc-translate-toolbox.templatecache', function() {
  return gulp.src('src/mlc-translate-toolbox/partials/**/*.html')
    .pipe(templateCache('tmp', {
      module: 'MlcTranslateToolbox',
      base: path.normalize(__dirname) + '/src/mlc-translate-toolbox/partials',
      // root doesn't accept 'http://', need to use transformUrl
      transformUrl: function(url) {
        return 'http://mlc-translate.local/' + url;
      }
    }))
    .pipe(concat('partials.js'))
    .pipe(gulp.dest('tmp/templatecache/mlc-translate-toolbox'));
});

gulp.task('mlc-translate-toolbox.concat-js', gulp.series('mlc-translate-toolbox.templatecache', function() {
  // collect the sources of the application (src + templates in js cache)
  return gulp.src([
    'src/mlc-translate-toolbox/**/*.js',
    'tmp/templatecache/mlc-translate-toolbox/**/*.js'
  ])
    // concat the sources
    .pipe(concat('mlc-translate-toolbox.js'))
    // transpile from ES6 to ES5
    .pipe(babel({
      plugins: ['@babel/transform-runtime']
    }))
    // save the result in web/applications/index.js
    .pipe(gulp.dest('dist'));
}));

gulp.task('mlc-translate-toolbox.less', function() {
  return gulp.src(['./less/**/*.less'])
    .pipe(less('').on('error', function(err) {
      console.log(err);
    }))
    .pipe(concat('mlc-translate-toolbox.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(cssmin('').on('error', function(err) {
      console.log(err);
    }))
    .pipe(rename('mlc-translate-toolbox.min.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('mlc-translate-toolbox', gulp.parallel(
  'mlc-translate-toolbox.concat-js',
  'mlc-translate-toolbox.less'
));

// ============================================
//                DEFAULT TASK
// ============================================

/**
 * The default task is run by `gulp` without parameters.
 * We build the libraries
 */ 
gulp.task('default', gulp.parallel('mlc-translate', 'mlc-translate-toolbox'));

