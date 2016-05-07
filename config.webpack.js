var webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var nodeModules = path.resolve(__dirname, 'node_modules'),
    build = path.resolve(__dirname, './client/dist/js'),
    src = path.resolve(__dirname, './client/src/main.js');

var devConfig = {
    devtool: 'eval',
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
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                },
                exclude: nodeModules
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css']
            },
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                loader: 'file-loader?name=../fonts/[name].[ext]'
            },
            {
                test: /\.png?$|\.jpe?g$|\.ico$/,
                loader: 'file-loader?name=../images/[name].[ext]'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};

var prodConfig = {

    devtool: 'source-map',
    entry: src,
    output: {
        path: build,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015']
                },
                exclude: nodeModules
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass')
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css')
            },
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                loader: 'file-loader?name=../fonts/[name].[ext]'
            },
            {
                test: /\.png?$|\.jpe?g$|\.ico$/,
                loader: 'file-loader?name=../images/[name].[ext]'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('../css/style.css', {
            allChunks: true
        }),
        new OptimizeCssAssetsWebpackPlugin()
    ]
};

module.exports.dev = devConfig;
module.exports.prod = prodConfig;