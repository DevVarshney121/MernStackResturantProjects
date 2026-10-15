import { useState } from "react";
import { X } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import { galleryItems } from "../data/menu.js";
import "../styles/gallery.css";

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="page-shell gallery-page">
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="eyebrow">A TASTE OF THE EXPERIENCE</p>
          <h1>Little moments.<br /><em>Lovely memories.</em></h1>
          <p>A peek at the food, the atmosphere, and the small details that make us who we are.</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <SectionHeading eyebrow="THE BITE & BLOOM FEELING" title="A little look" highlight="around" description="Select any photo to view it larger." />
          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <button
                className={`gallery-item gallery-item-${index + 1}`}
                key={item.title}
                onClick={() => setSelectedImage(item)}
                aria-label={`View ${item.title}`}
              >
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="gallery-caption"><small>{item.category}</small><strong>{item.title}</strong></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.title} onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close image"><X size={24} /></button>
          <img src={selectedImage.image} alt={selectedImage.title} onClick={(event) => event.stopPropagation()} />
          <p>{selectedImage.title}</p>
        </div>
      )}
    </div>
  );
}

export default Gallery;
