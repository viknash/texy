var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var taskListing = require('gulp-task-listing');
var requireDir = require('require-dir');
var http = require('http');

requireDir('./gulp-tasks');

/**
 * Default task
 */

// Print help
gulp.task('default', ['help']);

// Print help
gulp.task('help', taskListing);