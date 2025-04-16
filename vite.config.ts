import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 预先加载UI 组件库
import Components from 'unplugin-vue-components/vite'
// 引入vant组件  编译阶段  按需加载
import { VantResolver} from '@vant/auto-import-resolver'
import path from 'path'

//console.log(__dirname, path.resolve(__dirname, 'src'))
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
