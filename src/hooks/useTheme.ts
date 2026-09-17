import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/** Syncs Zustand theme state with the DOM class and localStorage */
export function useTheme() {
  const theme = useStore(s => s.theme);
  const toggleTheme = useStore(s => s.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}
