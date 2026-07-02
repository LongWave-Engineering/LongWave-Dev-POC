/* core/init.js — bootstrap: applyLang / router / initReveal */
  /* ---------------- init ---------------- */
  /* Own the scroll position ourselves — stop the browser restoring a saved offset on hash
     change, which could re-introduce a visible scroll jump between page swaps. */
  if("scrollRestoration" in history){ try{ history.scrollRestoration="manual"; }catch(e){} }
  /* Wrap bootstrap so a single unexpected throw can't leave a blank page: on error we still
     reveal all content (defeating the reveal-hidden state) so the site stays readable. */
  try{
    applyLang();
    router();
    initReveal();
    probeApi();         /* detect a real backend so form submits can be honest (no-op offline) */
    hydrateFromApi();   /* upgrade to live data when served by the backend (no-op offline) */
  }catch(e){
    try{ document.querySelectorAll(".reveal").forEach(function(n){ n.classList.add("in"); }); }catch(_){}
    if(window.console && console.error) console.error("[init]", e);
  }


