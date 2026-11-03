/* ---------- current Leon's house layouts (from the brand's own posts) ---------- */
const LY='#FFE81A';
function yellowField(c,W,H,c1,c2){/* two very different colours (e.g. yellow to black) blend into mud: use a gentle shade of the first instead */if(typeof lum==='function'&&Math.abs(lum(c1)-lum(c2))>.3){const m=/^#?([0-9a-f]{6})$/i.exec(c1||'');if(m){const n=parseInt(m[1],16),f=sh=>Math.round(((n>>sh)&255)*(lum(c1)>.5?.9:1.18));c2='#'+[16,8,0].map(sh=>Math.min(255,f(sh)).toString(16).padStart(2,'0')).join('')}}
  const g=c.createRadialGradient(W*.5,H*.42,W*.08,W*.5,H*.42,W*.85);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.fillRect(0,0,W,H)}
function mastCircle(c,W,H,t,I,fill,bf){
  const ST=postStyle();
  const bot=H*(bf||.36), R=W*.60, cy=bot-R, p=ST.textEase(prog(t,0,.7*ST.durMul));
  c.save();c.globalAlpha=p;c.fillStyle=fill;c.beginPath();c.arc(W/2,cy-(1-p)*70,R,0,TAU);c.fill();c.restore();
  const ly=H*.055;
  const align=(typeof state!=='undefined'&&state.logoAlign)||'center';
  const lx=align==='left'?(W*.09+logoBoxSize(65,130,I,2.6).w/2):W/2;
  pop(c,lx,ly,t,.15,()=>logo(c,I,0,0,130,65,2.6),{from:.7,dur:.6});
  /* the logo image itself carries the "That's comfortable." tagline when that
     variant is selected, so this just keeps the gap the old separate tagline
     line used to occupy, for consistent spacing whichever logo is active. */
  const top=ly+H*.045+H*.022;
  return {bottom:bot,top:top+H*.012,band:bot-H*.03-(top+H*.012),cy:cy,R:R};
}
function mastCard(c,W,H,t,I,fill,boxStyle){
  const ST=postStyle();
  const lw=logoBoxSize(58,115,I,2.6).w;
  /* The card used to hug the logo at exactly lw+40 wide. For the wide "logo + tagline"
     lockup (the default active logo) that left zero slack inside the card, so "left" and
     "centre" landed on the exact same pixel - the toggle looked like it had stopped working
     even though it was computing a different position every time. Give the card real slack
     (lw+160) regardless of which logo variant is active, so left vs centre always visibly differ. */
  const cw=Math.max(W*.26,250,lw+160),ch=H*.145,x=W/2-cw/2,p=ST.textEase(prog(t,0,.6*ST.durMul));
  c.save();c.globalAlpha=p;c.translate(0,-(1-p)*70);c.fillStyle=fill;boxPath(c,boxStyle,x,-40,cw,ch+40,34);c.fill();c.restore();
  const ly=ch*.40;
  const align=(typeof state!=='undefined'&&state.logoAlign)||'center';
  const lx=align==='left'?(x+30+lw/2):W/2;
  pop(c,lx,ly,t,.12,()=>logo(c,I,0,0,115,58,2.6),{from:.7,dur:.6});
  return {bottom:ch,top:ch+H*.03,band:0};
}
/* lay a number + headline lines inside the masthead band so nothing clips */
function mastText(c,W,m,t,num,headLines,numFill,headFill,numAt,headAt,o){
  const ST=postStyle(),O=o||{};
  const nShare=num?(O.nShare||.52):0, nh=m.band*nShare, hh=m.band-nh, n=Math.max(1,headLines.length);
  let y=m.top;
  if(num){
    const ns=Math.min(nh*.98,fitSize(c,num,900,FN,W*.52,nh*.98));
    c.save();c.globalAlpha=clamp(prog(t,numAt*ST.stagger,.5*ST.durMul));font(c,900,ns,FN);c.fillStyle=numFill;
    const An=alignFor(O.numKey||'num',W/2,W*.52);c.textAlign=An.align;c.textBaseline='middle';
    c.fillText(countText(num,prog(t,(numAt+.05)*ST.stagger,.9*ST.durMul)),An.x,y+nh/2);c.restore();y+=nh;
  }
  const hs0=Math.min(hh/n*.92,O.cap||W*.062),hw=O.width||W*.64;let used=0,hs=hs0;
  /* O.chord = {cy,R} of the masthead circle: its lower edge curves UP toward the sides, so the width a
     line may use shrinks toward the bottom. Size the shared headline so every line fits the chord at its
     own height (a few passes, since the block's height depends on the size). */
  if(O.chord){
    const availAt=yb=>{const dy=yb-O.chord.cy,R=O.chord.R;return Math.abs(dy)>=R?0:Math.min(hw,2*Math.sqrt(R*R-dy*dy)*.88)};
    for(let it=0;it<3;it++){
      const lg=hs*1.08,by=y+Math.max(0,(hh-lg*n)/2);let s2=hs0;
      headLines.forEach((ln,i)=>{s2=Math.min(s2,fitSize(c,ln,900,FM,Math.max(40,availAt(by+i*lg+lg*.92)),hs0))});
      hs=s2;
    }
  }
  /* Centre a TIGHT block of lines within the available band, rather than spreading them
     evenly across the whole band height. The band can be much taller than the text
     actually needs (e.g. no "num" above it leaves the full band to the headline), and
     spacing by band-share instead of by font size turned one extra line (one Enter in
     the Headline field) into a visually oversized gap between lines. */
  /* text() adds half a line again on top of blockY, so legacy callers sit ~.54 line low; chord mode (event
     circle layout) lifts by that amount so the block really is centred and clears the arc */
  const lineGap=hs*1.08, blockH=lineGap*n, blockY=y+Math.max(0,(hh-blockH)/2)+lineGap/2-(O.chord?lineGap*(num?.3:.54):0);
  headLines.forEach((l,i)=>{const sz=Math.min(hs,fitSize(c,l,900,FM,hw,hs));used=Math.max(used,sz);text(c,{s:l,key:O.key||'head',x:W/2,y:blockY+i*lineGap,size:sz,wt:900,fill:typeof headFill==='function'?headFill(i):headFill,t,at:headAt+i*.07,maxW:hw*1.04})});
  return used;
}
function bottomArc(c,W,H,topY,fill,t,at){
  const ST=postStyle();
  const p=ST.textEase(prog(t,(at==null?.5:at)*ST.stagger,.8*ST.durMul));if(p<=0)return H;
  const y=H-(H-topY)*p, R=W*1.15, cy=y+R;
  c.save();c.fillStyle=fill;c.beginPath();c.arc(W/2,cy,R,0,TAU);c.fill();c.restore();
  return y;
}
function madeInCanada(c,x,y,s,t,at){
  const ST=postStyle();
  const p=ST.popEase(prog(t,at*ST.stagger,.5*ST.durMul));if(p<=0)return;
  const img=BRAND.canada,w=s*7,r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:.391,h=w*r;
  objDraw(c,'obj:Canada',x-w/2,y-h/2,w,h,()=>{c.save();c.translate(x,y);c.scale(p,p);brandBadge(c,img,0,0,w);c.restore()});
}
const STYLE_FIELD={k:'style',l:'Animation style (whole post)',t:'select',v:'classic',o:Object.keys(POST_STYLES).map(k=>[k,POST_STYLES[k].name])};
const MCOL_FIELD={k:'mcol',l:'Masthead colour',t:'color',v:'#111111'};
const BOX_FIELD={k:'boxStyle',l:'Box style (cards, pills, badges)',t:'select',v:'rounded',o:Object.keys(BOX_STYLES).map(k=>[k,BOX_STYLES[k].name])};
const T_LEONS=[
{id:'lcircle',name:'Circle Masthead Sale',sub:'Black circle masthead, hero product on an arc, red starting-price bar',
 fields:[STYLE_FIELD,MCOL_FIELD,BOX_FIELD,{k:'num',l:'Big number',t:'text',v:'100'},{k:'head',l:'Headline',t:'area',v:'SUPER SOFA\nSALE!'},{k:'pre',l:'Offer prefix',t:'text',v:'UP TO'},{k:'off',l:'Offer',t:'text',v:'50% OFF'},{k:'osub',l:'Offer sub line',t:'text',v:'SELECT FABRIC SOFAS'},{k:'flab',l:'Footer label (blank hides bar)',t:'text',v:'STARTING FROM'},{k:'fprice',l:'Footer price',t:'text',v:'$599'},{k:'maple',l:'Made in Canada (yes/no)',t:'select',v:'no',o:['yes','no']},{k:'bg1',l:'Background centre',t:'color',v:'#FFE81A'},{k:'bg2',l:'Background edge',t:'color',v:'#E8C600'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  const ST=postStyle();
  yellowField(c,W,H,F.bg1,F.bg2);
  let m;
  objDraw(c,'obj:Masthead',0,0,W,H*.42,()=>{
    m=mastCircle(c,W,H,t,I,F.mcol||'#111111',.355);
    mastText(c,W,m,t,F.num,F.head.split('\n'),'#fff',LY,.4,.75);
  });
  const fh=F.flab?H*.085:0;
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.5,W,H*.5,()=>{
    arcTop=bottomArc(c,W,H-fh,H*.60,F.mcol||'#111111',t,.55);
    const band=(H-fh)-arcTop, os=Math.min(band*.46,fitSize(c,F.off,900,FN,W*.6,band*.46)), oy=arcTop+band*.42;
    c.save();c.globalAlpha=clamp(prog(t,1*ST.stagger,.5*ST.durMul));
    font(c,900,os,FN);const ow=c.measureText(F.off).width;
    font(c,900,os*.34,FM);const preW=c.measureText(F.pre).width,offCx=anchorX('off',W/2,90+(preW+14+ow)/2,W-90-(preW+14+ow)/2);
    c.fillStyle='#fff';c.textAlign='right';c.textBaseline='middle';c.fillText(F.pre,offCx-ow/2-14,oy);
    font(c,900,os,FN);c.fillStyle=LY;c.textAlign='center';c.fillText(F.off,offCx+Math.min(40,ow*.1),oy);c.restore();
    text(c,{s:F.osub,key:'osub',x:W/2,y:oy+os*.76,size:Math.min(band*.17,W*.037),wt:900,fill:'#fff',t,at:1.25,maxW:W*.84});
    if(F.flab){
      const p=ST.textEase(prog(t,1.4*ST.stagger,.6*ST.durMul));c.save();c.translate(0,(1-p)*fh);
      c.fillStyle='#C8102E';c.fillRect(0,H-fh,W,fh);
      font(c,800,fh*.3,FM);const lw=c.measureText(F.flab).width;
      font(c,900,fh*.44,FN);const pw=c.measureText(F.fprice).width+48,gp=fh*.03,barCx=anchorX('flab',W*.555,90+(lw+gp+pw)/2,W-90-(lw+gp+pw)/2),x0=barCx-(lw+gp+pw)/2;
      c.textBaseline='middle';
      font(c,800,fh*.3,FM);c.fillStyle='#fff';c.textAlign='left';c.fillText(F.flab,x0,H-fh/2);
      font(c,900,fh*.44,FN);
      c.fillStyle='#111';boxPath(c,F.boxStyle,x0+lw+gp,H-fh*.88,pw,fh*.76,10);c.fill();
      c.fillStyle='#fff';c.fillText(F.fprice,x0+lw+gp+24,H-fh/2);c.restore();
    }
  });
  const ph=(arcTop-m.bottom)*.92, pcy=(m.bottom+arcTop)/2;
  floorShadow(c,W/2,pcy+ph/2-6,W*.5,.26);
  pop(c,W/2,pcy,t,.5,()=>drawImg(c,I.p,-W*.42,-ph/2,W*.84,ph,{label:'Product photo'}),{from:.78,dur:.9});
  if(F.maple!=='no')madeInCanada(c,W*.9,arcTop-H*.035,Math.min(24,W*.022),t,1.3);
 }},
{id:'lclean',name:'Clean Offer',sub:'Logo card, one product, black arc with the offer — the everyday Leon\'s post',
 fields:[STYLE_FIELD,MCOL_FIELD,BOX_FIELD,{k:'off',l:'Offer',t:'text',v:'15% OFF'},{k:'l1',l:'Condition line 1',t:'text',v:'ANY BLACK TAG COFFEE TABLE'},{k:'l2',l:'Condition line 2',t:'text',v:'WITH ANY UPHOLSTERY PURCHASE'},{k:'bg1',l:'Background centre',t:'color',v:'#FFE81A'},{k:'bg2',l:'Background edge',t:'color',v:'#E8C600'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  const ST=postStyle();
  yellowField(c,W,H,F.bg1,F.bg2);
  let m;
  objDraw(c,'obj:Masthead',0,0,W,H*.22,()=>{m=mastCard(c,W,H,t,I,F.mcol||'#111111',F.boxStyle)});
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.5,W,H*.5,()=>{
    arcTop=bottomArc(c,W,H,H*.68,F.mcol||'#111111',t,.5);
    const band=H-arcTop, os=Math.min(band*.42,fitSize(c,F.off,900,FN,W*.72,band*.42)), oy=arcTop+band*.36;
    c.save();c.globalAlpha=clamp(prog(t,.95*ST.stagger,.5*ST.durMul));font(c,900,os,FN);c.fillStyle=LY;{const Ao=alignFor('off',W/2,W*.72);c.textAlign=Ao.align;c.textBaseline='middle';c.fillText(F.off,Ao.x,oy)}c.restore();
    const ss=Math.min(band*.13,W*.032);
    text(c,{s:F.l1,key:'l1',x:W/2,y:oy+os*.6,size:ss,wt:900,fill:'#fff',t,at:1.2,maxW:W*.86});
    text(c,{s:F.l2,key:'l2',x:W/2,y:oy+os*.6+ss*1.3,size:ss,wt:900,fill:'#fff',t,at:1.3,maxW:W*.86});
  });
  const ph=(arcTop-m.bottom)*.84, pcy=m.bottom+(arcTop-m.bottom)*.5;
  floorShadow(c,W/2,pcy+ph/2-8,W*.46,.24);
  pop(c,W/2,pcy,t,.4,()=>drawImg(c,I.p,-W*.4,-ph/2,W*.8,ph,{label:'Product photo'}),{from:.8,dur:.9});
 }},
{id:'lcallout',name:'Product Callout',sub:'Floating price or name card, seal badge and a brand strip beside the product',
 fields:[STYLE_FIELD,MCOL_FIELD,BOX_FIELD,{k:'mast',l:'Masthead',t:'select',v:'circle',o:['circle','card']},{k:'num',l:'Big number (circle only)',t:'text',v:'100'},{k:'head',l:'Headline',t:'area',v:'SUPER SOFA\nSALE!'},{k:'ctitle',l:'Callout title',t:'text',v:'$899'},{k:'cstrip',l:'Callout strip',t:'text',v:'SAVE $900'},{k:'cname',l:'Callout name',t:'text',v:'Milana II Luxury Plush Queen Mattress'},{k:'seal',l:'Seal badge (blank hides)',t:'text',v:'BEST SELLER'},{k:'off',l:'Offer',t:'text',v:'UP TO 50% OFF'},{k:'osub',l:'Offer sub line',t:'text',v:'SELECT MATTRESSES'},{k:'bg1',l:'Background centre',t:'color',v:'#FFE81A'},{k:'bg2',l:'Background edge',t:'color',v:'#E8C600'}],
 images:[{k:'p',l:'Product photo'},{k:'b',l:'Brand logo (optional)'}],
 draw(c,W,H,t,D,F,I){
  const ST=postStyle();
  yellowField(c,W,H,F.bg1,F.bg2);
  let m;
  objDraw(c,'obj:Masthead',0,0,W,F.mast==='card'?H*.22:H*.4,()=>{
    m=F.mast==='card'?mastCard(c,W,H,t,I,F.mcol||'#111111',F.boxStyle):mastCircle(c,W,H,t,I,F.mcol||'#111111',.34);
    if(F.mast!=='card')mastText(c,W,m,t,F.num,F.head.split('\n'),'#fff',LY,.4,.75);
  });
  let arcTop;
  objDraw(c,'obj:Footer',0,H*.55,W,H*.45,()=>{
    arcTop=bottomArc(c,W,H,H*.70,F.mcol||'#111111',t,.75);
    const band=H-arcTop, os=Math.min(band*.4,fitSize(c,F.off,900,FN,W*.84,band*.4)), oy=arcTop+band*.36;
    c.save();c.globalAlpha=clamp(prog(t,1.3*ST.stagger,.5*ST.durMul));font(c,900,os,FN);c.fillStyle=LY;{const Ao=alignFor('off',W/2,W*.84);c.textAlign=Ao.align;c.textBaseline='middle';c.fillText(F.off,Ao.x,oy)}c.restore();
    text(c,{s:F.osub,key:'osub',x:W/2,y:oy+os*.62,size:Math.min(band*.14,W*.034),wt:900,fill:'#fff',t,at:1.7,maxW:W*.86});
  });
  const zoneTop=m.bottom, zoneH=arcTop-zoneTop;
  const ph=zoneH*.74, pcy=zoneTop+zoneH*.62;
  floorShadow(c,W/2,pcy+ph/2-8,W*.48,.24);
  pop(c,W/2,pcy,t,.55,()=>drawImg(c,I.p,-W*.44,-ph/2,W*.88,ph,{label:'Product photo'}),{from:.8,dur:.9});
  const by=zoneTop+zoneH*.2;
  if(I.b)pop(c,W*.17,by,t,.9,()=>drawImg(c,I.b,-70,-40,140,80,{label:'Brand'}),{from:.7,dur:.5});
  else if(F.seal)pop(c,W*.14,by,t,.9,()=>{
    const img=BRAND.best,w=Math.min(150,W*.14),r=(img&&img.naturalWidth)?img.naturalHeight/img.naturalWidth:1.276,h=w*r;
    objDraw(c,'obj:Seal',-w/2,-h/2,w,h,()=>brandBadge(c,img,0,0,w));
  },{from:.3,dur:.7,rot:.5});
  pop(c,W*.76,by,t,1.05,()=>{
    const cw=Math.min(W*.4,Math.max(W*.24,240)),chh=F.cname?Math.min(zoneH*.52,190):Math.min(zoneH*.32,120);
    objDraw(c,'obj:Price card',-cw/2,-chh/2,cw,chh,()=>{
      c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=24;c.shadowOffsetY=8;boxPath(c,F.boxStyle,-cw/2,-chh/2,cw,chh,10);c.fillStyle='#fff';c.fill();c.restore();
      let y=-chh/2+chh*.22;
      font(c,900,Math.min(chh*.3,54),FN);c.fillStyle='#111';c.textBaseline='middle';{const A=alignFor('ctitle',0,cw-28);c.textAlign=A.align;c.fillText(F.ctitle,A.x,y,cw-28)}y+=chh*.2;
      if(F.cstrip){c.fillStyle='#111';boxPath(c,F.boxStyle,-cw/2+14,y-chh*.08,cw-28,chh*.17,4);c.fill();font(c,900,Math.min(chh*.12,22),FM);c.fillStyle=LY;{const A=alignFor('cstrip',0,cw-40);c.textAlign=A.align;c.fillText(F.cstrip,A.x,y,cw-40)}y+=chh*.2}
      if(F.cname){font(c,800,Math.min(chh*.12,22),FM);c.fillStyle='#111';const A=alignFor('cname',0,cw-32);c.textAlign=A.align;wrap(c,F.cname,cw-32).slice(0,3).forEach((l,i)=>c.fillText(l,A.x,y+chh*.1+i*chh*.14))}
    });
  },{from:.4,dur:.7});
 }},
];
