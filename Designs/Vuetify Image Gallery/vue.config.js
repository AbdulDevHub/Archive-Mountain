const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // build.sh sets BASE_PATH to the folder the static deploy serves this app from
  publicPath: process.env.BASE_PATH ?? '/',

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
})
