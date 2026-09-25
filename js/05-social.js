"use strict";
/* ===================== 备忘录 ===================== */
let notes=JSON.parse(localStorage.getItem('macos_notes')||'[]');
function saveNotes(){localStorage.setItem('macos_notes',JSON.stringify(notes));}
function buildNotes(el,opts={}){
  const body=el._body;
  body.innerHTML=`<div class="notes-main">
    <div class="notes-list" id="nl-${el._id}"></div>
    <div class="notes-editor">
      <div class="notes-toolbar"><span class="ttl" id="nt-${el._id}">无标题</span><span style="margin-left:auto" id="nd-${el._id}"></span></div>
      <textarea class="notes-area" id="na-${el._id}" placeholder="开始输入…" style="display:none"></textarea>
      <div class="notes-empty" id="ne-${el._id}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14v16H5z"/></svg>没有备忘录<br>点击下方 + 新建</div>
    </div>
  </div>`;
  el._list=body.querySelector(`#nl-${el._id}`); el._ttl=body.querySelector(`#nt-${el._id}`);
  el._area=body.querySelector(`#na-${el._id}`); el._empty=body.querySelector(`#ne-${el._id}`);
  el._date=body.querySelector(`#nd-${el._id}`); el._cur=-1;
  renderNotes(el);
  if(opts.file){const t=opts.file.split('/').pop();notes.push({title:t,body:'',date:new Date().toLocaleString('zh-CN')});saveNotes();renderNotes(el);selectNote(el,notes.length-1);}
}
function renderNotes(el){
  el._list.innerHTML='';
  notes.forEach((n,i)=>{
    const d=document.createElement('div');
    d.className='note-item'+(i===el._cur?' on':'');
    d.innerHTML=`<div class="tt">${esc(n.title||'无标题')}</div><div class="pr">${esc(n.body||'无文本')}</div>`;
    d.addEventListener('click',()=>selectNote(el,i));
    el._list.appendChild(d);
  });
  if(notes.length===0){el._area.style.display='none';el._empty.style.display='flex';}
  else{el._area.style.display='';el._empty.style.display='none';}
}
function selectNote(el,i){
  el._cur=i; renderNotes(el);
  if(i<0)return;
  el._ttl.textContent=notes[i].title||'无标题';
  el._date.textContent=notes[i].date||'';
  el._area.value=notes[i].body||'';
  el._area.style.display='';
}
APPS.notes.build=(el,opts)=>{
  buildNotes(el,opts);
  el._area.addEventListener('input',()=>{if(el._cur>=0){notes[el._cur].body=el._area.value;notes[el._cur].date=new Date().toLocaleString('zh-CN');saveNotes();renderNotes(el);}});
};

/* ===================== 信息 ===================== */
const CONVS=[
  {id:'a',name:'小豆',color:'#0a84ff',last:'好的，收到！',unread:1,msgs:[{m:'你好！在吗？',me:false,t:'10:02'},{m:'我想确认一下下午的安排',me:false,t:'10:02'},{m:'在的，下午 3 点开会',me:true,t:'10:05'},{m:'好的，收到！',me:false,t:'10:06'}]},
  {id:'b',name:'同事 张三',color:'#ff9f0a',last:'文件我发你了',unread:0,msgs:[{m:'文件我发你了',me:false,t:'09:40'},{m:'收到，谢谢！',me:true,t:'09:42'}]},
  {id:'c',name:'家人',color:'#34c759',last:'晚上回来吃饭吗',unread:0,msgs:[{m:'晚上回来吃饭吗？',me:false,t:'昨天'},{m:'回，7 点到家',me:true,t:'昨天'}]},
  {id:'d',name:'Apple 支持',color:'#5856d6',last:'欢迎使用 macOS 复刻版',unread:2,msgs:[{m:'欢迎使用 macOS 复刻版！',me:false,t:'周一'},{m:'这是一条自动回复演示消息。',me:false,t:'周一'}]}
];
let convIdx=0;
function buildMessages(el){
  const body=el._body;
  body.innerHTML=`<div class="msg-main">
    <div class="msg-list" id="ml-${el._id}"></div>
    <div class="msg-chat">
      <div class="msg-head"><span class="av" id="mh-av-${el._id}"></span><span id="mh-nm-${el._id}"></span></div>
      <div class="msg-bubbles" id="mb-${el._id}"></div>
      <div class="msg-input"><input id="mi-${el._id}" placeholder="信息" autocomplete="off"><span class="send" id="ms-${el._id}"><svg viewBox="0 0 24 24"><path d="M3 11l18-8-8 18-2-8-8-2z"/></svg></span></div>
    </div>
  </div>`;
  el._list=body.querySelector(`#ml-${el._id}`); el._bub=body.querySelector(`#mb-${el._id}`);
  el._in=body.querySelector(`#mi-${el._id}`); el._head=body.querySelector(`#mh-nm-${el._id}`); el._av=body.querySelector(`#mh-av-${el._id}`);
  renderConvs(el); renderChat(el);
  body.querySelector(`#ms-${el._id}`).addEventListener('click',()=>sendMsg(el));
  el._in.addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg(el);});
}
function renderConvs(el){
  el._list.innerHTML='';
  CONVS.forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='msg-conv'+(i===convIdx?' on':'');
    d.innerHTML=`<div class="av" style="background:${c.color}">${esc(c.name[0])}</div>
      <div style="min-width:0"><div class="nm">${esc(c.name)}</div><div class="last">${esc(c.last)}</div></div>
      ${c.unread?`<div class="bdg">${c.unread}</div>`:''}`;
    d.addEventListener('click',()=>{convIdx=i;renderConvs(el);renderChat(el);});
    el._list.appendChild(d);
  });
}
function renderChat(el){
  const c=CONVS[convIdx];
  el._head.textContent=c.name; el._av.textContent=c.name[0]; el._av.style.background=c.color;
  c.unread=0; renderConvs(el);
  el._bub.innerHTML=c.msgs.map(m=>`<div class="bubble${m.me?' me':''}">${esc(m.m)}<div class="bt">${m.t}</div></div>`).join('');
  el._bub.scrollTop=el._bub.scrollHeight;
}
function sendMsg(el){
  const v=el._in.value.trim(); if(!v)return;
  const c=CONVS[convIdx];
  const now=new Date(); const t=pad(now.getHours())+':'+pad(now.getMinutes());
  c.msgs.push({m:v,me:true,t}); c.last=v; el._in.value='';
  renderChat(el);
  setTimeout(()=>{
    const replies=['收到！','好的👌','哈哈，有意思','嗯嗯，继续说','没问题','好的，我看看','👍'];
    const r=replies[Math.floor(Math.random()*replies.length)];
    c.msgs.push({m:r,me:false,t}); c.last=r; renderChat(el);
  },900+Math.random()*700);
}
APPS.messages.build=buildMessages;

/* ===================== 邮件 ===================== */
const MAILS=[
  {from:'Apple',subj:'欢迎使用 macOS 复刻版',pre:'这是一封演示邮件。',date:'今天 09:00',unread:true,body:'欢迎使用 macOS 复刻版！\n\n这是一封演示邮件，展示了邮件应用的基本界面。\n\n—— macOS 复刻项目组'},
  {from:'小豆',subj:'关于下午的会议',pre:'下午 3 点在会议室 A 见。',date:'今天 08:40',unread:true,body:'下午 3 点在会议室 A 见。\n\n记得带上项目资料。'},
  {from:'IT 服务台',subj:'系统更新提醒',pre:'macOS 15.1 已可安装。',date:'昨天',unread:false,body:'macOS 15.1 已可安装。\n\n建议在空闲时间进行更新。'},
  {from:'新闻摘要',subj:'今日头条',pre:'查看今天的新闻。',date:'昨天',unread:false,body:'这是今天的新闻摘要。\n\n（演示内容）'}
];
function buildMail(el){
  const body=el._body;
  body.innerHTML=`<div class="mail-main">
    <div class="mail-list" id="mail-l-${el._id}"></div>
    <div class="mail-read">
      <div class="mail-toolbar"><span class="tb-btn" id="mail-d-${el._id}"><svg viewBox="0 0 24 24"><path d="M12 3l8 8-8 8-1.4-1.4L16 12H4v-2h12l-5.4-5.6z"/></svg></span></div>
      <div class="mail-body" id="mail-b-${el._id}"></div>
    </div>
  </div>`;
  el._list=body.querySelector(`#mail-l-${el._id}`); el._mb=body.querySelector(`#mail-b-${el._id}`); el._cur=-1;
  renderMails(el);
}
function renderMails(el){
  el._list.innerHTML='';
  MAILS.forEach((m,i)=>{
    const d=document.createElement('div');
    d.className='mail-item'+(m.unread?' unread':'')+(i===el._cur?' on':'');
    d.innerHTML=`<div class="from">${m.unread?'<span class="dot"></span>':''}${esc(m.from)}</div>
      <div class="subj">${esc(m.subj)}</div><div class="pre">${esc(m.pre)} · ${esc(m.date)}</div>`;
    d.addEventListener('click',()=>{el._cur=i;m.unread=false;renderMails(el);openMail(el,i);});
    el._list.appendChild(d);
  });
}
function openMail(el,i){
  const m=MAILS[i];
  el._mb.innerHTML=`<h2>${esc(m.subj)}</h2><div class="mail-meta"><span>发件人：${esc(m.from)}</span><span>时间：${esc(m.date)}</span></div><div class="mail-msg">${esc(m.body)}</div>`;
}
APPS.mail.build=buildMail;

/* ===================== 日历 ===================== */
const CAL_EV={};
let calY=new Date().getFullYear(),calM=new Date().getMonth();
function buildCalendar(el){
  const body=el._body;
  body.innerHTML=`<div class="cal-main">
    <div class="cal-head"><span class="m" id="cal-m-${el._id}"></span>
      <div class="cal-nav"><button id="cal-p-${el._id}">‹</button><button id="cal-n-${el._id}">›</button></div></div>
    <div class="cal-grid" id="cal-g-${el._id}"></div>
    <div class="cal-ev" id="cal-e-${el._id}"></div>
  </div>`;
  el._m=body.querySelector(`#cal-m-${el._id}`); el._g=body.querySelector(`#cal-g-${el._id}`); el._e=body.querySelector(`#cal-e-${el._id}`);
  body.querySelector(`#cal-p-${el._id}`).addEventListener('click',()=>{calM--;if(calM<0){calM=11;calY--;}renderCal(el);});
  body.querySelector(`#cal-n-${el._id}`).addEventListener('click',()=>{calM++;if(calM>11){calM=0;calY++;}renderCal(el);});
  renderCal(el);
}
function renderCal(el){
  const now=new Date();
  el._m.textContent=`${calY}年 ${calM+1}月`;
  const first=new Date(calY,calM,1); const start=(first.getDay()+6)%7;
  const days=new Date(calY,calM+1,0).getDate();
  const wd=['一','二','三','四','五','六','日'];
  let html=wd.map(w=>`<div class="wd">${w}</div>`).join('');
  for(let i=0;i<start;i++)html+=`<div class="cal-day out"></div>`;
  for(let d=1;d<=days;d++){
    const isToday=now.getFullYear()===calY&&now.getMonth()===calM&&now.getDate()===d;
    const key=`${calY}-${calM+1}-${d}`;
    html+=`<div class="cal-day${isToday?' today':''}" data-d="${d}">${d}${CAL_EV[key]?'<span class="ev"></span>':''}</div>`;
  }
  el._g.innerHTML=html;
  el._e.innerHTML=`<b>${calY}年${calM+1}月</b> ${CAL_EV[`${calY}-${calM+1}-${now.getDate()}`]||'今日无日程'}`;
}
APPS.calendar.build=buildCalendar;

/* ===================== 音乐 ===================== */
const TRACKS=[
  {t:'失重',a:'电子氛围',d:'3:24',c:'linear-gradient(135deg,#5b8af9,#9b59f6)'},
  {t:'午夜漫步',a:'Lo-Fi',d:'2:58',c:'linear-gradient(135deg,#ff9a9e,#fad0c4)'},
  {t:'晨光',a:'轻音乐',d:'3:42',c:'linear-gradient(135deg,#a1c4fd,#c2e9fb)'},
  {t:'霓虹',a:'Synthwave',d:'4:05',c:'linear-gradient(135deg,#f093fb,#f5576c)'},
  {t:'星河',a:'太空氛围',d:'3:11',c:'linear-gradient(135deg,#0f2027,#2c5364)'},
  {t:'夏日',a:'流行',d:'2:47',c:'linear-gradient(135deg,#f6d365,#fda085)'}
];
let trk=0,playing=false,tSec=0,tTimer=null;
function buildMusic(el){
  const body=el._body;
  body.innerHTML=`<div class="music-main">
    <div class="music-side">
      <div class="row on"><svg viewBox="0 0 24 24"><path d="M12 3v10.5a4 4 0 11-2-3.46V7h8V3z"/></svg>播放中</div>
      <div class="row"><svg viewBox="0 0 24 24"><path d="M12 3v10.5a4 4 0 11-2-3.46V7h8V3z"/></svg>最近添加</div>
      <div class="row"><svg viewBox="0 0 24 24"><path d="M12 3v10.5a4 4 0 11-2-3.46V7h8V3z"/></svg>艺人</div>
      <div class="row"><svg viewBox="0 0 24 24"><path d="M12 3v10.5a4 4 0 11-2-3.46V7h8V3z"/></svg>专辑</div>
    </div>
    <div class="music-play">
      <div class="music-hero">
        <div class="vinyl" id="vinyl-${el._id}" style="background:${TRACKS[trk].c}"></div>
        <div class="music-tt" id="mt-${el._id}"></div><div class="music-ar" id="ma-${el._id}"></div>
        <div class="music-ctl">
          <svg id="mp-${el._id}" viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5l-11 7 11 7z"/></svg>
          <svg class="play-big" id="mplay-${el._id}" viewBox="0 0 24 24"><path id="mpath-${el._id}" d="M8 5l12 7-12 7z"/></svg>
          <svg id="mn-${el._id}" viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/></svg>
        </div>
        <div class="music-prog"><span id="mt0-${el._id}">0:00</span><div class="bar" id="mbar-${el._id}"><i id="mfill-${el._id}"></i></div><span id="mt1-${el._id}"></span></div>
      </div>
      <div class="music-list" id="mlist-${el._id}"></div>
    </div>
  </div>`;
  el._v=body.querySelector(`#vinyl-${el._id}`); el._t=body.querySelector(`#mt-${el._id}`); el._a=body.querySelector(`#ma-${el._id}`);
  el._p=body.querySelector(`#mp-${el._id}`); el._n=body.querySelector(`#mn-${el._id}`); el._play=body.querySelector(`#mplay-${el._id}`);
  el._pp=body.querySelector(`#mpath-${el._id}`); el._list=body.querySelector(`#mlist-${el._id}`);
  el._bar=body.querySelector(`#mbar-${el._id}`); el._fill=body.querySelector(`#mfill-${el._id}`);
  el._t0=body.querySelector(`#mt0-${el._id}`); el._t1=body.querySelector(`#mt1-${el._id}`);
  el._p.addEventListener('click',()=>{trk=(trk-1+TRACKS.length)%TRACKS.length;renderMusic(el);syncCC();});
  el._n.addEventListener('click',()=>{trk=(trk+1)%TRACKS.length;renderMusic(el);syncCC();});
  el._play.addEventListener('click',()=>{togglePlay(el);syncCC();});
  el._bar.addEventListener('click',e=>{const r=el._bar.getBoundingClientRect();tSec=((e.clientX-r.left)/r.width)*durOf();renderMusic(el);syncCC();});
  renderMusic(el);
  renderTrackList(el);
}
function durOf(){const d=TRACKS[trk].d.split(':');return (+d[0])*60+(+d[1]);}
function renderMusic(el){
  const T=TRACKS[trk];
  el._t.textContent=T.t; el._a.textContent=T.a; el._v.style.background=T.c;
  el._v.classList.toggle('spin',playing);
  el._pp.setAttribute('d',playing?'M8 5l12 7-12 7z':'M8 5v14l11-7z');
  el._t1.textContent=T.d;
  const pct=(tSec/durOf())*100; el._fill.style.width=pct+'%';
  el._t0.textContent=Math.floor(tSec/60)+':'+pad(Math.floor(tSec%60));
  el._list.querySelectorAll('.music-trk').forEach((x,i)=>x.classList.toggle('playing',i===trk));
  $('#cc-now-tt').textContent=T.t; $('#cc-now-ar').textContent=T.a;
  $('#cc-now-art').innerHTML=`<div style="width:100%;height:100%;background:${T.c}"></div>`;
  $('#cc-play-path').setAttribute('d',playing?'M8 5v14l11-7z':'M8 5l12 7-12 7z');
}
function renderTrackList(el){
  el._list.innerHTML=TRACKS.map((T,i)=>`<div class="music-trk${i===trk?' playing':''}" data-i="${i}"><span class="idx">${i+1}</span><span>${esc(T.t)}</span><span style="color:var(--text-3)">${esc(T.a)}</span><span class="dur">${T.d}</span></div>`).join('');
  el._list.querySelectorAll('.music-trk').forEach(x=>x.addEventListener('click',()=>{trk=+x.dataset.i;tSec=0;renderMusic(el);renderTrackList(el);syncCC();}));
}
function togglePlay(el){playing=!playing;renderMusic(el);if(playing){clearInterval(tTimer);tTimer=setInterval(()=>{tSec=(tSec+1)%durOf();if(el&&el._fill){el._fill.style.width=((tSec/durOf())*100)+'%';el._t0.textContent=Math.floor(tSec/60)+':'+pad(Math.floor(tSec%60));}syncCC();},1000);}else clearInterval(tTimer);}
function stopMusic(){playing=false;clearInterval(tTimer);$('#cc-now-tt').textContent='未在播放';$('#cc-now-ar').textContent='';$('#cc-now-art').innerHTML='';}
function syncCC(){const T=TRACKS[trk];if(playing){$('#cc-now-tt').textContent=T.t;$('#cc-now-ar').textContent=T.a;$('#cc-now-art').innerHTML=`<div style="width:100%;height:100%;background:${T.c}"></div>`;$('#cc-play-path').setAttribute('d','M8 5v14l11-7z');}else{$('#cc-play-path').setAttribute('d','M8 5l12 7-12 7z');}}
APPS.music.build=buildMusic;
