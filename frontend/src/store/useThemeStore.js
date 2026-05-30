import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Dark-mode preference, persisted to localStorage (key `rogare-theme`) so it
 * survives a page refresh and is shared between the user and admin panels.
 *
 * The "dark theme" is a CSS invert filter applied via the `.theme-invert`
 * class (see index.css) — toggled on the layout wrapper, and on portaled
 * modal panels that render outside that wrapper.
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
