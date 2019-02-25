import Slave from './slave';
import History from './history';
import splitAppAccessory from '../../utils/splitapp-accessory';
import {pathResolver, parseUrl} from '../../utils';
import swanEvents from '../../utils/swan-events';

export class Navigator {
	constructor(swaninterface, context) {
		this.history = new History();
		this.swaninterface = swaninterface;
		this.context = context;
	}
	setAppConfig(appConfig) {
		// 第一次从客户端获取到appConfig
		this.appConfig = appConfig;
	}

	/**
	 * 初始化第一个slave
	 * @param {Object} [initParams] - 初始化的参数
	 */
	pushInitSlave(initParams) {
		// Route事件监听开启
		// this.listenRoute();

		swanEvents('masterActiveCreateInitslave');

		// 根据appConfig判断时候有appjs拆分逻辑
		// 如果包含splitAppJs字段，且不分包，则为拆分app.js
		// if (this.appConfig.splitAppJs && !this.appConfig.subPackages) {
		// 	splitAppAccessory.allJsLoaded = false;
		// }

		// 创建初始化slave
		this.initSlave = this.createInitSlave(initParams.pageUrl, this.appConfig);

		// slave的init调用
		this.initSlave
			.init(initParams)
			.then(initRes => {
				swanEvents('masterActiveCreateInitslaveEnd');
				// 入栈
				this.history.pushHistory(this.initSlave);
				swanEvents('masterActivePushInitslaveEnd');
				// 调用slave的onEnqueue生命周期函数
				this.initSlave.onEnqueue();
				swanEvents('masterActiveOnqueueInitslave');
			});
	}

	/**
	 * 产生初始化的slave的工厂方法
	 *
	 * @param {string} initUri 初始化的uri
	 * @param {Object} appConfig 小程序配置的app.json中的配置内容
	 * @return {Object} 一个slave或slaveSet
	 */
	createInitSlave(initUri, appConfig) {
		let tabBarList = [];
		try {
			tabBarList = appConfig.tabBar.list;
		}
		catch (e) {}
		const initPath = initUri.split('?')[0];
		const currentIndex = tabBarList.findIndex(tab => tab.pagePath === initPath);
		const swaninterface = this.swaninterface;
		// if (tabBarList.length > 1 && currentIndex > -1) {
		// 	splitAppAccessory.tabBarList = tabBarList;
		// 	return new TabSlave({
		// 		list: tabBarList,
		// 		currentIndex,
		// 		appConfig,
		// 		swaninterface
		// 	});
		// }
		return new Slave({
			uri: initUri,
			appConfig,
			swaninterface
		});
	}

	/**
	 * 跳转到下一页的方法
	 *
	 * @param {Object} [params] - 跳转参数
	 * @return {Promise}
	 */
	navigateTo(params) {
		params.url = this.resolvePathByTopSlave(params.url);
		this.preCheckPageExist(params.url);
		const {url, slaveId} = params;
		const {appConfig, swaninterface} = this;
		const newSlave = new Slave({
			uri: url,
			slaveId,
			appConfig,
			swaninterface
		});
		// TODO: openinit openNext 判断有问题
		return newSlave.open(params)
			.then(res => {
				const slaveId = res.wvID;
				// navigateTo的第一步，将slave完全实例化
				newSlave.setSlaveId(slaveId);
				// navigateTo的第二步，讲slave推入栈
				this.history.pushHistory(newSlave);
				// navigateTo的第三步，调用slave的onEnqueue生命周期函数
				newSlave.onEnqueue();
				return res;
			})
			.catch(console.log);
	}

	/**
	 * 将传入的path以页面栈顶层为相对路径
	 * @param {string} path - 需要解析的相对路径
	 * @return {string} 解析后的全路径
	 */
	resolvePathByTopSlave(path) {
		if (/^\//g.exec(path)) {
			return path.replace(/^\//g, '');
		}
		const topSlaveUri = this.history.getTopSlaves()[0].getUri().replace(/[^\/]*$/g, '');
		const uriStack = pathResolver(topSlaveUri, path, () => {
			console.error(`navigateTo:fail url "${path}"`);
		});
		return uriStack.join('/').replace(/^\//g, '');
	}

	/**
	 * 前端预检查是否页面在配置项中
	 *
	 * @param {string} [url] - 跳转url
	 * @return {boolean} 是否存在
	 */
	preCheckPageExist(url) {
		let parsed = parseUrl(url);
		url = parsed.pathname;
		// 如果pages中存在该页面，则通过
		if (this.appConfig.pages.includes(url)) {
			return true;
		}

		// 有使用Component构造器构造的页面，则通过
		if (masterManager
			&& masterManager.pagesQueue
			&& Object.keys(masterManager.pagesQueue).includes(url)
		) {
			return true;
		}

		// 获取分包中的path
		let subPackagesPages = [];
		this.appConfig.subPackages
		&& this.appConfig.subPackages.forEach(subPackage => {
			// 此处兼容两种配置
			let pages = subPackage.pages.map(page =>
				(subPackage.root + '/' + page).replace('//', '/')
			);
			subPackagesPages = subPackagesPages.concat(pages);
		});

		// 如果分包的pages中存在该页面，则通过
		if (subPackagesPages.includes(url)) {
			return true;
		}

		// 不通过，走路由失败的逻辑
		this.handleNavigatorError(parsed);
		return false;
	}

	/**
	 * 调用用户自定义onPageNotFound方法
	 *
	 * @param {string} [parsed] - 跳转url
	 */
	handleNavigatorError(parsed) {
		let app = this.context.getApp();
		app && app._onPageNotFound({
			appInfo: this.context.appInfo || {},
			event: {
				page: parsed.pathname,
				query: parsed.query,
				isEntryPage: false
			},
			type: 'onPageNotFound'
		});
	}

}