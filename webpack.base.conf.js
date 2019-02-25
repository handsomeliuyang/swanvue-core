// const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const root = pathRelativeToRoot => path.resolve(__dirname, '..', pathRelativeToRoot);
module.exports = {
    entry: {
        master: __dirname + '/src/master/index.js',
        slaves: __dirname + '/src/slave/index.js'
    },
    output: {
        path: __dirname + '/dist/box/',
        filename: '[name]/index.js',
        libraryTarget: "umd"
    },
    devtool: 'source-map',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true
        }),
        // new webpack.optimize.UglifyJsPlugin({
        //     // sourceMap: true,
        //     compress: {
        //         warnings: false,
        //         /* eslint-disable fecs-camelcase */
        //         drop_console: false
        //         /* eslint-disable fecs-camelcase */
        //     },
        //     // sourceMap: true,
        //     comments: false
        // }),
        
        // new CopyWebpackPlugin([{
        //     from: __dirname + '/src/templates/**/*',
        //     to: __dirname + '/dist/box/[1]/[name].[ext]',
        //     test: /([^/]+)\/([^/]+)\.[^.]+$/
        // }])
    ]
};
