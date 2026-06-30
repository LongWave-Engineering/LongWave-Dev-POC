/* core/init.js — bootstrap: applyLang / router / initReveal */
  /* ---------------- init ---------------- */
  /* Own the scroll position ourselves — stop the browser restoring a saved offset on hash
     change, which could re-introduce a visible scroll jump between page swaps. */
  if("scrollRestoration" in history){ try{ history.scrollRestoration="manual"; }catch(e){} }
  applyLang();
  router();
  initReveal();
  hydrateFromApi();   /* upgrade to live data when served by the backend (no-op offline) */


