import GalleryCard from "../GalleryCard/GalleryCard";
import gallery from "../../data/gallery";
import "./Gallery.css";

function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <h2>Sports Gallery</h2>

      <div className="gallery-container">
        {gallery.map((item) => (
          <GalleryCard
            key={item.id}
            image={item.image}
            title={item.title}
            imageCredit={item.imageCredit}
            imageSourceUrl={item.imageSourceUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Gallery;
