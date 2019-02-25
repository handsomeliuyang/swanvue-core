
// import swanEvents from './events-emitter';
/* globals swanGlobal _naSwan */
// const doc = swanGlobal ? {} : document;
export default class Loader {
    constructor(basePath = '') {
        this.basePath = basePath;
        this.loadedResource = {
            js: {},
            css: {}
        };
    }
    loadjs(document, name) {
        const loadPath = this.basePath + '/' + name + '.js';
        if (this.loadedResource.js[loadPath]) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            // if (swanGlobal) {
            //     try {
            //         _naSwan.include(loadPath);
            //         // action && swanEvents(action);
            //     } catch (e) {
            //         reject(e);
            //         console.error(e);
            //     }
            //     resolve();
            // } else {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = loadPath;
                script.onload = () => {
                    this.loadedResource.js[loadPath] = true;
                    // action && swanEvents(action);
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            // }
        });
    }
    loadcss(document, name) {
        const loadPath = this.basePath + '/' + name + '.wxss';
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
                // action && swanEvents(action);
                resolve();
            };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    loadJson(name){
        const loadPath = this.basePath + '/' + name + '.json';
        return fetch(loadPath)
                    .then(function(response) {
                        return response.text();
                    });
    }
    loadWxml(name){
        const loadPath = this.basePath + '/' + name + '.wxml';
        return fetch(loadPath)
            .then((response)=>{
                return response.text();
            })
            .then((text)=>{
                return {
                    name: name,
                    wxml: text
                };
            });
    }
    // TODO other files type
}
