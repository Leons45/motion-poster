/* ---------- Leon's "Event Posts": one template per campaign category, each switchable
   across 5 shared structural layouts so any category can use any composition. ---------- */
const EVENT_CATS=[
  ['megasale','Mega Sale'],['financing','Financing'],['appreciation','Appreciation'],
  ['supersale','Super Sale'],['seasonal','Seasonal'],['blackfriday','Black Friday'],
  ['buymore','Buy More Save More'],['clearance','Clearance'],['newarrivals','New Arrivals'],['delivery','Free Delivery'],['canadian','Proudly Canadian']
];
const LAYOUT_NAMES={circle:'Circle masthead',split:'Split panel',fullbleed:'Full-bleed photo',corner:'Corner badge',stacked:'Stacked bars',poster:'Centred poster',card:'Photo + content card',badge:'Title + offer badge',gallery:'Signature: Gallery',arch:'Signature: Arch',diagonal:'Signature: Diagonal',sunray:'Signature: Sunray',ticket:'Signature: Ticket'};
/* A function, not a shared object: each event template needs its OWN field object with
   its own default `v` (a fixed shared object here previously meant every category's
   "Layout" field silently defaulted to 'circle', ignoring the distinct layout each one
   was actually designed around). */
const layoutField=v=>({k:'layout',l:'Layout',t:'select',v:v||'circle',o:Object.keys(LAYOUT_NAMES).map(k=>[k,LAYOUT_NAMES[k]])});

/* ---------- shared grid + helpers for every layout ----------
   One safe margin (M = 7% of width) on all four sides, text blocks that are MEASURED before they
   are placed (so a value with line breaks reserves its real height instead of overlapping its
   neighbour), and colour choices that follow the background so nothing is ever dark-on-dark. */
const evM=W=>Math.round(W*.07);
/* DESIGN TOKENS. One function owns every size that depends on the canvas shape, so layouts never invent
   their own numbers. k scales type and the price card up on taller canvases (more room = bigger,
   easier-to-read type); story (9:16) also gets safe insets so nothing sits under the app's own UI. */
function DS(W,H){
  const r=H/W,story=r>1.6,k=story?1.2:r>1.2?1.07:1,M=evM(W);
  return {W,H,r,story,k,M,top:story?Math.round(H*.125):M,bot:story?Math.round(H*.105):M,sw:W-2*M,
    logoW:W*.17,micS:W*.02,pw:W*.32*(story?1.08:1),sub:W*.04,kick:W*.031,cap:W*.026};
}
function lum(h){const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return .5;const n=parseInt(m[1],16),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)}
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const inkOn=bg=>lum(bg)>.35?'#111111':'#ffffff';
const isDark=(a,b)=>(lum(a)+lum(b||a))/2<.3;
/* accent colour if it reads on this background, otherwise plain ink */
const accOn=(bg,acc)=>{acc=acc||'#C8102E';if(contrast(acc,bg)>=4.5)return acc;/* brand yellow is the house answer on dark grounds */if(contrast('#FFE81A',bg)>=7&&contrast(acc,bg)<4.5)return '#FFE81A';return contrast(acc,bg)>=3?acc:inkOn(bg)};
/* fit a (possibly multi-line) value: one shared size so every line fits maxW, plus its real height */
function evFit(c,str,wt,fam,maxW,maxSize,lh,minSize){
  lh=lh||1.08;
  let lines=String(str==null?'':str).split('\n').map(x=>x.replace(/\s+$/,'')).filter(x=>x.trim()!=='');
  if(!lines.length||maxSize<=0)return {lines:[],size:0,h:0,lh};
  let size=maxSize;lines.forEach(l=>{size=Math.min(size,fitSize(c,l,wt,fam,maxW,maxSize))});
  /* minSize: rather than let a long value shrink until it is unreadable, re-wrap it by words (up to 3
     lines) at the minimum size - the header stays prominent instead of collapsing into small print */
  if(minSize&&size<minSize){
    font(c,wt,minSize,fam);const w=[];lines.forEach(l=>wrap(c,l,maxW).forEach(x=>w.push(x)));
    if(w.length<=3&&w.length>=lines.length){lines=w;size=maxSize;lines.forEach(l=>{size=Math.min(size,fitSize(c,l,wt,fam,maxW,maxSize))})}
  }
  return {lines,size,h:lines.length*size*lh,lh};
}
/* offer / sub line / eyebrow blocks: a second line shrinks the type a little (same MLK rule as the
   canvas proxy) so a 2-line value still sits where one line did instead of dominating the post */
function evFitM(c,str,wt,fam,maxW,maxSize,lh,minSize){
  const n=String(str==null?'':str).split('\n').filter(x=>x.trim()!=='').length;
  return evFit(c,str,wt,fam,maxW,maxSize*(n>1?MLK(n):1),lh,minSize);
}
/* HEADLINE (the event name) leads; the offer sits just beneath it. The offer is capped to 85% of the
   headline but never below 60% of its own natural fit, so a very long headline cannot collapse the offer. */
function evDisplay(c,F,wT,wO,base,dem,minT,minO){
  const k=dem?.8:1,tb=evFit(c,F.head,900,FM,wT,base*k,1.08,minT);
  const nat=evFitM(c,F.off,900,FN,wO,base*.9*k,.98,minO);
  if(!tb.size||!nat.size)return {tb,ob:nat};
  const target=Math.max(Math.min(nat.size,tb.size*.85),nat.size*.6);
  return {tb,ob:target<nat.size-.01?evFit(c,F.off,900,FN,wO,target,.98,minO&&Math.min(minO,target)):nat};
}
/* draw a fitted block with its top edge at yTop; lines stay individually selectable */
function evLines(c,b,x,yTop,o){
  b.lines.forEach((l,i)=>text(c,{s:l,x,y:yTop+i*b.size*b.lh,size:b.size,wt:o.wt,fam:o.fam||FM,fill:o.fill,al:o.al||'left',t:o.t,at:(o.at||0)+i*.08,maxW:(o.maxW||900)*1.04,lh:b.lh}));
  return b.h;
}
/* Made-in-Canada badge. The artwork has dark "MADE IN" lettering, so on dark grounds it sits on
   a white chip. evMadeBox gives the VISIBLE size so edges can be aligned to the margin exactly. */
function evMadeBox(s,chip){
  const img=BRAND.canada,w=s*7,r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:.391,h=w*r,vw=w*.84;
  return chip?{w:vw+h*.5,h:h*1.2,aw:w,ah:h}:{w:vw,h:h,aw:w,ah:h};
}
function evMade(c,edge,cy,s,t,at,chip,align){
  const ST=postStyle(),p=ST.popEase(prog(t,at*ST.stagger,.5*ST.durMul));if(p<=0)return;
  const img=BRAND.canada,B=evMadeBox(s,chip),cx=align==='left'?edge+B.w/2:align==='center'?edge:edge-B.w/2;
  objDraw(c,'obj:Canada',cx-B.w/2,cy-B.h/2,B.w,B.h,()=>{c.save();c.translate(cx,cy);c.scale(p,p);
    if(chip){c.fillStyle='#fff';rr(c,-B.w/2,-B.h/2,B.w,B.h,B.h/2);c.fill()}
    brandBadge(c,img,0,0,B.aw);c.restore()});
}
/* price card: white on dark grounds, masthead-colour with accent price on light ones */
function evPrice(c,cx,cy,pw,F,dark,t,at){
  const ph=pw*.355,k=pw/180,fill=dark?'#ffffff':(F.mcol||'#111111');
  pop(c,cx,cy,t,at,()=>{
    objDraw(c,'obj:Price card',-pw/2,-ph/2,pw,ph,()=>{
      boxPath(c,F.boxStyle,-pw/2,-ph/2,pw,ph,10*k);c.fillStyle=fill;c.fill();
      font(c,700,16*k,FM);c.fillStyle=dark?'#111111':inkOn(fill);c.textAlign='center';c.textBaseline='middle';c.fillText(F.flab,0,-14*k,pw*.9);
      font(c,900,26*k,FN);c.fillStyle=dark?'#111111':accOn(fill,F.acc);c.fillText(F.fprice,0,14*k,pw*.9);
    });
  },{from:.75,dur:.6});
}
/* "UP TO" + an offer that already starts with "UP TO" must not read "UP TO UP TO 50%" */
const evPre=F=>(F.pre&&!String(F.off).toUpperCase().trim().startsWith(String(F.pre).toUpperCase().trim()))?F.pre:'';
const evLogoW=W=>W*.16;
/* Shared read of the Style tab's global logo-layout toggle, for every masthead-style
   logo row across the Event Posts layouts (not just the Circle masthead). 'center' is
   the engine's own default so this never needs a template to opt in. */
const evLogoAlign=()=>(typeof state!=='undefined'&&state.logoAlign)||'center';
/* TYPE HIERARCHY for every Event Post. Rank: title (the event name, headline) > offer > support (sub line)
   > label (eyebrow, small caps with tracking) > caption (tagline / fine print). TY gives each tier's
   size as a fraction of the layout's `base` (its hero size); evCap then caps a tier relative to the
   tier above AFTER fitting, so a long offer that had to shrink drags its headline down with it instead
   of ever being outranked by it. Weight, tracking and colour reinforce the rank: 900 for hero and
   title, 700 for support, tracked 800 caps in the accent colour for the label. */
const TY={title:1,offer:.85,support:.26,label:.2,caption:.15,num:1.15};
const evCap=(parent,ratio,fb)=>(parent&&parent.size)?Math.min(fb,parent.size*ratio):fb;
function evTracked(c,px,fn){const ok='letterSpacing' in c;if(ok)c.letterSpacing=px+'px';try{return fn()}finally{if(ok)c.letterSpacing='0px'}}
const evTrk=(size)=>size*.12;

/* ---------- layout 1: circle masthead + bottom arc (the house style) ---------- */
function layoutCircle(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H);
  yellowField(c,W,H,F.bg1,F.bg2);
  let m,titleSz=0;
  objDraw(c,'obj:Masthead',0,0,W,H*.46,()=>{
    m=mastCircle(c,W,H,t,I,F.mcol||'#111111',F.num?.37:.34);
    /* the masthead circle's lower edge curves UP toward the sides (~100px at the edge of a wide headline), so
       hand the headline a slightly shorter band: the block lifts and tightens instead of grazing the arc */
    titleSz=mastText(c,W,Object.assign({},m,{band:m.band-W*.05}),t,F.num,String(F.head).split('\n').filter(l=>l.trim()!==''),'#fff',accOn(F.mcol||'#111111',F.acc||LY),.4,.75,{cap:W*.1,nShare:.4,width:W*.8,chord:{cy:m.cy,R:m.R}});
  });
  /* badge top-right on the masthead, centred on the logo's line, flush to the margin */
  if(F.maple!=='no')evMade(c,W-M,H*.055,W*.019,t,1.3,isDark(F.mcol||'#111111'),'right');
  const fh=F.flab?H*.085:0,bandBottom=H-fh,pre=evPre(F),sw=W-2*M;
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.5,W,H*.5,()=>{
    arcTop=bottomArc(c,W,bandBottom,H*.715,F.mcol||'#111111',t,.55);
    const band=bandBottom-arcTop,mc=F.mcol||'#111111',offC=accOn(mc,F.acc||LY),txC=inkOn(mc);
    const ob=evFitM(c,F.off,900,FN,sw*(pre?.74:1),Math.min(band*.42,W*.15,titleSz?titleSz*.95:1e9));
    const sb=evFitM(c,F.osub,700,FM,sw,Math.max(ds.sub,evCap(ob,.3,Math.min(band*.16,W*.04))));
    const gap=sb.h?band*.06:0,total=ob.h+gap+sb.h,top=arcTop+(band-total)/2+band*.04;
    if(ob.lines.length===1&&pre){
      const ps=ob.size*.34;font(c,900,ob.size,FN);const ow=c.measureText(ob.lines[0]).width;font(c,900,ps,FM);const pw=c.measureText(pre).width,pg=ps*.55,x0=W/2-(pw+pg+ow)/2;
      c.save();c.globalAlpha=clamp(prog(t,1*ST.stagger,.5*ST.durMul));c.textBaseline='middle';c.textAlign='left';
      font(c,900,ps,FM);c.fillStyle=txC;c.fillText(pre,x0,top+ob.h/2);
      font(c,900,ob.size,FN);c.fillStyle=offC;c.fillText(ob.lines[0],x0+pw+pg,top+ob.h/2);c.restore();
    }else{
      c.save();c.globalAlpha=clamp(prog(t,1*ST.stagger,.5*ST.durMul));
      ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=offC;c.textAlign='center';c.textBaseline='middle';c.fillText(l,W/2,top+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore();
    }
    evLines(c,sb,W/2,top+ob.h+gap,{wt:800,fill:txC,al:'center',t,at:1.25,maxW:sw});
    if(F.flab){
      const p=ST.textEase(prog(t,1.4*ST.stagger,.6*ST.durMul)),acc=F.acc||'#C8102E',ink=inkOn(acc);
      c.save();c.translate(0,(1-p)*fh);c.fillStyle=acc;c.fillRect(0,H-fh,W,fh);
      const ls=fh*.3,ps=fh*.44;font(c,800,ls,FM);const lw=c.measureText(F.flab).width;
      font(c,900,ps,FN);const pw=c.measureText(F.fprice).width+fh*.7,gp=fh*.3,x0=W/2-(lw+gp+pw)/2;
      c.textBaseline='middle';c.textAlign='left';
      font(c,800,ls,FM);c.fillStyle=ink;c.fillText(F.flab,x0,H-fh/2);
      c.fillStyle=ink==='#111111'?'#111111':'#111111';boxPath(c,F.boxStyle,x0+lw+gp,H-fh*.88,pw,fh*.76,10);c.fill();
      font(c,900,ps,FN);c.fillStyle='#fff';c.fillText(F.fprice,x0+lw+gp+fh*.35,H-fh/2);c.restore();
    }
  });
  const ph=(arcTop-m.bottom)*1.12, pcy=(m.bottom+arcTop)/2;
  floorShadow(c,W/2,pcy+ph/2-6,W*.5,.26);
  pop(c,W/2,pcy,t,.5,()=>drawImg(c,I.p,-W*.42,-ph/2,W*.84,ph,{label:'Product photo'}),{from:.78,dur:.9});
  if(F.seal)pop(c,M+Math.min(130,W*.13)/2,m.bottom+H*.03+Math.min(130,W*.13)*.64,t,.9,()=>{
    const img=BRAND.best,w=Math.min(130,W*.13),r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276,h=w*r;
    objDraw(c,'obj:Seal',-w/2,-h/2,w,h,()=>brandBadge(c,img,0,0,w));
  },{from:.3,dur:.7,rot:.5});
}

/* ---------- layout 2: split — colour panel of copy beside the product (portrait / square),
   or ABOVE it on a 9:16 story, where a narrow side panel would starve both the copy and the photo ---------- */
function layoutSplit(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),V=ds.story;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,F.bg1);g.addColorStop(1,F.bg2);c.fillStyle=g;c.fillRect(0,0,W,H);
  const longW=Math.max(0,...String(F.head).split(/\s+/).map(w=>w.length)),panelW=V?W:W*(longW>9?.5:.44),panelH=V?H*.54:H,pad=V?M:W*.04,cx=panelW/2,cw=panelW-2*pad,mc=F.mcol||'#111111',pInk=inkOn(mc),pAcc=accOn(mc,F.acc||LY);
  const lw=(V?logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6):logoBoxSize(W*.065,W*.13,null,2.6)).w,lh=(V?logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6):logoBoxSize(W*.065,W*.13,null,2.6)).h,fh=F.flab?(V?H*.058:H*.075):0,rightDark=V?isDark(mc):isDark(F.bg1,F.bg2);
  objDraw(c,'obj:Masthead',0,0,panelW,panelH,()=>{
    const p=ST.textEase(prog(t,0,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=mc;c.fillRect(0,0,panelW,panelH);c.restore();
    pop(c,evLogoAlign()==='left'?M+lw/2-lw*.046:cx,ds.top+lh/2,t,.12,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6});
    /* measure the copy stack, then centre it in the space between logo and tagline */
    const hasN=!!F.num,areaTop=ds.top+lh+H*.03,areaBot=V?panelH-H*.03:H-ds.bot-H*.02;
    let sbase=V?Math.min(H*.06,W*.12):Math.min(H*.1,panelW*.3),hb,ob,sb,kb,ns,gK,gN,gH,gO,total;
    /* shrink the whole stack together until it fits the panel (a story's top half is the tightest case) */
    for(let it=0;it<10;it++){
      ({tb:hb,ob}=evDisplay(c,F,cw,cw,sbase,hasN,sbase*.78,sbase*.62));
      sb=evFitM(c,F.osub,700,FM,cw,Math.max(W*.034,evCap(ob,.42,V?W*.045:Math.min(H*.03,panelW*.09))),1.12,W*.03);
      let kMax=Math.max(ds.kick*.9,evCap(sb,.95,W*.03));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
      kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,cw,kMax,1.08,Math.min(W*.024,kMax)));
      ns=hasN?Math.min(V?H*.1:H*.15,fitSize(c,F.num,900,FN,cw,V?H*.1:H*.15))*(sbase<(V?Math.min(H*.06,W*.12):1e9)?sbase/(V?Math.min(H*.06,W*.12):sbase):1):0;
      gK=kb.h?kb.size*1.1:0;gN=ns?ns*.1:0;gH=hb.h?hb.size*.4:0;gO=sb.h?ob.size*.25:0;
      total=kb.h+gK+ns+gN+hb.h+gH+ob.h+gO+sb.h;
      if(total<=areaBot-areaTop)break;sbase*=.9;
    }
    let y=areaTop+Math.max(0,(areaBot-areaTop-total))*(V?.5:.42);
    if(kb.h){evTracked(c,evTrk(kb.size),()=>evLines(c,kb,cx,y,{wt:800,fill:pAcc,al:'center',t,at:.3,maxW:cw}));y+=kb.h+gK}
    if(ns){c.save();c.globalAlpha=clamp(prog(t,.5*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle=pInk;c.textAlign='center';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.55*ST.stagger,.9*ST.durMul)),cx,y+ns*.5);c.restore();y+=ns+gN}
    if(hb.h){evLines(c,hb,cx,y,{wt:900,fill:pInk,al:'center',t,at:.75,maxW:cw});y+=hb.h+gH}
    c.save();c.globalAlpha=clamp(prog(t,1.1*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=pAcc;c.textAlign='center';c.textBaseline='middle';c.fillText(l,cx,y+i*ob.size*ob.lh+ob.size*ob.lh/2,cw)});c.restore();y+=ob.h+gO;
    if(sb.h)evLines(c,sb,cx,y,{wt:700,fill:pInk,al:'center',t,at:1.3,maxW:cw});
  });
  /* photo region: beside the panel, or beneath it on a story */
  const rx=V?0:panelW,ry=V?panelH:0,pw=V?W:W-panelW,pcx=rx+pw/2,rp=W*.04,chipH=evMadeBox(W*.019,rightDark).h;
  const barH=V?fh:fh,barY=V?H-ds.bot-fh:H-fh;
  const rTop=V?ry+H*.02:ds.top+Math.max(chipH,0)+H*.025,rBot=V?barY-H*.02:H-fh-M*.7,rh=rBot-rTop,ph=rh*.9,pcy=rTop+rh/2;
  floorShadow(c,pcx,pcy+ph/2-6,pw*.72,.22);
  objDraw(c,'obj:Footer',rx,ry,pw,V?H-ry:H,()=>{
    pop(c,pcx,pcy,t,.6,()=>drawImg(c,I.p,-pw*(V?.46:.42),-ph/2,pw*(V?.92:.84),ph,{label:'Product photo'}),{from:.8,dur:.9});
  });
  if(F.seal){const sw=Math.min(130,pw*.26),img=BRAND.best,r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276;
    pop(c,rx+rp+sw/2,rTop+sw*r/2,t,.95,()=>{objDraw(c,'obj:Seal',-sw/2,-sw*r/2,sw,sw*r,()=>brandBadge(c,img,0,0,sw))},{from:.3,dur:.7,rot:.5})}
  if(F.maple!=='no')evMade(c,V?W-M:W-rp,ds.top+(V?lh/2:chipH/2),W*.019,t,1.6,rightDark,'right');
  if(F.flab){
    const bx=V?M:panelW,bw=V?W-2*M:pw;
    objDraw(c,'obj:Price card',bx,barY,bw,barH,()=>{
      const p=ST.textEase(prog(t,1.5*ST.stagger,.6*ST.durMul)),acc=F.acc||'#C8102E',ink=inkOn(acc);c.save();c.globalAlpha=p;
      c.fillStyle=acc;if(V){rr(c,bx,barY,bw,barH,barH*.25);c.fill()}else c.fillRect(bx,barY,bw,barH);
      let ls=barH*.3,ps=barH*.42;font(c,800,ls,FM);let a=c.measureText(F.flab).width;font(c,900,ps,FN);let b=c.measureText(F.fprice).width,gp=ls*.7;const fk=Math.min(1,(bw*.9)/(a+gp+b));if(fk<1){ls*=fk;ps*=fk;a*=fk;b*=fk;gp*=fk}const x0=bx+bw/2-(a+gp+b)/2;
      c.textBaseline='middle';c.textAlign='left';font(c,800,ls,FM);c.fillStyle=ink;c.fillText(F.flab,x0,barY+barH/2);
      font(c,900,ps,FN);c.fillText(F.fprice,x0+a+gp,barY+barH/2);c.restore();
    });
  }
}

/* ---------- layout 3: full-bleed product photo with a bottom gradient scrim ----------
   header row: logo flush-left, badge flush-right, on one centre line; copy block left-aligned at M
   and stacked bottom-up from the bottom margin; price card flush-right sharing the copy block's
   bottom edge. Nothing can overlap, whatever the ratio or text length. */
function layoutFullbleed(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.45)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  const g=c.createLinearGradient(0,H*.22,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.45,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,.92)');
  c.save();c.fillStyle=g;c.fillRect(0,H*.22,W,H*.78);c.restore();

  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=ds.top+rowH/2;
  objDraw(c,'obj:Logo bar',M,ds.top,W-2*M,rowH,()=>{
    pop(c,evLogoAlign()==='left'?M+lw/2-lw*.046:W/2,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6});
  });
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,.3,true,'right');

  const hasP=!!F.flab,pw2=ds.pw,ph2=pw2*.355,sw=W-2*M,hasN=!!F.num,base=Math.min(W*.14,H*.105)*ds.k;
  const acc=contrast(F.acc||LY,'#0a0a0a')>=4.5?(F.acc||LY):LY;
  const {tb:hb,ob}=evDisplay(c,F,sw,sw,base,hasN,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw,Math.max(ds.sub,evCap(ob,.32,base*.3)));
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.26));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  const ns=hasN?Math.min(base*1.1,fitSize(c,F.num,900,FN,sw,base*1.1)):0;
  let y=H-ds.bot;
  if(hasP)y-=ph2+H*.03;
  const subTop=y-sb.h;y=subTop-(sb.h?sb.size*.5:0);
  const offTop=y-ob.h;y=offTop-(hb.h?hb.size*.1:0);
  const headTop=y-hb.h;y=headTop-(kb.h?kb.size*.6:0);
  const kTop=y-kb.h;y=kTop-(ns?ns*.3+kb.size*.4:0);
  const numTop=y-ns;
  if(ns){c.save();c.globalAlpha=clamp(prog(t,.6*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.65*ST.stagger,.9*ST.durMul)),M,numTop+ns*.5);c.restore()}
  if(kb.h)evTracked(c,evTrk(kb.size),()=>evLines(c,kb,M,kTop,{wt:800,fill:acc,t,at:.3,maxW:sw}));
  if(hb.h)evLines(c,hb,M,headTop,{wt:900,fill:'#fff',t,at:.9,maxW:sw});
  if(ob.h){c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=acc;c.textAlign='left';c.textBaseline='middle';c.fillText(l,M,offTop+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore()}
  if(sb.h)evLines(c,sb,M,subTop,{wt:700,fill:'rgba(255,255,255,.86)',t,at:1.6,maxW:sw});
  if(hasP)evPrice(c,M+pw2/2,H-ds.bot-ph2/2,pw2,F,true,t,1.7);
}

/* ---------- layout 4: header, centred product, eyebrow + headline, price card; offer badge
   overlaps the product frame's top-right corner (never the header) ---------- */
function layoutCorner(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),dark=isDark(F.bg1,F.bg2),ink=inkOn(dark?'#000000':'#ffffff'),acc=F.acc||'#C8102E';
  yellowField(c,W,H,F.bg1,F.bg2);
  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,dark),rowH=Math.max(lh,MB.h),rowCy=ds.top+rowH/2;
  objDraw(c,'obj:Masthead',M,ds.top,W-2*M,rowH,()=>{
    pop(c,evLogoAlign()==='left'?M+lw/2-lw*.046:W/2,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6});
  });
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,1.8,dark,'right');
  const sw=W-2*M,pw2=ds.pw*1.08,ph2=pw2*.355; /* price card stays below the headline in rank */
  const bw=W*.5,cbase=Math.min(W*.115,H*.085)*ds.k*ds.k;
  const {tb:hb,ob}=evDisplay(c,F,sw,bw*.84,cbase,false,cbase*.7,cbase*.5);
  const sb=evFitM(c,F.osub,700,FM,bw*.84,Math.max(bw*.062,evCap(ob,.26,bw*.075)),1.12,bw*.055);
  const kMax=Math.min(Math.max(ds.kick,Math.min(evCap(hb,.3,W*.034),sb.size?sb.size:1e9)),sb.size?sb.size*.97:1e9);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.026));
  let y=H-ds.bot;
  if(F.flab)y-=ph2+H*.025;
  const headTop=y-hb.h;y=headTop-(kb.h?kb.size*.7:0);
  const kTop=y-kb.h;y=kTop-H*.025;
  const photoTop=ds.top+rowH+H*.025,photoH=Math.max(H*.2,y-photoTop),pcy=photoTop+photoH/2;
  floorShadow(c,W/2,photoTop+photoH-photoH*.04,W*.5,.24);
  pop(c,W/2,pcy,t,.6,()=>drawImg(c,I.p,-W*.4,-photoH/2,W*.8,photoH,{label:'Product photo'}),{from:.8,dur:.9});
  /* offer badge: tilted sticker pinned to the photo frame's top-right corner, right edge on the margin */
  const bh=Math.max(bw*.3,ob.h+sb.h+(sb.h?ob.size*.2:0)+bw*.12),bcx=W-M-bw/2-W*.008,bcy=photoTop+bh*.5;
  objDraw(c,'obj:Corner badge',bcx-bw/2,bcy-bh/2,bw,bh,()=>{
    const p=ST.popEase(prog(t,.4*ST.stagger,.6*ST.durMul));if(p<=0)return;
    c.save();c.translate(bcx,bcy);c.rotate(-.07*p);c.scale(p,p);
    c.fillStyle=acc;rr(c,-bw/2,-bh/2,bw,bh,bw*.04);c.fill();
    const bi=inkOn(acc),tot=ob.h+(sb.h?ob.size*.2+sb.h:0);let yy=-tot/2;
    font(c,900,ob.size,FN);c.fillStyle=bi;c.textAlign='center';c.textBaseline='middle';
    ob.lines.forEach((l,i)=>c.fillText(l,0,yy+i*ob.size*ob.lh+ob.size*ob.lh/2,bw*.86));yy+=ob.h+(sb.h?ob.size*.2:0);
    sb.lines.forEach((l,i)=>{font(c,700,sb.size,FM);c.fillStyle=bi;c.fillText(l,0,yy+i*sb.size*sb.lh+sb.size*sb.lh/2,bw*.86)});
    c.restore();
  });
  if(kb.h)evTracked(c,evTrk(kb.size),()=>evLines(c,kb,W/2,kTop,{wt:800,fill:accOn(dark?'#000000':'#ffffff',acc),al:'center',t,at:.9,maxW:sw}));
  if(hb.h)evLines(c,hb,W/2,headTop,{wt:900,fill:ink,al:'center',t,at:1,maxW:sw});
  if(F.flab)evPrice(c,W/2,H-ds.bot-ph2/2,pw2,F,dark,t,1.6);
}

/* ---------- layout 5: horizontal stacked colour bands ----------
   The logo here stays left-fixed on purpose, not wired to the global logo-layout toggle:
   the eyebrow is centred in the exact gap between the logo and the Made-in-Canada badge,
   so moving the logo to the middle of the bar would run it straight into that text. */
function layoutStacked(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),mc=F.mcol||'#111111',acc=F.acc||'#C8102E';
  c.fillStyle=F.bg2||'#111';c.fillRect(0,0,W,H);
  const barH=H*.12,lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,isDark(mc));
  objDraw(c,'obj:Masthead',0,0,W,barH,()=>{
    const p=ST.textEase(prog(t,0,.5*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=mc;c.fillRect(0,0,W,barH);c.restore();
    pop(c,M+lw/2-lw*.046,barH/2,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6});
    /* eyebrow centred in the room left between logo and badge */
    const side=Math.max(lw,F.maple!=='no'?MB.w:0),kw=W-2*(M+side+W*.03),kMax=W*.03,kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,kw,kMax,1.08,W*.022));
    if(kb.h)evTracked(c,evTrk(kb.size),()=>evLines(c,kb,W/2,barH/2-kb.h/2,{wt:800,fill:lum(acc)>.3&&contrast(acc,mc)>=4.5?acc:inkOn(mc),al:'center',t,at:.3,maxW:kw}));
  });
  if(F.maple!=='no')evMade(c,W-M,barH/2,micS,t,.3,isDark(mc),'right');
  let titleSz=0;const hBandH=H*.22,hBandY=barH;
  objDraw(c,'obj:Headline band',0,hBandY,W,hBandH,()=>{
    c.fillStyle=F.bg1;c.fillRect(0,hBandY,W,hBandH);
    const n=Math.max(1,String(F.head).split('\n').filter(l=>l.trim()!=='').length);
    const hb=evFit(c,F.head,900,FM,W-2*M,Math.min(hBandH*.8/(n*1.08),W*.135),1.08,W*.07);titleSz=hb.size;
    if(hb.h)evLines(c,hb,W/2,hBandY+(hBandH-hb.h)/2,{wt:900,fill:inkOn(F.bg1),al:'center',t,at:.4,maxW:W-2*M});
  });
  const pBandY=hBandY+hBandH,pBandH=H*.44;
  objDraw(c,'obj:Footer',0,pBandY,W,pBandH,()=>{
    floorShadow(c,W/2,pBandY+pBandH*.86,W*.46,.22);
    pop(c,W/2,pBandY+pBandH/2,t,.6,()=>drawImg(c,I.p,-W*.44,-pBandH*.45,W*.88,pBandH*.9,{label:'Product photo'}),{from:.8,dur:.9});
  });
  const oBandY=pBandY+pBandH,oBandH=H-oBandY,ink=inkOn(acc),sw=W-2*M;
  objDraw(c,'obj:Price card',0,oBandY,W,oBandH,()=>{
    const p=ST.textEase(prog(t,1.3*ST.stagger,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=acc;c.fillRect(0,oBandY,W,oBandH);c.restore();
    const pad=oBandH*.12,avail=oBandH-2*pad;
    const ob=evFitM(c,F.off,900,FN,sw,Math.min(avail*.55,W*.15,titleSz?titleSz*.95:1e9),.98);
    const sb=evFitM(c,F.osub,700,FM,sw,Math.max(ds.sub,evCap(ob,.3,Math.min(avail*.2,W*.04))));
    const gap=sb.h?ob.size*.18:0,top=oBandY+(oBandH-(ob.h+gap+sb.h))/2;
    c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.fillText(l,W/2,top+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore();
    if(sb.h)evLines(c,sb,W/2,top+ob.h+gap,{wt:800,fill:ink,al:'center',t,at:1.6,maxW:sw});
  });
}

/* ---------- layout 6: centred poster — everything centred over a darkened photo ---------- */
function layoutPoster(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),acc=contrast(F.acc||LY,'#0a0a0a')>=4.5?(F.acc||LY):LY;
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.5,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,.82)');
  c.save();c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,true),hasM=F.maple!=='no';
  const lx=evLogoAlign()==='left'?M+lw/2-lw*.046:W/2;
  objDraw(c,'obj:Logo bar',M,ds.top,W-2*M,lh,()=>{pop(c,lx,ds.top+lh/2,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6})});
  if(hasM)evMade(c,lx,ds.top+lh+H*.02+MB.h/2,micS,t,.3,true,'center');
  const headerBottom=ds.top+lh+(hasM?H*.02+MB.h:0);
  const hasP=!!F.flab,pw2=ds.pw,ph2=pw2*.355,sw=W-2*M,hasN=!!F.num,base=Math.min(W*.14,H*.105)*ds.k;
  const {tb:hb,ob}=evDisplay(c,F,sw,sw,base,hasN,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw,Math.max(ds.sub,evCap(ob,.32,base*.3)),1.12,W*.028);
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.26));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  const ns=hasN?Math.min(base*1.1,fitSize(c,F.num,900,FN,sw,base*1.1)):0;
  const gK=kb.h?kb.size*.6:0,gN=ns?ns*.2:0,gH=hb.h?hb.size*.1:0,gS=sb.h?sb.size*.5:0,gP=hasP?H*.035:0;
  const total=ns+gN+kb.h+gK+hb.h+gH+ob.h+gS+sb.h+gP+(hasP?ph2:0);
  let y=Math.max(headerBottom+H*.03,Math.min(H*.53-total/2,H-ds.bot-total));
  if(ns){c.save();c.globalAlpha=clamp(prog(t,.6*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.65*ST.stagger,.9*ST.durMul)),W/2,y+ns*.5);c.restore();y+=ns+gN}
  if(kb.h){const ky=y;evTracked(c,evTrk(kb.size),()=>evLines(c,kb,W/2,ky,{wt:800,fill:acc,al:'center',t,at:.3,maxW:sw}));y+=kb.h+gK}
  if(hb.h){evLines(c,hb,W/2,y,{wt:900,fill:'#fff',al:'center',t,at:.9,maxW:sw});y+=hb.h+gH}
  if(ob.h){c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=acc;c.textAlign='center';c.textBaseline='middle';c.fillText(l,W/2,y+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore();y+=ob.h+gS}
  if(sb.h){evLines(c,sb,W/2,y,{wt:700,fill:'rgba(255,255,255,.86)',al:'center',t,at:1.6,maxW:sw});y+=sb.h+gP}
  if(hasP)evPrice(c,W/2,y+ph2/2,pw2,F,true,t,1.7);
}

/* ---------- layout 7: photo on top, rounded content card overlapping its lower edge ---------- */
function layoutCard(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),mc=F.mcol||'#111111',ink=inkOn(mc),acc=accOn(mc,F.acc||LY);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  const hasP=!!F.flab,pw2=ds.pw,ph2=pw2*.355,sw=W-2*M,gap=W*.03,wO=hasP?sw-pw2-gap:sw,base=Math.min(W*.125,H*.092)*ds.k;
  const {tb:hb,ob}=evDisplay(c,F,sw,wO,base,false,base*.7);
  const sb=evFitM(c,F.osub,700,FM,wO,Math.max(ds.sub,evCap(ob,.32,base*.3)),1.12,W*.028);
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.26));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.026));
  const gK=kb.h?kb.size*.6:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.5:0;
  const rowH2=Math.max(ob.h+(sb.h?gS+sb.h:0),hasP?ph2:0),padT=H*.04;
  const cardTop=H-ds.bot-(kb.h+gK+hb.h+gH+rowH2)-padT,overlap=H*.05;
  objDraw(c,'obj:Masthead',0,0,W,cardTop+overlap,()=>{drawImg(c,I.p,0,0,W,cardTop+overlap,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.5)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=ds.top+rowH/2;
  objDraw(c,'obj:Logo bar',M,ds.top,W-2*M,rowH,()=>{pop(c,evLogoAlign()==='left'?M+lw/2-lw*.046:W/2,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6})});
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,.3,true,'right');
  objDraw(c,'obj:Footer',0,cardTop,W,H-cardTop,()=>{
    const p=ST.textEase(prog(t,.15,.6*ST.durMul));c.save();c.globalAlpha=p;c.translate(0,(1-p)*H*.05);
    c.fillStyle=mc;c.beginPath();c.roundRect(0,cardTop,W,H-cardTop+4,[W*.05,W*.05,0,0]);c.fill();c.restore();
  });
  let y=cardTop+padT;
  if(kb.h){const ky=y;evTracked(c,evTrk(kb.size),()=>evLines(c,kb,M,ky,{wt:800,fill:acc,t,at:.3,maxW:sw}));y+=kb.h+gK}
  if(hb.h){evLines(c,hb,M,y,{wt:900,fill:ink,t,at:.9,maxW:sw});y+=hb.h+gH}
  if(ob.h){c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=acc;c.textAlign='left';c.textBaseline='middle';c.fillText(l,M,y+i*ob.size*ob.lh+ob.size*ob.lh/2,wO)});c.restore()}
  if(sb.h)evLines(c,sb,M,y+ob.h+gS,{wt:700,fill:ink==='#ffffff'?'rgba(255,255,255,.82)':'rgba(17,17,17,.82)',t,at:1.6,maxW:wO});
  if(hasP)evPrice(c,W-M-pw2/2,y+rowH2-ph2/2,pw2,F,isDark(mc),t,1.7);
}

/* ---------- layout 8: title-led over the photo, offer in a round badge, price + sub bottom-left ---------- */
function layoutBadge(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),ds=DS(W,H),acc=F.acc||LY,bi=inkOn(acc);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.62);gt.addColorStop(0,'rgba(0,0,0,.68)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.62);c.restore();
  const gb=c.createLinearGradient(0,H*.6,0,H);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(1,'rgba(0,0,0,.6)');
  c.save();c.fillStyle=gb;c.fillRect(0,H*.6,W,H*.4);c.restore();
  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=ds.top+rowH/2;
  objDraw(c,'obj:Logo bar',M,ds.top,W-2*M,rowH,()=>{pop(c,evLogoAlign()==='left'?M+lw/2-lw*.046:W/2,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh,2.6),{from:.7,dur:.6})});
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,.3,true,'right');
  const r=W*.215,hasP=!!F.flab,pw2=ds.pw,ph2=pw2*.355,sw=W-2*M,base=Math.min(W*.14,H*.105)*ds.k,gap=W*.03;
  const hb=evFit(c,F.head,900,FM,sw,base,1.08,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw-2*r-gap,Math.max(ds.sub,evCap(hb,.3,base*.3)),1.12,W*.028);
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.26));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  let y=ds.top+rowH+H*.04;
  if(kb.h){const ky=y;evTracked(c,evTrk(kb.size),()=>evLines(c,kb,M,ky,{wt:800,fill:contrast(acc,'#0a0a0a')>=4.5?acc:LY,t,at:.3,maxW:sw}));y+=kb.h+kb.size*.6}
  if(hb.h)evLines(c,hb,M,y,{wt:900,fill:'#fff',t,at:.9,maxW:sw});
  /* offer badge, bottom-right on the margin */
  const bcx=W-M-r,bcy=H-ds.bot-r,ob=evFit(c,F.off,900,FN,r*1.38,Math.min(r*.62,hb.size?hb.size*.95:1e9),.98,r*.3);
  pop(c,bcx,bcy,t,1.3,()=>{
    objDraw(c,'obj:Corner badge',-r,-r,2*r,2*r,()=>{
      c.fillStyle=acc;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();
      c.strokeStyle=bi==='#ffffff'?'rgba(255,255,255,.45)':'rgba(17,17,17,.4)';c.lineWidth=Math.max(3,r*.025);c.setLineDash([r*.07,r*.05]);c.beginPath();c.arc(0,0,r*.9,0,TAU);c.stroke();c.setLineDash([]);
      font(c,900,ob.size,FN);c.fillStyle=bi;c.textAlign='center';c.textBaseline='middle';
      ob.lines.forEach((l,i)=>c.fillText(l,0,-ob.h/2+i*ob.size*ob.lh+ob.size*ob.lh/2,r*1.5));
    });
  },{from:.6,dur:.7,rot:.3});
  /* bottom-left stack: sub line above the price card */
  let yb=H-ds.bot;
  if(hasP){evPrice(c,M+pw2/2,yb-ph2/2,pw2,F,true,t,1.7);yb-=ph2+H*.025}
  if(sb.h)evLines(c,sb,M,yb-sb.h,{wt:700,fill:'rgba(255,255,255,.9)',t,at:1.6,maxW:sw-2*r-gap});
}

/* ---------- SIGNATURE layouts: five high-end compositions drawn from the leons.ca language
   (brand yellow, black, a red accent, all-caps headlines, "proudly Canadian since 1909" heritage line).
   They use the same grid, measured text and type hierarchy as the layouts above. ---------- */
const evSinceDefault='PROUDLY CANADIAN · SINCE 1909';
function evTopRow(c,W,yT,t,I,F,o){
  o=o||{};const M=evM(W),lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,micS=W*.019,MB=evMadeBox(micS,!!o.chip),rowH=Math.max(lh,MB.h),cy=yT+rowH/2;
  const lx=evLogoAlign()==='left'?M+lw/2-lw*.046:W/2;
  objDraw(c,'obj:Logo bar',M,yT,W-2*M,rowH,()=>{pop(c,lx,cy,t,.1,()=>{
    logo(c,I,0,0,lw,lh,2.6)},{from:.7,dur:.6})});
  if(F.maple!=='no')evMade(c,W-M,cy,micS,t,.3,!!o.chip,'right');
  return yT+rowH;
}
const evSinceH=(W,F)=>String(F.since==null?evSinceDefault:F.since).trim()?W*.025*1.55:0;
function evSince(c,W,M,t,F,cy,fill,al){
  const s=String(F.since==null?evSinceDefault:F.since);if(!s.trim())return;
  const sz=W*.025,x=al==='left'?M:al==='right'?W-M:W/2;
  evTracked(c,sz*.18,()=>text(c,{s:s.toUpperCase(),x,y:cy-sz*.55,size:sz,wt:700,fam:FM,fill,al:al||'center',t,at:2,maxW:W-2*M}));
}
/* measured kicker / headline / offer / sub blocks, headline first in rank */
function evBlocks(c,W,H,F,o){
  const ds=DS(W,H),base=Math.min(W*(o.bw||.12),H*(o.bh||.088))*ds.k,wO=o.wO||o.sw;
  const {tb:hb,ob}=evDisplay(c,F,o.sw,wO,base,!!o.dem,base*.72,o.minO);
  /* the offer never outranks the headline, whatever the text length */
  if(hb.size&&ob.size>hb.size*.95){const nb=evFit(c,F.off,900,FN,wO,hb.size*.95,.98);ob.lines=nb.lines;ob.size=nb.size;ob.h=nb.h}
  const sb=evFitM(c,F.osub,700,FM,wO,Math.max(ds.sub,evCap(ob,.34,base*.34)),1.12,W*.03);
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.28));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,o.sw,kMax,1.08,Math.min(W*.027,kMax)));
  return {hb,ob,sb,kb,ds};
}
function evOffer(c,ob,x,y,fill,al,t,maxW){
  const ST=postStyle();c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
  ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=fill;c.textAlign=al;c.textBaseline='middle';c.fillText(l,x,y+i*ob.size*ob.lh+ob.size*ob.lh/2,maxW)});c.restore();
}
function evKick(c,kb,x,y,fill,al,t,maxW){evTracked(c,evTrk(kb.size),()=>evLines(c,kb,x,y,{wt:800,fill,al,t,at:.3,maxW}))}
/* photo revealed inside any clip shape (default: rounded rectangle) */
function evPhoto(c,I,x,y,w,h,r,t,at,pathFn){
  const ST=postStyle(),p=ST.textEase(prog(t,at*ST.stagger,.7*ST.durMul));
  c.save();c.globalAlpha=p;c.translate(0,(1-p)*h*.03);
  c.beginPath();if(pathFn)pathFn();else c.roundRect(x,y,w,h,r);c.clip();
  drawImg(c,I.p,x,y,w,h,{label:'Product photo',fit:'cover'});c.restore();
}
const evRise=(c,t,at,H,fn)=>{const ST=postStyle(),p=ST.textEase(prog(t,at*ST.stagger,.6*ST.durMul));c.save();c.globalAlpha=p;c.translate(0,(1-p)*H*.03);fn();c.restore()};

/* S1 Gallery: editorial, keylined frame, headline above a wide framed photo, offer + price on a clean base */
function layoutGallery(c,W,H,t,D,F,I){
  const M=evM(W),ds=DS(W,H),g=F.bg1,ink=inkOn(g),dark=isDark(g),acc=accOn(g,F.acc||LY),sw=W-2*M;
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const fi=W*.024;c.save();c.strokeStyle=dark?'rgba(255,255,255,.42)':'rgba(17,17,17,.9)';c.lineWidth=Math.max(2,W*.0028);c.strokeRect(fi,fi,W-2*fi,H-2*fi);c.restore();
  const hasP=!!F.flab,pw=ds.pw,ph=pw*.355,gap=W*.03,wO=hasP?sw-pw-gap:sw;
  const {hb,ob,sb,kb}=evBlocks(c,W,H,F,{sw,wO,bw:.115,bh:.082});
  const top=evTopRow(c,W,ds.top,t,I,F,{chip:dark});
  const sinceH=evSinceH(W,F),gK=kb.h?kb.size*.55:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.45:0;
  const botH=Math.max(ob.h+(sb.h?gS+sb.h:0),hasP?ph:0);
  let y=top+H*.03;
  if(kb.h){evKick(c,kb,M,y,acc,'left',t,sw);y+=kb.h+gK}
  if(hb.h){evLines(c,hb,M,y,{wt:900,fill:ink,t,at:.9,maxW:sw});y+=hb.h+gH}
  const pTop=y+H*.012,pBot=H-ds.bot-sinceH-H*.02-botH-H*.028,pH=Math.max(pBot-pTop,H*.16);
  evPhoto(c,I,M,pTop,sw,pH,W*.014,t,.35);
  let by=pTop+pH+H*.028;
  if(ob.h)evOffer(c,ob,M,by,acc,'left',t,wO);
  if(sb.h)evLines(c,sb,M,by+ob.h+gS,{wt:700,fill:dark?'rgba(255,255,255,.85)':'rgba(17,17,17,.82)',t,at:1.6,maxW:wO});
  if(hasP)evPrice(c,W-M-pw/2,by+botH/2,pw,F,dark,t,1.7);
  evSince(c,W,M,t,F,H-ds.bot-sinceH/2,dark?'rgba(255,255,255,.7)':'rgba(17,17,17,.62)','center');
}

/* S2 Arch: black luxe, centred; photo in an arched window with a brand-yellow keyline, offer set into its foot */
function layoutArch(c,W,H,t,D,F,I){
  const M=evM(W),ds=DS(W,H),g=isDark(F.mcol||'#111111')?(F.mcol||'#111111'):'#151515',hl=contrast(F.acc||LY,g)>=4.5?(F.acc||LY):LY,sw=W-2*M;
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const gl=c.createRadialGradient(W/2,H*.55,W*.05,W/2,H*.55,W*.8);gl.addColorStop(0,'rgba(255,255,255,.12)');gl.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gl;c.fillRect(0,0,W,H);
  const top=evTopRow(c,W,ds.top,t,I,F,{centre:true,chip:true});
  const hasP=!!F.flab,pw=ds.pw,ph=pw*.355,wI=sw*.66;
  const base=Math.min(W*.11,H*.08)*ds.k;
  const {tb:hb,ob}=evDisplay(c,F,sw,wI,base,false,base*.7);
  const sb=evFitM(c,F.osub,700,FM,wI,Math.max(ds.sub,evCap(ob,.32,base*.3)),1.12,W*.028);
  let kMax=Math.max(ds.kick,evCap(sb,.95,base*.26));if(sb.size)kMax=Math.min(kMax,sb.size*.97);
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.026));
  const sinceH=evSinceH(W,F),gK=kb.h?kb.size*.55:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.4:0,lowH=ob.h+(sb.h?gS+sb.h:0);
  let y=top+H*.026;
  if(kb.h){evKick(c,kb,W/2,y,hl,'center',t,sw);y+=kb.h+gK}
  if(hb.h){evLines(c,hb,W/2,y,{wt:900,fill:'#fff',al:'center',t,at:.9,maxW:sw});y+=hb.h+gH}
  const aTop=y+H*.034,aBot=H-ds.bot-sinceH-H*.022,ah=Math.max(aBot-aTop,H*.22),aw=Math.min(sw*.8,ah*1.02),ax=(W-aw)/2;
  const path=(o)=>{const x=ax-o,w=aw+2*o,rr2=w/2,yt=aTop-o;c.moveTo(x,aBot);c.lineTo(x,yt+rr2);c.arc(W/2,yt+rr2,rr2,Math.PI,0);c.lineTo(x+w,aBot);c.closePath()};
  const ko=W*.017;evRise(c,t,.25,H,()=>{c.strokeStyle=hl;c.lineWidth=Math.max(2.5,W*.003);c.beginPath();path(ko);c.stroke()});
  evPhoto(c,I,ax,aTop,aw,aBot-aTop,0,t,.35,()=>path(0));
  /* offer set into the foot of the arch on a dark fade */
  const fh=lowH+H*.075,fy=aBot-fh;
  evRise(c,t,1,H,()=>{c.save();c.beginPath();path(0);c.clip();const fg=c.createLinearGradient(0,fy,0,aBot);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(.55,'rgba(0,0,0,.78)');fg.addColorStop(1,'rgba(0,0,0,.9)');c.fillStyle=fg;c.fillRect(ax-2,fy,aw+4,fh+2);c.restore()});
  const ly=aBot-H*.026-lowH;
  if(ob.h)evOffer(c,ob,W/2,ly,hl,'center',t,aw*.88);
  if(sb.h)evLines(c,sb,W/2,ly+ob.h+gS,{wt:700,fill:'rgba(255,255,255,.9)',al:'center',t,at:1.6,maxW:Math.max(aw*.88,wI)});
  if(hasP)evPrice(c,ax+aw-pw*.12,aTop+(aBot-aTop)*.5,pw,F,true,t,1.7);
  evSince(c,W,M,t,F,H-ds.bot-sinceH/2,'rgba(255,255,255,.62)','center');
}

/* S3 Diagonal: photo cut on a slant, brand-yellow stripe along the cut, black field with copy */
function layoutDiagonal(c,W,H,t,D,F,I){
  const M=evM(W),ds=DS(W,H),g=isDark(F.mcol||'#111111')?(F.mcol||'#111111'):'#151515',hl=contrast(F.acc||LY,g)>=4.5?(F.acc||LY):LY,sw=W-2*M;
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const hasP=!!F.flab,pw=ds.pw,ph=pw*.355,gap=W*.03,wO=hasP?sw-pw-gap:sw,slant=W*.1,st=W*.03;
  const {hb,ob,sb,kb}=evBlocks(c,W,H,F,{sw,wO,bw:.12,bh:.087});
  const sinceH=evSinceH(W,F),gK=kb.h?kb.size*.55:0,gH=hb.h?hb.size*.1:0,gS=sb.h?sb.size*.45:0;
  const rowH=Math.max(ob.h+(sb.h?gS+sb.h:0),hasP?ph:0),T=kb.h+gK+hb.h+gH+rowH+H*.02+sinceH;
  const yL=Math.max(H*.3,H-ds.bot-T-st*1.4-W*.03),yR=yL-slant;
  evPhoto(c,I,0,0,W,yL,0,t,.2,()=>{c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,yR);c.lineTo(0,yL);c.closePath()});
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.5)');gt.addColorStop(1,'rgba(0,0,0,0)');c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  evRise(c,t,.3,H,()=>{c.fillStyle=LY;c.beginPath();c.moveTo(0,yL);c.lineTo(W,yR);c.lineTo(W,yR+st);c.lineTo(0,yL+st);c.closePath();c.fill();
    if((F.acc||'').toLowerCase()!==LY.toLowerCase()&&contrast(F.acc||LY,g)>=2.2){c.fillStyle=F.acc;c.beginPath();c.moveTo(0,yL+st);c.lineTo(W,yR+st);c.lineTo(W,yR+st*1.35);c.lineTo(0,yL+st*1.35);c.closePath();c.fill()}});
  evTopRow(c,W,ds.top,t,I,F,{chip:true});
  let y=yL+st*1.4+W*.03;
  if(kb.h){evKick(c,kb,M,y,hl,'left',t,sw);y+=kb.h+gK}
  if(hb.h){evLines(c,hb,M,y,{wt:900,fill:'#fff',t,at:.9,maxW:sw});y+=hb.h+gH}
  if(ob.h)evOffer(c,ob,M,y,hl,'left',t,wO);
  if(sb.h)evLines(c,sb,M,y+ob.h+gS,{wt:700,fill:'rgba(255,255,255,.86)',t,at:1.6,maxW:wO});
  if(hasP)evPrice(c,W-M-pw/2,y+rowH-ph/2,pw,F,true,t,1.7);
  evSince(c,W,M,t,F,H-ds.bot-sinceH/2,'rgba(255,255,255,.6)','left');
}

/* S4 Sunray: tonal rays behind a round photo, offer on a full-width banner, price tag on the ring */
function layoutSunray(c,W,H,t,D,F,I){
  const M=evM(W),ds=DS(W,H),g=F.bg1,ink=inkOn(g),dark=isDark(g),acc=F.acc||'#C8102E',ai=inkOn(acc),sw=W-2*M;
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const hasP=!!F.flab,pw=ds.pw,ph=pw*.355,compact=H<W*1.25,inRibbon=compact&&hasP,wR=inRibbon?sw-pw-W*.03:sw*.9;
  const {hb,ob,sb,kb}=evBlocks(c,W,H,F,{sw:sw*.96,wO:wR,bw:.115,bh:.082});
  const sinceH=evSinceH(W,F),gK=kb.h?kb.size*.55:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.4:0,padR=W*.022,rb=Math.max(ob.h+(sb.h?gS+sb.h:0)+2*padR,inRibbon?ph+2*padR*.8:0);
  const lw=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).w,lh=logoBoxSize(evLogoW(W)/2,evLogoW(W),null,2.6).h,MB=evMadeBox(W*.019,dark),topB=ds.top+Math.max(lh,MB.h);
  const yK=topB+H*.026,yH=yK+kb.h+gK,cT=yH+hb.h+(hb.h?gH:0)+H*.02;
  const cB=H-ds.bot-sinceH-H*.014,pBelow=false;const dMax=W*(ds.story?.86:.7);let d=Math.min(dMax,cB-cT);
  /* the ribbon hangs off the lower part of the circle and the price tag sits under the ribbon: reserve both, so nothing is ever painted over the sub line */
  for(let it=0;it<3;it++){const extra=Math.max(0,d*.36+rb-d/2)+(pBelow?ph+H*.02:0);d=Math.max(Math.min(dMax,cB-cT-extra),H*.16)}
  const cx=W/2,cy=cT+d/2;
  /* rays first, so no copy is ever painted over; a tint of the ground, never a second hard colour */
  c.save();c.fillStyle=dark?'rgba(255,255,255,.055)':'rgba(0,0,0,.065)';const n=24,R=Math.hypot(W,H),rot=t*.035;
  for(let i=0;i<n;i+=2){const a0=rot+i*TAU/n,a1=rot+(i+1)*TAU/n;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a0)*R,cy+Math.sin(a0)*R);c.lineTo(cx+Math.cos(a1)*R,cy+Math.sin(a1)*R);c.closePath();c.fill()}
  c.restore();
  evTopRow(c,W,ds.top,t,I,F,{chip:dark});
  if(kb.h)evKick(c,kb,W/2,yK,accOn(g,acc),'center',t,sw);
  if(hb.h)evLines(c,hb,W/2,yH,{wt:900,fill:ink,al:'center',t,at:.9,maxW:sw});
  c.save();c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=W*.03;c.shadowOffsetY=W*.01;c.fillStyle='#fff';c.beginPath();c.arc(cx,cy,d/2+W*.012,0,TAU);c.fill();c.restore();
  if(F.pmask==='circle')evPhoto(c,I,cx-d/2,cy-d/2,d,d,0,t,.35,()=>c.arc(cx,cy,d/2,0,TAU));
  else{/* free product: the disc is only a backdrop, the product stands in front of it and may overflow it */
    const bs=d*1.06;pop(c,cx,cy+d*.01,t,.35,()=>drawImg(c,I.p,-bs/2,-bs/2,bs,bs,{label:'Product photo',shadow:W*.018}),{from:.8,dur:.8})}
  const by=cy+d*.36;
  evRise(c,t,1.1,H,()=>{c.save();c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=W*.02;c.shadowOffsetY=W*.006;c.fillStyle=acc;c.fillRect(0,by,W,rb);c.restore()});
  const tx0=inRibbon?M:W/2,al0=inRibbon?'left':'center',txH=ob.h+(sb.h?gS+sb.h:0),ty0=by+(rb-txH)/2;
  if(ob.h)evOffer(c,ob,tx0,ty0,ai,al0,t,wR);
  if(sb.h)evLines(c,sb,tx0,ty0+ob.h+gS,{wt:700,fill:ai==='#ffffff'?'rgba(255,255,255,.9)':'rgba(17,17,17,.85)',al:al0,t,at:1.6,maxW:wR});
  if(hasP)evPrice(c,inRibbon?W-M-pw/2:Math.min(W-M-pw/2,cx+d/2-pw*.2),inRibbon?by+rb/2:Math.min(cy+d*.2,by-H*.012-ph/2),pw,F,inRibbon||dark,t,1.7);
  evSince(c,W,M,t,F,H-ds.bot-sinceH/2,dark?'rgba(255,255,255,.65)':'rgba(17,17,17,.6)','center');
}

/* S5 Ticket: a white coupon ticket on the brand ground, perforated stub carrying offer + price */
function layoutTicket(c,W,H,t,D,F,I){
  const M=evM(W),ds=DS(W,H),g=lum(F.bg1)>.9?(F.bg2||'#F2F2F2'):F.bg1,gd=isDark(g),acc=accOn('#ffffff',F.acc||'#C8102E');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const sinceH=evSinceH(W,F),tx=M*.5,ty=ds.story?ds.top*.7:M*.5,tb=ds.story?ds.bot*.7:M*.5,tw=W-2*tx,th=H-ty-tb-sinceH-H*.006,P=W*.05,x0=tx+P,sw=tw-2*P,nr=W*.026;
  c.save();c.shadowColor='rgba(0,0,0,.22)';c.shadowBlur=W*.035;c.shadowOffsetY=W*.012;c.fillStyle='#fff';c.beginPath();c.roundRect(tx,ty,tw,th,W*.03);c.fill();c.restore();
  const hasP=!!F.flab,pw=ds.pw,ph=pw*.355,gap=W*.03,wO=hasP?sw-pw-gap:sw;
  const {hb,ob,sb,kb}=evBlocks(c,W,H,F,{sw,wO,bw:.108,bh:.078});
  const top=evTopRow(c,W,ty+P,t,I,F,{chip:false});
  const gK=kb.h?kb.size*.5:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.4:0,botH=Math.max(ob.h+(sb.h?gS+sb.h:0),hasP?ph:0),perfGap=H*.028;
  let y=top+H*.022;
  if(kb.h){evKick(c,kb,x0,y,acc,'left',t,sw);y+=kb.h+gK}
  if(hb.h){evLines(c,hb,x0,y,{wt:900,fill:'#111111',t,at:.9,maxW:sw});y+=hb.h+gH}
  const perfY=ty+th-P-botH-perfGap,pTop=y+H*.01,pH=Math.max(perfY-perfGap-pTop,H*.16);
  evPhoto(c,I,x0,pTop,sw,pH,W*.012,t,.35);
  const py=pTop+pH+perfGap;
  evRise(c,t,1,H,()=>{c.save();c.strokeStyle='rgba(17,17,17,.38)';c.lineWidth=Math.max(2,W*.0026);c.setLineDash([W*.012,W*.012]);c.beginPath();c.moveTo(tx+nr,py);c.lineTo(tx+tw-nr,py);c.stroke();c.setLineDash([]);
    c.fillStyle=g;c.beginPath();c.arc(tx,py,nr,0,TAU);c.fill();c.beginPath();c.arc(tx+tw,py,nr,0,TAU);c.fill();c.restore()});
  const by=py+perfGap;
  if(ob.h)evOffer(c,ob,x0,by,acc,'left',t,wO);
  if(sb.h)evLines(c,sb,x0,by+ob.h+gS,{wt:700,fill:'rgba(17,17,17,.82)',t,at:1.6,maxW:wO});
  if(hasP)evPrice(c,tx+tw-P-pw/2,by+botH/2,pw,F,false,t,1.7);
  evSince(c,W,M,t,F,H-tb-sinceH/2-H*.002,gd?'rgba(255,255,255,.75)':'rgba(17,17,17,.62)','center');
}

const LAYOUTS={gallery:layoutGallery,arch:layoutArch,diagonal:layoutDiagonal,sunray:layoutSunray,ticket:layoutTicket,circle:layoutCircle,split:layoutSplit,fullbleed:layoutFullbleed,corner:layoutCorner,stacked:layoutStacked,poster:layoutPoster,card:layoutCard,badge:layoutBadge};

/* ---------- field schema shared by every event-category template, so switching the
   Layout dropdown never loses or breaks any of the person's content ---------- */
function evFields(def){
  const base={num:'',head:'HEADLINE\nHERE',kicker:'FOR A LIMITED TIME',
    pre:'UP TO',off:'50% OFF',osub:'SELECT ITEMS',flab:'STARTING FROM',fprice:'$599',seal:'',
    mcol:'#111111',acc:'#C8102E',bg1:'#FFE81A',bg2:'#E8C600',boxStyle:'rounded',maple:'yes',since:'PROUDLY CANADIAN \u00b7 SINCE 1909'};
  const v=Object.assign({},base,def);
  return [STYLE_FIELD,layoutField(def&&def.layout),MCOL_FIELD,BOX_FIELD,
    {k:'acc',l:'Accent colour',t:'color',v:v.acc},
    {k:'kicker',l:'Eyebrow / kicker',t:'text',v:v.kicker},
    {k:'num',l:'Big number (circle, split, full-bleed & poster layouts)',t:'text',v:v.num},
    {k:'head',l:'Headline',t:'area',v:v.head},
    {k:'pre',l:'Offer prefix',t:'text',v:v.pre},
    {k:'off',l:'Offer',t:'text',v:v.off},
    {k:'osub',l:'Offer sub line',t:'text',v:v.osub},
    {k:'flab',l:'Price label (blank hides)',t:'text',v:v.flab},
    {k:'fprice',l:'Price',t:'text',v:v.fprice},
    {k:'pmask',l:'Product photo in Sunray',t:'select',v:v.pmask||'free',o:[['free','Free - not masked (best for cut-outs)'],['circle','Masked inside the circle']]},
    {k:'since',l:'Heritage line (Signature layouts, blank hides)',t:'text',v:v.since},
    {k:'seal',l:'Best Seller badge (blank hides, circle/split only)',t:'select',v:v.seal,o:[['','Hidden'],['yes','Shown']]},
    {k:'maple',l:'Made in Canada badge',t:'select',v:v.maple,o:['yes','no']},
    {k:'bg1',l:'Background 1',t:'color',v:v.bg1},{k:'bg2',l:'Background 2',t:'color',v:v.bg2}];
}
/* extra images: up to three more pictures per post, drawn ABOVE the layout as free objects (drag, resize, rotate,
   delete like anything else). Nothing is drawn until an image is added, so existing posts are unchanged. */
const EV_EXTRA=[{k:'x1',l:'Extra image 1'},{k:'x2',l:'Extra image 2'},{k:'x3',l:'Extra image 3'}];
function evExtras(c,W,H,t,I){
  const s=W*.3,spots=[[W*.2,H*.62],[W*.8,H*.62],[W*.5,H*.4]];
  EV_EXTRA.forEach((e,i)=>{if(!I[e.k])return;const [x,y]=spots[i];
    pop(c,x,y,t,1.9+i*.15,()=>drawImg(c,I[e.k],-s/2,-s/2,s,s,{label:e.l,shadow:W*.018}),{from:.7,dur:.7})});
}
function evDraw(c,W,H,t,D,F,I){(LAYOUTS[F.layout]||layoutCircle)(c,W,H,t,D,F,I);evExtras(c,W,H,t,I)}

const T_EVENTS=[
 {id:'ev_megasale',name:'Mega Sale',sub:'Big number, bold percent-off — the flagship Leon\'s sale post',cat:'megasale',
  fields:evFields({layout:'sunray',num:'100',head:'MEGA SOFA\nSALE!',kicker:'FIRST EVER',off:'50% OFF',osub:'SELECT FABRIC SOFAS',flab:'STARTING FROM',fprice:'$499',seal:'yes',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_financing',name:'Financing Event',sub:'Pay-nothing / no-interest offers — white layout, oversized accent type',cat:'financing',
  fields:evFields({layout:'gallery',num:'',head:'PAY NOTHING\n\'TIL 2028*',kicker:'DON\'T PAY A CENT EVENT',off:'0% INTEREST',osub:'O.A.C. ON YOUR FLEXITICARD',flab:'AS LOW AS',fprice:'$0 DOWN',bg1:'#FFFFFF',bg2:'#F2F2F2',mcol:'#111111',acc:'#E5376F'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_appreciation',name:'Customer Appreciation',sub:'Thank-you event tone — rewards, instant credit, in-store perks',cat:'appreciation',
  fields:evFields({layout:'ticket',head:'CUSTOMER\nAPPRECIATION',kicker:'IT\'S OUR BIGGEST SALE OF THE YEAR',off:'12% BACK',osub:'IN REWARDS ON YOUR PURCHASE',flab:'INSTANT CREDIT',fprice:'$50',bg1:'#FFE81A',bg2:'#111111',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_supersale',name:'Canada-Wide Super Sale',sub:'National super-sale push — red wordmark energy, maple leaf',cat:'supersale',
  fields:evFields({layout:'diagonal',pre:'',head:'CANADA-WIDE\nSUPER SALE',kicker:'ONE WEEK ONLY',off:'UP TO 50%',osub:'OFF SELECT SOFAS',flab:'SAVE UP TO',fprice:'$1000',bg1:'#FFFFFF',bg2:'#FFE81A',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_seasonal',name:'Seasonal Savings',sub:'Flexible seasonal/holiday promo — swap colours per occasion',cat:'seasonal',
  fields:evFields({layout:'gallery',head:'SEASONAL\nSAVINGS',kicker:'FOR A LIMITED TIME',off:'40% OFF',osub:'SELECT FURNITURE',flab:'STARTING FROM',fprice:'$399',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_blackfriday',name:'Black Friday',sub:'High-contrast black/yellow doorbuster push',cat:'blackfriday',
  fields:evFields({layout:'arch',num:'',pre:'',head:'BLACK\nFRIDAY',kicker:'DOORBUSTERS',off:'UP TO 60%',osub:'OFF STOREWIDE',flab:'STARTING FROM',fprice:'$299',bg1:'#111111',bg2:'#000000',mcol:'#111111',acc:'#FFE81A'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_buymore',name:'Buy More, Save More',sub:'Tiered savings — the more they spend the more they save',cat:'buymore',
  fields:evFields({layout:'card',pre:'',head:'BUY MORE,\nSAVE MORE',kicker:'SPEND MORE · SAVE MORE',off:'SAVE UP TO $1,000',osub:'ON SELECT FURNITURE · ASK IN STORE',flab:'ON ORDERS OVER',fprice:'$3,000',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E',since:'PROUDLY CANADIAN \u00b7 SINCE 1909'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_clearance',name:'Clearance Event',sub:'Last-chance clearance — red, loud, urgent',cat:'clearance',
  fields:evFields({layout:'stacked',head:'CLEARANCE\nEVENT',kicker:'LAST CHANCE',off:'UP TO 70% OFF',osub:'WHILE QUANTITIES LAST',flab:'FROM',fprice:'$199',bg1:'#FFE81A',bg2:'#111111',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_newarrivals',name:'New Arrivals',sub:'Lifestyle photo first — fresh collections and launches',cat:'newarrivals',
  fields:evFields({layout:'fullbleed',pre:'',head:'NEW\nARRIVALS',kicker:'JUST LANDED',off:'SHOP THE COLLECTION',osub:'IN STORE & ONLINE AT LEONS.CA',flab:'FROM',fprice:'$799',bg1:'#111111',bg2:'#000000',mcol:'#111111',acc:'#FFE81A'}),
  images:[{k:'p',l:'Lifestyle photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_delivery',name:'Free Delivery',sub:'Service message — delivery, assembly, easy returns',cat:'delivery',
  fields:evFields({layout:'corner',pre:'',head:'FREE LOCAL\nDELIVERY',kicker:'ORDER TODAY',off:'FREE',osub:'ON ORDERS OVER $499*',flab:'',fprice:'',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}].concat(EV_EXTRA),draw:evDraw},
 {id:'ev_canadian',name:'Proudly Canadian',sub:'Brand message — heritage and Canadian-made',cat:'canadian',
  fields:evFields({layout:'sunray',pre:'',head:'PROUDLY\nCANADIAN',kicker:'SINCE 1909',off:'MADE IN CANADA',osub:'SHOP CANADIAN-MADE FURNITURE',flab:'',fprice:'',bg1:'#C8102E',bg2:'#8F0B20',mcol:'#111111',acc:'#FFE81A',maple:'yes'}),
  images:[{k:'p',l:'Lifestyle photo'}].concat(EV_EXTRA),draw:evDraw}
];
