/* ---------- Leon's "Event Posts": one template per campaign category, each switchable
   across 5 shared structural layouts so any category can use any composition. ---------- */
const EVENT_CATS=[
  ['megasale','Mega Sale'],['financing','Financing'],['appreciation','Appreciation'],
  ['supersale','Super Sale'],['seasonal','Seasonal'],['blackfriday','Black Friday']
];
const LAYOUT_NAMES={circle:'Circle masthead',split:'Split panel',fullbleed:'Full-bleed photo',corner:'Corner badge',stacked:'Stacked bars'};
/* A function, not a shared object: each event template needs its OWN field object with
   its own default `v` (a fixed shared object here previously meant every category's
   "Layout" field silently defaulted to 'circle', ignoring the distinct layout each one
   was actually designed around). */
const layoutField=v=>({k:'layout',l:'Layout',t:'select',v:v||'circle',o:Object.keys(LAYOUT_NAMES).map(k=>[k,LAYOUT_NAMES[k]])});

/* ---------- layout 1: circle masthead + bottom arc (the house style) ---------- */
function layoutCircle(c,W,H,t,D,F,I){
  const ST=postStyle();
  yellowField(c,W,H,F.bg1,F.bg2);
  let m;
  objDraw(c,'obj:Masthead',0,0,W,H*.42,()=>{
    m=mastCircle(c,W,H,t,I,F.tag,F.mcol||'#111111',.355);
    mastText(c,W,m,t,F.num,F.head.split('\n'),'#fff',F.acc||LY,.4,.75);
  });
  const fh=F.flab?H*.085:0;
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.5,W,H*.5,()=>{
    arcTop=bottomArc(c,W,H-fh,H*.60,F.mcol||'#111111',t,.55);
    const band=(H-fh)-arcTop, os=Math.min(band*.46,fitSize(c,F.off,900,FN,W*.6,band*.46)), oy=arcTop+band*.42;
    c.save();c.globalAlpha=clamp(prog(t,1*ST.stagger,.5*ST.durMul));
    font(c,900,os,FN);const ow=c.measureText(F.off).width;
    font(c,900,os*.34,FM);c.fillStyle='#fff';c.textAlign='right';c.textBaseline='middle';c.fillText(F.pre,W/2-ow/2-14,oy);
    font(c,900,os,FN);c.fillStyle=F.acc||LY;c.textAlign='center';c.fillText(F.off,W/2+Math.min(40,ow*.1),oy);c.restore();
    text(c,{s:F.osub,x:W/2,y:oy+os*.76,size:Math.min(band*.17,W*.037),wt:900,fill:'#fff',t,at:1.25,maxW:W*.84});
    if(F.flab){
      const p=ST.textEase(prog(t,1.4*ST.stagger,.6*ST.durMul));c.save();c.translate(0,(1-p)*fh);
      c.fillStyle=F.acc||'#C8102E';c.fillRect(0,H-fh,W,fh);
      font(c,800,fh*.3,FM);c.fillStyle='#fff';c.textAlign='right';c.textBaseline='middle';c.fillText(F.flab,W*.54,H-fh/2);
      font(c,900,fh*.44,FN);const pw=c.measureText(F.fprice).width+48;
      c.fillStyle='#111';boxPath(c,F.boxStyle,W*.57,H-fh*.88,pw,fh*.76,10);c.fill();
      c.fillStyle='#fff';c.textAlign='left';c.fillText(F.fprice,W*.57+24,H-fh/2);c.restore();
    }
  });
  const ph=(arcTop-m.bottom)*.92, pcy=(m.bottom+arcTop)/2;
  floorShadow(c,W/2,pcy+ph/2-6,W*.5,.26);
  pop(c,W/2,pcy,t,.5,()=>drawImg(c,I.p,-W*.42,-ph/2,W*.84,ph,{label:'Product photo'}),{from:.78,dur:.9});
  if(F.seal)pop(c,W*.14,m.bottom+H*.03,t,.9,()=>{
    const img=BRAND.best,w=Math.min(130,W*.13),r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276,h=w*r;
    objDraw(c,'obj:Seal',-w/2,-h/2,w,h,()=>brandBadge(c,img,0,0,w));
  },{from:.3,dur:.7,rot:.5});
  if(F.maple!=='no')madeInCanada(c,W*.9,arcTop-H*.035,Math.min(24,W*.022),t,1.3);
}

/* ---------- layout 2: vertical split — colour panel of copy beside the product ---------- */
function layoutSplit(c,W,H,t,D,F,I){
  const ST=postStyle();
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,F.bg1);g.addColorStop(1,F.bg2);c.fillStyle=g;c.fillRect(0,0,W,H);
  const panelW=W*.42;
  objDraw(c,'obj:Masthead',0,0,panelW,H,()=>{
    const p=ST.textEase(prog(t,0,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=F.mcol||'#111111';c.fillRect(0,0,panelW,H);c.restore();
    let y=H*.1;
    pop(c,panelW/2,y,t,.12,()=>logo(c,I,0,0,120,60),{from:.7,dur:.6});y+=H*.075;
    if(F.kicker){const ks=Math.min(22,W*.02,fitSize(c,F.kicker.toUpperCase(),800,FM,panelW*.82,22));c.save();c.globalAlpha=clamp(prog(t,.3*ST.stagger,.4*ST.durMul));font(c,800,ks,FM);c.fillStyle=F.acc||LY;c.textAlign='center';c.textBaseline='middle';c.fillText(F.kicker.toUpperCase(),panelW/2,y,panelW*.82);c.restore();y+=H*.035}
    if(F.num){const ns=Math.min(H*.16,fitSize(c,F.num,900,FN,panelW*.8,H*.16));c.save();c.globalAlpha=clamp(prog(t,.5*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.55*ST.stagger,.9*ST.durMul)),panelW/2,y+ns*.5);c.restore();y+=ns*1.05}
    const hs=Math.min(H*.058,panelW*.13);
    F.head.split('\n').forEach((l,i)=>{y+=hs*.08;text(c,{s:l,x:panelW/2,y:y+hs/2,size:Math.min(hs,fitSize(c,l,900,FM,panelW*.82,hs)),wt:900,fill:'#fff',t,at:.75+i*.08,maxW:panelW*.82});y+=hs*1.02});
    y+=H*.02;
    const os=Math.min(H*.09,panelW*.2,fitSize(c,F.off,900,FN,panelW*.82,H*.09));
    c.save();c.globalAlpha=clamp(prog(t,1.1*ST.stagger,.5*ST.durMul));font(c,900,os,FN);c.fillStyle=F.acc||LY;c.textAlign='center';c.textBaseline='middle';c.fillText(F.off,panelW/2,y+os*.5,panelW*.82);c.restore();y+=os*1.05;
    if(F.osub)text(c,{s:F.osub,x:panelW/2,y:y+H*.02,size:Math.min(H*.028,panelW*.065),wt:800,fill:'#fff',t,at:1.3,maxW:panelW*.84});
    if(F.tag){c.save();c.globalAlpha=clamp(prog(t,1.5*ST.stagger,.4*ST.durMul));font(c,700,Math.min(18,panelW*.045),FM);c.fillStyle='rgba(255,255,255,.72)';c.textAlign='center';c.textBaseline='middle';c.fillText(F.tag,panelW/2,H*.93);c.restore()}
  });
  const pw=W-panelW, pcx=panelW+pw/2, ph=H*.62, pcy=H*.46;
  floorShadow(c,pcx,pcy+ph/2-6,pw*.72,.22);
  objDraw(c,'obj:Footer',panelW,0,pw,H,()=>{
    pop(c,pcx,pcy,t,.6,()=>drawImg(c,I.p,-pw*.42,-ph/2,pw*.84,ph,{label:'Product photo'}),{from:.8,dur:.9});
  });
  if(F.seal)pop(c,panelW+pw*.16,H*.16,t,.95,()=>{
    const img=BRAND.best,w=Math.min(130,pw*.26),r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276,h=w*r;
    objDraw(c,'obj:Seal',-w/2,-h/2,w,h,()=>brandBadge(c,img,0,0,w));
  },{from:.3,dur:.7,rot:.5});
  if(F.flab){
    const fh=H*.075;
    objDraw(c,'obj:Price card',panelW,H-fh,pw,fh,()=>{
      const p=ST.textEase(prog(t,1.5*ST.stagger,.6*ST.durMul));c.save();c.globalAlpha=p;
      c.fillStyle=F.acc||'#C8102E';c.fillRect(panelW,H-fh,pw,fh);
      font(c,800,fh*.3,FM);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
      c.fillText(F.flab+'  '+F.fprice,panelW+pw/2,H-fh/2);c.restore();
    });
  }
  if(F.maple!=='no')madeInCanada(c,W-W*.08,H*.06,Math.min(22,W*.02),t,1.6);
}

/* ---------- layout 3: full-bleed product photo with a bottom gradient scrim ----------
   Everything hangs off ONE safe margin (M = 7% of width) on all four sides:
   - header row: logo flush-left, Made-in-Canada badge flush-right, both centred on the same line
   - copy block: left-aligned at M, stacked bottom-up from the bottom margin
     (sub line -> offer -> headline lines -> eyebrow -> optional big number) so the
     blocks can never overlap whatever the aspect ratio or text length
   - price card: flush-right at W-M, its bottom edge sharing the copy block's bottom edge */
function layoutFullbleed(c,W,H,t,D,F,I){
  const ST=postStyle();
  const M=Math.round(W*.07);
  c.fillStyle=F.bg1;c.fillRect(0,0,W,H);
  objDraw(c,'obj:Masthead',0,0,W,H,()=>{drawImg(c,I.p,0,0,W,H,{label:'Background photo',fit:'cover'})});
  /* scrims: soft top fade keeps the header legible, bottom fade carries the copy */
  const gt=c.createLinearGradient(0,0,0,H*.2);gt.addColorStop(0,'rgba(0,0,0,.45)');gt.addColorStop(1,'rgba(0,0,0,0)');
  c.save();c.fillStyle=gt;c.fillRect(0,0,W,H*.2);c.restore();
  const g=c.createLinearGradient(0,H*.4,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.9)');
  c.save();c.fillStyle=g;c.fillRect(0,H*.4,W,H*.6);c.restore();

  /* header row */
  const lw=W*.16,lh=lw/2,micS=W*.022,micW=micS*7,micH=micW*.391,rowH=Math.max(lh,micH),rowCy=M+rowH/2;
  objDraw(c,'obj:Logo bar',M,M,W-2*M,rowH,()=>{
    pop(c,M+lw/2-lw*.046,rowCy,t,.1,()=>logo(c,I,0,0,lw,lh),{from:.7,dur:.6}); /* -4.6%: the logo art has built-in side padding */
  });
  if(F.maple!=='no')madeInCanada(c,W-M-micW/2+micW*.084,rowCy,micS,t,.3); /* +8.4%: badge art has built-in side padding */

  /* price card geometry first, so the copy column knows how much width it has */
  const hasP=!!F.flab,pk=W*.26/180,pw2=180*pk,ph2=64*pk,pgap=W*.03;
  const sw=W-2*M-(hasP?pw2+pgap:0);

  /* type scale: driven by width, capped by height, one shared headline size */
  const lines=String(F.head).split('\n').filter(l=>l.trim()!=='');
  const hs0=Math.min(W*.098,H*.075),os0=Math.min(W*.14,H*.105),ss=W*.026,ks=W*.024;
  const hs=lines.length?Math.min(hs0,...lines.map(l=>fitSize(c,l,900,FM,sw,hs0))):hs0;
  const os=fitSize(c,F.off,900,FN,sw,os0);
  const ns=F.num?Math.min(H*.1,fitSize(c,F.num,900,FN,sw,H*.1)):0;

  /* stack bottom-up from the bottom margin */
  let y=H-M;
  const subH=F.osub?ss*1.08:0,offH=os*.92,headH=lines.length*hs*1.08,kH=F.kicker?ks*1.08:0;
  const subTop=y-subH;y=subTop-(F.osub?ss*.55:0);
  const offTop=y-offH;y=offTop-hs*.14;
  const headTop=y-headH;y=headTop-(F.kicker?ks*.7:0);
  const kTop=y-kH;y=kTop-(F.num?ns*.2:0);
  const numTop=y-ns;

  if(F.num){c.save();c.globalAlpha=clamp(prog(t,.6*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.65*ST.stagger,.9*ST.durMul)),M,numTop+ns*.5);c.restore()}
  if(F.kicker){c.save();c.globalAlpha=clamp(prog(t,.3*ST.stagger,.4*ST.durMul));font(c,800,ks,FM);c.fillStyle=F.acc||LY;c.textAlign='left';c.textBaseline='middle';c.fillText(F.kicker.toUpperCase(),M,kTop+kH/2,sw);c.restore()}
  lines.forEach((l,i)=>text(c,{s:l,x:M,y:headTop+i*hs*1.08,size:hs,wt:900,fill:'#fff',al:'left',t,at:.9+i*.08,maxW:sw}));
  c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));font(c,900,os,FN);c.fillStyle=F.acc||LY;c.textAlign='left';c.textBaseline='middle';c.fillText(F.off,M,offTop+offH/2,sw);c.restore();
  if(F.osub){c.save();c.globalAlpha=clamp(prog(t,1.6*ST.stagger,.4*ST.durMul));font(c,800,ss,FM);c.fillStyle='rgba(255,255,255,.86)';c.textAlign='left';c.textBaseline='middle';c.fillText(F.osub,M,subTop+subH/2,sw);c.restore()}

  if(hasP){
    pop(c,W-M-pw2/2,H-M-ph2/2,t,1.7,()=>{
      objDraw(c,'obj:Price card',-pw2/2,-ph2/2,pw2,ph2,()=>{
        boxPath(c,F.boxStyle,-pw2/2,-ph2/2,pw2,ph2,10*pk);c.fillStyle='#fff';c.fill();
        font(c,700,16*pk,FM);c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.flab,0,-14*pk);
        font(c,900,26*pk,FN);c.fillText(F.fprice,0,14*pk);
      });
    },{from:.75,dur:.6});
  }
}

/* ---------- layout 4: diagonal corner badge with a centred product ---------- */
function layoutCorner(c,W,H,t,D,F,I){
  const ST=postStyle();
  yellowField(c,W,H,F.bg1,F.bg2);
  objDraw(c,'obj:Masthead',0,0,W,H*.16,()=>{
    pop(c,W*.5,H*.07,t,.1,()=>logo(c,I,0,0,130,65),{from:.7,dur:.6});
    if(F.kicker){const ks=Math.min(22,W*.021,fitSize(c,F.kicker.toUpperCase(),700,FM,W*.84,22));c.save();c.globalAlpha=clamp(prog(t,.3*ST.stagger,.4*ST.durMul));font(c,700,ks,FM);c.fillStyle=F.mcol||'#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.kicker.toUpperCase(),W/2,H*.12,W*.84);c.restore()}
  });
  objDraw(c,'obj:Corner badge',W*.52,0,W*.48,H*.3,()=>{
    const p=ST.popEase(prog(t,.4*ST.stagger,.6*ST.durMul));if(p<=0)return;
    c.save();c.translate(W*.76,H*.11);c.rotate(.2*p);c.scale(p,p);
    const bw=W*.42,bh=H*.2;
    c.fillStyle=F.acc||'#C8102E';rr(c,-bw/2,-bh/2,bw,bh,16);c.fill();
    const os=Math.min(bh*.4,fitSize(c,F.off,900,FN,bw*.85,bh*.4));
    font(c,900,os,FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.off,0,-bh*.1);
    if(F.osub){font(c,800,Math.min(bh*.16,18),FM);c.fillText(F.osub,0,bh*.22)}
    c.restore();
  });
  const pcy=H*.52, ph=H*.4;
  floorShadow(c,W/2,pcy+ph/2-6,W*.5,.24);
  pop(c,W/2,pcy,t,.6,()=>drawImg(c,I.p,-W*.4,-ph/2,W*.8,ph,{label:'Product photo'}),{from:.8,dur:.9});
  const hs=Math.min(H*.055,W*.1);
  let y=H*.74;
  F.head.split('\n').forEach((l,i)=>{text(c,{s:l,x:W/2,y,size:Math.min(hs,fitSize(c,l,900,FM,W*.86,hs)),wt:900,fill:F.mcol||'#111',t,at:1+i*.08,maxW:W*.86});y+=hs*1.05});
  if(F.flab){
    pop(c,W/2,H*.93,t,1.6,()=>{
      const pw2=Math.min(W*.5,260),ph3=64;
      objDraw(c,'obj:Price card',-pw2/2,-ph3/2,pw2,ph3,()=>{
        boxPath(c,F.boxStyle,-pw2/2,-ph3/2,pw2,ph3,10);c.fillStyle=F.mcol||'#111';c.fill();
        font(c,700,16,FM);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.flab,0,-16);
        font(c,900,26,FN);c.fillStyle=F.acc||LY;c.fillText(F.fprice,0,14);
      });
    },{from:.7,dur:.6});
  }
  if(F.maple!=='no')madeInCanada(c,W*.12,H*.9,Math.min(22,W*.02),t,1.8);
}

/* ---------- layout 5: horizontal stacked colour bands ---------- */
function layoutStacked(c,W,H,t,D,F,I){
  const ST=postStyle();
  c.fillStyle=F.bg2||'#111';c.fillRect(0,0,W,H);
  const barH=H*.14;
  objDraw(c,'obj:Masthead',0,0,W,barH,()=>{
    const p=ST.textEase(prog(t,0,.5*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=F.mcol||'#111111';c.fillRect(0,0,W,barH);c.restore();
    pop(c,W*.16,barH*.5,t,.1,()=>logo(c,I,0,0,110,55),{from:.7,dur:.6});
    if(F.kicker){const kw=W*.56,ks=Math.min(22,W*.021,fitSize(c,F.kicker.toUpperCase(),700,FM,kw,22));
      c.save();c.globalAlpha=clamp(prog(t,.3*ST.stagger,.4*ST.durMul));font(c,700,ks,FM);c.fillStyle='#fff';c.textAlign='right';c.textBaseline='middle';c.fillText(F.kicker.toUpperCase(),W*.78,barH*.5,kw);c.restore()}
  });
  const hBandH=H*.22, hBandY=barH;
  objDraw(c,'obj:Headline band',0,hBandY,W,hBandH,()=>{
    c.fillStyle=F.bg1;c.fillRect(0,hBandY,W,hBandH);
    const hs=Math.min(hBandH*.4,W*.08),lines=F.head.split('\n');
    let y=hBandY+hBandH*.5-((lines.length-1)*hs*.5);
    lines.forEach((l,i)=>{text(c,{s:l,x:W/2,y:y+i*hs*1.02,size:Math.min(hs,fitSize(c,l,900,FM,W*.86,hs)),wt:900,fill:F.mcol||'#111',t,at:.4+i*.08,maxW:W*.86})});
  });
  const pBandY=hBandY+hBandH, pBandH=H*.38;
  objDraw(c,'obj:Footer',0,pBandY,W,pBandH,()=>{
    floorShadow(c,W/2,pBandY+pBandH*.86,W*.46,.22);
    pop(c,W/2,pBandY+pBandH/2,t,.6,()=>drawImg(c,I.p,-W*.4,-pBandH*.42,W*.8,pBandH*.84,{label:'Product photo'}),{from:.8,dur:.9});
  });
  const oBandY=pBandY+pBandH, oBandH=H-oBandY;
  objDraw(c,'obj:Price card',0,oBandY,W,oBandH,()=>{
    const p=ST.textEase(prog(t,1.3*ST.stagger,.6*ST.durMul));c.save();c.globalAlpha=p;c.fillStyle=F.acc||'#C8102E';c.fillRect(0,oBandY,W,oBandH);c.restore();
    const os=Math.min(oBandH*.4,fitSize(c,F.off,900,FN,W*.7,oBandH*.4));
    c.save();c.globalAlpha=clamp(prog(t,1.4*ST.stagger,.5*ST.durMul));font(c,900,os,FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.off,W/2,oBandY+oBandH*.38);c.restore();
    if(F.osub)text(c,{s:F.osub,x:W/2,y:oBandY+oBandH*.74,size:Math.min(oBandH*.18,W*.038),wt:800,fill:'#fff',t,at:1.6,maxW:W*.84});
  });
  if(F.maple!=='no')madeInCanada(c,W*.9,barH*.5,Math.min(20,W*.019),t,.3);
}

const LAYOUTS={circle:layoutCircle,split:layoutSplit,fullbleed:layoutFullbleed,corner:layoutCorner,stacked:layoutStacked};

/* ---------- field schema shared by every event-category template, so switching the
   Layout dropdown never loses or breaks any of the person's content ---------- */
function evFields(def){
  const base={num:'100',head:'HEADLINE\nHERE',tag:'That\'s comfortable.',kicker:'FOR A LIMITED TIME',
    pre:'UP TO',off:'50% OFF',osub:'SELECT ITEMS',flab:'STARTING FROM',fprice:'$599',seal:'',
    mcol:'#111111',acc:'#C8102E',bg1:'#FFE81A',bg2:'#E8C600',boxStyle:'rounded',maple:'yes'};
  const v=Object.assign({},base,def);
  return [STYLE_FIELD,layoutField(def&&def.layout),MCOL_FIELD,BOX_FIELD,
    {k:'acc',l:'Accent colour',t:'color',v:v.acc},
    {k:'kicker',l:'Eyebrow / kicker',t:'text',v:v.kicker},
    {k:'num',l:'Big number (circle & full-bleed layouts)',t:'text',v:v.num},
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
  fields:evFields({layout:'corner',head:'CANADA-WIDE\nSUPER SALE',kicker:'ONE WEEK ONLY',off:'UP TO 50%',osub:'OFF SELECT SOFAS',flab:'SAVE UP TO',fprice:'$1000',bg1:'#FFFFFF',bg2:'#FFE81A',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_seasonal',name:'Seasonal Savings',sub:'Flexible seasonal/holiday promo — swap colours per occasion',cat:'seasonal',
  fields:evFields({layout:'circle',head:'SEASONAL\nSAVINGS',kicker:'FOR A LIMITED TIME',off:'40% OFF',osub:'SELECT FURNITURE',flab:'STARTING FROM',fprice:'$399',bg1:'#FFE81A',bg2:'#E8C600',mcol:'#111111',acc:'#C8102E'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw},
 {id:'ev_blackfriday',name:'Black Friday',sub:'High-contrast black/yellow doorbuster push',cat:'blackfriday',
  fields:evFields({layout:'fullbleed',num:'',head:'BLACK\nFRIDAY',kicker:'DOORBUSTERS',off:'UP TO 60%',osub:'OFF STOREWIDE',flab:'STARTING FROM',fprice:'$299',bg1:'#111111',bg2:'#000000',mcol:'#111111',acc:'#FFE81A'}),
  images:[{k:'p',l:'Product photo'}],draw:evDraw}
];
