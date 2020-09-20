module.exports = {
  publicPath: '/normes-graphiques/',

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: '../locales',
      enableInSFC: false
    }
  },

  pwa: {
    name: 'Zeste de Savoir – Compagnon d\'interface',
    themeColor: '#fcdc00',
    msTileColor: '#fcdc00',
    manifestOptions: {
      background_color: '#fcdc00'
    }
  },

  chainWebpack: config => {
    // Load the standard SASS files as text file to parse them
    config.module
      .rule('raw-loader')
      .test(/standards\/sass\/(.+)\.sass$/i)
      .use('raw-loader')
        .loader('raw-loader')
        .end()

    // Remove the SASS loader from these SASS files so the previous
    // rule is not… overruled.
    config.module
      .rule('sass')
        .exclude
          .add(/standards\/sass\/(.+)\.sass$/i)
          .end()
        .end()
  }
}
