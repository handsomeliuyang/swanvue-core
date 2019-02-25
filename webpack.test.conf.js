const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf.js');

module.exports = merge(
	baseWebpackConfig,
	{
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
			}
		},
		module: {
			loaders: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['env'],
					plugins: [
						'transform-class-properties', ['transform-object-rest-spread', {'useBuiltIns': true}],
						'transform-decorators-legacy',
						'transform-object-assign',
						['istanbul', {
							'exclude': [
								'src/utils/**/*.js',
								'test/spec/*.js',
								'src/master/custom-component/index.js'
							]
						}]
					]
				}
			}
			]
		}
	}
);
