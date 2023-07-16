const path = require('path');
const pkg = require('./package.json');

if (process.env.VUE_APP_NAME === undefined && pkg.name !== undefined)
    process.env.VUE_APP_NAME = pkg.name;
if (process.env.VUE_APP_VERSION === undefined && pkg.version !== undefined)
    process.env.VUE_APP_VERSION = pkg.version;

module.exports = {
    transpileDependencies: ['vuetify', '@zenetys/ztable'],
    publicPath: '',
    css: {
        extract: false,
    },
    chainWebpack: (config) => {
        config.module
            .rule('images')
            .use('url-loader')
            .loader('url-loader')
            .tap((options) => Object.assign(options, { limit: 10240 }));
        config.resolve.alias
            .set('@', path.resolve(__dirname, './src'))
            .set('@public', path.resolve(__dirname, './public/'));
    },
}
