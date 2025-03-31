import { isWindow } from './src/utils';

const handleTheme = () => {
  if (isWindow) {
    // Check URL query parameter first
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme) {
      localStorage.setItem('chakra-ui-color-mode', urlTheme);

      // Try to force immediate theme application for Chakra UI
      try {
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-theme', urlTheme);
          document.documentElement.style.colorScheme = urlTheme;
        }
      } catch (error) {
        console.error('Error applying theme immediately:', error);
      }

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

// Custom color mode manager para Chakra UI
export const customColorModeManager = {
  type: 'localStorage',
  get: () => {
    // Verificar parámetro de URL primero (confiable desde el primer render)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get('theme');
      if (urlTheme && ['light', 'dark'].includes(urlTheme)) {
        return urlTheme;
      }
    }
    // Fallback a localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chakra-ui-color-mode') || 'light';
    }
    return 'light';
  },
  set: (value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chakra-ui-color-mode', value);
    }
  },
};

// Función para actualizar el tema basado en el parámetro de URL
export const updateThemeFromUrlParam = (urlTheme) => {
  if (urlTheme && ['light', 'dark'].includes(urlTheme)) {
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chakra-ui-color-mode', urlTheme);

      // También establecer una cookie como respaldo
      if (document && document.cookie) {
        document.cookie = `chakra-ui-color-mode=${urlTheme}; max-age=31536000; path=/`;
      }
    }
    return true;
  }
  return false;
};

export default handleTheme;
