"use strict";
/* ===================== 工具 ===================== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let _uid=0; const uid=()=>'u'+(++_uid);
function toast(msg,ms=1800){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),ms);}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const pad=n=>String(n).padStart(2,'0');
/* 登录密码：默认 123456，可在 系统设置 → 密码 中修改 */
let PW=localStorage.getItem('macos_pw')||'123456';
function setPW(p){PW=p;localStorage.setItem('macos_pw',p);if(typeof updateLoginHint==='function')updateLoginHint();}
/* 苹果设备直接使用 字符（U+F8FF）渲染苹果标志，其余设备用内联 SVG */
const IS_APPLE=/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent+' '+navigator.platform);

/* ===================== 主题与壁纸 ===================== */
const WP={
  0:{name:'流动', cls:'',      url:'url("https://media.doubao.com/space/api/box/stream/download/all_by_mount_point/G1fgb6LPWorKihxvpjhc4p8FnVc")'},
  1:{name:'渐变光',cls:'',     url:'linear-gradient(135deg,#ff9a9e 0%,#fecfef 30%,#a1c4fd 70%,#c2e9fb 100%)'},
  2:{name:'午夜', cls:'wallpaper-dark', url:'linear-gradient(160deg,#0f2027 0%,#203a43 45%,#2c5364 100%)'}
};
let wpIdx=+(localStorage.getItem('macos_wp')||0);
function setWallpaper(i,persist=true){
  wpIdx=i; document.documentElement.style.setProperty('--wallpaper',WP[i].url);
  document.body.classList.toggle('wallpaper-dark',!!WP[i].cls);
  if(persist)localStorage.setItem('macos_wp',i);
  $$('.wp-thumb').forEach((t,k)=>t.classList.toggle('on',k===i));
}
setWallpaper(wpIdx,false);

/* ===================== 时钟 ===================== */
function tickClock(){
  const n=new Date();
  const wd=['周日','周一','周二','周三','周四','周五','周六'][n.getDay()];
  const d=$('#menu-clock');
  d.innerHTML=`<span class="full">${wd} ${n.getMonth()+1}月${n.getDate()}日</span><span class="mini">${n.getMonth()+1}/${n.getDate()}</span>&nbsp;${pad(n.getHours())}:${pad(n.getMinutes())}`;
  d.title=`${n.getFullYear()}年${n.getMonth()+1}月${n.getDate()}日 ${wd} ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}
setInterval(tickClock,5000); tickClock();

/* ===================== 虚拟文件系统 ===================== */
const FS={
  '/':{'type':'dir','children':{
    'Applications':{'type':'dir','children':{
      '访达.app':{'type':'app','id':'finder'},
      'Safari.app':{'type':'app','id':'safari'},
      '备忘录.app':{'type':'app','id':'notes'},
      '终端.app':{'type':'app','id':'terminal'},
      '计算器.app':{'type':'app','id':'calculator'},
      '系统设置.app':{'type':'app','id':'settings'},
      '音乐.app':{'type':'app','id':'music'},
      '文本编辑.app':{'type':'app','id':'textedit'},
      '邮件.app':{'type':'app','id':'mail'},
      '信息.app':{'type':'app','id':'messages'},
      '照片.app':{'type':'app','id':'photos'},
      '日历.app':{'type':'app','id':'calendar'}
    }},
    'System':{'type':'dir','children':{}},
    'Users':{'type':'dir','children':{
      '访客':{'type':'dir','children':{
        'Desktop':{'type':'dir','children':{}},
        'Documents':{'type':'dir','children':{
          '项目计划.md':{'type':'file','content':'# 项目计划\n\n- 第一阶段：需求梳理\n- 第二阶段：界面复刻\n- 第三阶段：交互打磨\n\n> 用 HTML + CSS + JS 复刻 macOS 桌面。'},
          '会议纪要.txt':{'type':'file','content':'2026年9月25日 周会纪要\n\n1. 完成桌面框架搭建\n2. 窗口拖拽与缩放已就绪\n3. 下一步：打磨应用细节'},
          '预算.xlsx':{'type':'file','content':'# 预算表（演示文件）\n'}
        }},
        'Downloads':{'type':'dir','children':{
          'macos-clone.zip':{'type':'file','content':'zip 演示文件'},
          '壁纸.png':{'type':'file','content':'png 演示文件'},
          '说明.txt':{'type':'file','content':'下载目录演示文件'}
        }},
        'Pictures':{'type':'dir','children':{
          '2026 旅行':{'type':'dir','children':{}},
          '头像.png':{'type':'file','content':'png 演示文件'}
        }},
        'Music':{'type':'dir','children':{
          '我的歌单':{'type':'dir','children':{}}
        }},
        'Movies':{'type':'dir','children':{
          '演示视频.mov':{'type':'file','content':'mov 演示文件'}
        }},
        '.Trash':{'type':'dir','children':{}}
      }}
    }}
  }}
};
function node(path){
  const p=path.replace(/\/+/g,'/').replace(/\/$/,'')||'/';
  const parts=p.split('/').filter(Boolean);
  let n=FS['/'], cur='/';
  for(const part of parts){ if(n.type!=='dir'||!n.children)return null; if(!(part in n.children))return null; n=n.children[part]; cur+='/'+part; }
  return n;
}
function ls(path){const n=node(path);return n&&n.type==='dir'?n.children:null;}
function mkdir(path){const parts=path.replace(/\/+/g,'/').split('/').filter(Boolean);let n=FS['/'];for(let i=0;i<parts.length-1;i++){if(!n.children[parts[i]])return false;n=n.children[parts[i]];}if(!n.children||n.children[parts[parts.length-1]])return false;n.children[parts[parts.length-1]]={'type':'dir','children':{}};return true;}
function writeFile(path,content){const parts=path.replace(/\/+/g,'/').split('/').filter(Boolean);let n=FS['/'];for(let i=0;i<parts.length-1;i++){if(!n.children[parts[i]])return false;n=n.children[parts[i]];}if(!n.children)return false;n.children[parts[parts.length-1]]={'type':'file','content':content};return true;}
function rmToTrash(path){
  const parts=path.replace(/\/+/g,'/').split('/').filter(Boolean);const name=parts.pop();
  let n=FS['/'];for(const p of parts){if(!n.children[p])return false;n=n.children[p];}
  if(!n.children||!(name in n.children))return false;
  const trash=FS['/'].children.Users.children['访客'].children['.Trash'];
  trash.children[name]=n.children[name]; delete n.children[name]; return true;
}
function fileSize(node){if(!node)return 0;if(node.type==='file')return Math.max(64,(node.content||'').length*3);let s=0;for(const k in node.children)s+=fileSize(node.children[k]);return s;}
function fmtSize(n){if(n>1048576)return (n/1048576).toFixed(1)+' MB';if(n>1024)return Math.round(n/1024)+' KB';return n+' B';}

/* ===================== 应用图标 ===================== */
function ic(bg1,bg2,inner){
  const g=uid();
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#${g})"/>${inner}</svg>`;
}
const fnt='font-family="Arial,Helvetica,sans-serif"';
const ICONS={
  finder:()=>ic('#4cc9ff','#0a5cff',
    `<path d="M50 21c-15.5 0-27 10.8-27 26.6 0 18 12.5 29.4 27 29.4s27-11.4 27-29.4C77 31.8 65.5 21 50 21z" fill="none" stroke="#fff" stroke-width="4.6"/>
     <path d="M34 38h.01M66 38h.01" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
     <path d="M38 56c3.2 2.6 7.6 4 12 4s8.8-1.4 12-4" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/>
     <path d="M38 44c-1.6 2.4-2.4 5.6-1.8 8.6.6 3 2.4 5.4 5 6.8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>`),
  launchpad:()=>ic('#141416','#3a3a40',
    [35,50,65].map(y=>[32,50,68].map(x=>`<rect x="${x-4}" y="${y-4}" width="8" height="8" rx="2.4" fill="#fff"/>`).join('')).join('')),
  safari:()=>ic('#23b6f0','#0b63e0',
    `<circle cx="50" cy="50" r="37" fill="#f8fafc"/>
     <circle cx="50" cy="50" r="37" fill="none" stroke="#fff" stroke-width="5" opacity=".35"/>
     <path d="M50 50 L72 28 L58 52 Z" fill="#ff3b30"/><path d="M50 50 L28 72 L42 48 Z" fill="#fff"/>
     <circle cx="50" cy="50" r="4.4" fill="#ff3b30"/>`),
  messages:()=>ic('#5bfa6c','#0ac84a',
    `<path d="M24 30c0-8.3 6.7-15 15-15h22c8.3 0 15 6.7 15 15v18c0 8.3-6.7 15-15 15H50l-16 11 2-11h-1c-8.3 0-11-4.7-11-13V30z" fill="#fff"/>
     <circle cx="38" cy="39" r="4.4" fill="#2b2b2e"/><circle cx="50" cy="39" r="4.4" fill="#2b2b2e"/><circle cx="62" cy="39" r="4.4" fill="#2b2b2e"/>`),
  mail:()=>ic('#2fb9ff','#0a5cff',
    `<rect x="17" y="28" width="66" height="44" rx="7" fill="#fff"/>
     <path d="M17 33l33 22 33-22" fill="none" stroke="#0a5cff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  photos:()=>ic('#f2f2f4','#e2e2e6',
    [0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="50" cy="32" rx="10.5" ry="15" fill="#fff" transform="rotate(${a} 50 50)"/>`).join('')+
    `<circle cx="50" cy="50" r="8" fill="#ff5e8a"/>`),
  calendar:()=>{const n=new Date();const wd=['日','一','二','三','四','五','六'][n.getDay()];
    return ic('#f4f4f6','#e6e6ea',
    `<rect x="14" y="16" width="72" height="22" rx="6" fill="#ff3b30"/><text x="50" y="32" text-anchor="middle" ${fnt} font-size="15" font-weight="700" fill="#fff">${wd}月${n.getMonth()+1}</text>
     <text x="50" y="76" text-anchor="middle" ${fnt} font-size="34" font-weight="700" fill="#1d1d1f">${n.getDate()}</text>`);},
  notes:()=>ic('#fff','#f7f7f9',
    `<rect x="18" y="14" width="64" height="26" fill="#fff"/><rect x="18" y="40" width="64" height="46" fill="#ffd84d"/>
     <rect x="18" y="14" width="64" height="4" fill="#f2a000"/>
     <path d="M24 50h34M24 58h26M24 66h30M24 74h20" stroke="#d89b00" stroke-width="3" stroke-linecap="round"/>`),
  music:()=>ic('#fb5d76','#fa233b',
    `<path d="M62 24l-22 5v32c0 3-2.5 5-5.5 5S29 64 29 61s2.5-5 5.5-5c1.4 0 2.6.5 3.5 1.2V30l22-5v24c0 3-2.5 5-5.5 5S49 52 49 49s2.5-5 5.5-5c1.4 0 2.6.5 3.5 1.2V24z" fill="#fff"/>
     <rect x="72" y="30" width="4" height="26" rx="2" fill="#fff"/><rect x="80" y="38" width="4" height="18" rx="2" fill="#fff" opacity=".85"/>
     <rect x="64" y="36" width="4" height="20" rx="2" fill="#fff" opacity=".7"/>`),
  settings:()=>ic('#45454b','#2c2c30',
    `<g fill="#fff"><rect x="18" y="30" width="34" height="5" rx="2.5"/><rect x="66" y="30" width="16" height="5" rx="2.5"/>
     <rect x="18" y="66" width="16" height="5" rx="2.5"/><rect x="48" y="66" width="34" height="5" rx="2.5"/>
     <circle cx="60" cy="32.5" r="7" fill="#45454b" stroke="#fff" stroke-width="4"/><circle cx="40" cy="68.5" r="7" fill="#45454b" stroke="#fff" stroke-width="4"/></g>`),
  terminal:()=>ic('#1b1b1f','#0c0c0f',
    `<circle cx="30" cy="27" r="3.2" fill="#ff5f57"/><circle cx="42" cy="27" r="3.2" fill="#febc2e"/><circle cx="54" cy="27" r="3.2" fill="#28c840"/>
     <text x="24" y="74" ${fnt} font-size="42" font-weight="700" fill="#7ee787">&gt;_</text>`),
  calculator:()=>ic('#2e2e33','#1d1d21',
    `<text x="26" y="34" ${fnt} font-size="17" font-weight="600" fill="#fff">0</text>
     <circle cx="30" cy="55" r="7" fill="#ff9f0a"/><circle cx="50" cy="55" r="7" fill="#ff3b30"/><circle cx="70" cy="55" r="7" fill="#d9d9d9"/>
     <circle cx="30" cy="77" r="7" fill="#8e8e93"/><circle cx="50" cy="77" r="7" fill="#8e8e93"/><circle cx="70" cy="77" r="7" fill="#8e8e93"/>`),
  textedit:()=>ic('#fff','#f0f0f4',
    `<rect x="20" y="14" width="60" height="72" rx="4" fill="#fff"/>
     <path d="M14 24h72v6H14z" fill="#e8e8ee"/><path d="M18 21v3M22 21v3M26 21v3" stroke="#e8e8ee" stroke-width="2"/>
     <path d="M28 46h38M28 54h32M28 62h35M28 70h26" stroke="#c7c7cc" stroke-width="3" stroke-linecap="round"/>`),
  appstore:()=>ic('#f2f2f4','#e2e2e6',
    `<path d="M50 20c-2.6 5-8 15-15 15l-1.4 2.4c-1.6 2.8-2.6 5.6-2.6 8 0 3.6 2.6 6.6 7 6.6 3 0 6-1.6 8-3.6 1.6-1.8 3-3.6 4.6-5.6l3.4 5.6c2 2 5 3.6 8 3.6 4.4 0 7-3 7-6.6 0-2.4-1-5.2-2.6-8L62 35c-7 0-12.4-10-12-15z" fill="#0a84ff"/>`),
  folder:()=>ic('#3ec3ff','#1d7dff',
    `<path d="M16 28c0-3.3 2.7-6 6-6h15l7 8h34c3.3 0 6 2.7 6 6v34c0 3.3-2.7 6-6 6H22c-3.3 0-6-2.7-6-6V28z" fill="#fff" opacity=".96"/>`),
  hd:()=>ic('#ececf0','#b8b8c4',
    `<rect x="22" y="30" width="56" height="40" rx="5" fill="#a8a8b4"/><rect x="27" y="35" width="46" height="12" rx="3" fill="#fff"/>
     <circle cx="72" cy="63" r="3" fill="#c7c7d0"/>`),
  trash:()=>ic('#d8d8de','#a9a9b4',
    `<rect x="28" y="38" width="44" height="42" rx="5" fill="#f4f4f6"/><path d="M28 38h44l-3 42H31z" fill="#fff"/>
     <path d="M34 40v38M43 40v38M52 40v38M61 40v38" stroke="#d3d3da" stroke-width="2.4"/>
     <path d="M38 32h24l-3 8H41z" fill="#e8e8ee"/><rect x="46" y="24" width="8" height="8" rx="2" fill="#c9c9d2"/>`),
  downloads:()=>ic('#3ec3ff','#1d7dff',
    `<path d="M16 28c0-3.3 2.7-6 6-6h15l7 8h34c3.3 0 6 2.7 6 6v34c0 3.3-2.7 6-6 6H22c-3.3 0-6-2.7-6-6V28z" fill="#fff"/>
     <path d="M50 42v22M40 56l10 10 10-10" stroke="#1d7dff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  finderSm:()=>`<svg viewBox="0 0 24 24" fill="#1d1d1f"><path d="M12 3C7 3 3.5 6.4 3.5 11c0 5 3.6 8 8.5 8s8.5-3 8.5-8c0-4.6-3.5-8-8.5-8zm0 2.6c2.7 0 4.6 1.9 4.6 4.6 0 3.6-2.4 5.7-4.6 5.7s-4.6-2.1-4.6-5.7c0-2.7 1.9-4.6 4.6-4.6z"/></svg>`
};
function icon(name){return ICONS[name]?ICONS[name]():'';}
