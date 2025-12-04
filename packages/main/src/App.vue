<template>
  <div class="app">
    <nav class="sidebar">
      <div class="logo">
        <h1>Sylas</h1>
      </div>
      <ul class="nav-menu">
        <li>
          <router-link to="/" class="nav-link">
            <span class="icon">🏠</span>
            <span>首页</span>
          </router-link>
        </li>
        <li>
          <router-link to="/sub-app1" class="nav-link">
            <span class="icon">📱</span>
            <span>子应用 1</span>
          </router-link>
        </li>
        <li>
          <router-link to="/sub-app2" class="nav-link">
            <span class="icon">📊</span>
            <span>子应用 2</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0f0f23;
  color: #e0e0e0;
  min-height: 100vh;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 24px 16px;
  border-right: 1px solid #2d2d44;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 40px;
}

.nav-menu {
  list-style: none;
}

.nav-menu li {
  margin-bottom: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  color: #a0a0b0;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 15px;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #fff;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: #fff;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.icon {
  font-size: 18px;
}

.content {
  flex: 1;
  padding: 32px;
  background: #0f0f23;
  overflow: auto;
}
</style>

