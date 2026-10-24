/* ---------- Leon's "Event Posts": one template per campaign category, each switchable
   across 5 shared structural layouts so any category can use any composition. ---------- */
const EVENT_CATS=[
  ['megasale','Mega Sale'],['financing','Financing'],['appreciation','Appreciation'],
  ['supersale','Super Sale'],['seasonal','Seasonal'],['blackfriday','Black Friday']
];
const LAYOUT_NAMES={circle:'Circle masthead',split:'Split panel',fullbleed:'Full-bleed photo',corner:'Corner badge',stacked:'Stacked bars',poster:'Centred poster',card:'Photo + content card',badge:'Title + offer badge'};
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
function lum(h){const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)return .5;const n=parseInt(m[1],16),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)}
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const inkOn=bg=>lum(bg)>.35?'#111111':'#ffffff';
const isDark=(a,b)=>(lum(a)+lum(b||a))/2<.3;
/* accent colour if it reads on this background, otherwise plain ink */
const accOn=(bg,acc)=>contrast(acc||'#C8102E',bg)>=3?(acc||'#C8102E'):inkOn(bg);
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
  const ST=postStyle(),M=evM(W);
  yellowField(c,W,H,F.bg1,F.bg2);
  let m,titleSz=0;
  objDraw(c,'obj:Masthead',0,0,W,H*.46,()=>{
    m=mastCircle(c,W,H,t,I,F.tag,F.mcol||'#111111',F.num?.42:.385);
    /* the masthead circle's lower edge curves UP toward the sides (~100px at the edge of a wide headline), so
       hand the headline a slightly shorter band: the block lifts and tightens instead of grazing the arc */
    titleSz=mastText(c,W,Object.assign({},m,{band:m.band-W*.05}),t,F.num,String(F.head).split('\n').filter(l=>l.trim()!==''),'#fff',accOn(F.mcol||'#111111',F.acc||LY),.4,.75,{cap:W*.1,nShare:.4,width:W*.8,chord:{cy:m.cy,R:m.R}});
  });
  /* badge top-right on the masthead, centred on the logo's line, flush to the margin */
  if(F.maple!=='no')evMade(c,W-M,H*.055,W*.019,t,1.3,isDark(F.mcol||'#111111'),'right');
  const fh=F.flab?H*.085:0,bandBottom=H-fh,pre=evPre(F),sw=W-2*M;
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.5,W,H*.5,()=>{
    arcTop=bottomArc(c,W,bandBottom,H*.625,F.mcol||'#111111',t,.55);
    const band=bandBottom-arcTop,mc=F.mcol||'#111111',offC=accOn(mc,F.acc||LY),txC=inkOn(mc);
    const ob=evFitM(c,F.off,900,FN,sw*(pre?.74:1),Math.min(band*.42,W*.15,titleSz?titleSz*1.3:1e9));
    const sb=evFitM(c,F.osub,700,FM,sw,Math.max(W*.032,evCap(ob,.3,Math.min(band*.16,W*.04))));
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
  const ph=(arcTop-m.bottom)*.92, pcy=(m.bottom+arcTop)/2;
  floorShadow(c,W/2,pcy+ph/2-6,W*.5,.26);
  pop(c,W/2,pcy,t,.5,()=>drawImg(c,I.p,-W*.42,-ph/2,W*.84,ph,{label:'Product photo'}),{from:.78,dur:.9});
  if(F.seal)pop(c,M+Math.min(130,W*.13)/2,m.bottom+H*.03+Math.min(130,W*.13)*.64,t,.9,()=>{
    const img=BRAND.best,w=Math.min(130,W*.13),r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276,h=w*r;
    objDraw(c,'obj:Seal',-w/2,-h/2,w,h,()=>brandBadge(c,img,0,0,w));
  },{from:.3,dur:.7,rot:.5});
}

/* ---------- layout 2: vertical split — colour panel of copy beside the product ---------- */
function layoutSplit(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W);
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,F.bg1);g.addColorStop(1,F.bg2);c.fillStyle=g;c.fillRect(0,0,W,H);
  const panelW=W*.42,pad=W*.04,cx=panelW/2,cw=panelW-2*pad,mc=F.mcol||'#111111',pInk=inkOn(mc),pAcc=accOn(mc,F.acc||LY);
  const lw=W*.13,lh=lw/2,fh=F.flab?H*.075:0,rightDark=isDark(F.bg1,F.bg2);
  objDraw(c,'obj:Masthead',0,0,panelW,H,()=>{
    const p=ST.textEase(prog(t,0,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=mc;c.fillRect(0,0,panelW,H);c.restore();
    pop(c,cx,M+lh/2,t,.12,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6});
    /* measure the copy stack, then centre it in the space between logo and tagline */
    const hasN=!!F.num,sbase=Math.min(H*.078,panelW*.2);
    const {tb:hb,ob}=evDisplay(c,F,cw,cw,sbase,hasN,sbase*.78,sbase*.62);
    const sb=evFitM(c,F.osub,700,FM,cw,Math.max(W*.028,evCap(ob,.42,Math.min(H*.03,panelW*.07))),1.12,W*.028);
    const kMax=Math.max(W*.026,evCap(sb,.95,W*.026));
    const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,cw,kMax,1.08,W*.024));
    const ns=hasN?Math.min(H*.15,fitSize(c,F.num,900,FN,cw,H*.15)):0;
    const gK=kb.h?kb.size*1.1:0,gN=ns?ns*.1:0,gH=hb.h?hb.size*.4:0,gO=sb.h?ob.size*.25:0;
    const total=kb.h+gK+ns+gN+hb.h+gH+ob.h+gO+sb.h;
    const tagH=F.tag?Math.min(18,panelW*.045)*1.2:0,areaTop=M+lh+H*.03,areaBot=H-M-tagH-H*.02;
    let y=areaTop+Math.max(0,(areaBot-areaTop-total))*.42;
    if(kb.h){evTracked(c,evTrk(kb.size),()=>evLines(c,kb,cx,y,{wt:800,fill:pAcc,al:'center',t,at:.3,maxW:cw}));y+=kb.h+gK}
    if(ns){c.save();c.globalAlpha=clamp(prog(t,.5*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle=pInk;c.textAlign='center';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.55*ST.stagger,.9*ST.durMul)),cx,y+ns*.5);c.restore();y+=ns+gN}
    if(hb.h){evLines(c,hb,cx,y,{wt:900,fill:pInk,al:'center',t,at:.75,maxW:cw});y+=hb.h+gH}
    c.save();c.globalAlpha=clamp(prog(t,1.1*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=pAcc;c.textAlign='center';c.textBaseline='middle';c.fillText(l,cx,y+i*ob.size*ob.lh+ob.size*ob.lh/2,cw)});c.restore();y+=ob.h+gO;
    if(sb.h)evLines(c,sb,cx,y,{wt:700,fill:pInk,al:'center',t,at:1.3,maxW:cw});
    if(F.tag){c.save();c.globalAlpha=clamp(prog(t,1.5*ST.stagger,.4*ST.durMul));font(c,700,Math.min(18,panelW*.045),FM);c.fillStyle=pInk==='#ffffff'?'rgba(255,255,255,.72)':'rgba(17,17,17,.72)';c.textAlign='center';c.textBaseline='middle';c.fillText(F.tag,cx,H-M-tagH/2,cw);c.restore()}
  });
  const pw=W-panelW,pcx=panelW+pw/2,rp=W*.04,chipH=evMadeBox(W*.019,rightDark).h;
  const rTop=M+Math.max(chipH,0)+H*.025,rBot=H-fh-M*.7,rh=rBot-rTop,ph=rh*.9,pcy=rTop+rh/2;
  floorShadow(c,pcx,pcy+ph/2-6,pw*.72,.22);
  objDraw(c,'obj:Footer',panelW,0,pw,H,()=>{
    pop(c,pcx,pcy,t,.6,()=>drawImg(c,I.p,-pw*.42,-ph/2,pw*.84,ph,{label:'Product photo'}),{from:.8,dur:.9});
  });
  if(F.seal){const sw=Math.min(130,pw*.26),img=BRAND.best,r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276;
    pop(c,panelW+rp+sw/2,rTop+sw*r/2,t,.95,()=>{objDraw(c,'obj:Seal',-sw/2,-sw*r/2,sw,sw*r,()=>brandBadge(c,img,0,0,sw))},{from:.3,dur:.7,rot:.5})}
  if(F.maple!=='no')evMade(c,W-rp,M+chipH/2,W*.019,t,1.6,rightDark,'right');
  if(F.flab){
    objDraw(c,'obj:Price card',panelW,H-fh,pw,fh,()=>{
      const p=ST.textEase(prog(t,1.5*ST.stagger,.6*ST.durMul)),acc=F.acc||'#C8102E',ink=inkOn(acc);c.save();c.globalAlpha=p;
      c.fillStyle=acc;c.fillRect(panelW,H-fh,pw,fh);
      const ls=fh*.3,ps=fh*.42;font(c,800,ls,FM);const a=c.measureText(F.flab).width;font(c,900,ps,FN);const b=c.measureText(F.fprice).width,gp=ls*.7,x0=pcx-(a+gp+b)/2;
      c.textBaseline='middle';c.textAlign='left';font(c,800,ls,FM);c.fillStyle=ink;c.fillText(F.flab,x0,H-fh/2);
      font(c,900,ps,FN);c.fillText(F.fprice,x0+a+gp,H-fh/2);c.restore();
    });
  }
}

/* ---------- layout 3: full-bleed product photo with a bottom gradient scrim ----------
   header row: logo flush-left, badge flush-right, on one centre line; copy block left-aligned at M
   and stacked bottom-up from the bottom margin; price card flush-right sharing the copy block's
   bottom edge. Nothing can overlap, whatever the ratio or text length. */
function layoutFullbleed(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.45)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  const g=c.createLinearGradient(0,H*.4,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.9)');
  c.save();c.fillStyle=g;c.fillRect(0,H*.4,W,H*.6);c.restore();

  const lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=M+rowH/2;
  objDraw(c,'obj:Logo bar',M,M,W-2*M,rowH,()=>{
    pop(c,M+lw/2-lw*.046,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6});
  });
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,.3,true,'right');

  const hasP=!!F.flab,pw2=W*.3,ph2=pw2*.355,sw=W-2*M,hasN=!!F.num,base=Math.min(W*.14,H*.105);
  const acc=contrast(F.acc||LY,'#0a0a0a')>=4.5?(F.acc||LY):LY;
  const {tb:hb,ob}=evDisplay(c,F,sw,sw,base,hasN,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw,Math.max(W*.034,evCap(ob,.32,base*.3)));
  const kMax=Math.max(W*.03,evCap(sb,.95,base*.26));
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  const ns=hasN?Math.min(base*1.1,fitSize(c,F.num,900,FN,sw,base*1.1)):0;
  let y=H-M;
  if(hasP)y-=ph2+H*.03;
  const subTop=y-sb.h;y=subTop-(sb.h?sb.size*.5:0);
  const offTop=y-ob.h;y=offTop-(hb.h?hb.size*.1:0);
  const headTop=y-hb.h;y=headTop-(kb.h?kb.size*.6:0);
  const kTop=y-kb.h;y=kTop-(ns?ns*.2:0);
  const numTop=y-ns;
  if(ns){c.save();c.globalAlpha=clamp(prog(t,.6*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.65*ST.stagger,.9*ST.durMul)),M,numTop+ns*.5);c.restore()}
  if(kb.h)evTracked(c,evTrk(kb.size),()=>evLines(c,kb,M,kTop,{wt:800,fill:acc,t,at:.3,maxW:sw}));
  if(hb.h)evLines(c,hb,M,headTop,{wt:900,fill:'#fff',t,at:.9,maxW:sw});
  if(ob.h){c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=acc;c.textAlign='left';c.textBaseline='middle';c.fillText(l,M,offTop+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore()}
  if(sb.h)evLines(c,sb,M,subTop,{wt:700,fill:'rgba(255,255,255,.86)',t,at:1.6,maxW:sw});
  if(hasP)evPrice(c,M+pw2/2,H-M-ph2/2,pw2,F,true,t,1.7);
}

/* ---------- layout 4: header, centred product, eyebrow + headline, price card; offer badge
   overlaps the product frame's top-right corner (never the header) ---------- */
function layoutCorner(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),dark=isDark(F.bg1,F.bg2),ink=inkOn(dark?'#000000':'#ffffff'),acc=F.acc||'#C8102E';
  yellowField(c,W,H,F.bg1,F.bg2);
  const lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,dark),rowH=Math.max(lh,MB.h),rowCy=M+rowH/2;
  objDraw(c,'obj:Masthead',M,M,W-2*M,rowH,()=>{
    pop(c,M+lw/2-lw*.046,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6});
  });
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,1.8,dark,'right');
  const sw=W-2*M,pw2=W*.34,ph2=pw2*.355; /* price card stays below the headline in rank */
  const bw=W*.5,cbase=Math.min(W*.115,H*.085);
  const {tb:hb,ob}=evDisplay(c,F,sw,bw*.84,cbase,false,cbase*.7,cbase*.5);
  const sb=evFitM(c,F.osub,700,FM,bw*.84,Math.max(bw*.062,evCap(ob,.26,bw*.075)),1.12,bw*.055);
  const kMax=Math.max(W*.026,Math.min(evCap(hb,.3,W*.034),sb.size?sb.size*1.0:1e9));
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.026));
  let y=H-M;
  if(F.flab)y-=ph2+H*.025;
  const headTop=y-hb.h;y=headTop-(kb.h?kb.size*.7:0);
  const kTop=y-kb.h;y=kTop-H*.025;
  const photoTop=M+rowH+H*.025,photoH=Math.max(H*.2,y-photoTop),pcy=photoTop+photoH/2;
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
  if(F.flab)evPrice(c,W/2,H-M-ph2/2,pw2,F,dark,t,1.6);
}

/* ---------- layout 5: horizontal stacked colour bands ---------- */
function layoutStacked(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),mc=F.mcol||'#111111',acc=F.acc||'#C8102E';
  c.fillStyle=F.bg2||'#111';c.fillRect(0,0,W,H);
  const barH=H*.12,lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,isDark(mc));
  objDraw(c,'obj:Masthead',0,0,W,barH,()=>{
    const p=ST.textEase(prog(t,0,.5*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=mc;c.fillRect(0,0,W,barH);c.restore();
    pop(c,M+lw/2-lw*.046,barH/2,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6});
    /* eyebrow centred in the room left between logo and badge */
    const side=Math.max(lw,F.maple!=='no'?MB.w:0),kw=W-2*(M+side+W*.03),kMax=W*.03,kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,kw,kMax,1.08,W*.022));
    if(kb.h)evTracked(c,evTrk(kb.size),()=>evLines(c,kb,W/2,barH/2-kb.h/2,{wt:800,fill:lum(acc)>.3&&contrast(acc,mc)>=4.5?acc:inkOn(mc),al:'center',t,at:.3,maxW:kw}));
  });
  if(F.maple!=='no')evMade(c,W-M,barH/2,micS,t,.3,isDark(mc),'right');
  let titleSz=0;const hBandH=H*.24,hBandY=barH;
  objDraw(c,'obj:Headline band',0,hBandY,W,hBandH,()=>{
    c.fillStyle=F.bg1;c.fillRect(0,hBandY,W,hBandH);
    const n=Math.max(1,String(F.head).split('\n').filter(l=>l.trim()!=='').length);
    const hb=evFit(c,F.head,900,FM,W-2*M,Math.min(hBandH*.78/(n*1.08),W*.12),1.08,W*.07);titleSz=hb.size;
    if(hb.h)evLines(c,hb,W/2,hBandY+(hBandH-hb.h)/2,{wt:900,fill:inkOn(F.bg1),al:'center',t,at:.4,maxW:W-2*M});
  });
  const pBandY=hBandY+hBandH,pBandH=H*.36;
  objDraw(c,'obj:Footer',0,pBandY,W,pBandH,()=>{
    floorShadow(c,W/2,pBandY+pBandH*.86,W*.46,.22);
    pop(c,W/2,pBandY+pBandH/2,t,.6,()=>drawImg(c,I.p,-W*.4,-pBandH*.42,W*.8,pBandH*.84,{label:'Product photo'}),{from:.8,dur:.9});
  });
  const oBandY=pBandY+pBandH,oBandH=H-oBandY,ink=inkOn(acc),sw=W-2*M;
  objDraw(c,'obj:Price card',0,oBandY,W,oBandH,()=>{
    const p=ST.textEase(prog(t,1.3*ST.stagger,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=acc;c.fillRect(0,oBandY,W,oBandH);c.restore();
    const pad=oBandH*.12,avail=oBandH-2*pad;
    const ob=evFitM(c,F.off,900,FN,sw,Math.min(avail*.55,W*.15,titleSz?titleSz*.95:1e9),.98);
    const sb=evFitM(c,F.osub,700,FM,sw,Math.max(W*.032,evCap(ob,.3,Math.min(avail*.2,W*.04))));
    const gap=sb.h?ob.size*.18:0,top=oBandY+(oBandH-(ob.h+gap+sb.h))/2;
    c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));
    ob.lines.forEach((l,i)=>{font(c,900,ob.size,FN);c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.fillText(l,W/2,top+i*ob.size*ob.lh+ob.size*ob.lh/2,sw)});c.restore();
    if(sb.h)evLines(c,sb,W/2,top+ob.h+gap,{wt:800,fill:ink,al:'center',t,at:1.6,maxW:sw});
  });
}

/* ---------- layout 6: centred poster — everything centred over a darkened photo ---------- */
function layoutPoster(c,W,H,t,D,F,I){
  const ST=postStyle(),M=evM(W),acc=contrast(F.acc||LY,'#0a0a0a')>=4.5?(F.acc||LY):LY;
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(.5,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,.82)');
  c.save();c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
  const lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,true),hasM=F.maple!=='no';
  objDraw(c,'obj:Logo bar',M,M,W-2*M,lh,()=>{pop(c,W/2,M+lh/2,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6})});
  if(hasM)evMade(c,W/2,M+lh+H*.02+MB.h/2,micS,t,.3,true,'center');
  const headerBottom=M+lh+(hasM?H*.02+MB.h:0);
  const hasP=!!F.flab,pw2=W*.3,ph2=pw2*.355,sw=W-2*M,hasN=!!F.num,base=Math.min(W*.14,H*.105);
  const {tb:hb,ob}=evDisplay(c,F,sw,sw,base,hasN,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw,Math.max(W*.034,evCap(ob,.32,base*.3)),1.12,W*.028);
  const kMax=Math.max(W*.03,evCap(sb,.95,base*.26));
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  const ns=hasN?Math.min(base*1.1,fitSize(c,F.num,900,FN,sw,base*1.1)):0;
  const gK=kb.h?kb.size*.6:0,gN=ns?ns*.2:0,gH=hb.h?hb.size*.1:0,gS=sb.h?sb.size*.5:0,gP=hasP?H*.035:0;
  const total=ns+gN+kb.h+gK+hb.h+gH+ob.h+gS+sb.h+gP+(hasP?ph2:0);
  let y=Math.max(headerBottom+H*.03,Math.min(H*.53-total/2,H-M-total));
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
  const ST=postStyle(),M=evM(W),mc=F.mcol||'#111111',ink=inkOn(mc),acc=accOn(mc,F.acc||LY);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  const hasP=!!F.flab,pw2=W*.28,ph2=pw2*.355,sw=W-2*M,gap=W*.03,wO=hasP?sw-pw2-gap:sw,base=Math.min(W*.125,H*.092);
  const {tb:hb,ob}=evDisplay(c,F,sw,wO,base,false,base*.7);
  const sb=evFitM(c,F.osub,700,FM,wO,Math.max(W*.032,evCap(ob,.32,base*.3)),1.12,W*.028);
  const kMax=Math.max(W*.028,evCap(sb,.95,base*.26));
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.026));
  const gK=kb.h?kb.size*.6:0,gH=hb.h?hb.size*.12:0,gS=sb.h?sb.size*.5:0;
  const rowH2=Math.max(ob.h+(sb.h?gS+sb.h:0),hasP?ph2:0),padT=H*.04;
  const cardTop=H-M-(kb.h+gK+hb.h+gH+rowH2)-padT,overlap=H*.05;
  objDraw(c,'obj:Masthead',0,0,W,cardTop+overlap,()=>{drawImg(c,I.p,0,0,W,cardTop+overlap,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.5)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  const lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=M+rowH/2;
  objDraw(c,'obj:Logo bar',M,M,W-2*M,rowH,()=>{pop(c,M+lw/2-lw*.046,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6})});
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
  const ST=postStyle(),M=evM(W),acc=F.acc||LY,bi=inkOn(acc);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  const gt=c.createLinearGradient(0,0,0,H*.62);gt.addColorStop(0,'rgba(0,0,0,.68)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.62);c.restore();
  const gb=c.createLinearGradient(0,H*.6,0,H);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(1,'rgba(0,0,0,.6)');
  c.save();c.fillStyle=gb;c.fillRect(0,H*.6,W,H*.4);c.restore();
  const lw=evLogoW(W),lh=lw/2,micS=W*.019,MB=evMadeBox(micS,true),rowH=Math.max(lh,MB.h),rowCy=M+rowH/2;
  objDraw(c,'obj:Logo bar',M,M,W-2*M,rowH,()=>{pop(c,M+lw/2-lw*.046,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6})});
  if(F.maple!=='no')evMade(c,W-M,rowCy,micS,t,.3,true,'right');
  const r=W*.215,hasP=!!F.flab,pw2=W*.3,ph2=pw2*.355,sw=W-2*M,base=Math.min(W*.14,H*.105),gap=W*.03;
  const hb=evFit(c,F.head,900,FM,sw,base,1.08,base*.7);
  const sb=evFitM(c,F.osub,700,FM,sw-2*r-gap,Math.max(W*.034,evCap(hb,.3,base*.3)),1.12,W*.028);
  const kMax=Math.max(W*.03,evCap(sb,.95,base*.26));
  const kb=evTracked(c,evTrk(kMax),()=>evFitM(c,String(F.kicker||'').toUpperCase(),800,FM,sw,kMax,1.08,W*.028));
  let y=M+rowH+H*.04;
  if(kb.h){const ky=y;evTracked(c,evTrk(kb.size),()=>evLines(c,kb,M,ky,{wt:800,fill:contrast(acc,'#0a0a0a')>=4.5?acc:LY,t,at:.3,maxW:sw}));y+=kb.h+kb.size*.6}
  if(hb.h)evLines(c,hb,M,y,{wt:900,fill:'#fff',t,at:.9,maxW:sw});
  /* offer badge, bottom-right on the margin */
  const bcx=W-M-r,bcy=H-M-r,ob=evFit(c,F.off,900,FN,r*1.38,r*.62,.98,r*.3);
  pop(c,bcx,bcy,t,1.3,()=>{
    objDraw(c,'obj:Corner badge',-r,-r,2*r,2*r,()=>{
      c.fillStyle=acc;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();
      c.strokeStyle=bi==='#ffffff'?'rgba(255,255,255,.45)':'rgba(17,17,17,.4)';c.lineWidth=Math.max(3,r*.025);c.setLineDash([r*.07,r*.05]);c.beginPath();c.arc(0,0,r*.9,0,TAU);c.stroke();c.setLineDash([]);
      font(c,900,ob.size,FN);c.fillStyle=bi;c.textAlign='center';c.textBaseline='middle';
      ob.lines.forEach((l,i)=>c.fillText(l,0,-ob.h/2+i*ob.size*ob.lh+ob.size*ob.lh/2,r*1.5));
    });
  },{from:.6,dur:.7,rot:.3});
  /* bottom-left stack: sub line above the price card */
  let yb=H-M;
  if(hasP){evPrice(c,M+pw2/2,yb-ph2/2,pw2,F,true,t,1.7);yb-=ph2+H*.025}
  if(sb.h)evLines(c,sb,M,yb-sb.h,{wt:700,fill:'rgba(255,255,255,.9)',t,at:1.6,maxW:sw-2*r-gap});
}

const LAYOUTS={circle:layoutCircle,split:layoutSplit,fullbleed:layoutFullbleed,corner:layoutCorner,stacked:layoutStacked,poster:layoutPoster,card:layoutCard,badge:layoutBadge};

/* ---------- field schema shared by every event-category template, so switching the
   Layout dropdown never loses or breaks any of the person's content ---------- */
function evFields(def){
  const base={num:'',head:'HEADLINE\nHERE',tag:'That\'s comfortable.',kicker:'FOR A LIMITED TIME',
    pre:'UP TO',off:'50% OFF',osub:'SELECT ITEMS',flab:'STARTING FROM',fprice:'$599',seal:'',
    mcol:'#111111',acc:'#C8102E',bg1:'#FFE81A',bg2:'#E8C600',boxStyle:'rounded',maple:'yes'};
  const v=Object.assign({},base,def);
  return [STYLE_FIELD,layoutField(def&&def.layout),MCOL_FIELD,BOX_FIELD,
    {k:'acc',l:'Accent colour',t:'color',v:v.acc},
    {k:'kicker',l:'Eyebrow / kicker',t:'text',v:v.kicker},
    {k:'num',l:'Big number (circle, split, full-bleed & poster layouts)',t:'text',v:v.num},
    {k:'head',l:'Headline',t:'area',v:v.head},
    {k:'tag',l:'Tagline',t:'text',v:v.tag},
    {k:'pre',l:'Offer prefix',t:'text',v:v.pre},
    {k:'off',l:'Offer',t:'text',v:v.off},
    {k:'osub',l:'Offer sub line',t:'text',v:v.osub},
    {k:'flab',l:'Price label (blank hides)',t:'text',v:v.flab},
    {k:'fprice',l:'Price',t:'text',v:v.fprice},
    {k:'seal',l:'Best Seller badge (blank hides, circle/split only)',t:'select',v:v.seal,o:[['','Hidden'],['yes','Shown']]},
    {k:'maple',l:'Made in Canada badge',t:'select',v:v.maple,o:['yes','no']},
    {k:'bg1',l:'Background 1',t:'color',v:v.bg1},{k:'bg2',l:'Background 2',t:'color',v:v.bg2}];
}
function evDraw(c,W,H,t,D,F,I){(LAYOUTS[F.layout]||layoutCircle)(c,W,H,t,D,F,I)}

const T_EVENTS=[
 {id:'ev_megasale',name:'Mega Sale',sub:'Big number, bold percent-off — the flagship Leon\'s sale post',cat:'megasale',
  fields:evFields({layout:'circle',num:'100',head:'MEGA SOFA\nSALE!',kicker:'FIRST EVER',off:'50% OFF',osub:'SELECT FABRIC SOFAS',flab:'STARTING FROM',fprice:'$499',seal:'yes',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_financing',name:'Financing Event',sub:'Pay-nothing / no-interest offers — white layout, oversized accent type',cat:'financing',
  fields:evFields({layout:'split',num:'',head:'PAY NOTHING\n\'TIL 2028*',kicker:'DON\'T PAY A CENT EVENT',off:'0% INTEREST',osub:'O.A.C. ON YOUR FLEXITICARD',flab:'AS LOW AS',fprice:'$0 DOWN',bg1:'#FFFFFF',bg2:'#F2F2F2',mcol:'#111111',acc:'#E5376F'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_appreciation',name:'Customer Appreciation',sub:'Thank-you event tone — rewards, instant credit, in-store perks',cat:'appreciation',
  fields:evFields({layout:'stacked',head:'CUSTOMER\nAPPRECIATION',kicker:'IT\'S OUR BIGGEST SALE OF THE YEAR',off:'12% BACK',osub:'IN REWARDS ON YOUR PURCHASE',flab:'INSTANT CREDIT',fprice:'$50',bg1:'#FFE81A',bg2:'#111111',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_supersale',name:'Canada-Wide Super Sale',sub:'National super-sale push — red wordmark energy, maple leaf',cat:'supersale',
  fields:evFields({layout:'corner',pre:'',head:'CANADA-WIDE\nSUPER SALE',kicker:'ONE WEEK ONLY',off:'UP TO 50%',osub:'OFF SELECT SOFAS',flab:'SAVE UP TO',fprice:'$1000',bg1:'#FFFFFF',bg2:'#FFE81A',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_seasonal',name:'Seasonal Savings',sub:'Flexible seasonal/holiday promo — swap colours per occasion',cat:'seasonal',
  fields:evFields({layout:'circle',head:'SEASONAL\nSAVINGS',kicker:'FOR A LIMITED TIME',off:'40% OFF',osub:'SELECT FURNITURE',flab:'STARTING FROM',fprice:'$399',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_blackfriday',name:'Black Friday',sub:'High-contrast black/yellow doorbuster push',cat:'blackfriday',
  fields:evFields({layout:'fullbleed',num:'',pre:'',head:'BLACK\nFRIDAY',kicker:'DOORBUSTERS',off:'UP TO 60%',osub:'OFF STOREWIDE',flab:'STARTING FROM',fprice:'$299',bg1:'#111111',bg2:'#000000',mcol:'#111111',acc:'#FFE81A'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw}
];
