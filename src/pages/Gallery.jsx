import Layout from "../components/Layout/Layout";
import GalleryCard from "../components/GalleryCard/GalleryCard";
import PageHeading from "../components/PageHeading/PageHeading";
import gallery from "../data/gallery";
import "./Gallery.css";

function Gallery() {
  return (
    <Layout>
      <section className="gallery-page">

        <PageHeading
          eyebrow="MOMENTS THAT MATTERED"
          title="Sports Gallery"
          subtitle="Celebrating memorable moments of Indian women athletes."
        />

        <div className="gallery-grid">

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
    </Layout>
  );
}

export default Gallery;