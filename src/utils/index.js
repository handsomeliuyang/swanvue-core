import {Data} from './data';
import Loader from './loader';
// 旧调起协议特征 `://v19`
const OLD_LAUNCH_SCHEME_REGEX = /:\/\/v[0-9]+/;
const OLD_SCHEME_PARAMS_REGEX = /params=({.*})/; // params=

// 新调起协议特征 `//swan/xxx/xxx?xxx`
const NEW_SCHEME_PARAM_REGEX = /\/\/swan\/[0-9a-z_A-Z]+\/?(.*?)\?(.*)$/;
const NEW_EXTRA_PARAM_REGEX = /(_baiduboxapp|callback|upgrade).*?(&|$)/g;

export const loader = new Loader();
export {Data};
export {executeWithTryCatch} from './code-process';
export * from './path';

export const parseUrl = url => {
    let matchs = url.match(/(.*?)\?(.*)/);
    let result = {
        pathname: matchs ? matchs[1] : url,
        query: {}
    };
    if (matchs) {
        let re = /([^&=]+)=([^&]*)/g;
        let m;
        while ((m = re.exec(matchs[2])) !== null) {
            result.query[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
    }
    return result;
};

export const getParams = query => {
    if (!query) {
        return {};
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [key, value] = param.split('=');
            try {
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            }
            catch (e) {
                params[key] = value;
            }
            return params;
        }, {});
};

/**
 * 获取首页地址
 * @return {string} 首页地址
 */
function getIndexPath() {
    try {
        const appConfig = JSON.parse(global.appConfig);
        const index = appConfig.pages[0];
        const tabBarIndex = appConfig.tabBar
            && appConfig.tabBar.list
            && appConfig.tabBar.list[0]
            && appConfig.tabBar.list[0].pagePath;

        return tabBarIndex || index;
    }
    catch (e) {
        console.error(e);
        return '';
    }
}

/**
 * 从旧调起协议中获取params参数
 *
 * @param originScheme 调起协议
 * @return {Object} 从旧协议中提取出的参数对象
 * @return {{path: string, query: {}, extraData: *, navi: string} | {}}
 *          path: 调起协议的path,；query: 调起协议的query； navi: 有值代表小程序之间的调起； extraData: 小程序之间的调起时传递的数据
 */
function getParamsFromOldScheme(originScheme) {
    let path;
    let query = {};
    let navi = '';
    let extraData = {};

    // 获取协议字符串中的params字符串
    let paramsRegexResult = originScheme.match(OLD_SCHEME_PARAMS_REGEX);
    if (!paramsRegexResult) {
        return {};
    }

    let paramsStr = paramsRegexResult[1];

    // 解析params字符串，提取 path,query,navi,extraData 字段
    try {
        let paramsObj = JSON.parse(paramsStr);
        let fullPath = paramsObj.path || '';
        extraData = paramsObj.extraData || {};
        navi = paramsObj.navi || '';

        // eg: home/index/index?id=2
        if (fullPath) {
            let pathRegexResult = fullPath.match(/(.*)\?(.*)/);
            path = pathRegexResult ? pathRegexResult[1] : fullPath;
            query = pathRegexResult ? getParams(pathRegexResult[2]) : {};
        }
        else {
            // 默认首页地址作为path
            path = getIndexPath();
        }
    }
    catch (e) {
        console.error(e);
    }

    return {
        path,
        query,
        navi,
        extraData
    };
}

/**
 * 从新调起协议中获取 path 和 query
 *
 * @param originScheme 调起协议
 * @return {Object} path和query组成的对象
 */
function getParamsFromNewScheme(originScheme) {
    const scheme = originScheme.replace(NEW_EXTRA_PARAM_REGEX, '');
    const paramsRegexResult = scheme.match(NEW_SCHEME_PARAM_REGEX);

    const path = paramsRegexResult ? paramsRegexResult[1] : '';
    const query = paramsRegexResult ? getParams(paramsRegexResult[2]) : {};

    return {
        path: path ? path : getIndexPath(),
        query
    };
}


/**
 * 处理onAppLaunch、onAppShow、onAppHide的参数：从新旧调起协议中提取 path 和 query 和 extraData
 *
 * 旧调起协议格式 eg：
 * baiduboxapp://v19/swan/launch?params={"appKey":"xxx","path":"pages/home/home?id=3","extraData":{"foo":"baidu"},"appid":"xxx","navi":"naviTo","url":"pages/home/home?id=3"}&callback=_bdbox_js_328&upgrade=0
 *
 * 新调起协议格式 eg:
 * "baiduboxapp://swan/<appKey>/pages/home/home/?id=3&_baiduboxapp={"from":"","ext":{}}&callback=_bdbox_js_275&upgrade=0"
 *
 * @param {Object} appInfo 待处理的appInfo
 */
export const processParam = appInfo => {
    let originScheme = (appInfo && appInfo.appLaunchScheme) || '';
    if (!originScheme) {
        return;
    }
    originScheme = decodeURIComponent(originScheme);

    // 从协议中获取 path，query，extraData，navi
    let params = {};
    if (OLD_LAUNCH_SCHEME_REGEX.test(originScheme)) {
        params = getParamsFromOldScheme(originScheme);
    }
    else {
        params = getParamsFromNewScheme(originScheme);
    }
    appInfo = Object.assign(appInfo, params);

    // 新旧场景值的兼容，当是16为场景值的时候，取前8位
    let scene = appInfo.scene ? '' + appInfo.scene : '';
    appInfo.scene = scene.length === 16 ? scene.slice(0, 8) : scene;

    // 如果是从小程序跳转来的，则增加引用信息referrerInfo
    appInfo.srcAppId && (appInfo.referrerInfo = {
        appId: appInfo.srcAppId,
        extraData: appInfo.extraData
    });

    // 新增appURL字段用于app onShow透传给开发者
    appInfo.appURL = originScheme.replace(NEW_EXTRA_PARAM_REGEX, '');
};

let appInfoCache = null;
/**
 * 获取App信息(包含：appId,scene,scheme)
 *
 * @param {Object} swaninterface - 端能力接口
 * @param {bool} [noCache=false] - 是否使用缓存的appInfo
 * @return {Object} - 获取得到的App信息
 */
export const getAppInfo = (swaninterface, noCache = false) => {
    if (noCache || !appInfoCache) {
        appInfoCache = swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});
    }
    return appInfoCache;
};

/**
 * 深度拷贝逻辑，不同于lodash等库，但是与微信一致
 * @param {*} [originObj] 原对象
 * @return {Object|Array} 拷贝结果
 */
export const deepClone = originObj => {
    return deepAssign(Object.prototype.toString.call(originObj) === '[object Array]' ? [] : {}, originObj);
};

/**
 * 深度assign的函数
 * @param {Object} targetObject 要被拷贝的目标对象
 * @param {Object} originObject 拷贝的源对象
 * @return {Object} merge后的对象
 */
export const deepAssign = (targetObject = {}, originObject) => {
    const originType = Object.prototype.toString.call(originObject);
    if (originType === '[object Array]') {
        targetObject = originObject.slice(0);
        return targetObject;
    }
    else if (originType === '[object Object]' && originObject.constructor === Object) {
        for (const key in originObject) {
            targetObject[key] = deepAssign(targetObject[key], originObject[key]);
        }
        return targetObject;
    }
    else if (originType === '[object Date]') {
        return new Date(originObj.getTime());
    }
    else if (originType === '[object RegExp]') {
        const target = String(originObj);
        const lastIndex = target.lastIndexOf('/');
        return new RegExp(target.slice(1, lastIndex), target.slice(lastIndex + 1));
    }
    return originObject;
};