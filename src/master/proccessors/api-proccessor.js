/**
 * @file 对于swan全局对象的处理
 * @author houyu(houyu01@baidu.com)
 */

// 预留，节后上线
// import nextTick from '../../utils/next-tick';

/**
 * 防止在App与page的onShow中调用过多次数的login
 * @param {Object} originSwan 未decorate之前的swan
 * @param {Object} pageLifeCycleEventEmitter 页面的生命周期事件对象
 * @param {Object} appLifeCycleEventEmitter app的生命周期事件对象
 * @return {Function} login函数
 */
const lockLogin = (originSwan, pageLifeCycleEventEmitter, appLifeCycleEventEmitter) => {
    let isShowing = false;
    let loginTimes = 0;
    const originLogin = originSwan['login'];
    const lockEvents = ['onShow', 'onPreShow'];
    pageLifeCycleEventEmitter.onMessage('PagelifeCycle', ({params}) => {
        isShowing = lockEvents.indexOf(params.eventName) === 1;
    });
    appLifeCycleEventEmitter.onMessage('ApplifeCycle', ({params}) => {
        isShowing = lockEvents.indexOf(params.eventName) === 1;
    });
    const locker = {
        timesCheck(times, delay) {
            if (this['repeat' + times] === undefined) {
                this['repeat' + times] = 0;
            }
            if (this['repeat' + times] >= times) {
                return false;
            }
            if (this['repeat' + times] < 1) {
                setTimeout(() => {
                    this['repeat' + times] = 0;
                }, delay);
            }
            this['repeat' + times]++;
            return true;
        },
        enter(isShowing) {
            // 不在show中，可以任意发送
            // 如果在show中，则2秒内不得进入1次以上，30秒内不得进入2次以上
            return !isShowing || this.timesCheck(1, 2e3) && this.timesCheck(2, 3e4);
        }
    };

    return params => {
        if (!locker.enter(isShowing)) {
            params.fail && params.fail();
            return false;
        }
        return originLogin.call(originSwan, params);
    };
};

/**
 * 处理api的函数，对API进行swan-core本身的代理
 * @param {Object} originSwan 原始的api
 * @param {Object} context 装饰api使用的上下文
 * @param {Object} context.navigator 小程序的navigator对象
 * @param {Object} context.swanComponents 小程序的组件
 * @param {Object} context.pageLifeCycleEventEmitter 小程序page生命周期的事件流
 * @param {Object} context.appLifeCycleEventEmitter 小程序app生命周期的事件流
 * @param {Object} context.swanEventsCommunicator 小程序合并的统计事件流
 * @param {Object} context.hostShareParamsProccess 小程序自定义的宿主分享处理
 * @param {Object} context.communicator 小程序的slave-master通讯器
 * @param {Object} context.swaninterface 小程序的通用接口（包含swan与boxjs）
 * @return {Object} 处理后的api
 */
export const apiProccess = (originSwan, {
    navigator,
    swanComponents,
    pageLifeCycleEventEmitter,
    appLifeCycleEventEmitter,
    swanEventsCommunicator,
    hostShareParamsProccess,
    communicator,
    swaninterface
}) => {
    const getSlaveId = () => navigator.history.getTopSlaves()[0].getSlaveId();
    const operators = swanComponents.getContextOperators(swaninterface, communicator, getSlaveId);
    return Object.assign(originSwan, {
        navigateTo: navigator.navigateTo.bind(navigator),
        // navigateBack: navigator.navigateBack.bind(navigator),
        // redirectTo: navigator.redirectTo.bind(navigator),
        // switchTab: navigator.switchTab.bind(navigator),
        // reLaunch: navigator.reLaunch.bind(navigator),

        /**
         * 所有组件相关的操作API
         */
        ...operators,

        /**
         * 开发者的自定义数据上报
         * @param {string} reportName 上报的自定义事件名称
         * @param {Object} reportParams 用户上报的自定义事件的参数
         * @return {*} 发送日志后的返回值
         */
        reportAnalytics: (reportName, reportParams) => swanEventsCommunicator.fireMessage({
            type: 'SwanEvents',
            params: {
                eventName: 'reportAnalytics',
                e: {
                    reportName,
                    reportParams
                }
            }
        }),
        /**
         * 宿主自定义的分享，取代直接的api的分享
         * @param {Object} userParams 调用openShare的小程序开发者传递的param
         */
        openShare: (originShare => userParams => {
            // const appInfo = swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});
            // let proccessedParams = hostShareParamsProccess(userParams, appInfo);
            // return originShare.call(originSwan, proccessedParams);
            return '';
        })(originSwan['openShare']),

        login: lockLogin(originSwan, pageLifeCycleEventEmitter, appLifeCycleEventEmitter),

        /**
         * 截图的调用回调
         * @param {Function} callback 截图后的回调
         */
        onUserCaptureScreen: callback => {
            swaninterface.bind('onUserCaptureScreen', () => {
                typeof callback === 'function' && callback();
            });
        }
    });
};
