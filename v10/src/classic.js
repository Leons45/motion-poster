const T_CLASSIC=[
{id:'meme',name:'Seasonal Meme',sub:'Character cutout with falling leaves, snow or confetti',
 fields:[{k:'headline',l:'Headline',t:'text',v:'Me on September 30th:'},{k:'fx',l:'Ambient effect',t:'select',o:['leaves','snow','confetti','sparkle','none'],v:'leaves'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'hero',l:'Character or cutout (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);fx(c,W,H,t,D,F.fx,0);
  text(c,{s:F.headline,key:'headline',x:W/2,y:H*.055,size:78,fill:'#111',maxW:W*.88,t,at:.1});
  const p=prog(t,.45,1.1),bw=W*.8,bh=H*.76;
  if(p>0){
    c.save();c.globalAlpha=.16*eOut(clamp(p*2));c.fillStyle='#000';c.beginPath();c.ellipse(W/2,H*.965,bw*.2*(.6+.4*eBack(p)),16,0,0,7);c.fill();c.restore();
    c.save();c.translate(W/2,H*.965);const s=.55+.45*eBack(p);c.scale(s,s);c.rotate(wave(t,D,1)*.025*p);c.translate(0,wave(t,D,2)*-6);c.globalAlpha=clamp(p*2.5);
    drawImg(c,I.hero,-bw/2,-bh,bw,bh,{ay:1,label:'Character cutout'});c.restore();
  }
  fx(c,W,H,t,D,F.fx,1);
 }},
{id:'versus',name:'This vs That',sub:'Two-up comparison with sliding titles and a logo card',
 fields:[{k:'l',l:'Left title',t:'text',v:'If you love this emoji'},{k:'r',l:'Right title',t:'text',v:'You should try'},{k:'url',l:'Card web address',t:'text',v:'leons.ca'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Left image'},{k:'b',l:'Right image'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W/2,H*.4,W*.1,W/2,H*.4,H*.8);g.addColorStop(0,F.bg);g.addColorStop(1,shade(F.bg,-.1));c.fillStyle=g;c.fillRect(0,0,W,H);
  const ty=H*.2,cl=W*.27,cr=W*.74,sl=eOut(prog(t,.2,.8)),sr=eOut(prog(t,.4,.8));
  c.save();c.globalAlpha=prog(t,.2,.5);c.translate(-(1-sl)*220,0);text(c,{s:F.l,key:'l',x:cl,y:ty,size:64,fill:'#111',maxW:430});c.restore();
  c.save();c.globalAlpha=prog(t,.4,.5);c.translate((1-sr)*220,0);text(c,{s:F.r,key:'r',x:cr,y:ty,size:64,fill:'#111',maxW:430});c.restore();
  const top=ty+170,bot=H-350,bh=Math.min(560,bot-top),cy=(top+bot)/2;
  pop(c,cl,cy,t,.6,()=>{c.translate(0,wave(t,D,2)*8);drawImg(c,I.a,-210,-bh/2,420,bh,{label:'Left image'})},{from:.5});
  pop(c,cr,cy,t,.9,()=>{c.translate(0,wave(t,D,2,.3)*8);drawImg(c,I.b,-250,-bh/2,500,bh,{label:'Right image'})},{from:.5});
  /* the card is 420 tall and meant to overlap the bottom of the two images, never the
     canvas edge itself - anchor it from the bottom with a real margin instead of a
     fixed offset that put it 110px below the artboard on every ratio. */
  const cp=eOut(prog(t,1.1,.8)),ct=H-420-W*.037+(1-cp)*340;
  objDraw(c,'obj:Card',W/2-240,ct,480,420,()=>{rr(c,W/2-240,ct,480,420,56);c.fillStyle='#0A0A0A';c.fill()});
  /* this logo lives inside the fixed 480-wide card, not the full canvas, so "left" means
     the card's own left edge (with a little padding), not the artboard's edge. */
  logo(c,I,evLogoAlign()==='left'?logoAnchorX(W/2-240+25,125,250,I,1.6):W/2,ct+100,250,125);
  text(c,{s:F.url,key:'url',x:W/2,y:ct+245,size:24,wt:600,fill:'#fff',maxW:440});
 }},
{id:'hero',name:'Hero Spotlight',sub:'Dark event frame, dropped-in product, shine sweep',
 fields:[{k:'badge',l:'Badge title',t:'text',v:'DRAFT 2026'},{k:'url',l:'Badge address',t:'text',v:'LEONS.CA'},{k:'headline',l:'Headline',t:'area',v:'DRAFT LOTTERY WINNER &\nNO. 1 PICK IN 2026 HOME DRAFT'},{k:'kicker',l:'Kicker',t:'text',v:'THE NO.1 PICK IN'},{k:'big',l:'Big word',t:'text',v:'COMFORT'},{k:'sub',l:'Bottom line',t:'text',v:'UP YOUR HOME GAME'},{k:'bg',l:'Frame colour',t:'color',v:'#0B1F4D'},{k:'panel',l:'Panel colour',t:'color',v:'#FFE81A'}],
 images:[{k:'prod',l:'Hero product (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  c.save();c.fillStyle='#fff';c.globalAlpha=.05;const sh=(t/D)*180;
  for(let i=-3;i<9;i++){const x=i*180+sh;c.beginPath();c.moveTo(x,0);c.lineTo(x+70,0);c.lineTo(x-330,H);c.lineTo(x-400,H);c.closePath();c.fill()}c.restore();
  const vg=c.createRadialGradient(W/2,H*.5,H*.2,W/2,H*.5,H*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  const hp=eOut(prog(t,0,.7));c.save();c.translate(0,-(1-hp)*160);
  const mg=c.createLinearGradient(0,0,W,0);[[0,'#8d96a1'],[.2,'#eef1f4'],[.45,'#a7afb8'],[.7,'#f3f5f7'],[1,'#858e99']].forEach(s=>mg.addColorStop(s[0],s[1]));
  c.fillStyle=mg;c.fillRect(0,0,W,70);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,70,W,4);c.restore();
  pop(c,anchorX('badge',W/2,90+250,W-90-250),90,t,.2,()=>{objDraw(c,'obj:Badge',-250,-54,500,108,()=>{
    rr(c,-250,-54,500,108,18);c.fillStyle='#0A1636';c.fill();c.strokeStyle='#3C6BFF';c.lineWidth=5;c.stroke();
    logo(c,I,-135,0,150,75,1);c.textAlign='left';c.textBaseline='middle';c.fillStyle='#fff';font(c,900,44,FM);c.fillText(F.badge,-45,-14,270);
    c.fillStyle='#B9C3D6';font(c,600,22,FM);c.fillText(F.url,-45,28,270)})},{from:.8});
  text(c,{s:F.headline,key:'headline',x:W/2,y:170,size:46,fill:'#fff',maxW:W*.9,up:true,t,at:.5});
  const px=W*.07,pw=W*.86,py=300,pb=H-70,ph0=pb-py,wp=eOut(prog(t,.6,.9)),chh=ph0*wp,cy0=py+(ph0-chh)/2;
  if(wp>0){
    objDraw(c,'obj:Panel',px,cy0,pw,chh,()=>{
    c.save();rr(c,px,cy0,pw,chh,10);c.clip();
    const pg=c.createRadialGradient(W/2,py+ph0*.4,40,W/2,py+ph0*.4,pw*.8);pg.addColorStop(0,shade(F.panel,.35));pg.addColorStop(1,F.panel);c.fillStyle=pg;c.fillRect(px,py,pw,ph0);
    const top=py+24,bot=pb-300,bh=Math.min(bot-top,W*.78),pcy=(top+bot)/2,dp=prog(t,1.1,.9),yo=-(1-eBack(dp))*320,fl=wave(t,D,2)*8;
    c.save();c.globalAlpha=.22*clamp(dp*2);c.fillStyle='#000';c.beginPath();c.ellipse(W/2,pcy+bh/2-8,pw*.26,16,0,0,7);c.fill();c.restore();
    if(dp>0){c.save();c.globalAlpha=clamp(dp*3);drawImg(c,I.prod,px+pw*.1,pcy-bh/2+yo+fl,pw*.8,bh,{label:'Hero product'});c.restore()}
    text(c,{s:F.kicker,key:'kicker',x:W/2,y:pb-282,size:38,fill:'#111',wt:800,t,at:1.6,maxW:pw-40});
    const big=F.big.toUpperCase(),bs=fitSize(c,big,900,FM,pw-70,170);
    pop(c,W/2,pb-170,t,1.75,()=>{font(c,900,bs,FM);c.fillStyle='#0b0b0b';const A=alignFor('big',0,pw-70);c.textAlign=A.align;c.textBaseline='middle';c.fillText(big,A.x,0)},{from:.7});
    const sp=eOut(prog(t,2.1,.7));
    if(sp>0){font(c,700,30,FM);const s=F.sub.toUpperCase();c.fillStyle='#111';const A=alignFor('sub',W/2,pw-80);c.textAlign=A.align;c.globalAlpha=sp;c.fillText(s,A.x,pb-52);
      if(A.align==='center'){const sw=c.measureText(s).width,half=Math.max(0,(pw-80)/2-sw/2-24);c.fillRect(px+40,pb-53,half*sp,3);c.fillRect(px+pw-40-half*sp,pb-53,half*sp,3)}
      c.globalAlpha=1}
    const u=(t/D)%1,sw2=clamp((u-.55)/.3);
    if(sw2>0&&sw2<1){const x=px-300+(pw+600)*sw2,lg=c.createLinearGradient(x,0,x+120,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,.4)');lg.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=lg;c.beginPath();c.moveTo(x,py);c.lineTo(x+120,py);c.lineTo(x-180,pb);c.lineTo(x-300,pb);c.closePath();c.fill()}
    c.restore();
    });
  }
 }},
{id:'sale',name:'Sale Banner',sub:'Black header, offer count-up, two products on a yellow arc',
 fields:[{k:'lead',l:'Lead number',t:'text',v:'100'},{k:'title',l:'Title',t:'text',v:'SUPER SOFA SALE!'},{k:'pre',l:'Small prefix',t:'area',v:'UP\nTO'},{k:'big',l:'Big offer',t:'text',v:'50% OFF'},{k:'sub',l:'Sub line',t:'text',v:'SELECT SOFAS'},{k:'bg',l:'Background',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Product A'},{k:'b',l:'Product B'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const oy=(H-1080)*.14;
  const ap=eOut(prog(t,.2,.9));c.fillStyle=F.acc;c.beginPath();c.ellipse(W/2,H*1.2+(1-ap)*H*.5,W*1.0,H*.6,0,0,7);c.fill();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,115,230,I,1.6):W/2,100,t,0,()=>logo(c,I,0,0,230,115),{from:.8,dur:.6});
  const hp=prog(t,.45,.6);c.save();c.globalAlpha=hp;c.translate(0,(1-eOut(hp))*40);mixed(c,[[F.lead+' ','#fff'],[F.title,F.acc]],W/2,258,84,900,FN,W*.92,'title');c.restore();
  const pre=F.pre.split('\n'),pz=44;font(c,900,pz,FN);const preW=Math.max(...pre.map(s=>c.measureText(s).width));
  const bigSz=fitSize(c,F.big,900,FN,W*.92-preW-30,210);font(c,900,bigSz,FN);const tot=preW+30+c.measureText(F.big).width;
  pop(c,W/2,410+oy,t,.9,()=>{const Ax=alignFor('big',0,W*.92),x0=Ax.align==='left'?Ax.x:Ax.align==='right'?Ax.x-tot:Ax.x-tot/2;c.textBaseline='middle';c.textAlign='left';font(c,900,pz,FN);c.fillStyle='#fff';
    pre.forEach((s,i)=>c.fillText(s,x0,(i-(pre.length-1)/2)*pz));font(c,900,bigSz,FN);c.fillStyle=F.acc;c.fillText(countText(F.big,prog(t,1.0,1.0)),x0+preW+30,0)},{from:.7});
  text(c,{s:F.sub,key:'sub',x:W/2,y:490+oy,size:52,fill:'#fff',wt:900,fam:FN,t,at:1.3,maxW:W*.9});
  const rt=H*.6,top=Math.max(rt-140,560+oy),bh=H-34-top,l=eOut(prog(t,.7,.9)),r=eOut(prog(t,.9,.9));
  c.save();c.translate(-(1-l)*W*.7,wave(t,D,2)*5);drawImg(c,I.a,-W*.04,top,W*.56,bh,{ay:1,label:'Product A'});c.restore();
  c.save();c.translate((1-r)*W*.7,wave(t,D,2,.25)*5);drawImg(c,I.b,W*.46,top,W*.6,bh,{ay:1,label:'Product B'});c.restore();
 }},
{id:'price',name:'Product Price Card',sub:'Single product with badge, promo seal and price tag',
 fields:[{k:'lead',l:'Lead number',t:'text',v:'100'},{k:'l1',l:'Headline line 1',t:'text',v:'SUPER'},{k:'l2',l:'Headline line 2',t:'text',v:'SOFA SALE!'},{k:'badge',l:'Round badge',t:'area',v:'50%\nOFF'},{k:'promo',l:'Promo seal',t:'area',v:'SAVE\nTHE\nTAX\nON SELECT TVs'},{k:'price',l:'Price',t:'text',v:'$649'},{k:'save',l:'Savings strip',t:'text',v:'SAVE $650'},{k:'name',l:'Product name',t:'area',v:'Avery\nSofa'},{k:'legal',l:'Legal line',t:'text',v:'Valid at participating locations.'},{k:'bg',l:'Background',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'prod',l:'Product image'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const ap=eOut(prog(t,.1,.9));c.fillStyle=F.acc;c.beginPath();c.ellipse(W*.78,H*1.16+(1-ap)*H*.5,W*1.0,H*.62,-.06,0,7);c.fill();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,105,210,I,1.6):W/2,92,t,0,()=>logo(c,I,0,0,210,105),{from:.8,dur:.6});
  const h1=prog(t,.4,.6),h2=prog(t,.55,.6);
  c.save();c.globalAlpha=h1;c.translate(0,(1-eOut(h1))*40);mixed(c,[[F.lead+' ','#fff'],[F.l1,F.acc]],W/2,235,104,900,FN,W*.92,'l1');c.restore();
  c.save();c.globalAlpha=h2;c.translate(0,(1-eOut(h2))*40);mixed(c,[[F.l2,F.acc]],W/2,335,104,900,FN,W*.92,'l2');c.restore();
  const top=388,bh=Math.max(200,H*.74-top),pe=eOut(prog(t,.7,.9));
  if(pe>0){c.save();c.translate(W/2+(1-pe)*W,top+bh/2+wave(t,D,2)*6);c.rotate((1-pe)*.15);drawImg(c,I.prod,-W*.4,-bh/2,W*.8,bh,{label:'Product'});c.restore()}
  pop(c,anchorX('badge',W*.15,190,W-190),top+55,t,1.2,()=>{objDraw(c,'obj:Badge',-100,-100,200,200,()=>{c.rotate(wave(t,D,2)*.07);c.fillStyle=F.acc;c.beginPath();c.arc(0,0,100,0,7);c.fill();stack(c,F.badge.split('\n'),[74,58,40],'#000')})},{from:.3,ease:eBack});
  pop(c,anchorX('promo',W*.66,202,W-202),H*.705,t,1.5,()=>{objDraw(c,'obj:Promo seal',-112,-112,224,224,()=>{c.rotate(wave(t,D,2,.5)*.06);c.fillStyle=F.acc;c.beginPath();c.arc(0,0,112,0,7);c.fill();c.lineWidth=4;c.strokeStyle='#000';c.beginPath();c.arc(0,0,102,0,7);c.stroke();stack(c,F.promo.split('\n'),[44,36,92,24],'#000')})},{from:.3});
  const tx=W*.17,ty=H*.80,tw=350,th=160,pt=eOut(prog(t,1.4,.7));
  c.save();c.translate(0,(1-pt)*260);c.globalAlpha=clamp(pt*2);
  objDraw(c,'obj:Price tag',tx,ty,tw,th,()=>{
    rr(c,tx,ty,tw,th,26);c.fillStyle='#000';c.fill();
    const ps=fitSize(c,F.price,900,FN,tw-50,104);font(c,900,ps,FN);c.fillStyle='#fff';{const A=alignFor('price',tx+tw/2,tw-50);c.textAlign=A.align;c.textBaseline='middle';c.fillText(countText(F.price,prog(t,1.5,.8)),A.x,ty+62)}
    rr(c,tx+28,ty+110,tw-56,34,4);c.fillStyle=F.acc;c.fill();font(c,900,26,FN);c.fillStyle='#000';{const A=alignFor('save',tx+tw/2,tw-70);c.textAlign=A.align;c.fillText(F.save,A.x,ty+128,tw-70)}
  });
  c.restore();
  pop(c,tx+tw,ty+4,t,1.8,()=>{objDraw(c,'obj:Tag corner',-36,-36,72,72,()=>{c.fillStyle='#000';c.beginPath();c.arc(0,0,36,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.stroke();c.fillRect(-16,-3,32,6);c.fillRect(-3,-16,6,32)})},{from:.2});
  text(c,{s:F.name,key:'name',x:tx+tw+64,y:ty+26,size:46,al:'left',fill:'#111',t,at:1.8,maxW:300});
  text(c,{s:F.legal,key:'legal',x:W/2,y:H-52,size:22,wt:600,fill:'#111',t,at:2.0,maxW:W*.9});
 }},
{id:'number',name:'Big Number Hit',sub:'Counting hero stat, curved header, tilted flyer',
 fields:[{k:'num',l:'Big number',t:'text',v:'100'},{k:'label',l:'Label',t:'area',v:'SUPER SOFA\nSALE!'},{k:'cta',l:'Call to action',t:'area',v:'STARTS\nTODAY!'},{k:'bg',l:'Top colour',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'flyer',l:'Flyer or product shot'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W/2,H,50,W/2,H,H*.8);g.addColorStop(0,shade(F.acc,.25));g.addColorStop(1,F.acc);c.fillStyle=g;c.fillRect(0,0,W,H);
  const y0=H*.60,k=eOut(prog(t,0,.8));
  objDraw(c,'obj:Header panel',0,0,W,y0,()=>{
    c.fillStyle=F.bg;c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,y0*k);c.quadraticCurveTo(W/2,(y0+H*.22)*k,0,y0*k);c.closePath();c.fill();
  });
  const lcy=Math.max(100,H*.085);
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,115,230,I,1.6):W/2,lcy,t,.2,()=>logo(c,I,0,0,230,115),{from:.8,dur:.6});
  const ns=fitSize(c,F.num,900,FN,W*.62,520),ncy=H*.32;
  pop(c,W/2,ncy,t,.35,()=>{font(c,900,ns,FN);c.fillStyle='#fff';const A=alignFor('num',0,W*.62);c.textAlign=A.align;c.textBaseline='middle';c.fillText(countText(F.num,prog(t,.4,.9)),A.x,0)},{from:1.5,ease:eOut,dur:.8});
  text(c,{s:F.label,key:'label',x:W/2,y:ncy+ns*.4,size:96,fill:F.acc,fam:FN,wt:900,lh:1,maxW:W*.9,t,at:.9,gap:.15});
  const fe=eOut(prog(t,.9,.9));
  /* anchored + sized so the tilted flyer's bottom edge lands inside the artboard with a
     real margin, not H*.69+H*.42 = 1.11H, which ran 11-21% of the canvas height off the
     bottom edge on every ratio. */
  c.save();c.translate(W*.33,H*.58+(1-fe)*H*.5);c.rotate(-.13+wave(t,D,1)*.02);drawImg(c,I.flyer,-W*.19,0,W*.38,H*.37,{ay:0,label:'Flyer'});c.restore();
  pop(c,W*.76,H*.85,t,1.3,()=>{const s=1+.03*wave(t,D,2);c.scale(s,s);c.fillStyle='#111';const A=alignFor('cta',0,W*.42);c.textAlign=A.align;c.textBaseline='middle';
    const L=F.cta.split('\n');font(c,900,100,FN);L.forEach((l,i)=>c.fillText(l,A.x,(i-(L.length-1)/2)*95,W*.42))},{from:.6});
 }},
{id:'maple',name:'Maple Announcement',sub:'Bilingual-ready sale card on a spinning sunburst',
 fields:[{k:'l1',l:'Line 1',t:'text',v:'SUPER'},{k:'l2',l:'Line 2',t:'text',v:'SOLDE'},{k:'sub',l:'Sub line',t:'text',v:'VRAI NORD'},{k:'cta',l:'Call to action',t:'text',v:'EN COURS!'},{k:'col',l:'Headline colour',t:'color',v:'#C8102E'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'logo',l:'Logo override (e.g. French logo)'}],
 draw(c,W,H,t,D,F,I){
  const cy=H*.5,S=W*.52;
  const g=c.createRadialGradient(W/2,H*.8,50,W/2,H*.8,W*.9);g.addColorStop(0,shade(F.bg,.3));g.addColorStop(1,F.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
  c.save();c.translate(W/2,cy);c.rotate((t/D)*TAU/12);c.fillStyle='rgba(255,255,255,.16)';
  for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(0,0);c.arc(0,0,Math.max(W,H),a,a+TAU/24);c.closePath();c.fill()}c.restore();
  const p=prog(t,.15,1.0);
  if(p>0){objDraw(c,'obj:Leaf',W/2-S/2,cy-S/2,S,S,()=>{
    c.save();c.translate(W/2,cy);c.rotate((1-p)*-.5);const s=S*eBack(p)*(1+.012*wave(t,D,2));c.scale(s,s);
    c.shadowColor='rgba(0,0,0,.14)';c.shadowBlur=30/Math.max(s,1)*S;c.fillStyle='#fff';leafPath(c);c.fill();c.restore()
  })}
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,115,230,I,1.6):W/2,cy-300,t,.7,()=>logo(c,I,0,0,230,115),{from:.7,dur:.6});
  const sz=Math.min(fitSize(c,F.l1,900,FN,W*.6,190),fitSize(c,F.l2,900,FN,W*.6,190));
  pop(c,W/2,cy-135,t,.9,()=>{font(c,900,sz,FN);c.fillStyle=F.col;const A=alignFor('l1',0,W*.6);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.l1,A.x,0)},{from:.6});
  pop(c,W/2,cy+35,t,1.05,()=>{font(c,900,sz,FN);c.fillStyle=F.col;const A=alignFor('l2',0,W*.6);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.l2,A.x,0)},{from:.6});
  pop(c,W/2,cy+150,t,1.25,()=>{font(c,800,50,FM);c.fillStyle=F.col;const A=alignFor('sub',0,W*.5);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.sub,A.x,0,W*.5)},{from:.7});
  pop(c,W/2,cy+265,t,1.45,()=>{const s=1+.04*wave(t,D,2);c.scale(s,s);font(c,800,60,FM);c.fillStyle='#111';const A=alignFor('cta',0,W*.6);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.cta,A.x,0,W*.6)},{from:.7});
 }},
{id:'mascot',name:'Mascot Feature',sub:'Character beside a product with text reveal',
 fields:[{k:'a',l:'Line 1',t:'text',v:'Now'},{k:'b',l:'Big word',t:'text',v:"THAT'S"},{k:'c',l:'Line 3',t:'text',v:'Comfortable!'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'logo',l:'Logo override (e.g. a sub-brand logo)'},{k:'prop',l:'Product (crib, bed, sofa)'},{k:'hero',l:'Character cutout (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W*.5,H*.4,W*.1,W*.5,H*.4,H*.8);g.addColorStop(0,shade(F.bg,.2));g.addColorStop(1,F.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,130,300,I,1.6):W/2,H*.125,t,.1,()=>logo(c,I,0,0,300,130),{from:.8,dur:.6});
  const pe=eOut(prog(t,.4,.9));
  if(pe>0){c.save();c.globalAlpha=clamp(pe*2);c.translate((1-pe)*W*.5,wave(t,D,2,.2)*4);drawImg(c,I.prop,W*.38,H*.5,W*.54,H*.44,{ay:1,label:'Product'});c.restore()}
  const hp=prog(t,.6,1.0);
  if(hp>0){c.save();c.translate(W*.27,H*.97);const s=.6+.4*eBack(hp);c.scale(s,s);c.rotate(wave(t,D,1)*.012);c.globalAlpha=clamp(hp*2.5);
    drawImg(c,I.hero,-W*.25,-H*.76,W*.5,H*.76,{ay:1,label:'Character cutout'});c.restore()}
  const x=W*.53;
  text(c,{s:F.a,key:'a',x,y:H*.255-34,size:62,wt:700,fill:'#111',al:'left',maxW:W*.44,t,at:1.0});
  const bs=fitSize(c,F.b,900,FM,W*.42,130);
  pop(c,x,H*.34,t,1.2,()=>{const s=1+.025*wave(t,D,2);c.scale(s,s);font(c,900,bs,FM);c.fillStyle='#000';c.textBaseline='middle';
    const tp=cur(),ov=tp?styleFor(tp.id,'b'):null,maxW=W*.42;let align='left',ax=0;
    if(ov&&ov.al&&ov.al!=='left'){align=ov.al;ax=align==='center'?maxW/2:maxW}
    c.textAlign=align;c.fillText(F.b,ax,0)},{from:.6});
  text(c,{s:F.c,key:'c',x,y:H*.425-29,size:54,wt:700,fill:'#111',al:'left',maxW:W*.44,t,at:1.5});
 }},
{id:'peek',name:'Peek-a-Boo',sub:'Giant headline with a character rising from the bottom',
 fields:[{k:'head',l:'Headline',t:'text',v:'LEO'},{k:'sub',l:'Sub line',t:'area',v:'is one of the most popular\nbaby names of the year!'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'hero',l:'Peeking character (transparent PNG, cropped at the chest)'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W*.5,H*.35,W*.1,W*.5,H*.35,H*.8);g.addColorStop(0,shade(F.bg,.2));g.addColorStop(1,F.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
  /* cap the headline so a short, all-caps word (little width constraint, so it grows
     toward the font-size cap) still leaves real breathing room above it instead of
     nearly touching the top edge */
  const hs=fitSize(c,F.head,900,FM,W*.7,Math.min(330,H*.3));
  pop(c,W/2,H*.19,t,.15,()=>{font(c,900,hs,FM);c.fillStyle='#000';const A=alignFor('head',0,W*.7);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.head,A.x,0)},{from:.5});
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.30,size:54,wt:800,fill:'#111',maxW:W*.88,lh:1.12,t,at:.7,gap:.15});
  const bh=H*.4,pk=eBack(prog(t,1.0,1.1));
  if(prog(t,1.0,1.1)>0){c.save();c.translate(W/2,H);c.translate(0,(1-pk)*bh*.95);c.rotate(wave(t,D,1)*.014);c.translate(0,wave(t,D,2)*-5);
    drawImg(c,I.hero,-W*.45,-bh,W*.9,bh,{ay:1,label:'Peeking character'});c.restore()}
 }},
{id:'compare',name:'Before and After',sub:'Two stacked photos with verdict icons',
 fields:[{k:'ta',l:'Top label',t:'text',v:'COMFORT IN A BOX?'},{k:'ia',l:'Top icon',t:'select',o:['cross','check','none'],v:'cross'},{k:'tb',l:'Bottom label',t:'text',v:'REAL COMFORT?'},{k:'ib',l:'Bottom icon',t:'select',o:['cross','check','none'],v:'check'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Top photo (fills the top half)'},{k:'b',l:'Bottom photo (fills the bottom half)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const h2=H/2;
  const panel=(y0,img,txt,icon,at,fromTop,ph0,lab,key)=>{
    const p=eOut(prog(t,at,.9));if(p<=0)return;const hh=h2*p;
    c.save();c.beginPath();c.rect(0,fromTop?y0:y0+h2-hh,W,hh);c.clip();
    c.fillStyle=F.bg;c.fillRect(0,y0,W,h2);const z=1.04+.025*wave(t,D,1,ph0);
    c.translate(W/2,y0+h2/2);c.scale(z,z);c.translate(-W/2,-(y0+h2/2));
    drawImg(c,img,0,y0,W,h2,{fit:'cover-safe',label:lab});c.restore();
    font(c,800,46,FM);const w=c.measureText(txt).width,iw=icon==='none'?0:78,ly=y0+h2*.1;
    const maxW=W*.7,A=alignFor(key,W/2-iw/2,maxW),rightEdge=A.align==='left'?w:A.align==='center'?w/2:0;
    pop(c,A.x,ly,t,at+.4,()=>{font(c,800,46,FM);c.fillStyle='#111';c.textAlign=A.align;c.textBaseline='middle';c.fillText(txt,0,0)},{from:.7,dur:.6});
    if(icon!=='none')pop(c,A.x+rightEdge+44+iw/2,ly,t,at+.7,()=>{objDraw(c,'obj:'+(fromTop?'Top verdict':'Bottom verdict'),-26,-26,52,52,()=>verdict(c,icon,0,0,26))},{from:.2,rot:icon==='cross'?.6:0});
  };
  panel(0,I.a,F.ta,F.ia,.1,true,0,'Top photo','ta');
  panel(h2,I.b,F.tb,F.ib,1.0,false,.25,'Bottom photo','tb');
  if(t>1.0){c.fillStyle='rgba(255,255,255,.75)';c.fillRect(0,h2-2,W,4)}
 }}
];