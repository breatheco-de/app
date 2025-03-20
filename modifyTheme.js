import { isWindow } from './src/utils';

const handleTheme = () => {
  if (isWindow) {
    // Check URL query parameter first
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme) {
      localStorage.setItem('chakra-ui-color-mode', urlTheme);
      return urlTheme;
    }

    // Check localStorage - if exists, always respect user's last choice
    const storedTheme = localStorage.getItem('chakra-ui-color-mode');
    if (storedTheme) {
      return storedTheme;
    }

    // Only check system preference for first-time visitors
    // (when no theme is stored in localStorage)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    localStorage.setItem('chakra-ui-color-mode', systemTheme);
    return systemTheme;
  }
  return 'light';
};

export default handleTheme;
