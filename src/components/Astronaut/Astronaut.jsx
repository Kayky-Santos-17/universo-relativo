import { memo } from "react";
import "./Astronaut.css";

function AstronautSvg() {
  return (
    <svg className="astro-svg" viewBox="24 2 166 254" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="astroSuit2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d7dce6" />
        </linearGradient>
        <linearGradient id="astroVisor2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2e1065" />
        </linearGradient>
        <radialGradient id="astroPlanet2" cx="30%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>

      {/* mochila */}
      <rect x="58" y="100" width="84" height="92" rx="18" fill="#c7cdd6" />
      <rect x="66" y="112" width="68" height="8" rx="4" fill="#a855f7" opacity="0.5" />
      <rect x="66" y="126" width="68" height="8" rx="4" fill="#a855f7" opacity="0.3" />

      {/* pernas */}
      <line x1="84" y1="176" x2="78" y2="236" stroke="url(#astroSuit2)" strokeWidth="24" strokeLinecap="round" />
      <line x1="116" y1="176" x2="122" y2="236" stroke="url(#astroSuit2)" strokeWidth="24" strokeLinecap="round" />
      <ellipse cx="78" cy="240" rx="18" ry="11" fill="#5b21b6" />
      <ellipse cx="122" cy="240" rx="18" ry="11" fill="#5b21b6" />

      {/* tronco */}
      <rect x="62" y="96" width="76" height="90" rx="30" fill="url(#astroSuit2)" />

      {/* painel do peito */}
      <rect x="82" y="122" width="36" height="26" rx="7" fill="#1e1b3a" />
      <circle cx="90" cy="131" r="3.5" fill="#f472b6" />
      <circle cx="100" cy="131" r="3.5" fill="#facc15" />
      <circle cx="110" cy="131" r="3.5" fill="#4ade80" />
      <rect x="86" y="139" width="28" height="5" rx="2.5" fill="#a855f7" opacity="0.5" />

      {/* braço esquerdo (apoiado) */}
      <line x1="66" y1="110" x2="44" y2="168" stroke="url(#astroSuit2)" strokeWidth="22" strokeLinecap="round" />
      <circle cx="44" cy="168" r="13" fill="#e9edf3" />

      {/* braço direito (acenando) */}
      <line x1="134" y1="108" x2="170" y2="58" stroke="url(#astroSuit2)" strokeWidth="22" strokeLinecap="round" />
      <circle cx="170" cy="58" r="13" fill="#e9edf3" />

      {/* gola */}
      <rect x="76" y="90" width="48" height="16" rx="8" fill="#e2e8f0" />

      {/* capacete */}
      <circle cx="100" cy="54" r="46" fill="url(#astroSuit2)" stroke="#c7cdd6" strokeWidth="4" />
      <circle cx="100" cy="54" r="34" fill="url(#astroVisor2)" />

      {/* reflexo: mini planeta */}
      <circle cx="88" cy="46" r="8" fill="url(#astroPlanet2)" />
      <ellipse cx="88" cy="46" rx="12" ry="2.5" fill="none" stroke="#f0abfc" strokeWidth="1.3" opacity="0.7" />

      {/* brilho do visor */}
      <path d="M80 32 Q100 22 118 30" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.35" fill="none" />
    </svg>
  );
}

function Astronaut({ size = "md", animated = true, variant = "default", className = "" }) {
  const sizeClass = `astro-root--${size}`;
  const animClass = animated ? "astro--animated" : "";

  return (
    <div className={`astro-root ${sizeClass} ${className}`} aria-hidden="true">
      <div className={`astro ${animClass}`}>
        <AstronautSvg />
      </div>
    </div>
  );
}

export default memo(Astronaut);
