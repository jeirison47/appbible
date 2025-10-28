import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { configApi } from '../services/api';

interface Colors {
  // Modo claro
  light: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  // Modo oscuro
  dark: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
}

interface ColorContextType {
  colors: Colors;
  updateColors: (newColors: Partial<Colors>) => void;
  loadColors: () => Promise<void>;
}

const defaultColors: Colors = {
  light: {
    primary: '#4F46E5',    // Indigo-600
    secondary: '#9333EA',  // Purple-600
    background: '#ffffff', // White
    accent: '#EA580C',     // Orange-600
  },
  dark: {
    primary: '#6366F1',    // Indigo-500 (más claro para dark mode)
    secondary: '#A78BFA',  // Purple-400
    background: '#111827', // Gray-900
    accent: '#F97316',     // Orange-500
  },
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<Colors>(defaultColors);

  // Cargar colores de la BD al iniciar
  useEffect(() => {
    loadColors();
  }, []);

  // Aplicar colores como CSS Variables
  useEffect(() => {
    applyColorsToDOM(colors);
  }, [colors]);

  const loadColors = async () => {
    try {
      const response = await configApi.getAllConfig();
      if (response.success && response.data) {
        const config = response.data as any;

        const loadedColors: Colors = {
          light: {
            primary: config.color_light_primary || defaultColors.light.primary,
            secondary: config.color_light_secondary || defaultColors.light.secondary,
            background: config.color_light_background || defaultColors.light.background,
            accent: config.color_light_accent || defaultColors.light.accent,
          },
          dark: {
            primary: config.color_dark_primary || defaultColors.dark.primary,
            secondary: config.color_dark_secondary || defaultColors.dark.secondary,
            background: config.color_dark_background || defaultColors.dark.background,
            accent: config.color_dark_accent || defaultColors.dark.accent,
          },
        };

        setColors(loadedColors);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };

  const updateColors = (newColors: Partial<Colors>) => {
    setColors((prev) => ({ ...prev, ...newColors }));
  };

  const applyColorsToDOM = (colors: Colors) => {
    const root = document.documentElement;

    // Colores para modo claro
    root.style.setProperty('--color-light-primary', colors.light.primary);
    root.style.setProperty('--color-light-secondary', colors.light.secondary);
    root.style.setProperty('--color-light-background', colors.light.background);
    root.style.setProperty('--color-light-accent', colors.light.accent);

    // Colores para modo oscuro
    root.style.setProperty('--color-dark-primary', colors.dark.primary);
    root.style.setProperty('--color-dark-secondary', colors.dark.secondary);
    root.style.setProperty('--color-dark-background', colors.dark.background);
    root.style.setProperty('--color-dark-accent', colors.dark.accent);

    // Variables dinámicas que cambian según el tema
    root.style.setProperty('--color-primary', colors.light.primary);
    root.style.setProperty('--color-secondary', colors.light.secondary);
    root.style.setProperty('--color-background', colors.light.background);
    root.style.setProperty('--color-accent', colors.light.accent);
  };

  return (
    <ColorContext.Provider value={{ colors, updateColors, loadColors }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColors must be used within ColorProvider');
  }
  return context;
}
