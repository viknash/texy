var gulp = require('gulp');
var fs = require('fs');
var config = require('../package.json');
var plugins = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var beefy = require('beefy');
var http = require('http');
 

var gitRepositories = require("./findrepos.js")();
var rootDir = process.cwd();

/**
 * Pre-load grunt tasks into gulp
 */
if (fs.existsSync('./Gruntfile.js'))
{
    plugins.grunt(gulp);
}    

/**
 * Pre-load grunt tasks in modules into into gulp
 */
for (var i=0; i < gitRepositories.length;i++) {
    console.log("Grab grunt tasks: "+gitRepositories[i].name);        
    if (gitRepositories[i].grunt)
    {
        plugins.grunt(gulp, {
            base: require('path').join(__dirname, '../', gitRepositories[i].localDirectory),
            prefix: "grunt-"+gitRepositories[i].name+"-"
        });        
    }
}

/* Hack Reset to Root Dir. Directory changes after execution of grunt plugin */
process.chdir(rootDir);

/**
 * Run default grunt tasks
 */
gulp.task('build-grunt', function() {
    var taskName = 'default';
    if (argv.continuous != undefined)
    {
        taskName = 'watch';
    }
    if (fs.existsSync('./Gruntfile.js'))
    {
        console.log("Run Grunt Task: "+taskName);        
        gulp.run('grunt-'+taskName);
    }
    var tasks = Object.keys(gulp.tasks);
    for (var i=0; i < gitRepositories.length;i++) {
        if (gitRepositories[i].grunt)
        {
            var moduleTaskName = "grunt-"+gitRepositories[i].name+"-"+taskName;
            if(tasks.indexOf(moduleTaskName) != -1)
            {
                console.log("Run Grunt Task: "+moduleTaskName);
                process.chdir(gitRepositories[i].localDirectory);            
                gulp.run(moduleTaskName);
                process.chdir(rootDir);
            }
        }
    }
});

/**
 * Run default gulp tasks
 * NOT TESTED YET
 */
gulp.task('build-gulp', function() {
    var taskName = 'default';
    if (argv.continuous != undefined)
    {
        taskName = 'watch';
    }    
    for (var i=0; i < gitRepositories.length;i++) {
        if (gitRepositories[i].gulp)
        {
            console.log("Run Gulp Task: "+gitRepositories[i].name);        
            gulp.src(gitRepositories[i].localDirectory+'/gulpfile.js')
                .pipe(plugins.gulp(taskName));            
        }
    }    
});


/**
 * Pulls all required repositories and configures them.
 */
gulp.task('build', ['build-grunt','build-gulp','beefy'], function(){
});
