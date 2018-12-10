const path = require('path');
const replace = require('rollup-plugin-replace');

const aliases = require('./alias');
const resolve = p=>{
    const base = p.split('/')[0];
    if(aliases[base]){
        return path.resolve(aliases[base], p.slice(base.length+1));
    } else {
        return path.resolve(__dirname, '../', p);
    }
};

const builds = {
    'web-full-dev':{
        entry: resolve('web/entry-runtime-with-compiler.js'),
        dest: resolve('dist/diyvue.js'),
        format: 'umd',
        env: 'development'
    }
};


function genConfig(name) {
    const opts = builds[name];
    const config = {
        input: opts.entry,
        plugins:[

        ],
        output: {
            file: opts.dist,
            format: opts.format,
            name: opts.moduleName || 'DiyVue'
        }
    };

    if(opts.env){
        config.plugins.push(replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env)
        }));
    }

    return config;
}

if (process.env.TARGET){
    module.exports = genConfig(process.env.TARGET);
} else {
    // TODO-ly 处理不带环境变量的情况
}
