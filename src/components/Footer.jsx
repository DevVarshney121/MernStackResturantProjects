import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram, Facebook, Leaf } from "lucide-react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark"><Leaf size={21} /></span>
            <span>Bite <em>&</em> Bloom</span>
          </Link>
          <p>Seasonal ingredients, thoughtful cooking, and a table always waiting for you.</p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
          </div>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/about">Our story</Link>
          <Link to="/services">Services</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-column">
          <h3>Visit us</h3>
          <p>24 Garden Lane<br />Your City, IN 110001</p>
          <a href="mailto:hello@biteandbloom.example">hello@biteandbloom.example <ArrowUpRight size={14} /></a>
          <p>Tue–Sun · 12 PM–10 PM</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Bite & Bloom. All rights reserved.</span>
        <span>Made with care, served with love.</span>
      </div>
    </footer>
  );
}

export default Footer;
