import AlamCard from "../explore/AlamCard.jsx";

function HighlightCards({ places = [], favorites = [], onToggleFavorite, onSelect }) {
  return (
    <div className="catalog-grid highlight-cards">
      {places.map((place) => (
        <AlamCard
          key={place.id}
          place={place}
          isSaved={favorites.includes(place.id)}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default HighlightCards;