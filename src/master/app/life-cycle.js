import {processParam} from '../../utils/index';

const lifeCyclePrototype = {

	/**
	 * 生命周期的函数中接收到的参数处理函数
	 *
	 * @param {Object} [data] - 待处理的数据
	 * @return {Object} 处理后的数据
	 */
	_lifeCycleParamsHandle(data) {
		const appInfo = data && data.appInfo || {};

		//  取出 appInfo 中的 path, query, scene, shareTicket
		let result = ['path', 'query', 'scene', 'shareTicket']
			.reduce((prev, cur) => {
				prev[cur] = appInfo[cur] || '';
				return prev;
			}, {});

		// 如果是从小程序跳转来的，则增加引用信息 referrerInfo
		appInfo.srcAppId && (result.referrerInfo = appInfo.referrerInfo);

		return result;
	},

	/**
	 * onShow生命周期的参数的处理
	 * @param {Object} data - 待处理的数据
	 * @return {Object} 处理后的传给开发者的参数
	 * @private
	 */
	_onAppShowLifeCycleParamsHandle(data) {
		const result = this._lifeCycleParamsHandle(data);
		const appInfo = data && data.appInfo || {};

		// 对于 onShow，传递entryType 及 appURL信息，以增加场景触发标识参数
		// {string} entryType 值同showBy，有'user'  | 'schema' | 'sys' 标识onShow的调起方式，'user'通过home前后台切换或者锁屏调起，'schema'是通过协议调起，'sys'为默认值(未覆盖到的打开场景)
		// {string=} appURL showBy为schema时存在，为调起协议的完整链接
		if (appInfo.showBy) {
			result.entryType = appInfo.showBy;
			if (appInfo.showBy === 'schema') {
				result.appURL = appInfo.appURL;
			}
		}
		return result;
	},

	/**
	 * 向事件流中发送生命周期消息
	 *
	 * @param {Object} [eventName] - 生命周期事件名称
	 * @param {Object} [e] - 事件对象
	 */
	_sendAppLifeCycleMessage(eventName, e) {
		this._appLifeCycleEventEmitter.fireMessage({
			type: 'ApplifeCycle',
			params: {
				eventName,
				e
			}
		});
	},

	/**
	 * appLaunch生命周期，在app启动时即自执行
	 *
	 * @param {Object} [params] - appLaunch的生命周期函数
	 */
	_onAppLaunch(params) {
		try {
			processParam(params.appInfo);
			this.onLaunch && this.onLaunch(this._lifeCycleParamsHandle(params));
		}
		catch (e) {
			console.error(e);
		}
		this._sendAppLifeCycleMessage('onLaunch', {
			e: params.appInfo
		});
	},

	/**
	 * appShow生命周期，在app启动/前后台切换时触发
	 *
	 * @param {Object} [params] - appShow生命周期参数
	 */
	_onAppShow(params) {
		try {
			processParam(params.appInfo);
			this._sendAppLifeCycleMessage('onPreShow', {e: params.appInfo});
			this.onShow && this.onShow(this._onAppShowLifeCycleParamsHandle(params));
		}
		catch (e) {
			console.error(e);
		}
		this._sendAppLifeCycleMessage('onShow', {
			e: params.appInfo
		});
	},

	/**
	 * appHide生命周期，在app前后台切换时触发
	 *
	 * @param {Object} [params] - appHide生命周期参数
	 */
	_onAppHide(params) {
		try {
			processParam(params.appInfo);
			this.onHide && this.onHide(this._lifeCycleParamsHandle(params));
		}
		catch (e) {
			console.error(e);
		}
		this._sendAppLifeCycleMessage('onHide', {
			e: params.appInfo
		});
	},

	/**
	 * appError生命周期，在app生命周期内，如果发生错误，即触发
	 *
	 * @param {Object} [params] - appError生命周期的参数
	 */
	_onAppError(params) {
		this.onError && this.onError(params.event);
		this._sendAppLifeCycleMessage('onError', {
			e: params.appInfo
		});
	},
};

export const mixinLifeCycle = (appObject, appLifeCycleEventEmitter) => {
	return Object.assign(appObject, lifeCyclePrototype, {
		_appLifeCycleEventEmitter: appLifeCycleEventEmitter
	});
};