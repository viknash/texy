var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var rootDir = process.cwd();
var config = require('../package.json');
var zipFileName = "brackets_extensions.zip";
var del = require('del');
/**
 * Publish brackets plugins to AWS
 */
gulp.task('upload_brackets_extensions', ['clear_brackets_extensions'], function () {
    //Converter Class 
    var Converter = require("csvtojson").core.Converter;
    var fs = require("fs");

    var csvFileName = "credentials.csv";
    var fileStream = fs.createReadStream(csvFileName);
    //new converter instance 
    var csvConverter = new Converter({
        constructResult: true
    });

    //end_parsed will be emitted once parsing finished 
    csvConverter.on("end_parsed", function (jsonObj) {

        var publisher = plugins.awspublish.create({
            params: {
                Bucket: jsonObj[0]["User Name"],
                StorageClass: 'REDUCED_REDUNDANCY',
                ACL: 'private'
            },
            accessKeyId: jsonObj[0]["Access Key Id"],
            secretAccessKey: jsonObj[0]["Secret Access Key"]
        });

        // define custom headers 
        var headers = {
            'Cache-Control': 'max-age=315360000, no-transform, public'
                // ... 
        };


        gulp.src(process.env.APPDATA + '/Brackets/extensions/user/**/*')
            .pipe(plugins.zip(zipFileName))
            .pipe(gulp.dest(config.custom_settings.directories.tmp))
            .pipe(publisher.publish(headers))
            .pipe(publisher.cache())
            .pipe(plugins.awspublish.reporter());

        del([config.custom_settings.directories.tmp + zipFileName]);
    });

    //read from file 
    fileStream.pipe(csvConverter);
});

gulp.copy = function (src, dest) {
    return gulp.src(src, {
            base: "."
        })
        .pipe(gulp.dest(dest));
};

/**
 * Install brackets plugins from AWS
 */
gulp.task('install_brackets_extensions', ['clear_brackets_extensions'], function () {
    plugins.download(config.custom_settings.brackets_extensions.bucket_url + '/' + zipFileName)
        .pipe(gulp.dest(config.custom_settings.directories.tmp))
        .pipe(plugins.unzip())
        .pipe(gulp.dest(config.custom_settings.directories.tmp + 'brackets_extensions'));

    gulp.copy(config.custom_settings.directories.tmp + 'brackets_extensions', process.env.APPDATA + '/Brackets/extensions/user');
});

gulp.task('clear_brackets_extensions', function () {
    del([
        config.custom_settings.directories.tmp + zipFileName,
        config.custom_settings.directories.tmp + 'brackets_extensions/**/*'
        ],
        function (err, deletedFiles) {
            console.log('Files deleted:\n', deletedFiles.join(',\n'));
        });
});