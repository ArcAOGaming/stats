import { Link } from 'react-router-dom'
import './Home.css'

function Home() {

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>CipherPlay Stats</h1>
          <p className="hero-description">
            Real-time analytics for CipherPlay & its products
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

          <Link to="/pi" className="card">
            <div className="card-content">
              <div className="card-icon">π</div>
              <h3>PI Dashboard</h3>
              <p>PI delegation preferences, mint reports, and network analytics from the AO network</p>
            </div>
            <div className="card-footer">
              <span className="card-action">View Dashboard</span>
            </div>
          </Link>

          <Link to="/rune-realm" className="card">
            <div className="card-content">
              <div className="card-icon">⚡</div>
              <h3>RuneRealm Dashboard</h3>
              <p>RuneRealm analytics and performance metrics from the AO network</p>
            </div>
            <div className="card-footer">
              <span className="card-action">View Dashboard</span>
            </div>
          </Link>

          <Link to="/user-search" className="card">
            <div className="card-content">
              <div className="card-icon">🔍</div>
              <h3>User Search</h3>
              <p>Search and analyze user profiles and delegation information by wallet address</p>
            </div>
            <div className="card-footer">
              <span className="card-action">Search Users</span>
            </div>
          </Link>

          <Link to="/pi-compounder" className="card">
            <div className="card-content">
              <div className="card-icon">🔄</div>
              <h3>Pi-Compounder</h3>
              <p>Manage and withdraw AO and PI proceeds from Fair Launch Process</p>
            </div>
            <div className="card-footer">
              <span className="card-action">Manage Withdrawals</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
