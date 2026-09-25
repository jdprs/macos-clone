"use strict";
/* ===================== 终端 ===================== */
let tHistory=[],tHi=0;
const CMD={
  help(){return ['可用命令：','  ls [路径]    列出目录','  cd [路径]    切换目录','  cat [文件]   查看文件','  pwd          当前路径','  echo [文本]  输出文本','  date         当前时间','  whoami       当前用户','  uname        系统信息','  neofetch     系统信息总览','  open [app]   打开应用','  clear        清屏'];},
  pwd(){return [curDir];},
  whoami(){return ['访客'];},
  uname(){return ['macOS 15 (复刻版) x86_64'];},
  date(){return [new Date().toString()];},
  echo(a){return [a.join(' ')];},
  open(a){if(a[0]){const id=a[0].toLowerCase();if(APPS[id]){openApp(id);return ['正在打开 '+APPS[id].name+'…'];}return ['未找到应用: '+a[0]];}return ['用法: open <app>'];},
  ls(a){
    const p=a[0]?joinP(curDir,a[0]):curDir;
    const c=ls(p); if(!c)return ['ls: '+a[0]+': 没有那个文件或目录'];
    return Object.keys(c).map(k=>k.startsWith('.')?'\. '+k:k);
  },
  cd(a){
    if(!a[0]){curDir='/Users/访客';return [];}
    const p=joinP(curDir,a[0]); const n=node(p);
    if(!n||n.type!=='dir')return ['cd: '+a[0]+': 没有那个文件或目录'];
    curDir=p; return [];
  },
  cat(a){
    if(!a[0])return ['用法: cat <文件>'];
    const p=joinP(curDir,a[0]); const n=node(p);
    if(!n)return ['cat: '+a[0]+': 没有那个文件或目录'];
    if(n.type!=='file')return ['cat: '+a[0]+': 是一个目录'];
    return (n.content||'').split('\n');
  },
  neofetch(){
    return ['         .:ddd8dd:.       访客@macos-clone','       .dkddddddddddkkd.     ────────────────','     .dkdddddddddddddddkd.   OS: macOS 15 (复刻版)','    dkddddddddddddddddddkd   Host: Web Desktop','   dkddddddddddddddddddddkd  Kernel: html5','  dkddddddddddddddddddddddkd Uptime: 刚刚',' .dkdddddddddddddddddddddddkd Shell: web-zsh',' dkdddddddddddddddddddddddddk Resolution: 1440x900',' dkdddddddddddddddddddddddddk WM: Aqua (复刻)',' dkdddddddddddddddddddddddddk Theme: 深色/浅色',' .dkdddddddddddddddddddddddkd CPU: JavaScript 引擎','  dkddddddddddddddddddddddkd  GPU: CSS Renderer','  dkdddddddddddddddddddddkd   Memory: localStorage','   dkdddddddddddddddddddkd    Terminal: 演示','    dkddddddddddddddddddkd','     .dkdddddddddddddddkd.','       .dkdddddddddddkd.','         .:ddd8dd:.' ,'',' 欢迎使用 macOS 复刻版终端！输入 help 查看可用命令。'];
  },
  clear(){tLines=[];return [];}
};
let curDir='/Users/访客',tLines=[];
function joinP(a,b){if(b.startsWith('/'))return b;return (a==='/'?'/':a+'/')+b;}
function buildTerminal(el){
  const body=el._body;
  body.innerHTML=`<div class="terminal" id="term-${el._id}"></div>`;
  el._term=body.querySelector(`#term-${el._id}`);
  tLines=[]; curDir='/Users/访客';
  termPrint(el,[{t:'Last login: '+new Date().toLocaleString('zh-CN'),c:'dim'},{t:'欢迎使用 macOS 复刻版终端，输入 help 查看可用命令。',c:'dim'}]);
  termLine(el);
  el._term.addEventListener('click',()=>{const inp=el._term.querySelector('.t-in');if(inp)inp.focus();});
}
function termPrint(el,lines){
  lines.forEach(l=>{
    const div=document.createElement('div');
    div.className='t-line';
    div.innerHTML=l.c?`<span class="c-${l.c}">${esc(l.t)}</span>`:esc(l.t);
    el._term.appendChild(div);
  });
  el._term.scrollTop=el._term.scrollHeight;
}
function termLine(el){
  const div=document.createElement('div');
  div.className='t-line';
  div.innerHTML=`<span class="t-prompt">访客@macos-clone ${esc(curDir)} %</span><span class="t-in" contenteditable="true" spellcheck="false"></span>`;
  el._term.appendChild(div);
  const inp=div.querySelector('.t-in');
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      const v=inp.textContent.trim();
      tHistory.push(v); tHi=tHistory.length;
      const [cmd,...args]=v.split(/\s+/);
      if(!v.trim()){termLine(el);return;}
      inp.contentEditable='false';
      const fn=CMD[cmd];
      if(cmd==='clear'){el._term.innerHTML='';termLine(el);return;}
      if(!fn){termPrint(el,[{t:'zsh: command not found: '+cmd,c:'err'}]);termLine(el);return;}
      const out=fn(args)||[];
      termPrint(el,out.map(t=>({t,c:out._c||''})));
      termLine(el);
    }else if(e.key==='ArrowUp'){
      e.preventDefault(); if(tHi>0)tHi--; inp.textContent=tHistory[tHi]||''; moveCaretEnd(inp);
    }else if(e.key==='ArrowDown'){
      e.preventDefault(); if(tHi<tHistory.length-1){tHi++;inp.textContent=tHistory[tHi]||'';}else{tHi=tHistory.length;inp.textContent='';} moveCaretEnd(inp);
    }
  });
  inp.focus();
}
function moveCaretEnd(el){const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}

/* ===================== 计算器 ===================== */
let calc={disp:'0',acc:null,op:null,newNum:true};
function buildCalculator(el){
  const body=el._body;
  body.innerHTML=`<div class="calc"><div class="calc-disp" id="cd-${el._id}">0</div><div class="calc-grid">
    ${['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map((k,i)=>{
      const cls=k==='0'?'calc-btn zero':k==='.'?'calc-btn':'calc-btn';
      const fn=['AC','±','%'].includes(k);
      const op=['÷','×','−','+','='].includes(k);
      return `<div class="${cls}${fn?' fn':''}${op?' op':''}" data-k="${k}">${k}</div>`;
    }).join('')}
  </div></div>`;
  el._disp=body.querySelector(`#cd-${el._id}`);
  body.querySelectorAll('.calc-btn').forEach(b=>b.addEventListener('click',()=>calcKey(b.dataset.k,el)));
}
function calcKey(k,el){
  const d=el._disp;
  if(/\d/.test(k)){
    if(calc.newNum){calc.disp=k;calc.newNum=false;}else calc.disp=calc.disp==='0'?k:calc.disp+k;
  }else if(k==='.'){
    if(calc.newNum){calc.disp='0.';calc.newNum=false;}else if(!calc.disp.includes('.'))calc.disp+='.';
  }else if(k==='AC'){calc={disp:'0',acc:null,op:null,newNum:true};}
  else if(k==='±'){calc.disp=calc.disp.startsWith('-')?calc.disp.slice(1):'-'+calc.disp;}
  else if(k==='%'){calc.disp=String(parseFloat(calc.disp)/100);}
  else if(k==='='){if(calc.op&&calc.acc!==null){calc.disp=String(calcOp(calc.acc,parseFloat(calc.disp),calc.op));calc.acc=null;calc.op=null;}calc.newNum=true;}
  else{
    if(calc.op&&!calc.newNum){calc.disp=String(calcOp(calc.acc,parseFloat(calc.disp),calc.op));}
    calc.acc=parseFloat(calc.disp); calc.op=k; calc.newNum=true;
  }
  if(calc.disp.length>14)calc.disp=parseFloat(calc.disp).toPrecision(12);
  d.textContent=calc.disp;
}
function calcOp(a,b,op){
  const m={'+':(x,y)=>x+y,'−':(x,y)=>x-y,'×':(x,y)=>x*y,'÷':(x,y)=>y===0?NaN:x/y};
  const r=m[op](a,b); return Number.isNaN(r)?'错误':Math.round(r*1e10)/1e10;
}
APPS.terminal.build=buildTerminal;
APPS.calculator.build=buildCalculator;
