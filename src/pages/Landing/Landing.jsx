import { memo, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Landing/Navbar";
import Hero from "../../components/Landing/Hero";
import Features from "../../components/Landing/Features";
import Showcase from "../../components/Landing/Showcase";
import CTA from "../../components/Landing/CTA";
import LandingFooter from "../../components/Landing/Footer";
import { useAuth } from "../../hooks/useAuth";
import "./Landing.css";

function Landing() {
  const { user, loading } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (loading) {
    return (
      <div className="landing">
        <div className="landing-stars" aria-hidden="true" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`landing${loaded ? " landing--loaded" : ""}`}>
      <div className="landing-stars" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}

export default memo(Landing);
