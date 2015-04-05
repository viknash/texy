var moduleDirectory = "./modules";
var gitUser = "viknash";
var gitProject = "texy";

var gulp = require('gulp');
var git = require('gulp-git');
var config = require('./package.json');
var fs = require('fs');

var gitRepositories = [];


// Run git init 
// src is the root folder for git to initialize 
gulp.task('git-init', function(){
  git.init(function (err) {
    if (err) throw err;
  });
});
 
// Run git init with options 
gulp.task('git-init', function(){
  git.init({args: '--quiet --bare'}, function (err) {
    if (err) throw err;
  });
});
 
// Run git add 
// src is the file(s) to add (or ./*) 
gulp.task('git-add', function(){
  return gulp.src('./*')
    .pipe(git.add());
});
 
// Run git add with options 
gulp.task('git-add', function(){
  return gulp.src('./*')
    .pipe(git.add({args: '-f -i -p'}));
});
 
// Run git commit 
// src are the files to commit (or ./*) 
gulp.task('git-commit', function(){
  return gulp.src('./*')
    .pipe(git.commit('initial commit'));
});
 
// Run git commit with options 
gulp.task('git-commit', function(){
  return gulp.src('./*')
    .pipe(git.commit('initial commit', {args: '-A --amend -s'}));
});
 
// Run git remote add 
// remote is the remote repo 
// repo is the https url of the repo 
gulp.task('git-remote', function(){
  git.addRemote('origin', 'https://github.com/'+gitUser+'/'+gitProject, function (err) {
    if (err) throw err;
  });
});
 
// Run git push 
// remote is the remote repo 
// branch is the remote branch to push to 
gulp.task('git-push', function(){
  git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});
 
// Run git push with options 
// branch is the remote branch to push to 
gulp.task('git-push', function(){
  git.push('origin', 'master', {args: " -f"}, function (err) {
    if (err) throw err;
  });
});
 
// Run git pull 
// remote is the remote repo 
// branch is the remote branch to pull from 
gulp.task('git-pull', function(){
  git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});
 
// Run git fetch 
// Fetch refs from all remotes 
gulp.task('git-fetch', function(){
  git.fetch('', '', {args: '--all'}, function (err) {
    if (err) throw err;
  });
});
 
// Run git fetch 
// Fetch refs from origin 
gulp.task('git-fetch', function(){
  git.fetch('origin', '', function (err) {
    if (err) throw err;
  });
});
 
// Clone a remote repo 
gulp.task('git-clone', function(){
  git.clone('https://github.com/'+gitUser+'/'+gitProject, function (err) {
    if (err) throw err;
  });
});
 
 
// Tag the repo with a version 
gulp.task('git-tag', function(){
  git.tag('v1.1.1', 'Version message', function (err) {
    if (err) throw err;
  });
});
 
// Tag the repo With signed key 
gulp.task('git-tagsec', function(){
  git.tag('v1.1.1', 'Version message with signed key', {args: "signed"}, function (err) {
    if (err) throw err;
  });
});
 
// Create a git branch 
gulp.task('git-branch', function(){
  git.branch('newBranch', function (err) {
    if (err) throw err;
  });
});
 
// Checkout a git branch 
gulp.task('git-checkout', function(){
  git.checkout('branchName', function (err) {
    if (err) throw err;
  });
});
 
// Create and switch to a git branch 
gulp.task('git-checkout', function(){
  git.checkout('branchName', {args:'-b'}, function (err) {
    if (err) throw err;
  });
});
 
// Merge branches to master 
gulp.task('git-merge', function(){
  git.merge('branchName', function (err) {
    if (err) throw err;
  });
});
 
// Reset a commit 
gulp.task('git-reset', function(){
  git.reset('SHA', function (err) {
    if (err) throw err;
  });
});
 
// Git rm a file or folder 
gulp.task('git-rm', function(){
  return gulp.src('./gruntfile.js')
    .pipe(git.rm());
});
 
gulp.task('git-addSubmodule', function(){
  git.addSubmodule('https://github.com/'+gitUser+'/'+gitProject, gitProject, { args: '-b master'});
});
 
gulp.task('git-updateSubmodules', function(){
  git.updateSubmodule({ args: '--init' });
});
 
// Working tree status 
gulp.task('status', function(){
  git.status({args: '--porcelain'}, function (err, stdout) {
    if (err) throw err;
  });
});
 
// Other actions that do not require a Vinyl 
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
            git.clone(
                gitRepositories[i].forkedUrl, 
                { cwd: moduleDirectory, quiet: false, sync: true},
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

gulp.task('sync', ['setup','fetch','checkout','merge'], function(){
});


// Run gulp's default task 
gulp.task('default',['add']);