import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <h1 className="home-hero-title">Offline Walking & Cycling Navigation That Actually Works</h1>
        <p className="home-hero-sub">
          Tiny Maps lets you download map regions and get walking or cycling routes
          without any signal — something Google Maps still can't do.
        </p>
        <div className="home-hero-ctas">
          <Link to="/signup" className="home-cta home-cta--primary">Get Started</Link>
          <Link to="/login" className="home-cta home-cta--secondary">Log In</Link>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <div className="home-feature-icon">🚶</div>
          <h2>Walking Routes</h2>
          <p>Accurate pedestrian directions optimised for footpaths, crossings, and walkable roads.</p>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-icon">🚴</div>
          <h2>Cycling Routes</h2>
          <p>Find the best cycling paths whether you're commuting through a city or riding cross-country.</p>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-icon">📡</div>
          <h2>Works Offline</h2>
          <p>Download a region before you leave. Your maps and routes are available without any signal.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
