import { useEffect, useRef, useState } from "react";
import { places } from "../pages/ExplorePage.jsx";
import Icon from "./ui/Icon.jsx";

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 4.5h11v16l-5.5-3.8-5.5 3.8v-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkDrawer({ favorites, onToggleFavorite, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const savedPlaces = favorites
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!drawerRef.current?.contains(event.target)) setIsOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function openPlace(id) {
    setIsOpen(false);
    onNavigate(`/jelajah/${id}`);
  }

  return (
    <div className={`bookmark-drawer${isOpen ? " is-open" : ""}`} ref={drawerRef}>
      <button
        className="bookmark-tab"
        type="button"
        aria-label={`Bookmark destinasi, ${savedPlaces.length} tersimpan`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? "saved-destinations" : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <BookmarkIcon />
        <span className="bookmark-tab-count" aria-hidden="true">{savedPlaces.length}</span>
      </button>
      {isOpen && (
        <section className="bookmark-panel" id="saved-destinations" role="dialog" aria-modal="false" aria-labelledby="bookmark-title">
          <header className="bookmark-panel-heading">
            <div>
              <span className="eyebrow eyebrow-light">KOLEKSI PRIBADI</span>
              <h2 id="bookmark-title">Destinasi tersimpan</h2>
            </div>
            <button className="bookmark-close" type="button" aria-label="Tutup bookmark" onClick={() => setIsOpen(false)}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          {savedPlaces.length > 0 ? (
            <ul className="bookmark-list">
              {savedPlaces.map((place) => (
                <li className="bookmark-item" key={place.id}>
                  <button className="bookmark-open" type="button" onClick={() => openPlace(place.id)}>
                    <span
                      className="bookmark-item-cover"
                      style={{ backgroundImage: `linear-gradient(90deg, rgb(9 24 15 / 78%), rgb(9 24 15 / 18%)), url("${place.image}")` }}
                    >
                      <span className="bookmark-item-copy">
                        <strong>{place.name}</strong>
                        <small>{place.location} · {place.elevation == null ? "Ketinggian belum tersedia" : `${place.elevation.toLocaleString("id-ID")} mdpl`}</small>
                      </span>
                      <Icon className="bookmark-arrow" name="arrow-up-right" />
                    </span>
                  </button>
                  <button
                    className="bookmark-remove"
                    type="button"
                    aria-label={`Hapus ${place.name} dari bookmark`}
                    onClick={() => onToggleFavorite(place.id)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bookmark-empty">
              <BookmarkIcon />
              <strong>Belum ada yang disimpan</strong>
              <p>Simpan gunung atau bukit dari kartu destinasi untuk melihatnya di sini.</p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate("/jelajah");
                }}
              >
                Jelajahi destinasi
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default BookmarkDrawer;
