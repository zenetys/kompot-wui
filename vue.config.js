process.env.VUE_APP_NAME = process.env.VUE_APP_NAME ?? require('./package.json').name;
process.env.VUE_APP_VERSION = process.env.VUE_APP_VERSION ?? require('./package.json').version;

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "publicPath": '',
  css: {
    extract: false,
  },
  chainWebpack: config => {
      config.module
        .rule('images')
          .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: 10240 }))
  },
}
