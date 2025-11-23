import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-box">
        <section className="hero-section">
          <h1>Welcome to the Maps Application!</h1>
          <p className="hero-text">
            Navigate the world with precision and ease. Our Maps application makes it simple 
            to find routes between any two locations on Earth using longitude and latitude coordinates.
          </p>
        </section>

        <section className="feature-section">
          <div className="feature-card">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80" alt="Map with route planning" />
            </div>
            <h2>Map Querying</h2>
            <p>
              Our Maps application makes it easy for you to find the perfect route between any 
              two places on Earth! To get started, you'll need to know the longitude and latitude 
              coordinates of both your starting point and your destination. Don't worry if that 
              sounds complicated - it's actually pretty simple!
            </p>
            <p>
              Longitude and latitude are like a special address system for the entire planet. 
              Latitude tells you how far north or south you are from the equator, while longitude 
              tells you how far east or west you are. Together, these two numbers can pinpoint 
              any location on Earth with incredible accuracy!
            </p>
            <p>
              Once you've entered both sets of coordinates, our smart mapping system will calculate 
              the best route between your two points. The application will analyze different possible 
              paths and show you the most efficient way to get from Point A to Point B.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="User dashboard and analytics" />
            </div>
            <h2>Getting Started</h2>
            <p>
              Ready to start mapping? Create your free account by clicking "Sign Up" and entering 
              your email and password. Already have an account? Just click "Login" to access all 
              your saved routes and locations.
            </p>
            <ul>
              <li>Convert geographic locations to map tile coordinates (x, y, zoom level)</li>
              <li>Search for any city and automatically get its geographic boundaries</li>
              <li>Find routes between two geographic points</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80" alt="Person using maps on laptop" />
            </div>
            <h2>Why Choose Our Maps?</h2>
            <p>
              We combine cutting-edge technology with user-friendly design to deliver the best 
              navigation experience possible. Our application is built on reliable mapping data 
              and powerful algorithms that ensure you always get accurate, efficient routes.
            </p>
            <p>
              Whether you're a casual traveler, a professional navigator, or someone who just needs 
              to find their way around, our Maps application provides the tools you need. With support 
              for any location on Earth and an intuitive interface, we make navigation accessible to everyone.
            </p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Start Exploring?</h2>
          <p>Join thousands of users who trust Maps for their navigation needs.</p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button primary">Sign Up</a>
            <a href="/login" className="cta-button secondary">Log In</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;