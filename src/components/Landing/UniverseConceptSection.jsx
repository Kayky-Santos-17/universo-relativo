import { memo, useRef, useEffect } from "react";

const MODULES = [
  {
    title: "Início",
    desc: "Seu painel com progresso, metas e atividades recentes em um só lugar.",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    color: "#a855f7",
  },
  {
    title: "Física Básica",
    desc: "Apostilas interativas com teoria clara, exemplos e exercícios resolvidos.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "#6366f1",
  },
  {
    title: "Relatividade Especial",
    desc: "A trilha que dá nome à plataforma: do conceito à aplicação, passo a passo.",
    icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 2v4M12 18v4M2 12h4M18 12h4",
    color: "#8b5cf6",
  },
  {
    title: "Banco de Questões",
    desc: "Questões com correção automática e feedback detalhado por assunto.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    color: "#c084fc",
  },
  {
    title: "Provas",
    desc: "Simulados pra testar o que você aprendeu, no seu próprio ritmo.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#a855f7",
  },
  {
    title: "Flash Cards",
    desc: "Revisão espaçada pra fixar o conteúdo de forma eficiente e duradoura.",
    icon: "M4 6h16M4 12h16M4 18h16",
    color: "#6366f1",
  },
];

function UniverseConceptSection() {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const sideObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (leftRef.current) leftRef.current.classList.add("landing-universe-left--visible");
          if (rightRef.current) rightRef.current.classList.add("landing-universe-right--visible");
          sideObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) sideObserver.observe(sectionRef.current);

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-universe-card--visible");
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
      sideObserver.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <section id="universo" ref={sectionRef} className="landing-universe">
      <div className="landing-universe-inner">
        <div className="landing-universe-left" ref={leftRef}>
          <span className="landing-universe-eyebrow">Nossa identidade</span>
          <h2 className="landing-universe-title">
            Por que <span className="landing-universe-highlight">Universo Relativo</span>?
          </h2>
          <p className="landing-universe-desc">
            O nome nasce de uma inspiração direta na Teoria da Relatividade Especial de Einstein: nela,
            tempo e espaço não são absolutos — dependem do referencial de quem observa.
          </p>
          <p className="landing-universe-desc">
            Achamos que aprender física é parecido. Cada estudante tem seu próprio ritmo e seu próprio
            ponto de partida, e o conhecimento não acontece da mesma forma pra todo mundo. Por isso
            construímos uma plataforma que se adapta ao seu progresso, não o contrário.
          </p>
          <blockquote className="landing-universe-quote">
            Assim como na Relatividade Especial não existe um único referencial absoluto, na educação
            também não existe um único caminho para aprender.
          </blockquote>
        </div>

        <div className="landing-universe-right" ref={rightRef}>
          <div className="landing-universe-grid">
            {MODULES.map((m, i) => (
              <div
                key={m.title}
                ref={(el) => (cardsRef.current[i] = el)}
                className="landing-universe-card"
              >
                <div className="landing-universe-card-icon" aria-hidden="true" style={{ color: m.color }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.icon} />
                  </svg>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(UniverseConceptSection);
