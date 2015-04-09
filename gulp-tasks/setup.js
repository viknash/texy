var gulp = require('gulp');
var git = require('gulp-git');
var fs = require('fs');
var moduleDirectory = "./modules";
var config = require('../package.json');
var gitRepositories = [];

gulp.task('initModuleFolder', function(){
    //Create ./modules directory
    if (!fs.existsSync(moduleDirectory))
    {
        fs.mkdirSync(moduleDirectory);
    }    
});

module.exports = function ()
{
    var repos = [];
    //Parse packages.json and pull git repos
    var modules = config.dependencies;
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
            repos.push({
                name : repoName,
                cloned : cloned,
                localDirectory : localDirectory,
                forkedUrl : 'https://github.com/'+modules[module],
                remoteUrl : '',
            });
        }
    }    
    return repos;
};

gulp.task('findRepos', function(){
    //Parse packages.json and pull git repos
    var modules = config.dependencies;
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

/**
 * Pulls all required repositories and configures them.
 */
gulp.task('setup', ['initModuleFolder','findRepos','cloneRepos','linkUpstream'], function(){
});