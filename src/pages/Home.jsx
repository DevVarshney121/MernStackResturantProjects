import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Leaf, Clock3, HeartHandshake } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import MenuCard from "../components/MenuCard.jsx";
import { menuItems } from "../data/menu.js";
import "../styles/home.css";

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-background" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> GOOD FOOD, GOOD MOOD</p>
            <h1>Fresh flavors.<br /><span>Full hearts.</span></h1>
            <p className="hero-description">
              A little neighborhood restaurant with seasonal plates,
              ingredients we believe in, and a seat saved just for you.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/services">Explore our menu <ArrowRight size={17} /></Link>
              <Link className="text-link" to="/about">Our story <ArrowDownRight size={17} /></Link>
            </div>
            <div className="hero-note">
              <span className="hero-note-icon"><Leaf size={19} /></span>
              <span><strong>Made fresh, every day</strong><small>Local ingredients · Thoughtful cooking</small></span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-food-image"
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1300&q=90"
              alt="A fresh, colorful seasonal meal"
            />
            <div className="hero-stamp"><span>GOOD FOOD</span><strong>♡</strong><span>GOOD PEOPLE</span></div>
            <div className="hero-floating-card">
              <span className="floating-card-icon"><Clock3 size={19} /></span>
              <span><strong>Lunch, made lovely</strong><small>Every day from 12 PM</small></span>
            </div>
          </div>
        </div>
        <div className="hero-bottom-line"><span>SEASONAL</span><span>LOCAL</span><span>MADE WITH LOVE</span><span>ALWAYS WELCOMING</span></div>
      </section>

      <section className="home-intro section-pad">
        <div className="container intro-grid">
          <div className="intro-image-wrap">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1100&q=85" alt="Warm restaurant table setting" loading="lazy" />
            <span className="image-caption">Come as you are. Leave a little happier.</span>
          </div>
          <div className="intro-copy">
            <p className="eyebrow">A PLACE AT OUR TABLE</p>
            <h2>Simple ingredients.<br /><em>Beautiful moments.</em></h2>
            <p>We believe the best meals aren't just about what's on the plate. They're about slowing down, sharing stories, and making everyday moments feel special.</p>
            <div className="intro-values">
              <div><span><Leaf size={19} /></span><strong>Seasonal & local</strong></div>
              <div><span><HeartHandshake size={19} /></span><strong>Made with care</strong></div>
            </div>
            <Link className="text-link" to="/about">Get to know us <ArrowRight size={17} /></Link>
          </div>
          
        </div>
      </section>

      <section className="featured-menu section-pad">
        <div className="container">
          <SectionHeading eyebrow="A FEW HOUSE FAVORITES" title="Good things are" highlight="on the menu" description="Thoughtful plates, bright flavors, and a little something for every kind of appetite." />
          <div className="menu-grid">
            {menuItems.map((item) => <MenuCard key={item.name} item={item} />)}
          </div>
          <div className="center-action"><Link className="button button-outline" to="/services">See our full menu <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container home-cta-inner">
          <div><p className="eyebrow">YOUR TABLE IS WAITING</p><h2>Make room for<br /><em>something delicious.</em></h2></div>
          <Link className="button button-light" to="/contact">Plan your visit <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
