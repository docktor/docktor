var gulp            = require('gulp'),
  util              = require('gulp-util'),
  notifier          = require('node-notifier'),
  sync              = require('gulp-sync')(gulp).sync,
  runSequence       = require('run-sequence'),
  del               = require('del'),
  child             = require('child_process'),
  os                = require('os'),
  inject            = require('gulp-inject-string'),
  webpack           = require('webpack'),
  zip               = require('gulp-zip'),
  docktor           = require('./package.json'),
  git               = require('git-rev'),
  dateFormat        = require('dateformat'),
  WebpackDevServer  = require('webpack-dev-server');

var server = null;

var devConfigWebpack = require('./webpack.config.dev.js'),
  prodConfigWebpack = require('./webpack.config.prod.js');

var watchFiles = {
  server: ['./main.go', './server/**/*.go', 'cmd/**/*.go', 'model/**/*.go']
};

var dependenciesPath = {
  templates: [
    './client/src/index.tmpl'
  ],
  fonts: [
    './node_modules/semantic-ui-css/themes/default/assets/fonts/*'
  ],
  images: [
    './client/src/components/app/images/*',
    './client/src/components/users/user/images/*',
    './node_modules/semantic-ui-css/themes/default/assets/images/*',
    './node_modules/leaflet/dist/images/*'
  ]
};

var injectedPath = {
  dev: 'http://localhost:8081/js/bundle.js',
  prod: '/js/bundle.js'
};

var distPath = {
  binary: './docktor',
  client: './client/dist',
  dist: './dist',
  zipname: `docktor-${docktor.version}.zip`
};

const now = () => {
  return dateFormat(new Date(), 'isoDateTime');
};


gulp.task('clean', function() {
  return del([distPath.dist, distPath.client, distPath.binary]);
});

/*====== Client ======*/
gulp.task('client:webpackDevServer', function() {
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
gulp.task('server:build', function() {
  const flags = `-X github.com/soprasteria/docktor/cmd.Version=${docktor.version}`;
  const build = child.spawnSync('go', ['install', '-ldflags', `${flags}`]);
  if (build.stderr.length) {
    util.log(util.colors.red('Something wrong with this version :'));
    const lines = build.stderr.toString();
    util.log(util.colors.red(lines));
    notifier.notify({
      title: 'Error (go install)',
      message: lines
    });
  }
  return build;
});

gulp.task('server:spawn', function() {
  // Arrêt du serveur
  if (server && server !== 'null') {
    server.kill();
  }
  if (os.platform() == 'win32') {
    var path_folder = __dirname.split('\\');
  } else {
    var path_folder = __dirname.split('/');
  }
  var length = path_folder.length;
  var app    = path_folder[length - parseInt(1)];
  if (os.platform() == 'win32') {
    server = child.spawn(app + '.exe', ['serve', '-e', 'dev', '-l', 'debug'], { stdio: 'inherit' });
  } else {
    server = child.spawn(app, ['serve', '-e', 'dev', '-l', 'debug'], { stdio: 'inherit' });
  }
});

gulp.task('server:watch', function() {
  return gulp.watch(watchFiles.server, sync([
    'server:html',
    'server:build',
    'server:spawn'
  ], 'server'));
});

gulp.task('server:html', function() {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.dev)).pipe(gulp.dest(distPath.client));
});

/*====== Dist ======*/
gulp.task('dist:html', function() {
  return gulp.src(dependenciesPath.templates).pipe(inject.replace('REACT_APP', injectedPath.prod)).pipe(gulp.dest(distPath.client));
});

gulp.task('dist:fonts', function() {
  return gulp.src(dependenciesPath.fonts).pipe(gulp.dest(distPath.client + '/fonts/'));
});

gulp.task('dist:images', function() {
  return gulp.src(dependenciesPath.images).pipe(gulp.dest(distPath.client + '/images/'));
});

gulp.task('dist:webpack', function(callback) {
  webpack(prodConfigWebpack, function(err) {
    if(err) {throw new gutil.PluginError('webpack', err);}
    callback();
  });
});

gulp.task('dist:copy', function() {
  return gulp.src(distPath.client + '/**/*').pipe(gulp.dest(distPath.dist + '/client/dist'));
});

gulp.task('dist:client', function(callback) {
  runSequence('dist:html', 'dist:fonts', 'dist:images', 'dist:webpack', 'dist:copy', callback);
});

gulp.task('dist:server', function(callback) {
  return git.long(function (gitHash) {
    const flags = `
      -X github.com/soprasteria/docktor/cmd.Version=${docktor.version}
      -X github.com/soprasteria/docktor/cmd.BuildDate=${now()}
      -X github.com/soprasteria/docktor/cmd.GitHash=${gitHash}
    `;
    const build = child.spawnSync('go', ['build', '-ldflags', `${flags}`]);
    if (build.stderr.length) {
      util.log(util.colors.red('Something wrong with this version :'));
      const lines = build.stderr.toString();
      util.log(util.colors.red(lines));
      notifier.notify({
        title: 'Error (go install)',
        message: lines
      });
    } else {
      gulp.src(distPath.binary)
        .pipe(gulp.dest(distPath.dist));
      callback();
    }
  });
});


/*====== Server =========*/



/*===================== TASKS =====================*/

gulp.task('dev', function(callback) {
  runSequence('clean', 'dist:fonts', 'dist:images', 'client:webpackDevServer', 'server:html', 'server:build', 'server:watch', 'server:spawn', callback);
});

gulp.task('dist', function(callback) {
  runSequence('clean', 'dist:client', 'dist:server', callback);
});

gulp.task('archive', ['dist'], function() {
  console.log('Archiving docktor in zip : ' + distPath.zipname);
  return gulp.src([distPath.dist + '/**/*'])
    .pipe(zip(distPath.zipname))
    .pipe(gulp.dest(distPath.dist));
});
gulp.task('default', ['dev']);
