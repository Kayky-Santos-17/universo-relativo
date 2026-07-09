import { useState, useMemo, useCallback } from "react";

const SvgIcon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const FISICA_UI_CONFIG = [
  {
    id: "cinematica", titulo: "Cinemática",
    descricao: "Trilha visual para estudar deslocamento, gráficos, lançamentos e leitura do movimento em etapas curtas.",
    destaque: "7 blocos montados", temaNumero: "Tema 01",
    lead: "Uma trilha organizada para conduzir o aluno da leitura inicial do movimento até lançamentos em duas dimensões.",
    topicos: [
      { id: "introducao-a-cinematica", titulo: "Introdução à Cinemática" },
      { id: "movimento-retilineo-constante", titulo: "Movimento retilíneo uniforme" },
      { id: "aceleracao-em-linha-reta", titulo: "Movimento retilíneo uniformemente variado" },
      { id: "vetores-do-movimento", titulo: "Vetores do movimento" },
      { id: "trajetorias-circulares-e-polias", titulo: "Movimento circular e polias" },
      { id: "quedas-e-subidas-verticais", titulo: "Movimentos verticais" },
      { id: "lancamentos-em-duas-dimensoes", titulo: "Lançamento horizontal e oblíquo" }
    ]
  },
  {
    id: "dinamica", titulo: "Dinâmica",
    descricao: "Forças, leis de Newton, trabalho, energia e quantidade de movimento.",
    destaque: "7 blocos montados", temaNumero: "Tema 02",
    lead: "Compreenda as causas do movimento e as interações entre corpos.",
    topicos: [
      { id: "bases-das-leis-de-newton", titulo: "Princípios de Newton" },
      { id: "molas-e-forca-restauradora", titulo: "Força elástica" },
      { id: "arranjos-de-blocos", titulo: "Sistemas de blocos" },
      { id: "atrito-em-superficies", titulo: "Força de atrito" },
      { id: "dinamica-da-forca-centripeta", titulo: "Força centrípeta" },
      { id: "trabalho-e-energia-em-acao", titulo: "Trabalho e energia mecânica" },
      { id: "impulso-e-quantidade-de-movimento", titulo: "Impulso e quantidade de movimento" }
    ]
  },
  {
    id: "termologia", titulo: "Termologia",
    descricao: "Temperatura, escalas, dilatação, calorimetria, gases e termodinâmica.",
    destaque: "7 blocos montados", temaNumero: "Tema 03",
    lead: "Explore os fenômenos térmicos e as leis que regem o calor.",
    topicos: [
      { id: "fundamentos-de-termologia", titulo: "Fundamentos de Termologia" },
      { id: "medidas-e-escalas-termicas", titulo: "Escalas térmicas" },
      { id: "dilatacao-em-solidos-e-fluidos", titulo: "Dilatação térmica" },
      { id: "misturas-e-calorimetria", titulo: "Calorimetria" },
      { id: "caminhos-da-propagacao-do-calor", titulo: "Propagação de calor" },
      { id: "comportamento-termico-dos-gases", titulo: "Estudo dos gases" },
      { id: "principios-da-termodinamica", titulo: "Termodinâmica" }
    ]
  },
  {
    id: "optica", titulo: "Óptica",
    descricao: "Reflexão, refração, espelhos, lentes e a natureza da luz.",
    destaque: "5 blocos montados", temaNumero: "Tema 04",
    lead: "Desvende os princípios da óptica geométrica e a formação de imagens.",
    topicos: [
      { id: "principios-da-optica-geometrica", titulo: "Conceitos fundamentais" },
      { id: "reflexao-em-espelhos-planos", titulo: "Espelhos planos" },
      { id: "espelhos-esfericos-na-pratica", titulo: "Espelhos esféricos" },
      { id: "desvio-da-luz-e-refracao", titulo: "Refração da luz" },
      { id: "lentes-imagens-e-visao", titulo: "Lentes e visão" }
    ]
  },
  {
    id: "ondulatoria", titulo: "Ondulatória",
    descricao: "Ondas mecânicas, acústica, MHS e fenômenos ondulatórios.",
    destaque: "6 blocos montados", temaNumero: "Tema 05",
    lead: "Estude as ondas, o som e o movimento harmônico simples.",
    topicos: [
      { id: "ideias-iniciais-de-ondulatoria", titulo: "Conceitos iniciais" },
      { id: "fenomenos-das-ondas", titulo: "Fenômenos ondulatórios" },
      { id: "natureza-e-propriedades-do-som", titulo: "Propriedades do som" },
      { id: "efeitos-sonoros-no-dia-a-dia", titulo: "Fenômenos sonoros" },
      { id: "ressonancia-em-cordas-e-tubos", titulo: "Cordas e tubos sonoros" },
      { id: "oscilacao-e-movimento-harmonico", titulo: "Movimento harmônico simples" }
    ]
  },
  {
    id: "gravitacao", titulo: "Gravitação",
    descricao: "Leis de Kepler, gravitação universal e órbitas celestes.",
    destaque: "2 blocos montados", temaNumero: "Tema 06",
    lead: "Descubra as leis que governam o movimento dos astros.",
    topicos: [
      { id: "leis-de-kepler", titulo: "Leis de Kepler" },
      { id: "gravitacao-universal", titulo: "Gravitação Universal" }
    ]
  },
  {
    id: "estatica", titulo: "Estática",
    descricao: "Equilíbrio de corpos rígidos, torque e alavancas.",
    destaque: "2 blocos montados", temaNumero: "Tema 07",
    lead: "Analise as condições de equilíbrio dos corpos extensos.",
    topicos: [
      { id: "equilibrio-de-uma-particula", titulo: "Equilíbrio de uma partícula" },
      { id: "equilibrio-de-corpos-extensos", titulo: "Equilíbrio de corpos extensos" }
    ]
  },
  {
    id: "hidrostatica", titulo: "Hidrostática",
    descricao: "Densidade, pressão, teorema de Stevin, Pascal e Arquimedes.",
    destaque: "3 blocos montados", temaNumero: "Tema 08",
    lead: "Compreenda os fluidos em repouso e suas propriedades.",
    topicos: [
      { id: "conceitos-de-hidrostatica", titulo: "Conceitos fundamentais" },
      { id: "teorema-de-stevin", titulo: "Teorema de Stevin" },
      { id: "principio-de-arquimedes", titulo: "Princípio de Arquimedes" }
    ]
  },
  {
    id: "hidrodinamica", titulo: "Hidrodinâmica",
    descricao: "Vazão, equação da continuidade e equação de Bernoulli.",
    destaque: "1 bloco montado", temaNumero: "Tema 09",
    lead: "Entenda o movimento dos fluidos e suas aplicações.",
    topicos: [
      { id: "conceitos-de-hidrodinamica", titulo: "Conceitos fundamentais" }
    ]
  },
  {
    id: "eletrostatica", titulo: "Eletrostática",
    descricao: "Carga elétrica, campo, potencial e capacitância.",
    destaque: "6 blocos montados", temaNumero: "Tema 10",
    lead: "Estude as propriedades das cargas elétricas em repouso.",
    topicos: [
      { id: "carga-e-processos-de-eletrizacao", titulo: "Carga elétrica e eletrização" },
      { id: "lei-de-coulomb", titulo: "Lei de Coulomb" },
      { id: "campo-eletrico", titulo: "Campo elétrico" },
      { id: "potencial-eletrico", titulo: "Potencial elétrico" },
      { id: "capacitancia", titulo: "Capacitância" }
    ]
  },
  {
    id: "eletrodinamica", titulo: "Eletrodinâmica",
    descricao: "Corrente elétrica, resistores, circuitos e potência.",
    destaque: "7 blocos montados", temaNumero: "Tema 11",
    lead: "Explore o movimento das cargas elétricas nos circuitos.",
    topicos: [
      { id: "corrente-eletrica", titulo: "Corrente elétrica" },
      { id: "resistores-e-lei-de-ohm", titulo: "Resistores e Lei de Ohm" },
      { id: "associacao-de-resistores", titulo: "Associação de resistores" },
      { id: "potencia-e-consumo", titulo: "Potência e consumo de energia" },
      { id: "instrumentos-de-medida", titulo: "Instrumentos de medida" }
    ]
  },
  {
    id: "eletromagnetismo", titulo: "Eletromagnetismo",
    descricao: "Campo magnético, indução, ondas e aplicações.",
    destaque: "4 blocos montados", temaNumero: "Tema 12",
    lead: "Descubra a relação entre eletricidade e magnetismo.",
    topicos: [
      { id: "campo-magnetico", titulo: "Campo magnético" },
      { id: "forca-magnetica", titulo: "Força magnética" },
      { id: "inducao-eletromagnetica", titulo: "Indução eletromagnética" },
      { id: "ondas-eletromagneticas", titulo: "Ondas eletromagnéticas" }
    ]
  }
];

const APOSTILAS_MAP = {
  cinematica: {
    "introducao-a-cinematica": { url: "apostilas/bloco1-introducao-cinematica.pdf?v=2", nome: "bloco1-introducao-cinematica.pdf" },
    "movimento-retilineo-constante": { url: "apostilas/bloco2-mru.pdf?v=2", nome: "bloco2-mru.pdf" },
    "aceleracao-em-linha-reta": { url: "apostilas/bloco3-mruv.pdf?v=2", nome: "bloco3-mruv.pdf" },
    "vetores-do-movimento": { url: "apostilas/bloco4-vetores-do-movimento.pdf?v=2", nome: "bloco4-vetores-do-movimento.pdf" },
    "trajetorias-circulares-e-polias": { url: "apostilas/bloco5-movimento-circular-e-polias.pdf?v=2", nome: "bloco5-movimento-circular-e-polias.pdf" },
    "quedas-e-subidas-verticais": { url: "apostilas/bloco6-movimentos-verticais.pdf?v=2", nome: "bloco6-movimentos-verticais.pdf" },
    "lancamentos-em-duas-dimensoes": { url: "apostilas/bloco7-lancamento-horizontal-e-obliquo.pdf?v=2", nome: "bloco7-lancamento-horizontal-e-obliquo.pdf" }
  },
  termologia: {
    "fundamentos-de-termologia": { url: "apostilas/termologia1-fundamentos-de-termologia.pdf?v=2", nome: "termologia1-fundamentos-de-termologia.pdf" },
    "medidas-e-escalas-termicas": { url: "apostilas/termologia2-escalas-termicas.pdf?v=2", nome: "termologia2-escalas-termicas.pdf" },
    "dilatacao-em-solidos-e-fluidos": { url: "apostilas/termologia3-dilatacao-termica.pdf?v=2", nome: "termologia3-dilatacao-termica.pdf" },
    "misturas-e-calorimetria": { url: "apostilas/termologia4-calorimetria.pdf?v=2", nome: "termologia4-calorimetria.pdf" },
    "caminhos-da-propagacao-do-calor": { url: "apostilas/termologia5-propagacao-de-calor.pdf?v=2", nome: "termologia5-propagacao-de-calor.pdf" },
    "comportamento-termico-dos-gases": { url: "apostilas/termologia6-estudo-dos-gases.pdf?v=2", nome: "termologia6-estudo-dos-gases.pdf" },
    "principios-da-termodinamica": { url: "apostilas/termologia7-termodinamica.pdf?v=2", nome: "termologia7-termodinamica.pdf" }
  },
  ondulatoria: {
    "ideias-iniciais-de-ondulatoria": { url: "apostilas/ondulatoria1-conceitos-iniciais.pdf?v=2", nome: "ondulatoria1-conceitos-iniciais.pdf" },
    "fenomenos-das-ondas": { url: "apostilas/ondulatoria2-fenomenos-ondulatorios.pdf?v=2", nome: "ondulatoria2-fenomenos-ondulatorios.pdf" },
    "natureza-e-propriedades-do-som": { url: "apostilas/ondulatoria3-propriedades-do-som.pdf?v=2", nome: "ondulatoria3-propriedades-do-som.pdf" },
    "efeitos-sonoros-no-dia-a-dia": { url: "apostilas/ondulatoria4-fenomenos-sonoros.pdf?v=2", nome: "ondulatoria4-fenomenos-sonoros.pdf" },
    "ressonancia-em-cordas-e-tubos": { url: "apostilas/ondulatoria5-cordas-e-tubos-sonoros.pdf?v=2", nome: "ondulatoria5-cordas-e-tubos-sonoros.pdf" },
    "oscilacao-e-movimento-harmonico": { url: "apostilas/ondulatoria6-movimento-harmonico-simples.pdf?v=2", nome: "ondulatoria6-movimento-harmonico-simples.pdf" }
  },
  optica: {
    "principios-da-optica-geometrica": { url: "apostilas/optica1-conceitos-fundamentais.pdf?v=2", nome: "optica1-conceitos-fundamentais.pdf" },
    "reflexao-em-espelhos-planos": { url: "apostilas/optica2-espelhos-planos.pdf?v=2", nome: "optica2-espelhos-planos.pdf" },
    "espelhos-esfericos-na-pratica": { url: "apostilas/optica3-espelhos-esfericos.pdf?v=2", nome: "optica3-espelhos-esfericos.pdf" },
    "desvio-da-luz-e-refracao": { url: "apostilas/optica4-refracao-da-luz.pdf?v=2", nome: "optica4-refracao-da-luz.pdf" },
    "lentes-imagens-e-visao": { url: "apostilas/optica5-lentes-e-visao.pdf?v=2", nome: "optica5-lentes-e-visao.pdf" }
  }
};

const SUBJECT_ICONS = {
  cinematica: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0Z M12 12a2 2 0 100-4 2 2 0 000 4Z",
  dinamica: "M4 4l16 16M20 4l-8 8M4 20l8-8",
  termologia: "M12 2v4M12 10v4M12 18v2M8 4h8M6 8h12M4 14h16M4 20h16M6 22h12",
  optica: "M2 12h20M12 2v20M17 7l-5 5 5 5M7 7l5 5-5 5",
  ondulatoria: "M2 12c4-8 8-8 12 0s8 8 12 0",
  gravitacao: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 2v20M2 12h20",
  estatica: "M2 20h20M6 16V8a2 2 0 014 0v8M10 16V4a2 2 0 014 0v12M14 16V8a2 2 0 014 0v8",
  hidrostatica: "M12 2v20M2 12h20M6 8h12M6 16h12",
  hidrodinamica: "M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0",
  eletrostatica: "M12 2a4 4 0 00-4 4c0 2 1 3 4 6 3-3 4-4 4-6a4 4 0 00-4-4zM12 18v4",
  eletrodinamica: "M12 2v6M12 16v6M4 6l16 12M4 18l16-12M8 12h8",
  eletromagnetismo: "M8 3a7 7 0 100 14 7 7 0 000-14zM16 3a7 7 0 010 14M3 10h18"
};

const ICON_APOSTILA = "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z";
const ICON_AULA = "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
const ICON_QUESTOES = "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01";
const ICON_EXTERNAL = "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3";
const ICON_BACK = "M19 12H5M12 19l-7-7 7-7";

export default function Apostilas() {
  const [screen, setScreen] = useState("topics");
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [apostilaModal, setApostilaModal] = useState(null);

  const currentSubject = useMemo(() => {
    if (!currentSubjectId) return null;
    return FISICA_UI_CONFIG.find((s) => s.id === currentSubjectId) || null;
  }, [currentSubjectId]);

  const openSubject = useCallback((id) => {
    setCurrentSubjectId(id);
    setScreen("detail");
  }, []);

  const backToTopics = useCallback(() => {
    setScreen("topics");
  }, []);

  const openApostila = useCallback((topicId, subjectId) => {
    const apostila = (APOSTILAS_MAP[subjectId] || {})[topicId];
    const topico = (FISICA_UI_CONFIG.find((s) => s.id === subjectId) || {}).topicos?.find((t) => t.id === topicId);
    if (apostila) {
      setApostilaModal({
        url: apostila.url,
        nome: apostila.nome,
        titulo: topico?.titulo || "Apostila",
        assunto: subjectId
      });
    }
  }, []);

  const closeApostila = useCallback(() => {
    setApostilaModal(null);
  }, []);

  return (
    <section className="page-shell">
      <div className="page-shell-content">
        <div className="fisica-shell">
          <div className={`fisica-screen${screen === "topics" ? " active" : ""}`} id="fisicaTopicsScreen">
            <div className="fisica-hero">
              <span className="ui-badge">Física Básica</span>
              <h2>Programação de estudos</h2>
              <p>Escolha um assunto e veja o material de apoio disponível para cada tópico.</p>
            </div>
            <div className="fisica-topics-grid" role="list">
              {FISICA_UI_CONFIG.map((subject) => (
                <button
                  key={subject.id}
                  className="fisica-topic-card fisica-topic-card-action card-subject"
                  type="button"
                  role="listitem"
                  aria-label={subject.titulo}
                  onClick={() => openSubject(subject.id)}
                >
                  <span className="fisica-topic-icon-box icon-box icon-box-purple">
                    <SvgIcon d={SUBJECT_ICONS[subject.id] || SUBJECT_ICONS.cinematica} size={22} />
                  </span>
                  <span className="subject-name">{subject.titulo}</span>
                  <small>{subject.destaque || ""}</small>
                  <p>{subject.descricao}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={`fisica-screen${screen === "detail" ? " active" : ""}`} id="fisicaTopicDetailScreen">
            {currentSubject && (
              <div className="study-module topic-detail-module">
                <div className="study-module-header">
                  <button type="button" className="fisica-back-btn" onClick={backToTopics}>
                    <SvgIcon d={ICON_BACK} size={18} /> Voltar para os assuntos
                  </button>
                  <span className="study-module-kicker">{currentSubject.temaNumero || "Tema"}</span>
                  <h1>{currentSubject.titulo}</h1>
                  {currentSubject.lead && <p className="lead">{currentSubject.lead}</p>}
                </div>
                <div className="topic-detail-shell">
                  <div className="topic-section-stack">
                    {currentSubject.topicos.map((topico, index) => {
                      const apostila = (APOSTILAS_MAP[currentSubject.id] || {})[topico.id];
                      const label = currentSubject.temaNumero
                        ? `${currentSubject.temaNumero.replace("Tema", "Bloco")} ${String(index + 1).padStart(2, "0")}`
                        : `Bloco ${String(index + 1).padStart(2, "0")}`;
                      return (
                        <section className="topic-section-block" key={topico.id}>
                          <div className="topic-section-heading">
                            <span className="topic-section-index">{label}</span>
                            <h3>{topico.titulo}</h3>
                          </div>
                          <div className="topic-card-grid topic-card-grid-compact">
                            {apostila && (
                              <article className="topic-path-card topic-path-apostila">
                                <span className="topic-path-icon icon-box">
                                  <SvgIcon d={ICON_APOSTILA} size={21} />
                                </span>
                                <span className="topic-path-tag">Apostila</span>
                                <h3>{topico.titulo}</h3>
                                <p>Material de estudo em PDF.</p>
                                <button
                                  type="button"
                                  className="topic-path-button"
                                  onClick={() => openApostila(topico.id, currentSubject.id)}
                                >
                                  Ler apostila
                                </button>
                              </article>
                            )}
                            <article className="topic-path-card topic-path-lesson">
                              <span className="topic-path-icon icon-box">
                                <SvgIcon d={ICON_AULA} size={21} />
                              </span>
                              <span className="topic-path-tag">Aula</span>
                              <h3>{topico.titulo}</h3>
                              <p>Vídeo-aula em breve.</p>
                              <button type="button" className="topic-path-button topic-path-button-muted" disabled>
                                Em breve
                              </button>
                            </article>
                            <article className="topic-path-card topic-path-questions">
                              <span className="topic-path-icon icon-box">
                                <SvgIcon d={ICON_QUESTOES} size={21} />
                              </span>
                              <span className="topic-path-tag">Questões</span>
                              <h3>Prática de {topico.titulo}</h3>
                              <p>Questões em breve.</p>
                              <button type="button" className="topic-path-button topic-path-button-muted" disabled>
                                Em breve
                              </button>
                            </article>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {apostilaModal && (
        <div className="apostila-overlay" onClick={(e) => { if (e.target.closest("[data-apostila-close]")) closeApostila(); }}>
          <div className="apostila-backdrop" data-apostila-close="true"></div>
          <section className="apostila-dialog" role="dialog" aria-modal="true" aria-labelledby="apostilaTitle">
            <header className="apostila-header">
              <div>
                <span className="apostila-eyebrow">Universo Relativo</span>
                <h1 id="apostilaTitle">{apostilaModal.titulo}</h1>
              </div>
              <button type="button" className="apostila-close" data-apostila-close="true" aria-label="Fechar apostila">
                ×
              </button>
            </header>
            <div className="apostila-content">
              <div className="apostila-sheet">
                <h2>{apostilaModal.titulo}</h2>
                <div className="apostila-pdf-shell">
                  <div className="apostila-pdf-meta">
                    <strong>{apostilaModal.nome}</strong>
                    <span>Leitura incorporada na plataforma.</span>
                  </div>
                  <div className="apostila-pdf-frame">
                    <iframe
                      src={`/${apostilaModal.url}`}
                      title="Apostila em PDF"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </div>
                <div className="apostila-actions">
                  <a
                    className="apostila-open-link"
                    href={`/${apostilaModal.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SvgIcon d={ICON_EXTERNAL} size={16} /> Abrir em nova aba
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
