
/**
 * @file Page 类，在 Slave 中运行
 * @author houyu(houyu01@baidu.com)
 */
// import styles from './public/page.css';
// import {getSelectData} from './utils/dom/swanXml/parseDataUtil';
// import {eventProccesser, getValueSafety, EnviromentEvent} from './utils';
// import {accumulateDiff} from './utils/data-diff';
import swanEvents from '../utils/swan-events';
// import {addIntersectionObserver, removeIntersectionObserver} from './utils/dom/swanXml/intersection-listener';
// import {computeObserverIntersection} from './utils/dom/swanXml/intersection-calculator';


// {
// 	dependencies: ['communicator'],
// 		options:{
// 	methods: {
// 		slaveJsLog: noop,
// 	}
// }
// },

export default {

	dependencies: ['swaninterface', 'communicator'],

	options: {
		created: function(){
			this.initMessagebinding();
		},
		methods: {

			/**
			 * 执行用户绑定的事件
			 *
			 * @param {string} eventName 事件名称
			 * @param {Object} $event 事件对象
			 * @param {Function} reflectMethod 用户回调方法
			 * @param {boolean} capture 是否事件捕获
			 * @param {boolean} catchType 是否终止事件执行
			 * @param {Object} customEventParams 用户绑定的事件集合
			 */
			eventHappen: function(eventName, $event, reflectMethod, capture, catchType, customEventParams) {
				swanEvents('slaveEventHappen', {
					eventName: eventName,
				});

				if ($event && catchType === 'catch') {
					$event.stopPropagation && $event.stopPropagation();
					(eventName === 'touchstart' || eventName === 'touchmove')
					&& $event.preventDefault && $event.preventDefault();
				}
				this.$communicator.sendMessage(
					'master',
					{
						type: 'event',
						value: {
							eventType: eventName,
							reflectMethod,
							e: $event, //eventProccesser(eventName, $event)
						},
						slaveId: this.slaveId,
						customEventParams
					}
				);
			},
			/**
			 * 初始化事件绑定
			 * @private
			 */
			initMessagebinding: function() {
				this.$communicator.onMessage(
					['setData', 'pushData', 'popData', 'unshiftData', 'shiftData', 'removeAtData', 'spliceData'],
					params => {
						swanEvents('slaveDataEvent', params);
						const setObject = params.setObject || {};
						const operationType = params.type.replace('Data', '');
						if (operationType === 'set') {
							// TODO-ly 此处可以优化，使用Vue效率最高的方案
							for(var key in setObject){
								this[key] = setObject[key];
							}
							// let setDataDiff = accumulateDiff(this.data.get(), setObject);
							// setDataDiff && setDataDiff.reverse().forEach(ele => {
							// 	const {kind, rhs, path, item, index} = ele;
							// 	let dataPath = path.reduce((prev, cur) => `${prev}['${cur}']`);
							// 	// 将用户setData操作数组的时候，分解成san推荐的数组操作，上面reverse也是为了对数组进行增删改的时候顺序不乱
							// 	if (kind === 'A') {
							// 		if (item.kind === 'N') {
							// 			this.data.push(dataPath, item.rhs);
							// 		}
							// 		else if (item.kind === 'D') {
							// 			this.data.splice(dataPath, [index]);
							// 		}
							// 	}
							// 	else {
							// 		this.data.set(dataPath, rhs);
							// 	}
							// });
						}
						// else {
						// 	for (let path in setObject) {
						// 		this.data[operationType](path, setObject[path]);
						// 	}
						// }
						// this.nextTick(() => {
						// 	this.sendAbilityMessage('nextTickReach');
						// 	swanEvents('pageDataUpdate', {
						// 		slaveId: this.slaveId,
						// 		timestamp: params.pageUpdateStart
						// 	});
						// });
					}
				);

				// this.communicator.onMessage('querySlaveSelector', params => {
				// 	const {selector, queryType, index, operation, fields, execId, contextId} = params.value;
				// 	const data = getSelectData({selector, queryType, operation, fields, contextId});
				//
				// 	this.communicator.sendMessage(
				// 		'master',
				// 		{
				// 			type: 'getSlaveSelector',
				// 			value: JSON.stringify({
				// 				data,
				// 				index,
				// 				execId
				// 			}),
				// 			slaveId: this.slaveId
				// 		}
				// 	);
				// });

				// this.onRequestComponentObserver();

				// 客户端向slave派发事件
				// this.communicator.onMessage('abilityMessage', e => {
				// 	this.communicator.fireMessage({
				// 		type: `${e.value.type}_${e.value.params.id}`,
				// 		params: e.value.params
				// 	});
				// });

				// 客户端向slave派发双击标题栏事件
				// this.communicator.onMessage('scrollViewBackToTop', e => {
				// 	this.communicator.fireMessage({
				// 		type: 'scrollView-backTotop'
				// 	});
				// });

				// this.swaninterface.bind('PullDownRefresh', e => {
				// 	// 参数 e 中包含 element 信息，导致部分 Android 机型使用系统内核时消息传递失败，因此只传 e.type
				// 	this.sendAbilityMessage('pullDownRefresh', {
				// 		type: e.type
				// 	});
				// });
			},
		}
	},

	constructor(options = {}) {
		// this.boxjs = this.swaninterface.boxjs;
		// this.swan = this.swaninterface.swan;
		// const slaveIdObj = this.boxjs.data.get({
		// 	name: 'swan-slaveIdSync'
		// });
		// if (!slaveIdObj) {
		// 	throw new Error('Can not get slave id from baiduapp.');
		// }
		// this.slaveId = slaveIdObj.slaveId;
		// this.masterNoticeComponents = [];
		// this.browserPatch();
		// this.initMessagebinding();
	},
	/*
	 * 默认的初始化数据
	 */
	initData() {
		return {};
	},

	// slavePageRendered() {
	// 	if (this.masterNoticeComponents.length > 0) {
	// 		this.sendAbilityMessage('onPageRender', {
	// 			customComponents: this.masterNoticeComponents
	// 		});
	// 		this.masterNoticeComponents = [];
	// 	}
	// 	this.communicator.fireMessage({
	// 		type: 'slaveRendered'
	// 	});
	// },

	// slavePageUpdated() {
	// 	this.communicator.fireMessage({
	// 		type: 'slaveUpdated'
	// 	});
	// },

	// updated() {
	// 	this.slavePageUpdated();
	// 	this.slavePageRendered();
	// },

	// andrSendFP(fp, errorType = 'fe_first_paint_error') {
	// 	if (fp > 0) {
	// 		swanEvents('slaveFeFirstPaint', {
	// 			eventId: 'fe_first_paint',
	// 			errorType: errorType,
	// 			timeStamp: fp
	// 		});
	// 	} else {
	// 		swanEvents('slaveFeFirstPaint', {
	// 			eventId: 'nreach',
	// 			errorType: errorType,
	// 			timeStamp: Date.now()
	// 		});
	// 	}
	// },
	// getFPTiming(timeGap) {
	// 	let paintMetrics = performance.getEntriesByType('paint');
	// 	if (paintMetrics !== undefined && paintMetrics.length > 0) {
	// 		let fcp = paintMetrics.filter(entry => entry.name === 'first-contentful-paint');
	// 		if (fcp.length >= 1) {
	// 			let fpTimeStamp = parseInt(timeGap + fcp[0].startTime, 10);
	// 			this.andrSendFP(fpTimeStamp, 'paint_entry_get');
	// 		} else {
	// 			this.andrSendFP(-1, 'get_performance_paint_entry_empty');
	// 		}
	// 	} else {
	// 		this.andrSendFP(-1, 'get_performance_paint_entry_error');
	// 	}
	// },
	// attached() {
	//
	// 	swanEvents('slaveActiveRenderEnd', {
	// 		slaveId: this.slaveId
	// 	});
	//
	// 	if (this.swaninterface.boxjs.platform.isAndroid()) {
	//
	// 		if ('performance' in global) {
	// 			// 如果能获取到timeOrigin，则使用timeOrigin，否则使用Date.now 和performance.now 之间的差值
	// 			let timeGap = global.performance.timeOrigin || Date.now() - global.performance.now();
	//
	// 			if ('PerformanceObserver' in global) {
	// 				// 如果有PerformanceObserver对象，则使用PerformanceOvbserver来监听
	// 				let observerPromise = new Promise((resolve, reject) => {
	// 					let observer = new global.PerformanceObserver(list => {
	// 						resolve(list);
	// 					});
	// 					observer.observe({
	// 						entryTypes: ['paint']
	// 					});
	// 				}).then(list => {
	// 					// 获取和首屏渲染相关的所有点，first-contentful-paint
	// 					let fcp = list.getEntries().filter(entry => entry.name === 'first-contentful-paint');
	// 					if (fcp.length >= 1) {
	// 						// 如果有first-paint点，取first-contentful-paint
	// 						let fpTimeStamp = parseInt(timeGap + fcp[0].startTime, 10);
	// 						this.andrSendFP(fpTimeStamp, 'observer_get_fp');
	// 					} else {
	// 						// 如果从Observer取不到任何有意义的first render点，从performance.getEntries('paint')获取前端渲染点
	// 						this.getFPTiming(timeGap);
	// 					}
	// 				}).catch(error => {
	// 					// 如果从resolve发生错误，从performance.getEntries('paint')获取前端渲染点
	// 					this.getFPTiming(timeGap);
	// 				});
	// 			} else {
	// 				// 如果没有PerformanceObserver对象，延迟去2900ms从performance.getEntries('paint')获取前端渲染点
	// 				setTimeout(() => {
	// 					this.getFPTiming(timeGap);
	// 				}, 2900);
	// 			}
	// 		} else {
	// 			// 如果没有performance api，则表明前端取不到first render点，直接发送670性能点
	// 			this.andrSendFP(-1, 'fe_no_performance_api');
	// 		}
	// 	}
	//
	// 	this.slavePageRendered();
	// 	this.sendAbilityMessage('rendered', this.masterNoticeComponents);
	// 	this.sendAbilityMessage('nextTickReach');
	// },

	// messages: {
	// 	'video:syncCurrentTime'({value: {target, id}}) {
	// 		this.videoMap = this.videoMap || {};
	// 		this.videoMap[id] = target;
	// 		this.sendAbilityMessage('videoSyncMap', id);
	// 	},
	//
	// 	abilityMessage({value: {eventType, eventParams}}) {
	// 		this.sendAbilityMessage(eventType, eventParams);
	// 	},
	//
	// 	addMasterNoticeComponents({value: componentInfo}) {
	// 		this.masterNoticeComponents.push(componentInfo);
	// 	},
	//
	// 	customComponentInnerUpdated() {
	// 		this.updated();
	// 	}
	// },

	/**
	 * 发送abilityMessage
	 *
	 * @private
	 * @param  {string} eventType 事件名称
	 * @param  {Object} eventParams 事件参数
	 */
	// sendAbilityMessage(eventType, eventParams = {}) {
	// 	this.communicator.sendMessage(
	// 		'master',
	// 		{
	// 			type: 'abilityMessage',
	// 			value: {
	// 				type: eventType,
	// 				params: eventParams
	// 			},
	// 			slaveId: this.slaveId
	// 		}
	// 	);
	// },



	/**
	 * slave加载完通知master开始加载slave的js
	 *
	 * @private
	 */
	// slaveLoaded() {
	// 	this.communicator.sendMessage(
	// 		'master',
	// 		{
	// 			type: 'slaveLoaded',
	// 			value: {
	// 				status: 'loaded'
	// 			},
	// 			slaveId: this.slaveId
	// 		}
	// 	);
	// },

	/**
	 * slave加载完通知master开始加载slave的js
	 *
	 * @private
	 */
	// slaveJsLog() {
	// },
	// TODO 兼容onReachBottom上拉触底触发两次的bug
	// enviromentBinded: false,
	/**
	 *
	 * 设置 page 的初始化数据
	 *
	 * @param {Object} Data  需要初始化的数据
	 * @param {string} Data.value   data 初始值，会通过 this.data.set 设置到当前 Page 对象
	 * @param {string} Data.appConfig app.json中的内容
	 */
	// setInitData(params) {
	// 	// 如果fireMessage比onMessage先，在onMessage时会把消息队列里的整个数组丢过来
	// 	// 现在首屏，会执行两次initData的fireMessage，顺序为fire => on => fire
	// 	params = Object.prototype.toString.call(params) === '[object Array]' ? params[0] : params;
	// 	let {value, appConfig} = params;
	// 	for (let k in value) {
	// 		this.data.set(k, value[k]);
	// 	}
	// 	if (!this.enviromentBinded) {
	// 		this.enviromentBinded = true;
	// 		this.initPageEnviromentEvent(appConfig);
	// 	}
	// },



	/**
	 * 监听 requestComponentObserver 事件
	 *
	 * @return {undefined}
	 */
	// onRequestComponentObserver() {
	// 	let self = this;
	// 	let observerMap = {};
	//
	// 	window.addEventListener('scroll', () => {
	// 		requestAnimationFrame(function () {
	// 			for (let observerId in observerMap) {
	// 				computeObserverIntersection(observerMap[observerId]);
	// 			}
	// 		});
	// 	}, {
	// 		capture: true,
	// 		passive: true
	// 	});
	//
	// 	this.communicator.onMessage('requestComponentObserver', params => {
	// 		switch (params.operationType) {
	// 			case 'add':
	// 				addIntersectionObserver(params, self.communicator, observerMap);
	// 				break;
	// 			case 'remove':
	// 				removeIntersectionObserver(params, self.communicator, observerMap);
	// 				break;
	// 		}
	// 	});
	// },

	/**
	 *
	 * 初始化页面绑定在宿主环境的相关的事件
	 *
	 * @private
	 * @param {Object} appConfig app.json 配制文件中的内容
	 */
	// initPageEnviromentEvent(appConfig) {
	// 	const DEFAULT_BOTTOM_DISTANCE = 50;
	// 	const onReachBottomDistance = global.pageInfo.onReachBottomDistance
	// 		|| getValueSafety(appConfig, 'window.onReachBottomDistance')
	// 		|| DEFAULT_BOTTOM_DISTANCE;
	// 	const enviromentEvent = new EnviromentEvent();
	// 	enviromentEvent
	// 		.enviromentListen('reachBottom', e => this.sendAbilityMessage('reachBottom'), {onReachBottomDistance})
	// 		.enviromentListen('scroll', e => this.sendAbilityMessage('onPageScroll', e));
	// },
	// stabilityLog() {
	// },
	// browserPatch() {
	// 	// 适配iPhonX样式
	// 	// iOS端bug，在预加载中调用getSystemInfoSync会抛出错误，故后移至此，待修复后挪走
	// 	const systemInfo = this.swaninterface.swan.getSystemInfoSync();
	// 	if (systemInfo.model && (systemInfo.model.indexOf('iPhone X') > -1)
	// 		|| (systemInfo.model === 'iPhone Simulator <x86-64>'
	// 			&& systemInfo.screenHeight === 812
	// 			&& systemInfo.screenWidth === 375)) {
	// 		const platform = this.swaninterface.boxjs.platform
	// 		if (platform.isBox() && platform.boxVersion()
	// 			&& platform.versionCompare(platform.boxVersion(), '10.13.0') < 0) {
	// 			return;
	// 		}
	// 		const styleEl = document.createElement('style');
	// 		document.head.appendChild(styleEl);
	// 		const styleSheet = styleEl.sheet;
	// 		styleSheet.insertRule('.swan-security-padding-bottom {padding-bottom: 34px}');
	// 		styleSheet.insertRule('.swan-security-margin-bottom {margin-bottom: 34px}');
	// 		styleSheet.insertRule('.swan-security-fixed-bottom {bottom: 34px}');
	// 	}
	// }
};