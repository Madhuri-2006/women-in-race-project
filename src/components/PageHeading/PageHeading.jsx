import "./PageHeading.css";

function PageHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="page-heading-eyebrow">{eyebrow}</p>}
      <h1 className="page-heading-title">{title}</h1>
      {subtitle && <p className="page-heading-subtitle">{subtitle}</p>}
    </div>
  );
}

export default PageHeading;
