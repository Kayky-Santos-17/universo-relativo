(function () {
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  window.URAnimations = {
    gsap: window.gsap || null,
    ScrollTrigger: window.ScrollTrigger || null,
    galaxy: window.galaxy || null,
    prefersReducedMotion,
    ready: Boolean(window.gsap),
    animateIn(selector, options = {}) {
      if (!window.gsap || prefersReducedMotion) return null;
      return window.gsap.from(selector, {
        opacity: 0,
        y: 18,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
        ...options
      });
    }
  };

  document.addEventListener("galaxyjs:initialized", () => {
    window.URAnimations.galaxy = window.galaxy || null;
  });
})();
