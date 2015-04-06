var moduleDirectory = "./modules";
var gitUser = "viknash";
var gitProject = "texy";

var gulp = require('gulp');
var git = require('gulp-git');
var jsdoc = require("gulp-jsdoc");
var fs = require('fs');
var argv = require('yargs').default('m', "Update").argv;

var config = require('./package.json');
var gitRepositories = [];

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
 

/**
 * Commit all
 */
gulp.task('commit', ['setup'], function(){
    console.log("Project: "+config.name);    
    git.commitsimple(
        argv.m,
        { args: '-a', quiet: false, sync: false},
        function (err) {
            if (err) throw err;
        }        
    );
    for (var i=0; i < gitRepositories.length;i++) {
        console.log("Project: "+gitRepositories[i].name);
        git.commitsimple(
            argv.m,
            { cwd: gitRepositories[i].localDirectory,  args: ' -a', quiet: false, sync: false},
            function (err) {
                if (err) throw err;
            }                            
        );
    }
});


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
                                console.log(err);
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
});

gulp.task('pullRepo', function(){
                return git.clone(
                    'https://github.com/'+modules[module], 
                    { cwd: moduleDirectory, quiet: true},
                    function (err) {
                        if (err) throw err;
                    }
                ).pipe(
                    git.addRemote(
                                'upstream',
                                require(moduleDirectory+'/'+repoName+'/package.json').repository.url, 
                                function (err) {
                                    if (err) throw err;
                                }
                    )
                );
});


gulp.task('initModuleFolder', function(){
    //Create ./modules directory
    if (!fs.existsSync(moduleDirectory))
    {
        fs.mkdirSync(moduleDirectory);
    }    
});


gulp.task('findRepos', function(){
    //Parse packages.json and pull git repos
    var modules = config.devDependencies;
    for (var module in modules) {
        if(modules[module].indexOf(".git") != -1) {
            var findRepoName = new RegExp("^[^\/]*\/([^\/]*).git$");
            var findRepoNameResults = findRepoName.exec(modules[module]);
            var repoName = findRepoNameResults[1];
            var localDirectory = moduleDirectory+'/'+repoName;
            var cloned = false
            if (fs.existsSync(localDirectory))
            {
                cloned = true;
            }
            gitRepositories.push({
                name : repoName,
                cloned : cloned,
                localDirectory : localDirectory,
                forkedUrl : 'https://github.com/'+modules[module],
                remoteUrl : '',
            });
        }
    }
    
});


gulp.task('cloneRepos', ['initModuleFolder','findRepos'], function(){
    for (var i=0; i < gitRepositories.length;i++) {
        if (!gitRepositories[i].cloned) {
            /*git.clone(
                gitRepositories[i].forkedUrl, 
                { cwd: moduleDirectory, quiet: false, sync: true},
                function (err) {
                    if (err) throw err;
                }
            );*/
            git.addSubmodule(
                gitRepositories[i].forkedUrl,
                gitRepositories[i].localDirectory,
                { quiet: false, sync: true},
                function (err) {
                    if (err) throw err;
                }
            );
        }
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

/**
 * Pulls all required repositories and configures them.
 */
gulp.task('setup', ['initModuleFolder','findRepos','cloneRepos','linkUpstream'], function(){
    /*for (var i=0; i < gitRepositories.length;i++) {
        console.log(gitRepositories[i]);
    }*/           
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