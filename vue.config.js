module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.module
      .rule('txt')
      .test(/\.txt$/)
      .use('file-loader')
      .loader('file-loader')
      .end()
  }
}