var gulp = require('gulp');
var git = require('gulp-git');
var config = require('../package.json');

var gitRepositories = require("./findrepos.js")();

gulp.task('sync-fetch', ['setup'], function(){
    for (var i=0; i < gitRepositories.length;i++) {
        git.fetch(
            "upstream", "master",
            { cwd: gitRepositories[i].localDirectory, quiet: true, sync: true},
            function (err) {
                if (err) throw err;
            }
        );
    }            
});

gulp.task('sync-checkout', ['setup'], function(){
    for (var i=0; i < gitRepositories.length;i++) {
         git.checkout(
                "master", 
                { cwd: gitRepositories[i].localDirectory, quiet: true, sync: true},
                function (err) {
                    if (err) throw err;
                }
        );
    }            
});

gulp.task('sync-merge', ['setup'], function(){
    for (var i=0; i < gitRepositories.length;i++) {
        git.merge(
            "upstream/master", 
            { cwd: gitRepositories[i].localDirectory, quiet: true, sync: true},
            function (err) {
                if (err) throw err;
            }
        )            
    }            
});

/**
 * Merge latest code from upstream repositories
 */
gulp.task('sync', ['setup','sync-fetch','sync-checkout','sync-merge'], function(){
});
