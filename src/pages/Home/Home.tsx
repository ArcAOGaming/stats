import { Link } from 'react-router-dom'
import './Home.css'

function Home() {

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>$GAME Stats</h1>
          <p className="hero-description">
            Real-time analytics and yield tracking for Fair Launch Processes
          </p>
        </div>
      </section>

      <section className="cards-section">
        <div className="cards-container">
          <Link to="/flp-yield" className="card">
            <div className="card-content">
              <div className="card-icon">📊</div>
              <h3>FLP Yield Dashboard</h3>
              <p>View real-time yield data and statistics for all Fair Launch Processes</p>
            </div>
            <div className="card-footer">
              <span className="card-action">View Dashboard</span>
            </div>
          </Link>

          <Link to="/game" className="card">
            <div className="card-content">
              <div className="card-icon">💰</div>
              <h3>GAME Dashboard</h3>
              <p>Track $GAME investment income and performance metrics</p>
            </div>
            <div className="card-footer">
              <span className="card-action">View Dashboard</span>
            </div>
          </Link>

          <Link to="/randao" className="card">
            <div className="card-content">
              <div className="card-icon">🎲</div>
              <h3>RANDAO Dashboard</h3>
              <p>Real-time visualization of RNG faucet sales data from the AO network</p>
            </div>
            <div className="card-footer">
              <span className="card-action">View Dashboard</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
