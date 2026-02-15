import "../styles/topnav-ux.css";

import React, { useState } from "react";

import MegaDropdown from "./MegaDropdown";
import { triggerMicroInteraction } from "./MicroInteractions";

const MENU = [
  { title: "Retail", href: "/retail" },
  { title: "Insurance", href: "/insurance" },
  { title: "The Service Network™", href: "/service-network" },
  { title: "Demo", href: "/demo" },
  { title: "About Us", href: "/about" },
  { title: "Contact Us", href: "/contact" },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="ux-topnav" role="navigation" aria-label="Top Navigation">
      <div className="ux-nav-inner">
        <a className="ux-brand" href="/">
          <img className="ux-logo" src="/assets/logo.svg" alt="logo" />
          <span className="ux-brand-text">Preloss Vision</span>
        </a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {MENU.map((m) => (
            <a key={m.title} href={m.href} className="ux-link">
              {m.title}
            </a>
          ))}
          <button
            className="ux-hamburger"
            onClick={() => {
              setOpen(!open);
              triggerMicroInteraction("confetti");
            }}
            aria-expanded={open}
            aria-controls="main-menu"
          >
            <span className="ux-burger-line" />
            <span className="ux-burger-line" />
            <span className="ux-burger-line" />
          </button>
        </div>
      </div>
      <MegaDropdown id="main-menu" items={MENU} open={open} />
    </nav>
  );
}
