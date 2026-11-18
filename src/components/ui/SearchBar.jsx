function SearchBar({ value, onChange, placeholder = "Cari nama atau lokasi", label = "Cari nama atau lokasi" }) {
  return (
    <label className="catalog-search">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </label>
  );
}

export default SearchBar;