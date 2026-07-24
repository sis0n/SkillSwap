import { create } from "zustand"

type Theme = "light" | "dark" | "system"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(mode: Theme): void {
  const root = document.documentElement
  const resolved = mode === "system" ? getSystemTheme() : mode

  root.classList.toggle("dark", resolved === "dark")
}

interface ThemeState {
  mode: Theme
  setMode: (mode: Theme) => void
  resolvedTheme: () => "light" | "dark"
}

function getInitialMode(): Theme {
  return (localStorage.getItem("theme") as Theme) || "system"
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getInitialMode(),

  setMode: (mode: Theme) => {
    localStorage.setItem("theme", mode)
    applyTheme(mode)
    set({ mode })
  },

  resolvedTheme: () => {
    const { mode } = get()
    return mode === "system" ? getSystemTheme() : mode
  },
}))

applyTheme(getInitialMode())

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { mode } = useThemeStore.getState()
      if (mode === "system") {
        applyTheme("system")
      }
    })
}
