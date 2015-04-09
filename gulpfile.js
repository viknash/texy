var moduleDirectory = "./modules";
var gitUser = "viknash";
var gitProject = "texy";

var gulp = require('gulp');
var git = require('gulp-git');
var jsdoc = require("gulp-jsdoc");
var requireDir = require('require-dir');

var fs = require('fs');

var config = require('./package.json');
var gitRepositories = [];

requireDir('./gulp-tasks');

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


/**
 * Pull all
 */
gulp.task('pull', ['setup'], function(){
    console.log("Project: "+config.name);    
    git.push(
        "origin",
        "master",
        { args: '--rebase', quiet: false, sync: true},
        function (err) {
            if (err) throw err;
        }        
    );
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);
        git.push("origin", "master",
                         { cwd: gitRepositories[i].localDirectory,  args: '--rebase', sync: true},
                            function (err) {
                                if (err) throw err;
                            }                            
                        );
    }
});



/**
 * Print git logs
 */
gulp.task('git-log', function(){
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




gulp.task('linkUpstream', ['initModuleFolder','findRepos','cloneRepos'], function(){
    for (var i=0; i < gitRepositories.length;i++) {
        if (!gitRepositories[i].cloned) {
            var repoDependenciesFile = gitRepositories[i].localDirectory+'/package.json';
            var repoDependencies = require(repoDependenciesFile);
            gitRepositories[i].remoteUrl = repoDependencies.repository.url;
            git.addRemote(
                    'upstream',
                    gitRepositories[i].remoteUrl,
                    { cwd: gitRepositories[i].localDirectory },
                    function (err) {
                        if (err) throw err;
                    }
            )
            gitRepositories[i].cloned = true;
        }
    }            
});


gulp.task('fetch', ['initModuleFolder','findRepos'], function(){
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

gulp.task('checkout', ['initModuleFolder','findRepos'], function(){
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

gulp.task('merge', ['initModuleFolder','findRepos'], function(){
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
gulp.task('sync', ['setup','fetch','checkout','merge'], function(){
});

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


/**
 * Generates documentation.
 */
gulp.task('docs', function(){
    gulp.src(["./*.js", "README.md"])
      .pipe(jsdoc.parser())
      .pipe(jsdoc.generator('./docs',
                            {
                                path: 'ink-docstrap',
                                systemName      : 'Texy',
                                footer          : "Texy",
                                copyright       : "Copyright Viknash",
                                navType         : "vertical",
                                theme           : "journal",
                                linenums        : true,
                                collapseSymbols : false,
                                inverseNav      : false
                            }                            
                           )
           )
});

/**
 * Default task
 */
gulp.task('default',['setup']);