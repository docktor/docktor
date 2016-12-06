var webpack = require('webpack'),
  path = require('path'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var nodeModules = path.resolve(__dirname, 'node_modules'),
  bowerComponents = path.resolve(__dirname, 'bower_components'),
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
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      },
      exclude: [nodeModules, bowerComponents]
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!sass')
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('css')
    }, {
      test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
      loader: 'file-loader?name=../fonts/[name].[ext]'
    }, {
      test: /\.png?$|\.jpe?g$|\.ico$/,
      loader: 'file-loader?name=../images/[name].[ext]'
    }]
  },
  resolve: {
      alias: {
        jquery: bowerComponents + '/jquery/dist/jquery.js'
      },
      modulesDirectories: ['node_modules', 'bower_components']
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new ExtractTextPlugin('../css/style.css', {
      allChunks: true
    }),
    new OptimizeCssAssetsWebpackPlugin()
  ]
};


module.exports = prodConfig;