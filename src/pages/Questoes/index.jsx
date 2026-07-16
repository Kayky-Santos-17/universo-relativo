import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/Toast";
import { getAll, getSubCollection, addToSubCollection } from "../../services/firestore";
import { COLECAO } from "../../utils/constants";
import SvgIcon from "../../components/SvgIcon";

const ASSUNTOS = [
  { id: "cinematica", titulo: "Cinemática", descricao: "Deslocamento, gráficos, lançamentos", icone: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0Z M12 12a2 2 0 100-4 2 2 0 000 4Z" },
  { id: "dinamica", titulo: "Dinâmica", descricao: "Forças, leis de Newton, energia", icone: "M4 4l16 16M20 4l-8 8M4 20l8-8" },
  { id: "termologia", titulo: "Termologia", descricao: "Calor, temperatura, termodinâmica", icone: "M12 2v4M12 10v4M12 18v2M8 4h8M6 8h12M4 14h16M4 20h16M6 22h12" },
  { id: "optica", titulo: "Óptica", descricao: "Reflexão, refração, lentes", icone: "M2 12h20M12 2v20M17 7l-5 5 5 5M7 7l5 5-5 5" },
  { id: "ondulatoria", titulo: "Ondulatória", descricao: "Ondas, acústica, MHS", icone: "M2 12c4-8 8-8 12 0s8 8 12 0" },
  { id: "gravitacao", titulo: "Gravitação", descricao: "Leis de Kepler, gravitação universal", icone: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 2v20M2 12h20" },
  { id: "estatica", titulo: "Estática", descricao: "Equilíbrio, torque, alavancas", icone: "M2 20h20M6 16V8a2 2 0 014 0v8M10 16V4a2 2 0 014 0v12M14 16V8a2 2 0 014 0v8" },
  { id: "hidrostatica", titulo: "Hidrostática", descricao: "Densidade, pressão, Arquimedes", icone: "M12 2v20M2 12h20M6 8h12M6 16h12" },
  { id: "hidrodinamica", titulo: "Hidrodinâmica", descricao: "Vazão, Bernoulli", icone: "M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0" },
  { id: "eletrostatica", titulo: "Eletrostática", descricao: "Carga elétrica, campo, potencial", icone: "M12 2a4 4 0 00-4 4c0 2 1 3 4 6 3-3 4-4 4-6a4 4 0 00-4-4zM12 18v4" },
  { id: "eletrodinamica", titulo: "Eletrodinâmica", descricao: "Corrente, resistores, circuitos", icone: "M12 2v6M12 16v6M4 6l16 12M4 18l16-12M8 12h8" },
  { id: "eletromagnetismo", titulo: "Eletromagnetismo", descricao: "Campo magnético, indução", icone: "M8 3a7 7 0 100 14 7 7 0 000-14zM16 3a7 7 0 010 14M3 10h18" }
];

function htmlDecode(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function renderHtml(html) {
  return { __html: html || "" };
}

export default function Questoes() {
  const { user } = useAuth();
  const toast = useToast();
  const uid = user?.uid;

  const [screen, setScreen] = useState("subjects");
  const [assuntoId, setAssuntoId] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [finalizadas, setFinalizadas] = useState({});
  const [registradas, setRegistradas] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [resolucaoAberta, setResolucaoAberta] = useState(false);
  const [videoAberto, setVideoAberto] = useState(false);

  const questaoAtual = questoes[atual];
  const totalQuestoes = questoes.length;
  const respondidas = Object.keys(finalizadas).length;
  const acertos = questoes.reduce((acc, q, i) => {
    return acc + (finalizadas[i] && respostas[i] === q.correta ? 1 : 0);
  }, 0);

  const videoEmbedUrl = useMemo(() => {
    if (!questaoAtual) return "";
    const embed = questaoAtual.videoEmbedUrl || "";
    if (embed) return embed;
    const url = questaoAtual.videoUrl || "";
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i);
    return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1&playsinline=1` : "";
  }, [questaoAtual]);

  const carregarQuestoes = useCallback(async (id) => {
    setLoading(true);
    setError("");
    setAssuntoId(id);
    setAtual(0);
    setRespostas({});
    setFinalizadas({});
    setRegistradas({});
    setResolucaoAberta(false);
    setVideoAberto(false);
    try {
      const snap = await getAll("questoes");
      const todas = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.assuntoId !== id) return;
        todas.push({ id: d.id, ...data });
      });
      todas.sort((a, b) => (a.ordemExibicao || 0) - (b.ordemExibicao || 0));
      if (todas.length === 0) {
        setError("Nenhuma questão cadastrada para este assunto ainda.");
        setQuestoes([]);
      } else {
        setQuestoes(todas);
        setScreen("quiz");
      }
    } catch (err) {
      setError("Erro ao carregar questões: " + (err.message || ""));
      setQuestoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const salvarTentativa = useCallback(async (indice) => {
    if (!uid || !questoes[indice] || registradas[indice]) return;
    setSalvando(true);
    try {
      await addToSubCollection(COLECAO.alunos, uid, "progresso_questoes", {
        questaoId: questoes[indice].id,
        assuntoId: questoes[indice].assuntoId,
        disciplinaId: questoes[indice].disciplinaId || "fisica-basica",
        cardId: questoes[indice].cardId || "",
        banca: questoes[indice].banca || "",
        resolvida: true,
        acertou: respostas[indice] === questoes[indice].correta,
        alternativaMarcada: String.fromCharCode(65 + Number(respostas[indice])),
        alternativaMarcadaIndice: Number(respostas[indice]),
        dataTentativa: new Date()
      });
      setRegistradas((prev) => ({ ...prev, [indice]: true }));
    } catch (err) {
      console.error("Erro ao salvar tentativa:", err);
    } finally {
      setSalvando(false);
    }
  }, [uid, questoes, respostas, registradas]);

  const selecionar = useCallback((indice) => {
    if (finalizadas[atual]) return;
    setRespostas((prev) => ({ ...prev, [atual]: indice }));
  }, [atual, finalizadas]);

  const responder = useCallback(async () => {
    if (respostas[atual] === undefined || respostas[atual] === null) {
      toast?.error?.("Selecione uma alternativa.");
      return;
    }
    setFinalizadas((prev) => ({ ...prev, [atual]: true }));
    await salvarTentativa(atual);
  }, [atual, respostas, salvarTentativa, toast]);

  const avancar = useCallback(() => {
    if (atual < totalQuestoes - 1) {
      setAtual((prev) => prev + 1);
      setResolucaoAberta(false);
      setVideoAberto(false);
    } else {
      setScreen("resultado");
    }
  }, [atual, totalQuestoes]);

  const voltar = useCallback(() => {
    if (atual > 0) {
      setAtual((prev) => prev - 1);
      setResolucaoAberta(false);
      setVideoAberto(false);
    }
  }, [atual]);

  const reiniciar = useCallback(() => {
    setScreen("subjects");
    setAssuntoId(null);
    setQuestoes([]);
    setAtual(0);
    setRespostas({});
    setFinalizadas({});
    setRegistradas({});
    setError("");
  }, []);

  if (!user) return null;

  if (screen === "subjects" || screen === "resultado") {
    return (
      <section className="page-shell">
        <div className="page-shell-content">
          <div className="fisica-shell">
            <div className="fisica-hero">
              <span className="ui-badge">Banco de Questões</span>
              {screen === "subjects" ? (
                <>
                  <h2>Escolha um assunto</h2>
                  <p>Selecione o assunto para praticar questões.</p>
                </>
              ) : (
                <>
                  <h2>Resultado</h2>
                  <p>{acertos} de {totalQuestoes} questões corretas ({totalQuestoes ? Math.round(acertos / totalQuestoes * 100) : 0}%)</p>
                  {totalQuestoes > 0 && (
                    <button className="btn btn-primary" onClick={reiniciar}>Escolher outro assunto</button>
                  )}
                </>
              )}
            </div>
            {screen === "subjects" && (
              <div className="fisica-topics-grid" role="list">
                {ASSUNTOS.map((assunto) => (
                  <button
                    key={assunto.id}
                    className="fisica-topic-card fisica-topic-card-action card-subject"
                    type="button"
                    role="listitem"
                    onClick={() => carregarQuestoes(assunto.id)}
                    disabled={loading}
                  >
                    <span className="fisica-topic-icon-box icon-box icon-box-purple">
                      <SvgIcon d={assunto.icone} size={22} />
                    </span>
                    <span className="subject-name">{assunto.titulo}</span>
                    <p>{assunto.descricao}</p>
                  </button>
                ))}
              </div>
            )}
            {screen === "resultado" && (
              <div className="fisica-topics-grid" role="list">
                {ASSUNTOS.map((assunto) => (
                  <button
                    key={assunto.id}
                    className="fisica-topic-card fisica-topic-card-action card-subject"
                    type="button"
                    role="listitem"
                    onClick={() => carregarQuestoes(assunto.id)}
                  >
                    <span className="fisica-topic-icon-box icon-box icon-box-purple">
                      <SvgIcon d={assunto.icone} size={22} />
                    </span>
                    <span className="subject-name">{assunto.titulo}</span>
                    <p>{assunto.descricao}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page-shell">
        <div className="page-shell-content">
          <div className="fisica-shell">
            <div className="fisica-hero">
              <p>Carregando questões...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && questoes.length === 0) {
    return (
      <section className="page-shell">
        <div className="page-shell-content">
          <div className="fisica-shell">
            <div className="fisica-hero">
              <span className="ui-badge">Banco de Questões</span>
              <p style={{ color: "#ef4444" }}>{error}</p>
              <button className="btn btn-primary mt-3" onClick={reiniciar}>Voltar</button>
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
          <div className="fisica-hero" style={{ paddingBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <span className="ui-badge">{ASSUNTOS.find((a) => a.id === assuntoId)?.titulo || assuntoId}</span>
                <p style={{ margin: "4px 0 0", fontSize: ".9rem", color: "#94a3b8" }}>
                  Questão {atual + 1} de {totalQuestoes} · {respondidas} respondidas · {acertos} acertos
                </p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={reiniciar}>Sair</button>
            </div>
          </div>

          {questaoAtual && (
            <div className="quiz-questao-card" key={questaoAtual.id || atual}>
              <div className="quiz-questao-header">
                {questaoAtual.origem && <small className="quiz-questao-origem">{questaoAtual.origem}</small>}
                {questaoAtual.banca && <span className="quiz-questao-banca">{questaoAtual.banca}</span>}
              </div>

              <div
                className="quiz-questao-enunciado"
                dangerouslySetInnerHTML={renderHtml(questaoAtual.enunciado)}
              />

              {questaoAtual.imagem && questaoAtual.imagem.src && (
                <div className="quiz-questao-figura">
                  <img src={questaoAtual.imagem.src} alt={questaoAtual.imagem.alt || ""} loading="lazy" />
                  {questaoAtual.imagem.legenda && <small>{questaoAtual.imagem.legenda}</small>}
                </div>
              )}

              <div className="quiz-questao-alternativas">
                {(questaoAtual.alternativas || []).map((alt, i) => {
                  const letra = String.fromCharCode(65 + i);
                  const selecionada = respostas[atual] === i;
                  const correta = questaoAtual.correta === i;
                  const mostrandoGabarito = finalizadas[atual];
                  let classe = "quiz-alternativa";
                  if (selecionada) classe += " selecionada";
                  if (mostrandoGabarito) {
                    if (correta) classe += " correta";
                    else if (selecionada && !correta) classe += " incorreta";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={classe}
                      onClick={() => selecionar(i)}
                      disabled={finalizadas[atual]}
                    >
                      <span className="quiz-alternativa-letra">{letra}</span>
                      <span className="quiz-alternativa-texto" dangerouslySetInnerHTML={renderHtml(alt)} />
                    </button>
                  );
                })}
              </div>

              {finalizadas[atual] && (
                <div className={`quiz-feedback ${respostas[atual] === questaoAtual.correta ? "correct" : "incorrect"}`}>
                  {respostas[atual] === questaoAtual.correta
                    ? "Resposta correta."
                    : `Resposta incorreta. A alternativa correta é ${String.fromCharCode(65 + questaoAtual.correta)}.`}
                </div>
              )}

              {(questaoAtual.resolucaoTexto || videoEmbedUrl) && finalizadas[atual] && (
                <div className="quiz-resolucoes" style={{ marginTop: "12px" }}>
                  {questaoAtual.resolucaoTexto && (
                    <div className="quiz-resolucao-section">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setResolucaoAberta((prev) => !prev)}
                      >
                        {resolucaoAberta ? "Ocultar" : "Ver"} resolução
                      </button>
                      {resolucaoAberta && (
                        <div
                          className="quiz-resolucao-texto"
                          style={{ marginTop: "8px", padding: "12px", background: "rgba(255,255,255,.05)", borderRadius: "12px" }}
                          dangerouslySetInnerHTML={renderHtml(questaoAtual.resolucaoTexto)}
                        />
                      )}
                    </div>
                  )}
                  {videoEmbedUrl && (
                    <div className="quiz-resolucao-section" style={{ marginTop: "8px" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setVideoAberto((prev) => !prev)}
                      >
                        {videoAberto ? "Ocultar" : "Ver"} resolução em vídeo
                      </button>
                      {videoAberto && (
                        <div style={{ marginTop: "8px", aspectRatio: "16/9" }}>
                          <iframe
                            src={videoEmbedUrl}
                            title="Resolução em vídeo"
                            style={{ width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="quiz-navegacao" style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                {!finalizadas[atual] ? (
                  <button
                    className="btn btn-primary"
                    onClick={responder}
                    disabled={respostas[atual] === undefined || salvando}
                  >
                    {salvando ? "Salvando..." : "Responder"}
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={avancar}>
                    {atual < totalQuestoes - 1 ? "Próxima" : "Ver resultado"}
                  </button>
                )}
                {atual > 0 && (
                  <button className="btn btn-outline-secondary" onClick={voltar}>Anterior</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}