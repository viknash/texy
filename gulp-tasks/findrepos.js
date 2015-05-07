var fs = require('fs');
var moduleDirectory = "./modules";
var config = require('../package.json');

module.exports = function () {
    var repos = [];
    //Parse packages.json and pull git repos
    var modules = config.dependencies;
    for (var module in modules) {
        if (modules[module].indexOf(".git") != -1) {
            var findRepoName = new RegExp("^[^\/]*\/([^\/]*).git$");
            var findRepoNameResults = findRepoName.exec(modules[module]);
            var repoName = findRepoNameResults[1];
            var localDirectory = moduleDirectory + '/' + repoName;
            if (repoName.indexOf("texy") != -1) {
                localDirectory = repoName;
            }
            var cloned = false;
            if (fs.existsSync(localDirectory)) {
                cloned = true;
            }
            var gulp = false;
            if (fs.existsSync(localDirectory + '/gulpfile.js')) {
                gulp = true;
            }
            var grunt = false;
            if (fs.existsSync(localDirectory + '/Gruntfile.js')) {
                grunt = true;
            }
            var bower = false;
            if (fs.existsSync(localDirectory + '/bower.json')) {
                bower = true;
            }
            var npm = false;
            if (fs.existsSync(localDirectory + '/package.json')) {
                npm = true;
            }
            repos.push({
                name: repoName,
                cloned: cloned,
                localDirectory: localDirectory,
                forkedUrl: 'https://github.com/' + modules[module],
                remoteUrl: '',
                gulp: gulp,
                grunt: grunt,
                bower: bower,
                npm: npm
            });
        }
    }
    return repos;
};