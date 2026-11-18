import alamData from "../data/alam_indonesia.json";
import peakImageAttributions from "../data/peak-image-attributions.json";
import { parseCoordinatePair } from "../utils/coordinateParser.js";

const regionGroups = [
  { match: /sumatra/i, label: "Sumatra", id: "sumatra" },
  { match: /sunda|jawa/i, label: "Jawa", id: "jawa" },
  { match: /kalimantan/i, label: "Kalimantan", id: "kalimantan" },
  { match: /sulawesi|sangihe/i, label: "Sulawesi", id: "sulawesi" },
  { match: /bali|nusa tenggara/i, label: "Bali & Nusa Tenggara", id: "bali-nt" },
  { match: /maluku/i, label: "Maluku", id: "maluku" },
  { match: /papua/i, label: "Papua", id: "papua" },
];

function getRegion(region) {
  return regionGroups.find((group) => group.match.test(region)) ?? {
    label: region,
    id: region.toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  };
}

function formatCoordinates(peak) {
  if (peak.coordinates_dms) return peak.coordinates_dms;
  const coordinates = parseCoordinatePair(peak.latitude, peak.longitude);
  if (!coordinates) return "Koordinat belum tersedia";
  const [latitudeValue, longitudeValue] = coordinates;
  const latitude = `${Math.abs(latitudeValue).toFixed(4)}° ${latitudeValue < 0 ? "S" : "N"}`;
  const longitude = `${Math.abs(longitudeValue).toFixed(4)}° ${longitudeValue < 0 ? "W" : "E"}`;
  return `${latitude}, ${longitude}`;
}

function describePeak(peak) {
  const region = getRegion(peak.region).label;
  const height = Number.isFinite(peak.elevation_m)
    ? `${peak.elevation_m.toLocaleString("id-ID")} meter`
    : "ketinggian belum tersedia";
  return `${peak.name} berada di wilayah ${peak.province}, ${region}, dengan catatan ${peak.type.toLocaleLowerCase("id")} dan ${height}.`;
}

const photoAttributions = new Map(
  peakImageAttributions.map((attribution) => [attribution.localPath, attribution]),
);

export const places = alamData.peaks.map((peak) => {
  const region = getRegion(peak.region);
  const kind = /bukit/i.test(peak.type) || /bukit/i.test(peak.name) ? "bukit" : "gunung";

  return {
    id: String(peak.id),
    sourceId: peak.id,
    name: peak.name,
    kind,
    region: region.id,
    regionLabel: region.label,
    location: peak.province,
    province: peak.province,
    elevation: Number.isFinite(peak.elevation_m) ? peak.elevation_m : null,
    coordinates: formatCoordinates(peak),
    latitude: peak.latitude,
    longitude: peak.longitude,
    status: "Belum diverifikasi",
    type: peak.type,
    image: peak.image,
    imageCredit: photoAttributions.get(peak.image) ?? null,
    summary: describePeak(peak),
    ecology: `Bentang alam ini berada di wilayah ${region.label}. Data ekologi terperinci perlu dirujuk kepada pengelola kawasan dan sumber ilmiah setempat.`,
    history: `Nama, lokasi, dan koordinat ${peak.name} bersumber dari himpunan data geospasial NUSA. Rujuk gazeter resmi untuk pemutakhiran nama dan batas wilayah.`,
    visit: "Periksa pengumuman pemerintah daerah, pengelola kawasan, dan PVMBG bila relevan. Informasi dalam atlas ini bukan panduan keselamatan waktu nyata.",
    species: "Data spesies belum dicantumkan dalam sumber geospasial ini.",
    sourceRegion: peak.region,
    coordinatesDms: peak.coordinates_dms,
  };
});

export const alamMetadata = alamData.metadata;

export function getPlaceById(id) {
  return places.find((place) => place.id === String(id));
}

export function getFeaturedPlaces() {
  const preferredIds = ["143", "22", "118"];
  const preferred = preferredIds.map(getPlaceById).filter(Boolean);
  const chosen = new Set(preferred.map((place) => place.id));
  for (const place of [...places].sort((a, b) => (b.elevation ?? 0) - (a.elevation ?? 0))) {
    if (preferred.length >= 3) break;
    if (!chosen.has(place.id)) {
      preferred.push(place);
      chosen.add(place.id);
    }
  }
  return preferred.slice(0, 3);
}