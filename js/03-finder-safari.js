"use strict";
/* ===================== 访达 ===================== */
const FINDER_NAV=[
  {sec:'个人收藏',rows:[{icon:'finderSm',name:'访达',path:'/'},{icon:'folder',name:'应用程序',path:'/Applications'},{icon:'downloads',name:'下载',path:'/Users/访客/Downloads'}]},
  {sec:'位置',rows:[{icon:'hd',name:'Macintosh HD',path:'/'}]},
  {sec:'标签',rows:[]}
];
function buildFinder(el){
  const body=el._body;
  body.innerHTML=`<div class="sidebar">
    <div class="sec">个人收藏</div>
    <div class="row on" data-p="/"><span class="f-ic">${ICONS.finderSm()}</span>访达</div>
    <div class="row" data-p="/Applications"><span class="f-ic">${icon('folder')}</span>应用程序</div>
    <div class="row" data-p="/Users/访客/Downloads"><span class="f-ic">${icon('downloads')}</span>下载</div>
    <div class="sec">位置</div>
    <div class="row" data-p="/"><span class="f-ic">${icon('hd')}</span>Macintosh HD</div>
  </div>
  <div class="finder-main">
    <div class="finder-path" id="fp-${el._id}"></div>
    <div class="file-list" id="fl-${el._id}"></div>
  </div>`;
  el._fp=body.querySelector(`#fp-${el._id}`); el._fl=body.querySelector(`#fl-${el._id}`);
  el._path='/'; el._view='list';
  body.querySelectorAll('.sidebar .row').forEach(r=>r.addEventListener('click',()=>{
    body.querySelectorAll('.sidebar .row').forEach(x=>x.classList.remove('on'));
    r.classList.add('on'); openFinderPath(el,r.dataset.p);
  }));
  openFinderPath(el,'/');
}
function openFinderPath(el,p){
  el._path=p;
  const items=ls(p); if(!items){toast('无法打开该位置');return;}
  el._fp.innerHTML=p.split('/').filter(Boolean).map(s=>`<span>/</span><b>${esc(s)}</b>`).join('')||'<b>Macintosh HD</b>';
  const keys=Object.keys(items);
  el._fl.innerHTML=keys.length?keys.map(k=>{
    const n=items[k];
    const icn=n.type==='dir'?icon('folder'):n.type==='app'?APPS[n.id]?APPS[n.id].icon()||'':icon('folder'):n.type==='file'?fileIc(k):'';
    return `<div class="file-row" data-k="${esc(k)}" data-t="${n.type}" data-app="${n.id||''}">
      <span class="f-ic">${icn}</span><span>${esc(k)}</span>
      <span class="f-sub">${n.type==='dir'?fmtSize(fileSize(n)):fmtSize(fileSize(n))}</span></div>`;
  }).join(''):`<div class="empty-state"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h7l2 2h9v12H3z"/></svg>此文件夹为空</div>`;
  el._fl.querySelectorAll('.file-row').forEach(r=>r.addEventListener('click',()=>{
    el._fl.querySelectorAll('.file-row').forEach(x=>x.classList.remove('on'));
    r.classList.add('on');
    const k=r.dataset.k,t=r.dataset.t,app=r.dataset.app;
    if(t==='dir')openFinderPath(el,el._path+'/'+k);
    else if(t==='app'&&app)openApp(app);
    else if(t==='file')openFileFrom(el._path+'/'+k);
  }));
  el._fl.querySelectorAll('.file-row').forEach(r=>r.addEventListener('dblclick',()=>{
    const k=r.dataset.k,t=r.dataset.t,app=r.dataset.app;
    if(t==='dir')openFinderPath(el,el._path+'/'+k);
    else if(t==='app'&&app)openApp(app);
    else if(t==='file')openFileFrom(el._path+'/'+k);
  }));
}
function fileIc(name){
  const ext=(name.match(/\.(\w+)$/)||[])[1]||'';
  const map={'txt':'textedit','md':'textedit','xlsx':'numbers','png':'photos','jpg':'photos','jpeg':'photos','gif':'photos','zip':'downloads','mov':'photos'};
  const icn=map[ext.toLowerCase()]||'textedit';
  if(icn==='numbers')return `<svg viewBox="0 0 100 100"><defs><linearGradient id="n${uid()}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ee7a0"/><stop offset="1" stop-color="#15a24e"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#n${uid()})"/><g fill="#fff"><rect x="24" y="26" width="52" height="8" rx="4"/><rect x="24" y="42" width="36" height="8" rx="4"/><rect x="24" y="58" width="46" height="8" rx="4"/><rect x="24" y="74" width="26" height="8" rx="4"/></g></svg>`;
  return ICONS[icn]?ICONS[icn]():ICONS.textedit();
}
function openFileFrom(path){
  const n=node(path); if(!n)return;
  const ext=(path.match(/\.(\w+)$/)||[])[1]||'';
  if(n.type==='file'&&(ext==='txt'||ext==='md'))openTextEdit(path);
  else if(n.type==='file')toast('演示：已打开 '+path.split('/').pop());
}

/* ===================== Safari ===================== */
const SF_FAVS=[
  {name:'维基百科',url:'https://www.wikipedia.org/',bg:'#1d1d1f',ic:'<path d="M12 2A10 10 0 100 12 10 10 0 0012 2z"/>'},
  {name:'必应',url:'https://www.bing.com/',bg:'#008373',ic:'<path d="M5 4l9 9-9 9V4zM14 4l5 5-5 5V4z"/>'},
  {name:'OpenStreetMap',url:'https://www.openstreetmap.org/',bg:'#7ebc6f',ic:'<path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/>'},
  {name:'百度',url:'https://www.baidu.com/',bg:'#2932e1',ic:'<path d="M8 3h8l1 8-5 10-5-10z"/>'}
];
const EMBED_OK=/\.(wikipedia\.org|openstreetmap\.org|baidu\.com|example\.com)$|^https?:\/\/([a-z0-9-]+\.)?(wikipedia\.org|openstreetmap\.org|baidu\.com|example\.com)(\/|$)/i;
function buildSafari(el){
  const body=el._body;
  body.innerHTML=`<div class="safari-toolbar">
      <span class="tb-btn dis" id="sf-bk-${el._id}"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7-2 2-9-9 9-9z"/></svg></span>
      <span class="tb-btn dis" id="sf-fw-${el._id}"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7 2 2 9-9-9-9z"/></svg></span>
      <span class="safari-url"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm-5 5h10v2H7v-2z"/></svg>
        <input id="sf-url-${el._id}" placeholder="搜索或输入网址" autocomplete="off"></span>
      <span class="tb-btn" id="sf-go-${el._id}"><svg viewBox="0 0 24 24"><path d="M12 4l2 2-6 6 6 6-2 2-8-8z"/><path d="M20 4l2 2-6 6 6 6-2 2-8-8z"/></svg></span>
    </div>
    <div class="safari-body" id="sf-body-${el._id}">
      <div class="sf-start"><div class="sf-favs" id="sf-favs-${el._id}"></div></div>
    </div>`;
  el._sf={};
  el._sf.body=body.querySelector(`#sf-body-${el._id}`);
  el._sf.favs=body.querySelector(`#sf-favs-${el._id}`);
  el._sf.url=body.querySelector(`#sf-url-${el._id}`);
  el._sf.go=body.querySelector(`#sf-go-${el._id}`);
  el._sf.favs.innerHTML=SF_FAVS.map(f=>`<div class="sf-fav" data-url="${f.url}"><div class="fl" style="background:${f.bg}"><svg viewBox="0 0 24 24" fill="#fff">${f.ic}</svg></div><div class="nm">${f.name}</div></div>`).join('');
  el._sf.favs.querySelectorAll('.sf-fav').forEach(x=>x.addEventListener('click',()=>safariGo(el,x.dataset.url)));
  el._sf.go.addEventListener('click',()=>{
    let v=el._sf.url.value.trim(); if(!v)return;
    if(!/^https?:\/\//i.test(v))v='https://'+v;
    safariGo(el,v);
  });
  el._sf.url.addEventListener('keydown',e=>{if(e.key==='Enter')el._sf.go.click();});
}
function safariGo(el,url){
  el._sf.url.value=url;
  const ok=EMBED_OK.test(url);
  if(!ok){
    el._sf.body.innerHTML=`<div class="sf-offline">
      <div class="wifi"><svg viewBox="0 0 24 24"><path d="M12 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0-5.5c1.9 0 3.6.7 5 1.9l1.7-1.7a8.5 8.5 0 00-13.4 0l1.7 1.7a7 7 0 015-1.9zm0-4.5c3 0 5.8 1.2 7.8 3.1l1.7-1.7A11.7 11.7 0 0012 7.5c-3.2 0-6.1 1.3-8.2 3.4l1.7 1.7A9.7 9.7 0 0112 10zm0-4.5c4.3 0 8.2 1.7 11 4.6l1.7-1.7A14.9 14.9 0 0012 4C6.8 4 2.2 6.3-.5 9.9l1.7 1.7A12.9 12.9 0 0112 5.5z"/></svg></div>
      <h2>无法内嵌此网页</h2>
      <p>${esc(url)} 的服务器不允许被嵌入到其他网站中（X-Frame-Options 限制）。<br>你可以在新窗口打开它，或返回起始页。</p>
      <div style="display:flex;gap:10px"><button class="btn" id="sf-new-${el._id}">在新窗口打开</button><button class="btn ghost" id="sf-home-${el._id}">返回起始页</button></div>
    </div>`;
    body_on(el,'sf-new',()=>window.open(url,'_blank'));
    body_on(el,'sf-home',()=>safariHome(el));
    return;
  }
  el._sf.body.innerHTML=`<iframe class="safari-iframe" src="${esc(url)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="eager"></iframe>
    <div style="position:absolute;right:8px;bottom:8px;font-size:11px;background:rgba(0,0,0,.55);color:#fff;padding:3px 8px;border-radius:6px;pointer-events:none">内嵌浏览</div>`;
}
function safariHome(el){
  el._sf.body.innerHTML=`<div class="sf-start"><div class="sf-favs" id="sf-favs-${el._id}"></div></div>`;
  el._sf.favs=el._sf.body.querySelector(`#sf-favs-${el._id}`);
  el._sf.favs.innerHTML=SF_FAVS.map(f=>`<div class="sf-fav" data-url="${f.url}"><div class="fl" style="background:${f.bg}"><svg viewBox="0 0 24 24" fill="#fff">${f.ic}</svg></div><div class="nm">${f.name}</div></div>`).join('');
  el._sf.favs.querySelectorAll('.sf-fav').forEach(x=>x.addEventListener('click',()=>safariGo(el,x.dataset.url)));
}
function body_on(el,id,fn){const x=el._sf.body.querySelector(`#${id}-${el._id}`);if(x)x.addEventListener('click',fn);}
APPS.safari.build=buildSafari;
APPS.finder.build=buildFinder;
