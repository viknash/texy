var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');

var gitRepositories = require("./findrepos.js")();



/**
 * Update latest code from master
 */
gulp.task('update', ['setup'], function(){
    console.log("Updating "+config.name);
    git.pull(
        'origin',
        'master',
        { quiet: false, sync: false},
        function (err) {
            if (err) throw err;
        }
    )    
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Updating "+gitRepositories[i].name);
        git.pull(
            'origin',
            'master',
            { cwd: gitRepositories[i].localDirectory, quiet: false, sync: false},
            function (err) {
                if (err) throw err;
            }
        )
    }
});
