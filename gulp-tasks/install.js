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
        if (gitRepositories[i].npm == true) {
            console.log("Installing (npm)" + gitRepositories[i].name);
            gulp.src([gitRepositories[i].localDirectory + '/package.json'])
                .pipe(plugins.install());
        }
        if (gitRepositories[i].bower == true) {
            console.log("Installing (Bower) " + gitRepositories[i].name);
            plugins.bower({
                cwd: gitRepositories[i].localDirectory
            })
        }
    }
});