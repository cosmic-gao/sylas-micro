<template>
  <div class="sub-app-container">
    <WujieVue
      name="sub-app2"
      :url="subAppUrl"
      :sync="true"
      :alive="true"
      width="100%"
      height="100%"
    />
  </div>
</template>

<script>
import WujieVue from 'wujie-vue2'

export default {
  name: 'SubApp2',
  components: {
    WujieVue
  },
  computed: {
    subAppUrl() {
      // 获取完整路径，去掉 /sub-app2 前缀
      const fullPath = this.$route.fullPath
      const subPath = fullPath.replace(/^\/sub-app2/, '') || '/'
      return `http://localhost:8002${subPath}`
    }
  }
}
</script>

<style scoped>
.sub-app-container {
  width: 100%;
  height: calc(100vh - 64px);
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a2e;
}
</style>

