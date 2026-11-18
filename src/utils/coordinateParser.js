export function parseCoordinate(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;

  const decimal = Number(value.trim());
  if (Number.isFinite(decimal)) return decimal;

  const normalized = value.trim().replace(/[′’]/g, "'").replace(/[″”]/g, '"');
  const match = normalized.match(/(-?\d+(?:\.\d+)?)\s*°?\s*(?:(\d+(?:\.\d+)?)\s*['′]?\s*)?(?:(\d+(?:\.\d+)?)\s*["″]?\s*)?([NSEW])?/i);
  if (!match) return null;

  const degrees = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const direction = match[4]?.toUpperCase();
  if (minutes >= 60 || seconds >= 60) return null;

  const magnitude = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  return direction === "S" || direction === "W" || degrees < 0 ? -magnitude : magnitude;
}

export function parseCoordinatePair(latitude, longitude) {
  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  if (lat == null || lng == null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}