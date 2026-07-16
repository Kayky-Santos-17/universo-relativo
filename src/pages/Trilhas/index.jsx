import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAll, getSubCollection } from "../../services/firestore";
import { COLECAO } from "../../utils/constants";
import SvgIcon from "../../components/SvgIcon";

const ICON_BACK = "M19 12H5M12 19l-7-7 7-7";
const ICON_AULA = "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";
const ICON_APOSTILA = "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z";
const ICON_QUESTOES = "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01";

const ASSUNTOS = [
  { id: "cinematica", titulo: "Cinemática", ordem: 1 },
  { id: "dinamica", titulo: "Dinâmica", ordem: 2 },
  { id: "gravitacao", titulo: "Gravitação", ordem: 3 },
  { id: "estatica", titulo: "Estática", ordem: 4 },
  { id: "hidrostatica", titulo: "Hidrostática", ordem: 5 },
  { id: "hidrodinamica", titulo: "Hidrodinâmica", ordem: 6 },
  { id: "termologia", titulo: "Termologia", ordem: 7 },
  { id: "ondulatoria", titulo: "Ondulatória", ordem: 8 },
  { id: "optica", titulo: "Óptica", ordem: 9 },
  { id: "eletrostatica", titulo: "Eletrostática", ordem: 10 },
  { id: "eletrodinamica", titulo: "Eletrodinâmica", ordem: 11 },
  { id: "eletromagnetismo", titulo: "Eletromagnetismo", ordem: 12 }
];

const TAG_MAP = {
  aula: { icon: ICON_AULA, label: "Aula" },
  apostila: { icon: ICON_APOSTILA, label: "Apostila" },
  questoes: { icon: ICON_QUESTOES, label: "Questões" }
};

export default function Trilhas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { slug } = useParams();

  const [cards, setCards] = useState([]);
  const [progresso, setProgresso] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [snapCards, snapProgresso] = await Promise.all([
          getAll("questoes_cards"),
          user ? getSubCollection(COLECAO.alunos, user.uid, "progresso_listas").catch(() => ({ forEach: () => {} })) : Promise.resolve({ forEach: () => {} })
        ]);
        if (cancelled) return;
        const todosCards = [];
        snapCards.forEach((d) => {
          const data = d.data();
          if (data.ativo === false) return;
          todosCards.push({ id: d.id, ...data });
        });
        const progressoMap = {};
        snapProgresso.forEach((d) => {
          const data = d.data();
          if (data.listaKey) progressoMap[data.listaKey] = true;
        });
        setCards(todosCards);
        setProgresso(progressoMap);
      } catch (err) {
        console.error("Erro ao carregar trilhas:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const assuntoComCards = useMemo(() => {
    const map = {};
    cards.forEach((card) => {
      const assuntoId = card.assuntoId || "outros";
      if (!map[assuntoId]) map[assuntoId] = [];
      map[assuntoId].push(card);
    });
    return ASSUNTOS.map((a) => ({
      ...a,
      cards: map[a.id] || [],
      completo: (map[a.id] || []).every((c) => progresso[c.id])
    })).filter((a) => a.cards.length > 0);
  }, [cards, progresso]);

  const cardsSemAssunto = useMemo(() => {
    return cards.filter((c) => !ASSUNTOS.some((a) => a.id === c.assuntoId));
  }, [cards]);

  if (loading) {
    return (
      <section className="page-shell">
        <div className="page-shell-content">
          <div className="fisica-shell">
            <div className="fisica-hero">
              <p>Carregando trilhas...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-shell-content">
        <div className="fisica-shell">
          <div className="fisica-hero">
            <span className="ui-badge">Trilhas de Aprendizagem</span>
            <h2>Programação de estudos</h2>
            <p>Progresso organizado por assunto com aulas, apostilas e questões.</p>
          </div>

          {assuntoComCards.length === 0 && (
            <p style={{ color: "#94a3b8" }}>Nenhum módulo de estudo disponível no momento.</p>
          )}

          {assuntoComCards.map((assunto) => (
            <div key={assunto.id} className="study-module" style={{ marginBottom: "20px" }}>
              <div className="study-module-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="study-module-kicker">
                    Tema {String(assunto.ordem).padStart(2, "0")}
                  </span>
                  <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.8rem)" }}>{assunto.titulo}</h1>
                </div>
                {assunto.completo && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(34,197,94,.18)", color: "#86efac", fontSize: ".85rem", fontWeight: 700 }}>
                    <SvgIcon d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" size={16} /> Completo
                  </span>
                )}
              </div>

              <div className="topic-card-grid-compact" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px" }}>
                {assunto.cards
                  .sort((a, b) => (a.ordemExibicao || 0) - (b.ordemExibicao || 0))
                  .map((card) => {
                    const tagInfo = TAG_MAP[card.tipo] || { icon: ICON_APOSTILA, label: card.tipo };
                    const concluido = !!progresso[card.id];
                    return (
                      <article key={card.id} className="topic-path-card" style={{ minHeight: "160px", opacity: card.ativo === false ? 0.5 : 1 }}>
                        <span className="topic-path-icon icon-box" style={{ color: concluido ? "#86efac" : "#c4b5fd" }}>
                          <SvgIcon d={tagInfo.icon} size={21} />
                        </span>
                        <span className="topic-path-tag">{tagInfo.label}</span>
                        <h3>{card.titulo}</h3>
                        {card.descricao && <p>{card.descricao}</p>}
                        {concluido && (
                          <span style={{ color: "#22c55e", fontSize: ".82rem", fontWeight: 700 }}>Concluído</span>
                        )}
                        {card.tipo === "questoes" && (
                          <button
                            type="button"
                            className="topic-path-button"
                            disabled={card.botaoDesabilitado === true}
                            onClick={() => navigate(`/questoes?assunto=${card.assuntoId}`)}
                          >
                            {card.botaoLabel || "Praticar"}
                          </button>
                        )}
                        {(card.tipo === "apostila" || card.tipo === "aula") && card.botaoDesabilitado !== true && card.apostilaUrl && (
                          <a
                            href={card.apostilaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="topic-path-button"
                            style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}
                          >
                            {card.botaoLabel || "Abrir"}
                          </a>
                        )}
                      </article>
                    );
                  })}
              </div>
            </div>
          ))}

          {cardsSemAssunto.length > 0 && (
            <div className="study-module" style={{ marginBottom: "20px" }}>
              <div className="study-module-header">
                <h1 style={{ fontSize: "clamp(1.3rem,2vw,1.8rem)" }}>Outros módulos</h1>
              </div>
              <div className="topic-card-grid-compact" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px" }}>
                {cardsSemAssunto.map((card) => (
                  <article key={card.id} className="topic-path-card" style={{ minHeight: "160px" }}>
                    <span className="topic-path-icon icon-box">
                      <SvgIcon d={ICON_APOSTILA} size={21} />
                    </span>
                    <span className="topic-path-tag">{card.tipo || "Módulo"}</span>
                    <h3>{card.titulo}</h3>
                    {card.descricao && <p>{card.descricao}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}