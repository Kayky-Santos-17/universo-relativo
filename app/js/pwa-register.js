(function () {
  if (!("serviceWorker" in navigator)) return;

  const RELOAD_FLAG = "ur_sw_reload_em_andamento";

  window.addEventListener("load", () => {
    try {
      window.setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5000);
    } catch (_) {}

    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then((registration) => {
        if (typeof registration.update === "function") {
          registration.update().catch(() => {});
        }

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((error) => {
        console.warn("PWA indisponivel neste navegador:", error);
      });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    try {
      const ultimaTroca = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
      if (ultimaTroca && Date.now() - ultimaTroca < 5000) return;
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    } catch (_) {}
    window.location.reload();
  });
})();
