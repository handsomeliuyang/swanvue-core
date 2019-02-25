import Slave from "../../../dist/box/slaves";
import EventsEmitter from './utils/events-emitter';
import Loader from './utils/loader';
import swanEvents from "../../../src/utils/swan-events";
import Page from './component/page';
import View from './component/view/index';

const noop = function () {};

export default class Native {
	constructor(context){
		// this.eventsEmitter = new EventsEmitter();
		this.mockSwanInterface(context);
		this.mockSwanComponents(context);
		this.mockTestutils(context);
		// this.mockSlave(context);

		var obj = {
			fun: function (message) {
				console.log(message);
			}
		};

		obj.fun('你好，测试');

	}

	/**
	 *
	 * @param url 小程序的下载地址，这里为了测试，仅仅是其目录的地址
	 */
	openWeChatApp(url){
		this.loader = new Loader(url);

		// 加载app.json
		this.loader.loadJson('app')
			.then((text) => {
				console.log(`${url}/app.json loader success`, text);

				this.appInfo = JSON.parse(text);

				// 发送'appReady'事件
				window.testutils.clientActions.appReady(url, '1', this.appInfo.pages[0], JSON.stringify(this.appInfo));
			})
			.catch(console.error);
	}

	mockSwanInterface(context) {
		context.swanInterface = {
			swan:{
				request: noop
			},
			communicator: new EventsEmitter(),
			boxjs:{
				data:{
					get:function(){
						return {
							appid:123
						}
					}
				},
				log:noop,
				platform: {
					versionCompare: noop,
					boxVersion: noop
				}
			},

			bind:function(type, cb) {
				this.communicator.onMessage(type, cb);
				// document.addEventListener(type, cb, false);
				return this;
			},
			unbind:function(type, cb) {
				this.communicator.delHandler(type, cb);
				// document.removeEventListener(type, cb, false);
				return this;
			},
			invoke: function (type, ...args) {
				return this[type] && this[type](...args);
				// return new Promise.resolve().then(function (res) {
				//     return this[type] && this[type](...args);
				// });
			},
			navigateTo: function (params) {
				console.log('navigateTo: ', params);
				return new Promise(function (resolve, reject) {
					const wvID = window.testutils.clientActions
						.createSlave(params.slaveActionMap, params.template, params.slaveHookJs);
					resolve({wvID});
					params.success && params.success({wvID});
				});
			},
			loadJs: function (params) {
				console.log('mock loadJs: ', params);
				this.bind('slaveLoaded', function (e) {
					console.log('mock listener slaveLoaded', e);
					if (+e.slaveId === +params.eventObj.wvID) {
						params.success(e);
					}
				});
			},
			postMessage: function (slaveId, message) {
				console.log('Page postMessage', slaveId, message);
				// if (slaveId === 'master') {
					window.testutils.clientActions.sendMasterMessage(message);
				// }
				// else {
					// document.getElementById(slaveId).contentWindow.postMessage(JSON.stringify(message), '*');
					// return '123';
				// }
			},
			onMessage: function (callback) {
				console.log('swanInterface onMessage', this);
				this.bind('message', e => {
					console.log('swanInterface onMessage bind message', e);

					if (e.message) {
						let message = null;
						try {
							if (typeof e.message === 'object') {
								message = e.message;
							}
							else {
								message = JSON.parse(unescape(decodeURIComponent(e.message)));
							}
						} catch (event) {
							console.log(event);
						}
						callback && callback(message);
					}
				});
				return this;
			}
		};
	}

	mockSwanComponents(context) {
		context.swanComponents = {
			getContextOperators:noop,
			getComponentRecievers:noop,
			getComponents: function () {
				return {
					'super-page': Page,
					'view': View
				};
			},
			getBehaviorDecorators: function () {
				return function (behaviors, target) {
					return target;
				};
			}
		};
	}

	mockTestutils(context) {
		context.testutils = {
			clientActions: {
				dispatchEvent: function (type, params) {
					var event = {type: type};
					for (var i in params) {
						event[i] = params[i];
					}
					window.swanInterface.communicator.fireMessage(event);
				},
				dispatchMessage: function (message) {
					var event = {type: 'message'};
					event.message = message;
					// var event = new Event('message');
					// event.message = message;
					// document.dispatchEvent(event);
					console.log('clientActions dispatchEvent', event);
					window.swanInterface.communicator.fireMessage(event);
				},
				appReady: function (appPath, slaveId, pageUrl, appConfig) {
					console.log('mock appReady: ', slaveId, pageUrl);
					this.dispatchEvent('AppReady', {
						pageUrl: pageUrl,
						wvID: slaveId,
						appPath: appPath,
						appConfig: appConfig
					});
					// this.appShow();
				},

				appShow: function () {
					this.dispatchEvent('lifecycle', {
						lcType: 'onAppShow'
					});
				},
				appHide: function () {
					this.dispatchEvent('lifecycle', {
						lcType: 'onAppHide'
					});
				},
				wvID: 2,
				createSlave: function (slaveActionMap, template, slaveHookJs) {
					console.log('mock createSlave: ', slaveActionMap, template, slaveHookJs);
					const wvID = this.wvID++;
					for (let actionKey in slaveActionMap) {
						this.bind(actionKey, function (e) {
							if (+e.slaveId === +wvID) {
								slaveActionMap[actionKey](e);
							}
						});
					}

					// 延迟创建
					setTimeout(function () {
						window.slaveId = wvID;
						const slave = new Slave(window, window.swanInterface, window.swanComponents);
						console.log('mock salve=', slave, window.afterSlaveFrameWork);

						window.afterSlaveFrameWork && window.afterSlaveFrameWork();
						global.pageRender && global.pageRender(template, [], []);
						window.testutils.clientActions.bind('initData', function (e) {
							window.testutils.clientActions.dispatchMessage(e);
							setTimeout(function () {
								window.afterSlave && window.afterSlave();
							}, 1);
						});
					}, 1000);

					return wvID;
				},
				bind: function (type, cb) {
					console.log('TODO need add code');
					window.swanInterface.communicator.onMessage('message', function (e) {
						var messageObj = e.message;
						if (typeof messageObj === 'string') {
							try {
								messageObj = JSON.parse(messageObj);
							}
							catch (e) {
								messageObj = e.message;
							}
						}
						console.log('bind ...', e);
						if (messageObj && messageObj.type && messageObj.type === type) {
							cb(messageObj);
						}
					});
				},
				sendMasterMessage: function (message) {
					message.slaveId = window.slaveId;
					// window.parent.postMessage(JSON.stringify(message), '*');
					window.testutils.clientActions.dispatchMessage(message);
				},
			}
		};

		// TODO-ly 刘阳添加的模拟代码
		context.swanInterface.bind('AppReady', (event)=>{
			console.log('listener AppReady ', event);

			context.swanInterface.communicator.onMessage(`slaveLoaded${event.wvID}`, (e)=>{
				const slave = new Slave(window, window.swanInterface, window.swanComponents);
				window.slaveId = event.wvID;
				context.testutils.clientActions.dispatchEvent('PageReady', {
					initData: '',
					appPath: event.appPath,
					pagePath: event.pageUrl
				});
			});
		});

		// TODO-ly 刘阳添加的模拟代码
		context.testutils.clientActions.bind('slaveAttached', event => {
			console.log('native listen slaveAttached send onShow event', event);
			context.testutils.clientActions.appShow();
			context.testutils.clientActions.dispatchEvent('lifecycle', {
				lcType: 'onShow',
				wvID: event.slaveId
			});
		}, {once: true});
	}
}