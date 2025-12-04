import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <h2>数据分析中心</h2>
        <p>子应用 2 - 专注于数据可视化与分析</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">2,847</div>
          <div className="stat-label">总用户数</div>
          <div className="stat-trend positive">↑ 12.5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">1,234</div>
          <div className="stat-label">活跃用户</div>
          <div className="stat-trend positive">↑ 8.3%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">98.6%</div>
          <div className="stat-label">系统可用性</div>
          <div className="stat-trend neutral">- 0.0%</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">156ms</div>
          <div className="stat-label">响应时间</div>
          <div className="stat-trend negative">↓ 23%</div>
        </div>
      </div>
    </div>
  )
}

export default Home

