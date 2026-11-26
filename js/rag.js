/* ---------- RAG engine ---------- */
const S={docs:[],chunks:[],convs:[],cur:null,df:new Map()};
const STOP=new Set('the a an and or of to in on for with is are was were be by as at it this that from what which who how why do does can i you my your about tell me please into than then there their have has had not'.split(' '));
const tok=s=>(s.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu)||[]).filter(w=>!STOP.has(w)).map(w=>w.length>4?w.replace(/(ing|ed|es|s)$/,''):w);
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),fmt=b=>b>1e6?(b/1e6).toFixed(1)+' MB':Math.max(1,Math.round(b/1e3))+' KB';
const clean=t=>t.replace(/\r/g,'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/-\n(?=[a-z])/g,'').replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
function rsplit(t,sz,seps){if(t.length<=sz)return[t];const s=seps[0];if(s===undefined){const o=[];for(let i=0;i<t.length;i+=sz)o.push(t.slice(i,i+sz));return o}return t.split(s).flatMap(p=>p.length>sz?rsplit(p,sz,seps.slice(1)):[p])}
function chunkText(t,sz,ov){const parts=rsplit(t,sz,['\n\n','\n','. ',' ']).filter(x=>x.trim()),out=[];let cur='';for(const p of parts){if(cur&&cur.length+p.length+1>sz){out.push(cur);let tail=cur.slice(-ov);const sp=tail.indexOf(' ');tail=ov?tail.slice(sp+1):'';cur=tail+(tail?' ':'')+p}else cur+=(cur?' ':'')+p}if(cur.trim())out.push(cur);return out}
function reindex(){S.df=new Map();S.chunks.forEach(c=>{c.tf=new Map();tok(c.text).forEach(w=>c.tf.set(w,(c.tf.get(w)||0)+1));c.tf.forEach((_,w)=>S.df.set(w,(S.df.get(w)||0)+1))});const n=S.chunks.length;S.chunks.forEach(c=>{c.v=new Map();let s=0;c.tf.forEach((f,w)=>{const x=(1+Math.log(f))*Math.log(1+n/S.df.get(w));c.v.set(w,x);s+=x*x});c.nm=Math.sqrt(s)||1})}
function embed(q){/* swap for a dense-embedding API here */const tf=new Map();tok(q).forEach(w=>tf.set(w,(tf.get(w)||0)+1));const n=S.chunks.length,v=new Map();let s=0;tf.forEach((f,w)=>{if(!S.df.has(w))return;const x=(1+Math.log(f))*Math.log(1+n/S.df.get(w));v.set(w,x);s+=x*x});return{v,nm:Math.sqrt(s)||1}}
function search(q,k){const e=embed(q);if(!e.v.size)return[];return S.chunks.map(c=>{let d=0;e.v.forEach((x,w)=>{if(c.v.has(w))d+=x*c.v.get(w)});return{c,s:d/(e.nm*c.nm)}}).filter(r=>r.s>0).sort((a,b)=>b.s-a.s).slice(0,k)}
async function extract(f,cb){const ext=f.name.split('.').pop().toLowerCase(),buf=await f.arrayBuffer();
 if(ext=='pdf'){const pdf=await pdfjsLib.getDocument({data:buf}).promise,pg=[];for(let i=1;i<=pdf.numPages;i++){const c=await(await pdf.getPage(i)).getTextContent();pg.push(c.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join(''));cb(i/pdf.numPages)}return pg}
 if(ext=='docx'){return[(await mammoth.extractRawText({arrayBuffer:buf})).value]}
 return[new TextDecoder().decode(buf)]}
async function ingest(f){
 const d={id:Date.now()+Math.random(),name:f.name,size:f.size,st:'Uploading',p:0,err:0,n:0};S.docs.push(d);
 const ext=f.name.split('.').pop().toLowerCase();
 if(!['pdf','docx','txt','md','csv','json'].includes(ext)){d.st='Unsupported file type (.'+ext+')';d.err=1;return rd()}
 if(f.size>25e6){d.st='Too large (max 25 MB)';d.err=1;return rd()}
 try{const set=(s,p)=>{d.st=s;d.p=p;rd()};
  set('Uploading',.1);await sleep(250);set('Extracting text',.25);const pages=await extract(f,x=>{d.p=.25+x*.2;rd()});
  set('Cleaning content',.5);await sleep(200);const cl=pages.map(clean);if(!cl.join('').trim())throw Error('No extractable text (scanned PDF?)');
  set('Chunking',.62);await sleep(200);const sz=+$('cs').value,ov=+$('co').value;let k=0;
  cl.forEach((t,pi)=>chunkText(t,sz,ov).forEach(c=>S.chunks.push({doc:d.id,name:d.name,page:ext=='pdf'?pi+1:null,i:++k,text:c})));d.n=k;
  set('Generating embeddings',.78);await sleep(250);reindex();set('Indexing',.92);await sleep(250);d.st='Ready';d.p=1
 }catch(e){d.st='Error: '+e.message;d.err=1;S.chunks=S.chunks.filter(c=>c.doc!=d.id)}rd()}
function rd(){const r=S.docs.filter(d=>d.st=='Ready').length;$('rs').textContent=r?r+' doc'+(r>1?'s':'')+' ready':'No documents';
 $('dl').innerHTML=S.docs.map(d=>`<div class="dc"><div><span class="n">${esc(d.name)}</span><button class="ic" style="padding:0 4px" onclick="rm(${d.id})">✕</button></div><div style="color:var(--m)"><span>${fmt(d.size)}${d.n?' · '+d.n+' chunks':''}</span><span class="${d.err?'er':d.st=='Ready'?'ok':'st'}">${esc(d.st)}${d.st=='Ready'?' ✓':''}</span></div>${d.err||d.st=='Ready'?'':`<div class="pr"><i style="width:${d.p*100}%"></i></div>`}</div>`).join('')}
function rm(id){S.docs=S.docs.filter(d=>d.id!=id);S.chunks=S.chunks.filter(c=>c.doc!=id);reindex();rd()}
['dragover','dragenter'].forEach(e=>$('dz').addEventListener(e,x=>{x.preventDefault();$('dz').classList.add('h')}));
['dragleave','drop'].forEach(e=>$('dz').addEventListener(e,x=>{x.preventDefault();$('dz').classList.remove('h')}));
$('dz').addEventListener('drop',x=>[...x.dataTransfer.files].forEach(ingest));$('fi').onchange=e=>{[...e.target.files].forEach(ingest);e.target.value=''};
['cs','co','tk'].forEach((id,i)=>$(id).oninput=()=>$('v'+(i+1)).textContent=$(id).value);
/* generation: extractive + grounded (replace with LLM call using the same context) */
const sents=t=>t.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
function generate(q){
 const ready=S.chunks.length;if(!ready)return{text:"There are no documents in your knowledge base yet. Upload a PDF, DOCX or TXT file in the sidebar, then ask again.",src:[]};
 const k=+$('tk').value;let hits;const sum=/summari[sz]e|overview|key (concepts|points)|main (points|ideas)/i.test(q);
 if(sum){hits=S.docs.filter(d=>d.st=='Ready').flatMap(d=>S.chunks.filter(c=>c.doc==d.id).slice(0,2).map(c=>({c,s:1})))}else hits=search(q,k);
 if(!hits.length||(!sum&&hits[0].s<.06))return{text:"I couldn't find sufficient information about this in your uploaded documents.",src:[]};
 const qt=new Set(tok(q)),lines=[],src=[];
 hits.forEach(h=>{let ss=sents(h.c.text).map(s=>({s:s.trim(),sc:tok(s).filter(w=>qt.has(w)).length})).filter(x=>x.s.length>25);
  ss=sum?ss.slice(0,2):ss.sort((a,b)=>b.sc-a.sc).slice(0,2).filter(x=>x.sc>0);
  if(!ss.length)return;let n=src.indexOf(h.c)+1;if(!n){src.push(h.c);n=src.length}
  ss.forEach(x=>{if(!lines.some(l=>l.s==x.s))lines.push({s:x.s,n})})});
 if(!lines.length)return{text:"I couldn't find sufficient information about this in your uploaded documents.",src:[]};
 const body=lines.slice(0,sum?8:5).map(l=>`- ${l.s} [${l.n}]`).join('\n');
 return{text:(sum?"Here are the opening points from your documents:\n\n":"From your documents, the most relevant passages say:\n\n")+body+"\n\n*Extractive answer built only from the cited passages; no language model is connected.*",src}}
