import { defineConfig } from 'vite'
import optimizer from '..'

export default defineConfig({
  root: __dirname,
  plugins: [
    optimizer({
      vue: `export const createApp = window.Vue.createApp;`,
    }, {
      // You can change the cache path here
      resolveId: id => id.replace('vue.js', 'foo/bar/vue.js'),
    }) as any,
  ],
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
})
