var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');
var argv = require('yargs').default('m', "Update").argv;

var gitRepositories = require("./findrepos.js")();

/**
 * Commit all
 */
gulp.task('commit', ['setup'], function(){
    console.log("Project: "+config.name);    
    git.commitsimple(
        argv.m,
        { args: '-a', quiet: false, sync: true},
        function (err) {
            if (err) console.log(err.toString());
            
        }        
    );
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);
        git.commitsimple(
            argv.m,
            { cwd: gitRepositories[i].localDirectory,  args: ' -a', quiet: false, sync: true},
            function (err) {
                //if (err) throw err;
            }                            
        );
    }
});
