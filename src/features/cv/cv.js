/* features/cv/cv.js — Japanese CV / rirekisho builder */
  /* ---------------- CV builder ---------------- */
  var cvPhoto="";
  function addEduRow(type,y,m,txt){
    var row=el("div","cv-row");
    row.innerHTML='<select class="e-type"><option>学歴</option><option>職歴</option></select>'+
      '<input class="e-year" placeholder="年" value="'+(y||"")+'">'+
      '<input class="e-month" placeholder="月" value="'+(m||"")+'">'+
      '<input class="e-text" placeholder="内容 / detail" value="'+(txt||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    if(type) row.querySelector(".e-type").value=type;
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#eduRows").appendChild(row);
  }
  function addLicRow(y,m,txt){
    var row=el("div","cv-row lic");
    row.innerHTML='<input class="l-year" placeholder="年" value="'+(y||"")+'">'+
      '<input class="l-month" placeholder="月" value="'+(m||"")+'">'+
      '<input class="l-text" placeholder="免許・資格 / qualification" value="'+(txt||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#licRows").appendChild(row);
  }
  function addCareer(co,period,role,det){
    var b=el("div","cv-career");
    b.innerHTML='<button class="rm" type="button" aria-label="remove">×</button>'+
      '<div class="cv-two"><div class="cv-field"><label>会社名 / Company</label><input class="c-co" value="'+(co||"")+'"></div>'+
      '<div class="cv-field"><label>期間 / Period</label><input class="c-period" placeholder="2022.4 – present" value="'+(period||"")+'"></div></div>'+
      '<div class="cv-field"><label>役職 / Role</label><input class="c-role" value="'+(role||"")+'"></div>'+
      '<div class="cv-field"><label>業務内容 / Details</label><textarea class="c-det">'+(det||"")+'</textarea></div>';
    b.querySelector(".rm").addEventListener("click",function(){ b.remove(); renderCV(); });
    $("#careerRows").appendChild(b);
  }
  function cvVal(id){ var n=$(id); return n?n.value.trim():""; }
  var calcAge = LW.calcAge;   /* pure, unit-tested in /test (see core/logic.js) */
  function todayStr(){ var d=new Date(); return d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日"; }
  function renderCV(){
    if(!$("#rirekishoOut")) return;
    var name=cvVal("#cv_name"), furi=cvVal("#cv_furi"), dob=cvVal("#cv_dob"), gender=cvVal("#cv_gender"),
        phone=cvVal("#cv_phone"), email=cvVal("#cv_email"), addr=cvVal("#cv_addr"), station=cvVal("#cv_station"),
        motiv=cvVal("#cv_motiv"), request=cvVal("#cv_request"), summary=cvVal("#cv_summary"), skills=cvVal("#cv_skills"), pr=cvVal("#cv_pr");
    var age=calcAge(dob);
    var dobDisp="&nbsp;";
    if(dob){ var dd=new Date(dob); if(!isNaN(dd.getTime())) dobDisp=dd.getFullYear()+"年 "+(dd.getMonth()+1)+"月 "+dd.getDate()+"日生"; }
    var edu=[].map.call(document.querySelectorAll("#eduRows .cv-row"),function(r){ return {type:r.querySelector(".e-type").value, y:r.querySelector(".e-year").value, m:r.querySelector(".e-month").value, txt:r.querySelector(".e-text").value}; });
    var gak=edu.filter(function(e){return e.type==="学歴";}), shoku=edu.filter(function(e){return e.type==="職歴";});
    function histRows(label,arr){ var h=""; if(arr.length){ h+='<tr><td></td><td></td><td style="text-align:center;font-weight:700">'+label+'</td></tr>'; arr.forEach(function(e){ if(!e.y&&!e.m&&!e.txt) return; h+='<tr><td>'+esc(e.y)+'</td><td>'+esc(e.m)+'</td><td>'+esc(e.txt)+'</td></tr>'; }); } return h; }
    var histBody=histRows("学　歴",gak)+histRows("職　歴",shoku);
    if(histBody) histBody+='<tr><td></td><td></td><td style="text-align:right">以上</td></tr>';
    var lic=[].map.call(document.querySelectorAll("#licRows .cv-row"),function(r){ return {y:r.querySelector(".l-year").value, m:r.querySelector(".l-month").value, txt:r.querySelector(".l-text").value}; });
    var licBody=""; lic.forEach(function(l){ if(!l.y&&!l.m&&!l.txt) return; licBody+='<tr><td>'+esc(l.y)+'</td><td>'+esc(l.m)+'</td><td>'+esc(l.txt)+'</td></tr>'; });
    var photo=cvPhoto?'<img src="'+cvPhoto+'" alt="">':'写真';
    var rk='<div class="doc-title">履歴書</div>'+
      '<div class="doc-date">'+todayStr()+' 現在</div>'+
      '<table class="rk-table"><tr>'+
        '<td style="width:74%"><div style="font-size:11px">ふりがな　'+esc(furi)+'</div><div class="rk-name">'+esc(name||"　")+'</div><div>'+dobDisp+'　（満 '+(age!==""?age:"　")+' 歳）　'+esc(gender)+'</div></td>'+
        '<td><div class="rk-photo">'+photo+'</div></td>'+
      '</tr><tr><td colspan="2"><div>現住所：'+esc(addr)+'</div><div>最寄り駅：'+esc(station)+'　電話：'+esc(phone)+'　Email：'+esc(email)+'</div></td></tr></table>'+
      '<table class="rk-table"><tr><th style="width:62px">年</th><th style="width:46px">月</th><th>学歴・職歴</th></tr>'+(histBody||'<tr><td></td><td></td><td class="muted">（入力すると表示されます）</td></tr>')+'</table>'+
      '<table class="rk-table"><tr><th style="width:62px">年</th><th style="width:46px">月</th><th>免許・資格</th></tr>'+(licBody||'<tr><td></td><td></td><td class="muted">—</td></tr>')+'</table>'+
      '<table class="rk-table"><tr><td><div class="sec-h">志望動機</div>'+(nl2br(motiv)||"&nbsp;")+'</td></tr><tr><td><div class="sec-h">本人希望記入欄</div>'+(nl2br(request)||"貴社規定に従います。")+'</td></tr></table>';
    $("#rirekishoOut").innerHTML=rk;
    var careers=[].map.call(document.querySelectorAll("#careerRows .cv-career"),function(b){ return {co:b.querySelector(".c-co").value, period:b.querySelector(".c-period").value, role:b.querySelector(".c-role").value, det:b.querySelector(".c-det").value}; });
    var cHtml=""; careers.forEach(function(c){ if(!c.co&&!c.det&&!c.role) return; cHtml+='<div class="career-block"><b>'+esc(c.co)+'</b>'+(c.period?'（'+esc(c.period)+'）':'')+(c.role?'　'+esc(c.role):'')+'<br>'+nl2br(c.det)+'</div>'; });
    var sk='<div class="doc-title">職務経歴書</div>'+
      '<div class="doc-date">'+todayStr()+'\n氏名：'+esc(name)+'</div>'+
      '<div class="sec-h">職務要約</div><div>'+(nl2br(summary)||"&nbsp;")+'</div>'+
      '<div class="sec-h">職務経歴</div>'+(cHtml||'<div class="muted">（職歴を追加すると表示されます）</div>')+
      '<div class="sec-h">活かせる経験・知識・スキル</div><div>'+(nl2br(skills)||"&nbsp;")+'</div>'+
      '<div class="sec-h">自己PR</div><div>'+(nl2br(pr)||"&nbsp;")+'</div>';
    $("#shokumuOut").innerHTML=sk;
    var ok=name&&furi&&dob;
    var btn=$("#cvPrint"); if(btn) btn.disabled=!ok;
    var note=$("#cvNote"); if(note) note.style.display=ok?"none":"";
  }
  (function initCV(){
    if(!$("#cvForm")) return;
    addEduRow("学歴","","",""); addEduRow("職歴","","",""); addLicRow("","",""); addCareer("","","","");
    $("#cv_photo").addEventListener("change", function(e){ var f=e.target.files&&e.target.files[0]; if(!f){ cvPhoto=""; renderCV(); return; } var r=new FileReader(); r.onload=function(){ cvPhoto=r.result; renderCV(); }; r.readAsDataURL(f); });
    $("#addEdu").addEventListener("click", function(){ addEduRow("職歴","","",""); renderCV(); });
    $("#addLic").addEventListener("click", function(){ addLicRow("","",""); renderCV(); });
    $("#addCareer").addEventListener("click", function(){ addCareer("","","",""); renderCV(); });
    $("#cvForm").addEventListener("input", renderCV);
    $("#cvForm").addEventListener("change", renderCV);
    $("#cvPrint").addEventListener("click", function(){ window.print(); });
    /* document toggle (like the ENG/JPN switch): flips the WHOLE page between the
       rirekisho and shokumukeirekisho views — its own form fields AND its preview.
       Inputs keep their values while hidden, and renderCV reads them all, so both
       documents stay live and print/PDF captures just the selected one. */
    var docs=$("#cvDocs"), formRk=$("#cvFormRk"), formSk=$("#cvFormSk");
    document.querySelectorAll(".cv-doctab").forEach(function(tab){
      tab.addEventListener("click", function(){
        var d=tab.getAttribute("data-doc");
        if(docs) docs.setAttribute("data-show", d);
        if(formRk) formRk.hidden = (d!=="rk");
        if(formSk) formSk.hidden = (d!=="sk");
        document.querySelectorAll(".cv-doctab").forEach(function(o){ var on=o===tab; o.classList.toggle("active", on); o.setAttribute("aria-selected", on?"true":"false"); });
      });
    });
  })();



