import { parseCoordinatePair } from "../../../utils/coordinateParser.js";

function NusantaraMap({ places = [], selectedId, onSelect }) {
  const plottedPlaces = places.map((place) => {
    const coordinates = parseCoordinatePair(place.latitude, place.longitude);
    if (!coordinates) return null;
    const [latitude, longitude] = coordinates;
    return { ...place, x: 8 + ((longitude - 95) / 46) * 84, y: 12 + ((6 - latitude) / 15) * 76 };
  }).filter(Boolean);

  return (
    <div className="nusantara-map" role="group" aria-label="Destinasi alam Indonesia">
      <svg className="nusantara-map-shape" viewBox="0 0 640 260" aria-hidden="true">
        <path d="m43 101 29-19 35 6 19 17-11 13-38 4-21 17-25-10-13-15Zm100 36 29-14 40 9 23 23-10 14-45-4-31-13Zm105-33 38-18 25 7 11 22-18 16-48-4-23-11Zm42 53 24-19 32 6 32 22-11 19-36 4-31-14Zm105-58 52-14 45 16 21 29-17 16-37-11-33 11-27-16-20-19Zm83 92 31-22 44 12 19 21-27 21-45-7Z" />
      </svg>
      {plottedPlaces.map((place) => (
        <button
          className={selectedId === place.id ? "nusantara-map-pin is-active" : "nusantara-map-pin"}
          key={place.id}
          type="button"
          style={{ left: `${place.x}%`, top: `${place.y}%` }}
          aria-label={`Pilih ${place.name}`}
          aria-pressed={selectedId === place.id}
          onClick={() => onSelect?.(place)}
        />
      ))}
      <span className="nusantara-map-count">{plottedPlaces.length} titik terpetakan</span>
    </div>
  );
}

export default NusantaraMap;