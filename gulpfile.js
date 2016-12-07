var gulp = require('gulp'),
  gulpgo = require('gulp-go'),
  clean = require('gulp-clean'),
  exec = require('child_process').exec,
  tap = require('gulp-tap'),
  webpack = require('webpack'),
  concat = require('gulp-concat'),
  inject = require('gulp-inject-string'),
  WebpackDevServer = require('webpack-dev-server');

var devConfigWebpack = require('./dev.config.webpack.js'),
  prodConfigWebpack = require('./prod.config.webpack.js');

var watchFiles = {
  server: ['./main.go', './server/**/*.go', 'cmd/**/*.go', 'model/**/*.go']
};

var dependenciesPath = {
  templates: [
    './client/src/index.tmpl'
  ],
  fonts: [
    './bower_components/semantic/dist/themes/default/assets/fonts/*'
  ],
  images: [
    './client/src/components/app/images/*',
    './client/src/components/users/user/images/*',
    './node_modules/leaflet/dist/images/*',
    './bower_components/semantic/dist/themes/default/assets/images/*'
  ]
};
var injectedPath = {
  dev: 'http://localhost:8081/js/bundle.js',
  prod: '/js/bundle.js'
};

var distPath = {
  binary: './docktor',
  client: './client/dist/**/*',
  dist: './dist'
};

/*===================== DEV =====================*/

/*====== Client ======*/
gulp.task('clean-js', function () {
  return gulp.src('./client/dist/js/*', {
    read: false
  }).pipe(clean());
});

gulp.task('bundle-html-dev', function () {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.dev)).pipe(gulp.dest('./client/dist/'));
});


gulp.task('webpack-dev-server', ['clean-js', 'bundle-html-dev', 'bundle-fonts', 'bundle-images'], function (callback) {
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
gulp.task('go-fmt', function () {
  return gulp.src(watchFiles.server)
    .pipe(tap(function (file, t) {
      console.log(file.path);
      exec('go fmt ' + file.path, function (err, stdout, stderr) {
        if (err) {
          throw err;
        }
      });
    }));
});

gulp.task('go-run', function () {
  go = gulpgo.run('main.go', ['serve', '-e', 'dev', '--redis-addr', 'localhost:6379'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
});

gulp.task('dist-server', ['go-fmt'], function () {
  exec('go build', function (err, stdout, stderr) {
    if (!err) {
      console.log('Docktor backend Build successfull');
      gulp.src('./docktor')
        .pipe(gulp.dest(distPath.dist));
    } else {
      console.log(err);
    }
  });
});

gulp.task('watch-server', ['go-run'], function () {
  gulp.watch(watchFiles.server).on('change', function () {
    gulp.run('bundle-html-dev');
    go.restart();
  });
});

/*===================== PROD =====================*/

/*====== Client ======*/
gulp.task('bundle-html', function () {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.prod)).pipe(gulp.dest('./client/dist/'));
});

gulp.task('bundle-fonts', function () {
  return gulp.src(dependenciesPath.fonts).pipe(gulp.dest('./client/dist/fonts/'));
});

gulp.task('bundle-images', function () {
  return gulp.src(dependenciesPath.images).pipe(gulp.dest('./client/dist/images/'));
});

gulp.task('bundle-client', function (doneCallBack) {
  webpack(prodConfigWebpack, function (err, stats) {
    doneCallBack();
  });
});

gulp.task('bundle', ['clean-js', 'bundle-html', 'bundle-fonts', 'bundle-images', 'bundle-client']);


gulp.task('clean', function () {
  return gulp.src([distPath.dist + '/*', distPath.client], {
    read: false
  }).pipe(clean());
});

gulp.task('dist-client', ['bundle'], function () {
  return gulp.src(distPath.client).pipe(gulp.dest(distPath.dist + '/client/dist'));
});

/*===================== TASKS =====================*/

gulp.task('start-dev', ['webpack-dev-server', 'watch-server', 'go-run']);
gulp.task('dist', ['dist-server', 'dist-client']);
gulp.task('default', ['start-dev']);
