import { useEffect, useState } from "react";

export type Theme = "wishlist-light" | "wishlist-dark";

const STORAGE_KEY = "wishlist-theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "wishlist-light" || stored === "wishlist-dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "wishlist-dark"
    : "wishlist-light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "wishlist-light" ? "wishlist-dark" : "wishlist-light"));

  return { theme, toggleTheme };
}
