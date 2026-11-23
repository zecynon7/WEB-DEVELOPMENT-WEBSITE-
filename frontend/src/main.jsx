import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { wake } from "./lib/boot";
import "./styles/style.css";

// tells the fallback script in index.html that the app did start (so it does not switch the animations off)
window.__bbBooted = true;

// start waking the backend right now, in parallel with the rest of the app loading
wake();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
