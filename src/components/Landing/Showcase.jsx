import { memo, useRef, useEffect } from "react";

const BENEFITS = [
  "Trilhas organizadas do básico ao avançado",
  "Estatísticas de desempenho em tempo real",
  "Revisão espaçada com flashcards inteligentes",
  "Jornada gamificada com metas e conquistas",
];

function Showcase() {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (leftRef.current) leftRef.current.classList.add("landing-showcase-left--visible");
          if (rightRef.current) rightRef.current.classList.add("landing-showcase-right--visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="showcase" ref={sectionRef} className="landing-showcase">
      <div className="landing-showcase-inner">
        <div className="landing-showcase-left" ref={leftRef}>
          <h2 className="landing-showcase-title">Muito além de PDFs</h2>
          <p className="landing-showcase-desc">
            Uma plataforma completa de estudos que combina teoria interativa, prática inteligente e revisão espaçada em um só lugar.
          </p>
          <ul className="landing-showcase-benefits">
            {BENEFITS.map((b) => (
              <li key={b} className="landing-showcase-benefit">
                <svg className="landing-showcase-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="landing-showcase-right" ref={rightRef}>
          <div className="landing-showcase-dashboard" aria-hidden="true">
            <div className="landing-dash-header">
              <div className="landing-dash-dot" />
              <div className="landing-dash-dot" />
              <div className="landing-dash-dot" />
            </div>
            <div className="landing-dash-body">
              <div className="landing-dash-row">
                <div className="landing-dash-label">Cinemática</div>
                <div className="landing-dash-bar">
                  <div className="landing-dash-bar-fill" style={{ width: "85%" }} />
                </div>
                <span className="landing-dash-value">85%</span>
              </div>
              <div className="landing-dash-row">
                <div className="landing-dash-label">Termologia</div>
                <div className="landing-dash-bar">
                  <div className="landing-dash-bar-fill" style={{ width: "62%" }} />
                </div>
                <span className="landing-dash-value">62%</span>
              </div>
              <div className="landing-dash-row">
                <div className="landing-dash-label">Eletromagnetismo</div>
                <div className="landing-dash-bar">
                  <div className="landing-dash-bar-fill" style={{ width: "78%" }} />
                </div>
                <span className="landing-dash-value">78%</span>
              </div>
              <div className="landing-dash-row">
                <div className="landing-dash-label">Óptica</div>
                <div className="landing-dash-bar">
                  <div className="landing-dash-bar-fill" style={{ width: "43%" }} />
                </div>
                <span className="landing-dash-value">43%</span>
              </div>
              <div className="landing-dash-row">
                <div className="landing-dash-label">Ondulatória</div>
                <div className="landing-dash-bar">
                  <div className="landing-dash-bar-fill" style={{ width: "91%" }} />
                </div>
                <span className="landing-dash-value">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Showcase);
