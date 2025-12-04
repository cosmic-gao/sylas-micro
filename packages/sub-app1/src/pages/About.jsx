import './About.css'

function About() {
  return (
    <div className="about">
      <h2>关于子应用 1</h2>
      <div className="about-content">
        <p>
          这是 Sylas 微前端架构中的第一个子应用。它展示了如何使用 React 
          构建一个完全独立的应用，并通过 Wujie 微前端框架与主应用进行集成。
        </p>
        <div className="tech-stack">
          <h3>技术栈</h3>
          <ul>
            <li>⚛️ React 18</li>
            <li>🛣️ React Router 6</li>
            <li>⚡ Vite 5</li>
            <li>🎨 CSS3</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About

