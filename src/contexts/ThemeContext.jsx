import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'com.markdownlivepreview.theme_settings';
const PREVIEW_CSS_LIGHT = '/css/github-markdown-light.css';
const PREVIEW_CSS_DARK = '/css/github-markdown-dark.css';

// Available themes
export const THEMES = {
  light: {
    name: 'Light',
    icon: '☀️',
    previewCss: PREVIEW_CSS_LIGHT
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    previewCss: PREVIEW_CSS_DARK
  },
  sepia: {
    name: 'Sepia',
    icon: '📜',
    previewCss: PREVIEW_CSS_LIGHT
  },
  catppuccin: {
    name: 'Catppuccin Pink',
    icon: '🌸',
    previewCss: PREVIEW_CSS_DARK
  }
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES[savedTheme] ? savedTheme : 'light';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Update preview CSS link
    updatePreviewCss();
  }, [theme]);

  const updatePreviewCss = () => {
    let link = document.querySelector('link[data-preview-css]');
    const currentTheme = THEMES[theme];

    if (!link) {
      // Create link if it doesn't exist
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-preview-css', '');
      link.href = currentTheme.previewCss;
      document.head.appendChild(link);
      return;
    }

    // Update href if different
    if (link.getAttribute('href') !== currentTheme.previewCss) {
      link.setAttribute('href', currentTheme.previewCss);
    }
  };

  const toggleTheme = () => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setThemeState(themeKeys[nextIndex]);
  };

  const setTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
    }
  };

  const value = {
    theme,
    themeName: THEMES[theme].name,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    availableThemes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
