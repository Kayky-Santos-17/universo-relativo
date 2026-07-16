import { memo } from "react";
import { Link, useLocation } from "react-router-dom";

const labels = {
  "/": "Início",
  "/login": "Entrar",
  "/dashboard": "Dashboard",
  "/apostilas": "Apostilas",
  "/flashcards": "Flashcards",
  "/trilhas": "Trilhas",
  "/questoes": "Questões",
  "/provas": "Provas",
  "/perfil": "Perfil",
  "/admin": "Admin"
};

const IGNORE_ROOTS = ["/admin"];

function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;
  if (IGNORE_ROOTS.includes(pathname)) return null;

  return (
    <nav className="breadcrumb">
      <Link to="/">Início</Link>
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label = labels[path] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
        return i === segments.length - 1 ? (
          <span key={path}> / {label}</span>
        ) : (
          <span key={path}> / <Link to={path}>{label}</Link></span>
        );
      })}
    </nav>
  );
}

export default memo(Breadcrumb);
