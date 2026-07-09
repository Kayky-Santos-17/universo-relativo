import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/Toast";

const FISICA_UI_CONFIG = [
  { id: "cinematica", titulo: "Cinemática", topicos: [
    { id: "introducao-a-cinematica", titulo: "Introdução à Cinemática" },
    { id: "movimento-retilineo-constante", titulo: "Movimento retilíneo uniforme" },
    { id: "aceleracao-em-linha-reta", titulo: "Movimento retilíneo uniformemente variado" },
    { id: "vetores-do-movimento", titulo: "Vetores do movimento" },
    { id: "trajetorias-circulares-e-polias", titulo: "Movimento circular e polias" },
    { id: "quedas-e-subidas-verticais", titulo: "Movimentos verticais" },
    { id: "lancamentos-em-duas-dimensoes", titulo: "Lançamento horizontal e oblíquo" }
  ]},
  { id: "dinamica", titulo: "Dinâmica", topicos: [
    { id: "bases-das-leis-de-newton", titulo: "Princípios de Newton" },
    { id: "molas-e-forca-restauradora", titulo: "Força elástica" },
    { id: "arranjos-de-blocos", titulo: "Sistemas de blocos" },
    { id: "atrito-em-superficies", titulo: "Força de atrito" },
    { id: "dinamica-da-forca-centripeta", titulo: "Força centrípeta" },
    { id: "trabalho-e-energia-em-acao", titulo: "Trabalho e energia mecânica" },
    { id: "impulso-e-quantidade-de-movimento", titulo: "Impulso e quantidade de movimento" }
  ]},
  { id: "termologia", titulo: "Termologia", topicos: [
    { id: "fundamentos-de-termologia", titulo: "Fundamentos de Termologia" },
    { id: "medidas-e-escalas-termicas", titulo: "Escalas térmicas" },
    { id: "dilatacao-em-solidos-e-fluidos", titulo: "Dilatação térmica" },
    { id: "misturas-e-calorimetria", titulo: "Calorimetria" },
    { id: "caminhos-da-propagacao-do-calor", titulo: "Propagação de calor" },
    { id: "comportamento-termico-dos-gases", titulo: "Estudo dos gases" },
    { id: "principios-da-termodinamica", titulo: "Termodinâmica" }
  ]},
  { id: "optica", titulo: "Óptica", topicos: [
    { id: "principios-da-optica-geometrica", titulo: "Conceitos fundamentais" },
    { id: "reflexao-em-espelhos-planos", titulo: "Espelhos planos" },
    { id: "espelhos-esfericos-na-pratica", titulo: "Espelhos esféricos" },
    { id: "desvio-da-luz-e-refracao", titulo: "Refração da luz" },
    { id: "lentes-imagens-e-visao", titulo: "Lentes e visão" }
  ]},
  { id: "ondulatoria", titulo: "Ondulatória", topicos: [
    { id: "ideias-iniciais-de-ondulatoria", titulo: "Conceitos iniciais" },
    { id: "fenomenos-das-ondas", titulo: "Fenômenos ondulatórios" },
    { id: "natureza-e-propriedades-do-som", titulo: "Propriedades do som" },
    { id: "efeitos-sonoros-no-dia-a-dia", titulo: "Fenômenos sonoros" },
    { id: "ressonancia-em-cordas-e-tubos", titulo: "Cordas e tubos sonoros" },
    { id: "oscilacao-e-movimento-harmonico", titulo: "Movimento harmônico simples" }
  ]},
  { id: "gravitacao", titulo: "Gravitação", topicos: [] },
  { id: "relatividade-geral", titulo: "Relatividade Geral", topicos: [] }
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

const ASSUNTO_MAP = {
  cinematica: "Cinemática",
  dinamica: "Dinâmica",
  termologia: "Termologia",
  optica: "Óptica e ondas",
  ondulatoria: "Óptica e ondas",
  relatividade: "Relatividade Especial"
};

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function chaveAtividades(uid) {
  return "universo_relativo_atividades_dashboard_" + (uid || "anonimo");
}

function listarAtividades(uid) {
  try {
    return JSON.parse(localStorage.getItem(chaveAtividades(uid)) || "[]")
      .filter((i) => i && i.titulo && i.tipo);
  } catch { return []; }
}

function montarApostilas() {
  return [
    ["Cinemática", "cinematica", APOSTILAS_MAP.cinematica],
    ["Termologia", "termologia", APOSTILAS_MAP.termologia],
    ["Óptica", "optica", APOSTILAS_MAP.optica],
    ["Ondulatória", "ondulatoria", APOSTILAS_MAP.ondulatoria]
  ].map(([label, assuntoId, mapa]) => {
    const config = FISICA_UI_CONFIG.find((i) => i.id === assuntoId);
    const topicos = (config || {}).topicos || [];
    const itens = topicos
      .map((t) => ({ topico: t, apostila: mapa[t.id] }))
      .filter((i) => i.apostila);
    return { label, assuntoId, itens };
  }).filter((g) => g.itens.length);
}

function iconeLucide(nome) {
  const paths = {
    "clipboard-check": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    "badge-check": "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
    "timer": "M10 2h4M12 14l3.5-3.5M12 2v2M4.93 4.93l1.41 1.41M2 12h2M18.36 6.36l1.41-1.41",
    "graduation-cap": "M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 6 2 10 0v-5M18 9.5V5",
    "dumbbell": "M6.5 6.5L17.5 17.5M2 5l2 2M2 19l2-2M20 5l-2 2M20 19l-2-2M14.5 6.5l7 7M2.5 10.5l7 7",
    "book-open": "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
    "clipboard-list": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    "questao": "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01",
    "questao-certa": "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
    "apostila": "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
    "aula": "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
  };
  const d = paths[nome] || paths["clipboard-list"];
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

function htmlEscape(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

const SvgIcon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, userData, loading } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const uid = user?.uid || "anonimo";

  const nomeAluno = useMemo(() => {
    const n = userData?.nome || user?.email?.split("@")[0] || "Aluno";
    return n.trim();
  }, [userData, user]);

  const progresso = useMemo(() => {
    const p = (userData && userData.progresso) || {};
    return {
      questoesRespondidas: Number(p.questoesRespondidas || 0),
      acertos: Number(p.acertos || 0),
      aproveitamento: Number(p.aproveitamento || 0),
      sessoesConcluidas: Number(p.sessoesConcluidas || 0),
      aulasConcluidas: Number(p.aulasConcluidas || 0)
    };
  }, [userData]);

  const horasEstimadas = (progresso.sessoesConcluidas * 0.5).toFixed(1).replace(".0", "") + "h";
  const focusPct = Math.min(100, Math.round((progresso.questoesRespondidas / 20) * 100));
  const focusDone = Math.min(progresso.questoesRespondidas, 20);

  useEffect(() => {
    setAtividades(listarAtividades(uid));
  }, [uid]);

  const gruposApostilas = useMemo(() => montarApostilas(), []);

  const materiasBars = useMemo(() => {
    const materias = ["Cinemática", "Dinâmica", "Termologia", "Óptica e ondas", "Relatividade Especial"];
    const contagemPorMateria = new Map();
    return materias.map((materia) => {
      const questoes = contagemPorMateria.get(materia) || 0;
      const aulas = Number((userData?.progressoPorMateria?.[materia]?.aulasConcluidas) || 0);
      const percentual = Math.max(0, Math.min(100, Math.round(Math.min(questoes, 20) * 3.5 + Math.min(aulas, 2) * 15)));
      return { materia, questoes, aulas, percentual };
    });
  }, [userData]);

  if (loading) return null;

  return (
    <section className="secao-inicio">
      <div className="dashboard-shell dashboard-space">
        <div className="dashboard-cosmos-bg" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>

        <section className="dashboard-hero dashboard-hero-dark">
          <div>
            <span className="ui-badge">Painel do aluno</span>
            <h1 id="dashboardGreeting">{saudacao()}, {htmlEscape(nomeAluno)}!</h1>
            <p>Foco hoje, aprovação amanhã.</p>
          </div>
        </section>

        <section className="dashboard-stats-grid dashboard-stats-dark">
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon icon-box stat-purple"><SvgIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></span>
            <div><span>Questões respondidas</span><strong>{progresso.questoesRespondidas}</strong></div>
          </article>
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon icon-box stat-green"><SvgIcon d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" /></span>
            <div><span>Taxa de acertos</span><strong>{progresso.aproveitamento}%</strong></div>
          </article>
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon icon-box stat-blue"><SvgIcon d="M10 2h4M12 14l3.5-3.5M12 2v2M4.93 4.93l1.41 1.41M2 12h2M18.36 6.36l1.41-1.41" /></span>
            <div><span>Tempo de estudo</span><strong>{horasEstimadas}</strong></div>
          </article>
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon icon-box stat-orange"><SvgIcon d="M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 6 2 10 0v-5M18 9.5V5" /></span>
            <div><span>Aulas concluídas</span><strong>{progresso.aulasConcluidas}</strong></div>
          </article>
        </section>

        <section className="dashboard-panels dashboard-main-grid">
          <article className="dashboard-panel dashboard-progress-panel">
            <div className="dashboard-panel-head">
              <h3>Seu progresso por matéria</h3>
              <button type="button" className="dashboard-link-btn" onClick={() => navigate("/trilhas")}>Ver trilhas</button>
            </div>
            <div className="dashboard-discipline-list">
              {materiasBars.map(({ materia, questoes, aulas, percentual }) => (
                <div className="dashboard-discipline-item" key={materia}>
                  <div className="dashboard-discipline-top">
                    <span>
                      <span className="dashboard-matter-icon icon-box"><SvgIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></span>
                      {materia}
                    </span>
                    <strong>{percentual}%</strong>
                  </div>
                  <div className="dashboard-bar"><div style={{ width: percentual + "%" }}></div></div>
                  <small>{questoes} questões respondidas{aulas ? ` + ${aulas} aulas concluídas` : ""}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-panel dashboard-recent-panel">
            <div className="dashboard-panel-head">
              <h3>Atividade recente</h3>
              <button type="button" className="dashboard-link-btn" onClick={() => navigate("/questoes")}>Treinar</button>
            </div>
            <div className="dashboard-activity-list">
              {atividades.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: ".9rem" }}>Nenhuma atividade registrada ainda.</p>
              )}
              {atividades.slice(0, 6).map((item, i) => {
                const tipo = item.tipo || "questao";
                const iconD = iconeLucide(tipo);
                return (
                  <div className="dashboard-activity-item" key={i}>
                    <span className={`activity-icon icon-box activity-${htmlEscape(tipo)}`}
                      dangerouslySetInnerHTML={{ __html: iconD }} />
                    <div>
                      <small>{htmlEscape(item.titulo)}</small>
                      <strong>{htmlEscape(item.detalhe || "Universo Relativo")}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="dashboard-panel dashboard-focus-panel">
            <span className="dashboard-focus-icon icon-box"><SvgIcon d="M6.5 6.5L17.5 17.5M2 5l2 2M2 19l2-2M20 5l-2 2M20 19l-2-2M14.5 6.5l7 7M2.5 10.5l7 7" size={28} /></span>
            <h3>Foco de hoje</h3>
            <p>Resolver questões e continuar uma trilha de estudo.</p>
            <div className="dashboard-focus-number">
              <strong>{focusDone}</strong><span>/20</span>
            </div>
            <div className="dashboard-bar"><div style={{ width: focusPct + "%" }}></div></div>
            <button className="btn btn-primary dashboard-panel-btn" onClick={() => navigate("/questoes")}>Continuar estudando</button>
          </article>

          <article className="dashboard-panel dashboard-apostilas-panel">
            <div className="dashboard-panel-head">
              <h3>Flash cards por assunto</h3>
              <button type="button" className="dashboard-link-btn" onClick={() => navigate("/flashcards")}>Revisar</button>
            </div>
            <div className="dashboard-apostila-groups">
              {gruposApostilas.map((grupo) => (
                <section className="dashboard-apostila-group" key={grupo.assuntoId}>
                  <h4>{grupo.label}</h4>
                  <button type="button" onClick={() => navigate("/flashcards")}>Abrir central de flash cards</button>
                </section>
              ))}
            </div>
          </article>

          <article className="dashboard-panel dashboard-quote-panel">
            <img src="/images/einstein-dashboard.jpg" alt="Albert Einstein" loading="lazy" />
            <span className="dashboard-quote-mark">&ldquo;</span>
            <p>A imaginação é mais importante que o conhecimento.</p>
            <strong>Albert Einstein</strong>
          </article>
        </section>
      </div>
    </section>
  );
}
