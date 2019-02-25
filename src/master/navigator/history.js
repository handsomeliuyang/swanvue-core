
import swanEvents from '../../utils/swan-events';

export default class History {
    constructor(initSlaves = []) {
        this.historyStack = initSlaves;
        swanEvents('masterPreloadCreateHistorystack')
    }
    /**
     * 将一个slave推入栈中
     *
     * @param {Object} slave 推入栈中的slave
     * @return {number} 推入后栈新的长度(同array.push)
     */
    pushHistory(slave) {
        return this.historyStack.push(slave);
    }

    /**
     * 根据所给出的delta退栈
     *
     * @param {number} delta 退栈的层数
     * @return {Array} 退出的所有slave
     */
    // popHistory(delta = 1) {
    //     let poppedSlaves = [];
    //     for (let i = 0; i < delta; i++) {
    //         const currentHistoryPage = this.historyStack.pop();
    //         poppedSlaves.push(currentHistoryPage);
    //     }
    //     return poppedSlaves;
    // }

    /**
     * 替换栈顶的slave
     *
     * @param {object} slave 要被替换至栈顶的slave
     * @return {number} 推入后栈新的长度(同array.push)
     */
    // replaceHistory(slave) {
    //     this.historyStack.pop();
    //     return this.pushHistory(slave);
    // }

    /**
     * 获取栈顶的delta个元素
     *
     * @param {number} delta 获取的栈顶元素个数
     * @return {Array} 栈顶的delta个元素
     */
    getTopSlaves(delta = 1) {
        return this.historyStack.slice(-1 * delta, this.historyStack.length);
    }

    /**
     * 获取整个栈
     */
    // getAllSlaves() {
    //     return this.historyStack;
    // }

    /**
     * 退栈到某一条件(到某一个slaveid的slave)
     *
     * @param {number} slaveId 退至的slave的id
     * @param {Function} everyCb 每退一个时候的回调
     */
    // popTo(slaveId, everyCb) {
    //     if (this.historyStack.some(item => item.isTheSlave(slaveId))) {
    //         while (this.historyStack.length !== 0
    //             && !this.getTopSlaves()[0].isTheSlave(slaveId)
    //         ) {
    //             const topSlave = this.historyStack.pop();
    //             topSlave.close();
    //             everyCb && everyCb(topSlave);
    //         }
    //     }
    // }

    /**
     * 清空栈，并逐个调用栈中的析构方法(close)
     *
     */
    // clear() {
    //     try {
    //         this.historyStack.forEach(slave => slave.close());
    //     }
    //     catch (e) {
    //         console.error('析构出现错误:', e);
    //     }
    //     this.historyStack = [];
    // }

    /**
     * 判断栈中是否有某一个slave
     *
     * @param {number} slaveId 判断是否存在的slave的id
     * @return {boolean} 判断某一slave是否存在
     */
    // hasTheSlave(slaveId) {
    //     return this.historyStack.some(item => item.isTheSlave(slaveId));
    // }

    /**
     * 从history栈中获取slave
     * @param {string} [slaveId] slave的id或者slave的uri
     * @param {boolean} [getSuperSlave] 获取slave的泛类型，还是具体的slave
     * @return {Object} slave对象
     */
    seek(slaveId, getSuperSlave) {
        const superSlave = this.historyStack
        .find(item => item.isTheSlave(slaveId));
        return getSuperSlave ? superSlave : superSlave && superSlave.findChild(slaveId);
    }

    /**
     * 对于页面栈中的所有节点进行遍历
     *
     * @param {Function} fn 每次遍历调用的函数
     */
    // each(fn) {
    //     this.historyStack.forEach(slave => {
    //         fn && fn(slave);
    //     });
    // }
}
