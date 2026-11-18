function RegionalDirectory({ places, selectedRegion, onSelectRegion }) {
  const regions = [...new Map(places.map((place) => [place.region, place.regionLabel])).entries()]
    .map(([id, label]) => ({
      id,
      label,
      count: places.filter((place) => place.region === id).length,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));

  return (
    <section className="regional-directory page-width" aria-labelledby="regional-directory-title">
      <div className="regional-directory-heading">
        <div>
          <span className="eyebrow">INDEKS NUSANTARA</span>
          <h2 id="regional-directory-title">Jelajah berdasarkan wilayah.</h2>
        </div>
        <p>{places.length} profil dalam {regions.length} wilayah.</p>
      </div>
      <div className="regional-directory-grid">
        {regions.map((region) => (
          <button
            className={selectedRegion === region.id ? "regional-directory-item is-active" : "regional-directory-item"}
            key={region.id}
            type="button"
            aria-pressed={selectedRegion === region.id}
            onClick={() => {
              onSelectRegion(selectedRegion === region.id ? "semua" : region.id);
              document.querySelector(".catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <span>{region.label}</span>
            <strong>{region.count}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

export default RegionalDirectory;