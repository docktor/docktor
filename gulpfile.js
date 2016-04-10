'use strict';

var gulp = require('gulp'),
    gulpgo = require('gulp-go'),
    exec = require('child_process').exec,
    tap = require('gulp-tap'),
    concat = require('gulp-concat'),
    vulcanize = require('vulcanize'),
    inject = require('gulp-inject'),
    env = require('gulp-env'),
    tar = require('gulp-tar'),
    gzip = require('gulp-gzip'),
    artifactory = require('gulp-artifactory-upload'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    del = require('del'),
    dirname = require('path').dirname;


/************************* Server tasks *************************/

var serverPaths = {
    ALL_GO: ['*.go','./server/**/*.go','./cmd/**/*.go'],
    DEST_BIN : './dist'
};

var go;

/** GO tasks **/

gulp.task('dist-server', ['go-fmt','go-build']);

gulp.task('set-env', function () {
    env({
        vars: {
            GO15VENDOREXPERIMENT: 1
        }
    })
});

gulp.task('go-build', ["set-env"], function() {
    exec('go build', function (err, stdout, stderr) {
        if (!err) {
            console.log('Docktor Build successfull');
            gulp.src('./docktor')
                .pipe(gulp.dest(serverPaths.DEST_BIN));
        } else {
            console.log(err);
        }
    });
});

gulp.task('go-fmt', function() {
    return gulp.src(serverPaths.ALL_GO)
        .pipe(tap(function(file, t) {
            console.log(file.path);
            exec('go fmt ' + file.path, function (err, stdout, stderr) {
                if (err) {
                    throw err
                }
            });
        }));
});

gulp.task('server-dev', ['server-watch']);

gulp.task('go-run', function() {
    go = gulpgo.run('main.go',[ 'serve',
        '--mongo_url', 'localhost:27017',
    ], {stdio: 'inherit'});
});

gulp.task('server-watch', ['go-run'], function() {
    gulp.watch(serverPaths.ALL_GO).on('change', function() {
        go.restart();
    });
});



/************************* Package tasks ************************/

gulp.task('clean', function () {
    return del(['dist']);
});
gulp.task('dist', ['dist-server']);

gulp.task('archive', function() {
    return gulp.src("./dist/**")
        .pipe(tar('docktor.tar'))
        .pipe(gzip())
        .pipe(gulp.dest(serverPaths.DEST_BIN));
});

gulp.task( 'upload', function() {
    return gulp.src( './dist/mom.tar.gz' )
        .pipe( artifactory( {
            url: process.env.REPOSITORY_URL,
            username: process.env.REPOSITORY_USER,
            password: process.env.REPOSITORY_PASSWORD
        } ) )
        .on('error', console.log);
} );

/************************* Default tasks ************************/

gulp.task('default', ['server-dev']);
