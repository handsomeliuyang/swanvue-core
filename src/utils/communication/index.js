/**
 * @file communication for two 'webviews', this is a symmetric action
 * @author houyu(houyu01@baidu.com)
 */
import EventsEmitter from '../events-emitter';

export default class Communicator extends EventsEmitter {
    constructor(swaninterface, options) {
        super(options);
        this.swaninterface = swaninterface;
        this.listen(options);
    }
    listen(options) {
        return this.swaninterface.invoke('onMessage', (...args) => {
            console.log('listen', this, args);
            this.fireMessage(...args);
        }, options);
    }
    sendMessage(slaveId, message = {}) {
        if (!message.type) {
            return Promise.reject({message: 'error'});
        }
        // V8中slaveId为数字无法sendMessage
        /* globals swanGlobal */
        // if (swanGlobal) {
        //     slaveId += '';
        // }
        return this.swaninterface.invoke('postMessage', slaveId, message);
    }
    // 私有的默认实例ID
    static communicatorId = 'Symbol_communicatorId';
    // 获取Communicator的实例工厂
    static instanceMap = {};
    // 工厂
    static getInstance(swaninterface, id = Communicator.communicatorId, options = {}) {
        if (!Communicator.instanceMap[id]) {
            Communicator.instanceMap[id] = new Communicator(swaninterface, options);
        }
        return Communicator.instanceMap[id];
    }
    /**
     *
     * 根据 id 删除 Communicator 实例
     *
     * @param {string} id id
     */
    static removeInstance(id) {
        Communicator.instanceMap[id] = null;
    }
}
