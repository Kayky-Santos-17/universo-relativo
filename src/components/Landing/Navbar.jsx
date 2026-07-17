import { memo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { href: "#hero", label: "Início" },
  { href: "#features", label: "Como Funciona" },
  { href: "#showcase", label: "Diferenciais" },
  { href: "#cta", label: "Comece Agora" },
];

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = useCallback((e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <nav className={`landing-navbar${scrolled ? " landing-navbar--scrolled" : ""}`}>
      <div className="landing-navbar-inner">
        <Link to="/" className="landing-navbar-brand">
          Universo Relativo
        </Link>
        <ul className={`landing-navbar-links${menuOpen ? " landing-navbar-links--open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => handleScroll(e, link.href)}>
                {link.label}
              </a>
            </li>
          ))}
          <li className="landing-navbar-links-mobile-actions">
            <button className="landing-navbar-action-btn" onClick={() => navigate("/login")} aria-label="Entrar na plataforma">Entrar</button>
            <button className="landing-navbar-action-btn" onClick={() => navigate("/login")} aria-label="Criar conta">Cadastrar</button>
          </li>
        </ul>
        <div className="landing-navbar-actions">
          <button className="landing-navbar-action-btn" onClick={() => navigate("/login")} aria-label="Entrar na plataforma">Entrar</button>
          <button className="landing-navbar-action-btn" onClick={() => navigate("/login")} aria-label="Criar conta">Cadastrar</button>
        </div>
        <button
          className={`landing-navbar-hamburger${menuOpen ? " landing-navbar-hamburger--open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

export default memo(Navbar);
