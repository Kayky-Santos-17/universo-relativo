import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { updateDocById, getSubCollection } from "../../services/firestore";
import { resetPassword } from "../../services/auth";
import { COLECAO } from "../../utils/constants";
import Astronaut from "../../components/Astronaut/Astronaut";
import { saudacao } from "../../utils/helpers";
import SvgIcon from "../../components/SvgIcon";

const ICON_EMAIL = "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const ICON_CALENDAR = "M8 2v4M16 2v4M3 10h18";
const ICON_EDIT = "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7";
const ICON_SAVE = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_CHECK = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_QUESTIONS = "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4";
const ICON_TARGET = "M12 2a10 10 0 1010 10M12 2v4M12 22v-4M2 12h4M22 12h-4";
const ICON_FLASHCARD = "M4 6h16M4 12h16M4 18h16";
const ICON_LOGOUT = "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9";
const ICON_LOCK = "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-8V7a4 4 0 00-8 0v4";

export default function Perfil() {
  const { user, userData, reloadUserData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const uid = user?.uid;

  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [stats, setStats] = useState({ questoes: 0, acertos: 0, flashcards: 0 });
  const [msgSenha, setMsgSenha] = useState("");

  const carregarStats = useCallback(async () => {
    if (!uid) return;
    try {
      const [snapQ, snapF] = await Promise.all([
        getSubCollection(COLECAO.alunos, uid, "progresso_questoes").catch(() => ({ size: 0, forEach: () => {} })),
        getSubCollection(COLECAO.alunos, uid, "progresso_flashcards").catch(() => ({ size: 0, forEach: () => {} }))
      ]);
      let acertos = 0;
      snapQ.forEach((d) => { if (d.data().acertou) acertos++; });
      setStats({ questoes: snapQ.size || 0, acertos, flashcards: snapF.size || 0 });
    } catch {}
  }, [uid]);

  useEffect(() => { carregarStats(); }, [carregarStats]);
  useEffect(() => { if (userData?.nome) setNomeEdit(userData.nome); }, [userData]);

  const salvarNome = async () => {
    if (!uid || !nomeEdit.trim()) return;
    setSalvando(true);
    try {
      await updateDocById(COLECAO.alunos, uid, { nome: nomeEdit.trim() });
      await reloadUserData();
      setEditando(false);
    } catch {} finally { setSalvando(false); }
  };

  const handleResetSenha = async () => {
    if (!user?.email) return;
    setMsgSenha("");
    try {
      await resetPassword(user.email);
      setMsgSenha("Email de redefinição enviado!");
      setTimeout(() => setMsgSenha(""), 4000);
    } catch {
      setMsgSenha("Erro ao enviar email.");
      setTimeout(() => setMsgSenha(""), 4000);
    }
  };

  const dataCriacao = userData?.criadoEm?.toDate
    ? userData.criadoEm.toDate().toLocaleDateString("pt-BR")
    : userData?.criadoEm
      ? new Date(userData.criadoEm).toLocaleDateString("pt-BR")
      : "---";

  const percentualAcertos = stats.questoes > 0 ? Math.round((stats.acertos / stats.questoes) * 100) : 0;

  return (
    <section className="page-shell">
      <div className="page-shell-content">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{saudacao()}, {userData?.nome || "Aluno"}</h2>
            <p style={{ color: "#94a3b8", fontSize: ".9rem", marginTop: "4px" }}>Gerencie seu perfil e configurações</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="study-module" style={{ padding: "28px" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{
                  width: "88px", height: "88px", borderRadius: "50%",
                  background: "linear-gradient(135deg,rgba(99,102,241,.24),rgba(139,92,246,.18))",
                  border: "2px solid rgba(99,102,241,.28)",
                  display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0
                }}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Astronaut size="sm" animated={false} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editando ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        className="form-control"
                        value={nomeEdit}
                        onChange={(e) => setNomeEdit(e.target.value)}
                        style={{ background: "rgba(15,23,42,.58)", border: "1px solid rgba(139,92,246,.18)", color: "#fff", borderRadius: "12px", padding: "8px 12px", fontSize: ".95rem", maxWidth: "220px" }}
                      />
                      <button className="btn btn-sm btn-primary" onClick={salvarNome} disabled={salvando}>
                        <SvgIcon d={ICON_SAVE} size={15} /> Salvar
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditando(false)}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: "1.3rem" }}>{userData?.nome || "Aluno"}</h3>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditando(true)} title="Editar nome">
                        <SvgIcon d={ICON_EDIT} size={14} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: ".85rem" }}>
                      <SvgIcon d={ICON_EMAIL} size={13} /> {user?.email}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: ".85rem" }}>
                      <SvgIcon d={ICON_CALENDAR} size={13} /> Membro desde {dataCriacao}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="study-module" style={{ padding: "24px" }}>
              <h4 style={{ margin: "0 0 16px", color: "#e2e8f0", fontSize: "1rem" }}>Estatísticas de estudo</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { value: stats.questoes, label: "Questões", color: "#60a5fa", bg: "rgba(59,130,246,.1)", border: "rgba(59,130,246,.18)", icon: ICON_QUESTIONS },
                  { value: `${percentualAcertos}%`, label: "Aproveitamento", color: "#4ade80", bg: "rgba(34,197,94,.1)", border: "rgba(34,197,94,.18)", icon: ICON_TARGET },
                  { value: stats.flashcards, label: "Flashcards", color: "#a78bfa", bg: "rgba(139,92,246,.1)", border: "rgba(139,92,246,.18)", icon: ICON_FLASHCARD },
                  { value: stats.acertos, label: "Acertos", color: "#fbbf24", bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.18)", icon: ICON_CHECK },
                ].map(({ value, label, color, bg, border, icon }) => (
                  <div key={label} style={{ padding: "16px", borderRadius: "14px", background: bg, border: `1px solid ${border}`, textAlign: "center" }}>
                    <SvgIcon d={icon} size={18} style={{ color }} />
                    <p style={{ fontSize: "1.4rem", fontWeight: 800, color, margin: "6px 0 2px" }}>{value}</p>
                    <small style={{ color: "#94a3b8", fontSize: ".8rem" }}>{label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="study-module" style={{ padding: "24px" }}>
              <h4 style={{ margin: "0 0 16px", color: "#e2e8f0", fontSize: "1rem" }}>Configurações</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", borderRadius: "14px",
                  background: "rgba(15,23,42,.45)", border: "1px solid rgba(148,163,184,.12)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="theme-toggle-icon" style={{ color: "#93c5fd", opacity: theme === "dark" ? 1 : 0.4 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                    </span>
                    <span style={{ color: "#e2e8f0", fontSize: ".92rem", fontWeight: 600 }}>Tema escuro</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    aria-pressed={theme === "light"}
                    style={{
                      position: "relative", width: "48px", height: "26px", borderRadius: "999px",
                      background: theme === "dark" ? "rgba(15,23,42,.85)" : "#dbeafe",
                      border: `1px solid ${theme === "dark" ? "rgba(139,92,246,.16)" : "rgba(124,58,237,.14)"}`,
                      cursor: "pointer", padding: 0, flexShrink: 0
                    }}
                  >
                    <span style={{
                      position: "absolute", top: "2px", left: theme === "dark" ? "2px" : "24px",
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: theme === "dark"
                        ? "linear-gradient(135deg,#c4b5fd,#60a5fa)"
                        : "linear-gradient(135deg,#fbbf24,#2563eb)",
                      transition: "left .26s cubic-bezier(.22,1,.36,1)"
                    }} />
                  </button>
                </div>

                {userData?.provider !== "google" && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", borderRadius: "14px",
background: "rgba(15,23,42,.45)", border: "1px solid rgba(139,92,246,.1)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <SvgIcon d={ICON_LOCK} size={18} style={{ color: "#94a3b8" }} />
                      <span style={{ color: "#e2e8f0", fontSize: ".92rem", fontWeight: 600 }}>Alterar senha</span>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleResetSenha}>
                      {msgSenha || "Enviar email"}
                    </button>
                  </div>
                )}
                {msgSenha && (
                  <p style={{ color: "#4ade80", fontSize: ".85rem", margin: 0 }}>{msgSenha}</p>
                )}

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", borderRadius: "14px",
                  background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.16)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <SvgIcon d={ICON_LOGOUT} size={18} style={{ color: "#fca5a5" }} />
                    <span style={{ color: "#fca5a5", fontSize: ".92rem", fontWeight: 600 }}>Sair da conta</span>
                  </div>
                  <button className="btn btn-sm" onClick={logout}
                    style={{ background: "rgba(239,68,68,.14)", color: "#fca5a5", border: "1px solid rgba(239,68,68,.24)", borderRadius: "10px", padding: "6px 16px", fontWeight: 700 }}>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}