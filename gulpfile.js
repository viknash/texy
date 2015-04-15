var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
 require('gulp-task-list')(gulp);
var taskListing = require('gulp-task-listing');
var requireDir = require('require-dir');
var beefy = require('beefy');
var http = require('http');

requireDir('./gulp-tasks');


/**
 * Default task
 */

// Print git logs
gulp.task('default',['task-list']);

// Add a task to render the output 
gulp.task('help', taskListing);


var bundlePaths = {
    src: [
        'client/js/**/*.js',
        "!client/js/**/lib/**" // Don't bundle libs
    ],
    dest:'build/www/js/'
}


// Browserify and copy js files
gulp.task('browserify', plugins.watchify(function(watchify) {
    return gulp.src(bundlePaths.src)
        .pipe(watchify({
            watch:false
        }))
        .pipe(gulp.dest(bundlePaths.dest))
}))

// Browserify and copy js files
gulp.task('watchify', plugins.watchify(function(watchify) {
    return gulp.src(bundlePaths.src)
        .pipe(watchify({
            watch:true
        }))
        .pipe(gulp.dest(bundlePaths.dest))
}))

