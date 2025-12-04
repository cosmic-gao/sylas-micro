import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <h2>欢迎来到子应用 1</h2>
        <p>这是一个基于 React 构建的微前端子应用</p>
      </div>
      
      <div className="info-cards">
        <div className="info-card">
          <div className="card-number">01</div>
          <h3>技术栈</h3>
          <p>React 18 + React Router 6 + Vite</p>
        </div>
        <div className="info-card">
          <div className="card-number">02</div>
          <h3>特点</h3>
          <p>独立开发、独立部署、独立运行</p>
        </div>
        <div className="info-card">
          <div className="card-number">03</div>
          <h3>集成</h3>
          <p>通过 Wujie 与主应用无缝集成</p>
        </div>
      </div>
    </div>
  )
}

export default Home

