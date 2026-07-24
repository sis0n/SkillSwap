import { useThemeStore } from "@/stores/themeStore"

export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)

  return { mode, setMode, resolvedTheme: resolvedTheme() }
}
