var moduleDirectory = "./modules";
var gitUser = "viknash";
var gitProject = "texy";

var gulp = require('gulp');
var git = require('gulp-git');
var jsdoc = require("gulp-jsdoc");
var fs = require('fs');

var config = require('./package.json');
var gitRepositories = [];

/**
 * Print git status
 */
gulp.task('status', function(){
  git.status({args: '--porcelain'}, function (err, stdout) {
    if (err) throw err;
  });
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
    for (var i=0; i < gitRepositories.length;i++) {
        console.log(gitRepositories[i]);
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
 * Merge latest code from trunks.
 */
gulp.task('sync', ['setup','fetch','checkout','merge'], function(){
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