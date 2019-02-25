/**
 * @file base listen/fire lib，u can use it as a normal observer in your code
 * @author houyu(785798835@qq.com)
 */

/** 一组队列的抽象 */
class QueueSet {

    constructor() {
        this.queueSet = {};
    }

    /**
     * 获取某一条具体队列
     *
     * @param {string} 需要获取的队列的名称
     * @return {Array} 获取到的某一个具体队列
     */
    get(namespace) {
        if (!this.queueSet[namespace]) {
            this.queueSet[namespace] = [];
        }
        return this.queueSet[namespace];
    }

    /**
     * 将某一元素推入具体的某一条队列中
     *
     * @param {string} namespace 要推入的队列名称
     * @param {*} 推入队列的元素
     */
    pushTo(namespace, message) {
        this.get(namespace).push(message);
    }

    /**
     * 队列集合中是否含有某一个具体的队列
     *
     * @param {string} namespace - 队列的名称
     * @return {bool} 当前队列集合中是否有某一特定队列
     */
    has(namespace) {
        return Object.prototype.toString.call(this.queueSet[namespace]) === '[object Array]';
    }

    /**
     * 删除队列中的某一项元素
     *
     * @param {string} namespace - 队列名称
     * @param {*} element - 要删除的元素的引用
     */
    del(namespace, element) {
        if (!element) {
            this.queueSet[namespace] = [];
        }
        else if (namespace === '*') {
            Object.keys(this.queueSet)
                .filter(namespace => this.has(namespace))
                .forEach(queueName => {
                    this.queueSet[queueName] = this.queueSet[queueName].filter(item => item.handler !== element);
                });
        }
        else {
            this.queueSet[namespace] = this.queueSet[namespace].filter(item => item.handler !== element);
        }
    }
}

export default class EventsEmitter {

    constructor() {
        this.handlerQueueSet = new QueueSet();
        this.messageQueueSet = new QueueSet();
    }

    /**
     * 融合多条事件流成为一条
     *
     * @param {...Object} communicators - 需要融合的任意一组事件流
     * @return {Object} - 融合后的事件流
     */
    static merge(...communicators) {
        const mergedEventsEmitter = new EventsEmitter();
        [...communicators]
            .forEach(communicator => {
                communicator.onMessage('*', e => mergedEventsEmitter.fireMessage(e));
            });
        return mergedEventsEmitter;
    }

    /**
     * 派发事件
     *
     * @param {Object} message - 派发事件的对象
     * @return {Object} - this环境上下文
     */
    fireMessage(message) {
        if (message && message.type && this.handlerQueueSet.get(message.type)) {

            this.messageQueueSet.pushTo(message.type, message);

            this.handlerQueueSet.get(message.type)
                .forEach(item => {
                    this.handlerWrapper(item, message.type, message);
                });

            this.handlerQueueSet.get('*')
                .forEach(item => {
                    this.handlerWrapper(item, '*', message);
                });
        }
        return this;
    }

    /**
     * 监听事件
     *
     * @param {string} type - 监听的事件名称
     * @param {Function} handler - 监听的事件回调
     * @param {Object} options - 监听的设置选项
     * @return {Object} this环境上下文
     */
    onMessage(type, handler, options = {}) {

        if (Object.prototype.toString.call(type) === '[object Array]') {
            type.forEach(oneType => this.onMessage(oneType, handler, options));
            return this;
        }

        this.handlerQueueSet.pushTo(type, {
            handler,
            once: options.once
        });

        if (options.listenPreviousEvent === true && this.messageQueueSet.has(type)) {
            this.handlerWrapper(
                {handler, once: options.once},
                type,
                this.messageQueueSet.get(type)
            );
        }
        return this;
    }

    /**
     * 删除事件监听
     *
     * @param {string} type - 监听的事件名称
     * @param {Function} handler - 监听的事件回调
     * @return {Object} this环境上下文
     */
    delHandler(type, handler) {
        this.handlerQueueSet.del(type, handler);
        return this;
    }

    /**
     * 执行handler的代理函数
     *
     * @param {Object} item - 事件流中存储的某个对象
     * @param {Function} item.handler - 事件流中某个对象中的事件接受处理者
     * @param {string} type - 事件的名称
     * @param {*} message - 需要传递给执行事件的参数
     * @return {bool} - 执行是否成功的结果
     */
    handlerWrapper({handler, once}, type, message) {
        if (!handler) {
            return false;
        }
        handler.call(this, message);
        // 如果设定，用完即删
        if (once) {
            this.handlerQueueSet.del(type, handler);
        }
        return true;
    }
}

export {QueueSet};
