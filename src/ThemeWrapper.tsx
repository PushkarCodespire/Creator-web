import React, { useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { antdTheme as lightTheme, darkTheme, globalStyles } from "./styles/theme";

type Props = {
  children: React.ReactNode;
};

function getInitialDarkMode(): boolean {
  // The app's layout uses hardcoded light backgrounds everywhere (#ffffff
  // cards, light gray borders, dark text). There is no actual dark-mode
  // support in the JSX / CSS for any page (except the Chat page which has
  // its own isolated local theme state). Returning true here would make
  // Ant Design emit dark tokens (Tags, Inputs, Buttons, etc.) while
  // everything else stays white — producing visual mismatches.
  //
  // Always return false. If dark mode is added properly in the future,
  // this function should be revisited.
  //
  // Also clear any stale "darkMode" key from localStorage so it doesn't
  // interfere if this function is ever changed back.
  try {
    localStorage.removeItem("darkMode");
  } catch (_) { /* SSR safety */ }
  return false;
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
