var webpack = require('webpack'),
  path = require('path');

var nodeModules = path.resolve(__dirname, 'node_modules'),
  build = path.resolve(__dirname, './client/dist/js'),
  src = path.resolve(__dirname, './client/src/main.js');

var devConfig = {
  devtool: 'source-map',
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8081',
    src
  ],
  output: {
    path: build,
    filename: 'bundle.js',
    publicPath: '/js/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      },
      exclude: [nodeModules]
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass']
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
      loader: 'file-loader?name=../fonts/[name].[ext]'
    }, {
      test: /\.png?$|\.jpe?g$|\.ico$/,
      loader: 'file-loader?name=../images/[name].[ext]'
    }]
  },
  preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map' },
  ],
  resolve: {
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports = devConfig;
