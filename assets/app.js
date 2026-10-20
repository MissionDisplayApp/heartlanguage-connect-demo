(function(){
'use strict';
const KEY='fbi_outreach_sandbox_v2';const RKEY=KEY+'_role',TKEY=KEY+'_tour';
const ROLES=['Super Admin','Church Admin','Staff','Volunteer'];
let ROLE=localStorage.getItem(RKEY);if(!ROLES.includes(ROLE))ROLE='Super Admin';
const WHO={'Super Admin':'Dr. Charles Keen','Church Admin':'Rachel Monroe','Staff':'Thomas Bell','Volunteer':'Priscilla Dunn'};
const ALLOW={'Super Admin':null,'Church Admin':['today','map','churches','church','pipeline','import','templates','reports','calendar','admin'],'Staff':['today','map','churches','church','pipeline','templates','calendar'],'Volunteer':['today','churches','church']};
const canSee=k=>!ALLOW[ROLE]||ALLOW[ROLE].includes(k);
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let DB;
function load(){try{DB=JSON.parse(localStorage.getItem(KEY))}catch(e){DB=null}if(!DB||!DB.churches){DB=seedData();seedExtra();save()}ensureExtra()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){toast('Sandbox storage is full')}}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)}
function fmtDT(iso){const d=new Date(iso);return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function nowT(){return new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function audit(what,who){DB.audit.unshift({t:nowT(),who:(who&&who!=='Dr. Charles Keen'?who:WHO[ROLE])+' ('+ROLE+')',what});DB.audit=DB.audit.slice(0,200)}
function ch(id){return DB.churches.find(c=>c.id===id)}
function chip(s){return `<span class="chip c-${STATUS_CLS[s]}">${esc(s)}</span>`}
function openModal(html,wide){const m=$('#modal');m.innerHTML=`<div class="mbox ${wide?'wide':''}" role="dialog" aria-modal="true">${html}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML=''}
$('#modal').addEventListener('mousedown',e=>{if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function addTL(c,type,title,detail){c.timeline.unshift({t:new Date().toISOString(),type,title,detail:detail||''})}
function setStage(c,st,quiet){if(c.stage===st)return;const old=c.stage;c.stage=st;if(st==='Do Not Contact'){c.dnc=true;if(!DB.dncList.find(d=>d.name===c.name))DB.dncList.unshift({name:c.name,reason:'Marked in pipeline',added:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})})}
 addTL(c,'stage','Stage changed: '+old+' → '+st);audit('Moved '+c.name+' from '+old+' to '+st);save();if(!quiet)toast(c.name+' → '+st)}

/* ---------- routing ---------- */
const NAV=[['today','Today'],['map','World Bible Map'],['churches','Churches'],['pipeline','Pipeline'],['calendar','Calendar'],['import','Import'],['templates','Templates'],['reports','Reports'],['admin','Admin']];
const TITLES={today:'Today',map:'World Bible Map',churches:'Churches',church:'Church Record',pipeline:'Pipeline',calendar:'Calendar',import:'Import Churches',templates:'Templates',reports:'Reports',admin:'Admin Portal'};
function route(){
 let h=location.hash.replace(/^#\/?/,'').split('?')[0]||'today';const [name,arg]=h.split('/');
 let view=VIEWS[name]?name:'today';if(!canSee(view)){view='today';history.replaceState(null,'','#/today')}else if(view==='church'&&ROLE==='Volunteer'&&!assigned(arg)){view='churches';history.replaceState(null,'','#/churches')}
 document.body.classList.remove('menu');
 $('#nav').innerHTML=NAV.filter(([k])=>canSee(k)).map(([k,l])=>`<a href="#/${k}" class="${(view===k||(view==='church'&&k==='churches'))?'on':''}"><i></i>${l}</a>`).join('');
 $('#title').textContent=TITLES[view];
 $('#today').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
 const c=$('#content');c.innerHTML='';c.scrollTop=0;
 VIEWS[view](c,decodeURIComponent(arg||''));
 document.title='HeartLanguage Connect – '+TITLES[view]+' (Sandbox)';afterRoute(view);
}
const VIEWS={};

/* ---------- TODAY ---------- */
VIEWS.today=function(el){
 const s=DB.settings;const cnt=st=>DB.churches.filter(c=>c.stage===st).length;
 const callsDone=DB.callsToday||6;
 const queue=DB.churches.filter(c=>!c.dnc&&['Replied','Called','Interested','New','Emailed'].includes(c.stage)&&(c.tier==='A'||c.stage!=='New')).slice(0,20);
 const reasons=['Replied today','Voicemail retry','Clicked link','Day 5 follow-up','Tier A, no email','Replied yesterday'];
 const rem=DB.reminders||(DB.reminders=[{t:'Send Day 10 follow-up to 12 churches',d:false},{t:'Call back Pastor Ruth Alvarez at 2:00',d:false},{t:'Mail prayer card to Trinity Hill',d:false},{t:'Review 3 new replies',d:false}]);
 const pct=Math.min(100,Math.round(s.sentToday/s.dailyLimit*100));
 el.innerHTML=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-bottom:16px">
 <div class="card"><div class="mu" style="font-size:13px">Emails Sent Today (Simulated)</div><div class="kpi" style="margin:4px 0 8px">${s.sentToday} <span class="mu" style="font-size:18px">of ${s.dailyLimit} Daily Limit</span></div><div class="bar"><div style="width:${pct}%"></div></div><div class="mu sm" style="margin-top:8px">${Math.max(0,s.dailyLimit-s.sentToday)} remaining · Warm-up ${s.warmup?'on':'off'} · ${s.pauseSending?'<b style="color:#8f3a3a">Sending paused</b>':'Resets at midnight'}</div></div>
 <div class="card"><div class="mu" style="font-size:13px">Deliverability, Last 14 Days (Sample)</div><div class="row wrap" style="margin-top:8px;gap:26px">${[['11.8%','Reply Rate','Goal 8%+'],['1.2%','Bounce Rate','Keep under 2%'],['0.4%','Opt-Out Rate','Honored immediately'],['0.0%','Complaints','Limit 0.3%']].map(a=>`<div><div class="kpi" style="font-size:28px">${a[0]}</div><div style="font-size:13px">${a[1]}</div><div class="mu sm">${a[2]}</div></div>`).join('')}</div></div>
 <div class="card"><div class="mu" style="font-size:13px">Calls Today</div><div class="kpi" style="margin:4px 0 8px">${callsDone} <span class="mu" style="font-size:18px">of 20 Queued</span></div><div class="bar"><div style="width:${Math.min(100,callsDone*5)}%"></div></div><div class="mu sm" style="margin-top:8px">About ${Math.max(0,20-callsDone)*6} minutes remaining</div></div></div>
 <div class="card" style="margin-bottom:16px;padding:14px 18px"><div class="row wrap g8">${['New','Emailed','Replied','Called','Interested','Praying','Giving'].map(st=>`<button class="stat fl1" style="min-width:90px" data-go="#/churches?stage=${st}"><div class="n">${cnt(st)}</div><div class="mu sm">${st}</div></button>`).join('')}</div></div>
 <div class="grid two" style="grid-template-columns:2fr 1fr">
 <div class="card"><div class="row" style="justify-content:space-between"><div class="h">Today's Call Queue</div><span class="mu sm">${queue.length} churches</span></div><div class="tw"><table><tr><th>#</th><th>Church</th><th>Why Today</th><th></th></tr>${queue.map((c,i)=>`<tr><td>${i+1}</td><td><a href="#/church/${c.id}">${esc(c.name)}</a><div class="mu sm">${esc(c.pastor||'Office only')} · ${esc(c.phone)}</div></td><td class="mu sm">${reasons[i%reasons.length]}</td><td><button class="btn sm" data-call="${c.id}">Call</button></td></tr>`).join('')}</table></div></div>
 <div><div class="card" style="margin-bottom:16px"><div class="h">Reminders</div>${rem.map((r,i)=>`<label class="pill"><input type="checkbox" data-rem="${i}" ${r.d?'checked':''}><span style="${r.d?'text-decoration:line-through;color:var(--mu)':''}">${esc(r.t)}</span></label>`).join('')}</div>
 <div class="info">${s.pauseSending?'Sending is paused in Admin.':'Sending is healthy. Bounces are 1.2%, under the 2% limit. Tomorrow\'s limit rises to '+Math.min(s.hardCap,s.dailyLimit+10)+'.'}</div></div></div>`;
 el.onclick=e=>{const g=e.target.closest('[data-go]');if(g){location.hash=g.dataset.go;return}const cl=e.target.closest('[data-call]');if(cl)callModal(cl.dataset.call)};
 el.onchange=e=>{if(e.target.dataset.rem!=null){rem[+e.target.dataset.rem].d=e.target.checked;save();VIEWS.today(el)}};
};

/* ---------- CHURCHES LIST ---------- */
VIEWS.churches=function(el){
 const q=new URLSearchParams((location.hash.split('?')[1])||'');
 const f=DB.ui&&DB.ui.f||{q:'',stage:'',tier:'',state:''};if(q.get('stage'))f.stage=q.get('stage');
 const states=[...new Set(DB.churches.map(c=>c.state))].sort();
 el.innerHTML=`<div class="card"><div class="row wrap g8" style="margin-bottom:12px"><input id="q" placeholder="Search churches, pastors, cities, emails" style="width:320px" value="${esc(f.q)}">
 <select id="fs"><option value="">All stages</option>${STAGES.map(s=>`<option ${f.stage===s?'selected':''}>${s}</option>`).join('')}</select>
 <select id="ft"><option value="">All tiers</option>${['A','B','C'].map(s=>`<option value="${s}" ${f.tier===s?'selected':''}>Tier ${s}</option>`).join('')}</select>
 <select id="fst"><option value="">All states</option>${states.map(s=>`<option ${f.state===s?'selected':''}>${s}</option>`).join('')}</select>
 <button class="btn s sm" id="clr">Clear</button><span class="mu sm" id="cnt" style="margin-left:auto"></span><button class="btn sm" id="addc">Add Church</button></div>
 <div class="tw"><table><thead><tr><th>Church</th><th>Pastor</th><th>City</th><th>Tier</th><th>Stage</th><th>Phone</th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
 function draw(){
  const t=f.q.toLowerCase();
  const rows=DB.churches.filter(c=>(!f.stage||c.stage===f.stage)&&(!f.tier||c.tier===f.tier)&&(!f.state||c.state===f.state)&&(!t||[c.name,c.pastor,c.city,c.email,c.denom].join(' ').toLowerCase().includes(t)));
  $('#cnt').textContent=rows.length+' of '+DB.churches.length+' churches';
  $('#tb').innerHTML=rows.map(c=>`<tr class="click" data-id="${c.id}"><td>${esc(c.name)}${c.adopted&&c.adopted.length?' <span class="chip c-nt">Adopter</span>':''}</td><td>${esc(c.pastor||'—')}</td><td>${esc(c.city)}, ${c.state}</td><td>${c.tier}</td><td><span class="chip ${c.dnc?'c-tn':'c-po'}">${c.stage}</span></td><td class="mu">${esc(c.phone)}</td></tr>`).join('')||'<tr><td colspan="6" class="mu">No churches match.</td></tr>';
  DB.ui=DB.ui||{};DB.ui.f=f;
 }
 draw();
 $('#q').oninput=e=>{f.q=e.target.value;draw()};$('#fs').onchange=e=>{f.stage=e.target.value;draw()};$('#ft').onchange=e=>{f.tier=e.target.value;draw()};$('#fst').onchange=e=>{f.state=e.target.value;draw()};
 $('#clr').onclick=()=>{f.q=f.stage=f.tier=f.state='';VIEWS.churches(el)};
 $('#tb').onclick=e=>{const r=e.target.closest('tr[data-id]');if(r)location.hash='#/church/'+r.dataset.id};
 $('#addc').onclick=()=>openModal(`<div class="h">Add Church (Sandbox)</div><label class="f">Church name</label><input id="n" style="width:100%"><div class="row g8"><div class="fl1"><label class="f">City</label><input id="ci" style="width:100%"></div><div style="width:80px"><label class="f">State</label><input id="s" style="width:100%" maxlength="2"></div></div><label class="f">Pastor name</label><input id="pa" style="width:100%"><label class="f">Email (use .example)</label><input id="em" style="width:100%" placeholder="pastor@church.example"><div class="row g8" style="margin-top:16px;justify-content:flex-end"><button class="btn s" data-x>Cancel</button><button class="btn" id="ok">Add</button></div>`);
 $('#modal').onclick=e=>{if(e.target.dataset.x!=null)closeModal()};
 setTimeout(()=>{const ok=$('#ok');if(ok)ok.onclick=()=>{const n=$('#n').value.trim();if(!n)return toast('Name required');const id='c'+Date.now();const pa=$('#pa').value.trim();DB.churches.unshift({id,name:n,city:$('#ci').value||'Unknown',state:($('#s').value||'--').toUpperCase(),tier:'C',denom:'',pastor:pa,pastorFirst:pa.replace(/^Pastor\s+/,'').split(' ')[0],email:$('#em').value||'office@example.example',phone:'(555) 010-0100',stage:'New',missions:'',nextStep:'',nextDue:'',dnc:false,adopted:[],timeline:[]});audit('Added church '+n);save();closeModal();location.hash='#/church/'+id}},0);
};

/* ---------- CHURCH RECORD ---------- */
VIEWS.church=function(el,id){
 const c=ch(id);if(!c){el.innerHTML='<div class="card">Church not found. <a href="#/churches">Back to list</a></div>';return}
 const idx=STAGES.indexOf(c.stage);
 const adopts=DB.adoptions.filter(a=>a.churchId===c.id);
 el.innerHTML=`<div style="margin-bottom:12px"><a href="#/churches" class="sm">← All churches</a></div><div class="g" style="align-items:flex-start;flex-wrap:wrap">
 <div style="width:340px;max-width:100%;display:flex;flex-direction:column;gap:16px;flex:none">
  <div class="card"><div class="h" style="font-size:24px;margin-bottom:2px">${esc(c.name)}</div><div class="mu sm">${esc(c.city)}, ${c.state} · Tier ${c.tier} · ${esc(c.denom||'Church')}</div>
  <div style="margin:12px 0">${[c.pastor||'No pastor on file',c.email,c.phone,c.missions].filter(Boolean).map(x=>`<div style="padding:5px 0;font-size:13px;border-bottom:1px solid #efedf3;word-break:break-all">${esc(x)}</div>`).join('')}</div>
  ${c.dnc?'<div class="warn" style="margin-bottom:12px">On the Do-Not-Contact list. Email is blocked.</div>':''}
  <div class="mu sm" style="margin-bottom:6px">Pipeline Stage (click to change)</div><div class="stages" style="margin-bottom:12px">${STAGES.map((s,i)=>`<button class="chip ${i<idx?'done':''} ${i===idx?'cur':''}" data-stage="${s}">${s}</button>`).join('')}</div>
  <div class="row g8 wrap"><button class="btn sm" data-act="email" ${c.dnc?'disabled':''}>Send Personal Email</button><button class="btn s sm" data-act="call">Log Call</button><button class="btn s sm" data-act="note">Add Note</button></div></div>
  <div class="card"><div class="h" style="margin-bottom:8px">Adopted Languages</div>${adopts.length?adopts.map(a=>`<div style="padding:6px 0;border-bottom:1px solid #efedf3;display:flex;justify-content:space-between;gap:8px;font-size:13px"><span>${esc(a.lang)} <span class="mu sm">(${esc(a.country)})</span></span><span class="chip c-po">${esc(a.commit)}</span></div>`).join(''):'<div class="mu sm">None yet.</div>'}<a class="btn s sm" style="margin-top:10px" href="#/map">Adopt A Language</a></div>
  <div class="card"><div class="h" style="margin-bottom:6px">Next Step</div><input id="ns" placeholder="e.g. Call after missions meeting" style="width:100%" value="${esc(c.nextStep)}"><input id="nd" type="date" style="margin-top:8px" value="${esc(c.nextDue)}"><button class="btn s sm" id="nsb" style="margin-top:8px">Save Next Step</button></div>
 </div>
 <div class="card fl1" style="min-width:300px"><div class="row wrap" style="justify-content:space-between;margin-bottom:14px;gap:8px"><div class="h" style="margin:0">Timeline</div><div class="row g8 wrap"><button class="btn sm" data-act="callsim">Click To Call ${esc(c.phone)}</button><button class="btn s sm" data-act="note">Add Note</button><button class="btn s sm" data-act="call">Log Call</button></div></div>
 ${c.timeline.map((t,i)=>`<div class="tl ${t.type}"><div class="dotc"><b></b>${i<c.timeline.length-1?'<em></em>':''}</div><div><div class="mu sm">${fmtDT(t.t)} · ${t.type[0].toUpperCase()+t.type.slice(1)}</div><div style="font-size:13.5px;margin:2px 0">${esc(t.title)}</div>${t.detail?`<div class="mu sm">${esc(t.detail)}</div>`:''}</div></div>`).join('')||'<div class="mu">No activity yet.</div>'}</div></div>`;
 el.onclick=e=>{const b=e.target.closest('[data-stage]');if(b){setStage(c,b.dataset.stage);return VIEWS.church(el,id)}
  const a=e.target.closest('[data-act]');if(!a)return;const k=a.dataset.act;
  if(k==='email')emailModal(c.id);else if(k==='call')callModal(c.id);else if(k==='note')noteModal(c.id);
  else if(k==='callsim')toast('Sandbox: no call placed. In the real tool this would dial from Dr. Keen\'s own phone.')};
 $('#nsb').onclick=()=>{c.nextStep=$('#ns').value;c.nextDue=$('#nd').value;addTL(c,'note','Next step set: '+(c.nextStep||'(cleared)'),c.nextDue?'Due '+c.nextDue:'');audit('Set next step for '+c.name);save();toast('Next step saved');VIEWS.church(el,id)};
};
function noteModal(id){const c=ch(id);openModal(`<div class="h">Add Note · ${esc(c.name)}</div><textarea id="nt" rows="5" placeholder="Type a note"></textarea><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Save Note</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const v=$('#nt').value.trim();if(!v)return toast('Type a note first');addTL(c,'note','Note: '+v);audit('Added note on '+c.name);save();closeModal();toast('Note added');route()}}
function callModal(id){const c=ch(id);openModal(`<div class="h">Log Call · ${esc(c.name)}</div><div class="mu sm">${esc(c.pastor||'Office')} · ${esc(c.phone)} (fictional)</div>
 <div class="info" style="margin:10px 0;font-size:12px">Voicemail script: "Hello ${esc(c.pastorFirst||'')}, this is Charles Keen with FirstBible International. I would love to pray with you for the nations. You can reach me at my office. God bless."</div>
 <label class="f">Outcome</label><select id="o" style="width:100%">${['Interested','Spoke - Follow Up Later','Voicemail','No Answer','Not Now','Wrong Number','Do Not Contact'].map(x=>`<option>${x}</option>`).join('')}</select>
 <label class="f">Length (mm:ss)</label><input id="l" value="3:00"><label class="f">Notes</label><textarea id="n" rows="3"></textarea>
 <label class="row g8" style="margin-top:10px"><input type="checkbox" id="adv" checked> <span class="sm">Advance pipeline stage automatically</span></label>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Log Call</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const o=$('#o').value;addTL(c,'call','Call: '+o,'Length '+$('#l').value+($('#n').value?' · '+$('#n').value:''));
  DB.callsToday=(DB.callsToday||6)+1;audit('Logged call: '+c.name+' ('+o+')','Dr. Charles Keen');
  if($('#adv').checked){if(o==='Do Not Contact')setStage(c,'Do Not Contact',true);else if(o==='Interested'&&STAGES.indexOf(c.stage)<4)setStage(c,'Interested',true);else if(o==='Not Now')setStage(c,'Not Now',true);else if(['New','Emailed','Replied'].includes(c.stage))setStage(c,'Called',true)}
  save();closeModal();toast('Call logged (sandbox)');route()}}
function merge(text,c){const ad=DB.adoptions.filter(a=>a.churchId===c.id).map(a=>a.lang);
 const m={'Pastor Name':c.pastor||'Pastor','Pastor First Name':c.pastorFirst||'Pastor','Church Name':c.name,'City':c.city,'Adopted Language':ad.length?'Thank you for praying for the '+ad.join(' and ')+' people.':''};
 return text.replace(/\{([^}]+)\}/g,(x,k)=>m[k]!==undefined?m[k]:x)}
function emailModal(id){const c=ch(id);const T=DB.templates;let t=T[0];
 openModal(`<div class="h">Send Personal Email</div><div class="warn" style="margin-bottom:10px">Sandbox: this only simulates a send and logs it to the timeline. No email leaves this browser.</div>
 <div class="row wrap g8"><div class="sm"><b>To:</b> ${esc(c.pastor||'Church office')} &lt;${esc(c.email)}&gt;</div><span style="flex:1"></span><select id="tp">${T.map(x=>`<option value="${x.id}">Template: ${esc(x.name)}</option>`).join('')}</select></div>
 <label class="f">Subject</label><input id="su" style="width:100%" value="${esc(t.subject)}"><label class="f">Message</label><textarea id="bd" rows="10">${esc(t.body)}</textarea>
 <div class="row wrap g8" style="margin-top:8px"><span class="sm mu">Insert:</span>${['Pastor Name','Pastor First Name','Church Name','City','Adopted Language'].map(k=>`<button class="mergef" data-m="${k}">${k}</button>`).join('')}</div>
 <div class="mu sm" style="margin:10px 0">Opt-out link and postal address added automatically. Today: ${DB.settings.sentToday} of ${DB.settings.dailyLimit} sent (simulated).</div>
 <div id="pv" class="email-prev" hidden></div>
 <div class="row g8 wrap" style="margin-top:12px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn s" id="pvb">Preview</button><button class="btn" id="ok">Send Email (Simulated)</button></div>`,true);
 const bd=$('#bd'),su=$('#su');let last=bd;su.onfocus=()=>last=su;bd.onfocus=()=>last=bd;
 $('#tp').onchange=e=>{t=T.find(x=>x.id===e.target.value);su.value=t.subject;bd.value=t.body};
 $('#modal').onmousedown=e=>{if(e.target.dataset.m){e.preventDefault();const f=last,s=f.selectionStart??f.value.length;f.value=f.value.slice(0,s)+'{'+e.target.dataset.m+'}'+f.value.slice(f.selectionEnd??s);f.focus()}else if(e.target.id==='modal')closeModal()};
 const foot='\n\n--\nFirstBible International · 123 Example Street, Anytown, USA (fictional address)\nTo stop receiving these notes, click: https://outreach.example-ministry.org/optout/xxxx (example link)';
 $('#pvb').onclick=()=>{const p=$('#pv');p.hidden=false;p.textContent='Subject: '+merge(su.value,c)+'\n\n'+merge(bd.value,c)+foot};
 $('#x').onclick=closeModal;
 $('#ok').onclick=()=>{const s=DB.settings;
  if(c.dnc)return toast('Blocked: church is on the Do-Not-Contact list');
  if(s.pauseSending)return toast('Blocked: sending is paused in Admin');
  if(s.sentToday>=s.dailyLimit)return toast('Blocked: daily limit of '+s.dailyLimit+' reached');
  if(!DB.dns.spf||!DB.dns.dkim||!DB.dns.dmarc)return toast('Blocked: sending domain health check failing (see Admin)');
  s.sentToday++;addTL(c,'email','Email sent: '+merge(su.value,c),'Delivered (simulated) · template "'+t.name+'"');
  if(c.stage==='New')setStage(c,'Emailed',true);audit('Sent email to '+c.name+' (simulated)');save();closeModal();toast('Email simulated and logged. Nothing was sent.');route()}}

/* ---------- PIPELINE ---------- */
VIEWS.pipeline=function(el){
 const tier=(DB.ui&&DB.ui.ptier)||'';
 el.innerHTML=`<div class="row wrap g8" style="margin-bottom:12px"><span class="mu sm">Drag cards between columns, or use the arrow buttons.</span><span style="flex:1"></span><select id="pt"><option value="">All tiers</option>${['A','B','C'].map(x=>`<option value="${x}" ${tier===x?'selected':''}>Tier ${x}</option>`).join('')}</select><a class="btn sm" href="#/import">Import</a></div>
 <div class="kan">${STAGES.map(s=>{const L=DB.churches.filter(c=>c.stage===s&&(!tier||c.tier===tier));const i=STAGES.indexOf(s);return `<div class="col" data-st="${s}"><div class="hd"><span>${s}</span><span class="mu">${L.length}</span></div>${L.map(c=>`<div class="kc" draggable="true" data-id="${c.id}"><div class="nm" data-open="${c.id}" title="${esc(c.name)}">${esc(c.name)}</div><div class="mu" style="font-size:11px">Tier ${c.tier} · ${c.state}</div><div class="mv"><button data-mv="-1" ${i===0?'disabled':''} aria-label="Move left">◀</button><button data-mv="1" ${i===STAGES.length-1?'disabled':''} aria-label="Move right">▶</button></div></div>`).join('')}</div>`}).join('')}</div>`;
 $('#pt').onchange=e=>{DB.ui=DB.ui||{};DB.ui.ptier=e.target.value;save();VIEWS.pipeline(el)};
 let drag=null;
 el.ondragstart=e=>{const k=e.target.closest('.kc');if(!k)return;drag=k.dataset.id;k.classList.add('dragging');e.dataTransfer.setData('text/plain',drag);e.dataTransfer.effectAllowed='move'};
 el.ondragend=e=>{document.querySelectorAll('.dragging,.over').forEach(x=>x.classList.remove('dragging','over'))};
 el.ondragover=e=>{const c=e.target.closest('.col');if(c){e.preventDefault();document.querySelectorAll('.over').forEach(x=>x.classList.remove('over'));c.classList.add('over')}};
 el.ondrop=e=>{const col=e.target.closest('.col');if(!col)return;e.preventDefault();const id=e.dataTransfer.getData('text/plain')||drag;const c=ch(id);if(c){setStage(c,col.dataset.st);VIEWS.pipeline(el)}};
 el.onclick=e=>{const o=e.target.closest('[data-open]');if(o)return location.hash='#/church/'+o.dataset.open;const m=e.target.closest('[data-mv]');if(m){const card=m.closest('.kc'),c=ch(card.dataset.id);const ni=STAGES.indexOf(c.stage)+ +m.dataset.mv;if(ni>=0&&ni<STAGES.length){setStage(c,STAGES[ni]);VIEWS.pipeline(el)}}};
};

/* ---------- MAP ---------- */
function countryData(g){
 const hand=COUNTRY_LANGS[g.n];
 if(hand){return {name:g.n,region:hand.region,fbi:!!hand.fbi,people:hand.people||hand.langs.reduce((a,l)=>a+l.people,0),langs:hand.langs,sample:false}}
 let h=0;for(const x of g.n)h=(h*31+x.charCodeAt(0)*7)%97;const n=h%9;
 const reg=g.c[1]<150&&g.c[0]<400?'North America':g.c[0]<330&&g.c[1]>=150?'South America':g.c[0]>=420&&g.c[0]<560&&g.c[1]<230?'Europe & Central Asia':g.c[0]<600&&g.c[1]>=170?'Africa':g.c[0]>=780?'Oceania':'Asia';
 const langs=[];for(let i=0;i<n;i++){const st=STATUS[(h+i*3)%4];langs.push({name:g.n+' '+FALLBACK_POOL[(h+i)%FALLBACK_POOL.length],status:st,people:((h+1)*(i+3)*997)%90000+500,note:''})}
 return {name:g.n,region:reg,fbi:false,people:langs.reduce((a,l)=>a+l.people,0),langs,sample:true};
}
const SCALE=['#efeaf6','#d4c6e6','#b49bd2','#8a67b4','#563184','#3f2774'];
const SLAB=['0','1-2','3-4','5-6','7-8','9+'];
const bucket=n=>n<1?0:n<3?1:n<5?2:n<7?3:n<9?4:5;
const need=d=>d.langs.filter(l=>l.status!=='Complete Bible').length;
const MAPST={sel:null,k:1,x:0,y:0,region:'',status:'',fbiOnly:false,q:''};
VIEWS.map=function(el){
 const CD={};GEO.c.forEach(g=>CD[g.id]=countryData(g));
 const regions=[...new Set(Object.values(CD).map(d=>d.region))].sort();
 el.innerHTML=`<div class="mapwrap"><div class="card" id="mapcard"><div class="maptools"><div style="position:relative"><input id="ms" placeholder="Search countries or languages" style="width:260px" autocomplete="off"><div class="results" id="res" hidden></div></div>
 <select id="mr"><option value="">Region: All</option>${regions.map(r=>`<option ${MAPST.region===r?'selected':''}>${r}</option>`).join('')}</select>
 <select id="mst"><option value="">Status: All</option>${STATUS.map(s=>`<option ${MAPST.status===s?'selected':''}>${s}</option>`).join('')}</select>
 <button class="btn s sm ${MAPST.fbiOnly?'on':''}" id="mf">FirstBible Projects Only</button>
 <div class="zoomb"><button class="btn s sm" id="zi" aria-label="Zoom in">+</button><button class="btn s sm" id="zo" aria-label="Zoom out">−</button><button class="btn s sm" id="zr">Reset</button></div></div>
 <div class="mapsvgbox"><svg id="mapsvg" viewBox="0 0 ${GEO.w} ${GEO.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map"><g id="mg">${GEO.c.map(g=>{const d=CD[g.id];return `<path data-id="${g.id}" d="${g.d}" fill="${SCALE[bucket(need(d))]}" ${d.fbi?'class="fbi"':''}></path>`}).join('')}<g id="mk"></g></g></svg><div id="maptip"></div></div>
 <div class="legend"><span class="mu">Languages Without A Complete Bible (sample)</span>${SCALE.map((c,i)=>`<span><i style="background:${c}"></i>${SLAB[i]}</span>`).join('')}<span><i style="border:2.5px solid #e1ab7a"></i>FirstBible International Project</span></div></div>
 <div class="card sidepanel" id="panel"></div></div>`;
 const svg=$('#mapsvg'),mg=$('#mg');
 const apply=()=>{mg.setAttribute('transform',`translate(${MAPST.x} ${MAPST.y}) scale(${MAPST.k})`)};
 function clamp(){const k=MAPST.k;MAPST.x=Math.min(0,Math.max(GEO.w*(1-k),MAPST.x));MAPST.y=Math.min(0,Math.max(GEO.h*(1-k),MAPST.y))}
 function zoomAt(f,cx,cy){const nk=Math.min(14,Math.max(1,MAPST.k*f));const r=nk/MAPST.k;MAPST.x=cx-(cx-MAPST.x)*r;MAPST.y=cy-(cy-MAPST.y)*r;MAPST.k=nk;clamp();apply()}
 const pt=e=>{const r=svg.getBoundingClientRect();const s=Math.min(r.width/GEO.w,r.height/GEO.h);const ox=(r.width-GEO.w*s)/2,oy=(r.height-GEO.h*s)/2;return [(e.clientX-r.left-ox)/s,(e.clientY-r.top-oy)/s,s]};
 $('#zi').onclick=()=>zoomAt(1.6,GEO.w/2,GEO.h/2);$('#zo').onclick=()=>zoomAt(1/1.6,GEO.w/2,GEO.h/2);$('#zr').onclick=()=>{MAPST.k=1;MAPST.x=MAPST.y=0;apply()};
 svg.addEventListener('wheel',e=>{e.preventDefault();const [x,y]=pt(e);zoomAt(e.deltaY<0?1.25:.8,x,y)},{passive:false});
 let dr=null,moved=false;
 svg.addEventListener('pointerdown',e=>{dr={x:e.clientX,y:e.clientY,ox:MAPST.x,oy:MAPST.y};moved=false});
 window.addEventListener('pointermove',mm);window.addEventListener('pointerup',mu);
 function mm(e){if(!dr)return;const s=pt(e)[2];const dx=e.clientX-dr.x,dy=e.clientY-dr.y;if(Math.abs(dx)+Math.abs(dy)>4){moved=true;svg.classList.add('drag')}if(moved){MAPST.x=dr.ox+dx/s;MAPST.y=dr.oy+dy/s;clamp();apply()}}
 function mu(){dr=null;svg.classList.remove('drag')}
 const cleanup=()=>{window.removeEventListener('pointermove',mm);window.removeEventListener('pointerup',mu);window.removeEventListener('hashchange',cleanup)};window.addEventListener('hashchange',cleanup);
 const tip=$('#maptip');
 svg.addEventListener('mousemove',e=>{const p=e.target.closest('path');if(!p){tip.style.display='none';return}const d=CD[p.dataset.id];const r=svg.parentNode.getBoundingClientRect();tip.style.display='block';tip.style.left=Math.min(e.clientX-r.left+12,r.width-190)+'px';tip.style.top=(e.clientY-r.top+12)+'px';tip.innerHTML=`${esc(d.name)} · ${need(d)} without a complete Bible${d.fbi?' · FBI project':''}`});
 svg.addEventListener('mouseleave',()=>tip.style.display='none');
 svg.addEventListener('click',e=>{if(moved)return;const p=e.target.closest('path');if(p)select(p.dataset.id,true)});
 function filt(){document.querySelectorAll('#mapsvg path').forEach(p=>{const d=CD[p.dataset.id];let ok=true;if(MAPST.region&&d.region!==MAPST.region)ok=false;if(MAPST.status&&!d.langs.some(l=>l.status===MAPST.status))ok=false;if(MAPST.fbiOnly&&!d.fbi)ok=false;p.classList.toggle('dim',!ok);p.classList.toggle('sel',p.dataset.id===MAPST.sel)});markers()}
 function markers(){const mk=$('#mk');mk.innerHTML='';GEO.c.forEach(g=>{if(CD[g.id].fbi){mk.innerHTML+=`<circle cx="${g.c[0]}" cy="${g.c[1]}" r="${6/MAPST.k}" fill="#e1ab7a" stroke="#fff" stroke-width="1.5" style="pointer-events:none"/>`}})}
 $('#mr').onchange=e=>{MAPST.region=e.target.value;filt()};$('#mst').onchange=e=>{MAPST.status=e.target.value;filt()};
 $('#mf').onclick=e=>{MAPST.fbiOnly=!MAPST.fbiOnly;e.target.classList.toggle('on',MAPST.fbiOnly);filt()};
 const res=$('#res');
 $('#ms').oninput=e=>{const q=e.target.value.trim().toLowerCase();if(!q){res.hidden=true;return}const out=[];GEO.c.forEach(g=>{const d=CD[g.id];if(d.name.toLowerCase().includes(q))out.push(`<div data-id="${g.id}">${esc(d.name)} <span class="mu sm">country</span></div>`);else if(!d.sample)d.langs.forEach(l=>{if(l.name.toLowerCase().includes(q))out.push(`<div data-id="${g.id}">${esc(l.name)} <span class="mu sm">language · ${esc(d.name)}</span></div>`)})});res.innerHTML=out.slice(0,25).join('')||'<div class="mu">No match</div>';res.hidden=false};
 res.onclick=e=>{const d=e.target.closest('[data-id]');if(d){select(d.dataset.id,true);res.hidden=true;$('#ms').value=''}};
 function zoomTo(id){const g=GEO.c.find(x=>x.id===id);MAPST.k=3;MAPST.x=GEO.w/2-g.c[0]*3;MAPST.y=GEO.h/2-g.c[1]*3;clamp();apply()}
 function select(id,zoom){MAPST.sel=id;if(zoom&&id!==undefined&&MAPST.k===1)zoomTo(id);filt();panel(id)}
 function panel(id){
  const p=$('#panel');if(!id){p.innerHTML=`<div class="h" style="font-size:24px">World Bible Map</div><div class="info">Click any country to see its languages and Bible translation status. Drag to pan, scroll or use +/− to zoom. Mongolia is highlighted as a FirstBible International project.</div><div class="warn" style="margin-top:12px">Shading and language lists are <b>sample data for illustration</b>, not real statistics. Real data would come from Joshua Project.</div><div style="margin-top:14px"><button class="btn" id="gm">Open Mongolia</button></div><div class="h" style="margin-top:18px">Recent Adoptions (Sandbox)</div>${adoptList(DB.adoptions.slice(0,6))}<div class="mu sm" style="margin-top:14px">Data provided by <a href="https://joshuaproject.net" target="_blank" rel="noopener">Joshua Project</a> (credit shown as required; figures here are sample only). Boundaries: Natural Earth (public domain).</div>`;
   $('#gm').onclick=()=>select(GEO.c.find(g=>g.n==='Mongolia').id,true);return}
  const d=CD[id];const ad=DB.adoptions.filter(a=>a.country===d.name);
  p.innerHTML=`<div class="row wrap g8"><div class="h" style="font-size:28px;margin:0">${esc(d.name)}</div>${d.fbi?'<span class="chip" style="background:#fbeedd;color:#a8641f;border:1px solid #e1ab7a">FirstBible Project</span>':''}</div>
  <div class="mu sm" style="margin:2px 0 12px">${esc(d.region)} · ${d.langs.length} languages listed · ${need(d)} without a complete Bible</div>
  ${d.fbi?'<div class="info" style="margin-bottom:14px">Mongolian Bible: first draft presented March 2025. Sample figures shown for illustration.</div>':''}${d.sample?'<div class="warn" style="margin-bottom:14px">Sample languages generated for this demo. Names are placeholders.</div>':''}
  <div class="row g8" style="margin-bottom:12px">${[[d.people>=1e6?(d.people/1e6).toFixed(1)+'M':Math.round(d.people/1000)+'K','People (sample)'],[need(d),'Need Scripture'],[new Set(ad.map(a=>a.lang)).size,'Adopted']].map(([a,b])=>`<div class="fl1" style="background:var(--bg);border-radius:8px;padding:8px 10px"><div style="font-size:20px;color:var(--pd)">${a}</div><div class="mu sm">${b}</div></div>`).join('')}</div>
  ${d.langs.length?d.langs.map(l=>{const a=ad.filter(x=>x.lang===l.name);return `<div class="lang"><div class="nm"><span>${esc(l.name)}</span>${chip(l.status)}</div><div class="mu sm">${l.people.toLocaleString()} speakers (sample)${l.note?' · '+esc(l.note):''}</div>${a.length?`<div class="sm" style="color:#2f5388;margin-top:2px">Adopted by ${a.map(x=>esc(x.church)).join(', ')}</div>`:''}<div style="margin-top:6px"><button class="btn sm" data-adopt="${esc(l.name)}">Adopt This Language</button></div></div>`}).join(''):'<div class="mu">No languages listed in this sample.</div>'}
  <div class="mu sm" style="margin-top:14px">Data provided by <a href="https://joshuaproject.net" target="_blank" rel="noopener">Joshua Project</a> (sample shading only).</div>`;
  p.onclick=e=>{const b=e.target.closest('[data-adopt]');if(b)adoptModal(d,d.langs.find(l=>l.name===b.dataset.adopt),()=>panel(id))};
 }
 function adoptList(a){return a.length?a.map(x=>`<div class="pill sm"><span class="fl1">${esc(x.lang)} <span class="mu">(${esc(x.country)})</span><br><span class="mu">${esc(x.church)}</span></span><span class="chip c-po">${esc(x.commit)}</span></div>`).join(''):'<div class="mu sm">None yet</div>'}
 filt();apply();if(MAPST.sel)panel(MAPST.sel);else panel(null);
 if(MAPST.sel&&MAPST.k===1)zoomTo(MAPST.sel);
 el.onclick=e=>{if(!e.target.closest('#res')&&e.target.id!=='ms')res.hidden=true};
};
function adoptModal(d,l,done){
 const list=DB.churches.filter(c=>!c.dnc);
 openModal(`<div class="h">Adopt ${esc(l.name)}</div><div class="mu sm">${esc(d.name)} · ${chip(l.status).replace(/<[^>]+>/g,'')}</div>
 <label class="f">Which church is adopting?</label><select id="ac" style="width:100%">${list.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.city)}, ${c.state}</option>`).join('')}</select>
 <label class="f">Commitment</label><select id="cm" style="width:100%"><option>Pray</option><option>Give</option><option>Pray and Give</option><option>Adopt (full)</option></select>
 <div class="mu sm" style="margin-top:10px">This records an adoption in the sandbox only and adds it to the church's timeline.</div>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Record Adoption</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const c=ch($('#ac').value),cm=$('#cm').value;
  if(DB.adoptions.some(a=>a.churchId===c.id&&a.lang===l.name&&a.country===d.name)){toast(c.name+' already adopted this language');return}
  const rec={church:c.name,churchId:c.id,country:d.name,lang:l.name,commit:cm,date:new Date().toISOString()};DB.adoptions.unshift(rec);
  c.adopted=c.adopted||[];c.adopted.push({country:d.name,lang:l.name,status:l.status,commit:cm,date:rec.date});
  addTL(c,'adopt','Adopted language: '+l.name+' ('+d.name+')','Commitment: '+cm);audit(c.name+' adopted '+l.name+' ('+cm+')');save();closeModal();toast('Adoption recorded: '+c.name+' → '+l.name);done&&done()}}

/* ---------- IMPORT ---------- */
const IM={step:1,headers:[],rows:[],map:{},file:'',dups:[],act:{}};
const FIELDS=[['name','Church Name'],['pastor','Pastor Name'],['email','Email'],['phone','Phone'],['city','City'],['state','State'],['denom','Fellowship / Denomination'],['',' — Ignore column —']];
function parseCSV(t){const rows=[];let r=[],f='',q=false;t=t.replace(/^\uFEFF/,'');for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()))rows.push(r);r=[]}else f+=c}r.push(f);if(r.some(x=>x.trim()))rows.push(r);return rows}
function guess(h){h=h.toLowerCase().replace(/[^a-z]/g,'');if(/church|^name|congregation/.test(h))return'name';if(/pastor|contact|minister/.test(h))return'pastor';if(/mail/.test(h))return'email';if(/phone|tel|mobile/.test(h))return'phone';if(/city|town/.test(h))return'city';if(/^st|state|province/.test(h))return'state';if(/denom|fellow|affil/.test(h))return'denom';return''}
const SAMPLE_CSV='church_name,pastor,email_addr,tel,town,st,fellowship\nHillcrest Community Church,Naomi Foster,office@hillcrest.example,555-010-0142,Fairhaven,OH,Independent Baptist\nRiverbend Chapel,Joel Ramsey,joel@riverbend.example,555-010-0001,Fairhaven,OH,Baptist\nBrand New Chapel,Amos Wright,amos@brandnew.example,555-010-0002,Lakemont,GA,Bible Church\nSecond New Church,Ellen Park,ellen@secondnew.example,555-010-0003,Pinecrest,NC,Non-Denominational\nBad Email Fellowship,Ben Carter,ben.carter-at-nowhere,555-010-0004,Millbrook,PA,Baptist\nCedar Point Chapel,,,555-010-0005,Oakdale,IN,Baptist\nGrace Harbor Baptist Church,Daniel Whitfield,daniel@graceharbor.example,555-010-0006,Springfield Heights,OH,Baptist\nLakeside Mission Church,Mary Ames,mary@lakeside.example,555-010-0007,Riverton,KY,Baptist\n';
const nrm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const phn=s=>String(s||'').replace(/\D/g,'').slice(-10);
VIEWS.import=function(el){
 const steps=['1 Upload','2 Match Columns','3 Duplicates & Preview','4 Done'];
 const hd=`<div class="steps">${steps.map((s,i)=>`<span class="${IM.step===i+1?'on':''}">${s}</span>`).join('')}</div>`;
 const note='<div class="warn" style="margin-bottom:14px">Sandbox import: your file is read in this browser only and never uploaded. It only changes this demo\'s local data. Please use fake data, not real church lists.</div>';
 if(IM.step===1){
  el.innerHTML=`<div class="card">${hd}${note}<div class="drop" id="dz"><div style="font-size:16px;margin-bottom:8px">Drop a CSV file here</div><div class="mu sm" style="margin-bottom:14px">or choose a file from your computer</div><input type="file" id="fi" accept=".csv,text/csv,.txt"><div style="margin-top:16px"><button class="btn s" id="smp">Use Sample CSV</button> <button class="btn s" id="dl">Download Sample CSV</button></div></div></div>`;
  const take=(text,name)=>{const r=parseCSV(text);if(r.length<2)return toast('Could not find rows in that file');IM.headers=r[0];IM.rows=r.slice(1,5001);IM.file=name;IM.map={};IM.headers.forEach((h,i)=>IM.map[i]=guess(h));IM.step=2;VIEWS.import(el)};
  $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>take(rd.result,f.name);rd.readAsText(f)};
  const dz=$('#dz');dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');const f=e.dataTransfer.files[0];if(f){const rd=new FileReader();rd.onload=()=>take(rd.result,f.name);rd.readAsText(f)}};
  $('#smp').onclick=()=>take(SAMPLE_CSV,'sample_churches.csv');
  $('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([SAMPLE_CSV],{type:'text/csv'}));a.download='sample_churches.csv';a.click()};
 }else if(IM.step===2){
  el.innerHTML=`<div class="card">${hd}<div class="mu sm" style="margin-bottom:10px">${esc(IM.file)} · ${IM.rows.length} rows. Match each column to a field.</div><div class="tw"><table><tr><th>Your Column</th><th>Example</th><th>Maps To</th></tr>${IM.headers.map((h,i)=>`<tr><td>${esc(h)}</td><td class="mu">${esc((IM.rows[0]||[])[i]||'')}</td><td><select data-col="${i}">${FIELDS.map(([k,l])=>`<option value="${k}" ${IM.map[i]===k?'selected':''}>${l}</option>`).join('')}</select></td></tr>`).join('')}</table></div>
  <div class="row g8" style="margin-top:14px;justify-content:space-between"><button class="btn s" id="bk">Back</button><button class="btn" id="nx">Continue</button></div></div>`;
  el.onchange=e=>{if(e.target.dataset.col!=null)IM.map[e.target.dataset.col]=e.target.value};
  $('#bk').onclick=()=>{IM.step=1;VIEWS.import(el)};
  $('#nx').onclick=()=>{if(!Object.values(IM.map).includes('name'))return toast('Map a column to Church Name first');analyze();IM.step=3;VIEWS.import(el)};
 }else if(IM.step===3){
  const ok=IM.recs.filter(r=>!r.dup&&!r.badEmail).length;const dn=IM.recs.filter(r=>r.dup).length,be=IM.recs.filter(r=>r.badEmail).length;
  el.innerHTML=`<div class="card">${hd}<div class="row wrap g8" style="margin-bottom:14px">${[[ok,'Ready'],[dn,'Possible Duplicates'],[be,'Invalid Emails']].map(([n,l])=>`<div class="stat" style="cursor:default;min-width:150px"><div class="n">${n}</div><div class="mu sm">${l}</div></div>`).join('')}</div>
  ${dn?`<div class="info" style="margin-bottom:12px">${dn} rows match existing churches by email, phone, or church name plus city. Choose Skip, Merge, or Import Anyway.</div>`:''}
  <div class="tw"><table><tr><th>Church</th><th>Pastor</th><th>Email</th><th>Phone</th><th>City</th><th>Status</th><th>Action</th></tr>${IM.recs.slice(0,200).map((r,i)=>`<tr><td>${esc(r.name)}</td><td>${esc(r.pastor)}</td><td ${r.badEmail?'style="color:#8f3a3a"':''}>${esc(r.email)}</td><td>${esc(r.phone)}</td><td>${esc(r.city)} ${esc(r.state)}</td><td>${r.dup?`<span class="chip c-ts">Dup: ${r.dup.by}</span>`:r.badEmail?'<span class="chip c-tn">Bad email</span>':'<span class="chip c-cb">Ready</span>'}</td><td>${r.dup?`<select data-act="${i}">${['Skip','Merge','Import Anyway'].map(a=>`<option ${r.act===a?'selected':''}>${a}</option>`).join('')}</select>`:r.badEmail?`<select data-act="${i}">${['Import Without Email','Skip'].map(a=>`<option ${r.act===a?'selected':''}>${a}</option>`).join('')}</select>`:'Import'}</td></tr>`).join('')}</table></div>${IM.recs.length>200?`<div class="mu sm">Showing first 200 of ${IM.recs.length}.</div>`:''}
  <div class="row g8" style="margin-top:14px;justify-content:space-between"><button class="btn s" id="bk">Back</button><button class="btn" id="go">Import Into Sandbox</button></div></div>`;
  el.onchange=e=>{if(e.target.dataset.act!=null)IM.recs[+e.target.dataset.act].act=e.target.value};
  $('#bk').onclick=()=>{IM.step=2;VIEWS.import(el)};
  $('#go').onclick=()=>{let a=0,m=0,s=0;IM.recs.forEach(r=>{if(r.act==='Skip'){s++;return}
    if(r.dup&&r.act==='Merge'){const c=r.dup.c;if(!c.pastor&&r.pastor){c.pastor=r.pastor.startsWith('Pastor')?r.pastor:'Pastor '+r.pastor;c.pastorFirst=r.pastor.replace(/^Pastor\s+/,'').split(' ')[0]}if(r.email&&!r.badEmail)c.email=c.email||r.email;if(!c.phone&&r.phone)c.phone=r.phone;addTL(c,'note','Merged from import: '+IM.file);m++;return}
    const pa=r.pastor?(r.pastor.startsWith('Pastor')?r.pastor:'Pastor '+r.pastor):'';
    DB.churches.unshift({id:'c'+Date.now()+Math.floor(Math.random()*1e5),name:r.name,city:r.city||'Unknown',state:(r.state||'--').toUpperCase().slice(0,2),tier:pa?'B':'C',denom:r.denom,pastor:pa,pastorFirst:pa.replace(/^Pastor\s+/,'').split(' ')[0],email:r.badEmail&&r.act==='Import Without Email'?'':r.email,phone:r.phone,stage:'New',missions:'',nextStep:'',nextDue:'',dnc:false,adopted:[],timeline:[{t:new Date().toISOString(),type:'note',title:'Imported from '+IM.file,detail:'Sandbox import'}]});a++});
   audit('Imported '+IM.file+': '+a+' added, '+m+' merged, '+s+' skipped');save();IM.res={a,m,s};IM.step=4;VIEWS.import(el)};
 }else{
  el.innerHTML=`<div class="card">${hd}<div class="h">Import Complete (Sandbox)</div><div style="font-size:15px;margin-bottom:14px">${IM.res.a} churches added · ${IM.res.m} merged · ${IM.res.s} skipped</div><div class="row g8"><a class="btn" href="#/churches">View Churches</a><button class="btn s" id="again">Import Another File</button></div></div>`;
  $('#again').onclick=()=>{IM.step=1;VIEWS.import(el)};
 }
};
function analyze(){
 const ix={};Object.entries(IM.map).forEach(([i,k])=>{if(k)ix[k]=+i});
 const get=(r,k)=>(ix[k]!=null?(r[ix[k]]||'').trim():'');
 const seen=new Set();
 IM.recs=IM.rows.map(r=>{const o={name:get(r,'name'),pastor:get(r,'pastor'),email:get(r,'email'),phone:get(r,'phone'),city:get(r,'city'),state:get(r,'state'),denom:get(r,'denom')};
  o.badEmail=!!o.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email);
  let d=null;for(const c of DB.churches){if(o.email&&c.email&&c.email.toLowerCase()===o.email.toLowerCase())d={by:'Email',c};else if(o.phone&&phn(o.phone).length>=7&&phn(c.phone)===phn(o.phone))d={by:'Phone',c};else if(o.name&&nrm(c.name)===nrm(o.name)&&nrm(c.city)===nrm(o.city))d={by:'Name + City',c};if(d)break}
  const k=nrm(o.name)+nrm(o.city);if(!d&&seen.has(k))d={by:'In This File',c:null};seen.add(k);
  o.dup=d;o.act=d?'Skip':o.badEmail?'Import Without Email':'Import';
  if(d&&!d.c)o.act='Skip';return o}).filter(o=>o.name);
}

/* ---------- TEMPLATES ---------- */
VIEWS.templates=function(el){
 el.innerHTML=`<div class="g" style="flex-wrap:wrap;align-items:flex-start">${DB.templates.map(t=>`<div class="card fl1" style="min-width:300px"><div class="h">${esc(t.name)}</div><label class="f">Subject</label><input data-s="${t.id}" style="width:100%" value="${esc(t.subject)}"><label class="f">Body</label><textarea data-b="${t.id}" rows="12">${esc(t.body)}</textarea><div class="mu sm" style="margin-top:6px">Merge fields: {Pastor Name} {Pastor First Name} {Church Name} {City} {Adopted Language}</div></div>`).join('')}</div><div style="margin-top:12px"><button class="btn" id="sv">Save Templates (Sandbox)</button></div>`;
 $('#sv').onclick=()=>{DB.templates.forEach(t=>{t.subject=$(`[data-s="${t.id}"]`).value;t.body=$(`[data-b="${t.id}"]`).value});audit('Edited email templates');save();toast('Templates saved locally')};
};

/* ---------- REPORTS ---------- */
VIEWS.reports=function(el){
 const cnt=STAGES.map(s=>[s,DB.churches.filter(c=>c.stage===s).length]);const mx=Math.max(...cnt.map(c=>c[1]),1);
 const wk=[34,52,61,48,70,62];
 const need=0;
 const byCountry={};DB.adoptions.forEach(a=>byCountry[a.country]=(byCountry[a.country]||0)+1);
 el.innerHTML=`<div class="grid two" style="grid-template-columns:1fr 1fr"><div class="card"><div class="h">Pipeline Counts (live from sandbox)</div>${cnt.map(([s,n])=>`<div class="row" style="gap:10px;margin:6px 0"><span style="width:110px;font-size:13px">${s}</span><div class="bar fl1"><div style="width:${n/mx*100}%"></div></div><span style="width:30px;text-align:right">${n}</span></div>`).join('')}</div>
 <div class="card"><div class="h">Contacts Reached Per Week (sample)</div><div class="row" style="align-items:flex-end;gap:12px;height:140px">${wk.map((n,i)=>`<div class="fl1" style="text-align:center"><div style="background:var(--p);border-radius:8px 8px 0 0;height:${n*1.7}px"></div><div class="mu sm">W${i+1}</div></div>`).join('')}</div></div>
 <div class="card"><div class="h">Adoptions By Country</div>${Object.entries(byCountry).map(([k,v])=>`<div class="set"><span>${esc(k)}</span><b>${v}</b></div>`).join('')||'<div class="mu">None</div>'}</div>
 <div class="card"><div class="h">Export</div><div class="mu sm" style="margin-bottom:10px">Downloads a CSV of the fictional churches in this sandbox.</div><button class="btn" id="ex">Export Churches CSV</button></div></div>`;
 $('#ex').onclick=()=>{const r=[['name','pastor','email','phone','city','state','tier','stage']].concat(DB.churches.map(c=>[c.name,c.pastor,c.email,c.phone,c.city,c.state,c.tier,c.stage]));const csv=r.map(x=>x.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sandbox_churches.csv';a.click()};
};

/* ---------- ADMIN ---------- */
function sw(id,on,label,sub){return `<div class="set"><div>${label}${sub?`<div class="mu sm">${sub}</div>`:''}</div><label class="sw"><input type="checkbox" id="${id}" ${on?'checked':''}><span></span></label></div>`}
VIEWS.admin=function(el){
 const s=DB.settings,dns=DB.dns;const healthy=dns.spf&&dns.dkim&&dns.dmarc;
 el.innerHTML=`<div class="grid two" style="grid-template-columns:1.3fr 1fr;margin-bottom:16px;align-items:start">
 <div class="card"><div class="row" style="justify-content:space-between"><div class="h">Users And Roles</div><button class="btn sm" id="inv">Invite User</button></div><div class="tw"><table><tr><th>Name</th><th>Role</th><th>2FA</th><th>Last Active</th></tr>${DB.users.map(u=>`<tr><td>${esc(u.name)}</td><td><select data-role="${u.id}" ${u.role==='Super Admin'?'disabled':''}>${ROLES.map(r=>`<option ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td><td><label class="row g8"><span class="sw"><input type="checkbox" data-2fa="${u.id}" ${s.twoFA[u.id]?'checked':''}><span></span></span><span class="chip ${s.twoFA[u.id]?'c-cb':'c-ts'}">${s.twoFA[u.id]?'Enabled':'Not Set Up'}</span></label></td><td class="mu">${esc(u.active)}</td></tr>`).join('')}</table></div><div class="mu sm" style="margin-top:8px">Owner: full access · Caller: calls, notes, emails · Viewer: read only</div>
 ${sw('req2fa',s.requireTwoFA,'Require 2FA for everyone','Users without 2FA would be blocked at sign-in')}</div>
 <div class="card"><div class="h">Sending Domain Health</div><div class="mu" style="margin-bottom:8px;font-size:13px">outreach.example-ministry.org (fictional)</div>
 ${[['spf','SPF','v=spf1 include:mail.example ~all'],['dkim','DKIM','selector1._domainkey'],['dmarc','DMARC','p=quarantine; rua=reports']].map(([k,l,v])=>`<div class="set"><span style="width:60px">${l}</span><span class="chip ${dns[k]?'c-cb':'c-tn'}">${dns[k]?'Pass':'Fail'}</span><span class="mu sm fl1">${v}</span><button class="btn s sm" data-dns="${k}">${dns[k]?'Simulate Fail':'Fix'}</button></div>`).join('')}
 <div class="${healthy?'info':'warn'}" style="margin-top:12px;font-size:12px">${healthy?'Domain reputation: Good · Bounces 1.2% · Complaints 0.0%':'Domain checks failing. Simulated sending is blocked until fixed.'}</div></div></div>
 <div class="grid two" style="grid-template-columns:1fr 1fr;margin-bottom:16px;align-items:start">
 <div class="card"><div class="h">Daily Send Limit And Safety</div><div class="row g8" style="margin-bottom:6px"><span class="mu" style="font-size:13px">Current limit</span><input type="number" id="lim" min="1" max="${s.hardCap}" value="${s.dailyLimit}" style="width:90px"><button class="btn sm" id="limb">Save</button><span class="mu sm">per weekday · hard cap ${s.hardCap}</span></div>
 ${sw('wu',s.warmup,'Warm-up schedule','Raises the limit gradually each week')}${sw('pause',s.pauseSending,'Pause all sending','Emergency stop')}${sw('oo',s.optOutFooter,'Opt-out link in every email','Always on in the real tool')}${sw('auto',s.autoOptOut,'Honor opt-outs immediately')}
 <div class="row g8" style="margin-top:10px"><span class="mu sm">Sent today: ${s.sentToday}</span><button class="btn s sm" id="rs">Reset Today's Count</button></div></div>
 <div class="card"><div class="row" style="justify-content:space-between"><div class="h">Do-Not-Contact List <span class="mu sm">${DB.dncList.length} entries</span></div><button class="btn sm" id="adn">Add Entry</button></div><div class="tw"><table><tr><th>Church</th><th>Reason</th><th>Added</th><th></th></tr>${DB.dncList.map((d,i)=>`<tr><td>${esc(d.name)}</td><td class="mu">${esc(d.reason)}</td><td class="mu">${esc(d.added)}</td><td><button class="btn s sm" data-rm="${i}">Remove</button></td></tr>`).join('')}</table></div></div></div>
 <div class="card"><div class="row" style="justify-content:space-between"><div class="h">Audit Log</div><button class="btn s sm" id="aex">Download CSV</button></div>${DB.audit.slice(0,40).map(a=>`<div class="set"><span class="mu" style="width:70px">${esc(a.t)}</span><span style="width:150px">${esc(a.who)}</span><span class="fl1">${esc(a.what)}</span></div>`).join('')}</div>`;
 const re=()=>VIEWS.admin(el);
 el.onchange=e=>{const t=e.target;
  if(t.dataset.role){const u=DB.users.find(x=>x.id===t.dataset.role);audit('Changed role of '+u.name+' from '+u.role+' to '+t.value);u.role=t.value;save();toast('Role updated')}
  else if(t.dataset['2fa']){const u=DB.users.find(x=>x.id===t.dataset['2fa']);s.twoFA[u.id]=t.checked;audit((t.checked?'Enabled':'Disabled')+' 2FA for '+u.name);save();re()}
  else if(t.id==='req2fa'){s.requireTwoFA=t.checked;audit('Require 2FA '+(t.checked?'on':'off'));save();toast('Saved')}
  else if(t.id==='wu'){s.warmup=t.checked;audit('Warm-up '+(t.checked?'on':'off'));save()}
  else if(t.id==='pause'){s.pauseSending=t.checked;audit('Sending '+(t.checked?'paused':'resumed'));save();toast(t.checked?'Sending paused':'Sending resumed')}
  else if(t.id==='oo'){s.optOutFooter=t.checked;audit('Opt-out footer '+(t.checked?'on':'off'));save()}
  else if(t.id==='auto'){s.autoOptOut=t.checked;audit('Auto opt-out '+(t.checked?'on':'off'));save()}};
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.dns){dns[b.dataset.dns]=!dns[b.dataset.dns];audit((dns[b.dataset.dns]?'Fixed ':'Simulated failure of ')+b.dataset.dns.toUpperCase());save();re()}
  else if(b.id==='limb'){let v=Math.round(+$('#lim').value);if(!(v>=1))return toast('Enter a number');if(v>s.hardCap){v=s.hardCap;toast('Capped at hard limit '+s.hardCap)}else toast('Daily limit saved');audit('Changed daily limit '+s.dailyLimit+' to '+v);s.dailyLimit=v;save();re()}
  else if(b.id==='rs'){s.sentToday=0;audit('Reset today\'s sent count');save();re()}
  else if(b.dataset.rm!=null){const d=DB.dncList.splice(+b.dataset.rm,1)[0];const c=DB.churches.find(x=>x.name===d.name);if(c){c.dnc=false;if(c.stage==='Do Not Contact')c.stage='Not Now'}audit('Removed '+d.name+' from do-not-contact list');save();re()}
  else if(b.id==='adn')openModal(`<div class="h">Add Do-Not-Contact Entry</div><label class="f">Church</label><select id="dc" style="width:100%">${DB.churches.filter(c=>!c.dnc).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><label class="f">Reason</label><select id="dr" style="width:100%">${['Asked to be removed','Unsubscribed','Church closed','Bounced repeatedly'].map(x=>`<option>${x}</option>`).join('')}</select><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Add</button></div>`) || ($('#x').onclick=closeModal,$('#ok').onclick=()=>{const c=ch($('#dc').value);c.dnc=true;c.stage='Do Not Contact';DB.dncList.unshift({name:c.name,reason:$('#dr').value,added:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})});addTL(c,'stage','Added to Do-Not-Contact list: '+$('#dr').value);audit('Added '+c.name+' to do-not-contact list');save();closeModal();re()});
  else if(b.id==='inv')openModal(`<div class="h">Invite User (Simulated)</div><label class="f">Name</label><input id="in" style="width:100%"><label class="f">Role</label><select id="ir" style="width:100%"><option>Church Admin</option><option>Staff</option><option>Volunteer</option></select><div class="mu sm" style="margin-top:8px">No invitation is sent.</div><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Add User</button></div>`) || ($('#x').onclick=closeModal,$('#ok').onclick=()=>{const n=$('#in').value.trim();if(!n)return toast('Enter a name');const id='u'+Date.now();DB.users.push({id,name:n,role:$('#ir').value,active:'Never'});s.twoFA[id]=false;audit('Invited '+n+' as '+$('#ir').value+' (simulated)');save();closeModal();re()});
  else if(b.id==='aex'){const csv=DB.audit.map(a=>[a.t,a.who,a.what].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sandbox_audit_log.csv';a.click()}};
};

/* ---------- calendar (simulated), roles UI, tour ---------- */
const EVT={callback:'Callback',call:'Call',email:'Follow-Up Email',zoom:'Zoom Call'};
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const t12=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+pad(m)+(h<12?' AM':' PM')};
const SIMLBL='Simulated - Nothing Syncs';
function seedEvents(){const T=new Date();const n=i=>DB.churches[i].name;let k=0;
 const E=(o,time,type,title,i)=>({id:'e'+(++k),date:iso(addD(T,o)),time,type,title,churchId:DB.churches[i].id,notes:''});
 return [E(0,'09:30','callback','Callback: '+n(0),0),E(0,'11:00','zoom','Zoom call: missions partnership intro',1),E(0,'14:30','email','Day 4-5 follow-up email: '+n(2),2),
 E(1,'10:00','callback','Callback: '+n(3),3),E(2,'11:00','email','Day 10 follow-up email: '+n(4),4),E(3,'13:30','zoom','Zoom call: pastor prayer meeting',5),
 E(5,'09:00','email','Day 21 follow-up email: '+n(6),6),E(7,'14:00','callback','Callback: '+n(7),7),E(9,'11:00','zoom','Zoom call: adopt-a-language walkthrough',8),
 E(12,'10:00','email','Day 21 follow-up email: '+n(9),9),E(-1,'15:00','callback','Callback: '+n(10),10),E(-2,'10:30','email','Day 4-5 follow-up email: '+n(11),11),E(-4,'13:00','email','Day 10 follow-up email: '+n(12),12)]}
let seedExtra=function(){DB.events=seedEvents();DB.gcal={on:true}}
let ensureExtra=function(){if(!DB.events||!DB.gcal)seedExtra()}
const canEdit=()=>ROLE!=='Volunteer';
function evSort(a,b){return (a.date+a.time).localeCompare(b.date+b.time)}
function evById(id){return DB.events.find(e=>e.id===id)}
function gcalNote(){return DB.gcal.on?'Would sync to Google Calendar':'Google Calendar is disconnected, so this stays in the sandbox only'}
function evModal(id,pre){const e=id?evById(id):Object.assign({id:'',title:'',type:'callback',date:iso(addD(new Date(),1)),time:'10:00',churchId:'',notes:''},pre||{});
 const ch0=e.churchId?ch(e.churchId):null;
 openModal(`<div class="h">${id?'Edit Event':'New Event'} <span class="chip c-ts">${SIMLBL}</span></div>
 <label class="f">Title</label><input id="evt" style="width:100%" value="${esc(e.title)}">
 <div class="row g8 wrap"><div class="fl1"><label class="f">Type</label><select id="evy" style="width:100%">${Object.keys(EVT).map(k=>`<option value="${k}" ${e.type===k?'selected':''}>${EVT[k]}</option>`).join('')}</select></div>
 <div class="fl1"><label class="f">Date</label><input type="date" id="evd" style="width:100%" value="${e.date}"></div><div class="fl1"><label class="f">Time</label><input type="time" id="evtm" style="width:100%" value="${e.time}"></div></div>
 <label class="f">Church</label><select id="evc" style="width:100%"><option value="">None</option>${DB.churches.map(c=>`<option value="${c.id}" ${e.churchId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select>
 <label class="f">Notes</label><textarea id="evn" rows="3">${esc(e.notes)}</textarea>
 <div class="info" style="margin-top:10px;font-size:12px">${gcalNote()}. ${SIMLBL}.</div>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end">${id?'<button class="btn danger" id="evdel" data-evdel="1" style="margin-right:auto">Delete</button>':''}<button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Save Event</button></div>`);
 $('#x').onclick=closeModal;
 $('#ok').onclick=()=>{const t=$('#evt').value.trim();if(!t)return toast('Add a title');if(!$('#evd').value)return toast('Pick a date');
  const o=id?e:e;o.title=t;o.type=$('#evy').value;o.date=$('#evd').value;o.time=$('#evtm').value||'10:00';o.churchId=$('#evc').value;o.notes=$('#evn').value;
  if(!id){o.id='e'+Date.now();DB.events.push(o)}
  const c=o.churchId?ch(o.churchId):null;if(c)addTL(c,'note',(id?'Calendar event updated: ':'Calendar event added: ')+o.title,o.date+' '+t12(o.time)+' · '+gcalNote());
  audit((id?'Edited':'Added')+' calendar event "'+o.title+'" on '+o.date+' ('+SIMLBL+')');save();closeModal();toast('Event saved ('+SIMLBL+')');route()};
 if(id)$('#evdel').onclick=()=>{const c=e.churchId?ch(e.churchId):null;DB.events=DB.events.filter(x=>x.id!==id);if(c)addTL(c,'note','Calendar event deleted: '+e.title,gcalNote());audit('Deleted calendar event "'+e.title+'" ('+SIMLBL+')');save();closeModal();toast('Event deleted');route()}}
function scopeList(){return `<div style="margin:8px 0 4px;font-size:13px" class="mu">What you would be allowing (plain language)</div>
 ${[['See your calendar events','So HeartLanguage Connect can show your meetings next to your calls. Read only.'],['Add and change events it creates','Only the follow-ups and calls you schedule here. It cannot touch your other events.'],['Know your Google email address','Only to show which account is connected.']].map(([a,b])=>`<div class="set" style="align-items:flex-start"><span style="width:200px;flex:none">${a}</span><span class="mu fl1">${b}</span></div>`).join('')}
 <div class="mu sm" style="margin-top:8px">Never requested: your email messages, contacts, Drive files, or other people's calendars.</div>`}
function connectModal(done){openModal(`<div class="h">Connect Google Calendar <span class="chip c-ts">${SIMLBL}</span></div><div class="info" style="margin:8px 0;font-size:12px">This is a pretend sign-in. No Google page opens and nothing leaves this browser.</div>
 <div class="row g8" style="margin:10px 0"><div class="av">K</div><div><div style="font-size:13px">keen@firstbible.net</div><div class="mu sm">Fake account for the demo</div></div></div>${scopeList()}
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Allow (Simulated)</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{DB.gcal.on=true;audit('Connected Google Calendar keen@firstbible.net ('+SIMLBL+')');save();closeModal();toast('Connected (simulated)');done()}}
function gcalToggle(done){if(DB.gcal.on){DB.gcal.on=false;audit('Disconnected Google Calendar ('+SIMLBL+')');save();toast('Disconnected (simulated)');done()}else connectModal(done)}
function gcalCard(re){const on=DB.gcal.on;const d=document.createElement('div');d.className='card';d.id='gcal';d.style.marginBottom='16px';
 d.innerHTML=`<div class="row wrap" style="justify-content:space-between;gap:8px"><div class="h" style="margin:0">Google Calendar</div><span class="chip c-ts">${SIMLBL}</span></div>
 <div class="row g8 wrap" style="margin:12px 0"><div class="av">K</div><div class="fl1" style="min-width:180px"><div style="font-size:13px">${on?'keen@firstbible.net':'Not connected'}</div><div class="mu sm">${on?'Connected (fake account for the demo)':'Connect to see how scheduling would sync'}</div></div>
 <button class="btn ${on?'s':''} sm" id="gtog" role="switch" aria-checked="${on}">${on?'Disconnect':'Connect Google Calendar'}</button></div>${scopeList()}`;
 d.querySelector('#gtog').onclick=()=>gcalToggle(re);return d}
const CAL={mode:'month',d:null};
VIEWS.calendar=function(el){if(!CAL.d)CAL.d=new Date();const D=CAL.d,today=iso(new Date());
 const ev=DB.events.slice().sort(evSort);const by=s=>ev.filter(e=>e.date===s);
 let days,title;
 if(CAL.mode==='month'){const f=new Date(D.getFullYear(),D.getMonth(),1);const st=addD(f,-f.getDay());days=Array.from({length:42},(_,i)=>addD(st,i));title=D.toLocaleDateString('en-US',{month:'long',year:'numeric'})}
 else{const st=addD(D,-D.getDay());days=Array.from({length:7},(_,i)=>addD(st,i));title=days[0].toLocaleDateString('en-US',{month:'short',day:'numeric'})+' - '+days[6].toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
 const chipH=e=>`<button class="ev ev-${e.type}" data-ev="${e.id}" title="${esc(e.title)}"><span>${t12(e.time)}</span> ${esc(e.title)}</button>`;
 el.innerHTML=`<div class="card" style="margin-bottom:16px"><div class="row wrap g8" style="justify-content:space-between"><div class="row g8 wrap"><span class="chip c-ts">${SIMLBL}</span><span class="mu sm">Google Calendar: ${DB.gcal.on?'Connected as keen@firstbible.net (fake)':'Not connected'}</span></div><button class="btn s sm" id="gt">${DB.gcal.on?'Disconnect':'Connect Google Calendar'}</button></div></div>
 <div class="card"><div class="row wrap g8" style="margin-bottom:12px"><div class="h" style="margin:0;min-width:170px">${title}</div><span style="flex:1"></span>
 <button class="btn s sm" id="cp">Previous</button><button class="btn s sm" id="ct">Today</button><button class="btn s sm" id="cn">Next</button>
 <button class="btn sm ${CAL.mode==='month'?'on s':'s'}" id="cm">Month</button><button class="btn sm ${CAL.mode==='week'?'on s':'s'}" id="cw">Week</button><button class="btn sm" id="cadd">New Event</button></div>
 <div class="row g8 wrap sm" style="margin-bottom:10px"><span class="ev ev-callback">Callbacks</span><span class="ev ev-email">Follow-up emails (Day 4-5, Day 10, Day 21)</span><span class="ev ev-zoom">Zoom calls</span></div>
 <div class="calh">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div>${x}</div>`).join('')}</div>
 <div id="calgrid" class="calg ${CAL.mode}">${days.map(d=>{const s=iso(d),list=by(s),lim=CAL.mode==='month'?2:99;return `<div class="cd ${s===today?'tdy':''} ${CAL.mode==='month'&&d.getMonth()!==D.getMonth()?'oth':''}"><div class="dn">${CAL.mode==='week'?d.toLocaleDateString('en-US',{weekday:'short'})+' ':''}${d.getDate()}</div>${list.slice(0,lim).map(chipH).join('')}${list.length>lim?`<button class="more" data-wk="${s}">+${list.length-lim} more</button>`:''}</div>`}).join('')}</div></div>`;
 const re=()=>route();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.ev)evModal(b.dataset.ev);else if(b.dataset.wk){CAL.d=pd(b.dataset.wk);CAL.mode='week';re()}
  else if(b.id==='cp'){CAL.d=CAL.mode==='month'?new Date(D.getFullYear(),D.getMonth()-1,1):addD(D,-7);re()}
  else if(b.id==='cn'){CAL.d=CAL.mode==='month'?new Date(D.getFullYear(),D.getMonth()+1,1):addD(D,7);re()}
  else if(b.id==='ct'){CAL.d=new Date();re()}else if(b.id==='cm'){CAL.mode='month';re()}else if(b.id==='cw'){CAL.mode='week';re()}
  else if(b.id==='cadd')evModal(null);else if(b.id==='gt')gcalToggle(re)}};
function schedModal(cid,kind){const c=ch(cid);const e0={title:'',type:kind==='email'?'email':'callback',date:iso(addD(new Date(),kind==='email'?4:1)),time:'10:00'};
 openModal(`<div class="h">${kind==='email'?'Schedule Follow-Up':'Schedule Call'} · ${esc(c.name)} <span class="chip c-ts">${SIMLBL}</span></div>
 <label class="f">What</label><select id="sy" style="width:100%">${Object.keys(EVT).map(k=>`<option value="${k}" ${e0.type===k?'selected':''}>${EVT[k]}</option>`).join('')}</select>
 <div class="row g8 wrap"><div class="fl1"><label class="f">Date</label><input type="date" id="sd" style="width:100%" value="${e0.date}"></div><div class="fl1"><label class="f">Time</label><input type="time" id="st" style="width:100%" value="${e0.time}"></div></div>
 <label class="f">Note</label><textarea id="sn" rows="3" placeholder="Optional"></textarea><div class="info" style="margin-top:10px;font-size:12px">${gcalNote()}. ${SIMLBL}.</div>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Schedule</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const k=$('#sy').value,d=$('#sd').value,t=$('#st').value||'10:00';if(!d)return toast('Pick a date');
  const title=EVT[k]+': '+c.name;DB.events.push({id:'e'+Date.now(),date:d,time:t,type:k,title,churchId:c.id,notes:$('#sn').value});
  addTL(c,'note','Scheduled: '+EVT[k],d+' '+t12(t)+' · '+gcalNote());audit('Scheduled '+EVT[k]+' for '+c.name+' on '+d+' ('+SIMLBL+')');save();closeModal();toast('Scheduled. '+gcalNote());route()}}
/* wrappers */
const vToday=VIEWS.today;VIEWS.today=function(el,a){vToday(el,a);if(ROLE==='Volunteer'||!canSee('calendar'))return;
 const list=DB.events.filter(e=>e.date===iso(new Date())).sort(evSort);const d=document.createElement('div');d.className='card';d.style.marginBottom='16px';
 d.innerHTML=`<div class="row wrap g8" style="justify-content:space-between"><div class="h" style="margin:0">Today's Calendar</div><span class="row g8"><span class="chip c-ts">${SIMLBL}</span><a href="#/calendar" class="sm">Open Calendar</a></span></div>
 <div style="margin-top:8px">${list.length?list.map(e=>`<button class="ev ev-${e.type}" style="display:block;width:100%;margin:4px 0" data-ev="${e.id}"><span>${t12(e.time)}</span> ${esc(e.title)}</button>`).join(''):'<div class="mu sm">Nothing scheduled today.</div>'}</div>`;
 d.onclick=e=>{const b=e.target.closest('[data-ev]');if(b)evModal(b.dataset.ev)};el.insertBefore(d,el.firstChild)};
const vChurch=VIEWS.church;VIEWS.church=function(el,id){vChurch(el,id);const nb=el.querySelector('[data-act="note"]');if(!nb||!canSee('calendar'))return;
 [['email','Schedule Follow-Up'],['call','Schedule Call']].forEach(([k,l])=>{const b=document.createElement('button');b.className='btn s sm';b.dataset.sched=k;b.textContent=l;b.onclick=ev=>{ev.stopPropagation();schedModal(id,k)};nb.parentNode.appendChild(b)})};
const vAdmin=VIEWS.admin;VIEWS.admin=function(el,a){vAdmin(el,a);
 if(ROLE==='Church Admin'){const k=[...el.children];k[0].children[1]&&k[0].children[1].remove();k[1]&&k[1].remove();k[2]&&k[2].remove();const r=el.querySelector('#req2fa');if(r)r.closest('.set,label,div').remove();
  const h=el.querySelector('.h');if(h)h.textContent='Your Church Team'}
 el.insertBefore(gcalCard(()=>VIEWS.admin(el)),el.firstChild)};
/* roles */
const NOTE={'Super Admin':'Sees everything: admin portal, domain health, audit log and all churches.','Church Admin':'Manages their church team, contacts, templates and reports. No global admin settings.','Staff':'Can email, log calls and notes, and use the calendar. No admin, import or delete.','Volunteer':'Sees only their assigned call queue. Can log calls and notes. No email send or export.'};
const INIT={'Super Admin':'CK','Church Admin':'RM','Staff':'TB','Volunteer':'PD'};
function syncRole(){$('#role').value=ROLE;$('#rolenote').textContent=NOTE[ROLE];$('#meav').textContent=INIT[ROLE];$('#mename').textContent=WHO[ROLE];$('#merole').textContent=ROLE;
 document.body.className=document.body.className.replace(/\br-\S+/g,'').trim()+' r-'+ROLE.toLowerCase().replace(' ','')}
function applyVol(){if(ROLE!=='Volunteer')return;const c=$('#content');let n=0;
 c.querySelectorAll('tr.click[data-id]').forEach(r=>{const ok=assigned(r.dataset.id);if(!ok&&r.style.display!=='none')r.style.display='none';if(ok)n++});
 c.querySelectorAll('[data-call]').forEach(b=>{if(!assigned(b.dataset.call)){const r=b.closest('tr');if(r&&r.style.display!=='none')r.style.display='none'}});
 const ct=$('#cnt');if(ct&&ct.textContent!==n+' assigned churches'&&c.querySelector('tr.click[data-id]'))ct.textContent=n+' assigned churches'}
new MutationObserver(applyVol).observe($('#content'),{childList:true,subtree:true});
function afterRoute(view){$('#dmd').hidden=view!=='admin';syncRole();applyVol()}
function initRole(){$('#role').innerHTML=ROLES.map(r=>`<option>${r}</option>`).join('');
 $('#role').onchange=e=>{ROLE=e.target.value;localStorage.setItem(RKEY,ROLE);syncRole();toast('Viewing as '+ROLE+' (sandbox only)');route()};syncRole()}
function resetExtras(){localStorage.removeItem(TKEY);localStorage.removeItem(RKEY);ROLE='Super Admin';syncRole();stopTour(true)}
/* tour */
let TS=null;
const TOURSTEPS=[
 {v:'map',sel:'#mapsvg',t:'World Bible Map',x:r=>'Click a country to see language groups. Shading shows Bible access. Sample data only.'},
 {v:'today',sel:'.card',t:'Today',x:r=>r==='Volunteer'?'Your assigned calls for today. Click Call to log one.':'Your day at a glance: sends, calls, reminders and today\'s calendar.'},
 {v:'churches',sel:'.card',t:'Churches',x:r=>r==='Volunteer'?'These are the churches assigned to you. Click a row to open it.':'Search and filter every church. Click a row to open its record.'},
 {v:'church',sel:'.card',t:'Church Record',x:r=>r==='Volunteer'?'Log a call or add a note. The timeline keeps the history.':'Email, log calls, add notes and schedule follow-ups. Everything lands on the timeline.'},
 {v:'pipeline',sel:'.col',t:'Pipeline',x:r=>'Drag a church card to a new stage as the relationship grows.'},
 {v:'import',sel:'.card',t:'Import',x:r=>'Upload a spreadsheet of churches. You see a preview before anything is added.'},
 {v:'calendar',sel:'#calgrid',t:'Calendar',x:r=>'Callbacks, follow-up emails and Zoom calls. Click an event to edit it. Simulated - nothing syncs.'},
 {v:'admin',sel:'.card',t:'Admin',x:r=>r==='Church Admin'?'Manage your church team here and see the simulated Google Calendar connection.':'Users and roles, domain health, send limits, audit log and the simulated Google Calendar connection.'}];
function tourSteps(){return TOURSTEPS.filter(s=>canSee(s.v))}
function stopTour(quiet){const o=$('#tour');if(o)o.remove();TS=null;if(!quiet)localStorage.setItem(TKEY,'1')}
function startTour(){stopTour(true);TS={i:0};showStep()}
function showStep(){const S=tourSteps(),s=S[TS.i];let h='#/'+s.v;
 if(s.v==='church'){const c=DB.churches.find(c=>ROLE!=='Volunteer'||assigned(c.id));h+='/'+(c?c.id:'c1')}
 if(location.hash!==h)location.hash=h;else route();
 let o=$('#tour');if(!o){o=document.createElement('div');o.id='tour';document.body.appendChild(o)}
 o.innerHTML='<div class="tshade"></div>';setTimeout(()=>{if(TS)placeStep()},s.v==='map'?800:300)}
function placeStep(){const S=tourSteps(),s=S[TS.i],o=$('#tour');if(!o)return;
 const tg=document.querySelector('#content '+s.sel)||$('#content');tg.scrollIntoView({block:'nearest'});const r=tg.getBoundingClientRect();
 const vw=innerWidth,vh=innerHeight,pad=6;
 o.innerHTML=`<div class="tshade"></div><div class="tspot" style="left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>
 <div class="tpop" role="dialog" aria-label="Tour"><div class="mu sm">Step ${TS.i+1} of ${S.length}</div><div class="h" style="margin:2px 0 4px">${s.t}</div><div style="font-size:13px;line-height:1.5">${s.x(ROLE)}</div>
 <div class="row g8" style="margin-top:12px;justify-content:space-between"><div class="tdots">${S.map((_,i)=>`<i class="${i===TS.i?'on':''}"></i>`).join('')}</div>
 <div class="row g8"><button class="btn s sm" id="tskip">Skip</button>${TS.i?'<button class="btn s sm" id="tback">Back</button>':''}<button class="btn sm" id="tnext">${TS.i===S.length-1?'Done':'Next'}</button></div></div></div>`;
 const p=o.querySelector('.tpop'),w=p.offsetWidth,ph=p.offsetHeight;let top,left=Math.max(12,Math.min(r.left,vw-w-12));
 if(r.height>vh*.5||r.width>vw*.9&&r.height>vh*.3){top=vh-ph-16;left=Math.max(12,(vw-w)/2)}
 else if(r.bottom+ph+16<vh)top=r.bottom+14;else if(r.top-ph-16>0)top=r.top-ph-14;else top=vh-ph-16;
 p.style.left=left+'px';p.style.top=Math.max(8,top)+'px';
 $('#tskip').onclick=()=>{stopTour();location.hash='#/today'};
 if($('#tback'))$('#tback').onclick=()=>{TS.i--;showStep()};
 $('#tnext').onclick=()=>{if(TS.i===S.length-1){stopTour();location.hash='#/today'}else{TS.i++;showStep()}}}
addEventListener('resize',()=>{if(TS)placeStep()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&TS){stopTour();}});
function assigned(id){const n=parseInt(String(id).replace(/\D/g,''),10);return isNaN(n)?true:n%3===0}

/* ---------- EXTENSIONS: Prayer, Giving, Visits, Tasks (all simulated) ---------- */
(function(){
const FULLX=['prayer','giving','visits','tasks'];
ALLOW['Church Admin']=ALLOW['Church Admin'].concat(FULLX);ALLOW['Staff']=ALLOW['Staff'].concat(FULLX);ALLOW['Volunteer']=ALLOW['Volunteer'].concat(['tasks']);
ALLOW['Staff']=ALLOW['Staff'].filter(k=>k!=='visits').concat(['visits']);
const ci=NAV.findIndex(n=>n[0]==='calendar');
NAV.splice(ci+1,0,['prayer','Prayer Partners'],['giving','Giving & Gifts'],['visits','Speaking & Visits'],['tasks','Team Tasks']);
Object.assign(TITLES,{prayer:'Prayer Partners & Updates',giving:'Giving Link & Gift Tracking',visits:'Speaking & Visit Scheduler',tasks:'Team Tasks'});
EVT.visit='Speaking Visit';
const TEAM=()=>DB.users.map(u=>u.name);
const canTotals=()=>ROLE==='Super Admin'||ROLE==='Church Admin';
const money=n=>'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const dAgo=n=>iso(addD(new Date(),-n)),dIn=n=>iso(addD(new Date(),n));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const METHODS=['Check','Credit Card','Bank Transfer (ACH)','Cash','Crypto - BTC','Crypto - XRP','Crypto - XLM','Crypto - HBAR'];
const SIMX='Simulated - Nothing Sent';
function seedX(){DB.x={
 prayer:[{id:'p1',country:'Mongolia',lang:'Khalkha Mongolian',text:'Pray for the translation team as they review the first full draft.',date:dAgo(6)},
  {id:'p2',country:'Mongolia',lang:'Khalkha Mongolian',text:'Pray for printing funds and safe travel across the steppe.',date:dAgo(2)},
  {id:'p3',country:'Mongolia',lang:'Buryat',text:'Pray for local believers to read Scripture aloud in homes.',date:dAgo(4)},
  {id:'p4',country:'Mongolia',lang:'Dukha (Tsaatan)',text:'Pray for reindeer herders in the taiga and for oral Bible recordings.',date:dAgo(3)},
  {id:'p5',country:'Mongolia',lang:'Evenki',text:'Pray for a first Gospel portion to reach the Evenki community.',date:dAgo(1)}],
 updates:[{id:'u1',country:'Mongolia',lang:'Khalkha Mongolian',text:'The first draft was presented in March. Thank you for praying!',date:dAgo(9),to:['Grace Harbor Baptist Church']}],
 links:{},
 gifts:[{id:'g1',churchId:'c7',lang:'Dukha (Tsaatan)',amount:250,date:dAgo(5),method:'Check',note:'First gift',thanked:true},
  {id:'g2',churchId:'c1',lang:'Khalkha Mongolian',amount:100,date:dAgo(3),method:'Credit Card',note:'',thanked:false},
  {id:'g3',churchId:'c3',lang:'Evenki',amount:0.0025,date:dAgo(1),method:'Crypto - BTC',note:'Fake BTC amount, USD value entered below',usd:160,thanked:false}],
 thank:'Dear {Pastor Name},\n\nThank you for your generous gift of {Amount} on {Date} toward the {Language} Bible translation. Your church is part of putting God\'s Word in the heart language of a people who are waiting.\n\nIn Christ,\nDr. Charles Keen',
 invites:[{churchId:'c1',note:'Pastor invited Dr. Keen for a Sunday missions emphasis.'},{churchId:'c7',note:'Missions committee asked for a Wednesday evening talk.'},{churchId:'c2',note:'Invited for the spring missions conference.'}],
 visits:[],
 tasks:[{id:'t1',title:'Call Oak Meadow about Evenki prayer card',churchId:'c3',who:'Priscilla Dunn',due:dIn(2),done:false},
  {id:'t2',title:'Send gift thank-you to Grace Harbor',churchId:'c1',who:'Thomas Bell',due:dIn(1),done:false},
  {id:'t3',title:'Follow up on Hillcrest giving commitment',churchId:'c7',who:'Rachel Monroe',due:dIn(5),done:false},
  {id:'t4',title:'Check in with Priscilla on week calls',churchId:'',who:'Dr. Charles Keen',due:dIn(3),done:false},
  {id:'t5',title:'Log voicemail attempts for Tier A churches',churchId:'c3',who:'Priscilla Dunn',due:dIn(4),done:false}]}}
const sE=seedExtra;seedExtra=function(){sE();seedX()};
ensureExtra=function(){if(!DB.events||!DB.gcal)sE();if(!DB.x)seedX()};
const cname=id=>{const c=ch(id);return c?c.name:'(no church)'};
const chOpts=(sel)=>`<option value="">None</option>`+DB.churches.map(c=>`<option value="${c.id}" ${sel===c.id?'selected':''}>${esc(c.name)}</option>`).join('');
const tlx=(id,t,d)=>{const c=ch(id);if(c)addTL(c,'note',t,d||'')};
const hdr=(h,sub)=>`<div class="row wrap g8" style="justify-content:space-between;margin-bottom:14px"><div><div class="mu sm">${sub}</div></div><span class="chip c-ts">${SIMX}</span></div>`;
function groups(){const m={};DB.x.prayer.forEach(p=>m[p.country+'|'+p.lang]=1);DB.adoptions.forEach(a=>m[a.country+'|'+a.lang]=1);return Object.keys(m).map(k=>k.split('|'))}
const adopters=(co,l)=>DB.adoptions.filter(a=>a.country===co&&a.lang===l);
const PS={g:0};
/* ---- Prayer ---- */
VIEWS.prayer=function(el){const G=groups();if(PS.g>=G.length)PS.g=0;const [co,l]=G[PS.g];
 const reqs=DB.x.prayer.filter(p=>p.country===co&&p.lang===l).sort((a,b)=>b.date.localeCompare(a.date));const ad=adopters(co,l);const ups=DB.x.updates.filter(u=>u.country===co&&u.lang===l);
 el.innerHTML=hdr('', 'Prayer requests by language and country, the churches praying for them, and short updates to those churches.')+`
 <div class="row g8 wrap" style="margin-bottom:14px"><label class="sm mu" for="pg">Language / Country</label><select id="pg">${G.map((g,i)=>`<option value="${i}" ${i===PS.g?'selected':''}>${esc(g[1])} - ${esc(g[0])}</option>`).join('')}</select></div>
 <div class="g" style="align-items:flex-start;flex-wrap:wrap">
 <div class="card fl1" style="min-width:280px"><div class="row" style="justify-content:space-between"><div class="h">Prayer Requests</div><button class="btn s sm" id="apr">Add Request</button></div>
  ${reqs.length?reqs.map(p=>`<div style="padding:8px 0;border-bottom:1px solid #efedf3;font-size:13px">${esc(p.text)}<div class="mu sm">${p.date}</div></div>`).join(''):'<div class="mu sm">No requests yet.</div>'}</div>
 <div class="card fl1" style="min-width:280px"><div class="h">Adopting Churches (${ad.length})</div>
  ${ad.length?ad.map(a=>`<div style="padding:6px 0;border-bottom:1px solid #efedf3;font-size:13px"><a href="#/church/${a.churchId}">${esc(a.church)}</a> <span class="chip c-po">${esc(a.commit)}</span></div>`).join(''):'<div class="mu sm">No church has adopted this language yet.</div>'}
  <div class="h" style="margin-top:18px">Compose Prayer Update</div><textarea id="pu" rows="4" maxlength="280" style="width:100%" placeholder="Short update (280 characters max)"></textarea>
  <div class="row wrap g8" style="justify-content:space-between;margin-top:8px"><span class="mu sm"><span id="pc">0</span>/280 · To: ${ad.length} adopting church${ad.length===1?'':'es'}</span><button class="btn" id="spu" ${ad.length?'':'disabled'}>Send Prayer Update (Simulated)</button></div></div></div>
 <div class="card" style="margin-top:16px"><div class="h">Sent Updates (Simulated)</div>${ups.length?ups.map(u=>`<div style="padding:8px 0;border-bottom:1px solid #efedf3;font-size:13px">${esc(u.text)}<div class="mu sm">${u.date} · to ${esc(u.to.join(', '))}</div></div>`).join(''):'<div class="mu sm">No updates sent yet.</div>'}</div>`;
 $('#pg').onchange=e=>{PS.g=+e.target.value;VIEWS.prayer(el)};
 $('#pu').oninput=e=>$('#pc').textContent=e.target.value.length;
 $('#apr').onclick=()=>{openModal(`<div class="h">Add Prayer Request</div><div class="mu sm" style="margin-bottom:8px">${esc(l)} · ${esc(co)}</div><textarea id="nt" rows="4" style="width:100%"></textarea><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Add Request</button></div>`);
  $('#x').onclick=closeModal;$('#ok').onclick=()=>{const v=$('#nt').value.trim();if(!v)return toast('Type a request first');DB.x.prayer.unshift({id:'p'+Date.now(),country:co,lang:l,text:v,date:iso(new Date())});audit('Added prayer request: '+l+' ('+co+')');save();closeModal();toast('Request added');VIEWS.prayer(el)}};
 $('#spu').onclick=()=>{const v=$('#pu').value.trim();if(!v)return toast('Write a short update first');
  DB.x.updates.unshift({id:'u'+Date.now(),country:co,lang:l,text:v,date:iso(new Date()),to:ad.map(a=>a.church)});
  ad.forEach(a=>{const c=ch(a.churchId);if(c)addTL(c,'email','Prayer Update sent: '+l,v+' (simulated, nothing sent)')});
  audit('Sent Prayer Update for '+l+' to '+ad.length+' church(es) ('+SIMX+')');save();toast('Prayer Update simulated and logged to '+ad.length+' timeline(s). Nothing was sent.');VIEWS.prayer(el)}};
/* ---- Giving ---- */
function giveUrl(k){return 'https://give.example-ministry.org/'+slug(k)+' (fake link)'}
function giftsTotal(f){return DB.x.gifts.filter(f||(()=>1)).reduce((s,g)=>s+(g.usd!=null?g.usd:g.amount),0)}
VIEWS.giving=function(el){const X=DB.x,cp=canTotals();
 const gl=DB.x.gifts.slice().sort((a,b)=>b.date.localeCompare(a.date));
 const rows=[...new Set(DB.adoptions.map(a=>a.churchId))];const langs=[...new Set(DB.adoptions.map(a=>a.lang))];
 const grp=(fn)=>{const m={};X.gifts.forEach(g=>{const k=fn(g);m[k]=(m[k]||0)+(g.usd!=null?g.usd:g.amount)});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 el.innerHTML=hdr('','Giving links, gift log and thank-you notes. No payments are processed; links are fake.')+`
 <div class="card" style="margin-bottom:16px"><div class="h">Giving Links (Fake URLs)</div><div class="tw"><table><thead><tr><th>Scope</th><th>Name</th><th>Link</th></tr></thead><tbody>
 ${rows.map(id=>`<tr><td>Church</td><td>${esc(cname(id))}</td><td class="sm" style="word-break:break-all">${esc(giveUrl('church-'+cname(id)))}</td></tr>`).join('')}
 ${langs.map(l=>`<tr><td>Language</td><td>${esc(l)}</td><td class="sm" style="word-break:break-all">${esc(giveUrl('language-'+l))}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="card" style="margin-bottom:16px"><div class="row wrap g8" style="justify-content:space-between"><div class="h" style="margin:0">Gift Log</div><span class="row g8"><button class="btn s sm" id="tpl">Thank-You Template</button><button class="btn sm" id="lg">Log a Gift</button></span></div>
 <div class="tw"><table><thead><tr><th>Date</th><th>Church</th><th>Language</th><th>Amount</th><th>Method</th><th></th></tr></thead><tbody>${gl.map(g=>`<tr><td>${g.date}</td><td>${esc(cname(g.churchId))}</td><td>${esc(g.lang)}</td><td>${g.usd!=null?g.amount+' (~'+money(g.usd)+')':money(g.amount)}</td><td>${esc(g.method)}</td><td>${g.thanked?'<span class="chip c-cb">Thanked</span>':`<button class="btn s sm" data-ty="${g.id}">Send Thank-You</button>`}</td></tr>`).join('')}</tbody></table></div></div>
 ${cp?`<div class="card" id="gtot"><div class="row wrap" style="justify-content:space-between"><div class="h">Giving Totals Report</div><div class="kpi">${money(giftsTotal())}</div></div>
 <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">${[['By Church',grp(g=>cname(g.churchId))],['By Language',grp(g=>g.lang)],['By Method',grp(g=>g.method)]].map(([t,a])=>`<div><div class="mu sm" style="margin-bottom:4px">${t}</div>${a.map(([k,v])=>`<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid #efedf3;font-size:13px;gap:8px"><span>${esc(k)}</span><b style="font-weight:500">${money(v)}</b></div>`).join('')}</div>`).join('')}</div>
 <div class="mu sm" style="margin-top:10px">Crypto gifts are counted at the fake USD value entered. Example figures only.</div></div>`:`<div class="info">Totals report is available to Church Admin and Super Admin.</div>`}`;
 $('#lg').onclick=()=>{openModal(`<div class="h">Log a Gift <span class="chip c-ts">${SIMX}</span></div>
 <label class="f">Church</label><select id="gc" style="width:100%">${DB.churches.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
 <label class="f">Language</label><select id="gl" style="width:100%">${langs.map(l=>`<option>${esc(l)}</option>`).join('')}</select>
 <div class="row g8 wrap"><div class="fl1"><label class="f">Amount</label><input id="ga" type="number" min="0" step="any" style="width:100%"></div><div class="fl1"><label class="f">Date</label><input id="gd" type="date" value="${iso(new Date())}" style="width:100%"></div></div>
 <label class="f">Method</label><select id="gm" style="width:100%">${METHODS.map(m=>`<option>${m}</option>`).join('')}</select>
 <div id="gu" hidden><label class="f">Approx. USD value (fake)</label><input id="gv" type="number" min="0" step="any" style="width:100%"></div>
 <label class="f">Note</label><input id="gn" style="width:100%">
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Log Gift</button></div>`);
  $('#gm').onchange=e=>$('#gu').hidden=!e.target.value.startsWith('Crypto');
  $('#x').onclick=closeModal;$('#ok').onclick=()=>{const a=parseFloat($('#ga').value);if(!(a>0))return toast('Enter an amount');const m=$('#gm').value,cr=m.startsWith('Crypto');
   const g={id:'g'+Date.now(),churchId:$('#gc').value,lang:$('#gl').value,amount:a,date:$('#gd').value,method:m,note:$('#gn').value,thanked:false};if(cr)g.usd=parseFloat($('#gv').value)||0;
   X.gifts.unshift(g);tlx(g.churchId,'Gift logged: '+(cr?a+' ('+m+')':money(a))+' for '+g.lang,m+' (simulated, no payment processed)');audit('Logged gift for '+cname(g.churchId)+' ('+m+')');save();closeModal();toast('Gift logged (sandbox)');VIEWS.giving(el)}};
 $('#tpl').onclick=()=>{openModal(`<div class="h">Thank-You Note Template</div><div class="mu sm" style="margin-bottom:6px">Merge fields: {Pastor Name} {Amount} {Date} {Language}</div><textarea id="tt" rows="10" style="width:100%">${esc(X.thank)}</textarea><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Save Template</button></div>`);
  $('#x').onclick=closeModal;$('#ok').onclick=()=>{X.thank=$('#tt').value;audit('Edited thank-you template');save();closeModal();toast('Template saved')}};
 el.onclick=e=>{const b=e.target.closest('[data-ty]');if(!b)return;const g=X.gifts.find(x=>x.id===b.dataset.ty),c=ch(g.churchId);
  const txt=X.thank.replace(/\{([^}]+)\}/g,(m,k)=>({'Pastor Name':c&&c.pastor||'Pastor','Amount':g.usd!=null?g.amount+' ('+g.method+')':money(g.amount),'Date':g.date,'Language':g.lang}[k]||m));
  openModal(`<div class="h">Send Thank-You <span class="chip c-ts">${SIMX}</span></div><div class="email-prev" style="white-space:pre-wrap">${esc(txt)}</div><div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Send (Simulated)</button></div>`);
  $('#x').onclick=closeModal;$('#ok').onclick=()=>{g.thanked=true;tlx(g.churchId,'Thank-you note sent (simulated)',txt.slice(0,120)+'...');audit('Sent thank-you note to '+cname(g.churchId)+' (simulated)');save();closeModal();toast('Thank-you simulated and logged. Nothing was sent.');VIEWS.giving(el)}}};
/* ---- Visits ---- */
function visitModal(churchId,note){openModal(`<div class="h">Create Visit <span class="chip c-ts">${SIMX}</span></div>
 <label class="f">Church</label><select id="vc" style="width:100%">${DB.churches.map(c=>`<option value="${c.id}" ${c.id===churchId?'selected':''}>${esc(c.name)}</option>`).join('')}</select>
 <div class="row g8 wrap"><div class="fl1"><label class="f">Date</label><input id="vd" type="date" value="${dIn(21)}" style="width:100%"></div><div class="fl1"><label class="f">Time</label><input id="vt" type="time" value="10:30" style="width:100%"></div></div>
 <label class="f">Contact</label><input id="vn" style="width:100%" placeholder="e.g. Pastor name, 555-0100 (fictional)"><label class="f">Travel notes</label><textarea id="vtn" rows="3" style="width:100%" placeholder="Flight, hotel, hosting family"></textarea>
 <label class="f">Follow-up task assigned to</label><select id="vw" style="width:100%">${TEAM().map(n=>`<option>${esc(n)}</option>`).join('')}</select>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Create Visit</button></div>`);
 const c0=ch($('#vc').value);if(c0&&!$('#vn').value)$('#vn').value=(c0.pastor||'Church office')+', '+c0.phone;
 $('#vc').onchange=e=>{const c=ch(e.target.value);$('#vn').value=(c.pastor||'Church office')+', '+c.phone};
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const d=$('#vd').value;if(!d)return toast('Pick a date');const id=$('#vc').value,c=ch(id),vid='v'+Date.now();
  DB.events.push({id:'e'+vid,date:d,time:$('#vt').value||'10:00',type:'visit',title:'Speaking visit: '+c.name,churchId:id,notes:$('#vtn').value});
  const tid='t'+vid;DB.x.tasks.unshift({id:tid,title:'Post-visit follow-up: '+c.name,churchId:id,who:$('#vw').value,due:iso(addD(pd(d),3)),done:false});
  DB.x.visits.push({id:vid,churchId:id,date:d,time:$('#vt').value||'10:00',contact:$('#vn').value,travel:$('#vtn').value,taskId:tid});
  DB.x.invites=DB.x.invites.filter(i=>i.churchId!==id);
  addTL(c,'note','Speaking visit scheduled for '+d,gcalNote());audit('Created speaking visit at '+c.name+' on '+d+' ('+SIMX+')');save();closeModal();toast('Visit added to Calendar with a follow-up task');VIEWS.visits($('#content'))}}
VIEWS.visits=function(el){const X=DB.x,vs=X.visits.slice().sort((a,b)=>a.date.localeCompare(b.date));
 el.innerHTML=hdr('','Churches that invite Dr. Keen to speak. Visits appear on the Calendar and create a follow-up task.')+`
 <div class="card" style="margin-bottom:16px"><div class="row wrap g8" style="justify-content:space-between"><div class="h" style="margin:0">Speaking Invitations</div><button class="btn sm" id="nv">Create Visit</button></div>
 ${X.invites.length?X.invites.map(i=>`<div class="row wrap g8" style="padding:8px 0;border-bottom:1px solid #efedf3;justify-content:space-between"><div style="font-size:13px"><a href="#/church/${i.churchId}">${esc(cname(i.churchId))}</a><div class="mu sm">${esc(i.note)}</div></div><button class="btn s sm" data-iv="${i.churchId}">Schedule Visit</button></div>`).join(''):'<div class="mu sm" style="margin-top:8px">No open invitations.</div>'}</div>
 <div class="card"><div class="h">Scheduled Visits</div>${vs.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Church</th><th>Contact</th><th>Travel Notes</th><th>Follow-Up</th></tr></thead><tbody>${vs.map(v=>{const t=X.tasks.find(t=>t.id===v.taskId);return `<tr><td>${v.date} ${t12(v.time)}</td><td>${esc(cname(v.churchId))}</td><td>${esc(v.contact)}</td><td>${esc(v.travel||'—')}</td><td>${t?esc(t.who)+', due '+t.due+(t.done?' (done)':''):'—'}</td></tr>`}).join('')}</tbody></table></div><a href="#/calendar" class="sm">View on Calendar</a>`:'<div class="mu sm">No visits scheduled yet.</div>'}</div>`;
 $('#nv').onclick=()=>visitModal('');el.onclick=e=>{const b=e.target.closest('[data-iv]');if(b)visitModal(b.dataset.iv)}};
/* ---- Tasks ---- */
const TS2={who:''};
function taskModal(){openModal(`<div class="h">Assign Task <span class="chip c-ts">${SIMX}</span></div><label class="f">Task</label><input id="tt" style="width:100%" placeholder="e.g. Follow up on prayer update">
 <label class="f">Church</label><select id="tc" style="width:100%">${chOpts('')}</select><div class="row g8 wrap"><div class="fl1"><label class="f">Assign to</label><select id="tw" style="width:100%">${TEAM().map(n=>`<option>${esc(n)}</option>`).join('')}</select></div><div class="fl1"><label class="f">Due date</label><input id="td" type="date" value="${dIn(3)}" style="width:100%"></div></div>
 <div class="row g8" style="margin-top:14px;justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Assign Task</button></div>`);
 $('#x').onclick=closeModal;$('#ok').onclick=()=>{const t=$('#tt').value.trim();if(!t)return toast('Task name required');const o={id:'t'+Date.now(),title:t,churchId:$('#tc').value,who:$('#tw').value,due:$('#td').value,done:false};DB.x.tasks.unshift(o);
  if(o.churchId)tlx(o.churchId,'Task assigned to '+o.who+': '+t,'Due '+o.due);audit('Assigned task "'+t+'" to '+o.who);save();closeModal();toast('Task assigned (sandbox)');VIEWS.tasks($('#content'))}}
VIEWS.tasks=function(el){const vol=ROLE==='Volunteer',me=WHO[ROLE];let list=DB.x.tasks.slice().sort((a,b)=>a.due.localeCompare(b.due));
 if(vol)list=list.filter(t=>t.who===me);else if(TS2.who)list=list.filter(t=>t.who===TS2.who);
 const today=iso(new Date());
 const row=t=>`<label class="pill" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #efedf3"><input type="checkbox" data-td="${t.id}" ${t.done?'checked':''}><span style="${t.done?'text-decoration:line-through;color:var(--mu)':''}">${esc(t.title)}${t.churchId?' · <a href="#/church/'+t.churchId+'">'+esc(cname(t.churchId))+'</a>':''}<div class="mu sm">Due ${t.due}${!t.done&&t.due<today?' <span class="chip c-tn">Overdue</span>':''}</div></span></label>`;
 let body;if(vol)body=`<div class="card"><div class="h">My Tasks (${me})</div>${list.length?list.map(row).join(''):'<div class="mu sm">No tasks assigned to you.</div>'}</div>`;
 else{const names=TS2.who?[TS2.who]:TEAM();body=`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">${names.map(n=>{const l=list.filter(t=>t.who===n);return `<div class="card"><div class="h">${esc(n)} (${l.filter(t=>!t.done).length} open)</div>${l.length?l.map(row).join(''):'<div class="mu sm">No tasks.</div>'}</div>`}).join('')}</div>`}
 el.innerHTML=hdr('',vol?'Only the tasks assigned to you are shown.':'Assign churches and follow-ups to team members. Each person gets their own list.')+(vol?'':`<div class="row g8 wrap" style="margin-bottom:14px;justify-content:space-between"><span class="row g8"><label class="sm mu" for="tf">Team member</label><select id="tf"><option value="">Everyone</option>${TEAM().map(n=>`<option ${TS2.who===n?'selected':''}>${esc(n)}</option>`).join('')}</select></span><button class="btn sm" id="nt2">Assign Task</button></div>`)+body;
 if(!vol){$('#tf').onchange=e=>{TS2.who=e.target.value;VIEWS.tasks(el)};$('#nt2').onclick=taskModal}
 el.onchange=e=>{const id=e.target.dataset.td;if(!id)return;const t=DB.x.tasks.find(x=>x.id===id);t.done=e.target.checked;if(t.churchId)tlx(t.churchId,'Task '+(t.done?'completed':'reopened')+': '+t.title);audit('Task "'+t.title+'" '+(t.done?'completed':'reopened'));save();VIEWS.tasks(el)}};
/* ---- Today widgets ---- */
const vT=VIEWS.today;VIEWS.today=function(el,a){vT(el,a);const X=DB.x,me=WHO[ROLE],vol=ROLE==='Volunteer',d=document.createElement('div');d.className='card';d.style.marginBottom='16px';d.id='xw';
 const mine=X.tasks.filter(t=>!t.done&&(vol?t.who===me:t.who===me||ROLE==='Super Admin')).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
 const nv=X.visits.filter(v=>v.date>=iso(new Date())).sort((a,b)=>a.date.localeCompare(b.date))[0];
 const stat=(n,l,h)=>`<a href="${h}" class="stat fl1" style="min-width:110px;text-decoration:none;display:block"><div class="n">${n}</div><div class="mu sm">${l}</div></a>`;
 let h=`<div class="row wrap g8" style="justify-content:space-between"><div class="h" style="margin:0">${vol?'My Tasks':'Ministry Snapshot'}</div><span class="chip c-ts">${SIMX}</span></div><div style="margin-top:10px">`;
 if(!vol)h+=`<div class="row wrap g8" style="margin-bottom:12px">${stat(X.updates.length,'Prayer Updates Sent','#/prayer')}${canTotals()?stat(money(giftsTotal()),'Gifts Logged','#/giving'):stat(X.gifts.filter(g=>!g.thanked).length,'Thank-Yous Pending','#/giving')}${stat(X.invites.length,'Speaking Invites','#/visits')}${stat(X.tasks.filter(t=>!t.done).length,'Open Tasks','#/tasks')}</div>${nv?`<div class="sm" style="margin-bottom:8px">Next visit: <b style="font-weight:500">${esc(cname(nv.churchId))}</b>, ${nv.date}</div>`:''}<div class="mu sm" style="margin-bottom:4px">${ROLE==='Super Admin'?'Next team tasks':'My tasks'}</div>`;
 h+=(mine.length?mine.map(t=>`<div class="sm" style="padding:4px 0;border-bottom:1px solid #efedf3">${esc(t.title)} <span class="mu">· due ${t.due}${ROLE==='Super Admin'?' · '+esc(t.who):''}</span></div>`).join(''):'<div class="mu sm">Nothing assigned.</div>')+`<div style="margin-top:8px"><a href="#/tasks" class="sm">Open Team Tasks</a></div></div>`;
 d.innerHTML=h;el.appendChild(d)};
/* ---- Tour ---- */
const ti=TOURSTEPS.findIndex(s=>s.v==='admin');
TOURSTEPS.splice(ti,0,
 {v:'prayer',sel:'.card',t:'Prayer Partners',x:r=>'Browse prayer requests for each language, see which churches adopted it, and compose a short Prayer Update. Simulated: nothing is sent.'},
 {v:'giving',sel:'.card',t:'Giving & Gifts',x:r=>'Fake giving links, a gift log (including BTC, XRP, XLM and HBAR options), thank-you notes'+(canTotals()?' and the totals report.':'.')},
 {v:'visits',sel:'.card',t:'Speaking & Visits',x:r=>'Churches that invite Dr. Keen to speak. Creating a visit adds it to the Calendar and makes a follow-up task.'},
 {v:'tasks',sel:'.card',t:'Team Tasks',x:r=>r==='Volunteer'?'These are the tasks assigned to you. Check them off as you finish.':'Assign churches and follow-ups to teammates with a due date. Everyone gets a personal list.'});
/* calendar colour */
})();

/* ---------- boot ---------- */
load();
$('#reset').onclick=()=>openModal(`<div class="h">Reset Sandbox?</div><div class="mu" style="margin-bottom:16px">This erases everything you changed in this browser and restores the original example data.</div><div class="row g8" style="justify-content:flex-end"><button class="btn s" id="x">Cancel</button><button class="btn" id="ok">Reset Sandbox</button></div>`)||($('#x').onclick=closeModal,$('#ok').onclick=()=>{localStorage.removeItem(KEY);DB=null;load();resetExtras();Object.assign(IM,{step:1,recs:[]});MAPST.sel=null;MAPST.k=1;MAPST.x=MAPST.y=0;closeModal();toast('Sandbox reset to original example data');location.hash='#/today';route()});
initRole();
if(!localStorage.getItem(TKEY))setTimeout(()=>{if(!TS&&!localStorage.getItem(TKEY))startTour()},700);
$('#replay').onclick=startTour;
$('#menu').onclick=()=>document.body.classList.toggle('menu');
window.addEventListener('hashchange',route);
route();
window.__DB=()=>DB;
})();
