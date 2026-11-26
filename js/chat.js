/* mini orb in welcome */
function orb(c){const x=c.getContext('2d');c.width=c.height=300;let t=0;(function f(){if(!c.isConnected)return;t+=.02;x.clearRect(0,0,300,300);for(let i=0;i<14;i++){const a=t*(.5+i%3*.3)+i,r=60+i%4*14;x.fillStyle=i%2?'#00D6FF':'#4d8dff';x.globalAlpha=.7;x.beginPath();x.arc(150+Math.cos(a)*r,150+Math.sin(a)*r*.7,3,0,6.28);x.fill()}x.globalAlpha=1;const g=x.createRadialGradient(150,150,0,150,150,40);g.addColorStop(0,'#fff');g.addColorStop(.4,'#00D6FF');g.addColorStop(1,'#0050ff00');x.fillStyle=g;x.beginPath();x.arc(150,150,40+3*Math.sin(t*3),0,6.28);x.fill();requestAnimationFrame(f)})()}
/* ---------- chat UI ---------- */
const md=s=>esc(s).replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/^- (.+)$/gm,'<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)(?!\n<li>)/g,'<ul>$1</ul>').replace(/\n/g,'<br>').replace(/<\/li><br>/g,'</li>').replace(/<ul><br>/g,'<ul>');
const tm=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function newChat(){const c={id:Date.now(),title:'New conversation',m:[]};S.convs.unshift(c);S.cur=c;sync()}
function sync(){$('cl').innerHTML=S.convs.map(c=>`<div class="it ${c==S.cur?'a':''}" onclick="S.cur=S.convs.find(x=>x.id==${c.id});sync()"><span>${esc(c.title)}</span></div>`).join('');$('ct').textContent=S.cur.title;const f=$('feed');f.innerHTML='';
 if(!S.cur.m.length){f.innerHTML=`<div class="w"><canvas></canvas><h2>What would you like to know?</h2><p>Ask questions grounded in your uploaded documents.</p><div class="sg">${['Summarize my uploaded document.','What are the key concepts?','Explain this topic in simple language.','Find important information across my documents.'].map(s=>`<button onclick="q.value=this.textContent;ask()">${s}</button>`).join('')}</div></div>`;orb(f.querySelector('canvas'))}
 else S.cur.m.forEach(m=>draw(m,true));if(innerWidth<800)$('sb').classList.add('c')}
function draw(m,fin){const f=$('feed'),d=document.createElement('div');
 if(m.r=='u'){d.className='msg u';d.innerHTML=esc(m.t)+`<div class="ts">${m.ts}</div>`;f.appendChild(d);return d}
 d.className='msg a';d.innerHTML=`<div class="bd">${fin?md(m.t):''}</div><div class="src"></div><div class="ts">${m.ts}</div>`;f.appendChild(d);if(fin)fin2(d,m);return d}
function fin2(d,m){d.querySelector('.bd').innerHTML=md(m.t);const s=d.querySelector('.src');
 s.innerHTML=m.src.map((c,i)=>`<span class="sc" data-i="${i}">[${i+1}] ${esc(c.name)}${c.page?' · p.'+c.page:''} · chunk ${c.i}</span>`).join('');
 s.querySelectorAll('.sc').forEach(e=>e.onclick=()=>{let p=e.nextElementSibling;const c=m.src[e.dataset.i];if(!p||!p.classList.contains('pv')){p=document.createElement('div');p.className='pv';p.textContent=c.text;e.after(p)}p.style.display=p.style.display=='block'?'none':'block'});
 const a=document.createElement('div');a.className='ac';a.innerHTML='<button>Copy</button><button>Regenerate</button><button>👍</button><button>👎</button>';
 const b=a.children;b[0].onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(m.t);b[0].textContent='Copied'};b[1].onclick=()=>{const i=S.cur.m.indexOf(m);S.cur.m.splice(i);run(S.cur.m.pop().t,true)};b[2].onclick=b[3].onclick=e=>e.target.style.color='var(--c)';d.appendChild(a)}
let busy=0;function ask(){const v=q.value.trim();if(!v||busy)return;q.value='';run(v)}
async function run(v,re){busy=1;const c=S.cur;if(!c.m.length){c.title=v.slice(0,36);sync()}
 if($('feed').querySelector('.w'))$('feed').innerHTML='';const um={r:'u',t:v,ts:tm()};c.m.push(um);draw(um);
 const ty=document.createElement('div');ty.className='msg a';ty.innerHTML='<div class="dots"><span></span><span></span><span></span></div>';$('feed').appendChild(ty);$('feed').scrollTop=1e9;
 await sleep(450);const r=generate(v);ty.remove();const am={r:'a',t:r.text,src:r.src,ts:tm()};c.m.push(am);const d=draw({...am,t:''},false),bd=d.querySelector('.bd'),w=r.text.split(/(\s+)/);let s='';
 for(let i=0;i<w.length;i+=RM?w.length:3){s+=w.slice(i,i+3).join('');bd.innerHTML=md(s);$('feed').scrollTop=1e9;if(!RM)await sleep(16)}
 fin2(d,am);$('feed').scrollTop=1e9;busy=0}
function clr(){S.cur.m=[];S.cur.title='New conversation';sync()}
function tg(){$('sb').classList.toggle('c')}
function openKB(){$('sb').classList.remove('c')}
q.addEventListener('keydown',e=>{if(e.key=='Enter'&&!e.shiftKey){e.preventDefault();ask()}});
newChat();rd();
