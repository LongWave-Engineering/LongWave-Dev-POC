/* features/modals/overlay-core.js — shared modal plumbing: open/close, form helpers,
   the Japan-residence gate. The OVERLAYS registry itself lives in overlay-wiring.js
   (loaded last, once every overlay var is assigned); everything here reads it at
   call time only. */
  var lastFocus=null;   /* the element to refocus when the top overlay closes */

  /* ---- shared modal-form helpers (used by the inquiry / signup / post-a-job modals) ---- */
  /* trimmed value of a text field, or "" when the field is missing or blank */
  function val(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; }
  /* blank every listed field so a returning visitor never sees a previous person's input */
  function clearFields(ids){ ids.forEach(function(s){ if($(s)) $(s).value=""; }); }
  /* fire-and-forget a lead — only when a backend is actually reachable (apiReady). On a
     static host / offline there's no /api, so we DON'T pretend to submit (see leadDone). */
  function postLead(body){ if(apiReady){ fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).catch(function(){}); } }
  /* Show the post-submit state honestly: the normal success only when a backend actually
     received the lead; otherwise tell the user we couldn't (no /api here) so they don't
     believe they've reached us. Pass okText for a dynamic message, or omit to keep the
     element's markup text when a backend IS present. */
  function leadDone(el, okText){
    if(!el) return;
    var m=el.querySelector(".msg")||el;
    if(!apiReady) m.textContent = t("lead_offline");
    else if(okText!=null) m.textContent = okText;
    el.style.display="block";
  }

  /* ---- Japan-residence gate (shared by the signup + company-inquiry forms) ----
     Base requirement is being IN JAPAN now. Applicants currently abroad are filtered
     out — the warning shows and the submit button is disabled, and submit handlers
     refuse an "abroad" value as a backstop. */
  var LOC_LABEL={ eligible:"In Japan (work-eligible)", need_visa:"In Japan (needs visa support)", abroad:"Outside Japan" };
  function isAbroad(selId){ var s=$(selId); return !!(s && s.value==="abroad"); }
  function bindLocWarn(selId, warnId, submitId){
    var s=$(selId), w=$(warnId), b=submitId?$(submitId):null; if(!s||!w) return;
    s.addEventListener("change", function(){
      var abroad = s.value==="abroad";
      w.style.display = abroad ? "" : "none";
      if(b) b.disabled = abroad;   /* hard gate: can't submit from outside Japan */
    });
  }

  /* ---- overlay open/close ---- */
  function openOverlay(o){ o.classList.add("open"); document.body.style.overflow="hidden"; }
  function closeOverlay(o){
    o.classList.remove("open");
    /* only unlock body scroll once NO overlay is open — the signup can stack on the job modal */
    var anyOpen=OVERLAYS.some(function(e){ return e.ov && e.ov.classList.contains("open"); });
    if(!anyOpen) document.body.style.overflow="";
    if(lastFocus) lastFocus.focus();
  }
  /* close every open overlay (nav uses this when routing to a new page) */
  function closeAllOverlays(){ OVERLAYS.forEach(function(e){ if(e.ov && e.ov.classList.contains("open")) closeOverlay(e.ov); }); }
  /* wire a modal's close-button + backdrop click to closeOverlay (guarded → no-op if absent) */
  function wireOverlay(overlay, closeBtnId){
    if(!overlay) return;
    var btn=$(closeBtnId); if(btn) btn.addEventListener("click", function(){ closeOverlay(overlay); });
    overlay.addEventListener("click", function(e){ if(e.target===overlay) closeOverlay(overlay); });
  }
  function focusables(container){
    var list=container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(list, function(n){ return n.offsetWidth>0 || n.offsetHeight>0 || n===document.activeElement; });
  }
