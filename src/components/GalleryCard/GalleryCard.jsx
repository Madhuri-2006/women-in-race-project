import "./GalleryCard.css";

function GalleryCard({ image, title }) {
  return (
    <div className="gallery-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
    </div>
  );
}

export default GalleryCard;