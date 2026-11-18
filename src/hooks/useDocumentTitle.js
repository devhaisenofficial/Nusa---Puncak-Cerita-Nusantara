import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (typeof title === "string" && title.trim()) document.title = title.trim();
  }, [title]);
}