import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Breadcrumb from "../components/Breadcrumb";
import { useSidebar } from "../hooks/useSidebar";

export default function MainLayout() {
  const { collapsed, mobileOpen, toggleMobile, closeMobile } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  return (
    <div className={`site-shell${collapsed ? " sidebar-collapsed" : ""}${mobileOpen ? " sidebar-mobile-open" : ""}`}>
      <Sidebar />
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}
      <div className="conteudo">
        <div className="p-4">
          <button className="hamburger-btn" onClick={toggleMobile} aria-label="Abrir menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <Breadcrumb />
        </div>
        <main className="content-area">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
