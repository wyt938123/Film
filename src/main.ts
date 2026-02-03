import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './assets/tailwind.css'
import App from './App.vue'
import 'wc-waterfall'
import lazy from './directives/lazy'
import { initAdSdk } from './sdk/adConfig'

// 初始化神蓍广告 SDK
initAdSdk('demo_user_001', {
  appName: 'Film',
  version: '1.0.0'
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('lazy', lazy)
app.mount('#app')
