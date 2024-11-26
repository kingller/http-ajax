const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./webpack.config.js');

module.exports = function (env, args = {}) {
    return config(env, args).then((webpackConfig) => {
        webpackConfig.resolve.alias = merge(webpackConfig.resolve.alias, {
            'http-ajax/dist': path.resolve(__dirname, '../lib'),
            'http-ajax': path.resolve(__dirname, '../lib/index.ts'),
        });

        webpackConfig.module.rules[0] = {
            test: /\.tsx?$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [['@babel/preset-typescript', { tsconfig: path.resolve(__dirname, 'tsconfig.dev.json') }]],
                },
            },
            exclude: /\/node_modules\//,
        };
        return Promise.resolve(webpackConfig);
    });
};
