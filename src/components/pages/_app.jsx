import "../styles/globals.css";

import React from "react";

import { BrandingProvider } from "../context/BrandingContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <BrandingProvider>
      <Component {...pageProps} />
    </BrandingProvider>
  );
}
