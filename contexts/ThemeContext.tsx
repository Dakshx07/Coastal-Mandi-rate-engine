import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('coastal_mandi_theme');
        return (saved as Theme) || 'system';
    });

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        localStorage.setItem('coastal_mandi_theme', theme);

        const checkSystem = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

        const applyTheme = () => {
            if (theme === 'dark') {
                root.classList.add('dark');
                setIsDark(true);
            } else if (theme === 'light') {
                root.classList.remove('dark');
                setIsDark(false);
            } else {
                // System
                if (checkSystem()) {
                    root.classList.add('dark');
                    setIsDark(true);
                } else {
                    root.classList.remove('dark');
                    setIsDark(false);
                }
            }
        };

        applyTheme();

        // Listen for system changes if theme is system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
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
