import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Dark-mode preference, persisted to localStorage (key `rogare-theme`) so it
 * survives a page refresh and is shared between the user and admin panels.
 *
 * Dark mode is driven by a `.dark` class (toggled on <body> and the layout
 * wrapper). That class swaps the semantic CSS-variable tokens defined in
 * index.css (--bg-*, --text-*, --border, --brand, accents), which every
 * component consumes via Tailwind utilities like `bg-bg-card` / `text-text-primary`.
 */
const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (isDark) => set({ isDark }),
    }),
    { name: 'rogare-theme' },
  ),
)

export default useThemeStore
