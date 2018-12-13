const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'docs'),
        publicPath: '/',
    },
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        // exclude: /node_modules/,

                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        },
                    },
                ],

            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        // hot: true,
        // host: '0.0.0.0',
        // port: 8081,
        // publicPath: '/web/',
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),

        new CopyWebpackPlugin([{from: './src/assets', to: 'assets'}]),

        new HtmlWebpackPlugin({
            title: '',
            template: './index.html',
        }),
        // new webpack.HotModuleReplacementPlugin(),
    ],
};