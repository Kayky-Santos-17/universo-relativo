import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/Toast";
import { getSubCollection } from "../../services/firestore";
import { COLECAO } from "../../utils/constants";
import { htmlEscape, saudacao } from "../../utils/helpers";
import SvgIcon from "../../components/SvgIcon";

const ASSUNTO_MAP = {
  cinematica: "Cinemática",
  dinamica: "Dinâmica",
  termologia: "Termologia",
  optica: "Óptica e ondas",
  ondulatoria: "Óptica e ondas",
  relatividade: "Relatividade Especial"
};

function chaveAtividades(uid) {
  return "universo_relativo_atividades_dashboard_" + (uid || "anonimo");
}

function listarAtividades(uid) {
  try {
    return JSON.parse(localStorage.getItem(chaveAtividades(uid)) || "[]")
      .filter((i) => i && i.titulo && i.tipo);
  } catch { return []; }
}

const ICON_MAP = {
  "clipboard-check": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "questao": "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01",
};

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, userData, loading } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [contagemFirebase, setContagemFirebase] = useState(null);
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getSubCollection(COLECAO.alunos, user.uid, "progresso_questoes");
        if (cancelled) return;
        const contagem = {};
        snap.forEach((d) => {
          const data = d.data();
          const assuntoId = data.assuntoId || "";
          const nome = ASSUNTO_MAP[assuntoId] || null;
          if (nome) contagem[nome] = (contagem[nome] || 0) + 1;
        });
        setContagemFirebase(contagem);
      } catch {
        if (!cancelled) setContagemFirebase({});
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const materiasBars = useMemo(() => {
    const materias = ["Cinemática", "Dinâmica", "Termologia", "Óptica e ondas", "Relatividade Especial"];
    return materias.map((materia) => {
      const questoes = (contagemFirebase && contagemFirebase[materia]) || 0;
      const aulas = Number((userData?.progressoPorMateria?.[materia]?.aulasConcluidas) || 0);
      const percentual = Math.max(0, Math.min(100, Math.round(Math.min(questoes, 20) * 3.5 + Math.min(aulas, 2) * 15)));
      return { materia, questoes, aulas, percentual };
    });
  }, [userData, contagemFirebase]);

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
                return (
                  <div className="dashboard-activity-item" key={i}>
                    <span className={`activity-icon icon-box activity-${htmlEscape(tipo)}`}>
                      <SvgIcon d={ICON_MAP[tipo] || ICON_MAP["questao"]} size={20} />
                    </span>
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
              <h3>Flashcards</h3>
              <button type="button" className="dashboard-link-btn" onClick={() => navigate("/flashcards")}>Revisar</button>
            </div>
            <div style={{ padding: "8px 0" }}>
              <p style={{ color: "#94a3b8", fontSize: ".88rem", lineHeight: 1.6, margin: 0 }}>
                Revise conceitos-chave de Física com flashcards. Vire o card, tente lembrar a resposta e avalie seu nível de domínio.
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/flashcards")}>
                  Começar revisão
                </button>
              </div>
            </div>
          </article>

          <article className="dashboard-panel dashboard-quote-panel">
            <span className="dashboard-quote-mark">&ldquo;</span>
            <p>A imaginação é mais importante que o conhecimento.</p>
            <strong>Albert Einstein</strong>
          </article>
        </section>
      </div>
    </section>
  );
}
