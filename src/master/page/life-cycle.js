/**
 * @file 单个页面的生命周期管理
 * @author houyu(houyu01@baidu.com)
 */
import swanEvents from '../../utils/swan-events';

// const customComponentPageLifetimes = ['onShow', 'onHide'];

/**
 * 触发页面中自定义组件的pageLifetimes (show|hide)
 *
 * @param {Object} customComponent - 当前自定义组件实例
 * @param {string} type            - 事件类型
 * @param {Object} params          - 页面onLoad的参数
 */
// const pageLifetimesExecutor = (customComponent, type, params) => {
//     if (customComponentPageLifetimes.includes(type)) {
//         const eventType = type.replace(/^(on)/, '').toLowerCase();
//         customComponent.pageLifetimes
//         && customComponent.pageLifetimes[eventType]
//         && customComponent.pageLifetimes[eventType].call(customComponent, params);
//     }
// };

/**
 * 自定义组件page化, 生命周期触发
 *
 * @param {Object} pageInstance - 页面实例
 * @param {string} type         - 事件类型
 * @param {Object} params       - 页面onLoad的参数
 */
// const customComponentLifeCycleExecutor = (pageInstance, type, params) => {
//     const customComponents = pageInstance.privateProperties.customComponents;
//     if (customComponents) {
//         for (let customComponentId in customComponents) {
//             const customComponent = customComponents[customComponentId];
//             // 触发onLoad时自定义组件还没有创建好, 将触发onLoad时机放到onReady前
//             // 保持与page级生命周期（目前page未修复前onLoad -> onReady -> onShow）同时序
//             if (pageInstance._isCustomComponentPage
//                 && pageInstance.route === customComponent.is
//                 && type === 'onReady'
//             ) {
//                 customComponent.onLoad
//                 && customComponent.onLoad.call(customComponent, pageInstance._onLoadParams);
//             }
//
//             pageLifetimesExecutor(customComponent, type, params);
//
//             // 自定义组件当做页面使用时, 其生命周期的处理, 只有page化的该自定义组件享有页面级生命周期（methods内）
//             pageInstance._isCustomComponentPage
//             && pageInstance.route === customComponent.is
//             && customComponent[type]
//             && customComponent[type].call(customComponent, params);
//         }
//     }
// };

/* eslint-disable fecs-camelcase */
const lifeCyclePrototype = {

    /**
     * onLoad生命周期，在页面入栈后既开始执行，在页面展现前既开始执行
     *
     * @param {Object} [params] - 页面onLoad的参数
     */
    _onLoad(params) {
        try {
            this.onLoad && this.onLoad(params);
            this._onLoadParams = params; // 给自定义组件page化使用
        }
        catch (e) {
            console.error(e);
        }
        this._sendPageLifeCycleMessage('onLoad', params);
    },

    /**
     * onReady生命周期，在页面渲染完成，并通知master之后执行
     *
     * @param {Object} [params] - 页面onReady的参数
     *
     */
    _onReady(params) {
        try {
            this.onReady && this.onReady(params);
            // customComponentLifeCycleExecutor(this, 'onReady', params);
        }
        catch (e) {
            console.error(e);
        }
        this._sendPageLifeCycleMessage('onReady', params);
    },

    /**
     * onShow生命周期，在页面展现出来后，但还未渲染前执行(或页面从后台切到前台，则执行)
     *
     * @param {Object} [params] - onShow生命周期的参数
     */
    _onShow(params) {
        try {
            this._sendPageLifeCycleMessage('onPreShow', params);
            this.onShow && this.onShow(params);
            // customComponentLifeCycleExecutor(this, 'onShow', params);
        }
        catch (e) {
            console.error(e);
        }
        swanEvents('pageSwitchEnd', {
            slaveId: this.privateProperties.slaveId,
            timestamp: Date.now() + ''
        });
        this._sendPageLifeCycleMessage('onShow', params);
    },

    /**
     * onHide生命周期，在页面切换到后台，不在当前界时触发
     *
     * @param {Object} [params] - onHide生命周期的参数
     */
    _onHide(params) {
        this.onHide && this.onHide(params);
        // customComponentLifeCycleExecutor(this, 'onHide', params);
        this._sendPageLifeCycleMessage('onHide', params);
    },

    /**
     * onUnload生命周期，页面被卸载时执行(页面退栈)
     *
     * @param {Object} [params] - onUnload的生命周期参数
     */
    _onUnload(params) {
        this.onUnload && this.onUnload(params);
        this._onHide();
        // customComponentLifeCycleExecutor(this, 'onUnload', params);
        this._sendPageLifeCycleMessage('onUnload', params);
    },

     /**
     * onForceReLaunch生命周期，小程序面板点重启时(强制relauch)
     *
     * @param {Object} params - onForceReLaunch的生命周期参数
     */
    _onForceReLaunch(params) {
        this.onForceReLaunch && this.onForceReLaunch(params);
        this._sendPageLifeCycleMessage('onForceReLaunch', params);
    },

    /**
     * 页面下拉刷新时执行
     *
     * @param {Object} [params] - 页面发生下拉刷新时的参数
     */
    _pullDownRefresh(params) {
        this.onPullDownRefresh && this.onPullDownRefresh(params);
        // customComponentLifeCycleExecutor(this, 'onPullDownRefresh', params);
        this._sendPageLifeCycleMessage('onPullDownRefresh', params);
    },

    _onTabItemTap(params) {
        const proccessedParams = [].concat(params)[0];
        this.onTabItemTap && this.onTabItemTap(proccessedParams);
        // customComponentLifeCycleExecutor(this, 'onTabItemTap', params);
        this._sendPageLifeCycleMessage('onTabItemTap', params);
    },

    // _share(params) {
    //     this._sendPageLifeCycleMessage('beforeShare', params);
    //     // 分享不需要清除之前postMessage过来的数据
    //     this.privateProperties.share.shareAction(params)
    //         .then(res => this._sendPageLifeCycleMessage('shareSuccess', res))
    //         .catch(err => this._sendPageLifeCycleMessage('shareFailed', err));
    //     this._sendPageLifeCycleMessage('shareAction', params);
    // },

    _reachBottom(params) {
        this.onReachBottom && this.onReachBottom(params);
        // customComponentLifeCycleExecutor(this, 'onReachBottom', params);
        this._sendPageLifeCycleMessage('onReachBottom', params);
    },

    _onPageScroll(params) {
        this.onPageScroll && this.onPageScroll(params);
        // customComponentLifeCycleExecutor(this, 'onPageScroll', params);
        this._sendPageLifeCycleMessage('onPageScroll', params);
    },

    /**
     * 向事件流中发送生命周期通知，以便于下游使用
     *
     * @param {string} [eventName] - 发生的事件名称
     * @param {Object} [e] - 发生事件的参数
     */
    _sendPageLifeCycleMessage(eventName, e = {}) {
        this._pageLifeCycleEventEmitter.fireMessage({
            type: 'PagelifeCycle',
            params: {
                eventName,
                slaveId: this.privateProperties.slaveId,
                accessUri: this.privateProperties.accessUri,
                e
            }
        });
    }
};

/**
 * Page中的生命周期
 * @param {Object} [pagePrototype] - Page的prototype
 * @param {Object} [swaninterface] - swaninterface
 * @param {Object} [pageLifeCycleEventEmitter] - 页面生命周期的事件流对象
 * @return merge后的Page的prototype
 */
export const initLifeCycle = (mastermanager, pagePrototype, pageLifeCycleEventEmitter) => {
    const swaninterface = mastermanager.swaninterface;
    return Object.assign(pagePrototype, lifeCyclePrototype, {
        _pageLifeCycleEventEmitter: pageLifeCycleEventEmitter
    });
};
/* eslint-enable fecs-camelcase */
