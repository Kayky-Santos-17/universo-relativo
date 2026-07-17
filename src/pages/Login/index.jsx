import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { setDocById } from "../../services/firestore";
import { COLECAO } from "../../utils/constants";
import { validarNome, validarSenha, validarConfirmacao, calcularForcaSenha, obterChecklistSenha } from "../../utils/validators";
import PasswordStrength from "../../components/PasswordStrength";
import Astronaut from "../../components/Astronaut/Astronaut";

const ERROR_MAP = {
  "auth/invalid-email": "Não foi possível reconhecer este email. Confira e tente novamente.",
  "auth/user-not-found": "Não encontramos uma conta com estas informações.",
  "auth/wrong-password": "Não foi possível confirmar sua senha.",
  "auth/invalid-credential": "Não foi possível confirmar suas informações.",
  "auth/email-already-in-use": "Este email já possui cadastro. Que tal fazer login?",
  "auth/weak-password": "A senha precisa ser um pouco mais longa (mínimo de 6 caracteres).",
  "auth/too-many-requests": "Muitas tentativas seguidas. Vamos aguardar um momento antes de tentar novamente.",
  "auth/network-request-failed": "Algo inesperado aconteceu com sua conexão. Verifique e tente novamente.",
  "auth/popup-blocked": "Precisamos de permissão para abrir uma janela. Permita popups nas configurações do seu navegador.",
  "permission-denied": "Não foi possível acessar este recurso agora. Tente novamente."
};

function friendlyError(err) {
  if (!err) return "Algo inesperado aconteceu.";
  if (err.code && ERROR_MAP[err.code]) return ERROR_MAP[err.code];
  if (err.message?.includes("permission")) return "Não foi possível acessar este recurso agora. Tente novamente.";
  return err.message || "Algo inesperado aconteceu.";
}

function ValidacaoMsg({ children, valido }) {
  if (!children) return null;
  return (
    <p className={`validacao-msg ${valido ? "valido" : "invalido"}`}>
      {children}
    </p>
  );
}

function Checklist({ itens, tocado }) {
  return (
    <div className="senha-checklist">
      {itens.map(item => (
        <span key={item.id} className={`check-item ${item.valido ? "check-ok" : tocado ? "check-pending" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {item.valido
              ? <polyline points="20 6 9 17 4 12" />
              : <line x1="18" y1="6" x2="6" y2="18" />
            }
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, register, resetPassword, reloadUserData } = useAuth();

  const [mode, setMode] = useState("login");

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "register" || m === "login") setMode(m);
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [nome, setNome] = useState("");
  const [confirm, setConfirm] = useState("");

  const [nomeTocado, setNomeTocado] = useState(false);
  const [senhaTocada, setSenhaTocada] = useState(false);
  const [confirmTocada, setConfirmTocada] = useState(false);

  const nomeResult = nomeTocado && mode === "register" ? validarNome(nome) : null;
  const senhaResult = senhaTocada && mode === "register" ? validarSenha(password) : null;
  const forca = mode === "register" ? calcularForcaSenha(password) : { nivel: 0, label: "", cor: "var(--text-muted)" };
  const checklist = mode === "register" ? obterChecklistSenha(password) : [];
  const confirmacao = confirmTocada && mode === "register" ? validarConfirmacao(password, confirm) : null;

  const podeRegistrar = mode === "register"
    && validarNome(nome).valido
    && validarSenha(password).valido
    && password === confirm
    && password.length > 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const emailVal = email.trim();
    const pw = password.trim();
    if (!emailVal || !pw) { setError("Preencha todos os campos."); return; }
    setLoading(true);
    try {
      await login(emailVal, pw);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    setNomeTocado(true);
    setSenhaTocada(true);
    setConfirmTocada(true);

    const nomeVal = nome.trim();
    const emailVal = email.trim();
    const pw = password;
    const conf = confirm;

    const valNome = validarNome(nomeVal);
    const valSenha = validarSenha(pw);
    const valConfirm = validarConfirmacao(pw, conf);

    if (!valNome.valido) { setError(valNome.mensagem); return; }
    if (!valSenha.valido) { setError("A senha não atende aos requisitos."); return; }
    if (!valConfirm.valido) { setError(valConfirm.mensagem); return; }
    if (!emailVal) { setError("Preencha todos os campos."); return; }

    setLoading(true);
    try {
      const cred = await register(emailVal, pw);
      await setDocById(COLECAO.alunos, cred.uid, {
        nome: nomeVal,
        email: emailVal,
        photoURL: "",
        ativo: true,
        admin: false,
        criadoEm: new Date(),
        ultimoLogin: new Date(),
        provider: "password",
        progresso: { questoesRespondidas: 0, acertos: 0 }
      });
      await reloadUserData();
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") return;
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    const emailVal = email.trim();
    if (!emailVal) { setError("Digite seu email para recuperar a senha."); return; }
    setLoading(true);
    try {
      await resetPassword(emailVal);
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setResetSent(false);
    setNomeTocado(false);
    setSenhaTocada(false);
    setConfirmTocada(false);
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
      </div>

      <div className="login-layout">
        <div className="login-brand-panel">
          <div className="login-brand-cosmos">
            <div className="brand-galaxy"></div>
            <div className="brand-dust"></div>
            <div className="brand-ring-planet">
              <div className="brand-ring"></div>
            </div>
            <div className="brand-orbit brand-orbit-1">
              <span className="brand-planet brand-planet-1"></span>
            </div>
            <div className="brand-orbit brand-orbit-2">
              <span className="brand-planet brand-planet-2"></span>
            </div>
            <div className="brand-orbit brand-orbit-3">
              <span className="brand-planet brand-planet-3"></span>
            </div>
            <div className="login-brand-astro">
              <Astronaut size="lg" variant="floating" animated />
            </div>
            <div className="brand-stars"></div>
            <div className="brand-trail"></div>
            <div className="brand-trail-glow"></div>
            <div className="brand-spaceship">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 4 10 4 16C4 19.3 7.6 22 12 22C16.4 22 20 19.3 20 16C20 10 12 2 12 2Z" fill="#a78bfa" opacity="0.9"/>
                <path d="M12 2C12 2 8 10 8 14C8 16.8 10 19 12 19C14 19 16 16.8 16 14C16 10 12 2 12 2Z" fill="#c4b5fd" opacity="0.5"/>
                <circle cx="12" cy="14" r="2" fill="#e9d5ff"/>
                <path d="M7 18 L5 22 M17 18 L19 22" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                <ellipse cx="12" cy="22" rx="4" ry="1.5" fill="#7c3aed" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="login-box glass-panel">
          <form noValidate onSubmit={mode === "login" ? handleLogin : handleRegister}>
            <div className="login-tabs">
              <button type="button" className={`login-tab${mode === "login" ? " active" : ""}`} onClick={() => switchMode("login")}>Entrar</button>
              <button type="button" className={`login-tab${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>Criar Conta</button>
            </div>

            <div className="login-heading">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              {mode === "login" ? (
                <><h2 className="login-title">Acesse a plataforma</h2><p className="login-subtitle">Entre com seu email e senha</p></>
              ) : (
                <><h2 className="login-title">Novo por aqui?</h2><p className="login-subtitle">Crie sua conta e comece a estudar</p></>
              )}
            </div>

            {mode === "register" && (
              <div className="login-field">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" className="form-control" id="authNome" placeholder="Nome completo" autoComplete="name" value={nome} onChange={(e) => { setNome(e.target.value); if (!nomeTocado) setNomeTocado(true); }} />
              </div>
            )}
            {nomeResult && (
              <ValidacaoMsg valido={nomeResult.valido}>
                {nomeResult.mensagem}
              </ValidacaoMsg>
            )}

            <div className="login-field">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              <input
                type="email"
                className="form-control"
                id="authEmail"
                placeholder="Digite seu email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setResetSent(false); }}
              />
            </div>

            <div className="login-field login-password-field">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="authPassword"
                placeholder={mode === "register" ? "Crie uma senha forte" : "Senha"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (!senhaTocada) setSenhaTocada(true); }}
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>

            {mode === "register" && (
              <>
                <PasswordStrength senha={password} forca={forca} />
                {senhaResult && !senhaResult.valido && (
                  <Checklist itens={checklist} tocado={senhaTocada} />
                )}
              </>
            )}

            {mode === "register" && (
              <div className="login-field login-password-field">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input type={showPassword ? "text" : "password"} className="form-control" id="authConfirm" placeholder="Confirmar senha" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); if (!confirmTocada) setConfirmTocada(true); }} />
              </div>
            )}
            {confirmacao && (
              <ValidacaoMsg valido={confirmacao.valido}>
                {confirmacao.mensagem}
              </ValidacaoMsg>
            )}

            {error && <p className="text-danger mt-2 mb-0">{error}</p>}

            <button className="btn btn-primary w-100 py-3 login-submit" type="submit" disabled={loading || (mode === "register" && !podeRegistrar)}>
              {loading
                ? (mode === "login" ? "Entrando..." : "Criando conta...")
                : (mode === "login" ? "Entrar no universo" : "Criar conta")}
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              )}
            </button>

            {mode === "login" && (
              <div className="login-links">
                <button type="button" className="login-link-btn" onClick={handleReset} disabled={loading}>
                  {resetSent ? "Email enviado! Verifique sua caixa de entrada." : "Esqueceu sua senha?"}
                </button>
              </div>
            )}

            <div className="login-divider"><span>ou</span></div>

            <button type="button" className="btn btn-google w-100 py-3" onClick={handleGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {mode === "login" ? "Entrar com Google" : "Criar com Google"}
            </button>

            <p className="login-signup-text">
              {mode === "login" ? (
                <>Ainda não tem conta? <button type="button" className="login-link-btn" onClick={() => switchMode("register")}>Criar conta</button></>
              ) : (
                <>Já tem uma conta? <button type="button" className="login-link-btn" onClick={() => switchMode("login")}>Fazer login</button></>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
