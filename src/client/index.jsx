import React from "react";
import ReactDOM from "react-dom/client";
import { default as App } from "./App.jsx";
import "./styles.css"; // Import CSS file

// Log to ensure this file is executed

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
