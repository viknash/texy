var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');

var gitRepositories = require("./findrepos.js")();

/**
 * Push all
 */
gulp.task('push', ['setup'], function(){
    console.log("Project: "+config.name);    
    git.push(
        "origin",
        "master",
        { args: '-f', quiet: false, sync: true},
        function (err) {
            if (err) throw err;
        }        
    );
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);
        git.push("origin", "master",
                         { cwd: gitRepositories[i].localDirectory,  args: '-f', sync: true},
                            function (err) {
                                if (err) throw err;
                            }                            
                        );
    }
});

