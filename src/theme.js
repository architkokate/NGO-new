import { useState } from "react";

export const THEME = {
  light: {
    canvas: "#FFF9F2", surface: "#FFFFFF", ink: "#292524", inkSoft: "#6B625A",
    line: "#E8DFD3", primary: "#F47B20", primaryDeep: "#D96814",
    gold: "#F9B233", coral: "#C1553C", success: "#3F7F52", railBg: "#292524",
    railInk: "#FFF9F2", chipBg: "#F4EBE1",
  },
  dark: {
    canvas: "#1C1917", surface: "#292524", ink: "#FFF9F2", inkSoft: "#A8A29E",
    line: "#3F3A36", primary: "#F47B20", primaryDeep: "#D96814",
    gold: "#F9B233", coral: "#E07A5F", success: "#5CAE72", railBg: "#1C1917",
    railInk: "#FFF9F2", chipBg: "#342F2C",
  },
};

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
`;

export function useT() {
  const [mode, setMode] = useState("light");
  const t = THEME[mode];
  return { t, mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) };
}
