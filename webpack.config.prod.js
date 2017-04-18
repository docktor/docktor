var path = require('path'),
  webpack = require('webpack'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var nodeModules = path.resolve(__dirname, 'node_modules'),
  build = path.resolve(__dirname, './client/dist/js'),
  src = path.resolve(__dirname, './client/src/main.js');

var prodConfig = {
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
      loader: ExtractTextPlugin.extract('css-loader?sourceMap!sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true')
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('css-loader?sourceMap')
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
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('../css/style.css', {
      allChunks: true
    }),
    new OptimizeCssAssetsWebpackPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]) //https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
  ]
};


module.exports = prodConfig;
