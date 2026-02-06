import React, { useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { antdTheme as lightTheme, darkTheme, globalStyles } from "./styles/theme";

type Props = {
  children: React.ReactNode;
};

function getInitialDarkMode(): boolean {
  const saved = localStorage.getItem("darkMode");
  if (saved === "true") return true;
  if (saved === "false") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export default function ThemeWrapper({ children }: Props) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getInitialDarkMode());

  // Inject global design-system styles once
  useEffect(() => {
    if (typeof document === "undefined") return;

    let styleTag = document.getElementById("global-design-system-styles") as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "global-design-system-styles";
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = globalStyles;
  }, []);

  useEffect(() => {
    const handleDarkModeChange = () => {
      const saved = localStorage.getItem("darkMode");
      setIsDarkMode(saved === "true");
    };

    window.addEventListener("storage", handleDarkModeChange);
    window.addEventListener("darkModeChange" as any, handleDarkModeChange);

    return () => {
      window.removeEventListener("storage", handleDarkModeChange);
      window.removeEventListener("darkModeChange" as any, handleDarkModeChange);
    };
  }, []);

  const themeConfig = useMemo(
    () => ({
      ...(isDarkMode ? darkTheme : lightTheme),
      algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    }),
    [isDarkMode]
  );

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}
