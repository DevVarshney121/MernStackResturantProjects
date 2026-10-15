import { ArrowUpRight } from "lucide-react";
import "../styles/menu-card.css";

function MenuCard({ item }) {
  return (
    <article className="menu-card">
      <div className="menu-card-image">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span className="menu-price">₹{item.price}</span>
      </div>
      <div className="menu-card-content">
        <div>
          <p className="menu-category">{item.category}</p>
          <h3>{item.name}</h3>
        </div>
        <p className="menu-description">{item.description}</p>
        <a className="menu-card-link" href="/contact" onClick={(event) => {
          event.preventDefault();
          window.location.href = "/contact";
        }}>
          Ask about this dish <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}

export default MenuCard;
