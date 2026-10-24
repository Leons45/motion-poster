/* ---------- engine: state, text overrides, free canvas ---------- */
const eElastic=p=>p===0?0:p===1?1:Math.pow(2,-10*p)*Math.sin((p*10-.75)*(TAU/3))+1;
const eInOut=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const EASE={enter:eEnter,out:eOut,back:eBack,pop:ePop,elastic:eElastic,exit:eExit,move:eMove,linear:p=>p,inout:eInOut};

const FREE={id:'free',name:'Free Canvas',sub:'Build any post from layers: text, images, shapes and motion',free:true,fields:[],images:[],draw(c,W,H,t,D){drawFree(c,W,H,t,D)}};
/* Leon's own on-brand templates come first; ported and open-ended tools sit below.
   Every template also carries a campaign category (cat) so the rail can be filtered by
   event type; anything not explicitly tagged below falls back to 'classic'. */
const CAT_MAP={lcircle:'megasale',lclean:'megasale',lcallout:'megasale',lthresh:'supersale',lfinance:'financing',
  hero:'megasale',sale:'megasale',price:'megasale',versus:'megasale',compare:'megasale',
  number:'supersale',meme:'seasonal',maple:'seasonal',mascot:'seasonal',peek:'seasonal'};
const T=[...T_EVENTS.map(x=>({grp:"Leon's events",...x})),...T_LEONS.map(x=>({grp:"Leon's posts",...x})),...T_CLASSIC.map(x=>({grp:"Leon's posts",...x})),
  ...T_PREM.map(x=>({grp:"Leon's campaigns",...x})),...T_PREM2.map(x=>({grp:"Leon's campaigns",...x})),
  ...T_ADV.map(x=>({grp:"Leon's motion",...x})),
  ...T_COMM.map(x=>({grp:'Community ports',...x})),
  {grp:'Free canvas',...FREE}].map(tp=>({cat:CAT_MAP[tp.id]||'classic',...tp}));

const state={tid:'lcircle',ratio:'4:5',D:6,loops:1,fps:30,t:0,playing:true,vals:{},imgs:{},ovr:{},style:{},logo:null,rec:null,sel:null,
  logo2:{fx:'none',at:.15,dur:.9,col:'#FFE81A',scale:1},
  film:{shake:'off',grain:0,vig:0,bars:'off',leak:'off',zoom:'off'},
  quick:{},quickNextId:1,
  free:{bg:'#FFE81A',bg2:'',fx:'none',layers:[],nextId:1},layerImgs:{},prevLayers:null};
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
const OVD={dx:0,dy:0,sc:1,rot:0,col:'',wt:'',fam:'',ls:0,lh:1,op:1,sx:1,sy:1,flip:false};
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

/* ----- free canvas layers ----- */
function newLayer(type,o){
  o=o||{};const id=state.free.nextId++;
  const base={id,type,name:type,x:540,y:Hnow()/2,w:400,h:300,rot:0,op:1,vis:true,an:{in:'pop',delay:.3,dur:.6,ease:'pop',dist:160,loop:'none',lspd:1}};
  const defs={
    text:{name:'Text',text:'Your text',size:90,wt:900,fam:'nova',col:'#111111',al:'center',ls:0,lh:1.05,up:false,sk:0,skc:'#000000',sh:false,shc:'#000000',w:800},
    image:{name:'Image',w:600,h:450,fit:'contain',rad:0,shadow:30},
    logo:{name:'Logo',w:300,h:150},
    shape:{name:'Shape',shape:'rect',w:400,h:200,fill:'#000000',fill2:'',r:30,pts:12,inner:.86,stroke:0,strokec:'#ffffff'}};
  const dan=base.an,L=Object.assign(base,defs[type],o);L.an={...dan,...(o.an||{})};return L;
}
function drawShape(c,L){
  const w=L.w,h=L.h;c.beginPath();
  if(L.shape==='rect'){c.roundRect(-w/2,-h/2,w,h,L.r)}
  else if(L.shape==='circle'||L.shape==='ring'){c.ellipse(0,0,w/2,h/2,0,0,TAU)}
  else if(L.shape==='burst'){burstPath(c,0,0,w/2,h/2,L.pts,L.inner,0)}
  else if(L.shape==='star'){burstPath(c,0,0,w/2,h/2,5,.45,-Math.PI/2)}
  else if(L.shape==='leaf'){c.save();c.scale(w/2,h/2);leafPath(c);c.restore()}
  else if(L.shape==='curve'){c.moveTo(-w/2,-h/2);c.lineTo(w/2,-h/2);c.lineTo(w/2,h/2-L.r);c.quadraticCurveTo(0,h/2+L.r,-w/2,h/2-L.r);c.closePath()}
  drawShapePaint(c,L);
}
function drawShapePaint(c,L){
  if(L.shape==='ring'){c.lineWidth=Math.max(2,L.r);c.strokeStyle=L.fill;c.stroke();return}
  if(L.fill2){const g=c.createLinearGradient(0,-L.h/2,0,L.h/2);g.addColorStop(0,L.fill);g.addColorStop(1,L.fill2);c.fillStyle=g}else c.fillStyle=L.fill;
  c.fill();
  if(L.stroke>0){c.lineWidth=L.stroke;c.strokeStyle=L.strokec;c.lineJoin='round';c.stroke()}
}
function paintText(c,s,x,y,L){
  if(L.sh){c.save();c.fillStyle=L.shc;c.globalAlpha*=.35;c.fillText(s,x+L.size*.05,y+L.size*.07);c.restore()}
  if(L.sk>0){c.save();c.lineWidth=L.sk*2;c.strokeStyle=L.skc;c.lineJoin='round';c.strokeText(s,x,y);c.restore()}
  c.fillStyle=L.col;c.fillText(s,x,y);
}
function drawTextLayer(c,L,t,p){
  const a=L.an,fam=L.fam==='soft'?FSOFT:FNOVA;
  font(c,L.wt,L.size,fam);if(L.ls&&'letterSpacing' in c)c.letterSpacing=L.ls+'px';
  let txt=L.up?String(L.text).toUpperCase():String(L.text);
  if(a.in==='count')txt=countText(txt,p);
  const lines=wrap(c,txt,L.w),lh=L.size*L.lh;L._h=lines.length*lh;
  c.textBaseline='middle';c.textAlign=L.al;
  const ax=L.al==='left'?-L.w/2:L.al==='right'?L.w/2:0,y0=-L._h/2+lh/2;
  if(a.in==='typewriter'){
    let left=Math.floor(lines.join('').length*p);
    lines.forEach((l,i)=>{const k=Math.min(l.length,Math.max(0,left));left-=l.length;if(k>0)paintText(c,l.slice(0,k),ax,y0+i*lh,L)});
  }else if(a.in==='words'){
    c.textAlign='center';const sp=c.measureText(' ').width;let idx=0;
    lines.forEach((ln,li)=>{
      const ws=ln.split(' '),wd=ws.map(w=>c.measureText(w).width),tot=wd.reduce((q,r)=>q+r,0)+sp*(ws.length-1);
      let x=L.al==='center'?-tot/2:L.al==='left'?-L.w/2:L.w/2-tot;
      ws.forEach((w,wi)=>{
        const pp=prog(t,a.delay+idx*.055,a.dur);idx++;
        if(pp>0){const e=EASE[a.ease](pp),s=1+(1-e)*1.8;c.save();c.translate(x+wd[wi]/2,y0+li*lh);c.rotate((1-e)*(idx%2?.15:-.15));c.scale(s,s);c.globalAlpha*=clamp(pp*3);paintText(c,w,0,0,L);c.restore()}
        x+=wd[wi]+sp;
      });
    });
  }else if(a.in==='chars'){
    /* per-character rise, 20-40ms stagger */
    let idx=0;
    lines.forEach((ln,li)=>{
      const ch=[...ln],ws=ch.map(q=>c.measureText(q).width),tot=ws.reduce((m,n)=>m+n,0);
      let x=L.al==='left'?-L.w/2:L.al==='right'?L.w/2-tot:-tot/2;
      const oa=c.textAlign;c.textAlign='left';
      ch.forEach((q,qi)=>{const pp=prog(t,a.delay+idx*.03,.5);idx++;
        if(pp>0){const ee=eEnter(pp);c.save();c.globalAlpha*=clamp(pp*2.5);paintText(c,q,x,y0+li*lh+(1-ee)*L.size*.5,L);c.restore()}
        x+=ws[qi]});
      c.textAlign=oa;
    });
  }else if(a.in==='maskRise'){
    /* each line rises from behind its own mask */
    lines.forEach((l,i)=>{const pp=prog(t,a.delay+i*.07,a.dur||.6);if(pp<=0)return;
      const ee=eEnter(pp),yy=y0+i*lh;
      c.save();c.beginPath();c.rect(-L.w/2-20,yy-lh*.62,L.w+40,lh*1.24);c.clip();
      paintText(c,l,ax,yy+(1-ee)*lh,L);c.restore()});
  }else if(a.in==='blurIn'){
    /* focus pull: blur and fade in together */
    lines.forEach((l,i)=>{const pp=prog(t,a.delay+i*.07,a.dur||.7);if(pp<=0)return;
      const ee=eEnter(pp);c.save();c.globalAlpha*=clamp(pp*1.4);
      if('filter' in c)c.filter='blur('+((1-ee)*(L.size*.14)).toFixed(2)+'px)';
      paintText(c,l,ax,y0+i*lh,L);if('filter' in c)c.filter='none';c.restore()});
  }else lines.forEach((l,i)=>paintText(c,l,ax,y0+i*lh,L));
  if('letterSpacing' in c)c.letterSpacing='0px';
}
function drawLayer(c,L,t,D,W,H){
  if(!L.vis)return;
  const a=L.an,textOnly=['typewriter','words','count','chars','maskRise','blurIn'];
  let inn=a.in;if(L.type!=='text'&&textOnly.includes(inn))inn='fade';
  const self=['typewriter','words','count','chars','maskRise','blurIn'].includes(inn);
  const p=inn==='none'?1:prog(t,a.delay,a.dur);
  if(p<=0&&!['words','chars','maskRise','blurIn'].includes(inn))return;
  const e=(EASE[a.ease]||eOut)(p),dist=a.dist;
  let tx=0,ty=0,sc=1,rot=0,al=1,wipe=1;
  switch(self?'':inn){
    case 'fade':al=p;break;
    case 'slideUp':ty=(1-e)*dist;al=clamp(p*2.5);break;
    case 'slideDown':ty=-(1-e)*dist;al=clamp(p*2.5);break;
    case 'slideLeft':tx=-(1-e)*dist;al=clamp(p*2.5);break;
    case 'slideRight':tx=(1-e)*dist;al=clamp(p*2.5);break;
    case 'pop':sc=.25+.75*e;al=clamp(p*3);break;
    case 'zoom':sc=1+(1-e)*.9;al=p;break;
    case 'spin':rot=(1-e)*-Math.PI;sc=e;al=clamp(p*3);break;
    case 'drop':ty=-(1-e)*H*.7;al=clamp(p*4);break;
    case 'wipe':wipe=eOut(p);break;
  }
  const lt=t/D*(a.lspd||1);
  switch(a.loop){
    case 'float':ty+=Math.sin(TAU*lt)*16;break;
    case 'pulse':sc*=1+.06*Math.sin(TAU*lt);break;
    case 'sway':rot+=.07*Math.sin(TAU*lt);break;
    case 'spin':rot+=TAU*lt;break;
    case 'shake':tx+=Math.sin(TAU*lt*8)*5;break;
    case 'wiggle':rot+=.12*Math.sin(TAU*lt*3);break;
  }
  c.save();c.globalAlpha*=L.op*al;
  c.translate(L.x+tx,L.y+ty);c.rotate(L.rot*Math.PI/180+rot);c.scale(sc,sc);
  if(wipe<1){c.beginPath();c.rect(-L.w/2,-(L.type==='text'?(L._h||L.h):L.h)/2-10,L.w*wipe,(L.type==='text'?(L._h||L.h):L.h)+20);c.clip()}
  if(L.type==='text')drawTextLayer(c,L,t,p);
  else if(L.type==='shape')drawShape(c,L);
  else if(L.type==='image'){
    const img=state.layerImgs[L.id];
    if(L.rad>0||L.fit==='cover'){c.save();c.beginPath();c.roundRect(-L.w/2,-L.h/2,L.w,L.h,L.rad);c.clip();drawImg(c,img,-L.w/2,-L.h/2,L.w,L.h,{fit:L.fit,label:'Image'});c.restore()}
    else drawImg(c,img,-L.w/2,-L.h/2,L.w,L.h,{shadow:L.shadow,label:'Image'});
  }
  else if(L.type==='logo')logo(c,{},0,0,L.w,L.h);
  c.restore();
}
function drawFree(c,W,H,t,D){
  const F=state.free;
  if(F.bg2){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,F.bg);g.addColorStop(1,F.bg2);c.fillStyle=g}else c.fillStyle=F.bg;
  c.fillRect(0,0,W,H);fx(c,W,H,t,D,F.fx,0);
  F.layers.forEach(L=>drawLayer(c,L,t,D,W,H));
  fx(c,W,H,t,D,F.fx,1);
}
function layerPoly(L){
  const h=L.type==='text'?(L._h||L.size*L.lh):L.h,r=L.rot*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r);
  return [[-L.w/2,-h/2],[L.w/2,-h/2],[L.w/2,h/2],[-L.w/2,h/2]].map(p=>[L.x+p[0]*cs-p[1]*sn,L.y+p[0]*sn+p[1]*cs]);
}
function layerHandles(L){
  const poly=layerPoly(L),h=L.type==='text'?(L._h||L.size*L.lh):L.h,r=L.rot*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r),off=-h/2-70;
  return {resize:poly[2],rotate:[L.x+0*cs-off*sn,L.y+0*sn+off*cs]};
}
function hitLayer(x,y){const ls=state.free.layers;for(let i=ls.length-1;i>=0;i--){const L=ls[i];if(L.vis&&inPoly(layerPoly(L),x,y))return L}return null}
const selLayer=()=>state.sel&&state.sel.type==='layer'?state.free.layers.find(l=>l.id===state.sel.id):null;

/* ----- presets ----- */
const Y='#FFE81A';
const PRESETS={
 'Blank yellow':()=>{state.free.bg=Y;state.free.bg2='';state.free.fx='none';return []},
 'Blank black':()=>{state.free.bg='#000000';state.free.bg2='';state.free.fx='none';return []},
 'Sale poster':()=>{state.free.bg='#000000';state.free.bg2='';state.free.fx='none';return [
  newLayer('shape',{name:'Yellow arc',shape:'circle',x:540,y:1560,w:2300,h:1100,fill:Y,an:{in:'slideUp',delay:.1,dur:.9,dist:600,ease:'out'}}),
  newLayer('logo',{name:'Logo',x:540,y:105,w:230,h:115,an:{in:'pop',delay:0}}),
  newLayer('text',{name:'Headline',text:'SUPER SOFA SALE!',x:540,y:270,w:1000,size:88,col:'#FFFFFF',fam:'soft',an:{in:'words',delay:.3,dur:.5,ease:'back'}}),
  newLayer('text',{name:'Prefix',text:'UP TO',x:540,y:395,w:600,size:54,col:'#FFFFFF',fam:'soft',an:{in:'fade',delay:.9}}),
  newLayer('text',{name:'Offer',text:'50% OFF',x:540,y:560,w:1040,size:190,col:Y,fam:'soft',an:{in:'count',delay:1.0,dur:1.0,ease:'out'}}),
  newLayer('text',{name:'Sub line',text:'SELECT SOFAS',x:540,y:730,w:900,size:60,col:'#FFFFFF',fam:'nova',an:{in:'slideUp',delay:1.5,dist:60,ease:'out'}}),
  newLayer('image',{name:'Product A',x:300,y:1080,w:520,h:400,an:{in:'slideRight',delay:.8,dist:700,ease:'out'}}),
  newLayer('image',{name:'Product B',x:790,y:1080,w:520,h:400,an:{in:'slideLeft',delay:1.0,dist:700,ease:'out'}})]},
 'Announcement':()=>{state.free.bg=Y;state.free.bg2='';state.free.fx='none';return [
  newLayer('shape',{name:'Maple leaf',shape:'leaf',x:540,y:675,w:1000,h:1080,fill:'#FFFFFF',an:{in:'spin',delay:.1,dur:1.0,ease:'back',loop:'pulse',lspd:2}}),
  newLayer('logo',{name:'Logo',x:540,y:300,w:230,h:115,an:{in:'pop',delay:.7}}),
  newLayer('text',{name:'Line 1',text:'SUPER',x:540,y:520,w:900,size:200,col:'#C8102E',fam:'soft',an:{in:'pop',delay:.9}}),
  newLayer('text',{name:'Line 2',text:'SOLDE',x:540,y:700,w:900,size:200,col:'#C8102E',fam:'soft',an:{in:'pop',delay:1.05}}),
  newLayer('text',{name:'Sub',text:'VRAI NORD',x:540,y:850,w:700,size:54,col:'#C8102E',fam:'nova',an:{in:'fade',delay:1.25}}),
  newLayer('text',{name:'CTA',text:'EN COURS!',x:540,y:1000,w:700,size:66,col:'#111111',fam:'nova',an:{in:'pop',delay:1.45,loop:'pulse',lspd:2}})]},
 'Product spotlight':()=>{state.free.bg=Y;state.free.bg2='#F5C900';state.free.fx='sparkle';return [
  newLayer('logo',{name:'Logo',x:540,y:100,w:230,h:115,an:{in:'pop',delay:0}}),
  newLayer('text',{name:'Headline',text:'MEET YOUR NEW FAVOURITE',x:540,y:250,w:900,size:70,col:'#111111',fam:'nova',an:{in:'slideDown',delay:.2,dist:80,ease:'out'}}),
  newLayer('image',{name:'Product',x:540,y:690,w:880,h:640,an:{in:'drop',delay:.6,dur:.9,ease:'back',loop:'float'}}),
  newLayer('shape',{name:'Price tag',shape:'rect',x:540,y:1130,w:560,h:200,r:36,fill:'#000000',an:{in:'slideUp',delay:1.3,dist:300,ease:'out'}}),
  newLayer('text',{name:'Price',text:'$649',x:540,y:1115,w:520,size:130,col:'#FFFFFF',fam:'soft',an:{in:'count',delay:1.4,dur:.8,ease:'out'}}),
  newLayer('text',{name:'Name',text:'Avery Sofa',x:540,y:1235,w:700,size:54,col:'#111111',fam:'nova',an:{in:'fade',delay:1.8}})]},
 'Character meme':()=>{state.free.bg=Y;state.free.bg2='';state.free.fx='leaves';return [
  newLayer('text',{name:'Headline',text:'Me on Monday morning:',x:540,y:140,w:900,size:80,col:'#111111',fam:'nova',an:{in:'slideDown',delay:.2,dist:80,ease:'out'}}),
  newLayer('image',{name:'Character',x:540,y:830,w:820,h:1000,an:{in:'pop',delay:.6,dur:1.0,ease:'back',loop:'sway'}})]}
};
