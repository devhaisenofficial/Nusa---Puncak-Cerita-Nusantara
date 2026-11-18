import FavoriteButton from "../../FavoriteButton.jsx";
import FallbackCover from "../FallbackCover.jsx";
import PhotoCredit from "../PhotoCredit.jsx";
import StatusBadge from "../StatusBadge.jsx";
import Icon from "../Icon.jsx";

function AlamCard({ place, isSaved = false, onToggleFavorite, onSelect }) {
  return (
    <article className="catalog-card reveal">
      <button className="catalog-cover" type="button" onClick={() => onSelect(place)}>
        <FallbackCover src={place.image} alt="Foto gunung dan perbukitan di Indonesia" />
        <span className="cover-shade" />
        <span className="cover-badges">
          <span>{place.type}</span>
          <StatusBadge status={place.status} />
        </span>
        <span className="cover-caption"><span>{place.location}</span><strong>{place.name}</strong></span>
        <span className="cover-height">{place.elevation == null ? "?" : place.elevation.toLocaleString("id-ID")} <small>MDPL</small></span>
      </button>
      <FavoriteButton className="catalog-favorite" placeName={place.name} isSaved={isSaved} onToggle={() => onToggleFavorite?.(place.id)} />
      <div className="catalog-card-body">
        <div className="catalog-facts">
          <div><span>KOORDINAT</span><strong>{place.coordinates}</strong></div>
          <div><span>WILAYAH</span><strong>{place.location}</strong></div>
        </div>
        <p>{place.summary}</p>
        <div className="catalog-card-footer">
          <PhotoCredit attribution={place.imageCredit} />
          <button type="button" onClick={() => onSelect(place)}>Lihat detail <Icon name="arrow-up-right" /></button>
        </div>
      </div>
    </article>
  );
}

export default AlamCard;