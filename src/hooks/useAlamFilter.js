import { useMemo } from "react";

export default function useAlamFilter(items, { category, region, query, sort }) {
  const searchableItems = useMemo(
    () => items.map((item) => ({
      item,
      searchText: [
        item.name,
        item.location,
        item.kind,
        item.type,
        item.region,
        item.regionLabel,
      ].filter(Boolean).join(" ").toLocaleLowerCase("id"),
    })),
    [items],
  );

  return useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    const filtered = searchableItems.filter(({ item, searchText }) => {
      const matchesCategory = category === "semua" || item.kind === category;
      const matchesRegion = region === "semua" || item.region === region;
      return matchesCategory && matchesRegion && searchText.includes(normalizedQuery);
    }).map(({ item }) => item);

    return filtered.sort((a, b) => {
      if (sort === "elevation-asc") return (a.elevation ?? Infinity) - (b.elevation ?? Infinity);
      if (sort === "name") return a.name.localeCompare(b.name, "id");
      return (b.elevation ?? -Infinity) - (a.elevation ?? -Infinity);
    });
  }, [searchableItems, category, region, query, sort]);
}