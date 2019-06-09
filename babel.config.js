module.exports = api => {
  api.cache(true)

  return {
    ignore: [/node_modules/],
    presets: ['@babel/preset-react'],
    plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]],
    env: {
      test: {
        presets: ['@babel/preset-env']
      }
    }
  }
}
