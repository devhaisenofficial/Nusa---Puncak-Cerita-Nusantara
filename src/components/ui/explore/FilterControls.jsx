function FilterControls({ categories, category, onCategoryChange, regions, region, onRegionChange, sort, onSortChange, onReset, pageSize, onPageSizeChange }) {
  return (
    <div className="catalog-toolbar">
      <div className="category-pills" role="group" aria-label="Kategori gunung dan bukit">
        {categories.map(([id, label]) => (
          <button
            className={category === id ? "category-pill is-active" : "category-pill"}
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => onCategoryChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="catalog-controls">
        <label><span>Tampilkan</span><select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)}>
          <option value="10">10 destinasi</option>
          <option value="50">50 destinasi</option>
          <option value="100">100 destinasi</option>
          <option value="all">Semua destinasi</option>
        </select></label>
        <label><span>Wilayah</span><select value={region} onChange={(event) => onRegionChange(event.target.value)}>
          {regions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
        <label><span>Urutkan</span><select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="elevation-desc">Elevasi tertinggi</option>
          <option value="elevation-asc">Elevasi terendah</option>
          <option value="name">Nama A–Z</option>
        </select></label>
        <button className="reset-button" type="button" onClick={onReset}>Atur ulang</button>
      </div>
    </div>
  );
}

export default FilterControls;