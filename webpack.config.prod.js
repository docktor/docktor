var path = require('path'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var nodeModules = path.resolve(__dirname, 'node_modules'),
  build = path.resolve(__dirname, './client/dist/js'),
  src = path.resolve(__dirname, './client/src/main.js');

var prodConfig = {

  devtool: 'source-map',
  entry: src,
  output: {
    path: build,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: [nodeModules]
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!sass')
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('css')
    }, {
      test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
      loader: 'file',
      query: {
        name: '../fonts/[name].[ext]'
      }
    }, {
      test: /\.png?$|\.jpe?g$|\.ico$/,
      loader: 'file',
      query: {
        name: '../images/[name].[ext]'
      }
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new ExtractTextPlugin('../css/style.css', {
      allChunks: true
    }),
    new OptimizeCssAssetsWebpackPlugin()
  ]
};


module.exports = prodConfig;
