import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className='home'>

      <section className='hero'>
        <h1>Tiny Maps</h1>
        <p className='tagline'>Offline walking and cycling navigation that actually works.</p>
        <div className='hero-actions'>
          <Link to='/signup' className='btn-primary'>Get Started</Link>
          <Link to='/login' className='btn-secondary'>Log In</Link>
        </div>
      </section>

      <section className='problem'>
        <h2>The Problem with Google Maps Offline</h2>
        <p>
          Google Maps lets you download areas for offline use — but only for driving.
          Try to get walking or cycling directions without a signal and you're out of luck.
          For hikers, cyclists, and travellers in areas with poor connectivity, that's a serious gap.
        </p>
      </section>

      <section className='features'>
        <div className='feature-card'>
          <h3>Walking Routes</h3>
          <p>Get accurate pedestrian directions optimised for footpaths, crossings, and walkable roads.</p>
        </div>
        <div className='feature-card'>
          <h3>Cycling Routes</h3>
          <p>Find the best cycling paths whether you're commuting through a city or riding cross-country.</p>
        </div>
        <div className='feature-card'>
          <h3>Works Offline</h3>
          <p>Download a region before you leave. Your maps, routes, and directions are available without any signal.</p>
        </div>
      </section>

    </div>
  );
};

export default Home;
