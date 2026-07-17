import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import "./Blueprint.css";

const TOKENS = [
  { category: "Cores", items: [
    { label: "bg", var: "--bg", color: "#0b0f1a" },
    { label: "surface", var: "--surface", color: "#111827" },
    { label: "card", var: "--card", color: "#111827" },
    { label: "primary", var: "--primary", color: "#3b82f6" },
    { label: "purple", var: "--purple", color: "#8b5cf6" },
    { label: "purple-strong", var: "--purple-strong", color: "#7c3aed" },
    { label: "cyan", var: "--cyan", color: "#22d3ee" },
    { label: "amber", var: "--amber", color: "#f59e0b" },
    { label: "emerald", var: "--emerald", color: "#10b981" },
    { label: "red", var: "--red", color: "#ef4444" },
    { label: "pink", var: "--pink", color: "#ec4899" },
  ]},
  { category: "Tipografia", items: [
    { label: "fs-xs", var: "--fs-xs", value: ".7rem" },
    { label: "fs-sm", var: "--fs-sm", value: ".8rem" },
    { label: "fs-base", var: "--fs-base", value: ".9rem" },
    { label: "fs-md", var: "--fs-md", value: "1rem" },
    { label: "fs-lg", var: "--fs-lg", value: "1.15rem" },
    { label: "fs-xl", var: "--fs-xl", value: "1.35rem" },
    { label: "fs-2xl", var: "--fs-2xl", value: "1.6rem" },
    { label: "fs-3xl", var: "--fs-3xl", value: "2rem" },
    { label: "fs-4xl", var: "--fs-4xl", value: "2.8rem" },
    { label: "fs-5xl", var: "--fs-5xl", value: "4.5rem" },
  ]},
  { category: "Espaçamento", items: [
    { label: "space-1", var: "--space-1", value: "4px" },
    { label: "space-2", var: "--space-2", value: "8px" },
    { label: "space-3", var: "--space-3", value: "12px" },
    { label: "space-4", var: "--space-4", value: "16px" },
    { label: "space-5", var: "--space-5", value: "20px" },
    { label: "space-6", var: "--space-6", value: "24px" },
    { label: "space-8", var: "--space-8", value: "32px" },
    { label: "space-10", var: "--space-10", value: "40px" },
    { label: "space-12", var: "--space-12", value: "48px" },
    { label: "space-16", var: "--space-16", value: "64px" },
  ]},
  { category: "Elevação / Sombras", items: [
    { label: "shadow-xs", var: "--shadow-xs", desc: "Base" },
    { label: "shadow-sm", var: "--shadow-sm", desc: "Card" },
    { label: "shadow-md", var: "--shadow-md", desc: "Card hover" },
    { label: "shadow-lg", var: "--shadow-lg", desc: "Menu/Dropdown" },
    { label: "shadow-xl", var: "--shadow-xl", desc: "Dialog" },
    { label: "shadow-2xl", var: "--shadow-2xl", desc: "Modal" },
    { label: "shadow-3xl", var: "--shadow-3xl", desc: "Toast" },
  ]},
  { category: "Animação", items: [
    { label: "motion-fast", var: "--motion-fast", value: ".18s" },
    { label: "motion-base", var: "--motion-base", value: ".28s" },
    { label: "motion-slow", var: "--motion-slow", value: ".42s" },
    { label: "ease-premium", var: "--ease-premium", value: "cubic-bezier(.22,1,.36,1)" },
    { label: "anim-orient", var: "--anim-orient", value: "Orientar" },
    { label: "anim-explain", var: "--anim-explain", value: "Explicar" },
    { label: "anim-reward", var: "--anim-reward", value: "Recompensar" },
    { label: "anim-humanize", var: "--anim-humanize", value: "Humanizar" },
  ]},
  { category: "Bordas", items: [
    { label: "radius-xs", var: "--radius-xs", value: "6px" },
    { label: "radius-sm", var: "--radius-sm", value: "8px" },
    { label: "radius-md", var: "--radius-md", value: "14px" },
    { label: "radius-lg", var: "--radius-lg", value: "20px" },
    { label: "radius-xl", var: "--radius-xl", value: "24px" },
    { label: "radius-2xl", var: "--radius-2xl", value: "32px" },
    { label: "radius-full", var: "--radius-full", value: "999px" },
  ]},
];

const PRINCIPLES = [
  { icon: "○", title: "Clareza", desc: "A informação sempre tem prioridade sobre a decoração." },
  { icon: "◆", title: "Consistência", desc: "Mesmo problema, mesma solução. Sempre." },
  { icon: "▢", title: "Respiro", desc: "Espaços vazios também comunicam." },
  { icon: "▶", title: "Movimento", desc: "Toda animação possui propósito: orientar, explicar, recompensar ou humanizar." },
  { icon: "△", title: "Simplicidade", desc: "Reduzir esforço é mais importante que adicionar funcionalidades." },
  { icon: "◇", title: "Elegância", desc: "Menos elementos, mais significado." },
];

const ELEVATION = [
  { level: "Plano Base", z: 0, use: "Fundo da interface" },
  { level: "Conteúdo", z: 1, use: "Textos, ícones" },
  { level: "Cards", z: 2, use: "Cards, painéis" },
  { level: "Navbar / Sidebar", z: 4, use: "Navegação fixa" },
  { level: "Menus", z: 8, use: "Dropdowns, popovers" },
  { level: "Dialog", z: 16, use: "Diálogos de confirmação" },
  { level: "Modal", z: 24, use: "Modais de interrupção" },
  { level: "Toast", z: 32, use: "Notificações temporárias" },
];

function Swatch({ color }) {
  return <span className="bp-swatch" style={{ background: color }} />;
}

export default function Blueprint() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bp">
      <div className="bp-header">
        <h1>🌌 Relative Design System</h1>
        <p>Blueprint de referência — The Relative Codex</p>
      </div>

      <section className="bp-section">
        <h2>Os 6 Princípios da RDL</h2>
        <div className="bp-principles">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bp-principle-card">
              <span className="bp-principle-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Elevação / Altitude</h2>
        <p className="bp-desc">A luz vem sempre do <strong>canto superior esquerdo</strong>. Sombras projetam para baixo e para a direita.</p>
        <div className="bp-elevation">
          {ELEVATION.map((e, i) => (
            <div key={e.level} className="bp-elevation-item" style={{ boxShadow: `0 ${2 + i * 4}px ${4 + i * 8}px rgba(2,6,23,.${10 + i * 3})` }}>
              <span className="bp-elevation-badge">z-{e.z}</span>
              <strong>{e.level}</strong>
              <span className="bp-elevation-desc">{e.use}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Paleta de Cores</h2>
        <div className="bp-token-grid">
          {TOKENS[0].items.map((t) => (
            <div key={t.var} className="bp-token-card">
              <Swatch color={t.color} />
              <div className="bp-token-info">
                <strong>{t.label}</strong>
                <code>{t.color}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Tipografia</h2>
        <div className="bp-token-grid">
          {TOKENS[1].items.map((t) => (
            <div key={t.var} className="bp-token-card">
              <div className="bp-token-info">
                <strong style={{ fontSize: `var(${t.var})` }}>Aa</strong>
                <code>{t.var}</code>
                <span className="bp-token-value">{t.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Espaçamento</h2>
        <div className="bp-token-grid">
          {TOKENS[2].items.map((t) => (
            <div key={t.var} className="bp-token-card">
              <div className="bp-token-info">
                <strong>{t.label}</strong>
                <code>{t.var}</code>
                <span className="bp-token-value">{t.value}</span>
              </div>
              <div className="bp-space-visual" style={{ width: `var(${t.var})` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Bordas</h2>
        <div className="bp-token-grid">
          {TOKENS[6].items.map((t) => (
            <div key={t.var} className="bp-token-card">
              <div className="bp-radius-visual" style={{ borderRadius: `var(${t.var})`, width: 48, height: 48, border: "2px solid var(--purple)" }} />
              <div className="bp-token-info">
                <strong>{t.label}</strong>
                <code>{t.var}</code>
                <span className="bp-token-value">{t.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bp-section">
        <h2>Regras da Interface</h2>
        <div className="bp-rules">
          <div className="bp-rule">
            <span className="bp-rule-icon">💡</span>
            <div><strong>Navegação</strong><p>Sidebar à esquerda, conteúdo à direita. Mobile: sidebar vira overlay.</p></div>
          </div>
          <div className="bp-rule">
            <span className="bp-rule-icon">🎨</span>
            <div><strong>Cards</strong><p>Background gradiente sutil, borda semi-transparente, hover com glow purple.</p></div>
          </div>
          <div className="bp-rule">
            <span className="bp-rule-icon">🔤</span>
            <div><strong>Tipografia</strong><p>Headings sempre bold/extrabold. Corpo em --fs-base. Muted em --text-muted.</p></div>
          </div>
          <div className="bp-rule">
            <span className="bp-rule-icon">🌀</span>
            <div><strong>Animações</strong><p>Apenas 4 propósitos: orientar, explicar, recompensar, humanizar. Nada sem propósito.</p></div>
          </div>
          <div className="bp-rule">
            <span className="bp-rule-icon">🪟</span>
            <div><strong>Glass</strong><p>Usar com moderação. Preservar contexto, nunca comprometer legibilidade.</p></div>
          </div>
          <div className="bp-rule">
            <span className="bp-rule-icon">📐</span>
            <div><strong>Elevação</strong><p>Luz do topo-esquerdo. Sombras para baixo-direita. Hierarquia por altitude.</p></div>
          </div>
        </div>
      </section>

      <div className="bp-footer">
        <p>The Relative Codex — v3.0 · <strong>Universo Relativo</strong></p>
      </div>
    </div>
  );
}
