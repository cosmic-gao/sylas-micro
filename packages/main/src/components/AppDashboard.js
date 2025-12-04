/**
 * AppDashboard Web Component
 * 独立的微前端仪表盘组件，集成 Wujie 微前端框架
 * 可以在任何项目中使用，无需依赖主应用框架
 */

// 动态加载 Wujie（如果未加载）
async function loadWujie() {
  // 如果已经加载，直接返回
  if (window.wujie) {
    return window.wujie
  }
  
  // 优先尝试使用本地模块导入
  try {
    const wujieModule = await import('wujie')
    // wujie 可能导出为 default 或者直接导出
    let wujie = wujieModule.default || wujieModule
    
    // 检查是否是对象，如果是对象，可能需要访问具体的 API
    if (wujie && typeof wujie === 'object') {
      // wujie 的 API 通常在对象上，如 wujie.start, wujie.destroy 等
      if (wujie.start || wujie.destroy) {
        window.wujie = wujie
        return wujie
      }
      // 如果对象有 default 属性
      if (wujie.default) {
        wujie = wujie.default
      }
    }
    
    window.wujie = wujie
    return wujie
  } catch (e) {
    console.warn('Failed to import Wujie locally, trying CDN:', e)
  }
  
  // 如果本地导入失败，尝试从 CDN 加载
  return new Promise((resolve, reject) => {
    // 再次检查，可能在异步过程中已经加载
    if (window.wujie) {
      resolve(window.wujie)
      return
    }
    
    // 检查是否已经有脚本在加载
    const existingScript = document.querySelector('script[src*="wujie"]')
    if (existingScript) {
      const checkWujie = setInterval(() => {
        if (window.wujie) {
          clearInterval(checkWujie)
          resolve(window.wujie)
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(checkWujie)
        if (!window.wujie) {
          reject(new Error('Wujie script loaded but not available on window'))
        }
      }, 5000)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/wujie@1.0.22/dist/index.umd.js'
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      // 等待 wujie 挂载到 window
      const checkWujie = setInterval(() => {
        if (window.wujie) {
          clearInterval(checkWujie)
          resolve(window.wujie)
        }
      }, 50)
      
      setTimeout(() => {
        clearInterval(checkWujie)
        if (window.wujie) {
          resolve(window.wujie)
        } else {
          reject(new Error('Wujie loaded but not available on window'))
        }
      }, 2000)
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Wujie from CDN'))
    }
    
    document.head.appendChild(script)
  })
}

class AppDashboard extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.apps = []
    this.currentApp = null
    this.wujie = null
    this.appContainer = null
    this.urlCleanInterval = null
  }

  static get observedAttributes() {
    return ['apps', 'mode']
  }

  async connectedCallback() {
    // 加载 Wujie
    try {
      this.wujie = await loadWujie()
      console.log('Wujie loaded successfully')
    } catch (error) {
      console.error('Failed to load Wujie:', error)
      // 显示错误提示
      this.shadowRoot.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #ff4757;">
          <h3>加载失败</h3>
          <p>无法加载 Wujie 微前端框架</p>
          <p style="font-size: 12px; color: #888;">${error.message}</p>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">
            请确保已安装 wujie 依赖或通过 CDN 加载
          </p>
        </div>
      `
      return
    }
    
    // 监听浏览器返回事件
    this.handlePopState = this.handlePopState.bind(this)
    window.addEventListener('popstate', this.handlePopState)
    
    this.loadApps()
    this.render()
    
    // 检查 URL 路径，如果存在则自动加载对应的应用
    this.checkUrlPath()
  }

  checkUrlPath() {
    // 等待渲染完成后再检查
    setTimeout(() => {
      const path = window.location.pathname
      const appMatch = path.match(/^\/app\/([^\/]+)/)
      if (appMatch) {
        const appId = appMatch[1]
        const app = this.apps.find(a => a.id === appId)
        if (app) {
          console.log('Auto-loading app from URL path:', appId)
          this.loadSubApp(app, false) // false 表示不更新 URL（因为已经在正确的 URL 上）
        }
      }
    }, 100)
  }

  disconnectedCallback() {
    // 清理事件监听
    if (this.handlePopState) {
      window.removeEventListener('popstate', this.handlePopState)
    }
  }

  handlePopState(event) {
    // 清理 URL 参数
    this.cleanUrlParams()
    
    // 当浏览器返回时，检查是否需要关闭或加载子应用
    const path = window.location.pathname
    const appMatch = path.match(/^\/app\/([^\/]+)/)
    const isAppPage = !!appMatch
    
    if (this.currentApp && !isAppPage) {
      // 如果当前有应用打开，但 URL 不再是应用页面，则关闭应用
      console.log('Browser back button clicked, closing app')
      this.closeApp(false) // false 表示不更新 URL（因为已经在正确的 URL 上）
    } else if (isAppPage) {
      // 如果 URL 是应用页面，但当前没有应用打开，则加载应用
      const appId = appMatch[1]
      const app = this.apps.find(a => a.id === appId)
      if (app && this.currentApp !== appId) {
        console.log('Browser forward/back to app page, loading app:', appId)
        this.loadSubApp(app, false) // false 表示不更新 URL（因为已经在正确的 URL 上）
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'apps' && oldValue !== newValue) {
      this.apps = this.parseApps(newValue)
      this.render()
    }
  }

  parseApps(appsString) {
    try {
      return JSON.parse(appsString || '[]')
    } catch (e) {
      return []
    }
  }

  loadApps() {
    const appsAttr = this.getAttribute('apps')
    if (appsAttr) {
      this.apps = this.parseApps(appsAttr)
    } else {
      // 默认应用列表，需要包含完整的 URL
      this.apps = [
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
  }

  async handleCardClick(event) {
    // 阻止事件冒泡
    event.stopPropagation()
    
    // 查找最近的 .card 元素
    let card = event.target.closest('.card')
    if (!card) {
      // 如果找不到，尝试从 currentTarget 获取
      card = event.currentTarget
    }
    
    if (!card) {
      console.warn('Card element not found')
      return
    }
    
    const appId = card.getAttribute('data-app-id')
    if (!appId) {
      console.warn('App ID not found on card')
      return
    }
    
    const app = this.apps.find(a => a.id === appId)
    
    if (!app || !app.url) {
      console.warn('App not found or URL missing:', { appId, app })
      return
    }

    // 如果点击的是当前应用，不重复加载
    if (this.currentApp === appId) {
      console.log('App already loaded:', appId)
      return
    }

    console.log('Loading app:', app)

    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('app-click', {
      detail: { appId, app },
      bubbles: true,
      composed: true
    }))

    // 加载子应用
    await this.loadSubApp(app)
  }

  async loadSubApp(app, updateUrl = true) {
    console.log('loadSubApp called with:', app)
    
    if (!this.wujie) {
      console.error('Wujie is not loaded')
      this.showError('Wujie 未加载，请刷新页面重试')
      return
    }

    console.log('Wujie object:', this.wujie)
    console.log('Wujie methods:', Object.keys(this.wujie))

    if (!this.appContainer) {
      console.error('App container not found')
      return
    }

    // 销毁之前的应用
    if (this.currentApp) {
      try {
        // 如果有保存的销毁函数，使用它
        if (this.destroyFn && typeof this.destroyFn === 'function') {
          this.destroyFn()
          this.destroyFn = null
        } else if (typeof this.wujie.destroyApp === 'function') {
          this.wujie.destroyApp(this.currentApp)
        } else if (typeof this.wujie.destroy === 'function') {
          this.wujie.destroy(this.currentApp)
        }
      } catch (e) {
        console.warn('Failed to destroy previous app:', e)
      }
    }

    // 清空容器内容
    this.appContainer.innerHTML = ''

    // 显示应用容器，隐藏卡片列表
    const appContainerElement = this.shadowRoot.getElementById('app-container')
    const dashboardView = this.shadowRoot.getElementById('dashboard-view')
    
    if (appContainerElement) {
      appContainerElement.style.display = 'block'
    }
    
    if (dashboardView) {
      dashboardView.classList.add('hide')
    }
    
    this.currentApp = app.id

    // 添加浏览器历史记录，支持返回按钮（使用真实路径）
    if (updateUrl !== false) {
      const state = { appId: app.id, appName: app.name }
      const url = `/app/${app.id}`
      window.history.pushState(state, app.name, url)
    }

    // 更新标题
    const appTitle = this.shadowRoot.getElementById('app-title')
    if (appTitle) {
      appTitle.textContent = app.name
    }

    // 加载新应用
    try {
      console.log('Starting to load app:', app.url)
      console.log('Wujie object:', this.wujie)
      console.log('Wujie methods:', Object.keys(this.wujie))
      
      // 检查 wujie API - wujie 原生 API 使用 startApp
      if (typeof this.wujie.startApp === 'function') {
        console.log('Using wujie.startApp method')
        const destroyFn = await this.wujie.startApp({
          name: app.id,
          url: app.url,
          el: this.appContainer,
          sync: false, // 禁用路由同步，避免在 URL 上添加查询参数
          alive: true,
          fetch: window.fetch
        })
        console.log('App loaded successfully, destroy function:', destroyFn)
        // 保存销毁函数
        this.destroyFn = destroyFn
      } else if (typeof this.wujie.start === 'function') {
        console.log('Using wujie.start method')
        await this.wujie.start({
          name: app.id,
          url: app.url,
          el: this.appContainer,
          sync: false, // 禁用路由同步，避免在 URL 上添加查询参数
          alive: true,
          fetch: window.fetch
        })
        console.log('App loaded successfully')
      } else {
        throw new Error(`Wujie API not found. Available methods: ${Object.keys(this.wujie).join(', ')}`)
      }
      
      // 清理 URL 中的查询参数（如果 Wujie 已经添加了）
      // 延迟清理，确保 Wujie 的路由同步完成
      setTimeout(() => {
        this.cleanUrlParams()
      }, 100)
      
      // 定期清理 URL 参数（防止 Wujie 持续添加）
      if (this.urlCleanInterval) {
        clearInterval(this.urlCleanInterval)
      }
      this.urlCleanInterval = setInterval(() => {
        this.cleanUrlParams()
      }, 500)
    } catch (error) {
      console.error('Failed to load sub app:', error)
      this.showError(`无法加载子应用: ${app.name}`, error.message, app.url)
    }
  }

  cleanUrlParams() {
    // 清理 URL 中的查询参数（Wujie 可能会添加）
    try {
      const url = new URL(window.location.href)
      const paramsToRemove = []
      
      // 检查是否有子应用的查询参数（如 ?sub-app1=, ?sub-app2=）
      url.searchParams.forEach((value, key) => {
        // 检查是否是子应用的 ID
        if (this.apps.some(app => app.id === key)) {
          paramsToRemove.push(key)
        }
      })
      
      // 移除这些参数
      if (paramsToRemove.length > 0) {
        paramsToRemove.forEach(key => {
          url.searchParams.delete(key)
        })
        
        // 使用 replaceState 更新 URL，不添加历史记录
        const newUrl = url.pathname + (url.search ? url.search : '') + (url.hash || '')
        const currentUrl = window.location.pathname + window.location.search + window.location.hash
        if (newUrl !== currentUrl) {
          window.history.replaceState(window.history.state, '', newUrl)
        }
      }
    } catch (e) {
      console.warn('Failed to clean URL params:', e)
    }
  }

  showError(title, message, url) {
    if (!this.appContainer) return
    
    this.appContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #ff4757;">
        <h3>${title}</h3>
        <p style="font-size: 14px; color: #888; margin: 10px 0;">${message || ''}</p>
        ${url ? `<p style="font-size: 12px; color: #888; margin-top: 10px;">请确保子应用服务正在运行: ${url}</p>` : ''}
        <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background: #667eea; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
          刷新页面
        </button>
      </div>
    `
  }

  handleBackClick() {
    this.closeApp()
  }

  closeApp(updateUrl = true) {
    // 停止 URL 清理定时器
    if (this.urlCleanInterval) {
      clearInterval(this.urlCleanInterval)
      this.urlCleanInterval = null
    }
    
    // 清理 URL 参数
    this.cleanUrlParams()
    
    // 隐藏应用容器，显示卡片列表
    const appContainerElement = this.shadowRoot.getElementById('app-container')
    const dashboardView = this.shadowRoot.getElementById('dashboard-view')
    
    if (appContainerElement) {
      appContainerElement.style.display = 'none'
    }
    
    if (dashboardView) {
      dashboardView.classList.remove('hide')
    }
    
    // 清空容器内容
    if (this.appContainer) {
      this.appContainer.innerHTML = ''
    }
    
    // 销毁应用
    if (this.currentApp && this.wujie) {
      try {
        // 优先使用保存的销毁函数
        if (this.destroyFn && typeof this.destroyFn === 'function') {
          this.destroyFn()
          this.destroyFn = null
        } else if (typeof this.wujie.destroyApp === 'function') {
          this.wujie.destroyApp(this.currentApp)
        } else if (typeof this.wujie.destroy === 'function') {
          this.wujie.destroy(this.currentApp)
        }
      } catch (e) {
        console.warn('Failed to destroy app:', e)
      }
    }
    this.currentApp = null
    
    // 更新浏览器历史记录（如果当前在子应用页面）
    if (updateUrl) {
      const path = window.location.pathname
      if (path.startsWith('/app/')) {
        // 返回到根路径，并清理查询参数
        const cleanUrl = window.location.pathname.replace(/^\/app\/[^\/]+/, '/')
        window.history.replaceState(null, '', cleanUrl)
      }
    }
    
    this.dispatchEvent(new CustomEvent('app-close', {
      bubbles: true,
      composed: true
    }))
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          min-height: 100vh;
        }

        .dashboard-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        .dashboard-view {
          max-width: 1000px;
          margin: 0 auto;
          padding: 32px;
        }

        .hero {
          text-align: center;
          padding: 60px 0 40px;
        }

        .hero h1 {
          font-size: 42px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 16px 0;
        }

        .subtitle {
          font-size: 18px;
          color: #8888a0;
          margin: 0;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin: 40px 0;
        }

        .card {
          background: linear-gradient(145deg, #1a1a2e 0%, #1f1f3a 100%);
          border: 1px solid #2d2d44;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .card h3 {
          font-size: 20px;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .card p {
          color: #8888a0;
          font-size: 14px;
          margin: 0 0 12px 0;
        }

        .card-tech {
          color: #667eea;
          font-size: 12px;
          margin: 0 0 20px 0;
          font-weight: 500;
        }

        .card-btn {
          display: inline-block;
          padding: 10px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .card-btn:hover {
          opacity: 0.9;
        }

        .features {
          background: linear-gradient(145deg, #1a1a2e 0%, #1f1f3a 100%);
          border: 1px solid #2d2d44;
          border-radius: 16px;
          padding: 32px;
          margin-top: 20px;
        }

        .features h2 {
          font-size: 24px;
          color: #fff;
          margin: 0 0 24px 0;
          text-align: center;
        }

        .features ul {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin: 0;
          padding: 0;
        }

        .features li {
          font-size: 15px;
          color: #c0c0d0;
          padding: 12px 16px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
        }

        .app-container {
          position: relative;
          width: 100%;
          min-height: 600px;
          background: #0f0f23;
          border-radius: 16px;
          border: 1px solid #2d2d44;
          margin-top: 24px;
          display: none;
        }

        .app-header {
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #2d2d44;
        }

        .back-btn {
          padding: 8px 16px;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(102, 126, 234, 0.3);
        }

        .app-title {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .app-content {
          width: 100%;
          min-height: 600px;
          max-height: 80vh;
          overflow: auto;
        }

        .dashboard-view.hide {
          display: none;
        }
      </style>

      <div class="dashboard-container">
        <div class="dashboard-view" id="dashboard-view">
          <div class="hero">
            <h1>欢迎使用 Sylas 微前端</h1>
            <p class="subtitle">基于 Wujie 的现代微前端解决方案</p>
          </div>

          <div class="cards">
            ${this.apps.map(app => `
              <div class="card" data-app-id="${app.id}">
                <div class="card-icon">${app.icon}</div>
                <h3>${app.name}</h3>
                <p>${app.description}</p>
                ${app.tech ? `<p class="card-tech">${app.tech}</p>` : ''}
                <button class="card-btn">访问</button>
              </div>
            `).join('')}
          </div>

          <div class="features">
            <h2>特性</h2>
            <ul>
              <li>🚀 极速加载 - 基于 Vite 构建</li>
              <li>🔒 沙箱隔离 - CSS 和 JS 完全隔离</li>
              <li>🔄 预加载 - 子应用预加载，首屏秒开</li>
              <li>📦 技术栈无关 - Vue、React 任意组合</li>
            </ul>
          </div>
        </div>

        <div class="app-container" id="app-container">
          <div class="app-header">
            <button class="back-btn" id="back-btn">← 返回</button>
            <div class="app-title" id="app-title">子应用</div>
          </div>
          <div class="app-content" id="app-content"></div>
        </div>
      </div>
    `

    // 获取容器引用
    this.appContainer = this.shadowRoot.getElementById('app-content')
    const backBtn = this.shadowRoot.getElementById('back-btn')

    // 绑定事件
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBackClick())
    }
    
    // 绑定卡片点击事件 - 使用事件委托
    const cardsContainer = this.shadowRoot.querySelector('.cards')
    if (cardsContainer) {
      cardsContainer.addEventListener('click', (e) => {
        // 检查点击的是卡片或卡片内的元素
        const card = e.target.closest('.card')
        if (card) {
          this.handleCardClick(e)
        }
      })
    }
    
    // 也可以直接绑定到每个卡片
    const cards = this.shadowRoot.querySelectorAll('.card')
    cards.forEach(card => {
      card.addEventListener('click', (e) => this.handleCardClick(e))
    })
  }
}

// 注册 Web Component
if (!customElements.get('app-dashboard')) {
  customElements.define('app-dashboard', AppDashboard)
}

export default AppDashboard
