import {getComponentFactory} from './component-factory';
import swanEvents from '../utils/swan-events';
import {loader} from '../utils';

export default class Slave {
    constructor(global, swaninterface, swanComponents) {
        swanEvents('slavePreloadStart');
        this.context = global;
        // this.context.require = require;
        // this.context.define = define;
        // this.context.san = san;
        // this.context.swan = swaninterface.swan;
        // this.context.swaninterface = swaninterface; // 远程调试用
        this.swaninterface = swaninterface;
        this.swanComponents = swanComponents;
        // this.openSourceDebugger();
        // this.extension = new Extension(global, swaninterface);
        this.registerComponents();
        this.listenPageReady(global);
        // this.extension.use(this);
        swanEvents('slavePreloadEnd');
    }

    registerComponents() {
        const swaninterface = this.swaninterface;
        const {versionCompare, boxVersion} = this.swaninterface.boxjs.platform;
        const componentProtos = this.swanComponents.getComponents({
            isIOS: false,
            versionCompare,
            boxVersion
        });
        swanEvents('slavePreloadGetComponents');
        const componentDefaultProps = {swaninterface};
        const componentFactory = getComponentFactory(componentDefaultProps,
            {...componentProtos},
            this.swanComponents.getBehaviorDecorators());

        global.componentFactory = componentFactory;

        global.pageRender = (pageTemplate, templateComponents, customComponents, filters, modules) => {
            console.log('salve pageRender run...');

            // 用于记录用户模板代码在执行pageRender之前的时间消耗，包括了pageContent以及自定义模板的代码还有filter在加载过程中的耗时
            // global.FeSlaveSwanJsParseEnd = Date.now();
            let filtersObj = {};
            // filters && filters.forEach(element => {
            //     let func = element.func;
            //     let module = element.module;
            //     filtersObj[element.filterName] = (...args) => {
            //         return modules[module][func](...args);
            //     };
            // });

            global.isNewTemplate = true;
            swanEvents('slaveActivePageRender', pageTemplate);

            console.log('pageTemplate', pageTemplate);
            // 定义当前页面的组件
            componentFactory.componentDefine(
                'page',
                {
                    superComponent: 'super-page',
                    options: {
                        // template: `<swan-page tabindex="-1">${pageTemplate}</swan-page>`,
                        template: `<div>${pageTemplate}</div>`,
                        // components: {...componentFactory.getComponents(), ...templateComponents, ...customComponents},
                        components: {...componentFactory.getComponents()}
                    }
                },
            );

            const rootDiv = document.createElement('div');
            rootDiv.setAttribute('id', 'root');
            document.body.appendChild(rootDiv);

            swanEvents('slaveActiveDefineComponentPage');
            // 获取page的组件类
            const Page = global.componentFactory.getComponents('page');
            // 监听等待initData，进行渲染
            Page.communicator.onMessage('initData', params => {
                swanEvents('slaveActiveReceiveInitData', params);
                try {
                    // 根据master传递的data，设定初始数据，并进行渲染
                    const options = Page.getInitData(params);
                    swanEvents('slaveActiveRenderStart');

                    const page = new Page(options);
                    // 真正的页面渲染，发生在initData之后
                    // 此处让页面真正挂载处于自定义组件成功引用其他自定义组件之后,
                    // 引用其它自定义组件是在同一时序promise.resolve().then里执行, 故此处attach时, 自定义组件已引用完成
                    setTimeout(() => {
                        // page.attach(document.body);
                        page.$mount('#root');
                        // 通知master加载首屏之后的逻辑
                        page.$communicator.sendMessage(
                            'master', {
                                type: 'slaveAttached',
                                slaveId: page.slaveId
                            }
                        );
                        swanEvents('slaveActivePageAttached');
                    }, 0);

                }
                catch (e) {
                    console.log(e);
                    global.errorMsg['renderError'] = e;
                }
            });
            // 调用页面对象的加载完成通知
            Page.slaveLoaded();

            // 如果已经有端上传来的initData数据，直接渲染
            // if (global.advancedInitData) {
            //     let initData = global.advancedInitData;
            //     page.communicator.fireMessage({
            //         type: 'initData',
            //         value: initData.data,
            //         extraMessage: {
            //             componentsData: initData.componentsData
            //         }
            //     });
            // }

            swanEvents('slaveActiveJsParsed');
            // if (global.PageComponent) {
            //     Object.assign(global.PageComponent.components, customComponents);
            // }
        };

        const compatiblePatch = () => {
            // global.PageComponent = global.componentFactory.getComponents('super-page');
            // global.PageComponent.components = global.componentFactory.getComponents();
            // global.PageComponent.stabilityLog = global.PageComponent.stabilityLog || new Function();
        };
        compatiblePatch();

        /**
         * 修复浏览器兼容问题
         */
        // const browserPatch = () => {
        //     // 兼容部分安卓机划动问题
        //     document.body.addEventListener('touchmove', () => {});
        // };
        // browserPatch();
    }


    /**
     * 监听pageReady，触发整个入口的调起
     * @param {Object} [global] 全局对象
     */
    listenPageReady(global) {
        swanEvents('slavePreloadListened');
        // 控制是否开启预取initData的开关
        let advancedInitDataSwitch = false;
        this.swaninterface.bind('PageReady', event => {
            swanEvents('slaveActiveStart', {
                pageInitRenderStart: Date.now() + ''
            });
            let initData = event.initData;
            if (initData) {
                try {
                    initData = JSON.parse(initData);
                    this.initData = initData;
                }
                catch (e) {
                    initData = null;
                }
            }
            if (advancedInitDataSwitch) {
                global.advancedInitData = this.initData;
            }

            const appPath = event.appPath;
            const pagePath = event.pagePath.split('?')[0];
            const onReachBottomDistance = event.onReachBottomDistance;

            // 给框架同学用的彩蛋
            const corePath = global.location.href
                .replace(/[^\/]*\/[^\/]*.html$/g, '')
                .replace(/^file:\/\//, '');
            global.debugDev = `deployPath=${appPath}\ncorePath=${corePath}`;

            // 给框架同学使用的刷新彩蛋
            sessionStorage.setItem('debugInfo', `${appPath}|debug|${pagePath}`);

            // 供组件中拼接绝对路径使用的全局信息
            global.pageInfo = {
                appPath,
                pagePath,
                onReachBottomDistance
            };
            // let loadHook = () => {
            //     return loader.loadjs('../swan-devhook/slave.js').then(() => {
            //         /* eslint-disable fecs-camelcase, no-undef */
            //         __san_devtool__.emit('san', san);
            //         /* eslint-enable fecs-camelcase, no-undef */
            //     });
            // };

            let loadUserRes = () => {
                // 设置页面的基础路径为当前页面本应所在的路径
                // 行内样式等使用相对路径变成此值
                // setPageBasePath(`${appPath}/${pagePath}`);
                swanEvents('slaveActivePageLoadStart');
                // 加载用户的资源
                Promise.all([
                    loader.loadcss(`${appPath}/app.css`, 'slaveActiveAppCssLoaded'),
                    loader.loadcss(`${appPath}/${pagePath}.css`, 'slaveActivePageCssLoaded')
                ])
                    .catch(() => {
                        console.warn('加载css资源出现问题，请检查css文件');
                    })
                    .then(() => {
                        // todo: 兼容天幕，第一个等天幕同步后，干掉
                        swanEvents('slaveActiveCssLoaded');
                        swanEvents('slaveActiveSwanJsStart');
                        loader.loadjs(`${appPath}/${pagePath}.swan.js`, 'slaveActiveSwanJsLoaded');
                    });
            };
            // (event.devhook === 'true' ? loadHook().then(loadUserRes).catch(loadUserRes) : loadUserRes());
            loadUserRes();
        });
    }
}
