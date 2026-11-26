const $=id=>document.getElementById(id),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* ---------- nav + story ---------- */
const cv=$('cv'),cx=cv.getContext('2d'),ST=['Ingest','Extract & clean','Chunk','Embed','Retrieve','Generate'];
let W,H,D,sp=0,tp=0;
function rs(){D=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0)}
addEventListener('resize',rs);rs();
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)},mx=(a,b,t)=>a+(b-a)*t;
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const N=54,nodes=Array.from({length:N},(_,i)=>({a:rnd()*6.28,r:.55+rnd()*.7,s:(.2+rnd()*.4)*(rnd()<.5?-1:1),k:i%3,cx:(rnd()-.5)*1.7,cy:(rnd()-.5)*1.1,hit:i%7==0}));
const kc=['#00D6FF','#4d8dff','#9fdcff'];
function scene(t){
 const cxm=W/2,cym=H/2,U=Math.min(W,H)*.42,p=sp;
 cx.clearRect(0,0,W,H);
 const pulse=1+.05*Math.sin(t*2),core=U*.2*(1+.35*sm(.65,.85,p));
 // grid hint
 cx.strokeStyle='rgba(255,255,255,.025)';cx.lineWidth=1;for(let x=cxm%80;x<W;x+=80){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke()}
 const g=cx.createRadialGradient(cxm,cym,0,cxm,cym,core*4.5);g.addColorStop(0,'rgba(0,214,255,.5)');g.addColorStop(.25,'rgba(0,80,255,.28)');g.addColorStop(1,'rgba(0,80,255,0)');
 cx.fillStyle=g;cx.fillRect(0,0,W,H);
 const e1=sm(.12,.4,p),e2=sm(.4,.52,p),e3=sm(.62,.78,p),e4=sm(.85,.97,p),sh=H>W;
 const P=nodes.map(n=>{
  const ang=n.a+t*n.s*.35;
  let ox=Math.cos(ang)*n.r*U*(sh?.9:1.5)*mx(1,.45,e1),oy=Math.sin(ang)*n.r*U*.8*mx(1,.45,e1);
  let vx=n.cx*U*(sh?1:1.7),vy=n.cy*U*1.25;
  let x=mx(ox,vx,e2),y=mx(oy,vy,e2);
  if(n.hit){x=mx(x,Math.cos(ang)*U*.38,e3);y=mx(y,Math.sin(ang)*U*.38,e3)}
  return{x:cxm+x,y:cym+y,n}});
 // extraction streams
 if(p>.12&&p<.5){cx.lineWidth=1;P.forEach((q,i)=>{if(i%2)return;const a=.5*Math.min(sm(.12,.2,p),1-sm(.4,.5,p));cx.strokeStyle=`rgba(0,214,255,${a*.45})`;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(cxm,cym);cx.stroke();const f=(t*.6+i*.13)%1;cx.fillStyle=`rgba(180,235,255,${a})`;cx.fillRect(mx(q.x,cxm,f)-2,mx(q.y,cym,f)-1,4,2)})}
 // network edges
 const ea=sm(.45,.6,p)*(.2+.5*e4);
 if(ea>.01){cx.lineWidth=.7;for(let i=0;i<N;i++)for(let j=i+1;j<N;j+=1){const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=Math.hypot(dx,dy);if(d<U*(.5+.5*e4)){const hi=P[i].n.hit&&P[j].n.hit&&e3>0;cx.strokeStyle=hi?`rgba(0,214,255,${.55*e3})`:`rgba(80,140,255,${ea*(1-d/(U*1.1))*.6})`;cx.beginPath();cx.moveTo(P[i].x,P[i].y);cx.lineTo(P[j].x,P[j].y);cx.stroke()}}}
 // retrieval lines to core
 if(e3>0){P.forEach(q=>{if(!q.n.hit&&e4<.3)return;cx.strokeStyle=`rgba(0,214,255,${(q.n.hit?.8:.25)*(e3)})`;cx.lineWidth=q.n.hit?1.4:.6;cx.beginPath();cx.moveTo(q.x,q.y);cx.lineTo(cxm,cym);cx.stroke()})}
 // nodes
 P.forEach((q,i)=>{const dim=e3>0&&!q.n.hit?1-.65*e3*(1-e4):1,col=kc[q.n.k];cx.globalAlpha=dim;
  const dw=mx(18,0,e2)*1,dh=dw*1.3;
  if(dw>1.2){cx.fillStyle='rgba(255,255,255,.08)';cx.strokeStyle=col;cx.lineWidth=1;cx.beginPath();cx.roundRect(q.x-dw/2,q.y-dh/2,dw,dh,3);cx.fill();cx.stroke();cx.fillStyle=col;for(let l=0;l<3;l++)cx.fillRect(q.x-dw/2+3,q.y-dh/2+4+l*4,dw-6,1)}
  const chunk=sm(.3,.42,p)*(1-e2);if(chunk>.02){cx.fillStyle=col;for(let c=-1;c<=1;c++)cx.fillRect(q.x+c*7*chunk-4,q.y-1.5,6+2*chunk,3)}
  const r=mx(0,q.n.hit&&e3>0?5.5:3,e2);if(r>.2){cx.fillStyle=q.n.hit&&e3>0?'#fff':col;cx.shadowColor=col;cx.shadowBlur=q.n.hit?18:10;cx.beginPath();cx.arc(q.x,q.y,r,0,6.28);cx.fill();cx.shadowBlur=0}
  cx.globalAlpha=1});
 // chat bubble forming
 const ca=sm(.7,.85,p);if(ca>0&&!sh){const bw=Math.min(250,W*.2),bx=cxm+U*.95,by=cym-60;cx.globalAlpha=ca;cx.fillStyle='rgba(10,10,12,.7)';cx.strokeStyle='rgba(0,214,255,.35)';cx.beginPath();cx.roundRect(bx,by,bw,110,16);cx.fill();cx.stroke();for(let l=0;l<4;l++){cx.fillStyle=`rgba(255,255,255,${.5-l*.08})`;cx.fillRect(bx+16,by+20+l*20,(bw-32)*Math.min(1,Math.max(0,(ca*1.6-l*.25))),5)}cx.fillStyle='#00D6FF';cx.fillRect(bx+16,by+94,40,3);cx.globalAlpha=1}
 // query ring
 if(e4>0){const k=(t*.5)%1;cx.strokeStyle=`rgba(0,214,255,${(1-k)*.6*e4})`;cx.lineWidth=1.5;cx.beginPath();cx.arc(cxm,cym,core+k*U*1.3,0,6.28);cx.stroke()}
 // core
 const cg=cx.createRadialGradient(cxm-core*.3,cym-core*.3,0,cxm,cym,core*pulse);cg.addColorStop(0,'#fff');cg.addColorStop(.3,'#00D6FF');cg.addColorStop(1,'#0050FF');
 cx.shadowColor='#00D6FF';cx.shadowBlur=60;cx.fillStyle=cg;cx.beginPath();cx.arc(cxm,cym,core*pulse,0,6.28);cx.fill();cx.shadowBlur=0;
 cx.strokeStyle='rgba(255,255,255,.18)';for(let i=1;i<=2;i++){cx.beginPath();cx.ellipse(cxm,cym,core*(1.5+i*.6),core*(.6+i*.25),t*.1*i,0,6.28);cx.stroke()}
}
const panels=[[0,.01,.12,.17,'c'],[.17,.22,.34,.4,'l'],[.43,.48,.6,.65,'r'],[.67,.72,.8,.85,'l'],[.88,.93,1.1,1.2,'c']].map((r,i)=>({el:$('p'+i),r}));
function upd(){
 const s=$('story'),sc=scrollY-s.offsetTop,tot=s.offsetHeight-innerHeight;tp=Math.min(1,Math.max(0,sc/tot));
 $('nv').classList.toggle('on',scrollY>40);
 panels.forEach(({el,r})=>{const[a,b,c,d,al]=r,o=Math.min(sm(a,b,tp),1-sm(c,d,tp)),dx=(1-sm(a,b,tp))*(al=='l'?-40:al=='r'?40:0)+sm(c,d,tp)*(al=='l'?-30:al=='r'?30:0),dy=(al=='c'?(1-sm(a,b,tp))*30+sm(c,d,tp)*-20:0);
  el.style.opacity=o;el.style.transform=`translate3d(${dx}px,${dy}px,0)`;el.style.pointerEvents=o>.6?'auto':'none'});
 $('bar').style.width=tp*100+'%';$('stg').textContent=tp<.12?'':ST[Math.min(5,Math.floor(tp*6))]
}
addEventListener('scroll',upd,{passive:true});upd();
let t0=performance.now();
(function loop(now){sp+=(tp-sp)*(RM?1:.08);const vis=scrollY<$('story').offsetTop+$('story').offsetHeight;if(vis)scene(RM?0:(now-t0)/1000);requestAnimationFrame(loop)})(t0);
