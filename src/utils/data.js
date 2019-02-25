/**
 * @file 对于page对象的数据抽象
 * @author houyu(houyu01@baidu.com)
 */

export class Data {
    constructor(data) {
        this.raw = data;
    }

    /**
     * 使用path对数据进行get
     * @param {string} [exprPath] 读取数据的path
     * @return {Object} get获取的返回值
     */
    get(exprPath) {
        if (!exprPath) {
            return this.raw;
        }
        return exprPath.replace(/\[(\d+?)\]/g, '.$1')
            .split('.')
            .reduce((obj, key, idx) => {
                return obj ? obj[key] : obj;
            }, this.raw);
    }

    /**
     * 使用path对数据进行set
     * @param {string} [exprPath] 属性路径
     * @param {*} [value] 变更属性值
     * @return {Object} 设定之后设定的整体数据
     */
    set(exprPath, value) {
        if (!exprPath) {
            return this.raw;
        }
        const keys = exprPath.replace(/\[(\d+?)\]/g, '.$1').split('.');
        keys.reduce((obj, key, idx) => {
            if (idx === keys.length - 1) {
                obj[key] = value;
            }
            else {
                if (typeof obj[key] === 'undefined') {
                    obj[key] = {};
                }
                return obj[key];
            }
        }, this.raw);
        return this.raw;
    }

    /**
     * 使用path对数据项进行push操作
     * @param {string} [exprPath] 读取数据的path
     * @param {*} [value] 推入的数据项
     * @return {number|null} 设定后数组的长度
     */
    push(exprPath, value) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            return target.push(value);
        }
        return null;
    }

    /**
     * 使用path对数据项进行pop操作
     * @param {string} [exprPath] 读取数据的path
     * @return {*} pop出数组的数据项
     */
    pop(exprPath) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            return target.pop();
        }
        return null;
    }

    /**
     * 使用path对数据项进行unshif操作
     * @param {string} [exprPath] 读取数据的path
     * @param {*} [value] 推入的数据项
     * @return {*} unshift出数组的数据项
     */
    unshift(exprPath, value) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            return target.unshift(value);
        }
        return null;
    }

    /**
     * 使用path对数据项进行shift操作
     * @param {string} [exprPath] 操作数据的path
     * @return {*} 推出的数据项
     */
    shift(exprPath) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            return target.shift();
        }
        return null;
    }

    /**
     * 使用path对数据项进行removeAt操作
     * @param {string} [exprPath] 操作数据的path
     * @param {number} [index] 操作的数据位置
     * @return {*} 移除的数据项
     */
    removeAt(exprPath, index) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            const newTarget = target.splice(index, 1);
            // this.set(exprPath, newTarget);
            return newTarget;
        }
        return null;
    }

    /**
     * 使用path对数据项进行splice操作
     * @param {string} [exprPath] 操作数据的path
     * @param {number} [args] splice对应的数据参数
     * @return {*} splice的操作返回值
     */
    splice(exprPath, args) {
        let target = this.get(exprPath);
        if (target instanceof Array) {
            return [].splice.call(target, args);
        }
        return null;
    }
}
