import SearchBar from "../SearchBar.jsx";
import Icon from "../Icon.jsx";

function HeroSection({ title = "Mengenal Alam Mengabadikan Keindahan.", description, query = "", onQueryChange, onExplore }) {
  return (
    <section className="hero-section-component">
      <div className="page-width hero-section-content">
        <span className="eyebrow eyebrow-light">ATLAS ALAM INDONESIA</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {onQueryChange && <SearchBar value={query} onChange={onQueryChange} label="Cari destinasi alam" />}
        {onExplore && <button className="button button-lime" type="button" onClick={onExplore}>Jelajahi atlas <Icon name="arrow-up-right" /></button>}
      </div>
    </section>
  );
}

export default HeroSection;