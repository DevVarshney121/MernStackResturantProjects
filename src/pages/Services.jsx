import { Clock3, Utensils, CalendarDays, PackageCheck } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import MenuCard from "../components/MenuCard.jsx";
import { menuItems } from "../data/menu.js";
import "../styles/services.css";

const services = [
  { icon: Utensils, title: "Dine in & unwind", text: "Settle into our cozy space for a relaxed lunch, a slow dinner, or a catch-up over something delicious." },
  { icon: PackageCheck, title: "Takeaway treats", text: "Taking the good stuff home? Ask our team about takeaway options for your favorites." },
  { icon: CalendarDays, title: "Small gatherings", text: "Planning a birthday lunch or a casual get-together? Tell us what you're imagining." },
];

function Services() {
  return (
    <div className="page-shell services-page">
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">GOOD THINGS, MADE FRESH</p>
          <h1>A menu for<br /><em>every kind of day.</em></h1>
          <p>Seasonal favorites, comforting classics, and little surprises from our kitchen.</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <SectionHeading eyebrow="A LOOK AT OUR MENU" title="Made fresh," highlight="served with love" description="A sample of the dishes we love to make. Menu and prices are illustrative for this frontend demo." />
          <div className="menu-grid services-menu-grid">
            {menuItems.map((item) => <MenuCard key={item.name} item={item} />)}
          </div>
          <p className="menu-note"><LeafIcon /> Ingredients and availability may vary with the season.</p>
        </div>
      </section>

      <section className="services-offerings section-pad">
        <div className="container">
          <SectionHeading eyebrow="HOW WE CAN HOST YOU" title="More than a" highlight="meal" description="A warm welcome, whether you're here for five minutes or the whole evening." />
          <div className="service-grid">
            {services.map(({ icon: Icon, title, text }) => (
              <article className="service-card" key={title}>
                <span className="service-icon"><Icon size={23} /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
          <div className="hours-strip"><Clock3 size={21} /><span><strong>Come by when you're hungry</strong><small>Tuesday–Sunday · 12 PM–10 PM · Closed Mondays</small></span></div>
        </div>
      </section>
    </div>
  );
}

function LeafIcon() {
  return <span aria-hidden="true">✳</span>;
}

export default Services;
