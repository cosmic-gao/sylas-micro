import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { setupWujie } from './wujie'
// 导入 wujie 并挂载到 window，供 Web Component 使用
import wujie from 'wujie'
if (!window.wujie) {
  window.wujie = wujie
}
import './components/AppDashboard.js' // 注册 Web Component

setupWujie(Vue)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

