import { Leaf, Heart, Sprout, UsersRound } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import "../styles/about.css";

const values = [
  { icon: Sprout, title: "Seasonal by nature", text: "Our menu follows the seasons and celebrates ingredients at their best." },
  { icon: Heart, title: "Care in every detail", text: "From the first hello to the last bite, hospitality is our favorite ingredient." },
  { icon: Leaf, title: "A lighter footprint", text: "We aim to source thoughtfully, waste less, and make better everyday choices." },
  { icon: UsersRound, title: "A table for everyone", text: "Come for a quick lunch, a long catch-up, or a meal worth remembering." },
];

function About() {
  return (
    <div className="page-shell about-page">
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">OUR STORY</p>
          <h1>Food tastes better<br /><em>when it brings us together.</em></h1>
          <p>We started Bite & Bloom with one simple idea: a neighborhood table should feel like a little bit of home.</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container about-story-grid">
          <div className="about-story-image">
            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=85" alt="Cozy restaurant interior" />
          </div>
          <div className="about-story-copy">
            <p className="eyebrow">A LITTLE ABOUT US</p>
            <h2>Not fancy. Just <em>thoughtful.</em></h2>
            <p>Bite & Bloom is a small restaurant built around honest food, welcoming service, and the joy of gathering. We cook with the seasons, keep our ingredients in the spotlight, and believe a good meal can turn an ordinary day around.</p>
            <p>Whether you're stopping by between errands or celebrating something special, we're glad you're here.</p>
            <div className="about-signature"><span className="signature-mark"><Leaf size={22} /></span><span><strong>The Bite & Bloom team</strong><small>Cooking with care, every day</small></span></div>
          </div>
        </div>
      </section>

      <section className="values-section section-pad">
        <div className="container">
          <SectionHeading eyebrow="WHAT MATTERS TO US" title="Our little" highlight="big values" description="The things that guide our kitchen, our choices, and the way we welcome you." />
          <div className="values-grid">
            {values.map(({ icon: Icon, title, text }) => (
              <article className="value-card" key={title}>
                <span className="value-icon"><Icon size={22} /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
