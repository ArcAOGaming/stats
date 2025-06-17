import { useEffect, useRef } from 'react'
import FLPYield from '../FLPYield'
import './Home.css'

function Home() {
  const aboutRef = useRef<HTMLDivElement>(null)

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Fair Launch Process Stats</h1>
          <p className="hero-description">
            Real-time analytics and yield tracking for Fair Launch Processes
          </p>
          <button onClick={scrollToAbout} className="scroll-button">
            Learn More
          </button>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <FLPYield />
        </div>
      </section>

      <section ref={aboutRef} className="about-section">
        <div className="about-container">
          <h2>About Fair Launch Processes</h2>
          <div className="about-content">
            <p>
              Fair Launch Processes (FLPs) represent a revolutionary approach to token distribution
              and project launches in the blockchain space. These processes ensure equitable
              participation and transparent distribution mechanisms.
            </p>
            <p>
              Each FLP is designed with specific parameters and yield mechanisms, allowing
              participants to engage with the protocol in a fair and decentralized manner.
              The above graph shows the manual AO yield distribution across different FLPs
              over time.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
