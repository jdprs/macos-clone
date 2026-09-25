"use strict";
/* ===================== 启动台 ===================== */
function buildLaunchpad(){
  const g=$('#lp-grid');
  const apps=DOCK_ORDER.filter(id=>id!=='finder'&&id!=='launchpad').map(id=>({id,name:APPS[id].name,icon:APPS[id].icon()}));
  apps.unshift({id:'launchpad',name:'启动台',icon:ICONS.launchpad()});
  g.innerHTML=apps.map(a=>`<div class="lp-app" data-app="${a.id}"><span class="lp-ic">${a.icon}</span><span class="nm">${a.name}</span></div>`).join('');
  g.querySelectorAll('.lp-app').forEach(x=>x.addEventListener('click',()=>{
    toggleLaunchpad(false);
    openApp(x.dataset.app);
  }));
  $('#lp-search').addEventListener('input',e=>{
    const q=e.target.value.trim().toLowerCase();
    g.querySelectorAll('.lp-app').forEach(x=>x.style.display=x.dataset.app.includes(q)||x.querySelector('.nm').textContent.toLowerCase().includes(q)?'':'none');
    $('#lp-empty').style.display=[...g.querySelectorAll('.lp-app')].every(x=>x.style.display==='none')?'block':'none';
  });
}
function toggleLaunchpad(on){
  const lp=$('#launchpad');
  const show=on===undefined?!lp.classList.contains('on'):on;
  lp.classList.toggle('on',show);
  if(show)$('#lp-search').value='';
  if(show)$('#lp-search').focus();
}

/* ===================== 控制中心 ===================== */
let ccOpen=false;
function toggleCC(show){
  ccOpen=show===undefined?!ccOpen:show;
  $('#control-center').classList.toggle('show',ccOpen);
  $('#m-cc').classList.toggle('open',ccOpen);
}
function bindCC(){
  $('#m-cc').addEventListener('click',e=>{e.stopPropagation();toggleCC();});
  $('#cc-wifi').addEventListener('click',()=>{$('#cc-wifi-sw').classList.toggle('on');});
  $('#cc-bt').addEventListener('click',()=>{$('#cc-bt-sw').classList.toggle('on');});
  $('#cc-ad').addEventListener('click',()=>{$('#cc-ad-sw').classList.toggle('on');});
  $('#cc-dark').addEventListener('click',()=>{setDark(!document.body.classList.contains('dark'));$('#cc-dark-sw').classList.toggle('on');});
  $('#cc-bright').addEventListener('input',e=>{$('#cc-bright-v').textContent=e.target.value+'%';$('#wallpaper').style.filter=`brightness(${e.target.value/100})`;});
  $('#cc-vol').addEventListener('input',e=>{$('#cc-vol-v').textContent=e.target.value+'%';});
  $('#cc-now-prev').addEventListener('click',()=>{if(WINDOWS.music){trk=(trk-1+TRACKS.length)%TRACKS.length;renderMusic(WINDOWS.music);renderTrackList(WINDOWS.music);}});
  $('#cc-now-next').addEventListener('click',()=>{if(WINDOWS.music){trk=(trk+1)%TRACKS.length;renderMusic(WINDOWS.music);renderTrackList(WINDOWS.music);}});
  $('#cc-now-play').addEventListener('click',()=>{if(WINDOWS.music){togglePlay(WINDOWS.music);}else if(TRACKS){openApp('music');}});
}

/* ===================== 菜单栏下拉 ===================== */
const MENUS={
  apple:[{t:'关于本机',fn:()=>openApp('about')},{sep:1},{t:'系统设置…',fn:()=>openApp('settings')},{t:'App Store…',fn:()=>toast('演示：App Store 未包含')},{sep:1},{t:'最近使用的项目',dim:1},{sep:1},{t:'强制退出…',short:'⌥⌘⎋',fn:()=>{const z=$$('#windows .window').length;if(z>0){const top=[...$$('#windows .window')].sort((a,b)=>(b.style.zIndex||0)-(a.style.zIndex||0))[0];closeWin(top.dataset.id);}}},{sep:1},{t:'睡眠',fn:()=>powerAction('sleep')},{t:'重新启动…',fn:()=>powerAction('restart')},{t:'关机…',fn:()=>powerAction('shutdown')},{sep:1},{t:'锁定屏幕',short:'⌃⌘Q',fn:()=>lockScreen()},{t:'退出登录“访客”…',short:'⇧⌘Q',fn:()=>logout()},{sep:1},{t:'关于本机详情',dim:1}],
  file:[{t:'新建访达窗口',short:'⌘N',fn:()=>openApp('finder')},{t:'新建文件夹',short:'⇧⌘N',fn:()=>toast('演示：在当前目录新建文件夹')},{sep:1},{t:'打开…',short:'⌘O',fn:()=>toast('演示：打开文件面板')},{t:'关闭窗口',short:'⌘W',fn:()=>{const w=getTopWin();if(w)closeWin(w);}},{t:'存储',short:'⌘S',fn:()=>toast('演示：已存储')},{sep:1},{t:'打印…',short:'⌘P',fn:()=>toast('演示：打印面板')}],
  edit:[{t:'撤销',short:'⌘Z',fn:()=>toast('演示：撤销')},{t:'重做',short:'⇧⌘Z',fn:()=>toast('演示：重做')},{sep:1},{t:'剪切',short:'⌘X',fn:()=>toast('演示：剪切')},{t:'拷贝',short:'⌘C',fn:()=>toast('演示：拷贝')},{t:'粘贴',short:'⌘V',fn:()=>toast('演示：粘贴')},{t:'全选',short:'⌘A',fn:()=>toast('演示：全选')}],
  view:[{t:'进入全屏幕',short:'⌃⌘F',fn:()=>{const w=getTopWin();if(w&&WINDOWS[w])toggleMax(w);}},{sep:1},{t:'显示/隐藏 Dock',short:'⌥⌘D',fn:()=>{$('#dock-zone').style.display=$('#dock-zone').style.display==='none'?'':'none';}},{t:'显示/隐藏菜单栏',short:'⌥⌘M',fn:()=>{$('#menu-bar').style.display=$('#menu-bar').style.display==='none'?'':'none';}}],
  win:[{t:'最小化',short:'⌘M',fn:()=>{const w=getTopWin();if(w)minWin(w);}},{t:'缩放',fn:()=>{const w=getTopWin();if(w)toggleMax(w);}},{sep:1},{t:'将窗口移到屏幕中央',fn:()=>{const w=getTopWin();if(w&&WINDOWS[w]){const el=WINDOWS[w];el.style.left=(innerWidth-el.offsetWidth)/2+'px';el.style.top=Math.max(30,(innerHeight-el.offsetHeight)/2-20)+'px';}}},{t:'将窗口移到下一空间',dim:1}],
  help:[{t:'macOS 复刻版帮助',fn:()=>toast('提示：点击 Dock 图标打开应用，支持拖拽/缩放窗口')},{t:'键盘快捷键',fn:()=>toast('⌘空格 聚焦 · ⌘W 关窗 · ⌘M 最小化 · ⌘Q 退出')},{sep:1},{t:'关于本机',fn:()=>openApp('about')}]
};
function getTopWin(){const ws=[...$$('#windows .window')].filter(w=>w.style.display!=='none');if(!ws.length)return null;return ws.sort((a,b)=>(b.style.zIndex||0)-(a.style.zIndex||0))[0].dataset.id;}
function showDropdown(anchor,items){
  const dd=$('#sys-dropdown');
  dd.innerHTML=items.map(it=>it.sep?'<div class="dd-sep"></div>':`<div class="dd-item${it.dim?' dim':''}" data-i="${it.t}">${esc(it.t)}${it.short?`<span class="short">${it.short}</span>`:''}</div>`).join('');
  dd.classList.add('show');
  const r=anchor.getBoundingClientRect();
  const w=dd.offsetWidth,h=dd.offsetHeight;
  let x=r.left, y=r.bottom+4;
  if(x+w>innerWidth-8)x=innerWidth-w-8;
  if(y+h>innerHeight-8)y=r.top-h-4;
  dd.style.left=x+'px'; dd.style.top=y+'px';
  dd.querySelectorAll('.dd-item:not(.dim)').forEach(it=>it.addEventListener('click',()=>{
    hideDropdown();
    const m=items.find(x=>x.t===it.dataset.i);
    if(m&&m.fn)m.fn();
  }));
}
function hideDropdown(){const dd=$('#sys-dropdown');dd.classList.remove('show');dd.innerHTML='';$$('.menu-item.open').forEach(x=>x.classList.remove('open'));}
function bindMenus(){
  $$('#menu-bar .menu-item[data-menu]').forEach(it=>{
    it.addEventListener('click',e=>{
      e.stopPropagation();
      const open=it.classList.contains('open');
      hideDropdown();
      if(!open)showDropdown(it,MENUS[it.dataset.menu]);
    });
  });
  $('#m-apple').addEventListener('click',e=>{
    e.stopPropagation();
    const open=$('#m-apple').classList.contains('open');
    hideDropdown();
    if(!open)showDropdown($('#m-apple'),MENUS.apple);
  });
  $('#m-spot').addEventListener('click',()=>toggleSpot(true));
  document.addEventListener('click',e=>{
    if(!e.target.closest('#sys-dropdown')&&!e.target.closest('.menu-item'))hideDropdown();
    if(!e.target.closest('#control-center')&&!e.target.closest('#m-cc'))toggleCC(false);
  });
}

/* ===================== 聚焦搜索 ===================== */
const SP_ITEMS=[
  ...DOCK_ORDER.map(id=>({name:APPS[id].name,sub:'应用程序',icon:APPS[id].icon(),fn:()=>openApp(id)})),
  {name:'关于本机',sub:'应用程序',icon:ICONS.finder(),fn:()=>openApp('about')},
  {name:'废纸篓',sub:'应用程序',icon:ICONS.trash(),fn:()=>openApp('trash')},
  {name:'设置 → 修改密码',sub:'系统设置',icon:ICONS.settings(),fn:()=>{openApp('settings');setTimeout(()=>{setPane='pw';const s=WINDOWS.settings;if(s)renderSetPane(s);},60);}},
  {name:'切换深色模式',sub:'操作',icon:ICONS.settings(),fn:()=>setDark(!document.body.classList.contains('dark'))},
  {name:'锁定屏幕',sub:'操作',icon:ICONS.settings(),fn:()=>lockScreen()},
  {name:'重新启动',sub:'操作',icon:ICONS.settings(),fn:()=>powerAction('restart')},
  {name:'关机',sub:'操作',icon:ICONS.settings(),fn:()=>powerAction('shutdown')}
];
let spHl=0;
function toggleSpot(on){
  const sp=$('#spotlight');
  const show=on===undefined?!sp.classList.contains('on'):on;
  sp.classList.toggle('on',show);
  if(show){$('#sp-input').value='';spHl=0;spRender('');setTimeout(()=>$('#sp-input').focus(),30);}
}
function spRender(q){
  const list=$('#sp-results');
  const ql=q.trim().toLowerCase();
  const hits=SP_ITEMS.filter(i=>!ql||i.name.toLowerCase().includes(ql)||i.sub.includes(ql));
  $('#sp-empty').style.display=hits.length?'none':'block';
  list.innerHTML=hits.map((i,k)=>`<div class="sp-item${k===spHl?' hl':''}" data-k="${k}"><span class="sp-ic">${i.icon}</span><span>${esc(i.name)}</span><span class="sp-sub">${i.sub}</span></div>`).join('');
  list.querySelectorAll('.sp-item').forEach(x=>x.addEventListener('click',()=>{
    toggleSpot(false); const h=hits[+x.dataset.k]; if(h&&h.fn)h.fn();
  }));
}
function bindSpot(){
  $('#sp-veil').addEventListener('click',()=>toggleSpot(false));
  $('#sp-input').addEventListener('input',e=>{spHl=0;spRender(e.target.value);});
  $('#sp-input').addEventListener('keydown',e=>{
    const list=$('#sp-results'); const n=list.querySelectorAll('.sp-item').length;
    if(e.key==='ArrowDown'){e.preventDefault();spHl=Math.min(spHl+1,n-1);spRender($('#sp-input').value);}
    else if(e.key==='ArrowUp'){e.preventDefault();spHl=Math.max(spHl-1,0);spRender($('#sp-input').value);}
    else if(e.key==='Enter'){const hit=list.querySelector(`[data-k="${spHl}"]`);if(hit)hit.click();}
    else if(e.key==='Escape')toggleSpot(false);
  });
}

/* ===================== 右键菜单 ===================== */
function ctxMenu(x,y,items){
  const m=$('#ctx-menu');
  m.innerHTML=items.map(it=>it.sep?'<div class="dd-sep"></div>':`<div class="dd-item${it.dim?' dim':''}">${esc(it.t)}</div>`).join('');
  m.classList.add('show');
  const w=m.offsetWidth,h=m.offsetHeight;
  m.style.left=Math.min(x,innerWidth-w-6)+'px';
  m.style.top=Math.min(y,innerHeight-h-6)+'px';
  m.querySelectorAll('.dd-item:not(.dim)').forEach((it,i)=>it.addEventListener('click',()=>{
    m.classList.remove('show');
    const items2=items.filter(x=>!x.sep); const fn=items2[i]&&items2[i].fn;
    if(fn)fn();
  }));
}
function hideCtx(){$('#ctx-menu').classList.remove('show');}

/* ===================== 桌面图标 ===================== */
function buildDeskIcons(){
  const box=$('#desktop-icons');
  const items=[
    {k:'Macintosh HD',ic:ICONS.hd(),open:()=>openApp('finder')},
    {k:'应用程序',ic:ICONS.folder(),open:()=>{const el=win('finder',{title:'应用程序'});buildFinder(el);setTimeout(()=>openFinderPath(el,'/Applications'),30);}},
    {k:'文稿',ic:ICONS.folder(),open:()=>{const el=win('finder',{title:'文稿'});buildFinder(el);setTimeout(()=>openFinderPath(el,'/Users/访客/Documents'),30);}},
    {k:'下载',ic:ICONS.downloads(),open:()=>{const el=win('finder',{title:'下载'});buildFinder(el);setTimeout(()=>openFinderPath(el,'/Users/访客/Downloads'),30);}}
  ];
  box.innerHTML=items.map((it,i)=>`<div class="desk-icon" data-i="${i}"><span class="ic">${it.ic}</span><span class="nm">${it.k}</span></div>`).join('');
  box.querySelectorAll('.desk-icon').forEach(el=>{
    el.addEventListener('click',e=>{
      box.querySelectorAll('.desk-icon').forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      e.stopPropagation();
    });
    el.addEventListener('dblclick',()=>items[+el.dataset.i].open());
    el.addEventListener('contextmenu',e=>{
      e.preventDefault(); e.stopPropagation();
      box.querySelectorAll('.desk-icon').forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      ctxMenu(e.clientX,e.clientY,[{t:'打开',fn:()=>items[+el.dataset.i].open()},{sep:1},{t:'重新命名',fn:()=>toast('演示：重命名')},{t:'查看简介',fn:()=>toast('演示：简介面板')},{sep:1},{t:'废纸篓',fn:()=>toast('桌面图标为快捷入口，不可删除')}]);
    });
  });
  $('#desktop').addEventListener('contextmenu',e=>{
    if(e.target.closest('.desk-icon'))return;
    e.preventDefault();
    ctxMenu(e.clientX,e.clientY,[{t:'新建文件夹',fn:()=>toast('演示：桌面新建文件夹')},{t:'更改桌面背景…',fn:()=>openApp('settings')},{sep:1},{t:'整理方式',dim:1},{t:'显示查看选项',dim:1}]);
  });
  $('#desktop').addEventListener('mousedown',()=>{box.querySelectorAll('.desk-icon').forEach(x=>x.classList.remove('selected'));});
}

/* ===================== 登录 / 电源 ===================== */
function updateLoginHint(){
  const h=$('#login-hint');
  if(!h)return;
  if(PW==='123456')h.textContent='默认密码：123456 · 输入后回车';
  else h.textContent='密码已修改 · 输入密码以继续';
}
function tryLogin(){
  const v=$('#login-pw').value;
  if(v===PW){
    $('#login').classList.add('hide');
    $('#desktop').classList.add('on');
    setTimeout(()=>toast('欢迎回来，访客'),400);
  }else{
    const inp=$('#login-pw');
    inp.value=''; inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
    toast('密码错误，请重试');
  }
}
function lockScreen(){
  $('#desktop').classList.remove('on');
  $('#login').classList.remove('hide');
  $('#login-pw').value='';
  updateLoginHint();
  setTimeout(()=>$('#login-pw').focus(),350);
}
function logout(){
  $$('#windows .window').forEach(w=>w.remove());
  Object.keys(WINDOWS).forEach(k=>delete WINDOWS[k]);
  CASCADE.length=0; updateDock();
  lockScreen();
}
function powerAction(type){
  const p=$('#power');
  p.classList.add('on');
  const btn=$('#pwr-btn'),hint=$('#pwr-hint'),prog=$('#pwr-progress');
  if(type==='sleep'){
    p.classList.remove('on');
    lockScreen();
  }else if(type==='restart'){
    hint.style.display='none'; btn.style.display='none'; prog.style.display='flex';
    prog.querySelector('.bar i').style.width='100%';
    setTimeout(()=>location.reload(),1900);
  }else{
    hint.style.display='none'; btn.style.display='none'; prog.style.display='flex';
    prog.querySelector('.bar i').style.width='100%';
    setTimeout(()=>{p.classList.remove('on'); $('#power .pwr-btn').style.display=''; $('#power .pwr-hint').style.display=''; $('#power .pwr-progress').style.display='none'; prog.querySelector('.bar i').style.width='0';
      $('#desktop').classList.remove('on'); $('#boot').classList.remove('hide');
      setTimeout(()=>{bootBoot();},900);
    },1900);
  }
}
function bindPower(){
  $('#login-pw').addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin();});
  $('#login-hint').addEventListener('click',()=>{$('#login-pw').focus();});
  $('#pwr-btn').addEventListener('click',()=>powerAction('shutdown'));
  $('#boot').addEventListener('click',()=>{if($('#boot').classList.contains('hide'))return;bootBoot();});
}
function bootBoot(){
  const b=$('#boot'); if(!b)return;
  b.classList.add('hide');
  setTimeout(()=>{
    $('#login').classList.remove('hide');
    updateLoginHint();
    $('#login-pw').focus();
  },620);
}

/* ===================== 快捷键 & 初始化 ===================== */
function bindKeys(){
  addEventListener('keydown',e=>{
    const mod=e.metaKey||e.ctrlKey;
    if(mod&&e.code==='Space'){e.preventDefault();toggleSpot();}
    else if(mod&&e.key.toLowerCase()==='w'){const w=getTopWin();if(w)closeWin(w);}
    else if(mod&&e.key.toLowerCase()==='m'){const w=getTopWin();if(w)minWin(w);}
    else if(mod&&e.key.toLowerCase()==='q'){const w=getTopWin();if(w)closeWin(w);}
  });
}
function initMacCursor(){
  const c=document.createElement('div');
  c.id='mac-cursor';
  c.innerHTML=`<svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 2l15 8.5-6.8 2L14 20l-2.2 1-1.8-7.5L4 16z" fill="#000" opacity=".85"/><path d="M5 4l12.5 7-5.3 1.6-1.7 7L9 18.5 7.5 12 5 13.8z" fill="#fff"/></svg>`;
  document.body.appendChild(c);
  const fine=matchMedia('(pointer:fine)').matches;
  document.body.classList.toggle('mac-cursor-mode',fine);
  addEventListener('mousemove',e=>{
    if(!fine)return;
    const t=e.target;
    const text=t.closest&&(t.closest('input')||t.closest('textarea')||t.closest('[contenteditable]'));
    c.style.display=text?'none':'block';
    c.style.left=e.clientX+'px'; c.style.top=e.clientY+'px';
  });
}
function applyAppleGlyph(){
  if(!IS_APPLE)return;
  const m=$('#m-apple'); if(m)m.innerHTML='<span class="apple-glyph"></span>';
  const b=$('#boot'); if(b)b.innerHTML='<div class="boot-glyph"></div>';
}
function renderAppleIcon(el,size){
  const g=uid();
  el.innerHTML=`<svg viewBox="0 0 384 464" width="${size}" height="${size}" fill="currentColor"><path d="M365 304c-9 21-13 30-25 50-16 27-39 60-67 60-26 0-33-17-68-17s-41 17-67 17c-28 0-49-29-66-56-57-93-63-202-28-266 24-45 63-72 99-72 27 0 53 18 72 18 18 0 46-21 79-18 14 1 52 5 77 39-2 1-46 27-45 80 1 62 51 83 52 84-1 1-9 28-23 61zM262 41c19-23 32-55 28-41 0 0-1 1-3 1-22 5-43 20-57 41-14 19-26 52-23 41 0 0 25-2 55-42z"/></svg>`;
}
function init(){
  initTheme();
  applyAppleGlyph();
  buildDock();
  buildLaunchpad();
  buildDeskIcons();
  bindCC();
  bindMenus();
  bindSpot();
  bindKeys();
  bindPower();
  initMacCursor();
  updateLoginHint();
  $('#batt-pct').textContent=Math.round(60+Math.random()*30)+'%';
  if(location.search.includes('desktop')){
    $('#boot').classList.add('hide');
    $('#login').classList.add('hide');
    $('#desktop').classList.add('on');
  }else{
    bootBoot();
  }
}
document.addEventListener('DOMContentLoaded',init);
