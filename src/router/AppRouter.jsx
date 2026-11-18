export function resolveRoute(pathname) {
  const detailMatch = pathname.match(/^\/jelajah\/([^/]+)\/?$/);
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const activePage = normalizedPath === "/jelajah" || detailMatch
    ? "/jelajah"
    : normalizedPath === "/peta"
      ? "/peta"
    : normalizedPath === "/chat"
      ? "/chat"
    : normalizedPath === "/bookmark"
      ? "/bookmark"
    : normalizedPath === "/kontribusi"
      ? "/kontribusi"
      : normalizedPath === "/tentang"
        ? "/tentang"
        : normalizedPath === "/kontak"
          ? "/kontak"
          : "/";

  return {
    activePage,
    detailId: detailMatch?.[1] ?? null,
  };
}