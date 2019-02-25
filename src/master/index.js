
import {getAppMethods} from './app';
import {Navigator} from './navigator';
import EventsEmitter from '../utils/events-emitter';
import {Page, slaveEventInit} from './page';
import {define, require} from '../utils/module';
import {apiProccess} from './proccessors/api-proccessor';
import Communicator from '../utils/communication';
import swanEvents from '../utils/swan-events';

export default class Master {
    constructor(context, swaninterface, swanComponents) {
        swanEvents('masterPreloadStart');
        // this.handleError(context);
        this.swaninterface = swaninterface;
        this.swanComponents = swanComponents;
        this.pagesQueue = {};
        this.navigator = new Navigator(swaninterface, context);
        this.communicator = new Communicator(swaninterface);
        swanEvents('masterPreloadCommunicatorListened');
        //
        // this.swanEventsCommunicator = new EventsEmitter();
        // this.virtualComponentFactory = new VirtualComponentFactory(swaninterface);
        // this.extension = new Extension(context, swaninterface);
        //
        // // perfAudit data hook
        // this.perfAudit = {};
        //
        // 监听app、page所有生命周期事件
       this.bindLifeCycleEvents();
        // // 监听所有的slave事件
        const allSlaveEventEmitters = slaveEventInit(this);
        //
        this.pageLifeCycleEventEmitter = allSlaveEventEmitters.pageLifeCycleEventEmitter;
        //
        // 装饰当前master的上下文(其实就是master的window，向上挂方法/对象)
        this.context = this.decorateContext(context);
        //
        // this.openSourceDebugger();
        // // 监听appReady
        this.listenAppReady();
        // // 适配环境
        // this.adaptEnvironment();
        // // 解析宿主包
        // this.extension.use(this);
        swanEvents('masterPreloadGetMastermanager');
        swanEvents('masterPreloadEnd');

    }

    /**
     * 监听客户端的调起逻辑
     */
    listenAppReady() {
        this.swaninterface.bind('AppReady', event => {
            console.log('master listener AppReady ', event);

            // if (event.devhook === 'true') {
            //     if (swanGlobal) {
            //         loader.loadjs('./swan-devhook/master.js');
            //     } else {
            //         loader.loadjs('../swan-devhook/master.js');
            //     }
            // }
            swanEvents('masterActiveStart');
            // 给三方用的，并非给框架用，请保留
            this.context.appConfig = event.appConfig;
            // 初始化master的入口逻辑
            this.initRender(event);
            // this.preLoadSubPackage();
        });
    }

    /**
     * 初始化渲染
     *
     * @param {Object} initEvent - 客户端传递的初始化事件对象
     * @param {string} initEvent.appConfig - 客户端将app.json的内容（json字符串）给前端用于处理
     * @param {string} initEvent.appPath - app在手机上的磁盘位置
     * @param {string} initEvent.wvID - 第一个slave的id
     * @param {string} initEvent.pageUrl - 第一个slave的url
     */
    initRender(initEvent) {
        // 设置appConfig
        this.navigator.setAppConfig({
            ...JSON.parse(initEvent.appConfig),
            ...{
                appRootPath: initEvent.appPath
            }
        });
        swanEvents('masterActiveInitRender');

        // 压入initSlave
        this.navigator.pushInitSlave({
            pageUrl: initEvent.pageUrl,
            slaveId: +initEvent.wvID,
            root: initEvent.root,
            preventAppLoad: initEvent.preventAppLoad
        });

        this.appPath = initEvent.appPath;
        swanEvents('masterActivePushInitslave');
    }

    /**
     * 绑定生命周期事件
     */
    bindLifeCycleEvents() {
        this.lifeCycleEventEmitter = new EventsEmitter();
        this.swaninterface.bind('lifecycle', event => {
            console.log('master listener lifecycle', event);
            this.lifeCycleEventEmitter.fireMessage({
                type: event.lcType + (event.lcType === 'onShow' ? event.wvID : ''),
                event
            });
        });
    }

    /**
     * 装饰当前的上下文环境
     *
     * @param {Object} context - 待装饰的上下文
     * @return {Object} 装饰后的上下文
     */
    decorateContext(context) {
        Object.assign(context, this.getAppMethods());
        context.masterManager = this;
        context.define = define;
        context.require = require;
        // context.swaninterface = this.swaninterface; // 远程调试工具的依赖
        context.swan = this.decorateSwan(Object.assign(this.swaninterface.swan, context.swan || {}));
        // context.getCurrentPages = getCurrentPages;
        // context.global = {};
        context.Page = Page;
        //
        // context.Component = this.virtualComponentFactory
        //     .defineVirtualComponent.bind(this.virtualComponentFactory);
        //
        // context.Behavior = this.virtualComponentFactory
        //     .defineBehavior.bind(this.virtualComponentFactory);
        //
        swanEvents('masterPreloadDecorateContext');
        return context;
    }

    /**
     * 将导出给用户的swan进行封装，补充一些非端能力相关的框架层能力
     * 后续，向对外暴露的swan对象上，添加框架级方时，均在此处添加
     *
     * @param {Object} [originSwan] 未封装过的，纯boxjs导出的swan对象
     * @return {Object} 封装后的swan对象
     */
    decorateSwan(originSwan) {
        return apiProccess(originSwan, {
            swanComponents: this.swanComponents,
            navigator: this.navigator,
            communicator: this.communicator,
            pageLifeCycleEventEmitter: this.pageLifeCycleEventEmitter,
            appLifeCycleEventEmitter: this.appLifeCycleEventEmitter,
            swanEventsCommunicator: this.swanEventsCommunicator,
            // hostShareParamsProccess: this.extension.hostShareParamsProccess.bind(this.extension),
            swaninterface: this.swaninterface
        });
    }

    /**
     * 获取所有App级相关的方法
     *
     * @return {Object} 用户App的操作相关方法集合
     */
    getAppMethods() {
        this.appLifeCycleEventEmitter = new EventsEmitter();
        return getAppMethods(
            this.swaninterface,
            this.appLifeCycleEventEmitter,
            this.lifeCycleEventEmitter
        );
    }

}
