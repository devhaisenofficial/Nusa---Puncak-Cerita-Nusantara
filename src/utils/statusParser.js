export function parseVolcanoStatus(value) {
  const text = typeof value === "string" ? value : "";
  const level = text.match(/level\s*(iv|iii|ii|i|[1-4])/i)?.[1]?.toUpperCase();
  if (level) return { label: `Level ${level}`, tone: level === "III" || level === "IV" || level === "3" || level === "4" ? "alert" : "caution" };
  if (/siaga/i.test(text)) return { label: text, tone: "alert" };
  if (/waspada/i.test(text)) return { label: text, tone: "caution" };
  if (/normal/i.test(text)) return { label: text, tone: "safe" };
  return { label: text || "Periksa sumber resmi", tone: "unknown" };
}

export function parseLakePriority(value) {
  const text = typeof value === "string" ? value : "";
  return /danau prioritas/i.test(text)
    ? { label: text, tone: "caution" }
    : { label: text || "Informasi belum tersedia", tone: "unknown" };
}