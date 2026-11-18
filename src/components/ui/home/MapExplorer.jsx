import { useMemo, useState } from "react";
import Icon from "../Icon.jsx";

const mapTileColumns = 5;
const mapTileRows = 3;

function MapSurface({
  panelRef,
  isDragging,
  setIsDragging,
  dragRef,
  mapPan,
  setMapPan,
  mapTiles,
  mapZoom,
  setMapZoom,
  projectedLocations,
  visibleLocationCount,
  selectedLocation,
  setSelectedLocation,
  minimumMapZoom,
  maximumMapZoom,
  initialMapZoom,
}) {
  return (
    <div
      ref={panelRef}
      className={`map-panel${isDragging ? " is-dragging" : ""}`}
      onPointerDown={(event) => {
        if (event.button !== 0 || event.target.closest("button, a")) return;
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          panX: mapPan.x,
          panY: mapPan.y,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        setMapPan({
          x: Math.max(-1.5, Math.min(1.5, drag.panX + ((event.clientX - drag.startX) / bounds.width) * mapTileColumns)),
          y: Math.max(-1.5, Math.min(1.5, drag.panY + ((event.clientY - drag.startY) / bounds.height) * mapTileRows)),
        });
      }}
      onPointerUp={(event) => {
        if (dragRef.current?.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setIsDragging(false);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        setIsDragging(false);
      }}
    >
      <div className="map-pan-layer">
        <div className="map-tile-layer" aria-hidden="true">
          {mapTiles.map((tile) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`https://tile.openstreetmap.org/${mapZoom}/${tile.x}/${tile.y}.png`}
              alt=""
              loading="lazy"
              decoding="async"
              style={{
                left: tile.left,
                top: tile.top,
                width: `${100 / mapTileColumns}%`,
                height: `${100 / mapTileRows}%`,
              }}
            />
          ))}
        </div>
        {projectedLocations.map(({ location, position, count, isSelected }) => (
          <button
            className={`map-pin${isSelected ? " is-selected" : ""}${count > 1 ? " is-cluster" : ""}`}
            key={location.id}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            type="button"
            aria-label={count > 1 ? `${count} destinasi berdekatan, pilih untuk memperbesar peta` : `Pilih ${location.name}`}
            aria-pressed={isSelected}
            onClick={() => {
              setSelectedLocation(location);
              setMapPan({ x: 0, y: 0 });
              if (count > 1 && mapZoom < maximumMapZoom) {
                setMapZoom((zoom) => Math.min(maximumMapZoom, zoom + 1));
              }
            }}
          >
            <span className="pin-dot">{count > 1 ? count : null}</span>
            {count === 1 && <span className="pin-name">{location.name}</span>}
          </button>
        ))}
      </div>
      <div className="map-legend">
        <span className="legend-dot" />
        <span>{visibleLocationCount} DESTINASI · ZOOM {mapZoom}</span>
      </div>
      <div className="map-zoom-controls" role="group" aria-label="Kontrol zoom peta">
        <button
          type="button"
          aria-label="Perbesar peta"
          title="Perbesar peta"
          disabled={mapZoom >= maximumMapZoom}
          onClick={() => setMapZoom((zoom) => Math.min(maximumMapZoom, zoom + 1))}
        ><Icon name="zoom-in" /></button>
        <span aria-live="polite">z{mapZoom}</span>
        <button
          type="button"
          aria-label="Perkecil peta"
          title="Perkecil peta"
          disabled={mapZoom <= minimumMapZoom}
          onClick={() => setMapZoom((zoom) => Math.max(minimumMapZoom, zoom - 1))}
        ><Icon name="zoom-out" /></button>
        <button
          className="map-zoom-reset"
          type="button"
          aria-label="Atur ulang zoom peta"
          title="Atur ulang zoom peta"
          disabled={mapZoom === initialMapZoom && mapPan.x === 0 && mapPan.y === 0}
          onClick={() => {
            setMapZoom(initialMapZoom);
            setMapPan({ x: 0, y: 0 });
          }}
        ><Icon name="reset" /></button>
      </div>
      <a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
        © OpenStreetMap
      </a>
    </div>
  );
}

function LocationInfoCard({ location, onNavigate, totalCount, compact = false }) {
  return (
    <aside className={`location-card${compact ? " location-card-compact" : ""}`} aria-live="polite">
      <div className="location-card-top">
        <span className="eyebrow eyebrow-light">{location.kind}</span>
        <span className="location-index">{location.id.padStart(3, "0")}<span> / {totalCount}</span></span>
      </div>
      <div className="location-card-content">
        <span className="location-island">{location.island}, Indonesia</span>
        <h3>{location.name}</h3>
        <p>{location.description}</p>
      </div>
      <div className="location-details">
        <div><span>STATUS</span><strong>{location.status}</strong></div>
        <div><span>KETINGGIAN</span><strong>{location.altitude}</strong></div>
        <div className="coordinate-row"><span>KOORDINAT</span><strong>{location.coordinates}</strong></div>
      </div>
      <button className="location-link" type="button" onClick={() => onNavigate(`/jelajah/${location.id}`)}>
        Lihat detail destinasi <Icon name="arrow-up-right" />
      </button>
    </aside>
  );
}

function MapExplorerPage({
  locations,
  activeFilter,
  chooseFilter,
  selectedLocation,
  setSelectedLocation,
  onNavigate,
  mapSurfaceProps,
}) {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    if (!normalizedQuery) return [];
    return locations
      .filter((location) => `${location.name} ${location.island}`.toLocaleLowerCase("id").includes(normalizedQuery))
      .slice(0, 7);
  }, [locations, query]);

  function selectLocation(location) {
    setSelectedLocation(location);
    setQuery(location.name);
    setIsSearchOpen(false);
  }

  return (
    <section className="full-map-page inner-page">
      <div className="full-map-shell page-width">
        <header className="full-map-header">
          <button className="full-map-back" type="button" onClick={() => onNavigate("/")}>
            <Icon name="arrow-left" /> Beranda
          </button>
          <div className="full-map-title">
            <span className="eyebrow">ATLAS INTERAKTIF · WGS84</span>
            <h1>Peta sebaran alam.</h1>
            <p>Jelajahi lokasi gunung dan bukit di seluruh Nusantara.</p>
          </div>
          <button
            className="full-map-search-toggle"
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-expanded={isSearchOpen}
          >
            <Icon name="zoom-in" /> Cari gunung
          </button>
        </header>

        {isSearchOpen && (
          <div className="full-map-search">
            <label htmlFor="full-map-search-input">Cari gunung atau wilayah</label>
            <input
              id="full-map-search-input"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Contoh: Rinjani, Papua..."
              autoFocus
            />
            {results.length > 0 && (
              <ul>
                {results.map((location) => (
                  <li key={location.id}>
                    <button type="button" onClick={() => selectLocation(location)}>
                      <span><strong>{location.name}</strong><small>{location.island}, Indonesia</small></span>
                      <span>{location.altitude}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && results.length === 0 && <p className="full-map-no-results">Tidak ada destinasi yang cocok.</p>}
          </div>
        )}

        <div className="full-map-filters" role="group" aria-label="Filter jenis destinasi">
          {["Semua", "Gunung", "Bukit"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "is-active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => chooseFilter(filter)}
            >{filter}</button>
          ))}
        </div>

        <div className="full-map-layout">
          <MapSurface {...mapSurfaceProps} />
          <LocationInfoCard
            location={selectedLocation}
            onNavigate={onNavigate}
            totalCount={locations.length}
            compact
          />
        </div>
        <p className="full-map-note">Peta dasar OpenStreetMap · Titik memakai koordinat WGS84 dataset NUSA. Peta ini memberi konteks lokasi dan bukan alat navigasi lapangan.</p>
      </div>
    </section>
  );
}

export { LocationInfoCard, MapExplorerPage, MapSurface };
