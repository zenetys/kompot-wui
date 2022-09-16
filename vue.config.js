const path = require('path');

process.env.VUE_APP_NAME = process.env.VUE_APP_NAME ?? require('./package.json').name;
process.env.VUE_APP_VERSION = process.env.VUE_APP_VERSION ?? require('./package.json').version;

module.exports = {
    transpileDependencies: ['vuetify'],
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
