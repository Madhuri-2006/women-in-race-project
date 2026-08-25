import Layout from "../components/Layout/Layout";
import GalleryCard from "../components/GalleryCard/GalleryCard";
import gallery from "../data/gallery";
import "./Gallery.css";

function Gallery() {
  return (
    <Layout>
      <section className="gallery-page">

        <h1>Sports Gallery</h1>

        <p className="gallery-subtitle">
          Celebrating memorable moments of Indian women athletes.
        </p>

        <div className="gallery-grid">

          {gallery.map((item) => (
            <GalleryCard
              key={item.id}
              image={item.image}
              title={item.title}
            />
          ))}

        </div>

      </section>
    </Layout>
  );
}

export default Gallery;