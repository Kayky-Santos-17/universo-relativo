import { memo } from "react";
import "./Astronaut.css";

function Astronaut({ size = "md", animated = true, variant = "default", className = "" }) {
  const sizeClass = `astro-root--${size}`;
  const animClass = animated ? "astro--animated" : "";

  if (variant === "floating") {
    return (
      <div className={`astro-root ${sizeClass} ${className}`} aria-hidden="true">
        <div className={`astro ${animClass}`}>
          <div className="astro-helmet"><div className="astro-face" /></div>
          <div className="astro-pack" />
          <div className="astro-body" />
          <div className="astro-arm astro-arm--left" />
          <div className="astro-arm astro-arm--right" />
          <div className="astro-leg astro-leg--left" />
          <div className="astro-leg astro-leg--right" />
        </div>
      </div>
    );
  }

  return (
    <div className={`astro-root ${sizeClass} ${className}`} aria-hidden="true">
      <div className={`astro ${animClass}`}>
        <div className="astro-helmet"><div className="astro-face" /></div>
        <div className="astro-pack" />
        <div className="astro-body" />
        <div className="astro-arm astro-arm--left" />
        <div className="astro-arm astro-arm--right" />
        <div className="astro-leg astro-leg--left" />
        <div className="astro-leg astro-leg--right" />
      </div>
    </div>
  );
}

export default memo(Astronaut);
