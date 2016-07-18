var gulp = require('gulp'),
    gulpgo = require('gulp-go'),
    clean = require('gulp-clean'),
    webpack = require('webpack'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject-string'),
    WebpackDevServer = require('webpack-dev-server');

var devConfigWebpack = require('./dev.config.webpack.js'),
    prodConfigWebpack = require('./prod.config.webpack.js');

var watchFiles = {
    server: ['./main.go', './server/**/*.go', './client/src/*.tmpl']
};

var dependenciesPath = {
    templates : [
        './client/src/index.tmpl'
    ],
    fonts: [
        './bower_components/semantic/dist/themes/default/assets/fonts/*'
    ],
    images: [
        './client/src/images/*',
        './node_modules/leaflet/dist/images/*',
        './bower_components/semantic/dist/themes/default/assets/images/*'
    ]
}
var injectedPath = {
    dev: 'http://localhost:8081/js/bundle.js',
    prod: '/js/bundle.js'
}

/*===================== DEV =====================*/

/*====== Client ======*/
gulp.task('clean-js', function() {
    return gulp.src('./client/dist/js/*', {
        read: false
    }).pipe(clean());
});

gulp.task('bundle-html-dev', function() {
    return gulp.src(dependenciesPath.templates).pipe(inject.replace("REACT_APP", injectedPath.dev)).pipe(gulp.dest('./client/dist/'));
});


gulp.task('webpack-dev-server', ['clean-js', 'bundle-html-dev', 'bundle-fonts', 'bundle-images' ], function(callback) {
    var compiler = webpack(devConfigWebpack);
    new WebpackDevServer(compiler, {
        publicPath: '/js/',
        hot: true,
        quiet: true,
        noInfo: true,
        stats: {
            colors: true
        }
    }).listen(8081, 'localhost');
});

/*====== Server ======*/
gulp.task('go-run', function() {
    go = gulpgo.run('main.go', ['serve', '-e', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
});

gulp.task('watch-server', ['go-run'], function() {
    gulp.watch(watchFiles.server).on('change', function() {
        gulp.run('bundle-html-dev')
        go.restart();
    });
});

/*===================== PROD =====================*/

/*====== Client ======*/
gulp.task('bundle-html', function() {
    return gulp.src(dependenciesPath.templates).pipe(inject.replace("REACT_APP", injectedPath.prod)).pipe(gulp.dest('./client/dist/'));
});

gulp.task('bundle-fonts', function() {
    return gulp.src(dependenciesPath.fonts).pipe(gulp.dest('./client/dist/fonts/'));
});

gulp.task('bundle-images', function() {
    return gulp.src(dependenciesPath.images).pipe(gulp.dest('./client/dist/images/'));
});

gulp.task("bundle-client", function(doneCallBack) {
    webpack(prodConfigWebpack, function(err, stats) {
        doneCallBack();
    });
});

/*===================== TASKS =====================*/

gulp.task('start-dev', ['webpack-dev-server', 'watch-server', 'go-run']);
gulp.task('bundle', ['clean-js', 'bundle-html', 'bundle-fonts', 'bundle-images', 'bundle-client']);

gulp.task('default', ['start-dev']);
