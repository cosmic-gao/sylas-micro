import './Dashboard.css'

function Dashboard() {
  const data = [
    { day: '周一', value: 65 },
    { day: '周二', value: 78 },
    { day: '周三', value: 82 },
    { day: '周四', value: 70 },
    { day: '周五', value: 95 },
    { day: '周六', value: 55 },
    { day: '周日', value: 48 },
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="dashboard">
      <h2>数据仪表盘</h2>
      
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>本周访问量</h3>
          <div className="bar-chart">
            {data.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  >
                    <span className="bar-value">{item.value}</span>
                  </div>
                </div>
                <span className="bar-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="info-card">
          <h3>系统状态</h3>
          <ul className="status-list">
            <li>
              <span className="status-dot online"></span>
              <span>API 服务</span>
              <span className="status-tag">正常</span>
            </li>
            <li>
              <span className="status-dot online"></span>
              <span>数据库</span>
              <span className="status-tag">正常</span>
            </li>
            <li>
              <span className="status-dot online"></span>
              <span>缓存服务</span>
              <span className="status-tag">正常</span>
            </li>
            <li>
              <span className="status-dot warning"></span>
              <span>消息队列</span>
              <span className="status-tag warning">延迟</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

