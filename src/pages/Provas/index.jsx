import { useState, useEffect } from "react";
import { getDocsByQuery } from "../../services/firestore";
import SvgIcon from "../../components/SvgIcon";

const ICONS = {
  enem: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 4V2m0 2v2m4-2V2m0 2v2m4-2V2m0 2v2",
  pdf: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  questoes: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
};

export default function Provas() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocsByQuery("exams", [{ field: "ativo", op: "!=", value: false }]);
        if (cancelled) return;
        const lista = [];
        snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));
        lista.sort((a, b) => (b.ano || 0) - (a.ano || 0));
        setExams(lista);
      } catch (err) {
        if (!cancelled) setError(err.message || "Erro ao carregar provas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="page-shell">
      <div className="page-shell-content">
        <div className="fisica-shell">
          <div className="fisica-hero">
            <span className="ui-badge">Provas e Simulados</span>
            <h2>Provas anteriores</h2>
            <p>Acesse provas do ENEM e vestibulares para praticar com questões reais.</p>
          </div>

          {loading && <p style={{ color: "#94a3b8" }}>Carregando provas...</p>}

          {error && <p style={{ color: "#ef4444" }}>{error}</p>}

          {!loading && !error && exams.length === 0 && (
            <p style={{ color: "#94a3b8" }}>Nenhuma prova disponível no momento.</p>
          )}

          {exams.length > 0 && (
            <div className="fisica-topics-grid" role="list">
              {exams.map((exame) => (
                <div key={exame.id} className="fisica-topic-card" role="listitem" style={{ cursor: "default" }}>
                  <span className="fisica-topic-icon-box icon-box icon-box-purple">
                    <SvgIcon d={ICONS.enem} size={22} />
                  </span>
                  <span className="subject-name">{exame.titulo || `ENEM ${exame.ano}`}</span>
                  <small>{exame.tipo || "ENEM"} · {exame.ano}</small>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: ".88rem", marginTop: "4px" }}>
                    <SvgIcon d={ICONS.questoes} size={16} />
                    <span>{exame.questoesTotal || exame.questoes?.length || 0} questões</span>
                  </div>
                  {exame.pdfUrl && (
                    <a
                      href={exame.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fisica-topic-card-action"
                      style={{
                        marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "10px 16px", borderRadius: "14px", background: "rgba(124,58,237,.18)",
                        color: "#c4b5fd", fontWeight: 700, fontSize: ".9rem", textDecoration: "none",
                        width: "fit-content"
                      }}
                    >
                      <SvgIcon d={ICONS.external} size={16} /> Abrir prova
                    </a>
                  )}
                  {!exame.pdfUrl && (
                    <span style={{ marginTop: "auto", color: "#64748b", fontSize: ".85rem" }}>PDF não disponível</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}