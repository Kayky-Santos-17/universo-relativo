import { memo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("landing-cta--visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="cta" ref={sectionRef} className="landing-cta">
      <div className="landing-cta-bg" aria-hidden="true" />
      <div className="landing-cta-planet" aria-hidden="true" />
      <div className="landing-cta-inner">
        <h2 className="landing-cta-title">
          O universo da <span className="landing-cta-highlight">Física</span> está esperando por você
        </h2>
        <p className="landing-cta-subtitle">
          Junte-se a milhares de estudantes que transformaram sua forma de aprender. Sua jornada começa agora.
        </p>
        <button className="landing-cta-btn" onClick={() => navigate("/login")} aria-label="Criar conta gratuita">
          Quero Fazer Parte
        </button>
      </div>
    </section>
  );
}

export default memo(CTA);
