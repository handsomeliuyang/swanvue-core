


function genConfig(name) {
    const opts = builds[name];
    const config = {
        input: opts.entry,
        output: {
            file: opts.dist,
            name: opts.moduleName || 'Diy'
        }

    };

    return config;
}

if (process.env.TARGET){
    module.exports = genConfig(process.env.TARGET);
} else {
    // TODO-ly 处理不带环境变量的情况
}
