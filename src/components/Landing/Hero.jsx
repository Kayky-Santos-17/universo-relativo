import { memo } from "react";
import { useNavigate } from "react-router-dom";
import Astronaut from "../Astronaut/Astronaut";

function Hero() {
  const navigate = useNavigate();

  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="landing-hero">
      <div className="landing-hero-bg" />
      <div className="landing-hero-stars" />
      <div className="landing-hero-nebula" />
      <div className="landing-hero-planet" />
      <div className="landing-hero-inner">
        <div className="landing-hero-left">
          <h1 className="landing-hero-title">
            A <span className="landing-hero-title-highlight">Física</span>{" "}
            que vai te levar além
          </h1>
          <p className="landing-hero-subtitle">
            Domine a física com aulas interativas, questões inteligentes e flashcards. Do básico ao avançado, no seu ritmo.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-hero-btn landing-hero-btn-primary" onClick={() => navigate("/login?mode=register")} aria-label="Criar conta gratuita">Comece Grátis</button>
            <button className="landing-hero-btn landing-hero-btn-outline" onClick={(e) => handleScroll(e, "features")} aria-label="Saber mais sobre a plataforma">Quero Conhecer</button>
          </div>
        </div>
        <div className="landing-hero-right">
          <Astronaut size="xl" animated variant="default" />
        </div>
      </div>
      <div className="landing-scroll-indicator">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </section>
  );
}

export default memo(Hero);
