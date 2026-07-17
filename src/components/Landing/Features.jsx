import { memo, useRef, useEffect } from "react";

const FEATURES = [
  {
    step: "01", title: "Aprenda",
    desc: "Apostilas interativas com teoria clara, exemplos práticos e exercícios resolvidos. Conteúdo do básico ao avançado.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "#a855f7"
  },
  {
    step: "02", title: "Pratique",
    desc: "Questões com correção automática, feedback detalhado e estatísticas de desempenho. Evolução em tempo real.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#6366f1"
  },
  {
    step: "03", title: "Revise",
    desc: "Flashcards inteligentes com revisão espaçada. Fixe o conteúdo de forma eficiente e duradoura.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#8b5cf6"
  },
  {
    step: "04", title: "Evolua",
    desc: "Dashboard com métricas, streaks e metas. Acompanhe sua jornada e celebre cada conquista.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    color: "#c084fc"
  },
];

function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("landing-features--visible");
          sectionObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-features-card--visible");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cardsRef.current.forEach((card) => {
      if (card) cardObserver.observe(card);
    });

    return () => {
      sectionObserver.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <section id="features" ref={sectionRef} className="landing-features">
      <div className="landing-features-container">
        <div className="landing-features-divider" />
        <h2 className="landing-section-title">Como funciona</h2>
        <p className="landing-section-subtitle">Quatro passos para dominar a física</p>
        <div className="landing-features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.step}
              ref={(el) => (cardsRef.current[i] = el)}
              className="landing-features-card"
            >
              <div className="landing-features-icon" aria-hidden="true" style={{ color: f.color }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="landing-features-step" style={{ color: f.color }}>{f.step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Features);
