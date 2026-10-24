/* ---------- UI ---------- */
const cv=$('#cv'),ovc=$('#ov'),ctx=cv.getContext('2d'),octx=ovc.getContext('2d');
const PC=wrapCtx(ctx);
let hover=null,drag=null,GUIDE={x:false,y:false};

function fitStage(){
  const st=$('#stage'),H=Hnow(),aw=Math.max(180,st.clientWidth-32),ah=Math.min(innerHeight*.74,880),s=Math.min(aw/W,ah/H);
  const wr=$('#cvwrap');wr.style.width=Math.round(W*s)+'px';wr.style.height=Math.round(H*s)+'px';
}
addEventListener('resize',fitStage);

function render(){
  const tp=cur(),H=Hnow();
  if(cv.height!==H){cv.height=H;ovc.height=H;fitStage()}
  ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,W,H);ctx.save();
  NT=state.t;ND=state.D;
  filmPre(ctx,W,H,state.t,state.D,state.film,!!state.sel&&!state.rec);
  if(tp.free){FR=null;LAST=null;drawFree(ctx,W,H,state.t,state.D)}
  else{FR=buildFR(tp);tp.draw(PC,W,H,state.t,state.D,state.vals[tp.id],state.imgs[tp.id]);drawQuickElements(PC,W,H,state.t,tp.id);LAST=FR;FR=null}
  ctx.restore();
  filmPost(ctx,W,H,state.t,state.D,state.film);
  drawOverlay();
}
const clampV=(v,a,b)=>Math.max(a,Math.min(b,v));
function sHandles(b){const H=Hnow();return{del:[clampV(b.x1+14,24,W-24),clampV(b.y0-14,24,H-24)],resize:[clampV(b.x1+10,24,W-24),clampV(b.y1+10,24,H-24)],rotate:[clampV((b.x0+b.x1)/2,30,W-30),clampV(b.y0-70,30,H-30)]}}
function outline(pts,w,col,dash){octx.save();octx.beginPath();pts.forEach((p,i)=>i?octx.lineTo(p[0],p[1]):octx.moveTo(p[0],p[1]));octx.closePath();octx.lineWidth=w;octx.strokeStyle=col;if(dash)octx.setLineDash(dash);octx.stroke();octx.restore()}
const boxPts=(b,pad)=>[[b.x0-pad,b.y0-pad],[b.x1+pad,b.y0-pad],[b.x1+pad,b.y1+pad],[b.x0-pad,b.y1+pad]];
function layerDel(L){const p=layerPoly(L)[1],H=Hnow();return [clampV(p[0]+16,24,W-24),clampV(p[1]-16,24,H-24)]}
function drawDel(p){
  octx.save();octx.fillStyle='#D92D20';octx.strokeStyle='#fff';octx.lineWidth=5;octx.beginPath();octx.arc(p[0],p[1],20,0,TAU);octx.fill();octx.stroke();
  octx.strokeStyle='#fff';octx.lineWidth=5;octx.lineCap='round';octx.beginPath();octx.moveTo(p[0]-8,p[1]-8);octx.lineTo(p[0]+8,p[1]+8);octx.moveTo(p[0]+8,p[1]-8);octx.lineTo(p[0]-8,p[1]+8);octx.stroke();octx.restore();
}
function drawOverlay(){
  const H=Hnow();octx.clearRect(0,0,W,H);if(state.rec)return;
  if(SAFE)drawSafe(H);
  const tp=cur();
  if(tp.free){
    const L=selLayer(),hv=hover&&hover.type==='layer'?state.free.layers.find(l=>l.id===hover.id):null;
    if(hv&&hv!==L)outline(layerPoly(hv),3,'rgba(37,99,235,.7)');
    if(L){const pp=layerPoly(L),h=layerHandles(L);outline(pp,8,'#fff');outline(pp,4,'#2563EB',[16,10]);
      octx.save();octx.fillStyle='#fff';octx.strokeStyle='#2563EB';octx.lineWidth=5;
      octx.beginPath();octx.rect(h.resize[0]-15,h.resize[1]-15,30,30);octx.fill();octx.stroke();
      const top=[(pp[0][0]+pp[1][0])/2,(pp[0][1]+pp[1][1])/2];octx.beginPath();octx.moveTo(top[0],top[1]);octx.lineTo(h.rotate[0],h.rotate[1]);octx.stroke();
      octx.beginPath();octx.arc(h.rotate[0],h.rotate[1],16,0,TAU);octx.fill();octx.stroke();octx.restore();drawDel(layerDel(L))}
  }else{
    const hb=hover&&hover.type==='text'?textBox(hover.key):null;
    if(hb&&!(state.sel&&state.sel.key===hover.key))outline(boxPts(hb,8),3,'rgba(37,99,235,.7)');
    const sb=state.sel&&state.sel.type==='text'?textBox(state.sel.key):null;
    if(sb){outline(boxPts(sb,10),8,'#fff');outline(boxPts(sb,10),4,'#2563EB',[16,10]);
      const hd=sHandles(sb);octx.save();octx.fillStyle='#fff';octx.strokeStyle='#2563EB';octx.lineWidth=5;
      octx.beginPath();octx.rect(hd.resize[0]-15,hd.resize[1]-15,30,30);octx.fill();octx.stroke();
      octx.beginPath();octx.moveTo((sb.x0+sb.x1)/2,sb.y0-10);octx.lineTo(hd.rotate[0],hd.rotate[1]);octx.stroke();
      octx.beginPath();octx.arc(hd.rotate[0],hd.rotate[1],16,0,TAU);octx.fill();octx.stroke();octx.restore();drawDel(hd.del)}
  }
  if(GUIDE.x||GUIDE.y){octx.save();octx.strokeStyle='#E4262C';octx.lineWidth=3;octx.setLineDash([12,8]);
    if(GUIDE.x){octx.beginPath();octx.moveTo(W/2,0);octx.lineTo(W/2,H);octx.stroke()}
    if(GUIDE.y){octx.beginPath();octx.moveTo(0,H/2);octx.lineTo(W,H/2);octx.stroke()}octx.restore()}
}

/* ----- undo / redo ----- */
const HIST={past:[],future:[],last:null};let REPLAY=false;
function snapState(){
  return JSON.stringify({tid:state.tid,ratio:state.ratio,D:state.D,loops:state.loops,fps:state.fps,
    vals:state.vals,ovr:state.ovr,style:state.style,logo2:state.logo2,film:state.film,quick:state.quick,quickNextId:state.quickNextId,
    free:{bg:state.free.bg,bg2:state.free.bg2,fx:state.free.fx,nextId:state.free.nextId,
      layers:state.free.layers.map(l=>{const o={...l};delete o._h;return o})}});
}
function histPush(){
  if(REPLAY)return;
  const s=snapState();if(s===HIST.last)return;
  if(HIST.last!==null){HIST.past.push(HIST.last);if(HIST.past.length>80)HIST.past.shift();HIST.future.length=0}
  HIST.last=s;histBtns();
}
function histApply(s){
  const d=JSON.parse(s);REPLAY=true;
  state.ratio=d.ratio;state.D=d.D;state.loops=d.loops;state.fps=d.fps;
  Object.keys(d.vals||{}).forEach(id=>{if(state.vals[id])Object.assign(state.vals[id],d.vals[id])});
  state.ovr=d.ovr||{};state.style=d.style||{};Object.assign(state.logo2,d.logo2||{});Object.assign(state.film,d.film||{});
  state.quick=d.quick||{};state.quickNextId=d.quickNextId||1;
  Object.assign(state.free,{bg:d.free.bg,bg2:d.free.bg2,fx:d.free.fx,nextId:d.free.nextId,layers:d.free.layers||[]});
  if(state.sel&&state.sel.type==='layer'&&!state.free.layers.some(l=>l.id===state.sel.id))state.sel=null;
  const sameTpl=state.tid===d.tid;state.tid=d.tid;
  document.querySelectorAll('.tpl-item').forEach(b=>b.classList.toggle('active',b.dataset.id===d.tid));
  if(!sameTpl)state.sel=null;
  $('#dur').value=state.D;$('#durOut').textContent=state.D+'s';
  $('#ratioSeg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.r===state.ratio));
  $('#ratioNote').textContent=RNOTE[state.ratio];fitStage();
  buildInspector();REPLAY=false;persist();histBtns();
}
/* an action is committed to history ~0.7s after it happens; Undo/Redo must commit it first or they jump one step too far */
function flushPending(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null;persist()}}
function undo(){flushPending();if(!HIST.past.length)return;HIST.future.push(HIST.last);HIST.last=HIST.past.pop();histApply(HIST.last)}
function redo(){flushPending();if(!HIST.future.length)return;HIST.past.push(HIST.last);HIST.last=HIST.future.pop();histApply(HIST.last)}
function histBtns(){const u=$('#undoBtn'),r=$('#redoBtn');if(u)u.disabled=!HIST.past.length;if(r)r.disabled=!HIST.future.length}

/* ----- persistence ----- */
let saveTimer=null;
function dirty(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,700);if(typeof scheduleCheck==='function')scheduleCheck();if(typeof paintActiveThumb==='function')paintActiveThumb()}
function persist(){
  saveTimer=null;histPush();
  try{localStorage.setItem('mps_state',JSON.stringify({tid:state.tid,ratio:state.ratio,D:state.D,vals:state.vals,ovr:state.ovr,style:state.style,logo2:state.logo2,film:state.film,
    quick:state.quick,quickNextId:state.quickNextId,
    free:{bg:state.free.bg,bg2:state.free.bg2,fx:state.free.fx,nextId:state.free.nextId,layers:state.free.layers.map(l=>{const o={...l};delete o._h;return o})}}))}catch(e){}
}
function restore(){
  try{const d=JSON.parse(localStorage.getItem('mps_state')||'null');if(!d)return;
    if(T.find(x=>x.id===d.tid))state.tid=d.tid;if(RATIOS[d.ratio])state.ratio=d.ratio;if(d.D>=3&&d.D<=12)state.D=d.D;
    Object.keys(d.vals||{}).forEach(id=>{if(state.vals[id])Object.keys(d.vals[id]).forEach(k=>{if(k in state.vals[id])state.vals[id][k]=d.vals[id][k]})});
    state.ovr=d.ovr||{};state.style=d.style||{};
    state.quick=d.quick||{};state.quickNextId=d.quickNextId||1;
    if(d.logo2)Object.assign(state.logo2,d.logo2);if(d.film)Object.assign(state.film,d.film);
    if(d.free){Object.assign(state.free,{bg:d.free.bg,bg2:d.free.bg2,fx:d.free.fx,nextId:d.free.nextId||1,layers:d.free.layers||[]})}
  }catch(e){}
}

/* ----- generic control ----- */
function ctl(parent,label,type,obj,key,o){
  o=o||{};const wrap=el('label','fld'),sp=el('span','',label);wrap.append(sp);let inp;
  if(type==='select'){inp=el('select');o.o.forEach(v=>{const op=el('option');op.value=Array.isArray(v)?v[0]:v;op.textContent=Array.isArray(v)?v[1]:v;inp.append(op)})}
  else if(type==='area'){inp=el('textarea');
    if(o.auto){
      /* single-line-looking content fields that still accept Enter for a line break; the box
         grows with its content (up to a cap) so it reads like the input it replaced */
      inp.className='auto';inp.title='Press Enter for a new line';
      inp.rows=Math.max(1,String(obj[key]==null?'':obj[key]).split('\n').length);
      const grow=()=>{inp.style.height='auto';if(inp.scrollHeight)inp.style.height=Math.min(inp.scrollHeight+2,220)+'px'};
      inp.addEventListener('input',grow);o.afterAttach=()=>requestAnimationFrame(grow);
    }else inp.rows=2}
  else{inp=el('input');inp.type=type==='color'?'color':type==='number'?'number':type==='range'?'range':type==='check'?'checkbox':'text';
    if(o.min!=null)inp.min=o.min;if(o.max!=null)inp.max=o.max;if(o.step!=null)inp.step=o.step}
  const show=()=>{if(type==='range')sp.textContent=label+': '+Math.round(parseFloat(inp.value)*100)/100};
  if(type==='check')inp.checked=!!obj[key];else inp.value=obj[key]===''&&type==='color'?'#000000':obj[key];
  show();
  inp.addEventListener('input',()=>{let v=type==='check'?inp.checked:inp.value;if(type==='number'||type==='range'){v=parseFloat(v);if(isNaN(v))return}obj[key]=v;show();if(o.on)o.on(v);dirty()});
  if(o.focus)inp.addEventListener('focus',o.focus);
  if(type==='check'){wrap.className='fld chk';wrap.prepend(inp)}else wrap.append(inp);
  if(type==='color'&&!o.noSwatches){
    const sr=el('div','swrow');
    BG_PRESETS.forEach(([hex,name])=>{const b=el('button','sw');b.type='button';b.style.background=hex;b.title=name;b.setAttribute('aria-label',name);
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();inp.value=hex;inp.dispatchEvent(new Event('input',{bubbles:true}))});sr.append(b)});
    wrap.append(sr);
  }
  if(o.wrapKey!=null)wrap.dataset.key=o.wrapKey;
  parent.append(wrap);if(o.afterAttach)o.afterAttach();return inp;
}
const row2=p=>{const r=el('div','row2');p.append(r);return r};
function btn(parent,label,fn,cls){const b=el('button','btn sm'+(cls?' '+cls:''),label);b.type='button';b.addEventListener('click',fn);parent.append(b);return b}

/* ----- selection ----- */
function select(sel,opts){
  state.sel=sel;buildSelPanel();
  if(cur().free)buildLayers();
  /* opts.silent: selecting by focusing the Content field on the right already puts the
     person right where they need to be, so don't also scroll/flash the panel at them —
     that's only useful when the selection came from clicking the artboard. */
  if(!(opts&&opts.silent))highlightSel(sel);
}
/* Flash the inspector section(s) that control whatever was just selected on the canvas,
   so the person can find the right knob without hunting through the whole panel. */
function flashEl(node){
  if(!node)return;
  node.classList.remove('flash-hl');void node.offsetWidth;node.classList.add('flash-hl');
  clearTimeout(node._flashT);node._flashT=setTimeout(()=>node.classList.remove('flash-hl'),1300);
}
function highlightSel(sel){
  if(!sel)return;
  const sect=document.getElementById('sectSel');
  setTab('object');
  if(sect)flashEl(sect);
  if(sel.type==='text'&&!sel.key.startsWith('obj:')){
    const row=document.querySelector('#fields [data-key="'+CSS.escape(sel.key)+'"]');
    if(row)flashEl(row);
  }
}
/* ----- right panel: tabs and collapsible cards ----- */
let curTab='content';
function setTab(name){
  curTab=name;
  document.querySelectorAll('#tabs button').forEach(b=>{const on=b.dataset.tab===name;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  document.querySelectorAll('#insp .pane').forEach(p=>p.hidden=p.dataset.pane!==name);
  const tb=document.getElementById('tabBody');if(tb)tb.scrollTop=0;
}
const CARD_OPEN={};
function card(parent,title,open,id){
  id=id||title;const d=el('details','card');d.open=id in CARD_OPEN?CARD_OPEN[id]:open;
  d.append(el('summary','',title));d.addEventListener('toggle',()=>{CARD_OPEN[id]=d.open});
  const b=el('div','cardbody');d.append(b);parent.append(d);return b;
}
/* turn a flat run of controls (split by <h3> headings) into collapsible cards */
function regroup(box,firstTitle){
  const kids=[...box.childNodes];box.innerHTML='';let body=card(box,firstTitle,true,'L:'+firstTitle);
  kids.forEach(k=>{
    if(k.tagName==='H3'){body=card(box,k.textContent,true,'L:'+k.textContent);return}
    if(k.classList&&(k.classList.contains('selname')||k.classList.contains('selhead'))){box.insertBefore(k,box.firstChild);return}
    body.append(k);
  });
}
document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{
  if(b.dataset.tab==='content'||b.dataset.tab==='object')buildFields();   /* both show the template colours: keep them in step */
  setTab(b.dataset.tab);if(b.dataset.tab==='object')buildSelPanel();
}));
/* ----- delete / restore ----- */
let toastT=null;
function toast(msg){setStatus(msg,'ok');clearTimeout(toastT);toastT=setTimeout(refreshStatus,5000)}
function selLabel(){
  const tp=cur(),s=state.sel;if(tp.free){const L=selLayer();return L?(L.name||L.type):''}
  if(!s||s.type!=='text')return '';return s.key.startsWith('obj:')?objLabel(s.key):((tp.fields.find(f=>f.k===s.key)||{}).l||s.key);
}
function deleteSelected(){
  if(state.rec)return;const tp=cur(),nm=selLabel();
  if(tp.free){const L=selLayer();if(!L)return;delLayer(L.id);buildLayers();toast('Deleted \u201c'+nm+'\u201d. Press Undo to bring it back.');return}
  const s=state.sel;if(!s||s.type!=='text')return;
  if(s.key.startsWith('obj:Quick')){delQuick(tp.id,+s.key.slice(9));select(null);buildQuick();dirty();toast('Deleted \u201c'+nm+'\u201d. Press Undo to bring it back.');return}
  ovFor(tp.id,s.key,true).hide=true;select(null);dirty();buildSelPanel();
  toast('Removed \u201c'+nm+'\u201d. Press Undo, or Restore in the Object tab, to bring it back.');
}
const hiddenKeys=tp=>Object.entries(state.ovr[ovKey(tp.id)]||{}).filter(([k,o])=>o&&o.hide).map(([k])=>k);
const keyLabel=(tp,k)=>k.startsWith('obj:')?objLabel(k):((tp.fields.find(f=>f.k===k)||{}).l||k);
function removedList(box,tp){
  const ks=hiddenKeys(tp);if(!ks.length)return;
  const g=card(box,'Removed from this post ('+ks.length+')',true,'removed'),w=el('div','btnrow');
  ks.forEach(k=>btn(w,'Restore '+keyLabel(tp,k),()=>{ovFor(tp.id,k,true).hide=false;dirty();buildSelPanel()}));
  if(ks.length>1)btn(w,'Restore all',()=>{ks.forEach(k=>ovFor(tp.id,k,true).hide=false);dirty();buildSelPanel()},'primary');
  g.append(w);
}
function selHead(box,name){
  const r=el('div','selhead');r.append(el('p','selname',name));
  const d=el('button','btn sm danger','Delete');d.type='button';d.title='Delete this (Delete key). Undo brings it back.';d.addEventListener('click',deleteSelected);r.append(d);box.append(r);
}
const WEIGHTS=[['','Template default'],['300','Light 300'],['400','Regular 400'],['500','Medium 500'],['600','Semibold 600'],['700','Bold 700'],['800','Extrabold 800'],['900','Black 900']];
function objDot(on){const d=document.getElementById('objDot');if(d)d.hidden=!on}
/* template colour fields (masthead, accent, background...) shown beside the selected object,
   the ones most likely to colour that object first, so nothing needs a trip back to Content */
function objColours(box,tp,sel,isObj){
  const cf=tp.fields.filter(f=>f.t==='color');if(!cf.length)return;
  const k=sel.key.toLowerCase(),pref=[];
  if(/mast/.test(k))pref.push('mcol');
  if(/footer|price|badge|seal|stamp|button|burst|ribbon|tag|ticket|coupon|pill|band|corner|bar|dot|leaf|stat|step|feature|toggle|code|burst/.test(k))pref.push('acc','panel','c1');
  if(/card|panel|polaroid|flyer|frame|avatar|ticket/.test(k))pref.push('ink','panel','acc');
  if(/photo|image|background|bg|cutout|character/.test(k))pref.push('bg','bg1');
  const rank=f=>{const i=pref.indexOf(f.k);return i<0?99:i};
  const list=[...cf].sort((a,b)=>rank(a)-rank(b)),v=state.vals[tp.id];
  const g=card(box,isObj?'Colours':'Template colours',isObj,'selcols'+(isObj?'O':'T')),grid=el('div','cgrid');g.append(grid);
  list.forEach(f=>ctl(grid,f.l,'color',v,f.k));
}
function buildSelPanel(){
  const box=$('#selPanel');box.innerHTML='';const tp=cur(),sel=state.sel;
  if(tp.free){
    const L=selLayer();objDot(!!L);
    if(!L){box.append(el('p','note','Click a layer on the canvas or in the list to edit it. Drag to move, use the square handle to resize and the round handle to rotate.'));return}
    buildLayerProps(box,L);regroup(box,'Position & look');return;
  }
  objDot(!!(sel&&sel.type==='text'));
  if(!sel||sel.type!=='text'){box.append(el('p','note','Click any text, photo, badge or logo on the canvas to edit it here: position, size, colours, typeface and more.'));removedList(box,tp);objPicker(box);return}
  const isObj=sel.key.startsWith('obj:'),f=tp.fields.find(x=>x.k===sel.key),ov=ovFor(tp.id,sel.key,true);
  /* Typography (weight/typeface/colour/spacing/opacity) is stored per template, shared
     across every ratio, so it's only created, and only read, for text selections. */
  const sov=!isObj?styleFor(tp.id,sel.key,true):null;
  selHead(box,isObj?objLabel(sel.key):(f?f.l:sel.key));
  const proxy={get pct(){return Math.round(ov.sc*100)},set pct(v){ov.sc=v/100},get opp(){return Math.round((isObj?ov:sov).op*100)},set opp(v){(isObj?ov:sov).op=v/100},
    get wp(){return Math.round((ov.sx||1)*100)},set wp(v){ov.sx=v/100},get hp(){return Math.round((ov.sy||1)*100)},set hp(v){ov.sy=v/100}};
  const g1=card(box,'Position & size',true,'pos');
  const r=row2(g1);ctl(r,'Move X','number',ov,'dx',{step:1});ctl(r,'Move Y','number',ov,'dy',{step:1});
  const r1=row2(g1);ctl(r1,'Size %','range',proxy,'pct',{min:10,max:500,step:1});ctl(r1,'Rotation','range',ov,'rot',{min:-180,max:180,step:1});
  if(isObj){const r3=row2(g1);ctl(r3,'Stretch W %','range',proxy,'wp',{min:20,max:300,step:1});ctl(r3,'Stretch H %','range',proxy,'hp',{min:20,max:300,step:1})}
  ctl(g1,'Opacity %','range',proxy,'opp',{min:0,max:100,step:1});
  if(isObj)ctl(g1,'Flip horizontally','check',ov,'flip');
  if(!isObj){
    const g2=card(box,'Text style',true,'tstyle');
    const r2=row2(g2);ctl(r2,'Weight','select',sov,'wt',{o:WEIGHTS});ctl(r2,'Typeface','select',sov,'fam',{o:[['','Template default'],['nova','Proxima Nova'],['soft','Proxima Soft']]});
    const cr=row2(g2);ctl(cr,'Text colour','color',sov,'col');
    const rb=el('div');rb.style.alignSelf='end';rb.style.paddingBottom='8px';btn(rb,'Default colour',()=>{sov.col='';buildSelPanel();dirty()});cr.append(rb);
    ctl(g2,'Letter spacing','range',sov,'ls',{min:-10,max:40,step:1});
    ctl(g2,'Line spacing','range',sov,'lh',{min:.6,max:2.2,step:.05});
    g2.append(el('p','note','Style applies to every aspect ratio of this post. Position, size and rotation stay per ratio.'));
  }
  objColours(box,tp,sel,isObj);
  const b=el('div','btnrow');btn(b,isObj?'Reset this object':'Reset this text',()=>{Object.assign(ov,OVD);if(sov)Object.assign(sov,STD);buildSelPanel();dirty()});
  btn(b,'Reset everything',()=>{state.ovr[ovKey(tp.id)]={};state.style[tp.id]={};buildSelPanel();dirty()});
  if(sel.key.startsWith('obj:Quick')){
    const qid=+sel.key.slice(9);
    btn(b,'Remove element',()=>{delQuick(tp.id,qid);select(null);buildQuick();dirty()});
  }
  box.append(b);
  objPicker(box);
}
const OBJ_NAMES={'obj:Logo':'Logo','obj:Seal':'Best Seller badge','obj:Canada':'Made in Canada badge',
  'obj:Masthead':'Masthead block','obj:Footer':'Footer band','obj:Stamp badge':'Stamp badge','obj:Price card':'Price/name card'};
function objLabel(k){
  if(OBJ_NAMES[k])return OBJ_NAMES[k];
  if(k.startsWith('obj:Quick')){
    const id=+k.slice(9),tp=cur(),list=state.quick[ovKey(tp.id)]||[],e=list.find(x=>x.id===id);
    if(e&&QUICK_KINDS[e.kind])return QUICK_KINDS[e.kind].name;
  }
  return k.slice(4);
}
function objPicker(box){
  const tp0=cur(),ks=((LAST&&LAST.objs)||[]).filter(k=>!((ovFor(tp0.id,k)||{}).hide));if(!ks.length)return;
  const g=card(box,'Pick another object',!state.sel,'picker'),w=el('div','btnrow');
  ks.forEach(k=>btn(w,objLabel(k),()=>select({type:'text',key:k})));g.append(w);
}

/* ----- layers ----- */
const ADD=[['text','Text'],['headline','Headline (big text)'],['image','Image'],['logo','Leon\u2019s logo'],['best','Best Seller seal'],['canada','Made in Canada'],['rect','Rectangle'],['pill','Pill'],['circle','Circle'],['burst','Burst'],['star','Star'],['leaf','Maple leaf'],['curve','Curve band'],['ring','Ring']];
function addLayer(kind){
  const H=Hnow(),n=state.free.layers.length,dl=Math.min(2,.3+n*.12);let L;
  if(kind==='text')L=newLayer('text',{});
  else if(kind==='headline')L=newLayer('text',{name:'Headline',text:'HEADLINE',size:200,fam:'soft',w:980});
  else if(kind==='image')L=newLayer('image',{});
  else if(kind==='logo')L=newLayer('logo',{});
  else if(kind==='best'||kind==='canada'){
    const im=BRAND[kind],ar=im&&im.naturalWidth?im.naturalHeight/im.naturalWidth:1;
    const w=kind==='best'?300:420;
    L=newLayer('image',{name:kind==='best'?'Best Seller seal':'Made in Canada',w,h:Math.round(w*ar),fit:'contain',shadow:0});
  }
  else{const sp={rect:{shape:'rect',name:'Rectangle'},pill:{shape:'rect',name:'Pill',w:520,h:120,r:60},circle:{shape:'circle',name:'Circle',w:360,h:360,fill:Y},burst:{shape:'burst',name:'Burst',w:460,h:460,fill:Y,pts:16},star:{shape:'star',name:'Star',w:360,h:360,fill:Y},leaf:{shape:'leaf',name:'Maple leaf',w:520,h:560,fill:'#FFFFFF'},curve:{shape:'curve',name:'Curve band',w:1080,h:700,r:120,x:540,y:350},ring:{shape:'ring',name:'Ring',w:420,h:420,fill:'#111111',r:12}}[kind];L=newLayer('shape',sp)}
  L.y=L.y===H/2||L.y===675?H/2:L.y;L.an.delay=dl;
  state.free.layers.push(L);if(kind==='best'||kind==='canada')state.layerImgs[L.id]=BRAND[kind];select({type:'layer',id:L.id});dirty();
}
function delLayer(id){const ls=state.free.layers,i=ls.findIndex(l=>l.id===id);if(i<0)return;ls.splice(i,1);select(null);dirty()}
function dupLayer(id){const L=state.free.layers.find(l=>l.id===id);if(!L)return;const c={...L,an:{...L.an},id:state.free.nextId++,name:L.name+' copy',x:L.x+40,y:L.y+40};delete c._h;
  state.free.layers.push(c);if(state.layerImgs[id])state.layerImgs[c.id]=state.layerImgs[id];select({type:'layer',id:c.id});dirty()}
function moveLayer(id,dir){const ls=state.free.layers,i=ls.findIndex(l=>l.id===id),j=i+dir;if(i<0||j<0||j>=ls.length)return;[ls[i],ls[j]]=[ls[j],ls[i]];buildLayers();dirty()}
function buildLayers(){
  const box=$('#layerList');box.innerHTML='';
  [...state.free.layers].reverse().forEach(L=>{
    const r=el('div','lrow'+(state.sel&&state.sel.id===L.id?' on':''));
    r.append(el('span','ltype',L.type==='text'?'T':L.type==='image'?'IMG':L.type==='logo'?'LOGO':'SH'),el('span','nm',L.name||L.type));
    const v=el('button','btn xs',L.vis?'Hide':'Show');v.type='button';v.addEventListener('click',e=>{e.stopPropagation();L.vis=!L.vis;buildLayers();dirty()});
    const up=el('button','btn xs','Up');up.type='button';up.addEventListener('click',e=>{e.stopPropagation();moveLayer(L.id,1)});
    const dn=el('button','btn xs','Down');dn.type='button';dn.addEventListener('click',e=>{e.stopPropagation();moveLayer(L.id,-1)});
    r.append(up,dn,v);r.addEventListener('click',()=>select({type:'layer',id:L.id}));box.append(r);
  });
  if(!state.free.layers.length)box.append(el('p','note','No layers yet. Add one below or start from a preset.'));
}
const ANIN=[['none','None (always visible)'],['fade','Fade'],['slideUp','Slide up'],['slideDown','Slide down'],['slideLeft','Slide from left'],['slideRight','Slide from right'],['pop','Pop'],['zoom','Zoom in'],['spin','Spin in'],['drop','Drop from top'],['wipe','Wipe reveal'],['maskRise','Mask rise (text)'],['blurIn','Blur in (text)'],['chars','Letter by letter (text)'],['typewriter','Typewriter (text)'],['words','Word slam (text)'],['count','Count up (text with numbers)']];
const ANLOOP=[['none','None'],['float','Float'],['pulse','Pulse'],['sway','Sway'],['wiggle','Wiggle'],['shake','Shake'],['spin','Spin']];
function buildLayerProps(box,L){
  selHead(box,(L.name||L.type));
  ctl(box,'Layer name','text',L,'name',{on:()=>buildLayers()});
  const r=row2(box);ctl(r,'X','number',L,'x',{step:1});ctl(r,'Y','number',L,'y',{step:1});
  const r2=row2(box);ctl(r2,L.type==='text'?'Wrap width':'Width','number',L,'w',{step:1});if(L.type!=='text')ctl(r2,'Height','number',L,'h',{step:1});
  ctl(box,'Rotation (degrees)','range',L,'rot',{min:-180,max:180,step:1});
  const proxy={get pct(){return Math.round(L.op*100)},set pct(v){L.op=v/100}};ctl(box,'Opacity %','range',proxy,'pct',{min:0,max:100,step:1});
  if(L.type==='text'){
    box.append(el('h3','','Text'));
    ctl(box,'Text','area',L,'text');
    ctl(box,'Size','range',L,'size',{min:16,max:600,step:1});
    const a=row2(box);ctl(a,'Weight','select',L,'wt',{o:WEIGHTS.slice(1).map(w=>[+w[0],w[1]])});ctl(a,'Typeface','select',L,'fam',{o:[['nova','Proxima Nova'],['soft','Proxima Soft']]});
    const b=row2(box);ctl(b,'Colour','color',L,'col');ctl(b,'Align','select',L,'al',{o:['left','center','right']});
    ctl(box,'Letter spacing','range',L,'ls',{min:-10,max:40,step:1});ctl(box,'Line spacing','range',L,'lh',{min:.6,max:2.2,step:.05});
    ctl(box,'Uppercase','check',L,'up');
    const c2=row2(box);ctl(c2,'Outline width','number',L,'sk',{min:0,max:40,step:1});ctl(c2,'Outline colour','color',L,'skc');
    const c3=row2(box);ctl(c3,'Drop shadow','check',L,'sh');ctl(c3,'Shadow colour','color',L,'shc');
  }
  if(L.type==='shape'){
    box.append(el('h3','','Shape'));
    ctl(box,'Shape','select',L,'shape',{o:['rect','circle','burst','star','leaf','curve','ring'],on:()=>buildSelPanel()});
    const a=row2(box);ctl(a,'Fill','color',L,'fill');ctl(a,'Gradient to','color',L,'fill2');
    btn(box,'Clear gradient',()=>{L.fill2='';buildSelPanel();dirty()});
    ctl(box,L.shape==='ring'?'Ring thickness':L.shape==='curve'?'Curve depth':'Corner radius','range',L,'r',{min:0,max:600,step:1});
    if(L.shape==='burst'){ctl(box,'Spikes','range',L,'pts',{min:5,max:40,step:1});ctl(box,'Spike depth','range',L,'inner',{min:.5,max:.98,step:.01})}
    const s=row2(box);ctl(s,'Outline width','number',L,'stroke',{min:0,max:60,step:1});ctl(s,'Outline colour','color',L,'strokec');
  }
  if(L.type==='image'){
    box.append(el('h3','','Image'));
    const b=el('div','btnrow');btn(b,state.layerImgs[L.id]?'Replace image':'Upload image',()=>pickFile(f=>loadImageFile(f,im=>{state.layerImgs[L.id]=im;buildSelPanel()})),'primary');
    if(state.layerImgs[L.id])btn(b,'Remove image',()=>{delete state.layerImgs[L.id];buildSelPanel()});box.append(b);
    ctl(box,'Fit','select',L,'fit',{o:['contain','cover']});ctl(box,'Corner radius','range',L,'rad',{min:0,max:400,step:1});ctl(box,'Shadow','range',L,'shadow',{min:0,max:80,step:1});
  }
  if(L.type==='logo')box.append(el('p','note','Draws your brand logo from the Brand logo slot above.'));
  box.append(el('h3','','Motion'));
  const a=L.an;
  ctl(box,'Entrance','select',a,'in',{o:ANIN});
  const m=row2(box);ctl(m,'Delay (s)','number',a,'delay',{min:0,max:12,step:.1});ctl(m,'Duration (s)','number',a,'dur',{min:.1,max:6,step:.1});
  const m2=row2(box);ctl(m2,'Easing','select',a,'ease',{o:[['enter','Snap in (recommended)'],['out','Smooth'],['pop','Branded pop'],['back','Overshoot'],['elastic','Elastic'],['move','Ease in-out'],['inout','Ease in-out (soft)'],['exit','Accelerate away'],['linear','Linear (loops only)']]});ctl(m2,'Slide distance','number',a,'dist',{min:0,max:2000,step:10});
  const m3=row2(box);ctl(m3,'Idle loop','select',a,'loop',{o:ANLOOP});ctl(m3,'Loop speed','number',a,'lspd',{min:1,max:8,step:1});
  const b=el('div','btnrow');btn(b,'Duplicate',()=>dupLayer(L.id));btn(b,'Delete',()=>delLayer(L.id));box.append(b);
}
function buildFreePanel(){
  const F=state.free,box=$('#freeBox');box.innerHTML='';
  const lst=el('div');lst.id='layerList';box.append(lst);
  const add=el('div','addrow'),sel=el('select');sel.id='addSel';ADD.forEach(a=>{const o=el('option');o.value=a[0];o.textContent=a[1];sel.append(o)});add.append(sel);btn(add,'Add layer',()=>addLayer(sel.value),'primary');box.append(add);
  box.append(el('h3','','Start from a preset'));
  const pr=el('div','addrow'),ps=el('select');ps.id='presetSel';Object.keys(PRESETS).forEach(k=>{const o=el('option');o.value=k;o.textContent=k;ps.append(o)});pr.append(ps);
  btn(pr,'Apply',()=>{state.prevLayers={layers:state.free.layers,bg:F.bg,bg2:F.bg2,fx:F.fx,next:F.nextId};F.nextId=1;F.layers=PRESETS[ps.value]();state.layerImgs={};select(null);buildFreePanel();dirty()});
  btn(pr,'Undo',()=>{const p=state.prevLayers;if(!p)return;F.layers=p.layers;F.bg=p.bg;F.bg2=p.bg2;F.fx=p.fx;F.nextId=p.next;state.prevLayers=null;select(null);buildFreePanel()});box.append(pr);
  box.append(el('p','note','Applying a preset replaces the current layers. Undo restores them.'));
  box.append(el('h3','','Background'));
  const b=row2(box);ctl(b,'Colour','color',F,'bg');ctl(b,'Gradient to','color',F,'bg2');
  btn(box,'Clear gradient',()=>{F.bg2='';buildFreePanel();dirty()});
  ctl(box,'Ambient effect','select',F,'fx',{o:['none','leaves','snow','confetti','sparkle']});
  buildLayers();
}

/* ----- templates rail, fields, images ----- */
let catFilter='all';
function buildCatChips(){
  const row=$('#catChips');if(!row)return;row.innerHTML='';
  const cats=[['all','All']].concat(EVENT_CATS).concat([['classic','Classic library']]);
  cats.forEach(([key,label])=>{
    const b=el('button','catchip'+(catFilter===key?' on':''),label);b.type='button';
    b.addEventListener('click',()=>{catFilter=key;buildTemplates()});
    row.append(b);
  });
}
function buildTemplates(){
  buildCatChips();
  const box=$('#tplList');box.innerHTML='';
  ["Leon's events","Leon's posts","Leon's campaigns","Leon's motion",'Community ports','Free canvas'].forEach(g=>{
    const items=T.filter(x=>x.grp===g&&(catFilter==='all'||x.cat===catFilter||x.grp==='Free canvas'));
    if(!items.length)return;
    box.append(el('h4','grp',g));
    items.forEach(tp=>{
      const b=el('button','tpl-item'+(tp.id===state.tid?' active':''));b.type='button';b.dataset.id=tp.id;
      const cvs=document.createElement('canvas');cvs.width=144;cvs.height=180;
      const d=el('div');d.append(el('b','',tp.name),el('span','',tp.sub));b.append(cvs,d);
      b.addEventListener('click',()=>selectTemplate(tp.id));box.append(b);
    });
  });
  paintThumbs();
}
/* Preview renderer shared by the template rail and the design gallery. It draws a post from ITS CURRENT values
   (so the thumbnail always matches what the canvas shows) and fills an empty photo slot with a small stand-in picture. */
function previewInto(canvas,tp,F,I){
  const off=previewInto._c||(previewInto._c=document.createElement('canvas'));off.width=W;off.height=1350;const oc=off.getContext('2d');
  oc.clearRect(0,0,W,1350);oc.save();const _l=state.logo2,_f=state.film;state.logo2={fx:'none',at:0,dur:1};state.film=null;NT=4.2;ND=6;
  try{
    if(tp.free){oc.fillStyle=Y;oc.fillRect(0,0,W,1350);oc.fillStyle='#000';oc.beginPath();oc.roundRect(90,160,900,300,40);oc.fill();oc.fillStyle='#fff';oc.beginPath();oc.arc(300,820,190,0,TAU);oc.fill();oc.fillStyle='#E4262C';oc.fillRect(560,680,420,60);oc.fillStyle='#000';oc.fillRect(560,780,420,60)}
    else tp.draw(oc,W,1350,4.2,6,F,I||{});
  }catch(e){}
  oc.restore();state.logo2=_l;state.film=_f;
  const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.drawImage(off,0,0,canvas.width,canvas.height);
}
const sampleI=tp=>{const I={};if(tp.grp==="Leon's events"&&SAMPLE_IMG.complete&&SAMPLE_IMG.naturalWidth)tp.images.forEach(s=>{if(s.k==='p')I[s.k]=SAMPLE_IMG});return I};
function paintThumb(b){
  const tp=T.find(x=>x.id===b.dataset.id);if(!tp)return;
  const F={};tp.fields.forEach(f=>F[f.k]=(state.vals[tp.id]&&f.k in state.vals[tp.id])?state.vals[tp.id][f.k]:f.v);
  previewInto(b.querySelector('canvas'),tp,F,sampleI(tp));
}
function paintThumbs(){document.querySelectorAll('.tpl-item').forEach(paintThumb)}
let thumbT=null;
function paintActiveThumb(){clearTimeout(thumbT);thumbT=setTimeout(()=>{const b=document.querySelector('.tpl-item.active');if(b)paintThumb(b)},350)}
function selectTemplate(id){
  if(state.rec)return;state.tid=id;state.t=0;state.sel=null;
  document.querySelectorAll('.tpl-item').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  buildInspector();dirty();
}
const LOGOFX=[['none','No reveal'],['fade','Fade in'],['blur','Blur focus pull'],['bounce','Bounce drop'],['spin','Spin in'],['scaleRot','Scale and rotate'],['split','Split halves'],['wipe','Mask wipe'],['glitch','Glitch'],['strokeDraw','Stroke draw frame']];
function buildLogoFx(){
  const box=$('#logoFxBox');if(!box)return;box.innerHTML='';const S=state.logo2;
  const lp={get pct(){return Math.round((S.scale==null?1:S.scale)*100)},set pct(v){S.scale=v/100}};
  ctl(box,'Logo size %','range',lp,'pct',{min:40,max:400,step:5});
  ctl(box,'Logo reveal','select',S,'fx',{o:LOGOFX,on:()=>buildLogoFx()});
  if(S.fx==='none')return;
  const r=row2(box);ctl(r,'Start (s)','number',S,'at',{step:.05,min:0,max:8});ctl(r,'Length (s)','number',S,'dur',{step:.05,min:.2,max:5});
  if(S.fx==='strokeDraw')ctl(box,'Frame colour','color',S,'col');
}
function buildFilm(){
  const box=$('#filmBox');if(!box)return;box.innerHTML='';const F=state.film;
  const r=row2(box);
  ctl(r,'Camera shake','select',F,'shake',{o:[['off','Off'],['subtle','Subtle'],['strong','Strong']]});
  ctl(r,'Slow zoom','select',F,'zoom',{o:[['off','Off'],['in','Push in'],['out','Pull out']]});
  const r2=row2(box);
  ctl(r2,'Light leak','select',F,'leak',{o:[['off','Off'],['warm','Warm'],['cool','Cool']]});
  ctl(r2,'Letterbox','select',F,'bars',{o:[['off','Off'],['thin','Thin bars'],['med','Medium bars'],['wide','Wide cinema']]});
  ctl(box,'Film grain','range',F,'grain',{min:0,max:100,step:1});
  ctl(box,'Vignette','range',F,'vig',{min:0,max:100,step:1});
  const bb=el('div','btnrow');btn(bb,'Clear film effects',()=>{Object.assign(F,{shake:'off',grain:0,vig:0,bars:'off',leak:'off',zoom:'off'});buildFilm();dirty()});box.append(bb);
}
function buildQuick(){
  const sect=$('#sectQuick');if(!sect)return;
  const tp=cur();
  if(tp.free){sect.hidden=true;return}
  sect.hidden=false;
  const box=$('#quickBox');box.innerHTML='';
  const list=quickFor(tp.id);
  if(list.length){
    const w=el('div','btnrow');
    list.forEach(e=>{const K=QUICK_KINDS[e.kind];btn(w,K?K.name:e.kind,()=>select({type:'text',key:'obj:Quick'+e.id}));});
    box.append(w);
  }else box.append(el('p','note','Add a Leon’s sticker and drag it into place on this post. Drag the square handle to resize, the round handle to rotate.'));
  const add=el('div','addrow'),sel=el('select');
  Object.keys(QUICK_KINDS).forEach(k=>{const o=el('option');o.value=k;o.textContent=QUICK_KINDS[k].name;sel.append(o)});
  add.append(sel);btn(add,'Add',()=>{const e=addQuick(tp.id,sel.value);select({type:'text',key:'obj:Quick'+e.id});buildQuick();dirty()},'primary');
  box.append(add);
}
const LAYOUT_ORDER=['sunray','gallery','ticket','diagonal','arch','circle','split','fullbleed','corner','stacked','poster','card','badge'];
const SIGNATURE=new Set(['gallery','arch','diagonal','sunray','ticket']);
function buildLayoutGallery(box,tp){
  if(!tp.fields.some(f=>f.k==='layout'))return;
  const v=state.vals[tp.id],keys=LAYOUT_ORDER.filter(k=>LAYOUT_NAMES[k]);
  const g=card(box,'Design style \u00b7 '+keys.length+' designs',true,'layouts'),grid=el('div','lgrid');g.append(grid);
  keys.forEach(k=>{
    const b=el('button','lay'+(v.layout===k?' on':''));b.type='button';b.title=LAYOUT_NAMES[k];b.setAttribute('aria-pressed',v.layout===k);
    const cv=document.createElement('canvas');cv.width=120;cv.height=150;b.append(cv);
    const nm=el('span','laynm',LAYOUT_NAMES[k].replace('Signature: ',''));b.append(nm);if(SIGNATURE.has(k))b.append(el('i','laynew','NEW'));
    b.addEventListener('click',()=>{if(state.rec)return;v.layout=k;dirty();buildFields();buildSelPanel()});
    grid.append(b);
    const F={};tp.fields.forEach(f=>F[f.k]=f.k in v?v[f.k]:f.v);F.layout=k;
    requestAnimationFrame(()=>previewInto(cv,tp,F,sampleI(tp)));
  });
  g.append(el('p','note','Click a design to switch. Your text, colours and photos stay.'));
}
function buildFields(){
  const tp=cur(),v=state.vals[tp.id],box=$('#fields');if(!box||tp.free)return;box.innerHTML='';
  buildLayoutGallery(box,tp);
  const fl=tp.fields.filter(f=>f.k!=='layout');
  const groups=[['Text',f=>f.t==='text'||f.t==='area',true],['Look',f=>f.t==='select',true],['Colours',f=>f.t==='color',false]];
  const used=new Set();
  groups.forEach(([title,test,open])=>{
    const list=fl.filter(f=>test(f));list.forEach(f=>used.add(f.k));if(!list.length)return;
    const g=card(box,title,open,'fld:'+title),col=title==='Colours'?el('div','cgrid'):g;if(col!==g)g.append(col);
    list.forEach(f=>{
      const t=f.t==='select'?'select':f.t==='text'?'area':f.t,o={};if(f.t==='select')o.o=f.o;if(f.t==='text')o.auto=true;
      if(f.t==='text'||f.t==='area')o.focus=()=>select({type:'text',key:f.k},{silent:true});
      o.wrapKey=f.k;ctl(col,f.l,t,v,f.k,o);
    });
  });
  const rest=fl.filter(f=>!used.has(f.k));
  if(rest.length){const g=card(box,'Other',true,'fld:Other');rest.forEach(f=>{const o={wrapKey:f.k};if(f.t==='select')o.o=f.o;ctl(g,f.l,f.t,v,f.k,o)})}
  buildBgBar();if(typeof scheduleCheck==='function')scheduleCheck();
}
/* ----- pinned background bar: the post's background colour is always one click away ----- */
const BG_PRESETS=[['#FFE81A','Leon\u2019s yellow'],['#C8102E','Leon\u2019s red'],['#111111','Black'],['#FFFFFF','White'],['#F4F1EA','Cream'],['#6B6B6B','Grey'],['#00BA99','Little Leon\u2019s teal']];
function shadeHex(h,p){const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return h;const n=parseInt(m[1],16);const f=s=>Math.max(0,Math.min(255,Math.round(((n>>s)&255)*(1+p))));return '#'+[16,8,0].map(s=>f(s).toString(16).padStart(2,'0')).join('')}
function bgTargets(tp){
  if(tp.free)return {o:state.free,k1:'bg',k2:'bg2',l1:'Background',l2:'Gradient to'};
  const v=state.vals[tp.id],cf=tp.fields.filter(f=>f.t==='color'),pick=cf.find(f=>/^bg\d?$/.test(f.k));
  if(!pick)return cf.length?{o:v,k1:cf[0].k,k2:null,l1:cf[0].l}:null;
  const second=cf.find(f=>f.k==='bg2'&&pick.k==='bg1');
  return {o:v,k1:pick.k,k2:second?second.k:null,l1:pick.l,l2:second?second.l:''};
}
function buildBgBar(){
  const bar=document.getElementById('bgBar');if(!bar)return;bar.innerHTML='';const tp=cur(),T0=bgTargets(tp);
  bar.hidden=!T0;if(!T0)return;
  bar.append(el('span','bglbl','Background'));
  const sw=el('div','bgsw');
  BG_PRESETS.forEach(([hex,name])=>{
    const b=el('button','sw'+(String(T0.o[T0.k1]).toLowerCase()===hex.toLowerCase()?' on':''));b.type='button';b.style.background=hex;b.title=name;b.setAttribute('aria-label','Background: '+name);
    b.addEventListener('click',()=>{if(state.rec)return;T0.o[T0.k1]=hex;if(T0.k2)T0.o[T0.k2]=shadeHex(hex,lum(hex)>.5?-.07:.18);if(T0.o===state.free)state.free.bg2='';dirty();buildBgBar();buildFields0()});
    sw.append(b)});
  bar.append(sw);
  const c1=el('input');c1.type='color';c1.value=/^#[0-9a-f]{6}$/i.test(T0.o[T0.k1])?T0.o[T0.k1]:'#ffffff';c1.title=T0.l1+' (custom colour)';c1.setAttribute('aria-label',T0.l1);
  c1.addEventListener('input',()=>{T0.o[T0.k1]=c1.value;dirty()});c1.addEventListener('change',()=>{buildBgBar();buildFields0()});bar.append(c1);
  if(T0.k2&&!tp.free){const c2=el('input');c2.type='color';c2.value=/^#[0-9a-f]{6}$/i.test(T0.o[T0.k2])?T0.o[T0.k2]:'#ffffff';c2.title=(T0.l2||'Second background colour')+' (custom colour)';c2.setAttribute('aria-label',T0.l2||'Second background colour');
    c2.className='c2';c2.addEventListener('input',()=>{T0.o[T0.k2]=c2.value;dirty()});c2.addEventListener('change',()=>{buildBgBar();buildFields0()});bar.append(c2)}
}
/* refresh the colour inputs inside the Content / Object panes after the bar changed a value */
function buildFields0(){if(!cur().free)buildFields();if(state.sel)buildSelPanel()}
function buildInspector(){
  const tp=cur(),free=!!tp.free;
  buildLogoFx();buildFilm();
  $('#sectContent').hidden=free||!tp.fields.length;$('#sectImages').hidden=free||!tp.images.length;$('#sectLayers').hidden=!free;
  buildFields();buildBgBar();
    if(free&&curTab==='content')setTab('add');
  if(free)buildFreePanel();
  buildQuick();
  buildImages();buildSelPanel();refreshStatus();refreshDefBtn();
}
function loadImageFile(file,cb){
  if(!file||!file.type.startsWith('image/'))return;
  const url=URL.createObjectURL(file),im=new Image();im.onload=()=>cb(im,url);im.src=url;
}
let pickCb=null;
function pickFile(cb){pickCb=cb;const f=$('#fileIn');f.value='';f.click()}
$('#fileIn').addEventListener('change',e=>{const f=e.target.files[0];if(f&&pickCb)pickCb(f)});
function buildImages(){
  const tp=cur(),I=state.imgs[tp.id],box=$('#images');box.innerHTML='';
  tp.images.forEach(s=>{
    const row=el('div','slot'+(I[s.k]?'':' empty')),pv=el('div','pv');if(I[s.k])pv.style.backgroundImage='url('+I[s.k].src+')';
    const lbl=el('div','lbl',s.l);lbl.append(el('small','',I[s.k]?'Loaded':(s.k==='logo'&&state.logo?'Using brand logo':'Empty')));
    const up=el('button','btn sm','Upload');up.type='button';const clr=el('button','btn sm','Clear');clr.type='button';
    const set=file=>loadImageFile(file,im=>{I[s.k]=im;buildImages();refreshStatus()});
    up.addEventListener('click',()=>pickFile(set));
    clr.addEventListener('click',()=>{delete I[s.k];buildImages();refreshStatus()});
    row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('over')});
    row.addEventListener('dragleave',()=>row.classList.remove('over'));
    row.addEventListener('drop',e=>{e.preventDefault();row.classList.remove('over');set(e.dataTransfer.files[0])});
    row.append(pv,lbl,up,clr);box.append(row);
  });
}
function setStatus(msg,cls){const s=$('#status');s.textContent=msg||'';s.className=cls||''}
function refreshStatus(){
  if(state.rec)return;
  const tp=cur();let miss=0;
  if(tp.free){miss=state.free.layers.filter(l=>l.type==='image'&&!state.layerImgs[l.id]).length}
  else{const I=state.imgs[tp.id];miss=tp.images.filter(i=>!I[i.k]&&!(i.k==='logo'&&state.logo)).length}
  const usesLogo=tp.free?state.free.layers.some(l=>l.type==='logo'):true;
  if(!state.logo&&usesLogo&&!(!tp.free&&state.imgs[tp.id].logo))miss++;
  if(miss)setStatus(miss+(miss===1?' slot is':' slots are')+' still empty. Dashed placeholders will appear in the export.','warn');
  else setStatus('All slots filled. Ready to export.','ok');
}
/* logo */
function applyLogo(im){state.logo=im;$('#logoPv').style.backgroundImage=im?'url('+im.src+')':'';$('#logoSm').textContent=im===BRAND.logo?'Leon\u2019s brand logo':im?'Custom logo loaded':'Used by every template';refreshStatus()}
$('#logoBtn').addEventListener('click',()=>pickFile(file=>{
  const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{applyLogo(im);try{localStorage.setItem('mps_logo',rd.result)}catch(e){}};im.src=rd.result};rd.readAsDataURL(file)}));
$('#logoClr').addEventListener('click',()=>{applyLogo(BRAND.logo||null);try{localStorage.removeItem('mps_logo')}catch(e){}});
try{const d=localStorage.getItem('mps_logo');if(d){const im=new Image();im.onload=()=>applyLogo(im);im.src=d}}catch(e){}
/* format */
(function(){const seg=$('#ratioSeg');Object.keys(RATIOS).forEach(r=>{const b=el('button',r===state.ratio?'on':'',r);b.type='button';b.dataset.r=r;
  b.addEventListener('click',()=>{if(state.rec)return;state.ratio=r;seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));$('#ratioNote').textContent=RNOTE[r];fitStage();dirty()});seg.append(b)});})();
$('#dur').addEventListener('input',e=>{state.D=+e.target.value;$('#durOut').textContent=state.D+'s';state.t=state.t%state.D;dirty()});
$('#fontSel').addEventListener('change',e=>{const v=e.target.value;FM=v==='soft'?FSOFT:FNOVA;FN=v==='nova'?FNOVA:FSOFT;paintThumbs()});
$('#loops').addEventListener('change',e=>state.loops=+e.target.value);
$('#fps').addEventListener('change',e=>state.fps=+e.target.value);
$('#resetBtn').addEventListener('click',()=>{try{localStorage.removeItem('mps_state')}catch(e){}location.reload()});
/* playback */
$('#playBtn').addEventListener('click',()=>{if(state.rec)return;state.playing=!state.playing;$('#playBtn').textContent=state.playing?'Pause':'Play'});
$('#resetPostBtn').addEventListener('click',()=>{
  if(state.rec)return;const tp=cur(),saved=defLoad()[tp.id];
  if(saved)defApply(tp,saved);   /* the person's own saved default for this post wins */
  else{
    /* back to the template's own layout: default copy, no moved or resized elements.
       Uploaded photos and the logo are kept, so nothing has to be re-uploaded. */
    tp.fields.forEach(f=>state.vals[tp.id][f.k]=f.v);
    delete state.ovr[ovKey(tp.id)];
    if(tp.free){state.free.layers=[];state.free.bg='#FFE81A';state.free.bg2='';state.free.fx='none'}
  }
  state.sel=null;state.t=0;
  buildInspector();persist();
});
/* ----- "my default" designs -----
   Save the current design of a post (copy, layout choice, colours, moved/resized elements for every
   ratio, typography, stickers) as YOUR default for that post. "Reset this post" and "Reset every
   template" then go back to it instead of the factory design. Uploaded photos and the logo are never
   part of it, so nothing has to be re-uploaded. */
const DEF_KEY='mps_defaults';
var REMOTE_DEF={},FRESH_BOOT=false;
const jclone=o=>JSON.parse(JSON.stringify(o));
function defLocal(){try{return JSON.parse(localStorage.getItem(DEF_KEY)||'{}')||{}}catch(e){return {}}}
/* defaults baked into the app (src/defaults.json) apply everywhere; this browser's own saved defaults win per post */
function defLoad(){return Object.assign({},typeof BAKED_DEFAULTS==='object'&&BAKED_DEFAULTS||{},REMOTE_DEF,defLocal())}
function defStore(o){try{localStorage.setItem(DEF_KEY,JSON.stringify(o));return true}catch(e){return false}}
function defSnapshot(tp){
  const id=tp.id,s={vals:jclone(state.vals[id]),style:jclone(state.style[id]||{}),ovr:{},quick:{}};
  Object.keys(RATIOS).forEach(r=>{const k=id+'@'+r;if(state.ovr[k])s.ovr[r]=jclone(state.ovr[k]);if(state.quick[k])s.quick[r]=jclone(state.quick[k])});
  if(tp.free)s.free={bg:state.free.bg,bg2:state.free.bg2,fx:state.free.fx,nextId:state.free.nextId,layers:state.free.layers.map(l=>{const o={...l};delete o._h;return o})};
  return s;
}
function defApply(tp,s){
  const id=tp.id;
  /* fields added after the default was saved fall back to the template's own value */
  tp.fields.forEach(f=>{state.vals[id][f.k]=(s.vals&&f.k in s.vals)?s.vals[f.k]:f.v});
  state.style[id]=jclone(s.style||{});
  Object.keys(RATIOS).forEach(r=>{const k=id+'@'+r;
    if(s.ovr&&s.ovr[r])state.ovr[k]=jclone(s.ovr[r]);else delete state.ovr[k];
    if(s.quick&&s.quick[r]&&s.quick[r].length){state.quick[k]=jclone(s.quick[r]);state.quickNextId=Math.max(state.quickNextId,...state.quick[k].map(e=>e.id+1))}else delete state.quick[k]});
  if(tp.free&&s.free){state.free.bg=s.free.bg;state.free.bg2=s.free.bg2;state.free.fx=s.free.fx;state.free.nextId=s.free.nextId||1;state.free.layers=jclone(s.free.layers||[]);state.layerImgs={}}
}
function refreshDefBtn(){
  const D=defLoad(),has=!!D[state.tid],b=$('#saveDefBtn'),rb=$('#resetPostBtn'),cb=$('#clearDefBtn'),fb=$('#forgetDefBtn');
  if(b){b.textContent=has?'Update my default':'Save as my default';
    b.title=has?'Overwrite your saved default for this post with the current design':"Save this post's current design (copy, layout, positions, styling, stickers) as YOUR default; Reset comes back to it"}
  if(rb)rb.title=has?'Back to YOUR saved default for this post':'Put this template back to its original layout';
  if(cb)cb.hidden=!Object.keys(defLocal()).includes(state.tid);if(fb)fb.hidden=!Object.keys(defLocal()).length;
}
$('#saveDefBtn').addEventListener('click',()=>{
  if(state.rec)return;const tp=cur(),D=defLocal();D[tp.id]=defSnapshot(tp);
  const ok=defStore(D),b=$('#saveDefBtn');refreshDefBtn();if(ghTok())ghSync(o=>{o[tp.id]=D[tp.id]},'Saved live');
  const keep=b.textContent;b.textContent=ok?'Saved \u2713':'Could not save (browser storage blocked)';setTimeout(()=>refreshDefBtn(),1600);
});
$('#clearDefBtn').addEventListener('click',()=>{const D=defLocal(),id=state.tid;delete D[id];defStore(D);refreshDefBtn();if(ghTok()&&REMOTE_DEF[id])ghSync(o=>{delete o[id]},'Cleared live')});
$('#forgetDefBtn').addEventListener('click',()=>{if(confirm('Forget every default you have saved? Reset will go back to the original designs.')){defStore({});refreshDefBtn()}});

/* ----- live save: defaults are committed to the GitHub repo (src/defaults.json) so every browser sees them -----
   Needs a fine-grained token (Contents: read & write on this one repo), pasted once per browser. */
const GH={repo:'irk15/Motion-Posts',path:'v10/src/defaults.json',branch:'main',key:'mps_gh_token'};
const ghTok=()=>{try{return localStorage.getItem(GH.key)||''}catch(e){return ''}};
function ghApi(method,body){
  return fetch('https://api.github.com/repos/'+GH.repo+'/contents/'+GH.path+(method==='GET'?'?ref='+GH.branch+'&t='+Date.now():''),
    {method,headers:{Authorization:'Bearer '+ghTok(),Accept:'application/vnd.github+json'},body:body?JSON.stringify(body):undefined});
}
function syncNote(msg,bad){const n=$('#syncNote');if(n){n.textContent=msg;n.style.color=bad?'#c0392b':''}}
function refreshLiveBtn(){const b=$('#liveBtn');if(b)b.textContent=ghTok()?'Disconnect live save':'Connect live save';
  if(!$('#syncNote').textContent||/^Live save (on|off)/.test($('#syncNote').textContent))syncNote(ghTok()?'Live save on: saving a default updates the website for everyone.':'Live save off: defaults stay in this browser.')}
let syncBusy=Promise.resolve();
function ghSync(mut,okMsg){
  syncBusy=syncBusy.then(async()=>{
    syncNote('Saving live\u2026');
    for(let tryN=0;tryN<2;tryN++){
      try{
        const r=await ghApi('GET');let sha,cur={};
        if(r.status===200){const j=await r.json();sha=j.sha;cur=JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,'')))))||{}}
        else if(r.status!==404)throw new Error('GitHub said '+r.status+(r.status===401?' (token rejected)':''));
        mut(cur);const txt=JSON.stringify(cur,null,1);if(txt.length>900000)throw new Error('defaults file too large');
        const body={message:'Update saved defaults (Motion Poster Studio)',content:btoa(unescape(encodeURIComponent(txt))),branch:GH.branch};if(sha)body.sha=sha;
        const p=await ghApi('PUT',body);
        if(p.status===409||p.status===422){if(tryN===0)continue}
        if(!p.ok)throw new Error('GitHub said '+p.status+(p.status===403||p.status===404?' (token needs Contents: read & write on '+GH.repo+')':''));
        REMOTE_DEF=cur;refreshDefBtn();syncNote(okMsg+' \u2713 (the website updates in about a minute)');return;
      }catch(e){syncNote('Live save failed: '+(e&&e.message||e)+'. Saved in this browser only.',true);return}
    }
  });
}
$('#liveBtn').addEventListener('click',async()=>{
  if(ghTok()){try{localStorage.removeItem(GH.key)}catch(e){}syncNote('');refreshLiveBtn();return}
  const t=(prompt('Paste a GitHub fine-grained token for '+GH.repo+' (Contents: read and write). It is kept in this browser only.')||'').trim();if(!t)return;
  try{localStorage.setItem(GH.key,t)}catch(e){syncNote('Browser storage is blocked, cannot keep the token.',true);return}
  syncNote('Checking token\u2026');
  try{const r=await fetch('https://api.github.com/repos/'+GH.repo,{headers:{Authorization:'Bearer '+t}});const j=await r.json();
    if(!r.ok||!(j.permissions&&j.permissions.push))throw new Error(r.ok?'token has no write access to '+GH.repo:'GitHub said '+r.status);
    syncNote('');refreshLiveBtn();
  }catch(e){try{localStorage.removeItem(GH.key)}catch(x){}syncNote('Token not accepted: '+(e.message||e),true);refreshLiveBtn()}
});
$('#expDefBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(defLoad(),null,1)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='motion-poster-defaults.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)});
$('#impDefBtn').addEventListener('click',()=>$('#impDefFile').click());
$('#impDefFile').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  const r=new FileReader();r.onload=()=>{try{
    const o=JSON.parse(r.result);if(!o||typeof o!=='object'||Array.isArray(o))throw 0;
    const ids=new Set(T.map(t=>t.id)),D=defLocal();let n=0;
    Object.keys(o).forEach(k=>{if(ids.has(k)&&o[k]&&typeof o[k]==='object'){D[k]=o[k];n++}});
    if(!n)throw 0;defStore(D);refreshDefBtn();
    $('#impDefBtn').textContent='Imported '+n+' \u2713';setTimeout(()=>{$('#impDefBtn').textContent='Import my defaults'},1800)
  }catch(x){$('#impDefBtn').textContent='Not a defaults file';setTimeout(()=>{$('#impDefBtn').textContent='Import my defaults'},1800)}};
  r.readAsText(f)});
$('#undoBtn').addEventListener('click',()=>{if(!state.rec)undo()});
$('#redoBtn').addEventListener('click',()=>{if(!state.rec)redo()});
$('#restartBtn').addEventListener('click',()=>{if(state.rec)return;state.t=0;state.playing=true;$('#playBtn').textContent='Pause'});
$('#editBtn').addEventListener('click',()=>{if(state.rec)return;state.playing=false;state.t=state.D*.55;$('#playBtn').textContent='Play'});
$('#scrub').addEventListener('input',e=>{if(state.rec)return;state.playing=false;$('#playBtn').textContent='Play';state.t=e.target.value/1000*state.D});

/* ----- canvas interaction ----- */
const toCanvas=e=>{const r=ovc.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*Hnow()/r.height]};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
ovc.addEventListener('pointerdown',e=>{
  if(state.rec)return;const [x,y]=toCanvas(e),tp=cur();
  if(tp.free){
    const sl=selLayer();
    if(sl){const h=layerHandles(sl);
      if(dist(layerDel(sl),[x,y])<28){deleteSelected();return}
      if(dist(h.resize,[x,y])<40){drag={mode:'resize',id:sl.id,orig:{...sl,_h:sl._h}};ovc.setPointerCapture(e.pointerId);return}
      if(dist(h.rotate,[x,y])<40){drag={mode:'rotate',id:sl.id};ovc.setPointerCapture(e.pointerId);return}}
    const L=hitLayer(x,y);
    if(L){select({type:'layer',id:L.id});drag={mode:'move',id:L.id,ox:L.x,oy:L.y,sx:x,sy:y}}else select(null);
  }else{
    const sb0=state.sel&&state.sel.type==='text'?textBox(state.sel.key):null;
    if(sb0){const hd=sHandles(sb0),an=LAST&&LAST.anch[state.sel.key],o0=ovFor(tp.id,state.sel.key,true);
      if(dist(hd.del,[x,y])<28){deleteSelected();return}
      if(an&&dist(hd.resize,[x,y])<40){drag={mode:'sresize',key:state.sel.key,a:an,sc0:o0.sc,d0:Math.max(20,dist(hd.resize,[an.x,an.y]))};ovc.setPointerCapture(e.pointerId);return}
      if(an&&dist(hd.rotate,[x,y])<40){drag={mode:'srotate',key:state.sel.key,a:an,r0:o0.rot,g0:Math.atan2(y-an.y,x-an.x)};ovc.setPointerCapture(e.pointerId);return}}
    const k=hitText(x,y);
    if(k){select({type:'text',key:k});const o=ovFor(tp.id,k,true);drag={mode:'move',key:k,ox:o.dx,oy:o.dy,sx:x,sy:y,box:textBox(k)}}else{select(null);const bb=document.getElementById('bgBar');if(bb&&!bb.hidden)flashEl(bb)}
  }
  if(drag)ovc.setPointerCapture(e.pointerId);
});
ovc.addEventListener('pointermove',e=>{
  const [x,y]=toCanvas(e),tp=cur(),H=Hnow();
  if(!drag){
    if(tp.free){const L=hitLayer(x,y);hover=L?{type:'layer',id:L.id}:null;const sl=selLayer();let cur0=L?'move':'default';if(sl){const h=layerHandles(sl);if(dist(layerDel(sl),[x,y])<28){cur0='pointer';ovc.title='Delete'}else if(dist(h.resize,[x,y])<40)cur0='nwse-resize';else if(dist(h.rotate,[x,y])<40)cur0='grab'}ovc.style.cursor=cur0}
    else{const k=hitText(x,y);hover=k?{type:'text',key:k}:null;let cu=k?'move':'default';
      const sb1=state.sel&&state.sel.type==='text'?textBox(state.sel.key):null;if(sb1){const hd=sHandles(sb1);if(dist(hd.del,[x,y])<28)cu='pointer';else if(dist(hd.resize,[x,y])<40)cu='nwse-resize';else if(dist(hd.rotate,[x,y])<40)cu='grab'}
      ovc.style.cursor=cu;ovc.title=k?('Click to edit: '+(k.startsWith('obj:')?objLabel(k):((cur().fields.find(f=>f.k===k)||{}).l||k))):''}
    return;
  }
  GUIDE.x=GUIDE.y=false;
  if(tp.free){
    const L=state.free.layers.find(l=>l.id===drag.id);if(!L)return;
    if(drag.mode==='move'){let nx=drag.ox+x-drag.sx,ny=drag.oy+y-drag.sy;if(Math.abs(nx-W/2)<12){nx=W/2;GUIDE.x=true}if(Math.abs(ny-H/2)<12){ny=H/2;GUIDE.y=true}L.x=Math.round(nx);L.y=Math.round(ny);buildPosLive(L)}
    else if(drag.mode==='rotate'){let a=Math.atan2(y-L.y,x-L.x)*180/Math.PI+90;if(e.shiftKey)a=Math.round(a/15)*15;L.rot=Math.round(a)}
    else if(drag.mode==='resize'){
      const o=drag.orig,r=o.rot*Math.PI/180,dx=x-o.x,dy=y-o.y,lx=dx*Math.cos(r)+dy*Math.sin(r),ly=-dx*Math.sin(r)+dy*Math.cos(r);
      const nw=Math.max(30,Math.round(2*Math.abs(lx))),nh=Math.max(30,Math.round(2*Math.abs(ly))),s=nw/o.w;
      if(L.type==='text'){L.size=Math.max(12,Math.round(o.size*s));L.w=nw}
      else{L.w=nw;L.h=(e.shiftKey||L.type==='logo')?Math.round(o.h*s):nh}
    }
  }else{
    const o=ovFor(tp.id,drag.key,true);
    if(drag.mode==='sresize'){o.sc=Math.max(.1,Math.min(5,Math.round(drag.sc0*dist([x,y],[drag.a.x,drag.a.y])/drag.d0*100)/100))}
    else if(drag.mode==='srotate'){let r=drag.r0+(Math.atan2(y-drag.a.y,x-drag.a.x)-drag.g0)*180/Math.PI;if(e.shiftKey)r=Math.round(r/15)*15;r=((r+540)%360)-180;o.rot=Math.round(r)}
    else if(drag.mode==='move'){let nx=drag.ox+x-drag.sx,ny=drag.oy+y-drag.sy;
      if(drag.box){const cx=(drag.box.x0+drag.box.x1)/2+(nx-drag.ox);if(Math.abs(cx-W/2)<12){nx+=W/2-cx;GUIDE.x=true}}
      o.dx=Math.round(nx);o.dy=Math.round(ny)}
  }
});
function buildPosLive(){/* position inputs refresh on pointer up */}
const endDrag=()=>{if(drag){drag=null;GUIDE.x=GUIDE.y=false;buildSelPanel();dirty()}};
ovc.addEventListener('pointerup',endDrag);ovc.addEventListener('pointercancel',endDrag);
ovc.addEventListener('pointerleave',()=>{if(!drag)hover=null});
ovc.addEventListener('dragover',e=>e.preventDefault());
ovc.addEventListener('drop',e=>{
  e.preventDefault();const f=e.dataTransfer.files[0];if(!f)return;const tp=cur(),[x,y]=toCanvas(e);
  loadImageFile(f,im=>{
    if(tp.free){const L=newLayer('image',{x:Math.round(x),y:Math.round(y),w:600,h:Math.round(600*im.naturalHeight/im.naturalWidth)});L.an.delay=Math.min(2,.3+state.free.layers.length*.12);state.free.layers.push(L);state.layerImgs[L.id]=im;select({type:'layer',id:L.id});dirty()}
    else{const I=state.imgs[tp.id],slot=tp.images.find(s=>!I[s.k]&&s.k!=='logo')||tp.images[0];if(slot){I[slot.k]=im;buildImages();refreshStatus()}}
  });
});
document.addEventListener('keydown',e=>{
  const tag=document.activeElement&&document.activeElement.tagName;
  if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
  const tp=cur(),step=e.shiftKey?10:1;
  if(e.code==='Space'&&tag!=='BUTTON'){e.preventDefault();$('#playBtn').click();return}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(!state.rec){e.shiftKey?redo():undo()}return}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='y'){e.preventDefault();if(!state.rec)redo();return}
  if(e.key==='Escape'){select(null);return}
  const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(arrows[e.key]&&state.sel){
    e.preventDefault();const [ax,ay]=arrows[e.key];
    if(tp.free){const L=selLayer();if(L){L.x+=ax*step;L.y+=ay*step;buildSelPanel();dirty()}}
    else if(state.sel.type==='text'){const o=ovFor(tp.id,state.sel.key,true);o.dx+=ax*step;o.dy+=ay*step;buildSelPanel();dirty()}
  }
  if((e.key==='Delete'||e.key==='Backspace')&&(tp.free?selLayer():state.sel)){e.preventDefault();deleteSelected();return}
  if(tp.free&&selLayer()){
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='d'){e.preventDefault();dupLayer(selLayer().id)}
  }
});

/* ----- export ----- */
async function download(blob,name){
  try{const d=window.claude&&await window.claude.use('downloads');
    if(d){await d.save({filename:name,data:blob});return 'saved'}}
  catch(e){if(e&&e.code==='declined')return 'declined';if(e&&e.code==='too_large')return 'too_large'}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return 'saved';
}
const fname=ext=>state.tid+'-'+state.ratio.replace(':','x')+'.'+ext;
const saveMsg=(r,name)=>r==='declined'?setStatus('Save cancelled.',''):r==='too_large'?setStatus('That file is too large to save here. Try a shorter loop.','warn'):setStatus('Saved '+name+'.','ok');
$('#pngBtn').addEventListener('click',()=>{render();cv.toBlob(b=>{download(b,fname('png')).then(r=>saveMsg(r,fname('png')))})});
$('#vidBtn').addEventListener('click',()=>{
  if(state.rec)return;
  const types=['video/mp4;codecs=avc1.640028','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  const mime=window.MediaRecorder&&types.find(t=>MediaRecorder.isTypeSupported(t));
  if(!mime){setStatus('This browser cannot record video from a canvas. Try Chrome or Edge.','warn');return}
  const mr=new MediaRecorder(cv.captureStream(state.fps),{mimeType:mime,videoBitsPerSecond:14e6}),chunks=[];
  mr.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  mr.onstop=()=>{const ext=mime.includes('mp4')?'mp4':'webm';state.rec=null;$('#vidBtn').disabled=false;setStatus('Recording done. Confirm the save to keep it.','ok');
    download(new Blob(chunks,{type:mime.split(';')[0]}),fname(ext)).then(r=>saveMsg(r,fname(ext)))};
  state.t=0;state.playing=true;$('#playBtn').textContent='Pause';
  state.rec={mr,el:0,total:state.D*state.loops};$('#vidBtn').disabled=true;mr.start();
});
/* ----- main loop ----- */
let last=performance.now();
function tick(ts){
  const dt=Math.min(.1,(ts-last)/1000);last=ts;
  if(state.playing){
    state.t+=dt;
    if(state.rec&&!state.rec.done){state.rec.el+=dt;
      if(state.rec.el>=state.rec.total){const r=state.rec.mr;state.rec.done=true;state.t=state.D-.001;render();setTimeout(()=>{if(r.state!=='inactive')r.stop()},120)}
      else setStatus('Recording… '+Math.min(100,Math.round(state.rec.el/state.rec.total*100))+'%','warn')}
    if(state.t>=state.D)state.t%=state.D;
  }
  render();
  $('#scrub').value=Math.round(state.t/state.D*1000);$('#time').textContent=state.t.toFixed(1)+'s / '+state.D+'s';
  requestAnimationFrame(tick);
}
function fontNote(){const n=fontInstalled('Proxima Nova')||fontInstalled('proxima-nova'),s=fontInstalled('Proxima Soft')||fontInstalled('proxima-soft');
  $('#fontNote').textContent=(n?'Proxima Nova is loaded. ':'Proxima Nova not found, showing Montserrat instead. ')+(s?'Proxima Soft is loaded.':'Proxima Soft not found, showing Nunito instead.')}
restore();
/* no working state (first load, or just after "Reset every template"): bring back the designs the person saved as their defaults */
(function(){try{if(localStorage.getItem('mps_state')!==null)return;FRESH_BOOT=true;const D=defLoad();T.forEach(tp=>{if(D[tp.id])defApply(tp,D[tp.id])})}catch(e){}})();
refreshLiveBtn();
/* pick up the live defaults file from the website (not possible when opened as a plain local file) */
(function(){if(!/^https?:/.test(location.protocol))return;
  fetch('src/defaults.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(o=>{
    if(!o||typeof o!=='object'||Array.isArray(o))return;REMOTE_DEF=o;
    if(FRESH_BOOT&&!HIST.past.length){const D=defLoad();T.forEach(tp=>{if(D[tp.id])defApply(tp,D[tp.id])});buildInspector();persist()}
    refreshDefBtn()}).catch(()=>{})})();
$('#dur').value=state.D;$('#durOut').textContent=state.D+'s';
$('#ratioSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.r===state.ratio));$('#ratioNote').textContent=RNOTE[state.ratio];
if(typeof state.logo2.scale!=='number')state.logo2.scale=1;
/* one-time migration: an old default (160% logo size) and any leftover letterbox-bars
   setting saved to this browser before v20 shipped get cleared once, silently. */
try{
  if(!localStorage.getItem('mps_fix_v20')){
    if(state.logo2.scale===1.6)state.logo2.scale=1;
    if(state.film.bars&&state.film.bars!=='off')state.film.bars='off';
    localStorage.setItem('mps_fix_v20','1');
    persist();
  }
}catch(e){}
/* one-time migration: per-element overrides (position/size/line-spacing/etc.) used to be
   shared across all 3 aspect ratios of a template, which is what caused edits on one ratio
   to misalign another. Move any old bare-template-id overrides onto the ratio the user was
   last on (their best-guess origin) so nothing is silently lost when this ships. */
try{
  if(!localStorage.getItem('mps_fix_v21')){
    Object.keys(state.ovr).forEach(k=>{
      if(k.indexOf('@')===-1){
        const nk=k+'@'+state.ratio;
        if(!state.ovr[nk])state.ovr[nk]=state.ovr[k];
        delete state.ovr[k];
      }
    });
    localStorage.setItem('mps_fix_v21','1');
    persist();
  }
}catch(e){}
HIST.last=snapState();histBtns();
loadBrand(()=>{if(!state.logo)applyLogo(BRAND.logo);paintThumbs();});
(function(){try{
  const tl=document.getElementById('topLogo');if(tl)tl.src=ASSETS.logo;
  const lk=document.createElement('link');lk.rel='icon';lk.href=ASSETS.logo;document.head.appendChild(lk);
}catch(e){}})();

/* ---------- safe zones: margin guide + (9:16) the strips the apps cover with their own buttons ---------- */
let SAFE=false;
function drawSafe(H){
  const ds=DS(W,H),M=ds.M;octx.save();
  if(ds.story){octx.fillStyle='rgba(220,38,38,.16)';octx.fillRect(0,0,W,H*.1);octx.fillRect(0,H*.92,W,H*.08);
    octx.fillStyle='rgba(220,38,38,.9)';octx.font='700 22px Montserrat,Arial';octx.textAlign='center';octx.fillText('APP UI - keep copy out',W/2,H*.05+8);octx.fillText('APP UI - keep copy out',W/2,H*.96+8)}
  octx.strokeStyle='rgba(0,150,255,.9)';octx.lineWidth=3;octx.setLineDash([14,10]);octx.strokeRect(M,ds.top,W-2*M,H-ds.top-ds.bot);
  octx.setLineDash([]);octx.fillStyle='rgba(0,150,255,.95)';octx.font='700 20px Montserrat,Arial';octx.textAlign='left';octx.textAlign='right';octx.fillText('Safe margin',W-M-8,H-ds.bot-10);
  octx.restore();
}
$('#safeBtn').addEventListener('click',()=>{SAFE=!SAFE;$('#safeBtn').setAttribute('aria-pressed',SAFE);render()});

/* ---------- Design check: measured, not guessed. Runs on a settled frame, never while the post is animating ---------- */
const CHK_KEY={head:'head',off:'off',sub:'osub',kicker:'kicker',num:'num',price:'fprice'};
const CHK_HINT={tiny:'Shorten it, or add a line break, so it can be set larger.',overlap:'Shorten one of the two, or pick a layout with more room.',margin:'Shorten the text or reduce line length.','rank-offer':'Shorten the offer, or make the headline shorter so it can be set bigger.','rank-sub':'Shorten the sub line.','rank-kicker':'Shorten the eyebrow.','head-small':'Break the headline over 2 lines or use fewer words.','photo-small':'Try a Gallery, Full-bleed or Diagonal layout for more product.','story-zone':'Keep copy inside the blue dashed safe margin.'};
let chkT=null,CHK_RES=null;
function scheduleCheck(){clearTimeout(chkT);chkT=setTimeout(runCheck,450)}
function runCheck(){
  const b=$('#checkBtn');if(!b)return;const tp=cur();
  if(state.rec||tp.free||!tp.id.startsWith('ev_')||!state.vals[tp.id]){b.hidden=true;return}
  b.hidden=false;const t0=state.t;state.t=state.D*.92;let res;
  try{res=lintCurrent()}catch(e){res={issues:[]}}finally{state.t=t0;render()}
  const seen=new Set(),iss=res.issues.filter(i=>{const k=i.code+i.msg;if(seen.has(k))return false;seen.add(k);return true});
  CHK_RES=iss;const errs=iss.filter(i=>i.sev==='error').length,n=iss.length;
  $('#checkDot').className=n?(errs?'err':'warn'):'ok';
  $('#checkTxt').textContent=n?(errs?errs+' to fix'+(n>errs?' · '+(n-errs)+' tips':''):n+' tip'+(n>1?'s':'')):'Design check passed';
  if(!$('#checkPop').hidden)fillCheckPop();
}
function fillCheckPop(){
  const p=$('#checkPop');p.innerHTML='';p.append(el('h4','','Design check'));
  if(!CHK_RES||!CHK_RES.length){p.append(el('div','ok','Type sizes, hierarchy, margins and overlaps all pass for this layout and size. Switch the format above and it re-checks.'));return}
  CHK_RES.forEach(i=>{
    const r=el('div','is '+i.sev);r.append(el('i'));const sp=el('span');sp.append(el('b','',i.msg));const h=CHK_HINT[i.code];if(h){sp.append(el('br'));sp.append(document.createTextNode(h))}r.append(sp);
    const key=i.fix&&CHK_KEY[i.fix.k];
    if(key){const bt=el('button','btn sm','Edit');bt.type='button';bt.addEventListener('click',()=>{setTab('content');$('#checkPop').hidden=true;
      const f=document.querySelector('#fields [data-key="'+key+'"]');if(f){const inp=f.querySelector('textarea,input,select');f.scrollIntoView({block:'center'});if(inp)inp.focus()}});r.append(bt)}
    p.append(r)});
}
$('#checkBtn').addEventListener('click',e=>{
  const p=$('#checkPop');if(!p.hidden){p.hidden=true;return}
  runCheck();fillCheckPop();p.hidden=false;const r=e.currentTarget.getBoundingClientRect();
  p.style.left=Math.max(8,Math.min(r.left,innerWidth-p.offsetWidth-8))+'px';p.style.bottom=(innerHeight-r.top+8)+'px';p.style.top='auto';
});
document.addEventListener('mousedown',e=>{const p=$('#checkPop');if(!p.hidden&&!p.contains(e.target)&&!$('#checkBtn').contains(e.target))p.hidden=true});

/* ---------- Guide: the Leon's design pattern, written down so any post follows it ---------- */
function buildGuide(){
  const g=$('#guideBox');if(!g)return;g.innerHTML='';g.className='guide';
  const H=(t)=>g.append(el('h4','',t)),P=(t)=>g.append(el('p','',t));
  H('How every Leon’s post is built');P('Every layout follows the same system, so a post made on Monday and one made in December still feel like one brand. The Design check chip under the canvas tests your post against these rules.');
  H('1 · Type ranks (big → small)');
  const ty=el('div','ty');[['Headline','EVENT NAME',20],['Offer','UP TO 50% OFF',17],['Sub line','Select sofas while stock lasts',12.5],['Eyebrow','FOR A LIMITED TIME',10.5],['Fine print','Proudly Canadian · since 1909',9.5]].forEach(([a,b,sz])=>{const d=el('div');d.append(el('b','',a));const s=el('span','',b);s.style.fontSize=sz+'px';s.style.fontWeight=a==='Headline'||a==='Offer'?900:a==='Eyebrow'?800:700;if(a==='Eyebrow')s.style.letterSpacing='.12em';d.append(s);ty.append(d)});g.append(ty);
  P('The event name leads. The offer is never bigger than the headline. Price cards sit below both. Type scales up automatically on taller posts.');
  H('2 · Colour has a job');
  const pal=el('div','pal');[['#FFE81A','Yellow','ground & energy'],['#111111','Black','authority & contrast'],['#C8102E','Red','price & urgency'],['#FFFFFF','White','calm, clean framing']].forEach(([h,n,d])=>{const x=el('div');const i=el('i');i.style.background=h;x.append(i);const t=el('span');t.innerHTML='<b>'+n+'</b><br>'+d;x.append(t);pal.append(x)});g.append(pal);
  P('Text colour follows the background automatically, so you can’t end up with dark-on-dark.');
  H('3 · Space');
  const ul=el('ul');['One 7% margin on every side. Nothing sits inside it (turn on Safe zones to see it).','9:16 also keeps copy out of the top and bottom strips the apps cover.','Photos get the room left after the copy is measured, never the other way round.'].forEach(t=>ul.append(el('li','',t)));g.append(ul);
  H('4 · Which layout for which job');
  const mp=el('div','map');[['gallery','Gallery','Financing, seasonal: calm, editorial, price-led'],['sunray','Sunray','Mega sales: one product, big energy'],['diagonal','Diagonal','Super sales: motion and a big offer'],['arch','Arch','Black Friday, premium: dark and luxe'],['ticket','Ticket','Appreciation, rewards, coupons'],['fullbleed','Full-bleed','Lifestyle photography as the hero']].forEach(([k,n,d])=>{const b=el('button');b.type='button';b.innerHTML=n+'<small>'+d+'</small>';b.addEventListener('click',()=>{const tp=cur();if(tp.free||!state.vals[tp.id]||!('layout' in state.vals[tp.id]))return;state.vals[tp.id].layout=k;dirty();buildFields();render();toast('Layout: '+LAYOUT_NAMES[k])});mp.append(b)});g.append(mp);
  H('5 · Before you post');
  const u2=el('ul');['Design check says “passed”.','One idea only: one event name, one offer, one price.','Headline readable at thumbnail size (squint test).','Legal line (O.A.C., dates) is in the sub line, not hidden.'].forEach(t=>u2.append(el('li','',t)));g.append(u2);
}
buildGuide();fontNote();buildTemplates();buildInspector();SAMPLE_IMG.complete||SAMPLE_IMG.addEventListener('load',()=>{paintThumbs();if(!cur().free)buildFields()});fitStage();requestAnimationFrame(tick);
document.fonts.addEventListener('loadingdone',()=>{paintThumbs();fontNote()});
Promise.race([Promise.all([document.fonts.load('900 40px "Proxima Nova"'),document.fonts.load('800 40px "Proxima Soft"'),document.fonts.load('900 40px "proxima-nova"'),document.fonts.load('800 40px "proxima-soft"'),document.fonts.load('900 40px Nunito'),document.fonts.load('800 40px Montserrat'),document.fonts.load('700 40px Montserrat')]),new Promise(r=>setTimeout(r,2500))]).then(()=>{paintThumbs();fontNote()}).catch(()=>{});
