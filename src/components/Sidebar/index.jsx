import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useSidebar } from "../../hooks/useSidebar";
import Astronaut from "../Astronaut/Astronaut";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Início", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/apostilas", label: "Física Básica", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { to: "/trilhas", label: "Relatividade Especial", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 2v4M12 18v4M2 12h4M18 12h4" },
  { to: "/questoes", label: "Banco de Questões", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/provas", label: "Provas", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { to: "/flashcards", label: "Flash Cards", icon: "M4 6h16M4 12h16M4 18h16" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggleCollapse } = useSidebar();

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-topbar">
        <button className="sidebar-toggle-btn" onClick={toggleCollapse} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? "☰" : "✕"}</button>
      </div>

      <button className="sidebar-brand" onClick={() => navigate("/perfil")}>
        <div className="sidebar-astro">
          <Astronaut size="xs" animated={false} />
        </div>
        <div className="sidebar-user-copy">
          <strong>{userData?.nome || user?.email?.split("@")[0] || "Aluno"}</strong>
          <span>Ver perfil</span>
        </div>
      </button>

      <ul className="nav flex-column">
        {NAV_ITEMS.map((item) => (
          <li className="nav-item" key={item.to}>
            <a
              className={`nav-link${isActive(item.to) ? " active" : ""}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate(item.to); }}
            >
              <span className="nav-icon">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </span>
              <span className="nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="sidebar-theme-item">
        <button className="theme-toggle" onClick={toggleTheme} aria-pressed={theme === "light"}>
          <span className="theme-toggle-icon theme-toggle-moon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </span>
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb"></span>
          </span>
          <span className="theme-toggle-icon theme-toggle-sun">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </span>
          <span className="theme-toggle-label">{theme === "dark" ? "Modo escuro" : "Modo claro"}</span>
        </button>
      </div>

      {user && (
        <div className="sidebar-logout-item">
          <button className="btn btn-outline-light w-100" onClick={logout}>Sair</button>
        </div>
      )}
    </aside>
  );
}

export default memo(Sidebar);
