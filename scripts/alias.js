const path = require('path');

const resolve = p=> path.resolve(__dirname, '../', p);

module.exports = {
    web: resolve('src/platforms/web')
};