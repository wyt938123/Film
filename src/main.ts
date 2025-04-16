import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './assets/tailwind.css'
import App from './App.vue'
import 'wc-waterfall'
import lazy from './directives/lazy'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('lazy', lazy)
app.mount('#app')
