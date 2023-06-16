const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const args = require('node-args');

const isAnalyzer = args.analyzer;

const TARGET = `${__dirname}/dist`;

const ROOT_PATH = require('path').resolve(__dirname);

const mode = args.mode;
const port = 9700;

const alias = require('./webpack.alias.js');

let config = {
    mode,
    entry: {},
    stats: isAnalyzer? 'normal': 'errors-warnings',
    output: {
        path: TARGET,
        filename: '[name].[hash:8].js',
    },
    resolve: {
        alias,
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'babel-loader',
                },
                include: [
                    path.join(__dirname, 'src'),
                    path.join(__dirname, 'js'),
                    path.join(__dirname, 'components'),
                    path.join(__dirname, 'node_modules', 'highlight\.js'),
                ],
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            math: 'strict',
                            plugins: [
                                new LessPluginAutoPrefix({
                                    browsers: ['ie >= 10', 'last 1 version'],
                                }),
                            ],
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(svg?)(\?[a-z0-9]+)?$/,
                loader: 'url-loader'
            },
            {
                test: /\.woff$/,
                loader: 'url-loader'
            },
        ],
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: false,
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    chunks: 'initial',
                    priority: -10,
                    reuseExistingChunk: false,
                    test: /node_modules\/(.*)\.js[x]?/,
                },
                styles: {
                    name: 'styles',
                    test: /\.(less|css)$/,
                    minChunks: 1,
                    reuseExistingChunk: true,
                    enforce: true,
                },
            },
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[name].[contenthash:8].css' // use contenthash *
        })
    ],
};

function addEntries() {
    let pages = require('./pages.js');
    pages.forEach(function (page) {
        config.entry[page.name] = [`${ROOT_PATH}/src/${page.name}.tsx`];
        let plugin = new HtmlWebpackPlugin({
            filename: `${page.name}.html`,
            template: `${ROOT_PATH}/template.ejs`,
            favicon: 'images/favicon.ico',
            chunks: ['manifest', 'vendor', page.name],
            name: page.name,
            title: page.title,
        });
        config.plugins.push(plugin);
    });
}
addEntries();

switch (mode) {
    case 'production':
        config = merge(config, {
            optimization: {
                minimizer: [
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: true
                    }),
                    new OptimizeCSSAssetsPlugin({}) // use OptimizeCSSAssetsPlugin
                ]
            },
            plugins: [new CleanWebpackPlugin([TARGET])]
        });
        break;

    case 'development':
        config = merge(config, {
            devServer: {
                host: '0.0.0.0',
                port: port,
                open: true,
                openPage: 'app',
                hot: true,
                disableHostCheck: true,
                useLocalIp: true,
                proxy: {
                    '/app'  : {target: `http://localhost:${port}`, pathRewrite: { '^/app': '/index.html' }},
                    '/api/*': { target: `http://localhost:${port + 1}` },
                }
            },
            devtool: '#source-map'
        });
        break;
}

module.exports = config;
