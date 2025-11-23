import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-box">
        <h1>About Tiny Maps</h1>
        <p className="subtitle">Your trusted companion for navigation and route planning</p>
        
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              Tiny Maps is dedicated to making navigation simple and accessible for everyone. 
              We believe that finding your way from point A to point B should be effortless, 
              accurate, and reliable. 
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <ul>
              <li>Precise route calculation using longitude and latitude coordinates</li>
              <li>Interactible interface for quick navigation</li>
              <li>Support for searching locations anywhere on Earth</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why Choose Maps?</h2>
            <p>
              Whether you're planning a road trip, exploring new cities, or simply finding 
              the best route to your destination, Maps provides the tools you need. Our 
              coordinate-based system ensures pinpoint accuracy, while our intuitive 
              interface makes navigation accessible to everyone.
            </p>
          </section>

          <section className="about-section">
            <h2>Get Started Today</h2>
            <p>
              Ready to start exploring? Create a free account now!
            </p>
          </section>
        </div>

        <div className="about-footer">
          <p>Have questions? <a href="/contact">Contact us</a> anytime!</p>
        </div>
      </div>
    </div>
  );
}

export default About;
