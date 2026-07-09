import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Astronaut from "../../components/Astronaut/Astronaut";

const MATRICULA_DOMAIN = "universorelativo.app";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const id = matricula.trim();
    const pw = password.trim();

    if (!id || !pw) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      if (id.includes("@")) {
        await login(id, pw);
        navigate("/admin");
        return;
      }

      const email = `${id}@${MATRICULA_DOMAIN}`;
      await login(email, pw);
      navigate("/");
    } catch (err) {
      const msg = id.includes("@")
        ? (err?.message || "Não foi possível entrar.")
        : (err?.message || "Senha ou Matrícula incorreta.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-cosmos">
        <div className="cosmos-stars" />
        <div className="cosmos-nebula nebula-one" />
        <div className="cosmos-nebula nebula-two" />
        <div className="cosmos-particles" />
        <div className="orbit orbit-one"><span className="planet planet-one" /></div>
        <div className="orbit orbit-two"><span className="planet planet-two" /></div>
        <div className="orbit orbit-three"><span className="planet planet-three" /></div>
        <div className="astronaut-wrapper" aria-hidden="true">
          <Astronaut size="lg" variant="floating" animated />
        </div>
      </div>
      <div className="login-layout">
        <div className="login-brand-panel glass-panel zoom-lens">
          <span className="ui-badge">Universo Relativo</span>
        </div>
        <div className="login-box glass-panel">
          <form onSubmit={handleSubmit}>
            <span className="login-student-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c3 2 6 2 10 0v-5"/></svg>
              Área do aluno
            </span>
            <div className="login-heading">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              <h2 className="login-title">Acesse a plataforma</h2>
              <p className="login-subtitle">Entre com sua matrícula e senha</p>
            </div>
            <div className="login-field">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                type="text"
                className="form-control"
                id="loginMatricula"
                placeholder="Digite sua matrícula"
                autoComplete="username"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
            </div>
            <div className="login-field login-password-field">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="loginPassword"
                placeholder="Senha"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
            <button className="btn btn-primary w-100 py-3 login-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar no universo"}
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              )}
            </button>
            {error && <p className="text-danger mt-3 mb-0">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
