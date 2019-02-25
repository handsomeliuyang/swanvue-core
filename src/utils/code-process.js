/**
 * @file 处理外部使用代码的工具函数封装
 * @author houyu(houyu01@baidu.com)
 */

/**
 * 运行代码时，需要捕获开发者问题并抛出
 *
 * @param {Function} fn 需要运行的function
 * @param {*} context 函数执行的上下文
 * @param {string} errorMessage 函数报错时现实的报错信息
 * @param {Array} args 需要传入执行函数的参数
 * @return {*} 被包裹函数的执行返回值
 */
export const executeWithTryCatch = (fn, context, errorMessage, args) => {
    if (!fn) {
        return null;
    }
    let execResult = undefined;
    try {
        execResult = fn.call(context, args);
    }
    catch (e) {
        console.error(errorMessage);
        throw Error(e);
    }
    return execResult;
};
