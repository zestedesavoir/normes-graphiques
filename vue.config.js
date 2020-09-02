module.exports = {
  publicPath: '/palette/',

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
  }
}
