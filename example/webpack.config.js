const path = require('path');

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const args = require('node-args');
const DevServer = require('webpack-dev-server');

const isAnalyzer = args.analyzer;

const TARGET = `${__dirname}/dist`;

const ROOT_PATH = require('path').resolve(__dirname);

const mode = args.mode;
const port = 9700;

const alias = require('./webpack.alias.js');

module.exports = function (env, args = {}) {
    let config = {
        mode,
        entry: {},
        stats: isAnalyzer ? 'normal' : 'errors-warnings',
        output: {
            path: TARGET,
            filename: '[name].[contenthash:8].js',
            clean: true,
        },
        resolve: {
            alias,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'babel-loader',
                    },
                    exclude: /\/node_modules\//,
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: false,
                                lessOptions: {
                                    math: 'strict',
                                    plugins: [
                                        new LessPluginAutoPrefix({
                                            browsers: ['ie >= 11', 'last 2 versions'],
                                        }),
                                    ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(svg?)(\?[a-z0-9]+)?$/,
                    type: 'asset/inline',
                },
                {
                    test: /\.woff$/,
                    type: 'asset/inline',
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
                chunkFilename: '[name].[contenthash:8].css', // use contenthash *
            }),
            new NodePolyfillPlugin(),
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
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            format: {
                                comments: false,
                            },
                        },
                        extractComments: false,
                    }),
                    new CssMinimizerPlugin(),
                ],
            });
            break;

        case 'development':
            const localIPv4 = DevServer.internalIPSync('v4');
            config = merge(config, {
                devServer: {
                    host: '0.0.0.0',
                    port: port,
                    open: `http://${localIPv4}:${port}/app`,
                    hot: true,
                    compress: false,
                    proxy: {
                        '/app': { target: `http://localhost:${port}`, pathRewrite: { '^/app': '/index.html' } },
                        '/api/*': { target: `http://localhost:${port + 1}` },
                    },
                    historyApiFallback: true,
                },
                devtool: 'source-map',
            });
            break;
    }

    return config;
};
