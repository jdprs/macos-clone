"use strict";
/* ===================== 应用定义 ===================== */
const APPS={
  finder:{name:'访达',icon:ICONS.finder,def:{w:720,h:440},wins:{w:800,h:480}},
  safari:{name:'Safari',icon:ICONS.safari,def:{w:920,h:560},wins:{w:980,h:600}},
  notes:{name:'备忘录',icon:ICONS.notes,def:{w:640,h:460},wins:{w:700,h:500}},
  messages:{name:'信息',icon:ICONS.messages,def:{w:700,h:460},wins:{w:760,h:500}},
  mail:{name:'邮件',icon:ICONS.mail,def:{w:860,h:520},wins:{w:920,h:560}},
  photos:{name:'照片',icon:ICONS.photos,def:{w:820,h:520},wins:{w:880,h:560}},
  calendar:{name:'日历',icon:ICONS.calendar,def:{w:680,h:500},wins:{w:740,h:540}},
  music:{name:'音乐',icon:ICONS.music,def:{w:720,h:460},wins:{w:780,h:500}},
  terminal:{name:'终端',icon:ICONS.terminal,def:{w:680,h:400},wins:{w:740,h:440}},
  calculator:{name:'计算器',icon:ICONS.calculator,def:{w:280,h:400},wins:{w:300,h:420}},
  textedit:{name:'文本编辑',icon:ICONS.textedit,def:{w:620,h:440},wins:{w:680,h:480}},
  settings:{name:'系统设置',icon:ICONS.settings,def:{w:760,h:520},wins:{w:820,h:560}},
  launchpad:{name:'启动台',icon:ICONS.launchpad},
  trash:{name:'废纸篓',icon:ICONS.trash,def:{w:520,h:380},wins:{w:560,h:400}},
  about:{name:'关于本机',icon:()=>ICONS.finder(),def:{w:360,h:480},wins:{w:380,h:500}}
};
const WINDOWS={}, CASCADE=[];
let WIN_TOP=600, activeApp='访客';
let winSeq=0;

function win(id,opts={}){
  const def=APPS[id]?APPS[id].wins||APPS[id].def:{w:560,h:400};
  const W=Math.min(opts.w||def.w,innerWidth-24), H=Math.min(opts.h||def.h,innerHeight-90);
  const el=document.createElement('div');
  el.className='window'; el.dataset.id=id;
  el.style.width=W+'px'; el.style.height=H+'px';
  const cx=(innerWidth-W)/2 + (CASCADE.length*26)%80, cy=(innerHeight-H)/2-20 + (CASCADE.length*22)%60;
  el.style.left=Math.max(6,Math.min(cx,innerWidth-W-6))+'px';
  el.style.top=Math.max(30,Math.min(cy,innerHeight-H-6))+'px';
  const icn=APPS[id]&&APPS[id].icon?APPS[id].icon():'';
  el.innerHTML=`<div class="titlebar">
    <div class="traffic">
      <span class="tlight close" data-a="close"></span>
      <span class="tlight min" data-a="min"></span>
      <span class="tlight max" data-a="max"></span>
    </div>
    <div class="win-title">${icn?`<span class="app-ic" style="background:url('data:image/svg+xml;utf8,${encodeURIComponent(icn)}') center/cover"></span>`:''}<span class="tt">${esc(opts.title||(APPS[id]?APPS[id].name:'窗口'))}</span></div>
    <span class="r-handle r-e"></span><span class="r-handle r-w"></span><span class="r-handle r-n"></span><span class="r-handle r-s"></span>
    <span class="r-handle r-ne"></span><span class="r-handle r-nw"></span><span class="r-handle r-se"></span><span class="r-handle r-sw"></span>
  </div><div class="win-body"></div>`;
  el._body=el.querySelector('.win-body'); el._title=el.querySelector('.win-title .tt');
  $('#windows').appendChild(el);
  el._id=++winSeq;
  WINDOWS[id]=el; CASCADE.push(id);
  el.addEventListener('mousedown',()=>focusWin(id));
  el.querySelector('.traffic').addEventListener('mousedown',e=>e.stopPropagation());
  el.querySelector('[data-a=close]').addEventListener('click',()=>closeWin(id));
  el.querySelector('[data-a=min]').addEventListener('click',()=>minWin(id));
  el.querySelector('[data-a=max]').addEventListener('click',()=>toggleMax(id));
  makeDrag(el,id); makeResize(el);
  focusWin(id);
  if(APPS[id]&&APPS[id].build)APPS[id].build(el,opts);
  return el;
}
function closeWin(id){
  const el=WINDOWS[id]; if(!el)return;
  el.classList.add('closing');
  setTimeout(()=>{el.remove(); delete WINDOWS[id]; const i=CASCADE.indexOf(id); if(i>-1)CASCADE.splice(i,1);
    updateDock(); if(id==='music')stopMusic(); },160);
  const z=$$('#windows .window').length; if(z<=1){setMenuApp('访客');}
}
function minWin(id){
  const el=WINDOWS[id]; if(!el)return; el.classList.add('minimizing');
  setTimeout(()=>{el.style.display='none'; el.classList.remove('minimizing'); updateDock();},360);
}
function restoreWin(id){
  const el=WINDOWS[id]; if(!el)return; el.style.display=''; focusWin(id); updateDock();
}
function toggleMax(id){
  const el=WINDOWS[id]; if(!el)return;
  if(el.classList.contains('maxed')){
    el.classList.remove('maxed');
    el.style.left=el._prev.left+'px'; el.style.top=el._prev.top+'px'; el.style.width=el._prev.w+'px'; el.style.height=el._prev.h+'px';
  }else{
    el._prev={left:parseFloat(el.style.left)||0,top:parseFloat(el.style.top)||0,w:parseFloat(el.style.width)||400,h:parseFloat(el.style.height)||300};
    el.classList.add('maxed');
    el.style.left='0px'; el.style.top='0px'; el.style.width='100vw'; el.style.height='100vh';
  }
}
function focusWin(id){
  const el=WINDOWS[id]; if(!el)return;
  const zMax=Math.max(100,...$$('#windows .window').map(w=>+w.style.zIndex||100));
  el.style.zIndex=zMax+1;
  $$('#windows .window').forEach(w=>w.classList.remove('focused'));
  el.classList.add('focused');
  const app=APPS[id]; setMenuApp(app?app.name:'窗口');
  updateDock();
}
function setMenuApp(name){activeApp=name;$('#menu-appname').textContent=name;}
function dragFix(v){return Math.max(0,v);}
function makeDrag(el,id){
  const bar=el.querySelector('.titlebar');
  bar.addEventListener('mousedown',e=>{
    if(e.target.closest('.traffic'))return; if(el.classList.contains('maxed'))return;
    const sx=e.clientX, sy=e.clientY, l=el.offsetLeft, t=el.offsetTop;
    const mv=ev=>{
      el.style.left=dragFix(l+ev.clientX-sx)+'px';
      el.style.top=dragFix(Math.max(0,t+ev.clientY-sy))+'px';
    };
    const up=()=>{removeEventListener('mousemove',mv);removeEventListener('mouseup',up);};
    addEventListener('mousemove',mv);addEventListener('mouseup',up);
  });
}
function makeResize(el){
  const r=el.getBoundingClientRect(); el._rs={w:r.width,h:r.height,l:r.left,t:r.top};
  $$('.r-handle',el).forEach(h=>{
    h.addEventListener('mousedown',e=>{
      e.stopPropagation(); const s=e.clientX, t=e.clientY;
      const R=el.getBoundingClientRect(); const st={w:R.width,h:R.height,l:R.left,t:R.top};
      const dir=h.className.match(/r-(\w+)/)[1];
      const mv=ev=>{
        let w=st.w,h=st.h,l=st.l,tp=st.t;
        if(dir.includes('e'))w=st.w+(ev.clientX-s);
        if(dir.includes('s'))h=st.h+(ev.clientY-t);
        if(dir.includes('w')){w=st.w-(ev.clientX-s);l=st.l+(ev.clientX-s);}
        if(dir.includes('n')){h=st.h-(ev.clientY-t);tp=st.t+(ev.clientY-t);}
        w=Math.max(260,w); h=Math.max(160,h);
        el.style.width=w+'px'; el.style.height=h+'px';
        el.style.left=dragFix(l)+'px'; el.style.top=Math.max(0,tp)+'px';
      };
      const up=()=>{removeEventListener('mousemove',mv);removeEventListener('mouseup',up);};
      addEventListener('mousemove',mv);addEventListener('mouseup',up);
    });
  });
}

/* ===================== Dock ===================== */
const DOCK_ORDER=['finder','launchpad','safari','messages','mail','photos','calendar','notes','music','terminal','calculator','textedit','settings'];
const DOCK_RUN_ONLY={};
function dockIcons(){
  const out=[];
  for(const id of DOCK_ORDER){
    out.push({id,icon:APPS[id].icon(),name:APPS[id].name});
  }
  out.push({id:'sep',sep:true});
  out.push({id:'trash',icon:ICONS.trash(),name:'废纸篓'});
  return out;
}
function buildDock(){
  const d=$('#dock'); d.innerHTML='';
  for(const it of dockIcons()){
    if(it.sep){const s=document.createElement('div');s.className='dock-sep';d.appendChild(s);continue;}
    const el=document.createElement('div');
    el.className='dock-icon'; el.dataset.app=it.id;
    el.innerHTML=`${it.icon}<span class="tip">${it.name}</span><span class="run-dot"></span><span class="open-dot"></span>`;
    el.addEventListener('click',()=>dockClick(it.id));
    el.addEventListener('mouseenter',()=>dockMagnify(it.id));
    d.appendChild(el);
  }
  updateDock();
}
function dockClick(id){
  if(id==='trash'){openApp('trash');return;}
  if(id==='launchpad'){toggleLaunchpad(true);return;}
  const el=WINDOWS[id];
  if(el&&el.style.display==='none'){restoreWin(id);}
  else if(el){focusWin(id);}
  else openApp(id);
}
function dockMagnify(over){
  const icons=[...$$('#dock .dock-icon')];
  const idx=icons.findIndex(i=>i.dataset.app===over);
  if(idx<0)return;
  const gap=6;
  icons.forEach((ic,i)=>{
    let dist=Math.abs(i-idx);
    if(ic===icons[idx])dist=0;
    const scale=dist===0?1.42:dist===1?1.18:dist===2?1.06:1;
    ic.style.transform=`scale(${scale})`;
    ic.style.margin=scale>1?`0 ${gap*(scale-1)}px`:'0';
  });
}
function updateDock(){
  $$('#dock .dock-icon').forEach(el=>{
    const id=el.dataset.app;
    const open=!!WINDOWS[id]||id==='launchpad';
    el.classList.toggle('open',open);
    el.classList.toggle('running',open);
    if(id==='trash')el.classList.toggle('open',!!WINDOWS.trash);
  });
}
function dockReset(){
  $$('#dock .dock-icon').forEach(ic=>{ic.style.transform='';ic.style.margin='';});
}

/* ===================== 打开应用 ===================== */
function openApp(id,opts={}){
  if(id==='launchpad'){toggleLaunchpad(true);return;}
  if(id==='trash'){if(!WINDOWS.trash){const el=win('trash',{title:'废纸篓'});buildTrash(el);}else focusWin('trash');return;}
  if(id==='about'){if(!WINDOWS.about){const el=win('about',{title:'关于本机'});buildAbout(el);}else focusWin('about');return;}
  if(WINDOWS[id]){focusWin(id);return;}
  const el=win(id,opts);
  if(APPS[id].build)APPS[id].build(el,opts);
}
