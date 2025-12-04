# AppDashboard Web Component

一个完全独立的微前端仪表盘 Web Component，集成了 Wujie 微前端框架。可以在任何项目中使用，无需依赖主应用框架。

## 特性

- ✅ **完全独立** - 不依赖 Vue、React 等框架
- ✅ **集成 Wujie** - 内置 Wujie 微前端框架
- ✅ **Shadow DOM** - 样式完全隔离
- ✅ **可配置** - 通过属性传递应用列表
- ✅ **事件通信** - 支持自定义事件

## 使用方法

### 方式 1: 在 HTML 中直接使用

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/wujie@1.0.22/dist/index.umd.js"></script>
  <script type="module" src="./AppDashboard.js"></script>
</head>
<body>
  <app-dashboard id="dashboard"></app-dashboard>
  
  <script>
    const dashboard = document.getElementById('dashboard')
    
    // 配置应用列表
    const apps = [
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
    
    dashboard.setAttribute('apps', JSON.stringify(apps))
    
    // 监听事件
    dashboard.addEventListener('app-click', (e) => {
      console.log('App clicked:', e.detail)
    })
  </script>
</body>
</html>
```

### 方式 2: 在 Vue 项目中使用

```vue
<template>
  <app-dashboard :apps="appsJson"></app-dashboard>
</template>

<script>
import AppDashboard from './components/AppDashboard.js'

export default {
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
        }
      ]
    }
  },
  computed: {
    appsJson() {
      return JSON.stringify(this.apps)
    }
  }
}
</script>
```

### 方式 3: 在 React 项目中使用

```jsx
import { useEffect, useRef } from 'react'
import AppDashboard from './components/AppDashboard.js'

function App() {
  const dashboardRef = useRef(null)
  
  const apps = [
    {
      id: 'sub-app1',
      name: '子应用 1',
      icon: '📱',
      description: '基于 React 构建的独立子应用',
      url: 'http://localhost:8001',
      tech: 'React 18 + React Router 6 + Vite'
    }
  ]
  
  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.setAttribute('apps', JSON.stringify(apps))
    }
  }, [])
  
  return <app-dashboard ref={dashboardRef}></app-dashboard>
}
```

## 应用配置格式

```javascript
{
  id: 'sub-app1',           // 应用唯一标识
  name: '子应用 1',          // 应用名称
  icon: '📱',                // 应用图标（emoji 或 HTML）
  description: '描述',       // 应用描述
  url: 'http://localhost:8001', // 子应用完整 URL
  tech: '技术栈信息'         // 技术栈（可选）
}
```

## 事件

- `app-click` - 当点击应用卡片时触发
  ```javascript
  {
    detail: {
      appId: 'sub-app1',
      app: { /* 应用配置对象 */ }
    }
  }
  ```

- `app-close` - 当关闭子应用时触发

## 依赖

- Wujie (可以通过 CDN 或 npm 安装)
  - CDN: `https://unpkg.com/wujie@1.0.22/dist/index.umd.js`
  - npm: `npm install wujie`

## 注意事项

1. 确保子应用服务正在运行
2. 子应用的 URL 必须是完整的 URL（包含协议和端口）
3. 子应用需要配置 CORS，允许跨域访问
4. Wujie 会自动处理路由同步和沙箱隔离

