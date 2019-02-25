/**
 * @file page类的原型对象
 * @author houyu(houyu01@baidu.com)
 */
import {initLifeCycle} from './life-cycle';
// import {builtInBehaviorsAction} from '../custom-component/inner-behaviors';

const noop = () => {};
const SETDATA_THROTTLE_TIME = 10;

/**
 * 创建一个用户的page对象的原型单例
 * @param {Object} [masterManager] masterManager底层接口方法
 * @return {Object} page存放着所有page对象的原型方法的对象
 */
export const createPagePrototype = (masterManager, globalSwan) => {
    return {
        getData(path) {
            return this.privateProperties.raw.get(path);
        },
        /**
         * 通用的，向slave传递的数据操作统一方法
         *
         * @param {Object} dataParams - 数据操作的参数
         * @param {string} dataParams.type - 数据操作的类型
         * @param {string} dataParams.path - 数据操作的路径值
         * @param {Object} dataParams.value - 数据操作的数据值
         * @param {Function} dataParams.cb - 数据操作后的回调
         * @param {Object} dataParams.options - 数据操作的额外选项
         */
        sendDataOperation({
                              type,
                              path,
                              value,
                              cb = noop,
                              options
                          }) {
            const {
                raw,
                slaveId
            } = this.privateProperties;
            const setObject = typeof path === 'object' ? path : {
                [path]: value
            };
            cb = typeof cb === 'function' ? cb : noop;
            const callback = typeof value === 'function' ? value : cb;
            const pageUpdateStart = Date.now() + '';

            // 暂时只优化自定义组件的数据设置，进行throttle
            if (type === 'setCustomComponent') {
                this.operationSet = this.operationSet || [];
                this.operationSet.push({
                    setObject,
                    options,
                    pageUpdateStart
                });
                clearTimeout(this.operationTimmer);
                this.operationTimmer = setTimeout(() => {
                    // 先set到本地，然后通知slave更新视图
                    this.sendMessageToCurSlave({
                        slaveId,
                        type: `${type}Data`,
                        operationSet: this.operationSet
                    });
                    this.operationSet = [];
                }, SETDATA_THROTTLE_TIME);
            }
            else {
                // 先set到本地，然后通知slave更新视图
                this.sendMessageToCurSlave({
                    type: `${type}Data`,
                    slaveId,
                    setObject,
                    pageUpdateStart,
                    options
                });
            }
            // 更新data
            for (const path in setObject) {
                raw[type] && raw[type](path, setObject[path]);
            }
            this.nextTick(callback);
        },

        sendMessageToCurSlave(message) {
            masterManager.communicator.sendMessage(this.privateProperties.slaveId, message);
        },

        /**
         * 页面中挂载的setData操作方法，操作后，会传到slave，对视图进行更改
         *
         * @param {string|Object} [path] - setData的数据操作路径，或setData的对象{path: value}
         * @param {*} [value] - setData的操作值
         * @param {Function} [cb] - setData的回调函数
         */
        setData(path, value, cb) {
            this.sendDataOperation({
                type: 'set',
                path,
                value,
                cb
            });
        },
        // splice方法系列
        pushData(path, value, cb) {
            this.sendDataOperation({
                type: 'push',
                path,
                value,
                cb
            });
        },
        popData(path, cb) {
            this.sendDataOperation({
                type: 'pop',
                path,
                value: null,
                cb
            });
        },
        unshiftData(path, value, cb) {
            this.sendDataOperation({
                type: 'unshift',
                path,
                value,
                cb
            });
        },
        shiftData(path, cb) {
            this.sendDataOperation({
                type: 'shift',
                path,
                value: null,
                cb
            });
        },
        removeAtData(path, index, cb) {
            this.sendDataOperation({
                type: 'remove',
                path,
                value: index,
                cb
            });
        },
        spliceData(path, args, cb) {
            this.sendDataOperation({
                type: 'splice',
                path,
                value: args,
                cb
            });
        },

        createCanvasContext(...args) {
            return globalSwan.createCanvasContext.call(this, ...args);
        },
        nextTick(fn) {
            masterManager.communicator
                .onMessage(`nextTick:${this.privateProperties.slaveId}`, () => fn(), {
                    once: true
                });
        },

        /**
         * 页面级选择某个(id、class)全部的自定义组件
         *
         * @param {string} selector - 待选择的自定义组件id
         * @return {Array} - 所选的全部自定义组件集合
         */
        selectAllComponents(selector) {
            return this.privateMethod
                .getComponentsFromList(this.privateProperties.customComponents, selector, '*');
        },

        /**
         * 页面级选择某个(id、class)第一个自定义组件
         *
         * @param {string} selector - 待选择的自定义组件id
         * @return {Object} - 自定义组件被拦截的export输出 | 所选的自定义组件实例
         */
        selectComponent(selector) {
            const selectRes = this.selectAllComponents(selector)[0];
            // 当自定义组件中包含内置behavior时, 进行拦截操作
            const exportRes = builtInBehaviorsAction('swanComponentExport', selectRes);
            return exportRes.isBuiltInBehavior ?  exportRes.resData : selectRes;
        },

        // page实例中的私有方法合集
        privateMethod: {

            /**
             * 发送初始数据到当前Page对应的slave上
             *
             * @param {Object} [appConfig] - 发送初始化数据时携带的appConfig信息
             */
            sendInitData(appConfig) {
                masterManager.communicator.sendMessage(
                    this.privateProperties.slaveId,
                    {
                        type: 'initData',
                        path: 'initData',
                        value: this.data,
                        // extraMessage: {
                        //     componentsData: this.privateMethod.getCustomComponentsData
                        //         .call(this, this.usingComponents, masterManager.communicator)
                        // },
                        slaveId: this.privateProperties.slaveId,
                        appConfig
                    }
                );
            }
        }
    };
};

let pagePrototype = null;
// 获取page的prototype的单例方法，节省初始化
export const getPagePrototypeInstance = (masterManager, globalSwan, pageLifeCycleEventEmitter) => {
    if (!pagePrototype) {
        pagePrototype = createPagePrototype(masterManager, globalSwan);
        initLifeCycle(masterManager, pagePrototype, pageLifeCycleEventEmitter);
    }
    return pagePrototype;
};
