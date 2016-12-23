var gulp = require('gulp'),
  gulpgo = require('gulp-go'),
  clean = require('gulp-clean'),
  exec = require('child_process').exec,
  tap = require('gulp-tap'),
  webpack = require('webpack'),
  concat = require('gulp-concat'),
  inject = require('gulp-inject-string'),
  zip = require('gulp-zip'),
  docktor = require('./package.json'),
  git = require('git-rev'),
  dateFormat = require('dateformat'),
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
  dist: './dist',
  zipname: `docktor-${docktor.version}.zip`
};

const now = () => {
  return dateFormat(new Date(), 'isoDateTime');
};

/*===================== DEV =====================*/

/*====== Client ======*/
gulp.task('clean-js', function() {
  return gulp.src('./client/dist/js/*', {
    read: false
  }).pipe(clean());
});

gulp.task('bundle-html-dev', function() {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.dev)).pipe(gulp.dest('./client/dist/'));
});


gulp.task('webpack-dev-server', ['clean-js', 'bundle-html-dev', 'bundle-fonts', 'bundle-images'], function(callback) {
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
  go = gulpgo.run('main.go', ['serve', '-e', 'dev', '--redis-addr', 'localhost:6379', '--level', 'debug'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
});

gulp.task('watch-server', ['go-run'], function() {
  gulp.watch(watchFiles.server).on('change', function() {
    gulp.run('bundle-html-dev');
    go.restart();
  });
});

/*===================== PROD =====================*/

/*====== Client ======*/
gulp.task('bundle-html', function() {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.prod)).pipe(gulp.dest('./client/dist/'));
});

gulp.task('bundle-fonts', function() {
  return gulp.src(dependenciesPath.fonts).pipe(gulp.dest('./client/dist/fonts/'));
});

gulp.task('bundle-images', function() {
  return gulp.src(dependenciesPath.images).pipe(gulp.dest('./client/dist/images/'));
});

gulp.task('bundle-client', function(doneCallBack) {
  webpack(prodConfigWebpack, function(err, stats) {
    doneCallBack();
  });
});

gulp.task('bundle', ['clean-js', 'bundle-html', 'bundle-fonts', 'bundle-images', 'bundle-client']);

gulp.task('dist-client', ['bundle'], function() {
  return gulp.src(distPath.client).pipe(gulp.dest(distPath.dist + '/client/dist'));
});

/*====== Server =========*/

gulp.task('dist-server', ['clean-dist'], function() {
  git.long(function (gitHash) {
    const flags = `
      -X github.com/soprasteria/docktor/cmd.Version=${docktor.version}
      -X github.com/soprasteria/docktor/cmd.BuildDate=${now()}
      -X github.com/soprasteria/docktor/cmd.GitHash=${gitHash}
    `;
    const distServer = `go build -ldflags "${flags}"`;
    console.log(distServer);
    exec(distServer, function(err, stdout, stderr) {
      if (!err) {
        console.log('Docktor backend Build successfull');
        return gulp.src(distPath.binary)
                .pipe(gulp.dest(distPath.dist));
      } else {
        console.log(err);
      }
    });
  });
});

gulp.task('clean-dist', function() {
  return gulp.src([distPath.dist + '/*', distPath.binary], {
    read: false
  }).pipe(clean());
});

/*===================== TASKS =====================*/

gulp.task('start-dev', ['webpack-dev-server', 'watch-server', 'go-run']);
gulp.task('dist', ['dist-server', 'dist-client']);
gulp.task('archive', ['dist'], function() {
  console.log('Archiving docktor in zip : ' + distPath.zipname);
  return gulp.src([distPath.dist + '/**/*'])
    .pipe(zip(distPath.zipname))
    .pipe(gulp.dest('dist'));
});
gulp.task('default', ['start-dev']);