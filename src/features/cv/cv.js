/* features/cv/cv.js — 履歴書 (rirekisho) + 職務経歴書 (shokumukeirekisho) builder.
   One form feeds two live documents; the ENG/JPN-style toggle picks which one shows and
   prints. Print captures only the selected document. */
  /* ---------------- CV builder ---------------- */
  var cvPhoto="";
  var DRAFT_KEY="lw_cv_draft";   /* a saved-in-progress draft (localStorage) */

  /* ---- rirekisho: 学歴・職歴 + 免許・資格 rows ---- */
  function addEduRow(type,y,m,txt){
    var row=el("div","cv-row");
    row.innerHTML='<select class="e-type"><option>学歴</option><option>職歴</option></select>'+
      '<input class="e-year" placeholder="年" value="'+esc(y||"")+'">'+
      '<input class="e-month" placeholder="月" value="'+esc(m||"")+'">'+
      '<input class="e-text" placeholder="例：◯◯大学 入学 ／ △△株式会社 入社" value="'+esc(txt||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    if(type) row.querySelector(".e-type").value=type;
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#eduRows").appendChild(row);
  }
  function addLicRow(y,m,txt){
    var row=el("div","cv-row lic");
    row.innerHTML='<input class="l-year" placeholder="年" value="'+esc(y||"")+'">'+
      '<input class="l-month" placeholder="月" value="'+esc(m||"")+'">'+
      '<input class="l-text" placeholder="例：日本語能力試験 N1 合格" value="'+esc(txt||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#licRows").appendChild(row);
  }

  /* ---- shokumukeirekisho: experience / projects / education / skills / languages ---- */
  function addCareer(title,period,co,loc,det){
    var b=el("div","cv-career");
    b.innerHTML='<button class="rm" type="button" aria-label="remove">×</button>'+
      '<div class="cv-field"><label>役職・タイトル / Role title</label><input class="c-title" placeholder="QA Engineer / QA Automation Engineer"></div>'+
      '<div class="cv-two"><div class="cv-field"><label>会社名 / Company</label><input class="c-co" placeholder="例：株式会社サンプル"></div>'+
      '<div class="cv-field"><label>期間 / Period</label><input class="c-period" placeholder="例：2019年4月 – 現在"></div></div>'+
      '<div class="cv-field"><label>勤務地 / Location</label><input class="c-loc" placeholder="例：東京都、日本"></div>'+
      '<div class="cv-field"><label>業務内容・実績（1行＝1項目）/ Responsibilities (one per line)</label><textarea class="c-det" placeholder="例：決済APIを Go で設計・開発&#10;月間1,000万リクエストを安定運用"></textarea></div>';
    b.querySelector(".c-title").value=title||""; b.querySelector(".c-co").value=co||"";
    b.querySelector(".c-period").value=period||""; b.querySelector(".c-loc").value=loc||""; b.querySelector(".c-det").value=det||"";
    b.querySelector(".rm").addEventListener("click",function(){ b.remove(); renderCV(); });
    $("#careerRows").appendChild(b);
  }
  function addProj(name,desc){
    var b=el("div","cv-career");
    b.innerHTML='<button class="rm" type="button" aria-label="remove">×</button>'+
      '<div class="cv-field"><label>プロジェクト名 / Project</label><input class="p-name" placeholder="例：決済プラットフォーム刷新"></div>'+
      '<div class="cv-field"><label>説明 / Description</label><textarea class="p-desc" placeholder="何を作り、どんな成果が出たか / what you built + the impact"></textarea></div>';
    b.querySelector(".p-name").value=name||""; b.querySelector(".p-desc").value=desc||"";
    b.querySelector(".rm").addEventListener("click",function(){ b.remove(); renderCV(); });
    $("#projRows").appendChild(b);
  }
  function addSkEdu(school,period,loc){
    var b=el("div","cv-career");
    b.innerHTML='<button class="rm" type="button" aria-label="remove">×</button>'+
      '<div class="cv-field"><label>学校・専攻 / School &amp; major</label><input class="se-school" placeholder="例：◯◯大学 工学部 情報工学科"></div>'+
      '<div class="cv-two"><div class="cv-field"><label>期間 / Period</label><input class="se-period" placeholder="例：2019年4月 – 2021年3月"></div>'+
      '<div class="cv-field"><label>所在地 / Location</label><input class="se-loc" placeholder="例：東京都、日本"></div></div>';
    b.querySelector(".se-school").value=school||""; b.querySelector(".se-period").value=period||""; b.querySelector(".se-loc").value=loc||"";
    b.querySelector(".rm").addEventListener("click",function(){ b.remove(); renderCV(); });
    $("#skEduRows").appendChild(b);
  }
  function addSkillRow(cat,items){
    var row=el("div","cv-row skill");
    row.innerHTML='<input class="sk-cat" placeholder="例：言語 / Category" value="'+esc(cat||"")+'">'+
      '<input class="sk-items" placeholder="例：Go, TypeScript, Python（カンマ区切り）" value="'+esc(items||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#skillRows").appendChild(row);
  }
  function addLangRow(name,level,test){
    var row=el("div","cv-row lang");
    row.innerHTML='<input class="lg-name" placeholder="例：日本語 / Language" value="'+esc(name||"")+'">'+
      '<input class="lg-level" placeholder="例：ビジネスレベル / Level" value="'+esc(level||"")+'">'+
      '<input class="lg-test" placeholder="例：JLPT N1 / TOEIC 900" value="'+esc(test||"")+'">'+
      '<button class="rm" type="button" aria-label="remove">×</button>';
    row.querySelector(".rm").addEventListener("click",function(){ row.remove(); renderCV(); });
    $("#langRows").appendChild(row);
  }

  function cvVal(id){ var n=$(id); return n?n.value.trim():""; }
  var calcAge = LW.calcAge;   /* pure, unit-tested in /test (see core/logic.js) */
  function todayStr(){ var d=new Date(); return d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日"; }
  /* split a textarea into trimmed non-empty lines (used for bullet lists) */
  function lines(s){ return String(s||"").split("\n").map(function(l){return l.trim();}).filter(Boolean); }
  /* pad a table body with blank ruled rows up to `min` so the 履歴書 always shows a full
     set of lines, like a real printed form */
  function padRows(body, min){
    var n=(body.match(/<tr/g)||[]).length, pad="";
    for(var i=n;i<min;i++) pad+='<tr><td>&nbsp;</td><td></td><td></td></tr>';
    return body+pad;
  }

  function renderCV(){
    if(!$("#rirekishoOut")) return;
    var name=cvVal("#cv_name"), furi=cvVal("#cv_furi"), dob=cvVal("#cv_dob"), gender=cvVal("#cv_gender"),
        phone=cvVal("#cv_phone"), email=cvVal("#cv_email"), postal=cvVal("#cv_postal"), addrFuri=cvVal("#cv_addrFuri"),
        addr=cvVal("#cv_addr"), motiv=cvVal("#cv_motiv"), request=cvVal("#cv_request");
    var residence=cvVal("#cv_location");   /* not `location` — that shadows window.location */
    var jobtitle=cvVal("#cv_jobtitle"), linkedin=cvVal("#cv_linkedin"), github=cvVal("#cv_github"),
        summary=cvVal("#cv_summary"), otherTech=cvVal("#cv_otherTech");
    var age=calcAge(dob);
    var dobDisp="&nbsp;";
    /* build the date straight from the yyyy-mm-dd parts — new Date(dob) parses as UTC and
       would render the day before for anyone west of UTC */
    if(dob){ var p=String(dob).split("-"); if(p.length===3 && p[0] && p[1] && p[2]) dobDisp=(+p[0])+"年 "+(+p[1])+"月 "+(+p[2])+"日生"; }

    /* ---------------- 履歴書 (rirekisho) ---------------- */
    var edu=[].map.call(document.querySelectorAll("#eduRows .cv-row"),function(r){ return {type:r.querySelector(".e-type").value, y:r.querySelector(".e-year").value, m:r.querySelector(".e-month").value, txt:r.querySelector(".e-text").value}; });
    var gak=edu.filter(function(e){return e.type==="学歴";}), shoku=edu.filter(function(e){return e.type==="職歴";});
    function histRows(label,arr){ var h=""; if(arr.some(function(e){return e.y||e.m||e.txt;})){ h+='<tr><td></td><td></td><td style="text-align:center;font-weight:700">'+label+'</td></tr>'; arr.forEach(function(e){ if(!e.y&&!e.m&&!e.txt) return; h+='<tr><td>'+esc(e.y)+'</td><td>'+esc(e.m)+'</td><td>'+esc(e.txt)+'</td></tr>'; }); } return h; }
    var histBody=histRows("学　歴",gak)+histRows("職　歴",shoku);
    if(histBody) histBody+='<tr><td></td><td></td><td style="text-align:right">以上</td></tr>';
    var lic=[].map.call(document.querySelectorAll("#licRows .cv-row"),function(r){ return {y:r.querySelector(".l-year").value, m:r.querySelector(".l-month").value, txt:r.querySelector(".l-text").value}; });
    var licBody=""; lic.forEach(function(l){ if(!l.y&&!l.m&&!l.txt) return; licBody+='<tr><td>'+esc(l.y)+'</td><td>'+esc(l.m)+'</td><td>'+esc(l.txt)+'</td></tr>'; });
    if(licBody) licBody+='<tr><td></td><td></td><td style="text-align:right">以上</td></tr>';
    var photo=cvPhoto?'<img src="'+cvPhoto+'" alt="">':'写真';
    var g男=(gender==="男")?' rk-circ':'', g女=(gender==="女")?' rk-circ':'';
    var genderCell='<span class="'+g男.trim()+'">男</span> ・ <span class="'+g女.trim()+'">女</span>'+(gender==="その他"?'　<span class="rk-circ">その他</span>':'');
    var rk='<div class="rk-top"><div class="doc-title">履　歴　書</div><div class="doc-date">'+todayStr()+' 現在</div></div>'+
      '<table class="rk-table rk-id"><tr>'+
        '<td class="rk-idmain">'+
          '<div class="rk-furi"><span class="rk-sub">ふりがな</span>　'+esc(furi)+'</div>'+
          '<div class="rk-namerow"><span class="rk-sub">名前</span>　<span class="rk-name">'+(name?esc(name):"&nbsp;")+'</span></div>'+
          '<div class="rk-dob">'+dobDisp+'　（満 '+(age!==""?age:"　")+' 歳）　'+genderCell+'</div>'+
        '</td>'+
        '<td class="rk-photocell"><div class="rk-photo">'+photo+'</div></td>'+
      '</tr></table>'+
      '<table class="rk-table rk-addr">'+
        '<tr><td class="rk-al"><span class="rk-sub">ふりがな</span>　'+esc(addrFuri)+'</td><td class="rk-ar"><span class="rk-sub">電話</span>　'+esc(phone)+'</td></tr>'+
        '<tr><td class="rk-al"><span class="rk-sub">現住所</span>　〒'+esc(postal)+'<br>'+(nl2br(addr)||"&nbsp;")+'</td><td class="rk-ar"><span class="rk-sub">Email</span><br>'+esc(email)+'</td></tr>'+
        '<tr><td class="rk-al"><span class="rk-sub">ふりがな</span></td><td class="rk-ar"><span class="rk-sub">電話</span></td></tr>'+
        '<tr><td class="rk-al"><span class="rk-sub">連絡先</span>　〒　<span class="rk-hint">（現住所以外に連絡を希望する場合のみ入力）</span></td><td class="rk-ar"><span class="rk-sub">Email</span></td></tr>'+
      '</table>'+
      '<table class="rk-table"><tr><th style="width:62px">年</th><th style="width:46px">月</th><th>学歴・職歴</th></tr>'+padRows(histBody,16)+'</table>'+
      '<table class="rk-table"><tr><th style="width:62px">年</th><th style="width:46px">月</th><th>免許・資格</th></tr>'+padRows(licBody,7)+'</table>'+
      '<table class="rk-table"><tr><td><div class="sec-h">志望動機・特技・アピールポイントなど</div>'+(nl2br(motiv)||"&nbsp;")+'</td></tr></table>'+
      '<table class="rk-table"><tr><td><div class="sec-h">本人希望欄（特に給料・職種・勤務時間・勤務地・その他について希望があれば記入）</div>'+(nl2br(request)||"&nbsp;")+'</td></tr></table>';
    $("#rirekishoOut").innerHTML=rk;

    /* ---------------- 職務経歴書 (shokumukeirekisho, modern format) ---------------- */
    /* always render the section (so the document reads as a template, never "gone");
       empty sections show a faint placeholder on screen and are dropped when printing */
    function skSec(title,body){ var empty=!body; return '<div class="sk-sec'+(empty?' sk-sec--empty':'')+'"><h4 class="sk-h">'+title+'</h4>'+(body||'<div class="sk-ph">（入力するとここに表示されます）</div>')+'</div>'; }
    function bulletList(arr){ return arr.length ? '<ul class="sk-bullets">'+arr.map(function(l){return '<li>'+esc(l)+'</li>';}).join("")+'</ul>' : ''; }

    var skills=[].map.call(document.querySelectorAll("#skillRows .cv-row"),function(r){ return {cat:r.querySelector(".sk-cat").value.trim(), items:r.querySelector(".sk-items").value.trim()}; }).filter(function(s){return s.cat||s.items;});
    var skillsBody=skills.length ? '<div class="sk-skills">'+skills.map(function(s){ return '<div class="sk-skill"><span class="sk-skill-cat">'+esc(s.cat)+'</span><span class="sk-skill-val">'+esc(s.items)+'</span></div>'; }).join("")+'</div>' : '';

    var careers=[].map.call(document.querySelectorAll("#careerRows .cv-career"),function(b){ return {title:b.querySelector(".c-title").value.trim(), co:b.querySelector(".c-co").value.trim(), period:b.querySelector(".c-period").value.trim(), loc:b.querySelector(".c-loc").value.trim(), det:b.querySelector(".c-det").value}; }).filter(function(c){return c.title||c.co||c.det;});
    var expBody=careers.map(function(c){
      return '<div class="sk-job">'+
        '<div class="sk-job-top"><span class="sk-job-title">'+esc(c.title)+'</span><span class="sk-job-period">'+esc(c.period)+'</span></div>'+
        ((c.co||c.loc)?'<div class="sk-job-co">'+esc(c.co)+(c.co&&c.loc?'　／　':'')+esc(c.loc)+'</div>':'')+
        bulletList(lines(c.det))+
      '</div>';
    }).join("");

    var projs=[].map.call(document.querySelectorAll("#projRows .cv-career"),function(b){ return {name:b.querySelector(".p-name").value.trim(), desc:b.querySelector(".p-desc").value.trim()}; }).filter(function(p){return p.name||p.desc;});
    var projBody=projs.map(function(p){ return '<div class="sk-proj"><div class="sk-proj-name">'+esc(p.name)+'</div>'+(p.desc?'<div class="sk-proj-desc">'+nl2br(p.desc)+'</div>':'')+'</div>'; }).join("");

    var skEdus=[].map.call(document.querySelectorAll("#skEduRows .cv-career"),function(b){ return {school:b.querySelector(".se-school").value.trim(), period:b.querySelector(".se-period").value.trim(), loc:b.querySelector(".se-loc").value.trim()}; }).filter(function(e){return e.school||e.period||e.loc;});
    var eduBody=skEdus.map(function(e){ return '<div class="sk-job"><div class="sk-job-top"><span class="sk-job-title">'+esc(e.school)+'</span><span class="sk-job-period">'+esc(e.period)+'</span></div>'+(e.loc?'<div class="sk-job-co">'+esc(e.loc)+'</div>':'')+'</div>'; }).join("");

    var langs=[].map.call(document.querySelectorAll("#langRows .cv-row"),function(r){ var t=r.querySelector(".lg-test"); return {name:r.querySelector(".lg-name").value.trim(), level:r.querySelector(".lg-level").value.trim(), test:(t?t.value.trim():"")}; }).filter(function(l){return l.name||l.level||l.test;});
    var langBody=langs.length ? '<div class="sk-langs">'+langs.map(function(l){ var v=esc(l.level)+(l.test?(l.level?'　':'')+'（'+esc(l.test)+'）':''); return '<div class="sk-lang"><span class="sk-skill-cat">'+esc(l.name)+'</span><span class="sk-skill-val">'+v+'</span></div>'; }).join("")+'</div>' : '';

    /* qualifications come from the rirekisho licenses */
    var qualBody=lic.filter(function(l){return l.txt;}).map(function(l){ var when=(l.y||l.m)?'（'+esc(l.y)+(l.y?'年':'')+esc(l.m)+(l.m?'月':'')+'）':''; return '<div class="sk-qual">'+esc(l.txt)+when+'</div>'; }).join("");

    var contactBits=[residence,email,phone,linkedin,github].filter(Boolean).map(esc).join('　｜　');
    var sk='<div class="sk-head">'+
        '<div class="sk-name">'+(name?esc(name):'<span class="sk-ph">氏名 / Your name</span>')+(furi?'<span class="sk-furi">（'+esc(furi)+'）</span>':'')+'</div>'+
        '<div class="sk-title">'+(jobtitle?esc(jobtitle):'<span class="sk-ph">職種・肩書き / Job title</span>')+'</div>'+
        '<div class="sk-contact">'+(contactBits||'<span class="sk-ph">居住地 ｜ メール ｜ 電話</span>')+'</div>'+
      '</div>'+
      skSec("職務要約", summary?'<div class="sk-body">'+nl2br(summary)+'</div>':'')+
      skSec("スキル", skillsBody)+
      skSec("職務経歴", expBody)+
      skSec("プロジェクト・主な実績", projBody)+
      skSec("その他の技術経験", bulletList(lines(otherTech)))+
      skSec("学歴", eduBody)+
      skSec("資格", qualBody)+
      skSec("語学", langBody);
    $("#shokumuOut").innerHTML=sk;

    var ok=!!name;
    var btn=$("#cvPrint"); if(btn) btn.disabled=!ok;
    var note=$("#cvNote"); if(note) note.style.display=ok?"none":"";
  }

  function setV(id,v){ var n=$(id); if(n) n.value=v; }
  /* A fresh, EMPTY form. Examples are shown as grey placeholder text inside each box
     (see cv.html + the add*Row builders), so nothing has to be deleted first — typing
     replaces the ghost. Education/work go OLDEST→NEWEST, two lines each. */
  function addStarterRows(){
    addEduRow("学歴","","",""); addEduRow("職歴","","","");
    addLicRow("","","");
    addSkillRow("",""); addCareer("","","","",""); addProj("",""); addSkEdu("","",""); addLangRow("","","");
  }
  var CV_FIELDS=["cv_name","cv_furi","cv_dob","cv_gender","cv_phone","cv_email","cv_postal","cv_addrFuri","cv_addr","cv_motiv","cv_request","cv_jobtitle","cv_location","cv_linkedin","cv_github","cv_summary","cv_otherTech"];
  /* wipe everything back to a single blank row per section (and drop any saved draft) */
  function clearAll(){
    try{ localStorage.removeItem(DRAFT_KEY); }catch(e){}
    CV_FIELDS.forEach(function(id){ setV("#"+id,""); });
    cvPhoto="";
    ["#eduRows","#licRows","#careerRows","#projRows","#skEduRows","#skillRows","#langRows"].forEach(function(id){ var c=$(id); if(c) c.innerHTML=""; });
    addStarterRows();
    renderCV();
  }

  /* ---- save / resume a draft so work isn't lost if someone steps away ---- */
  function rowsData(sel, map){ return [].map.call(document.querySelectorAll(sel), function(r){ var o={}; for(var k in map){ if(map.hasOwnProperty(k)){ var n=r.querySelector(map[k]); o[k]=n?n.value:""; } } return o; }); }
  function serializeCV(){
    var d={ f:{} };
    CV_FIELDS.forEach(function(id){ var n=$("#"+id); if(n) d.f[id]=n.value; });
    d.photo=cvPhoto||"";
    d.edu=rowsData("#eduRows .cv-row",{type:".e-type",y:".e-year",m:".e-month",txt:".e-text"});
    d.lic=rowsData("#licRows .cv-row",{y:".l-year",m:".l-month",txt:".l-text"});
    d.skill=rowsData("#skillRows .cv-row",{cat:".sk-cat",items:".sk-items"});
    d.career=rowsData("#careerRows .cv-career",{title:".c-title",co:".c-co",period:".c-period",loc:".c-loc",det:".c-det"});
    d.proj=rowsData("#projRows .cv-career",{name:".p-name",desc:".p-desc"});
    d.skedu=rowsData("#skEduRows .cv-career",{school:".se-school",period:".se-period",loc:".se-loc"});
    d.lang=rowsData("#langRows .cv-row",{name:".lg-name",level:".lg-level",test:".lg-test"});
    return d;
  }
  function loadDraft(){ try{ var s=localStorage.getItem(DRAFT_KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  function saveDraft(){
    var ok=false;
    try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(serializeCV())); ok=true; }
    catch(e){ try{ var d=serializeCV(); d.photo=""; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); ok=true; }catch(e2){} }
    var b=$("#cvSave"); if(b){ b.textContent = ok ? t("cv_saved_ok") : t("cv_save_err"); b.classList.toggle("cv-saved", ok); clearTimeout(b._t); b._t=setTimeout(function(){ b.textContent=t("cv_save"); b.classList.remove("cv-saved"); }, 1800); }
  }
  function restoreCV(d){
    cvPhoto = d.photo || "";
    CV_FIELDS.forEach(function(id){ setV("#"+id, (d.f && d.f[id]!=null) ? d.f[id] : ""); });
    ["#eduRows","#licRows","#careerRows","#projRows","#skEduRows","#skillRows","#langRows"].forEach(function(id){ var c=$(id); if(c) c.innerHTML=""; });
    ((d.edu&&d.edu.length)?d.edu:[{type:"学歴"},{type:"職歴"}]).forEach(function(e){ addEduRow(e.type||"学歴", e.y, e.m, e.txt); });
    ((d.lic&&d.lic.length)?d.lic:[{}]).forEach(function(l){ addLicRow(l.y,l.m,l.txt); });
    ((d.skill&&d.skill.length)?d.skill:[{}]).forEach(function(s){ addSkillRow(s.cat,s.items); });
    ((d.career&&d.career.length)?d.career:[{}]).forEach(function(c){ addCareer(c.title,c.period,c.co,c.loc,c.det); });
    ((d.proj&&d.proj.length)?d.proj:[{}]).forEach(function(p){ addProj(p.name,p.desc); });
    ((d.skedu&&d.skedu.length)?d.skedu:[{}]).forEach(function(e){ addSkEdu(e.school,e.period,e.loc); });
    ((d.lang&&d.lang.length)?d.lang:[{}]).forEach(function(l){ addLangRow(l.name,l.level,l.test); });
    renderCV();
  }
  (function initCV(){
    if(!$("#cvForm")) return;
    /* resume a saved draft if there is one; otherwise a fresh blank form (placeholders) */
    var draft=loadDraft();
    if(draft) restoreCV(draft); else addStarterRows();
    $("#cv_photo").addEventListener("change", function(e){ var f=e.target.files&&e.target.files[0]; if(!f){ cvPhoto=""; renderCV(); return; } var r=new FileReader(); r.onload=function(){ cvPhoto=r.result; renderCV(); }; r.readAsDataURL(f); });
    $("#addEdu").addEventListener("click", function(){ addEduRow("職歴","","",""); renderCV(); });
    $("#addLic").addEventListener("click", function(){ addLicRow("","",""); renderCV(); });
    $("#addCareer").addEventListener("click", function(){ addCareer("","","","",""); renderCV(); });
    $("#addSkill").addEventListener("click", function(){ addSkillRow("",""); renderCV(); });
    $("#addProj").addEventListener("click", function(){ addProj("",""); renderCV(); });
    $("#addSkEdu").addEventListener("click", function(){ addSkEdu("","",""); renderCV(); });
    $("#addLang").addEventListener("click", function(){ addLangRow("",""); renderCV(); });
    $("#cvForm").addEventListener("input", renderCV);
    $("#cvForm").addEventListener("change", renderCV);
    $("#cvPrint").addEventListener("click", function(){ window.print(); });
    var sv=$("#cvSave"); if(sv) sv.addEventListener("click", saveDraft);
    var clr=$("#cvClear"); if(clr) clr.addEventListener("click", clearAll);
    /* document toggle (like the ENG/JPN switch): flips the WHOLE page between the
       rirekisho and shokumukeirekisho views — its own form fields AND its preview doc.
       Inputs keep their values while hidden and renderCV reads them all, so both documents
       stay live; print captures only the selected document. */
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
    renderCV();
  })();
