import { useRef, useState } from "react";
import FavoriteButton from "../FavoriteButton.jsx";
import PhotoCredit from "./PhotoCredit.jsx";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 24" fill="none">
      <path
        d="M2 5.2c0-1.22.98-2.2 2.2-2.2h6.45l2.2 2.4H23.8c1.22 0 2.2.98 2.2 2.2v11.2c0 1.22-.98 2.2-2.2 2.2H4.2A2.2 2.2 0 0 1 2 18.8V5.2Z"
        fill="currentColor"
        opacity=".18"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2.5 8h23" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function DestinationFolders({ destinations, favorites, onToggleFavorite, onNavigate }) {
  const [selectedId, setSelectedId] = useState(destinations[0]?.id ?? null);
  const tabRefs = useRef(new Map());
  const selectedDestination = destinations.find((destination) => destination.id === selectedId);

  if (!selectedDestination) return null;

  function handleTabKeyDown(event, index) {
    let nextIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % destinations.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + destinations.length) % destinations.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = destinations.length - 1;
    else return;

    event.preventDefault();
    const destination = destinations[nextIndex];
    setSelectedId(destination.id);
    tabRefs.current.get(destination.id)?.focus();
  }

  return (
    <div className="destination-folders reveal">
      <div className="destination-folder-stack" role="tablist" aria-label="Folder destinasi alam" aria-orientation="vertical">
        {destinations.map((destination, index) => (
          <button
            aria-controls="selected-destination"
            aria-selected={destination.id === selectedId}
            className={`destination-folder-tab${destination.id === selectedId ? " is-active" : ""}`}
            id={`destination-folder-${destination.id}`}
            key={destination.id}
            onClick={() => setSelectedId(destination.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(element) => {
              if (element) tabRefs.current.set(destination.id, element);
              else tabRefs.current.delete(destination.id);
            }}
            role="tab"
            tabIndex={destination.id === selectedId ? 0 : -1}
            type="button"
          >
            <FolderIcon />
            <span className="destination-folder-number">0{index + 1}</span>
            <span className="destination-folder-copy">
              <strong>{destination.title}</strong>
              <small>{destination.subtitle}</small>
            </span>
            <span className="destination-folder-kind">{destination.label}</span>
          </button>
        ))}
        <p className="destination-folder-hint">Pilih folder untuk membuka arsip destinasi.</p>
      </div>

      <article
        aria-labelledby={`destination-folder-${selectedDestination.id}`}
        className="destination-folder-detail"
        id="selected-destination"
        key={selectedDestination.id}
        role="tabpanel"
      >
        <div
          className="destination-folder-cover"
          style={{ backgroundImage: `url("${selectedDestination.image}")` }}
        >
          <span className="destination-folder-cover-label">{selectedDestination.label} · NUSANTARA</span>
          <FavoriteButton
            className="destination-favorite"
            placeName={selectedDestination.title}
            isSaved={favorites.includes(selectedDestination.id)}
            onToggle={() => onToggleFavorite(selectedDestination.id)}
          />
        </div>
        <div className="destination-folder-body">
          <span className="eyebrow">{selectedDestination.subtitle}</span>
          <h3>{selectedDestination.title}</h3>
          <p>{selectedDestination.description}</p>
          <PhotoCredit attribution={selectedDestination.imageCredit} />
          <button
            className="button button-forest destination-folder-open"
            onClick={() => onNavigate(`/jelajah/${selectedDestination.id}`)}
            type="button"
          >
            Buka detail lengkap <ArrowIcon />
          </button>
        </div>
      </article>
    </div>
  );
}
