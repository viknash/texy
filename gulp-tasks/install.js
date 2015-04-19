var gulp = require('gulp');
var config = require('../package.json');
var plugins = require('gulp-load-plugins')();

var gitRepositories = require("./findrepos.js")();

/**
 * npm install
 */
gulp.task('install', ['setup'], function () {
    console.log("Installing " + config.name);
    //gulp.src(['./package.json'])
    // .pipe(plugins.install());
    for (var i = 0; i < gitRepositories.length; i++) {
        console.log("Installing " + gitRepositories[i].name);
        gulp.src([gitRepositories[i].localDirectory + '/package.json'])
            .pipe(plugins.install());
    }
});