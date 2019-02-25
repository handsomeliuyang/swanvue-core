/**
 * @file 小程序slave中组件相关的事件的派发，到达master中
 *       需要转发给：开发者/私有对象/日志 进行对应处理
 * @author houyu(houyu01@baidu.com)
 */
import swanEvents from '../../utils/swan-events';
import Slave from '../navigator/slave';
// import TabSlave from '../navigator/tab-slave';

/**
 * slave的事件封装分发器，封装了大量的无逻辑公有方法
 *
 * @class
 */
export default class SlaveEventsRouter {
    constructor(masterManager, pageLifeCycleEventEmitter) {
        this.masterManager = masterManager;
        this.history = masterManager.navigator.history;
        this.slaveCommunicator = masterManager.communicator;
        this.pageLifeCycleEventEmitter = pageLifeCycleEventEmitter;
        swanEvents('masterPreloadConstructSlaveEventsRouter');
    }

    /**
     * 初始化所有页面级相关事件的绑定
     */
    initbindingEvents() {
        // this.bindPrivateEvents();
        this.bindDeveloperEvents();
        // this.bindEnvironmentEvents();
        this.bindLifeCycleEvent(this.pageLifeCycleEventEmitter);
        swanEvents('masterPreloadInitBindingEvents');
    }

    /**
     * 绑定开发者绑定的events
     */
    bindDeveloperEvents() {
        this.slaveCommunicator.onMessage('event', event => {
            swanEvents('masterListenEvent', event);

            const eventOccurredPageObject = this.history.seek(event.slaveId).getUserPageInstance();
            // if (event.customEventParams) {
            //     const nodeId = event.customEventParams.nodeId;
            //     const reflectComponent = eventOccurredPageObject
            //         .privateProperties.customComponents[nodeId];
            //     if (reflectComponent[event.value.reflectMethod]) {
            //         reflectComponent[event.value.reflectMethod]
            //             .call(reflectComponent, event.value.e);
            //     }
            // }
            // else
            if (eventOccurredPageObject[event.value.reflectMethod]) {
                eventOccurredPageObject[event.value.reflectMethod]
                    .call(eventOccurredPageObject, event.value.e);
            }
        });
    }

    /**
     * 调用发生事件的页面的同名方法
     *
     * @param {string} slaveId 想要派发的页面的slave的id
     * @param {string} methodName 事件名称
     * @param {Object|null} options 派发事件的可配置项
     * @param {...*} args 透传的事件参数
     * @return {*} 调用私有方法后，私有方法的返回值
     */
    // callEventOccurredPageMethod(slaveId, methodName, options = {}, ...args) {
    //     const occurredSlave = this.history.seek(slaveId);
    //     if (occurredSlave) {
    //         return occurredSlave.callPrivatePageMethod(methodName, options, ...args);
    //     }
    //     return null;
    // }

    /**
     * 向所有slave，派发事件
     *
     * @param {string} methodName 事件名称
     * @param {Object|null} options 发事件的可配置项
     * @param {...*} args 透传的事件参数
     */
    // dispatchAllSlaveEvent(methodName, options = {}, ...args) {
    //     this.history.each(slave => {
    //         slave.callPrivatePageMethod(methodName, options, ...args);
    //     });
    // }

    /**
     * 框架使用的私有的事件的绑定
     */
    // bindPrivateEvents() {
    //     this.slaveCommunicator.onMessage('abilityMessage', event => {
    //         if (event.value.type === 'rendered') {
    //             return;
    //         }
    //         try {
    //             this.callEventOccurredPageMethod(event.slaveId, event.value.type, {}, event.value.params);
    //         }
    //         catch (e) {
    //             console.error(e);
    //         }
    //     });
    // }

    /**
     * 保证onShow执行在onReady之前
     *
     * @param {string} currentSlaveId 需要触发的页面的slaveId
     */
    // emitPageRender(currentSlaveId) {
    //     this.slaveCommunicator.onMessage('abilityMessage', events => {
    //         if (Object.prototype.toString.call(events) !== '[object Array]') {
    //             events = [events];
    //         }
    //         events.forEach(event => {
    //             if (event.value.type === 'rendered'
    //                 && event.slaveId === currentSlaveId
    //             ) {
    //                 this.callEventOccurredPageMethod(
    //                     event.slaveId,
    //                     event.value.type,
    //                     {},
    //                     event.value.params
    //                 );
    //             }
    //         });
    //     }, {listenPreviousEvent: true});
    // }

    /**
     * 调用用户在page实例上挂载的方法
     *
     * @param {String} [slaveId] - 要调用的页面实例的slaveId
     * @param {String} [methodName] - 要调用的page实例上的方法名
     * @param {...*} [args] - 透传的事件参数
     * @return {*} 函数调用后的返回值
     */
    callPageMethod(slaveId, methodName, ...args) {
        const occurredSlave = this.history.seek(slaveId);
        if (occurredSlave) {
            const occurredSlavePageObject = occurredSlave.userPageInstance;
            if (typeof occurredSlavePageObject[methodName] === 'function') {
                try {
                    return occurredSlavePageObject[methodName](...args);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return null;
    }

    /**
     * 绑定开发者绑定的events
     */
    // bindDeveloperEvents() {
    //     this.slaveCommunicator.onMessage('event', event => {
    //         const eventOccurredPageObject = this.history.seek(event.slaveId).getUserPageInstance();
    //         if (event.customEventParams) {
    //             const nodeId = event.customEventParams.nodeId;
    //             const reflectComponent = eventOccurredPageObject
    //                 .privateProperties.customComponents[nodeId];
    //             if (reflectComponent[event.value.reflectMethod]) {
    //                 reflectComponent[event.value.reflectMethod]
    //                     .call(reflectComponent, event.value.e);
    //             }
    //         }
    //         else if (eventOccurredPageObject[event.value.reflectMethod]) {
    //             eventOccurredPageObject[event.value.reflectMethod]
    //                 .call(eventOccurredPageObject, event.value.e);
    //         }
    //     });
    // }

    /**
     * 客户端触发的协议事件，非前端派发
     * 用于接收协议事件
     *
     */
    // bindEnvironmentEvents() {
    //     this.masterManager.swaninterface
    //         .bind('sharebtn', event => {
    //             this.callEventOccurredPageMethod(event.wvID, 'share', {}, event, 'menu');
    //         })
    //         .bind('accountChange', event => {
    //             this.dispatchAllSlaveEvent('accountChange');
    //         })
    //         .bind('backtohome', ({url, from}) => {
    //             let topSlave = this.history.getTopSlaves()[0];
    //             let currentSlaveUrl = '';
    //             if (topSlave instanceof Slave) {
    //                 currentSlaveUrl = topSlave.accessUri;
    //             }
    //             else if (topSlave instanceof TabSlave) {
    //                 currentSlaveUrl = topSlave.children[topSlave.currentIndex].accessUri;
    //             }
    //             if (from !== 'menu' && currentSlaveUrl ===  url) {
    //                 from === 'relaunch' && swanEvents('masterFePageShow');
    //                 return;
    //             }
    //
    //             if (from === 'relaunch') {
    //                 swanEvents('masterOnNewScheme');
    //             }
    //             this.masterManager.navigator.reLaunch({url: `/${url}`});
    //         });
    // }

    bindLifeCycleEvent(pageLifeCycleEventEmitter) {

        // const pageEventsToLifeCycle = ['onHide', 'onTabItemTap'];
        // 需要稍后补执行的操作集合
        // let backPageEventToLifeCycles = {
        //     onTabItemTap: Object.create(null)
        // };
        // 确保onShow在onLoad之后
        pageLifeCycleEventEmitter.onMessage('PagelifeCycle', events => {
            if (Object.prototype.toString.call(events) !== '[object Array]') {
                events = [events];
            }
            // 对于客户端事件做一次中转，因为前端有特殊逻辑处理(onShow必须在onLoad之后)
            const detectOnShow = event => {
                if (event.params.eventName === 'onLoad') {

                    swanEvents('masterlifeCycleEventOnShow', event);

                    this.masterManager.lifeCycleEventEmitter
                        .onMessage('onShow' + event.params.slaveId, paramsQueue => {

                            // 筛选出本次的onShow的对应参数
                            paramsQueue = [].concat(paramsQueue);

                            // onshow对应的slave
                            const showedSlave = paramsQueue.filter(params => {
                                return +params.event.wvID === +event.params.slaveId;
                            }).slice(-1);

                            // 获取对象中的event
                            const e = showedSlave[0].event;

                            // 执行对应slave的onShow
                            this.callPageMethod(event.params.slaveId, '_onShow', {}, e);

                            // 触发页面的onRender逻辑
                            // this.emitPageRender(event.params.slaveId);

                        }, {listenPreviousEvent: true});
                }
            };
            events.forEach(detectOnShow);
        }, {listenPreviousEvent: true});

        // pageLifeCycleEventEmitter.onMessage('onTabItemTap', ({event, from}) => {
        //     let wvID = event.wvID;
        //     // 客户端触发onTabItemTap先于switchtab
        //     // 进入新页面pageInstance在onTabItemTap时没有还ready，等待switchtab后内部触发处理
        //     if (from === 'switchTab') {
        //         let {type, tabIndexPage} = event;
        //         let targetEvent = backPageEventToLifeCycles[type];
        //         if (targetEvent && targetEvent[tabIndexPage]) {
        //             this.callPageMethod(wvID, '_' + type, targetEvent[tabIndexPage]);
        //             backPageEventToLifeCycles[type] = Object.create(null);
        //         }
        //         return;
        //     }
        //     const targetSlave = this.history.seek(wvID);
        //     if (targetSlave) {
        //         // 原逻辑
        //         this.callPageMethod(wvID, '_onTabItemTap', event);
        //     }
        //     else {
        //         // 保存后续调用。 android对于新页面没有传wvID，所以根据index+pagePath进行统一保证
        //         backPageEventToLifeCycles.onTabItemTap[event.index + event.pagePath] = event;
        //     }
        // }, {listenPreviousEvent: true});

        this.masterManager.lifeCycleEventEmitter.onMessage('onHide', e => {
            let event = e.event;
            this.callPageMethod(event.wvID, '_onHide', {}, event);
        }, {listenPreviousEvent: true});

        // this.masterManager.swaninterface
        //     .bind('onTabItemTap', event => {
        //         pageLifeCycleEventEmitter.fireMessage({
        //             type: 'onTabItemTap',
        //             event
        //         });
        //     });

        // this.masterManager.swaninterface
        //     .bind('onForceReLaunch', event => {
        //         let {slaveId, homePath, pagePath} = event;
        //         let finalReLaunchPath = homePath;
        //         let currentSlave = this.history.seek(slaveId);
        //         if (currentSlave) {
        //             const currentSlavePageObject = currentSlave.userPageInstance;
        //             if (typeof currentSlavePageObject['onForceReLaunch'] === 'function') {
        //                 try {
        //                     finalReLaunchPath = currentSlavePageObject['onForceReLaunch']({homePath, pagePath});
        //                     finalReLaunchPath = finalReLaunchPath.replace(/^\//g, '');
        //                     this.masterManager.navigator.redirectTo({url: `/${finalReLaunchPath}`});
        //                     return;
        //                 }
        //                 catch (e) {
        //                     finalReLaunchPath = homePath;
        //                 }
        //             }
        //         }
        //         this.masterManager.navigator.reLaunch({
        //             url: `/${finalReLaunchPath}`,
        //             force: true
        //         });
        //     });
    }
}
