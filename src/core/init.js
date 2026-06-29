/* core/init.js — bootstrap: applyLang / router / initReveal */
  /* ---------------- init ---------------- */
  applyLang();
  router();
  initReveal();
  hydrateFromApi();   /* upgrade to live data when served by the backend (no-op offline) */


