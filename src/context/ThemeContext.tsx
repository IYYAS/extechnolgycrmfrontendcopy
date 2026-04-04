import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'green' | 'red' | 'blue' | 'purple';

interface ThemeContextType {
    mode: ThemeMode;
    accentColor: AccentColor;
    toggleMode: () => void;
    setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme-mode');
        return (saved as ThemeMode) || 'light';
    });

    const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
        const saved = localStorage.getItem('accent-color');
        return (saved as AccentColor) || 'green';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Handle Dark/Light Mode
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove previous accent classes
        ['theme-green', 'theme-red', 'theme-blue', 'theme-purple'].forEach((cls) => {
            root.classList.remove(cls);
        });

        // Add current accent class
        root.classList.add(`theme-${accentColor}`);
        localStorage.setItem('accent-color', accentColor);
    }, [accentColor]);

    const toggleMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setAccentColor = (color: AccentColor) => {
        setAccentColorState(color);
    };

    return (
        <ThemeContext.Provider value={{ mode, accentColor, toggleMode, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
