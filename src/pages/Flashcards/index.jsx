import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAll, getSubCollection, addToSubCollection } from "../../services/firestore";
import { COLECAO } from "../../utils/constants";
import SvgIcon from "../../components/SvgIcon";

const ICON_FLIP = "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z";
const ICON_VIREI = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
const ICON_FACIL = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_MEDIO = "M12 8v4M12 16h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z";
const ICON_DIFICIL = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_ANTERIOR = "M19 12H5M12 19l-7-7 7-7";
const ICON_PROXIMO = "M5 12h14M12 5l7 7-7 7";
const ICON_MAIS = "M12 5v14M5 12h14";
const ICON_FECHAR = "M18 6L6 18M6 6l12 12";

const MATERIAS = [
  "Todas", "Cinemática", "Dinâmica", "Termologia", "Óptica",
  "Ondulatória", "Eletrostática", "Eletrodinâmica", "Eletromagnetismo"
];

export default function Flashcards() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [flashcards, setFlashcards] = useState([]);
  const [progresso, setProgresso] = useState({});
  const [loading, setLoading] = useState(true);
  const [atual, setAtual] = useState(0);
  const [virado, setVirado] = useState(false);
  const [materiaFiltro, setMateriaFiltro] = useState("Todas");
  const [criarAberto, setCriarAberto] = useState(false);
  const [novaPergunta, setNovaPergunta] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [novaMateria, setNovaMateria] = useState("Cinemática");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [snapCards, snapProgresso] = await Promise.all([
          getAll("flashcards"),
          uid ? getSubCollection(COLECAO.alunos, uid, "progresso_flashcards").catch(() => ({ forEach: () => {} })) : Promise.resolve({ forEach: () => {} })
        ]);
        if (cancelled) return;
        const cards = [];
        snapCards.forEach((d) => {
          const data = d.data();
          if (data.ativo === false) return;
          cards.push({ id: d.id, ...data });
        });
        const prog = {};
        snapProgresso.forEach((d) => {
          const data = d.data();
          prog[data.flashcardId] = data;
        });
        setFlashcards(cards);
        setProgresso(prog);
      } catch (err) {
        console.error("Erro ao carregar flashcards:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const filtrados = useMemo(() => {
    if (materiaFiltro === "Todas") return flashcards;
    return flashcards.filter((f) => (f.materia || f.assunto) === materiaFiltro);
  }, [flashcards, materiaFiltro]);

  const atualSeguro = Math.min(atual, Math.max(0, filtrados.length - 1));
  const cardAtual = filtrados[atualSeguro];

  const dominio = useMemo(() => {
    if (!cardAtual || !progresso[cardAtual.id]) return null;
    return progresso[cardAtual.id].dominio ?? null;
  }, [cardAtual, progresso]);

  const virar = () => setVirado((prev) => !prev);

  const avaliar = async (nivel) => {
    if (!uid || !cardAtual) return;
    setSalvando(true);
    try {
      await addToSubCollection(COLECAO.alunos, uid, "progresso_flashcards", {
        flashcardId: cardAtual.id,
        materia: cardAtual.materia || "",
        assunto: cardAtual.assunto || "",
        dominio: nivel,
        acertos: nivel >= 3 ? 1 : 0,
        erros: nivel <= 1 ? 1 : 0,
        tentativas: 1,
        ultimaRevisao: new Date()
      });
      setProgresso((prev) => ({
        ...prev,
        [cardAtual.id]: { ...(prev[cardAtual.id] || {}), dominio: nivel }
      }));
      if (atualSeguro < filtrados.length - 1) {
        setAtual((prev) => prev + 1);
        setVirado(false);
      }
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
    } finally {
      setSalvando(false);
    }
  };

  const criarFlashcard = async () => {
    const pergunta = novaPergunta.trim();
    const resposta = novaResposta.trim();
    if (!pergunta || !resposta) return;
    if (!uid) return;
    setSalvando(true);
    try {
      await addToSubCollection(COLECAO.alunos, uid, "flashcards_pessoais", {
        pergunta,
        resposta,
        materia: novaMateria,
        assunto: novaMateria,
        criadoPor: uid,
        origem: "aluno",
        ativo: true,
        criadoEm: new Date()
      });
      setFlashcards((prev) => [...prev, { id: Date.now().toString(), pergunta, resposta, materia: novaMateria, assunto: novaMateria }]);
      setNovaPergunta("");
      setNovaResposta("");
      setCriarAberto(false);
    } catch (err) {
      console.error("Erro ao criar flashcard:", err);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <section className="page-shell">
        <div className="page-shell-content">
          <div className="fisica-shell">
            <div className="fisica-hero"><p>Carregando flashcards...</p></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="page-shell-content">
        <div className="fisica-shell">
          <div className="fisica-hero" style={{ paddingBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span className="ui-badge">Flash Cards</span>
                <h2 style={{ margin: "8px 0 4px" }}>Revisão rápida</h2>
                <p style={{ fontSize: ".9rem" }}>{filtrados.length} cards · {materiaFiltro}</p>
              </div>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setCriarAberto((prev) => !prev)}>
                <SvgIcon d={criarAberto ? ICON_FECHAR : ICON_MAIS} size={16} /> {criarAberto ? "Fechar" : "Criar card"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              {MATERIAS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn btn-sm ${materiaFiltro === m ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => { setMateriaFiltro(m); setAtual(0); setVirado(false); }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {criarAberto && (
            <div className="study-module" style={{ marginBottom: "20px", padding: "20px" }}>
              <h3 style={{ marginBottom: "14px", color: "#fff" }}>Criar flashcard</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  className="form-control"
                  placeholder="Pergunta"
                  value={novaPergunta}
                  onChange={(e) => setNovaPergunta(e.target.value)}
                  style={{ background: "rgba(15,23,42,.58)", border: "1px solid rgba(148,163,184,.18)", color: "#fff", borderRadius: "12px", padding: "12px" }}
                />
                <input
                  className="form-control"
                  placeholder="Resposta"
                  value={novaResposta}
                  onChange={(e) => setNovaResposta(e.target.value)}
                  style={{ background: "rgba(15,23,42,.58)", border: "1px solid rgba(148,163,184,.18)", color: "#fff", borderRadius: "12px", padding: "12px" }}
                />
                <select
                  value={novaMateria}
                  onChange={(e) => setNovaMateria(e.target.value)}
                  style={{ background: "rgba(15,23,42,.58)", border: "1px solid rgba(148,163,184,.18)", color: "#fff", borderRadius: "12px", padding: "12px" }}
                >
                  {MATERIAS.filter((m) => m !== "Todas").map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button className="btn btn-primary" onClick={criarFlashcard} disabled={salvando || !novaPergunta.trim() || !novaResposta.trim()}>
                  {salvando ? "Salvando..." : "Salvar card"}
                </button>
              </div>
            </div>
          )}

          {filtrados.length === 0 && (
            <div className="study-module" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#94a3b8" }}>Nenhum flashcard disponível para {materiaFiltro}.</p>
            </div>
          )}

          {filtrados.length > 0 && cardAtual && (
            <div className="study-module" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "12px", color: "#94a3b8", fontSize: ".88rem" }}>
                {atualSeguro + 1} de {filtrados.length}
                {dominio !== null && <span style={{ marginLeft: "12px" }}>Domínio: {dominio}/5</span>}
              </div>

              <div
                className="flashcard-paper"
                onClick={virado ? undefined : virar}
                style={{
                  cursor: virado ? "default" : "pointer",
                  padding: "40px 30px",
                  borderRadius: "24px",
                  background: "linear-gradient(180deg,rgba(15,23,42,.88),rgba(2,6,23,.78))",
                  border: `2px solid ${virado ? "rgba(34,197,94,.34)" : "rgba(148,163,184,.18)"}`,
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color .3s ease"
                }}
              >
                {!virado ? (
                  <>
                    <SvgIcon d={ICON_FLIP} size={28} />
                    <p style={{ fontSize: "1.2rem", color: "#fff", margin: "16px 0 0", fontWeight: 700, maxWidth: "500px" }}>
                      {cardAtual.pergunta}
                    </p>
                    <small style={{ color: "#64748b", marginTop: "12px" }}>Clique para ver a resposta</small>
                  </>
                ) : (
                  <>
                    <span style={{ display: "inline-flex", padding: "4px 12px", borderRadius: "999px", background: "rgba(34,197,94,.18)", color: "#86efac", fontSize: ".82rem", fontWeight: 700, marginBottom: "16px" }}>
                      <SvgIcon d={ICON_VIREI} size={14} /> Resposta
                    </span>
                    <p style={{ fontSize: "1.15rem", color: "#e2e8f0", margin: 0, maxWidth: "500px", lineHeight: 1.6 }}>
                      {cardAtual.resposta}
                    </p>
                  </>
                )}
              </div>

              {virado && (
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
                  <button className="btn btn-sm" disabled={salvando} onClick={() => avaliar(1)}
                    style={{ background: "rgba(239,68,68,.14)", color: "#fca5a5", border: "1px solid rgba(239,68,68,.24)", borderRadius: "12px", padding: "8px 18px", fontWeight: 700 }}>
                    <SvgIcon d={ICON_DIFICIL} size={16} /> Difícil
                  </button>
                  <button className="btn btn-sm" disabled={salvando} onClick={() => avaliar(3)}
                    style={{ background: "rgba(245,158,11,.14)", color: "#fcd34d", border: "1px solid rgba(245,158,11,.24)", borderRadius: "12px", padding: "8px 18px", fontWeight: 700 }}>
                    <SvgIcon d={ICON_MEDIO} size={16} /> Médio
                  </button>
                  <button className="btn btn-sm" disabled={salvando} onClick={() => avaliar(5)}
                    style={{ background: "rgba(34,197,94,.14)", color: "#86efac", border: "1px solid rgba(34,197,94,.24)", borderRadius: "12px", padding: "8px 18px", fontWeight: 700 }}>
                    <SvgIcon d={ICON_FACIL} size={16} /> Fácil
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                <button className="btn btn-outline-secondary btn-sm" disabled={atualSeguro === 0}
                  onClick={() => { setAtual((prev) => prev - 1); setVirado(false); }}>
                  <SvgIcon d={ICON_ANTERIOR} size={16} /> Anterior
                </button>
                <button className="btn btn-outline-secondary btn-sm" disabled={atualSeguro >= filtrados.length - 1}
                  onClick={() => { setAtual((prev) => prev + 1); setVirado(false); }}>
                  Próxima <SvgIcon d={ICON_PROXIMO} size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}