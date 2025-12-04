<template>
  <div class="home">
    <app-dashboard 
      ref="dashboard" 
      :apps="appsJson"
    ></app-dashboard>
  </div>
</template>

<script>
import AppDashboard from '../components/AppDashboard.js'

export default {
  name: 'Home',
  data() {
    return {
      apps: [
        {
          id: 'sub-app1',
          name: '子应用 1',
          icon: '📱',
          description: '基于 React 构建的独立子应用',
          url: 'http://localhost:8001',
          tech: 'React 18 + React Router 6 + Vite'
        },
        {
          id: 'sub-app2',
          name: '子应用 2',
          icon: '📊',
          description: 'Dashboard 数据可视化应用',
          url: 'http://localhost:8002',
          tech: 'React 18 + React Router 6 + Vite'
        }
      ]
    }
  },
  computed: {
    appsJson() {
      return JSON.stringify(this.apps)
    }
  },
  mounted() {
    // 监听 Web Component 的自定义事件（可选，因为 Web Component 已经自己处理了）
    const dashboard = this.$refs.dashboard
    if (dashboard) {
      dashboard.addEventListener('app-click', this.handleAppClick)
      dashboard.addEventListener('app-close', this.handleAppClose)
    }
  },
  beforeDestroy() {
    // 清理事件监听
    const dashboard = this.$refs.dashboard
    if (dashboard) {
      dashboard.removeEventListener('app-click', this.handleAppClick)
      dashboard.removeEventListener('app-close', this.handleAppClose)
    }
  },
  methods: {
    handleAppClick(event) {
      // Web Component 已经自己处理了加载，这里只是监听
      console.log('App clicked:', event.detail)
    },
    handleAppClose() {
      console.log('App closed')
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
}
</style>

