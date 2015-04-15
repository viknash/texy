var gulp = require('gulp');
var jsdoc = require("gulp-jsdoc");

var gitRepositories = require("./findrepos.js")();

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
