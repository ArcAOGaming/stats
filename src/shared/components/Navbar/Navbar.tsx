import { Link, useLocation } from 'react-router-dom'
import { ConnectArweaveAOWalletButton } from '../ConnectArweaveAOWalletButton'
import './Navbar.css'

function Navbar() {
  const location = useLocation()

  // Check if the current path matches the link path
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">🎮</span>
        <span>CipherPlay Stats</span>
      </Link>

      <div className="navbar-links">
        <Link
          to="/flp-yield"
          className={`navbar-link ${isActive('/flp-yield') ? 'active' : ''}`}
        >
          FLP Yield
        </Link>
        <Link
          to="/game"
          className={`navbar-link ${isActive('/game') ? 'active' : ''}`}
        >
          GAME Dashboard
        </Link>
      </div>

      <div className="navbar-wallet">
        <ConnectArweaveAOWalletButton />
      </div>
    </nav>
  )
}

export default Navbar
