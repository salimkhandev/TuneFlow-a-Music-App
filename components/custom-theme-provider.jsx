"use client";

import themeConfig from "@/lib/theme/theme-config.json";
import { useTheme as DefaultUseTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "default",
  setTheme: () => null,
  themes: themeConfig.themes,
});

export function CustomThemeProvider({ children, defaultTheme = "default" }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme } = DefaultUseTheme(); // Get current dark/light mode

  // Initialize theme immediately on mount
  useEffect(() => {
    setMounted(true);
    
    // Apply theme immediately to prevent flash
    const storedTheme = localStorage.getItem("app-theme");
    if (storedTheme && themeConfig.themes.some((t) => t.name === storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme immediately to prevent flash
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);

    // Apply theme CSS variables
    const selectedTheme = themeConfig.themes.find((t) => t.name === theme);
    if (!selectedTheme) return;

    // Get current mode from next-themes
    const isDark = resolvedTheme === "dark";
    const modeVars = isDark
      ? selectedTheme.cssVars.dark
      : selectedTheme.cssVars.light;

    // Apply CSS variables instantly
    Object.entries(modeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // Ensure Tailwind applies dark mode correctly
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
  }, [theme, mounted, resolvedTheme]);

  // Listen for dark mode changes
  useEffect(() => {
    if (!mounted) return;

    const handleDarkModeChange = () => {
      const selectedTheme = themeConfig.themes.find((t) => t.name === theme);
      if (!selectedTheme) return;

      const isDark = resolvedTheme === "dark";
      const modeVars = isDark
        ? selectedTheme.cssVars.dark
        : selectedTheme.cssVars.light;

      Object.entries(modeVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    };

    // Initial check
    handleDarkModeChange();
  }, [theme, mounted, resolvedTheme]);

  const value = {
    theme,
    setTheme,
    themes: themeConfig.themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
