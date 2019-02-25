/**
 * @file path路径相关的工具集
 * @author houyu(houyu01@baidu.com)
 */

export const pathResolver = (originPath, path, errorCb) => {
    const segs = (originPath + '/' + path).split('/');
    return segs.reduce((resStack, seg) => {
        if (seg !== '' && seg !== '.') {
            if (seg === '..') {
                if (resStack.length === 0) {
                    errorCb && errorCb();
                }
                resStack.pop();
            }
            else {
                resStack.push(seg);
            }
        }
        return resStack;
    }, []);
};

/**
 * 在app工程里面的路径，需要替换path为绝对路径
 *
 * @param {string} basePath - 计算绝对路径时使用的基础路径
 * @param {string} pagePath - 计算绝对路径时使用的页面级路径
 * @param {string} path - 相对小程序的路径，会被变成绝对路径
 * @return {string} 计算出的文件的绝对路径
 */
export const absolutePathResolver = (basePath, pagePath, path) => {
    // 远程地址无需转换
    if (/^https?:\/\//.test(path)) {
        return path;
    }
    // 绝对路径的话，不用page路径
    const pageRoute = /^\//.test(path) ? '' : pagePath.replace(/[^\/]*$/g, '');
    return '/' + pathResolver(`${basePath}/${pageRoute}`, path).join('/');
};
