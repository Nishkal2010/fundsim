import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { Landing } from "./Landing";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Landing />
  </React.StrictMode>,
);
