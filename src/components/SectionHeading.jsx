import "../styles/section-heading.css";

function SectionHeading({ eyebrow, title, highlight, description, align = "center" }) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title} {highlight && <span>{highlight}</span>}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

export default SectionHeading;
