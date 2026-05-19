"use client"

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "menu-printer-theme"
const THEME_EVENT = "theme-change"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light"

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const onStoreChange = () => callback()

  window.addEventListener("storage", onStoreChange)
  window.addEventListener(THEME_EVENT, onStoreChange)
  mediaQuery.addEventListener("change", onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(THEME_EVENT, onStoreChange)
    mediaQuery.removeEventListener("change", onStoreChange)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getPreferredTheme, () => "light")

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.")
  }

  return context
}

export const themeScript = `
(() => {
  const storageKey = "${STORAGE_KEY}";
  const storedTheme = window.localStorage.getItem(storageKey);
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.classList.toggle("dark", theme === "dark");
})();
`
