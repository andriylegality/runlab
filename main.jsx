import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RunLab from "./RunLab.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RunLab />
  </StrictMode>
);
