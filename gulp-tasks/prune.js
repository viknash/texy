var gulp = require('gulp');
var config = require('../package.json');
var plugins = require('gulp-load-plugins')();

var gitRepositories = require("./findrepos.js")();

/**
 * npm prune
 */
gulp.task('prune', ['setup'], function() {
    console.log("Cleaning node_modules "+config.name);
    var options = {
        continueOnError: false, // default = false, true means don't emit error event 
        pipeStdout: false, // default = false, true means stdout is written to file.contents 
        customTemplatingThing: "test" // content passed to gutil.template() 
    };
    var reportOptions = {
        err: true, // default = true, false means don't write err 
        stderr: true, // default = true, false means don't write stderr 
        stdout: true // default = true, false means don't write stdout 
    }
    gulp.src('./**/**')
        .pipe(plugins.exec('npm prune', options))
        .pipe(plugins.exec.reporter(reportOptions));
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Cleaning node_modules "+gitRepositories[i].name);
          var options = {
            continueOnError: false, // default = false, true means don't emit error event 
            pipeStdout: false, // default = false, true means stdout is written to file.contents 
            customTemplatingThing: "test", // content passed to gutil.template() 
            cwd: gitRepositories[i].localDirectory
          };
          var reportOptions = {
            err: true, // default = true, false means don't write err 
            stderr: true, // default = true, false means don't write stderr 
            stdout: true // default = true, false means don't write stdout 
          }
          gulp.src('./**/**')
            .pipe(plugins.exec('npm prune', options))
            .pipe(plugins.exec.reporter(reportOptions));
    }
});