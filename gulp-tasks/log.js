var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');

var gitRepositories = require("./findrepos.js")();

/**
 * Print git logs
 */
gulp.task('log', function(){
  git.exec({args : 'log --follow .'}, function (err, stdout) {
    if (err) throw err;
  });
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);
        git.exec({ cwd: gitRepositories[i].localDirectory, args : 'log --follow .'}, function (err, stdout) {
          if (err) throw err;
        });        
    }    
});