import { useState } from "react";
import "./GalleryCard.css";

function GalleryCard({ image, title, imageCredit, imageSourceUrl }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="gallery-card">
      {image && !failed ? (
        <img src={image} alt={title} onError={() => setFailed(true)} />
      ) : (
        <div className="gallery-card-fallback">{title}</div>
      )}

      <h3>{title}</h3>

      {image && !failed && imageCredit && (
        <p className="gallery-card-credit">
          {imageSourceUrl ? (
            <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">
              {imageCredit}
            </a>
          ) : (
            imageCredit
          )}
        </p>
      )}
    </div>
  );
}

export default GalleryCard;
