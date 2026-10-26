
const W=1080;
/* Proxima Nova for text; Proxima Soft for the rounded sale numerals. Montserrat and Nunito are fallbacks only. */
const FNOVA='"Proxima Nova","proxima-nova","Montserrat",system-ui,sans-serif', FSOFT='"Proxima Soft","proxima-soft","Nunito","Proxima Nova","proxima-nova",system-ui,sans-serif';
let NT=0, ND=6;  /* current time + duration, set each render */
let FM=FNOVA, FN=FSOFT; /* the Typeface selector reassigns these */
function fontInstalled(name){const c=document.createElement('canvas').getContext('2d'),s='mmmmmmmmmmlliWQ@#';c.font='72px monospace';const a=c.measureText(s).width;c.font='72px "'+name+'", monospace';return c.measureText(s).width!==a}
function verdict(c,kind,x,y,r){c.save();c.translate(x,y);c.fillStyle=kind==='check'?'#22B24C':'#E4262C';c.beginPath();c.arc(0,0,r,0,7);c.fill();
  c.strokeStyle='#fff';c.lineWidth=r*.2;c.lineCap='round';c.lineJoin='round';c.beginPath();
  if(kind==='check'){c.moveTo(-r*.45,0);c.lineTo(-r*.1,r*.35);c.lineTo(r*.5,-r*.35)}else{c.moveTo(-r*.35,-r*.35);c.lineTo(r*.35,r*.35);c.moveTo(r*.35,-r*.35);c.lineTo(-r*.35,r*.35)}
  c.stroke();c.restore()}
const RATIOS={'4:5':1350,'1:1':1080,'9:16':1920};
const RNOTE={'4:5':'Instagram feed portrait','1:1':'Square feed post','9:16':'Stories, Reels, TikTok'};
const TAU=Math.PI*2;
const $=s=>document.querySelector(s);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};

/* ---------- helpers ---------- */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const prog=(t,s,d)=>clamp((t-s)/d);
const eOut=p=>1-Math.pow(1-p,3);
/* exact cubic-bezier curves (animation-principles quick reference) */
function cbez(x1,y1,x2,y2){
  const bx=u=>3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u, by=u=>3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u;
  return p=>{if(p<=0)return 0;if(p>=1)return 1;let lo=0,hi=1,u=p;
    for(let i=0;i<24;i++){const x=bx(u);if(Math.abs(x-p)<1e-5)break;if(x<p)lo=u;else hi=u;u=(lo+hi)/2}
    return by(u)}}
const eEnter=cbez(.16,1,.3,1), eExit=cbez(.7,0,.84,0), eMove=cbez(.65,0,.35,1), ePop=cbez(.34,1.56,.64,1);
const eBack=p=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)};
const wave=(t,D,k=1,ph=0)=>Math.sin((t/D*k+ph)*TAU);
/* ---------- whole-post animation styles: a per-template 'style' field (see leons.js) drives this,
   so text()/pop() and the Leon's masthead helpers all move the same way across one post. ---------- */
const POST_STYLES={
  classic:{name:'Classic cascade',stagger:1,durMul:1,textEase:eEnter,popEase:ePop},
  snap:{name:'Snap & pop',stagger:.5,durMul:.6,textEase:eBack,popEase:eBack},
  smooth:{name:'Smooth & calm',stagger:1.4,durMul:1.5,textEase:eOut,popEase:eOut},
  quick:{name:'Quick reveal',stagger:.22,durMul:.5,textEase:eEnter,popEase:eOut},
  dramatic:{name:'Dramatic build',stagger:1.7,durMul:1.05,textEase:eEnter,popEase:eBack}
};
function postStyle(){
  const tid=typeof state!=='undefined'&&state.tid,v=tid&&state.vals&&state.vals[tid],k=(v&&v.style)||'classic';
  return POST_STYLES[k]||POST_STYLES.classic;
}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
/* a handful of interchangeable path shapes for "the box behind the text" — rounded card, pill,
   sharp corners, chamfered ribbon, and a pointed price-tag — all driven off the same x,y,w,h,r. */
const BOX_STYLES={
  rounded:{name:'Rounded corners'}, pill:{name:'Pill capsule'}, sharp:{name:'Sharp corners'},
  ribbon:{name:'Cut corners (ribbon)'}, tag:{name:'Price tag'}
};
function boxPath(c,style,x,y,w,h,r){
  r=r==null?Math.min(18,h*.3):r;c.beginPath();
  if(style==='pill'){c.roundRect(x,y,w,h,h/2);return}
  if(style==='sharp'){c.rect(x,y,w,h);return}
  if(style==='ribbon'){
    const k=Math.min(r*1.3,h*.42,w*.42);
    c.moveTo(x+k,y);c.lineTo(x+w-k,y);c.lineTo(x+w,y+k);c.lineTo(x+w,y+h-k);c.lineTo(x+w-k,y+h);
    c.lineTo(x+k,y+h);c.lineTo(x,y+h-k);c.lineTo(x,y+k);c.closePath();return;
  }
  if(style==='tag'){
    const pt=Math.min(h*.5,w*.24),k=Math.min(r,h*.3);
    c.moveTo(x+pt,y);c.lineTo(x+w-k,y);c.quadraticCurveTo(x+w,y,x+w,y+k);
    c.lineTo(x+w,y+h-k);c.quadraticCurveTo(x+w,y+h,x+w-k,y+h);
    c.lineTo(x+pt,y+h);c.lineTo(x,y+h/2);c.closePath();return;
  }
  c.roundRect(x,y,w,h,r);
}
function font(c,wt,sz,fam){c.font=wt+' '+sz+'px '+fam}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=a<0?0:255,p=Math.abs(a);r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);return 'rgb('+r+','+g+','+b+')'}
function fitSize(c,txt,wt,fam,maxW,max){font(c,wt,max,fam);const w=c.measureText(txt).width;return w>maxW?max*maxW/w:max}
function wrap(c,txt,maxW){const out=[];String(txt).split('\n').forEach(par=>{const words=par.split(' ');let line='';words.forEach(w=>{const test=line?line+' '+w:w;if(c.measureText(test).width>maxW&&line){out.push(line);line=w}else line=test});out.push(line)});return out}
function text(c,o){
  const {s,x,y,size,wt=800,fam=FM,fill='#000',al='center',maxW=900,lh=1.08,t=99,at=0,gap=.07,dur=.5,rise=46,up=false,key}=o;
  const ST=postStyle();
  const str=up?String(s).toUpperCase():String(s);
  /* A per-field alignment choice (the Text style panel's Left/Centre/Right control, stored
     per template on styleFor(tid,key).al) only has an unambiguous meaning when the call's
     own x already sits at the horizontal CENTRE of its text column (maxW giving the column's
     width) - which is the convention nearly every call written with al defaulting to
     'center' already follows. A call that was written left- or right-anchored on purpose
     (x already *is* that edge, not the centre) keeps its own alignment untouched, since
     re-deriving an edge from a centre that was never computed would just misplace it. */
  let align=al,ax=x;
  if(al==='center'&&key){
    const tp=typeof cur==='function'?cur():null,ov=tp?styleFor(tp.id,key):null;
    if(ov&&ov.al&&ov.al!=='center'){
      align=ov.al;
      ax=align==='left'?x-maxW/2:x+maxW/2;
    }
  }
  font(c,wt,size,fam);c.textAlign=align;c.textBaseline='middle';c.fillStyle=fill;
  const lines=wrap(c,str,maxW);
  lines.forEach((ln,i)=>{const p=prog(t,(at+i*gap)*ST.stagger,dur*ST.durMul);if(p<=0)return;const e=ST.textEase(p);
    c.save();c.globalAlpha*=p;c.fillText(ln,ax,y+i*size*lh+size*lh/2+(1-e)*rise);c.restore()});
  return lines.length*size*lh;
}
function mixed(c,parts,cx,cy,size,wt,fam,maxW){
  font(c,wt,size,fam);let tot=parts.reduce((a,p)=>a+c.measureText(p[0]).width,0);let s=size;
  if(maxW&&tot>maxW){s=size*maxW/tot;font(c,wt,s,fam);tot=parts.reduce((a,p)=>a+c.measureText(p[0]).width,0)}
  let x=cx-tot/2;c.textAlign='left';c.textBaseline='middle';
  parts.forEach(p=>{c.fillStyle=p[1];c.fillText(p[0],x,cy);x+=c.measureText(p[0]).width});
}
function pop(c,cx,cy,t,at,fn,o={}){
  const ST=postStyle();
  const {dur=.65,from=0,ease=ST.popEase,rot=0}=o;const p=prog(t,at*ST.stagger,dur*ST.durMul);if(p<=0)return;
  const s=from+(1-from)*ease(p);c.save();c.translate(cx,cy);c.rotate(rot*(1-p));c.scale(s,s);c.globalAlpha*=clamp(p*3);fn();c.restore();
}
function countText(str,p){return String(str).replace(/\d[\d,]*/,m=>{const n=parseInt(m.replace(/,/g,''),10);const v=Math.round(n*eOut(p));return m.includes(',')?v.toLocaleString('en-US'):String(v)})}
function stack(c,lines,sizes,fill){
  c.fillStyle=fill;c.textAlign='center';c.textBaseline='middle';
  const hs=lines.map((_,i)=>sizes[Math.min(i,sizes.length-1)]);
  const tot=hs.reduce((a,b)=>a+b*.95,0);let y=-tot/2;
  lines.forEach((l,i)=>{const h=hs[i]*.95;font(c,900,hs[i],FN);c.fillText(l,0,y+h/2);y+=h});
}
function ph(c,x,y,w,h,label,dark){
  c.save();c.setLineDash([14,10]);c.lineWidth=3;
  c.strokeStyle=dark?'rgba(255,255,255,.55)':'rgba(0,0,0,.35)';c.fillStyle=dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.3)';
  rr(c,x,y,w,h,24);c.fill();c.stroke();c.setLineDash([]);
  c.fillStyle=dark?'rgba(255,255,255,.8)':'rgba(0,0,0,.6)';c.textAlign='center';c.textBaseline='middle';
  const s=Math.max(20,Math.min(34,Math.min(w,h)*.09));font(c,800,s,FM);
  c.fillText('+',x+w/2,y+h/2-s*.8);font(c,700,s*.8,FM);
  wrap(c,label,w-40).forEach((l,i)=>c.fillText(l,x+w/2,y+h/2+s*.5+i*s));c.restore();
}
/* wrappers that only group other objects (the logo row) must not be clickable themselves: clicking the
   empty space between the logo and the badge used to grab an invisible full-width box */
const OBJ_NOHIT=new Set(['obj:Logo bar']);
function objDraw(c,key,x,y,w,h,fn){
  if(typeof FR==='undefined'||!FR){fn();return}
  const m=c.getTransform(),ov=FR.ov[key],nohit=OBJ_NOHIT.has(key);let a=FR.anch[key];
  if(!a){const p=m.transformPoint(new DOMPoint(x+w/2,y+h/2));a=FR.anch[key]={x:p.x,y:p.y}}
  if(!nohit){(FR.objs=FR.objs||[]);if(!FR.objs.includes(key))FR.objs.push(key)}
  if(ov&&ov.hide)return;   /* deleted by the person: not drawn, not clickable (kept in the list so it can be restored) */
  let M=m;c.save();
  if(ov){const k=ov.sc||1,sx=k*(ov.sx||1)*(ov.flip?-1:1),sy=k*(ov.sy||1);
    M=new DOMMatrix().translateSelf(ov.dx,ov.dy).translateSelf(a.x,a.y).rotateSelf(ov.rot).scaleSelf(sx,sy).translateSelf(-a.x,-a.y).multiplySelf(m);
    c.setTransform(M);if(ov.op!==1&&ov.op!==undefined)c.globalAlpha*=ov.op}
  if(!nohit&&!(w>=W*.95&&h>=cv.height*.9)&&c.globalAlpha>.05)FR.hits.push({key,poly:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(p=>{const q=M.transformPoint(new DOMPoint(p[0],p[1]));return [q.x,q.y]})});
  /* text inside a sticker / quick element belongs to that element, never to a template field with similar words
     (a sticker saying "OFF" was being fused with the "OFF STOREWIDE" line into one giant selection box) */
  const own=key.startsWith('obj:Quick');if(own)FR.noMatch=(FR.noMatch||0)+1;
  try{fn()}finally{if(own)FR.noMatch--;c.restore()}
}
function drawImg(c,img,x,y,w,h,o={}){
  const lab=o.label||'Image';
  /* Tag this hit key as a real photo placeholder (as opposed to any other clickable
     object, like a badge or a card that happens to contain one) so the double-click
     handler knows it's safe to try mapping it back to an upload slot and open the file
     picker, instead of guessing for every object on the canvas. */
  if(typeof FR!=='undefined'&&FR)(FR.imgKeys=FR.imgKeys||new Set()).add('obj:'+lab);
  /* A plain contain-fit placeholder is sized for the old sample art, so an upload with a
     very different aspect ratio (a tall narrow cutout in a short wide box, say) used to sit
     letterboxed inside that fixed box — leaving a selection/drag rectangle much bigger than
     the photo actually drawn inside it. When a real image is loaded, shrink the registered
     box down to the size the image is actually drawn at (same anchor point), so clicking,
     dragging and the selection outline all hug the real picture instead of empty padding.
     Left untouched for cover/cover-safe, which are meant to fill their box edge to edge. */
  const fit=o.fit||'contain';
  if(img&&fit==='contain'&&img.naturalWidth&&img.naturalHeight){
    const ax=o.ax==null?.5:o.ax,ay=o.ay==null?.5:o.ay;
    const s=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;
    const bx=x+(w-dw)*ax,by=y+(h-dh)*ay;
    objDraw(c,'obj:'+lab,bx,by,dw,dh,()=>drawImgRaw(c,img,bx,by,dw,dh,o));
    return;
  }
  objDraw(c,'obj:'+lab,x,y,w,h,()=>drawImgRaw(c,img,x,y,w,h,o))
}
function drawImgRaw(c,img,x,y,w,h,o={}){
  const {ay=.5,ax=.5,label='Image',dark=false,shadow=0,fit='contain'}=o;
  if(!img){ph(c,x,y,w,h,label,dark);return}
  if(fit==='cover'||fit==='cover-safe'){
    const sCover=Math.max(w/img.naturalWidth,h/img.naturalHeight),sContain=Math.min(w/img.naturalWidth,h/img.naturalHeight);
    /* 'cover-safe' fills the box edge to edge exactly like 'cover' when the uploaded photo's own
       aspect ratio is reasonably close to the box's (the common case: box and photo are
       similar shapes, so the two scales are already close together) — but it caps how far the
       image is allowed to zoom in past a plain contain-fit, so a photo whose aspect ratio is
       very different from its box (a tall portrait dropped into a wide box, say) keeps most of
       its subject on screen instead of having its far edges cropped away to fill every corner. */
    const s=fit==='cover-safe'?Math.min(sCover,sContain*1.25):sCover;
    const dw=img.naturalWidth*s,dh=img.naturalHeight*s;
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(img,x+(w-dw)*ax,y+(h-dh)*ay,dw,dh);c.restore();return}
  const s=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;
  const dx=x+(w-dw)*ax,dy=y+(h-dh)*ay;
  if(shadow){c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=shadow;c.shadowOffsetY=shadow*.4;c.drawImage(img,dx,dy,dw,dh);c.restore()}else c.drawImage(img,dx,dy,dw,dh);
}
/* Every call site sized its logo box for the old single logo asset's ~2:1 aspect
   ratio. The selectable logo library (BUILTIN_LOGOS) includes a wide "logo +
   tagline" lockup (~4.7:1), and naively fitting that into a ~2:1 box shrinks it
   to keep its height down to a sliver. Treat h as the real target (the size the
   template was designed around) and derive width from the ACTIVE logo's own
   aspect ratio instead, so the mark stays legible whichever variant is picked;
   maxW still caps how wide it's allowed to get, for layouts with tight margins.
   Exposed separately from logo() so a caller that positions the logo by its
   left/right edge (not just its centre) can size it the same way first and
   place it without clipping. */
function logoBoxSize(h,maxW,I,mult){
  const img=(I&&I.logo)||(typeof state!=='undefined'?state.logo:null);
  const ar=(img&&img.naturalWidth&&img.naturalHeight)?img.naturalWidth/img.naturalHeight:((maxW||h*2)/h);
  let dh=h,dw=dh*ar;
  /* mult controls how far width may grow past the box the template author sized
     for the old ~2:1 asset. 2.6 is used for placements already checked to have
     enough margin around a growing logo (the masthead circle/card and the
     Event Posts logo bar, both centred or re-anchored to the real width); every
     other call keeps a conservative default so a wide "logo + tagline" lockup
     can't push past a tight corner badge. */
  const cap=(maxW||h*2)*(mult||1.6);
  if(dw>cap){dw=cap;dh=dw/ar}
  return {w:dw,h:dh};
}
function logo(c,I,cx,cy,w,h,mult){
  const k=(typeof state!=='undefined'&&state.logo2&&typeof state.logo2.scale==='number')?state.logo2.scale:1;
  const box=logoBoxSize(h*k,w*k,I,mult),dw=box.w,dh=box.h;
  objDraw(c,'obj:Logo',cx-dw/2,cy-dh/2,dw,dh,()=>logoFx(c,I,cx,cy,dw,dh));
}
/* Position a logo() call from its LEFT edge (logoAnchorX) or RIGHT edge (logoAnchorRightX)
   instead of guessing a fixed centre x. A call site that just hands logo() a centre x
   computed for the old ~2:1 assets will overflow once a wider "logo + tagline" lockup is
   selected, because the real rendered width (via logoBoxSize, same h/maxW/mult/scale
   this call will use) can be much wider than that assumption. These give the exact edge
   instead, so the margin stays correct for any logo's real aspect ratio. */
function logoAnchorX(edgeX,h,maxW,I,mult){
  const k=(typeof state!=='undefined'&&state.logo2&&typeof state.logo2.scale==='number')?state.logo2.scale:1;
  return edgeX+logoBoxSize(h*k,maxW*k,I,mult).w/2;
}
function logoAnchorRightX(edgeX,h,maxW,I,mult){
  const k=(typeof state!=='undefined'&&state.logo2&&typeof state.logo2.scale==='number')?state.logo2.scale:1;
  return edgeX-logoBoxSize(h*k,maxW*k,I,mult).w/2;
}
/* nine logo reveals, ported from the Remotion logo-reveal set */
function logoFx(c,I,cx,cy,w,h){
  const S=(typeof state!=='undefined'&&state.logo2)||null, fx=S?S.fx:'none';
  if(!fx||fx==='none'){logoRaw(c,I,cx,cy,w,h);return}
  const p=prog(NT,S.at,S.dur), e=eEnter(p);
  if(p<=0)return;
  const put=(dx,dy,sc,rot,al,blur)=>{c.save();c.globalAlpha*=al;c.translate(cx+dx,cy+dy);if(rot)c.rotate(rot);if(sc!==1)c.scale(sc,sc);
    if(blur&&'filter' in c)c.filter='blur('+blur.toFixed(2)+'px)';logoRaw(c,I,0,0,w,h);if('filter' in c)c.filter='none';c.restore()};
  switch(fx){
    case 'fade': put(0,0,1,0,e,0); break;
    case 'blur': put(0,0,.92+.08*e,0,clamp(p*1.6),(1-e)*h*.22); break;
    case 'bounce': {const d=p<1?-(1-eElastic(p))*h*2.2:0;put(0,d,1,0,clamp(p*4),0);break}
    case 'spin': put(0,0,e,(1-e)*Math.PI*3,clamp(p*2.5),0); break;
    case 'scaleRot': put(0,0,.3+.7*ePop(p),(1-e)*.5,clamp(p*3),0); break;
    case 'split': {
      const off=(1-eOut(p))*w*.9;
      c.save();c.beginPath();c.rect(cx-w,cy-h,w,h*2);c.clip();put(-off,0,1,0,clamp(p*2),0);c.restore();
      c.save();c.beginPath();c.rect(cx,cy-h,w,h*2);c.clip();put(off,0,1,0,clamp(p*2),0);c.restore();break}
    case 'wipe': {
      c.save();c.beginPath();c.rect(cx-w/2-4,cy-h/2-4,(w+8)*e,h+8);c.clip();put(0,0,1,0,1,0);c.restore();
      if(p<1){c.save();c.globalAlpha*=.9;c.fillStyle='#FFE81A';c.fillRect(cx-w/2+(w)*e-6,cy-h/2-6,8,h+12);c.restore()}break}
    case 'glitch': {
      if(p>=1){put(0,0,1,0,1,0);break}
      const k=1-p, r=rng(Math.floor(NT*24)+7), bands=7;
      c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=.5*k;
      put(-w*.05*k,0,1,0,1,0);put(w*.05*k,0,1,0,1,0);c.restore();
      for(let i=0;i<bands;i++){
        const y0=cy-h/2+i*h/bands, dx=(r()-.5)*w*.55*k, skip=r()<.18*k;
        if(skip)continue;
        c.save();c.beginPath();c.rect(cx-w,y0,w*2,h/bands+1);c.clip();
        c.globalAlpha*=clamp(p*2.2);c.translate(dx,0);logoRaw(c,I,cx,cy,w,h);c.restore();
      }
      if(r()<.5*k){c.save();c.globalAlpha*=.25*k;c.fillStyle='#fff';c.fillRect(cx-w/2,cy-h/2+r()*h,w,3);c.restore()}
      break}
    case 'strokeDraw': {
      const bw=w*1.22,bh=h*1.5,per=2*(bw+bh),dp=eEnter(prog(NT,S.at,S.dur*.65));
      c.save();c.strokeStyle=S.col||'#FFE81A';c.lineWidth=5;c.lineJoin='round';
      c.setLineDash([per,per]);c.lineDashOffset=per*(1-dp);
      c.beginPath();c.roundRect(cx-bw/2,cy-bh/2,bw,bh,18);c.stroke();c.setLineDash([]);c.restore();
      put(0,0,1,0,clamp(prog(NT,S.at+S.dur*.55,S.dur*.45)*1.5),0); break}
    default: put(0,0,1,0,1,0);
  }
}
function logoRaw(c,I,cx,cy,w,h){
  const img=(I&&I.logo)||state.logo;
  if(img){drawImgRaw(c,img,cx-w/2,cy-h/2,w,h);return}
  c.save();c.fillStyle='#FFE81A';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=4;c.setLineDash([12,8]);
  c.beginPath();c.ellipse(cx,cy,w/2,h/2,0,0,7);c.fill();c.stroke();c.setLineDash([]);
  c.fillStyle='#111';font(c,900,h*.26,FN);c.textAlign='center';c.textBaseline='middle';c.fillText('YOUR LOGO',cx,cy);c.restore();
}
function star(c,r){c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?r*.28:r;c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}c.closePath();c.fill()}
/* maple leaf, unit coordinates */
const LEAF=[[0,-1],[.13,-.74],[.26,-.8],[.25,-.46],[.54,-.6],[.47,-.3],[.9,-.2],[.7,.04],[.82,.22],[.42,.3],[.4,.5],[.1,.42],[.05,.55],[.05,1]];
function leafPath(c){c.beginPath();LEAF.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));for(let i=LEAF.length-1;i>=0;i--)c.lineTo(-LEAF[i][0],LEAF[i][1]);c.closePath()}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const partCache={};
function parts(kind,n){const key=kind+n;if(partCache[key])return partCache[key];const r=rng(kind.length*977+n),a=[];
  for(let i=0;i<n;i++)a.push({x:r(),y:r(),sz:r(),k:1+Math.floor(r()*2),rt:(r()<.5?-1:1)*(1+Math.floor(r()*2)),ph:r(),c:Math.floor(r()*5),k2:1+Math.floor(r()*3)});
  return partCache[key]=a}
const LEAFC=['#E8501C','#F28C1B','#D63A1E','#F5B21A','#C8391A'],CONF=['#FFFFFF','#111111','#E4262C','#FFFFFF','#111111'],HEARTC=['#E4262C','#FF6B81','#C8102E','#FF8FA3','#FF4D6D'];
/* unit heart, centred roughly on its own visual middle so rotate/scale behave like the other shapes */
function heartPath(c){c.beginPath();c.moveTo(0,.32);
  c.bezierCurveTo(0,.12,-.55,-.28,-.95,-.08);c.bezierCurveTo(-1.35,.16,-.6,.62,0,.95);
  c.bezierCurveTo(.6,.62,1.35,.16,.95,-.08);c.bezierCurveTo(.55,-.28,0,.12,0,.32);c.closePath()}
const AMBIENT_KINDS=[['none','None'],['leaves','Falling leaves'],['snow','Falling snow'],['confetti','Confetti'],['sparkle','Sparkle'],['bubbles','Rising bubbles'],['hearts','Rising hearts']];
function fx(c,W,H,t,D,kind,layer){
  if(!kind||kind==='none')return;
  const n={leaves:24,snow:70,confetti:60,sparkle:30,bubbles:26,hearts:20}[kind];if(!n)return;
  const all=parts(kind,n),span=H+240;
  all.forEach((q,i)=>{
    if(layer!==undefined&&(i%2)!==layer)return;
    if(kind==='sparkle'){const a=.5+.5*Math.sin(TAU*(t/D*q.k+q.ph));c.save();c.globalAlpha=a*.9;c.translate(q.x*W,q.y*H);c.rotate(q.ph*3);const s=a*.6+.4;c.scale(s,s);c.fillStyle='#fff';star(c,10+q.sz*26);c.restore();return}
    if(kind==='bubbles'){
      const y=H-(((q.y*span+q.k*span*t/D)%span)-120),x=q.x*W+Math.sin(TAU*(t/D*q.k2+q.ph))*22,r=6+q.sz*22;
      c.save();c.translate(x,y);c.globalAlpha=.3+.25*q.sz;
      const g=c.createRadialGradient(-r*.3,-r*.3,0,0,0,r);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,.08)');
      c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();
      c.globalAlpha=.5;c.strokeStyle='rgba(255,255,255,.65)';c.lineWidth=1.4;c.stroke();c.restore();return}
    if(kind==='hearts'){
      const y=H-(((q.y*span+q.k*span*t/D)%span)-120),x=q.x*W+Math.sin(TAU*(t/D*q.k2+q.ph))*26,s=12+q.sz*20;
      c.save();c.translate(x,y);c.globalAlpha=.85;c.rotate(Math.sin(TAU*(t/D*q.k2+q.ph))*.22);c.scale(s,s);c.fillStyle=HEARTC[q.c];heartPath(c);c.fill();c.restore();return}
    const y=((q.y*span+q.k*span*t/D)%span)-120,x=q.x*W+Math.sin(TAU*(t/D*q.k2+q.ph))*28;
    c.save();c.translate(x,y);
    if(kind==='leaves'){const s=26+q.sz*40;c.rotate(TAU*(q.ph+q.rt*t/D));c.scale(s*(.55+.45*Math.cos(TAU*(t/D*q.k2+q.ph))),s);c.fillStyle=LEAFC[q.c];leafPath(c);c.fill()}
    else if(kind==='snow'){c.globalAlpha=.85;c.fillStyle='#fff';c.beginPath();c.arc(0,0,3+q.sz*8,0,7);c.fill()}
    else{c.rotate(TAU*(q.ph+q.rt*t/D));c.fillStyle=CONF[q.c];const w=10+q.sz*10;c.fillRect(-w/2,-9,w,18)}
    c.restore();
  });
}


/* ---------- film effects (stack on any template) ---------- */
let GRAINTILE=null;
function grainTile(){
  if(GRAINTILE)return GRAINTILE;
  const n=256,cv2=document.createElement('canvas');cv2.width=cv2.height=n;
  const g=cv2.getContext('2d'),d=g.createImageData(n,n),r=rng(99);
  for(let i=0;i<n*n;i++){const v=200+Math.floor(r()*55);d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255}
  g.putImageData(d,0,0);return GRAINTILE=cv2;
}
function filmPre(c,W,H,t,D,F,still){
  if(!F)return;
  const u=t/D;
  if(F.zoom&&F.zoom!=='off'){const k=F.zoom==='in'?1+.09*u:1.09-.09*u;c.translate(W/2,H/2);c.scale(k,k);c.translate(-W/2,-H/2)}
  if(F.shake&&F.shake!=='off'&&!still){const a=F.shake==='strong'?14:5;
    c.translate(Math.sin(t*37.1)*a+Math.sin(t*19.7)*a*.6, Math.cos(t*31.3)*a*.8+Math.sin(t*23.9)*a*.4);
    c.rotate(Math.sin(t*17.3)*a*.0007)}
}
function filmPost(c,W,H,t,D,F){
  if(!F)return;
  const u=t/D;
  if(F.leak&&F.leak!=='off'){
    const warm=F.leak==='warm',x=W*(-.3+1.6*((u*1)%1)),g=c.createRadialGradient(x,H*.25,10,x,H*.25,W*.75);
    g.addColorStop(0,warm?'rgba(255,170,60,.42)':'rgba(90,170,255,.38)');g.addColorStop(1,'rgba(0,0,0,0)');
    c.save();c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
  }
  if(F.vig>0){const g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.32,W/2,H/2,Math.hypot(W,H)*.62);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(F.vig/100*.85).toFixed(3)+')');
    c.save();c.fillStyle=g;c.fillRect(0,0,W,H);c.restore()}
  if(F.grain>0){const tl=grainTile(),n=256,ox=Math.floor(Math.sin(t*53)*n),oy=Math.floor(Math.cos(t*61)*n);
    c.save();c.globalAlpha=F.grain/100*.3;c.globalCompositeOperation='overlay';
    for(let x=-n;x<W+n;x+=n)for(let y=-n;y<H+n;y+=n)c.drawImage(tl,x+ox%n,y+oy%n);c.restore()}
  if(F.bars&&F.bars!=='off'){
    /* proportional bars: a true 2.39:1 crop swallows a portrait poster, so these scale with the frame */
    const bh=H*({thin:.05,med:.1,wide:.16}[F.bars]||.1), k=eEnter(clamp(t/.6));
    c.save();c.fillStyle='#000';c.fillRect(0,0,W,bh*k);c.fillRect(0,H-bh*k,W,bh*k);c.restore()}
}
