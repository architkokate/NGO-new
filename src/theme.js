
import { useState } from "react";

export const THEME = {
  light: {
    // Main backgrounds
    canvas: "#F8F5EF",
    surface: "#FFFFFF",

    // Text and borders
    ink: "#343746",
    inkSoft: "#707382",
    line: "#E6E0D6",

    // Primary brand: Balanced orange
    // Use for primary buttons, active indicators and key highlights
    primary: "#E87924",
    primaryDeep: "#C85F13",
    accent: "#F3A847",
    accentSoft: "#FFF0DF",

    // Secondary brand: Blue
    // Use for navigation, headings and larger visual elements
    secondary: "#4659A8",
    secondaryDeep: "#354681",
    secondarySoft: "#EDECF5",

    // Status colours
    gold: "#B87520",
    coral: "#BD594B",
    success: "#397653",

    // Sidebar: Blue anchors the overall interface
    railBg: "#354681",
    railInk: "#FFFFFF",

    // Subtle backgrounds
    chipBg: "#EDECF5",
  },

  dark: {
    // Main backgrounds
    canvas: "#202331",
    surface: "#2A2E3D",

    // Text and borders
    ink: "#F5F2EC",
    inkSoft: "#B9BBC7",
    line: "#414556",

    // Primary brand: Soft orange for dark surfaces
    primary: "#F3A06A",
    primaryDeep: "#E87924",
    accent: "#F0B66E",
    accentSoft: "#493A2D",

    // Secondary brand: Blue
    secondary: "#9AA8EB",
    secondaryDeep: "#4659A8",
    secondarySoft: "#34384A",

    // Status colours
    gold: "#F0C477",
    coral: "#E58A7D",
    success: "#80C69A",

    // Sidebar
    railBg: "#191D2D",
    railInk: "#F5F2EC",

    // Subtle backgrounds
    chipBg: "#34384A",
  },
};

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
`;

export function useT() {
  const [mode, setMode] = useState("light");

  const t = THEME[mode];

  const toggle = () => {
    setMode((currentMode) =>
      currentMode === "light" ? "dark" : "light"
    );
  };

  return { t, mode, toggle };
}
