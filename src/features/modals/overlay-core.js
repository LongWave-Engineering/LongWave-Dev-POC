/* features/modals/overlay-core.js — shared modal plumbing: open/close, form helpers,
   the Japan-residence gate. The OVERLAYS registry itself lives in overlay-wiring.js
   (loaded last, once every overlay var is assigned); everything here reads it at
   call time only. */
  /* Where to send focus back when overlays close. A STACK, not a single slot:
     the signup modal legitimately stacks on the job modal, and a single slot
     meant closing both dropped focus on a button inside a hidden dialog (i.e.
     onto <body>). openOverlay pushes the opener, closeOverlay pops — and only
     focuses a target that is still in the document and visible. */
  var focusStack=[];

  /* ---- shared modal-form helpers (used by the inquiry / signup / post-a-job modals) ---- */
  /* trimmed value of a text field, or "" when the field is missing or blank */
  function val(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; }
  /* blank every listed field so a returning visitor never sees a previous person's input */
  function clearFields(ids){ ids.forEach(function(s){ if($(s)) $(s).value=""; }); }
  /* fire-and-forget a lead — only when a backend is actually reachable (apiReady). On a
     static host / offline there's no /api, so we DON'T pretend to submit (see leadDone). */
  function postLead(body){
    if(!apiReady) return Promise.resolve(false);
    /* resolve true only when the proxy confirms a backend actually RECEIVED it
       ({forwarded:true}) — a reachable proxy whose upstream rejected the lead
       (rate limit, validation, outage) must not count as delivered */
    return fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ return !!(d && d.forwarded); })
      .catch(function(){ return false; });
  }
  /* Optimistic-but-honest confirmation: callers show success immediately, then this
     downgrades the message if delivery turns out to have failed — the one state we
     must never leave a user in is "believed they reached us when they didn't". */
  function leadConfirm(promise, el){
    if(!promise || !el) return;
    promise.then(function(delivered){
      if(delivered) return;
      var m=el.querySelector(".msg")||el;
      m.textContent = t("lead_retry");
    });
  }
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
  function openOverlay(o){
    if(!o.classList.contains("open")) focusStack.push(document.activeElement); /* idempotent: re-opening must not double-push */
    o.classList.add("open");
    document.body.style.overflow="hidden";
  }
  function closeOverlay(o){
    o.classList.remove("open");
    /* the article modal owns a <script type=ld+json> that must not outlive it */
    if(o && o.id==="artOverlay" && LW_ARTICLE_HOOKS.onClose) LW_ARTICLE_HOOKS.onClose();
    /* only unlock body scroll once NO overlay is open — the signup can stack on the job modal */
    var anyOpen=OVERLAYS.some(function(e){ return e.ov && e.ov.classList.contains("open"); });
    if(!anyOpen) document.body.style.overflow="";
    /* walk down past anything that has since left the document or been hidden
       (a button inside another closed modal must never receive focus) */
    while(focusStack.length){
      var back=focusStack.pop();
      if(back && back.isConnected && (back.offsetWidth>0 || back.offsetHeight>0)){ back.focus(); break; }
    }
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
