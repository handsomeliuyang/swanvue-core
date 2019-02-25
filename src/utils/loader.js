/**
 * @file load js or some other sources
 * @author houyu(houyu01@baidu.com)
 */
import swanEvents from './swan-events';
/* globals swanGlobal _naSwan */
// const doc = swanGlobal ? {} : document;
const doc = window.document;
export default class Loader {
    constructor(basePath = '') {
        this.basePath = basePath;
        this.loadedResource = {
            js: {},
            css: {}
        };
    }
    loadjs(src, action) {
        const loadPath = this.basePath + src;
        if (this.loadedResource.js[loadPath]) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            // if (swanGlobal) {
            //     try {
            //         _naSwan.include(loadPath);
            //         action && swanEvents(action);
            //     } catch (e) {
            //         reject(e);
            //         console.error(e);
            //     }
            //     resolve();
            // } else {
                const script = doc.createElement('script');
                script.type = 'text/javascript';
                script.src = loadPath;
                script.onload = () => {
                    this.loadedResource.js[loadPath] = true;
                    action && swanEvents(action);
                    resolve();
                };
                script.onerror = reject;
                doc.head.appendChild(script);
            // }
        });
    }
    loadcss(src, action) {
        const loadPath = this.basePath + src;
        if (this.loadedResource.js[loadPath]) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = loadPath;
            link.onload = () => {
                this.loadedResource.css[loadPath] = true;
                action && swanEvents(action);
                resolve();
            };
            link.onerror = reject;
            doc.head.appendChild(link);
        });
    }
    // TODO other files type
}
