export function formatElevation(value, { unit = "mdpl", fallback = "Data belum tersedia" } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return `${value.toLocaleString("id-ID")} ${unit}`;
}

export function formatText(value, fallback = "Informasi belum tersedia") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function formatCoordinate(value, fallback = "Koordinat belum tersedia") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}