const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// 读取所有的Pages配置，每个Page生成一个单独的bundle文件
var entry = {
  main: './vuesrc/main.js'
}
var fs = require('fs');
var wxConfig = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
for(var i=0; i<wxConfig.pages.length; i++){
  entry[wxConfig.pages[i]] = './' + wxConfig.pages[i];
}

module.exports = {
  mode: 'development',
  entry: entry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  // devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000,
    disableHostCheck: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      // {
      //   test: /\.(png|svg|jpg|gif)$/,
      //   use: 'file-loader',
      // },
      {
        test: /\.vue$/,
        use: ['vue-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title:'exdemo'
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {from: 'image/**/*', force: true}
    ])
  ]
};
