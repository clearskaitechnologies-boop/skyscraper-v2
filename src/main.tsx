import "./index.css";
import "./styles/brand.css";

import { createRoot } from "react-dom/client";

import App from "./App";
import GoogleOneTap from "./components/auth/GoogleOneTap";
import { BrandingProvider } from "./theme/BrandingProvider";

createRoot(document.getElementById("root")!).render(
  <BrandingProvider>
    <GoogleOneTap />
    <App />
  </BrandingProvider>
);
