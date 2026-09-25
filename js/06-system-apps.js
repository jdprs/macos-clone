"use strict";
/* ===================== 照片 ===================== */
const PHOTOS=[
  {c:'linear-gradient(135deg,#5b8af9,#9b59f6)',t:'2026 · 壁纸'},
  {c:'linear-gradient(135deg,#ff9a9e,#fad0c4)',t:'2026 · 日出'},
  {c:'linear-gradient(135deg,#a1c4fd,#c2e9fb)',t:'2026 · 海边'},
  {c:'linear-gradient(135deg,#f093fb,#f5576c)',t:'2026 · 城市'},
  {c:'linear-gradient(135deg,#43e97b,#38f9d7)',t:'2026 · 森林'},
  {c:'linear-gradient(135deg,#fa709a,#fee140)',t:'2026 · 黄昏'},
  {c:'linear-gradient(135deg,#30cfd0,#330867)',t:'2026 · 星空'},
  {c:'linear-gradient(135deg,#a8edea,#fed6e3)',t:'2026 · 旅行'},
  {c:'linear-gradient(135deg,#ffecd2,#fcb69f)',t:'2026 · 午后'},
  {c:'linear-gradient(135deg,#89f7fe,#66a6ff)',t:'2026 · 天空'},
  {c:'linear-gradient(135deg,#f6d365,#fda085)',t:'2026 · 夏'},
  {c:'linear-gradient(135deg,#d299c2,#fef9d7)',t:'2026 · 花'}
];
let lbIdx=0;
function buildPhotos(el){
  const body=el._body;
  body.innerHTML=`<div class="photos-main"><div class="photos-grid" id="pg-${el._id}"></div></div>`;
  const g=body.querySelector(`#pg-${el._id}`);
  g.innerHTML=PHOTOS.map((p,i)=>`<div class="photo" data-i="${i}" style="background:${p.c}"><span class="pt">${p.t}</span></div>`).join('');
  g.querySelectorAll('.photo').forEach(x=>x.addEventListener('click',()=>openLB(+x.dataset.i)));
}
function openLB(i){
  lbIdx=i; const lb=$('#lightbox');
  const p=PHOTOS[i];
  lb.querySelector('.lb-img').style.background=p.c;
  lb.querySelector('.lb-cap').textContent=p.t+'  ·  '+(i+1)+' / '+PHOTOS.length;
  lb.classList.add('show');
}
function closeLB(){$('#lightbox').classList.remove('show');}
function lbNav(d){openLB((lbIdx+d+PHOTOS.length)%PHOTOS.length);}
$('#lightbox .lb-x').addEventListener('click',closeLB);
$('#lightbox .lb-prev').addEventListener('click',()=>lbNav(-1));
$('#lightbox .lb-next').addEventListener('click',()=>lbNav(1));
$('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLB();});
APPS.photos.build=buildPhotos;

/* ===================== 文本编辑 ===================== */
function openTextEdit(path){
  const n=node(path); if(!n||n.type!=='file')return;
  const ext=(path.match(/\.(\w+)$/)||[])[1]||'';
  const el=win('textedit',{title:path.split('/').pop()});
  buildTextEdit(el,{content:n.content||'',name:path.split('/').pop()});
}
function buildTextEdit(el,opts={}){
  const body=el._body;
  body.innerHTML=`<div class="te-body">
    <div class="te-bar"><input id="te-n-${el._id}" value="${esc(opts.name||'无标题')}"><span class="tb-btn" id="te-s-${el._id}"><svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z"/></svg></span></div>
    <textarea class="te-area" id="te-a-${el._id}" placeholder="输入文本…">${esc(opts.content||'')}</textarea>
  </div>`;
  el._name=body.querySelector(`#te-n-${el._id}`); el._ta=body.querySelector(`#te-a-${el._id}`);
  body.querySelector(`#te-s-${el._id}`).addEventListener('click',()=>{
    const name=el._name.value.trim()||'无标题.txt';
    const p='/Users/访客/Documents/'+name;
    writeFile(p,el._ta.value);
    el._title.textContent=name;
    toast('已保存到文稿：'+name);
  });
}
APPS.textedit.build=(el,opts)=>buildTextEdit(el,opts);

/* ===================== 系统设置 ===================== */
const SET_PANES=[['appearance','外观'],['wallpaper','墙纸'],['pw','密码'],['about','关于']];
const SET_SIDE_IC={
  appearance:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 010 18z"/></svg>',
  wallpaper:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>',
  pw:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/><circle cx="12" cy="15.5" r="1.4"/></svg>',
  about:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="8" r="1.2"/><path d="M12 11v6"/></svg>'
};
let setPane='appearance';
function buildSettings(el){
  const body=el._body;
  body.innerHTML=`<div class="set-main">
    <div class="sidebar">${SET_PANES.map(([k,n])=>`<div class="row${k===setPane?' on':''}" data-pane="${k}"><span class="f-ic">${SET_SIDE_IC[k]}</span>${n}</div>`).join('')}</div>
    <div class="set-pane" id="sp-${el._id}"></div>
  </div>`;
  el._pane=body.querySelector(`#sp-${el._id}`);
  body.querySelectorAll('.sidebar .row').forEach(r=>r.addEventListener('click',()=>{
    body.querySelectorAll('.sidebar .row').forEach(x=>x.classList.remove('on'));
    r.classList.add('on'); setPane=r.dataset.pane; renderSetPane(el);
  }));
  renderSetPane(el);
}
function renderSetPane(el){
  const p=setPane;
  if(p==='appearance'){
    const dark=document.body.classList.contains('dark');
    const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#007aff';
    el._pane.innerHTML=`<h2>外观</h2>
      <div class="set-card"><div class="set-row"><div class="ico" style="background:#1d1d1f"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 010 18z"/></svg></div>
        <div><div class="tt">外观</div><div class="sub">选择浅色或深色外观</div></div>
        <div class="val"><div class="set-seg"><span class="opt${dark?'':' on'}" data-dark="0">浅色</span><span class="opt${dark?' on':''}" data-dark="1">深色</span></div></div></div>
        <div class="set-row"><div class="ico" style="background:${accent}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg></div>
        <div><div class="tt">强调色</div><div class="sub">为按钮与选中状态着色</div></div>
        <div class="val">${['#007aff','#ff3b30','#34c759','#ff9f0a','#af52de','#ff2d55'].map(c=>`<span class="c-dot" data-c="${c}" style="width:20px;height:20px;border-radius:50%;background:${c};display:inline-block;border:2px solid ${c===accent?'#fff':'transparent'};box-shadow:0 0 0 2px ${c===accent?c:'transparent'};cursor:pointer"></span>`).join('')}</div></div>
      </div>`;
    el._pane.querySelectorAll('[data-dark]').forEach(o=>o.addEventListener('click',()=>setDark(o.dataset.dark==='1')));
    el._pane.querySelectorAll('.c-dot').forEach(d=>d.addEventListener('click',()=>setAccent(d.dataset.c)));
  }else if(p==='wallpaper'){
    el._pane.innerHTML=`<h2>墙纸</h2><div class="set-card"><div class="set-row"><div class="ico" style="background:linear-gradient(135deg,#5b8af9,#9b59f6)"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/></svg></div>
      <div><div class="tt">桌面墙纸</div><div class="sub">选择一张墙纸</div></div></div>
      <div style="padding:16px"><div class="wp-thumbs">${Object.keys(WP).map(i=>`<div class="wp-thumb${+i===wpIdx?' on':''}" data-i="${i}" style="background:${WP[i].url}"><span class="ck"><svg viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z"/></svg></span></div>`).join('')}</div></div></div>`;
    el._pane.querySelectorAll('.wp-thumb').forEach(t=>t.addEventListener('click',()=>setWallpaper(+t.dataset.i)));
  }else if(p==='pw'){
    el._pane.innerHTML=`<h2>密码</h2>
      <div class="set-card">
        <div class="set-row"><div class="ico" style="background:#ff9f0a"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>
          <div><div class="tt">登录密码</div><div class="sub">修改后下次登录需使用新密码</div></div></div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:10px;font-size:13px">
          <label>当前密码<input type="password" id="pw-old" placeholder="输入当前密码" style="width:100%;padding:7px 10px;border-radius:7px;border:1px solid var(--sep);background:var(--bg-input);color:var(--text);margin-top:4px"></label>
          <label>新密码<input type="password" id="pw-new" placeholder="输入新密码" style="width:100%;padding:7px 10px;border-radius:7px;border:1px solid var(--sep);background:var(--bg-input);color:var(--text);margin-top:4px"></label>
          <label>确认新密码<input type="password" id="pw-new2" placeholder="再次输入新密码" style="width:100%;padding:7px 10px;border-radius:7px;border:1px solid var(--sep);background:var(--bg-input);color:var(--text);margin-top:4px"></label>
          <div style="display:flex;gap:8px;margin-top:4px"><button class="btn" id="pw-save">保存</button><button class="btn ghost" id="pw-reset">恢复默认 (123456)</button></div>
        </div>
      </div>`;
    el._pane.querySelector('#pw-save').addEventListener('click',()=>{
      const o=el._pane.querySelector('#pw-old').value, n=el._pane.querySelector('#pw-new').value, n2=el._pane.querySelector('#pw-new2').value;
      if(o!==PW){toast('当前密码不正确');return;}
      if(n.length<4){toast('新密码至少 4 位');return;}
      if(n!==n2){toast('两次输入的新密码不一致');return;}
      setPW(n); toast('密码已修改');
      el._pane.querySelectorAll('input').forEach(i=>i.value='');
    });
    el._pane.querySelector('#pw-reset').addEventListener('click',()=>{setPW('123456');toast('已恢复默认密码 123456');});
  }else if(p==='about'){
    el._pane.innerHTML=`<h2>关于</h2>
      <div class="set-card"><div style="padding:20px 16px">
        <div class="about-hero">
          <svg class="mac" viewBox="0 0 384 464" fill="#1d1d1f"><path d="M365 304c-9 21-13 30-25 50-16 27-39 60-67 60-26 0-33-17-68-17s-41 17-67 17c-28 0-49-29-66-56-57-93-63-202-28-266 24-45 63-72 99-72 27 0 53 18 72 18 18 0 46-21 79-18 14 1 52 5 77 39-2 1-46 27-45 80 1 62 51 83 52 84-1 1-9 28-23 61zM262 41c19-23 32-55 28-41 0 0-1 1-3 1-22 5-43 20-57 41-14 19-26 52-23 41 0 0 25-2 55-42z"/></svg>
          <h2>macOS 复刻版</h2><div class="sub">版本 1.0 · HTML + CSS + JavaScript</div>
        </div>
        <div class="storage-bar"><i style="width:34%;background:#5b8af9"></i><i style="width:14%;background:#ff9f0a"></i><i style="width:6%;background:#ff3b30"></i><i style="width:46%;background:rgba(128,128,128,.2)"></i></div>
        <div class="storage-legend"><span class="lg"><i style="background:#5b8af9"></i>系统 34%</span><span class="lg"><i style="background:#ff9f0a"></i>文稿 14%</span><span class="lg"><i style="background:#ff3b30"></i>照片 6%</span><span class="lg"><i style="background:rgba(128,128,128,.2)"></i>其他 46%</span></div>
      </div></div>
      <div class="set-card"><div class="set-row"><div class="tt">芯片</div><div class="val">Web M1 (演示)</div></div><div class="set-row"><div class="tt">内存</div><div class="val">16 GB</div></div><div class="set-row"><div class="tt">序列号</div><div class="val">C02WEB001DEMO</div></div></div>`;
  }
}
function setDark(on){document.body.classList.toggle('dark',on);localStorage.setItem('macos_dark',on?'1':'0');const sw=$('#cc-dark-sw');if(sw)sw.classList.toggle('on',on);}
function setAccent(c){document.documentElement.style.setProperty('--accent',c);localStorage.setItem('macos_accent',c);}
function initTheme(){if(localStorage.getItem('macos_dark')==='1')document.body.classList.add('dark');const c=localStorage.getItem('macos_accent');if(c)document.documentElement.style.setProperty('--accent',c);}
APPS.settings.build=buildSettings;

/* ===================== 废纸篓 ===================== */
function buildTrash(el){
  const body=el._body;
  const trash=FS['/'].children.Users.children['访客'].children['.Trash'];
  const keys=Object.keys(trash.children);
  body.innerHTML=`<div class="trash-body">
    <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2)"><svg viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M6 7h12l-1 14H7z"/></svg>${keys.length} 个项目</div>
    <div class="trash-list">${keys.length?keys.map(k=>`<div class="trash-row">${ICONS.trash()}<span>${esc(k)}</span><span style="margin-left:auto;color:var(--text-3);font-size:12px">${fmtSize(fileSize(trash.children[k]))}</span></div>`).join(''):'<div class="empty-state"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 7h12l-1 14H7z"/></svg>废纸篓为空</div>'}</div>
  </div>`;
  if(keys.length)body.querySelectorAll('.trash-row').forEach((r,i)=>r.addEventListener('click',()=>{
    toast('已清空：'+Object.keys(trash.children)[i]);
  }));
}

/* ===================== 关于本机 ===================== */
function buildAbout(el){
  const body=el._body;
  body.innerHTML=`<div class="abt-inner">
    <div class="abt-tabs"><span class="tab on">概览</span><span class="tab">显示器</span><span class="tab">储存空间</span><span class="tab">支持</span></div>
    <div class="abt-tab">
      <div class="about-hero">
        <svg class="mac" viewBox="0 0 384 464" fill="#1d1d1f"><path d="M365 304c-9 21-13 30-25 50-16 27-39 60-67 60-26 0-33-17-68-17s-41 17-67 17c-28 0-49-29-66-56-57-93-63-202-28-266 24-45 63-72 99-72 27 0 53 18 72 18 18 0 46-21 79-18 14 1 52 5 77 39-2 1-46 27-45 80 1 62 51 83 52 84-1 1-9 28-23 61zM262 41c19-23 32-55 28-41 0 0-1 1-3 1-22 5-43 20-57 41-14 19-26 52-23 41 0 0 25-2 55-42z"/></svg>
        <h2 style="font-size:22px">macOS 复刻版</h2><div class="sub">版本 1.0 · HTML + CSS + JavaScript</div>
      </div>
      <div class="storage-bar"><i style="width:34%;background:#5b8af9"></i><i style="width:14%;background:#ff9f0a"></i><i style="width:6%;background:#ff3b30"></i><i style="width:46%;background:rgba(128,128,128,.2)"></i></div>
      <div class="storage-legend"><span class="lg"><i style="background:#5b8af9"></i>系统</span><span class="lg"><i style="background:#ff9f0a"></i>文稿</span><span class="lg"><i style="background:#ff3b30"></i>照片</span><span class="lg"><i style="background:rgba(128,128,128,.2)"></i>其他</span></div>
      <div style="margin-top:18px;display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text-2)">
        <span>芯片：Web M1（演示）</span><span>内存：16 GB</span><span>启动磁盘：Macintosh HD</span>
        <span style="color:var(--text-3);font-size:12px;margin-top:6px">界面参考 macOS 公开交互规范独立实现，未抄袭任何开源项目代码。</span>
      </div>
    </div>
  </div>`;
}
