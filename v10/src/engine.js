/* ---------- engine: state, text overrides, quick elements ---------- */
const eElastic=p=>p===0?0:p===1?1:Math.pow(2,-10*p)*Math.sin((p*10-.75)*(TAU/3))+1;
const eInOut=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const EASE={enter:eEnter,out:eOut,back:eBack,pop:ePop,elastic:eElastic,exit:eExit,move:eMove,linear:p=>p,inout:eInOut};

/* Leon's own on-brand templates come first; ported and open-ended tools sit below.
   Every template also carries a campaign category (cat) so the rail can be filtered by
   event type; anything not explicitly tagged below falls back to 'classic'. */
const CAT_MAP={lcircle:'megasale',lclean:'megasale',lcallout:'megasale',lthresh:'supersale',lfinance:'financing',
  hero:'megasale',sale:'megasale',price:'megasale',versus:'megasale',compare:'megasale',
  number:'supersale',meme:'seasonal',maple:'seasonal',mascot:'seasonal',peek:'seasonal'};
const T=[...T_EVENTS.map(x=>({grp:"Leon's events",...x})),...T_LEONS.map(x=>({grp:"Leon's posts",...x})),...T_CLASSIC.map(x=>({grp:"Leon's posts",...x})),
  ...T_PREM.map(x=>({grp:"Leon's campaigns",...x})),...T_PREM2.map(x=>({grp:"Leon's campaigns",...x})),
  ...T_ADV.map(x=>({grp:"Leon's motion",...x})),
  ...T_COMM.map(x=>({grp:'Community ports',...x})),].map(tp=>({cat:CAT_MAP[tp.id]||'classic',...tp}));

const state={tid:'lcircle',ratio:'4:5',D:6,loops:1,fps:30,t:0,playing:true,vals:{},imgs:{},ovr:{},style:{},logo:null,rec:null,sel:null,
  logos:[],logoId:null,
  logo2:{fx:'none',at:.15,dur:.9,col:'#FFE81A',scale:1},
  film:{shake:'off',grain:0,vig:0,bars:'off',leak:'off',zoom:'off'},
  quick:{},quickNextId:1,
  };
T.forEach(tp=>{state.vals[tp.id]={};state.imgs[tp.id]={};tp.fields.forEach(f=>state.vals[tp.id][f.k]=f.v)});
const cur=()=>T.find(x=>x.id===state.tid);
const Hnow=()=>RATIOS[state.ratio];

/* ----- per-text overrides (works on every template through a canvas proxy) -----
   Position/size/rotation ("layout") overrides are scoped per (template, ratio): a 1:1
   post and a 9:16 post wrap text differently and sit in a different frame, so a
   drag/resize tweak made on one ratio must not silently reposition or reflow the
   others. Typography ("style": weight, typeface, colour, letter/line spacing,
   opacity) is a design decision that isn't tied to any one frame, so it's stored per
   template only and shared across every ratio of that post — set it once on 1:1 and
   it already applies to 4:5 and 9:16. */
const OVD={dx:0,dy:0,sc:1,rot:0,col:'',wt:'',fam:'',ls:0,lh:1,op:1,sx:1,sy:1,flip:false,hide:false};
const STD={col:'',wt:'',fam:'',ls:0,lh:1,op:1};
function ovKey(tid){return tid+'@'+state.ratio}
function ovFor(tid,key,create){const k=ovKey(tid),o=(state.ovr[k]=state.ovr[k]||{});if(!o[key]&&create)o[key]={...OVD};return o[key]}
function styleFor(tid,key,create){const o=(state.style[tid]=state.style[tid]||{});if(!o[key]&&create)o[key]={...STD};return o[key]}
/* The merged view draw code actually reads: layout overrides as the base shape, with
   any shared style overrides laid on top. Built lazily per key so a write to either
   store (through ovFor/styleFor) is picked up on the next read without extra bookkeeping. */
function ovProxy(tid){
  return new Proxy({},{get(_,key){
    if(typeof key!=='string')return undefined;
    const lay=(state.ovr[ovKey(tid)]||{})[key],sty=(state.style[tid]||{})[key];
    if(!lay&&!sty)return undefined;
    return Object.assign({},lay||OVD,sty||{});
  }});
}
const nz=s=>String(s).toUpperCase().replace(/\s+/g,' ').trim().replace(/\d[\d,]*/g,'#');

/* ----- quick Leon's elements: ready-made brand stickers droppable onto ANY template,
   scoped per (template, ratio) the same way overrides are. Rendered through objDraw
   so they get the same drag/resize/rotate/select handling every other object has. ----- */
const QUICK_KINDS={
  bestseller:{name:'Best Seller badge',w:140,h:140,draw(c){const img=BRAND.best;brandBadge(c,img,0,0,140)}},
  canada:{name:'Made in Canada badge',w:170,h:70,draw(c){const img=BRAND.canada;brandBadge(c,img,0,0,170)}},
  percent:{name:'Percent-off sticker',w:170,h:170,draw(c){c.beginPath();c.arc(0,0,85,0,TAU);c.fillStyle='#C8102E';c.fill();font(c,900,46,FSOFT);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText('50%',0,-14);font(c,800,22,FNOVA);c.fillText('OFF',0,28)}},
  pricetag:{name:'Price tag',w:200,h:84,draw(c){boxPath(c,'tag',-100,-42,200,84,10);c.fillStyle='#111111';c.fill();font(c,900,34,FSOFT);c.fillStyle='#FFE81A';c.textAlign='center';c.textBaseline='middle';c.fillText('$599',14,0)}},
  starburst:{name:'Starburst',w:190,h:190,draw(c){burstPath(c,0,0,95,95,12,.82,0);c.fillStyle='#FFE81A';c.fill();font(c,900,34,FNOVA);c.fillStyle='#111111';c.textAlign='center';c.textBaseline='middle';c.fillText('SALE',0,0)}},
  ribbon:{name:'Ribbon banner',w:240,h:70,draw(c){boxPath(c,'ribbon',-120,-35,240,70,12);c.fillStyle='#C8102E';c.fill();font(c,800,28,FNOVA);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText('NEW',0,0)}}
};
/* Read-only lookup — never creates the key. Creating it as a side effect (even for
   display-only callers like buildQuick/drawQuickElements) would make the live state
   diverge from the last history snapshot and silently wipe the redo stack. */
function quickFor(tid){return state.quick[ovKey(tid)]||[]}
function addQuick(tid,kind){
  const k=ovKey(tid),list=state.quick[k]=state.quick[k]||[],id=state.quickNextId++,n=list.length;
  const el={id,kind,x:W*.5+(n%3-1)*40,y:Hnow()*.5+Math.floor(n/3)*40};
  list.push(el);return el;
}
function delQuick(tid,id){
  const k=ovKey(tid),list=state.quick[k];if(!list)return;
  const i=list.findIndex(e=>e.id===id);if(i<0)return;list.splice(i,1);
  if(!list.length)delete state.quick[k];
}
function drawQuickElements(c,W,H,t,tid){
  const list=state.quick[ovKey(tid)];if(!list||!list.length)return;
  list.forEach(el=>{
    const K=QUICK_KINDS[el.kind];if(!K)return;
    const w=K.w,h=K.h;
    objDraw(c,'obj:Quick'+el.id,el.x-w/2,el.y-h/2,w,h,()=>{c.save();c.translate(el.x,el.y);K.draw(c);c.restore()});
  });
}
let FR=null,LAST=null,realCtx=null;
function buildFR(tp){
  const v=state.vals[tp.id];
  const fields=tp.fields.filter(f=>f.t==='text'||f.t==='area').map(f=>({key:f.k,label:f.l,lines:String(v[f.k]).split('\n').map(nz),whole:nz(String(v[f.k]).replace(/\n/g,' '))}));
  return {tid:tp.id,fields,hits:[],anch:{},ov:ovProxy(tp.id),mcache:{},seen:{},counts:{}};
}
function matchKey(s){
  if(FR&&FR.noMatch>0)return null;
  const n=nz(s);if(!n)return null;
  let cands=FR.mcache[n];
  if(!cands){
    cands=[];
    for(const f of FR.fields)if(f.lines.includes(n))cands.push(f.key);
    if(!cands.length&&n.length>=3)for(const f of FR.fields)if(f.whole.includes(n))cands.push(f.key);
    FR.mcache[n]=cands;
  }
  if(!cands.length)return null;
  if(cands.length===1)return cands[0];
  /* two fields can hold identical text (a headline repeated inside a badge).
     Hand them out in draw order so each stays its own object. */
  const i=FR.seen[n]=(FR.seen[n]==null?0:FR.seen[n]+1);
  return cands[Math.min(i,cands.length-1)];
}
/* A string with a line break is drawn as a tight stacked block (lines ~1.08 apart) centred on
   the anchor the single line would have had, then each line goes back through fillTextHook
   so every line stays selectable/styleable as part of its field. Extra lines shrink the type
   slightly (see MLK) so a 2-3 line value still fits roughly where one line used to sit. */
const MLK=n=>1/(1+.35*(n-1));
function drawMultiline(s,x,y,mw){
  const c=realCtx,lines=s.split('\n'),n=lines.length,k=MLK(n);
  const sz0=parseFloat(/(\d+(?:\.\d+)?)px/.exec(c.font)[1])||16,sz=sz0*k,lh=sz*1.08,y0=y-(n-1)*lh/2;
  c.save();c.font=c.font.replace(/(\d+(?:\.\d+)?)px/,sz+'px');
  lines.forEach((ln,i)=>{if(ln.trim()!=='')fillTextHook(ln,x,y0+i*lh,mw)});
  c.restore();
}
function fillTextHook(s,x,y,mw){
  s=String(s);
  if(s.indexOf('\n')>=0){drawMultiline(s,x,y,mw);return}
  const c=realCtx;
  const key=FR?matchKey(s):null;
  if(!key){mw===undefined?c.fillText(s,x,y):c.fillText(s,x,y,mw);return}
  /* which line of this field we are on, and how many it had last frame */
  const li=(FR.counts[key]||0);FR.counts[key]=li+1;
  const m=c.getTransform(),ov=FR.ov[key];
  if(ov&&ov.hide)return;   /* deleted by the person: not drawn, not clickable */
  let a=FR.anch[key];if(!a){const p=m.transformPoint(new DOMPoint(x,y));a=FR.anch[key]={x:p.x,y:p.y}}
  c.save();let M=m;
  if(ov){
    M=new DOMMatrix().translateSelf(ov.dx,ov.dy).translateSelf(a.x,a.y).rotateSelf(ov.rot).scaleSelf(ov.sc,ov.sc).translateSelf(-a.x,-a.y).multiplySelf(m);
    c.setTransform(M);
    if(ov.col)c.fillStyle=ov.col;
    if(ov.wt||ov.fam){const f=c.font,sz=parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)[1]),fm=f.slice(f.indexOf('px')+2).trim(),w0=/\b([1-9]00)\b/.exec(f);
      c.font=(ov.wt||(w0?w0[1]:(/\bbold\b/.test(f)?'700':'400')))+' '+sz+'px '+(ov.fam==='soft'?FSOFT:ov.fam==='nova'?FNOVA:fm)}
    if(ov.ls&&'letterSpacing' in c)c.letterSpacing=ov.ls+'px';
    if(ov.op!==1)c.globalAlpha*=ov.op;
  }
  const sz=parseFloat(/(\d+(?:\.\d+)?)px/.exec(c.font)[1])||0;
  let yy=y;
  if(ov&&ov.lh&&ov.lh!==1){
    const total=(LAST&&LAST.counts&&LAST.counts[key])||1;
    if(total>1)yy=y+(li-(total-1)/2)*(ov.lh-1)*sz;
  }
  if(c.globalAlpha>.05){
    let w=c.measureText(s).width;if(mw&&w>mw)w=mw;
    const al=c.textAlign,bl=c.textBaseline,x0=al==='center'?x-w/2:al==='right'?x-w:x,y0=bl==='middle'?yy-sz*.55:bl==='top'?yy:yy-sz*.8;
    FR.hits.push({key,poly:[[x0,y0],[x0+w,y0],[x0+w,y0+sz*1.1],[x0,y0+sz*1.1]].map(p=>{const q=M.transformPoint(new DOMPoint(p[0],p[1]));return [q.x,q.y]})});
  }
  mw===undefined?c.fillText(s,x,yy):c.fillText(s,x,yy,mw);
  c.restore();
}
function wrapCtx(real){
  realCtx=real;
  return new Proxy(real,{
    get(t,k){const v=t[k];
      if(k==='measureText')return s=>{s=String(s);if(s.indexOf('\n')<0)return t.measureText(s);
        /* canvas treats \n as a space, so measure a multi-line value by its widest line */
        let m=null;s.split('\n').forEach(l=>{const r=t.measureText(l);if(!m||r.width>m.width)m=r});return m};
      return typeof v==='function'?(k==='fillText'?fillTextHook:v.bind(t)):v},
    set(t,k,v){t[k]=v;return true}
  });
}
function bboxOf(poly){let a=1e9,b=1e9,c=-1e9,d=-1e9;poly.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});return{x0:a,y0:b,x1:c,y1:d}}
function textBox(key){
  if(!LAST)return null;const hs=LAST.hits.filter(h=>h.key===key);if(!hs.length)return null;
  const bs=hs.map(h=>bboxOf(h.poly));return{x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))};
}
function inPoly(poly,x,y){let r=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])r=!r}return r}
function hitText(x,y){if(!LAST)return null;for(let i=LAST.hits.length-1;i>=0;i--)if(inPoly(LAST.hits[i].poly,x,y))return LAST.hits[i].key;return null}

