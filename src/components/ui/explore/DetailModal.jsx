import { useEffect } from "react";
import FallbackCover from "../FallbackCover.jsx";
import Icon from "../Icon.jsx";

function DetailModal({ place, onClose, onOpenDetail }) {
  useEffect(() => {
    if (!place) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [place, onClose]);

  if (!place) return null;

  return (
    <div className="detail-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
        <button className="detail-modal-close" type="button" onClick={onClose} aria-label="Tutup detail">×</button>
        <FallbackCover src={place.image} alt={`Bentang alam ${place.name}`} className="detail-modal-image" />
        <div className="detail-modal-copy">
          <span className="eyebrow">{place.regionLabel} · {place.location}</span>
          <h2 id="detail-modal-title">{place.name}</h2>
          <p>{place.summary}</p>
          <div className="detail-modal-facts">
            <span>Ketinggian <strong>{place.elevation == null ? "Belum tersedia" : `${place.elevation.toLocaleString("id-ID")} mdpl`}</strong></span>
            <span>Koordinat <strong>{place.coordinates}</strong></span>
          </div>
          <button className="button button-lime" type="button" onClick={() => onOpenDetail(place)}>Buka profil lengkap <Icon name="arrow-up-right" /></button>
        </div>
      </section>
    </div>
  );
}

export default DetailModal;