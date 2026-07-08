/* features/modals/overlay-wiring.js — THE single overlay registry + global wiring.
   Must stay LAST in the modals group in build.sh: it snapshots the overlay vars the
   other modal files assign at load. Add a modal HERE (one line) and every behaviour
   follows: close button + backdrop click, Esc, the Tab focus trap, closeOverlay's
   "any still open?" scroll-unlock check, and closeAllOverlays (nav). Ordered
   TOPMOST-FIRST — Esc/Tab act on the first open entry (the signup stacks on the
   job modal, so it must come before jobOverlay). */
  var OVERLAYS=[
    { ov: artOverlay, close: "#artClose" },
    { ov: pjOverlay,  close: "#pjClose" },
    { ov: ctOverlay,  close: "#ctClose" },
    { ov: coOverlay,  close: "#coClose" },
    { ov: suOverlay,  close: "#suClose" },
    { ov: jobOverlay, close: "#jobModalClose" },
  ];
  OVERLAYS.forEach(function(e){ wireOverlay(e.ov, e.close); });

  /* the topmost open overlay = the first open entry in the registry */
  function topOpenOverlay(){
    for(var i=0;i<OVERLAYS.length;i++){ var o=OVERLAYS[i].ov; if(o && o.classList.contains("open")) return o; }
    return null;
  }
  document.addEventListener("keydown", function(e){
    var openOv=topOpenOverlay();
    if(!openOv) return;
    if(e.key==="Escape"){ closeOverlay(openOv); return; }
    if(e.key==="Tab"){
      var f=focusables(openOv); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
