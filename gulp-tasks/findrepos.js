var fs = require('fs');
var moduleDirectory = "./modules";
var config = require('../package.json');

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
            var gulp = false
            if (fs.existsSync(localDirectory+'/gulpfile.js'))
            {
                gulp = true;
            }            
            var grunt = false
            if (fs.existsSync(localDirectory+'/Gruntfile.js'))
            {
                grunt = true;
            }            
            repos.push({
                name : repoName,
                cloned : cloned,
                localDirectory : localDirectory,
                forkedUrl : 'https://github.com/'+modules[module],
                remoteUrl : '',
                gulp : gulp,
                grunt : grunt
            });
        }
    }    
    return repos;
};