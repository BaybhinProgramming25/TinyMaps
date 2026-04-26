import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-logo">Tiny Maps</h2>
        <div className="footer-contact">+1 (800) MAPS</div>
      </div>
      <div className="footer-bottom">
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
        <div className="footer-copyright">
          <p>© 2025 Maps Application. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;