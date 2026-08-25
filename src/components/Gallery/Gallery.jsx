import "./Gallery.css";

function Gallery() {
  return (
<section className="gallery" id="gallery">
      <h2>Sports Gallery</h2>

      <div className="gallery-container">

        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500"
          alt="Sports 1"
        />

        <img
          src="https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=500"
          alt="Sports 2"
        />

        <img
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500"
          alt="Sports 3"
        />

        <img
          src="https://images.unsplash.com/photo-1526676037777-05a232554f77?w=500"
          alt="Sports 4"
        />

      </div>

    </section>
  );
}

export default Gallery;