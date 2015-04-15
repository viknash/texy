var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');

var gitRepositories = require("./findrepos.js")();

/**
 * Print git status
 */
gulp.task('status', ['setup'], function(){
    console.log("Project: "+config.name);    
    var ret = git.status(
        { args: '--porcelain', quiet: false, sync: true},
        function (err) {
            if (err) throw err;
        }
    )
    console.log(ret.toString());
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);        
        var ret = git.status(
            { args: '--porcelain', cwd: gitRepositories[i].localDirectory, quiet: false, sync: true},
            function (err) {
                if (err) throw err;
            }
        )
        console.log(ret.toString());
    }    
});
 