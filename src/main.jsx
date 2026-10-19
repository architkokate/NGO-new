import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { FONTS } from "./theme";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <style>{FONTS}</style>
    <App />
  </React.StrictMode>
);
