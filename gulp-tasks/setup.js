var gulp = require('gulp');
var git = require('gulp-git');
var fs = require('fs');
var child_process = require('child_process');
var moduleDirectory = "./modules";
var config = require('../package.json');
var argv = require('yargs').argv;
var gitRepositories = [];


/**
 * Pulls all required repositories and configures them.
 * @argument {string} force Force adding of a module
 */
gulp.task('setup', ['setup-linkUpstream'], function () {});

gulp.task('setup-initModuleFolder', function () {
    //Create ./modules directory
    if (!fs.existsSync(moduleDirectory)) {
        fs.mkdirSync(moduleDirectory);
    }
});

gulp.task('setup-findRepos', ['setup-initModuleFolder'], function () {
    //Parse packages.json and pull git repos
    var modules = config.dependencies;
    for (var module in modules) {
        if (modules[module].indexOf(".git") != -1) {
            var findRepoName = new RegExp("^[^\/]*\/([^\/]*).git$");
            var findRepoNameResults = findRepoName.exec(modules[module]);
            var repoName = findRepoNameResults[1];
            var localDirectory = moduleDirectory + '/' + repoName;
            var cloned = true;
            try {
                console.log('git submodule status modules/' + repoName);
                child_process.execSync('git submodule status modules/' + repoName);
            } catch (err) {
                cloned = false;
            }
            //if (fs.existsSync(localDirectory)) {
            //    cloned = true;
            //}
            gitRepositories.push({
                name: repoName,
                cloned: cloned,
                localDirectory: localDirectory,
                forkedUrl: 'https://github.com/' + modules[module],
                remoteUrl: '',
            });
        }
    }

});


gulp.task('setup-cloneRepos', ['setup-findRepos'], function () {
    for (var i = 0; i < gitRepositories.length; i++) {
        if (!gitRepositories[i].cloned) {
            /*git.clone(
                gitRepositories[i].forkedUrl, 
                { cwd: moduleDirectory, quiet: false, sync: true},
                function (err) {
                    if (err) throw err;
                }
            );*/
            var args = ""
            if (argv.force) {
                args = "--force";
            }
            git.addSubmodule(
                gitRepositories[i].forkedUrl,
                gitRepositories[i].localDirectory, {
                    quiet: false,
                    sync: true,
                    args: args
                },
                function (err) {
                    if (err) throw err;
                }
            );
        }
    }
    for (var i = 0; i < gitRepositories.length; i++) {
        var repoDependenciesFile = gitRepositories[i].localDirectory + '/package.json';
        while (!fs.existsSync(repoDependenciesFile)) {}
    }
});

gulp.task('setup-linkUpstream', ['setup-cloneRepos'], function () {
    for (var i = 0; i < gitRepositories.length; i++) {
        if (!gitRepositories[i].cloned) {
            var repoDependenciesFile = gitRepositories[i].localDirectory + '/package.json';
            while (!fs.existsSync(repoDependenciesFile)) {};
            var repoDependencies = require(repoDependenciesFile);
            gitRepositories[i].remoteUrl = repoDependencies.repository.url;
            git.addRemote(
                'upstream',
                gitRepositories[i].remoteUrl, {
                    cwd: gitRepositories[i].localDirectory
                },
                function (err) {
                    if (err) throw err;
                }
            )
            gitRepositories[i].cloned = true;
        }
    }
});