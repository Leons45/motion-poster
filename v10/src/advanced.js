/* ---------- advanced motion helpers ---------- */
function burstPath(c,cx,cy,rx,ry,n,inner,rot){
  c.beginPath();
  for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,k=i%2?inner:1,x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;i?c.lineTo(x,y):c.moveTo(x,y)}
  c.closePath();
}
function marquee(c,W,y,size,str,t,D,k,dir,mode,col,sw){
  font(c,900,size,FM);const unit=str+'   •   ',w=c.measureText(unit).width;
  const o=(((t/D*k*w*dir)%w)+w)%w;
  c.textAlign='left';c.textBaseline='middle';
  if(mode==='stroke'){c.strokeStyle=col;c.lineWidth=sw||4;c.lineJoin='round'}else c.fillStyle=col;
  for(let x=o-w;x<W;x+=w){if(mode==='stroke')c.strokeText(unit,x,y);else c.fillText(unit,x,y)}
}
function rings(c,cx,cy,t,at,col,n){
  for(let i=0;i<(n||3);i++){const p=prog(t,at+i*.12,.9);if(p<=0||p>=1)continue;
    c.save();c.globalAlpha=(1-p)*.8;c.strokeStyle=col;c.lineWidth=14*(1-p)+2;c.beginPath();c.arc(cx,cy,40+eOut(p)*520,0,7);c.stroke();c.restore()}
}
function confettiBurst(c,cx,cy,t,at,n,cols,seed){
  const r=rng(seed||7),u=t-at;
  for(let i=0;i<n;i++){
    const a=-Math.PI/2+(r()-.5)*2.6,v=350+r()*750,rs=(r()-.5)*14,sz=10+r()*14,col=cols[i%cols.length];
    if(u<0||u>2.4)continue;
    c.save();c.translate(cx+Math.cos(a)*v*u,cy+Math.sin(a)*v*u+520*u*u);c.rotate(rs*u);c.globalAlpha=clamp(2.4-u);c.fillStyle=col;c.fillRect(-sz/2,-sz/3,sz,sz*.66);c.restore();
  }
}
function rays(c,cx,cy,t,D,n,col,alpha,R){
  c.save();c.translate(cx,cy);c.rotate((t/D)*TAU/n);c.fillStyle=col;c.globalAlpha=alpha;
  for(let i=0;i<n;i++){const a=i*TAU/n;c.beginPath();c.moveTo(0,0);c.arc(0,0,R,a,a+TAU/(n*2));c.closePath();c.fill()}
  c.restore();
}
function glow(c,W,H,cx,cy,r,inner,outer){const g=c.createRadialGradient(cx,cy,10,cx,cy,r);g.addColorStop(0,inner);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,W,H)}
function pill(c,cx,cy,str,size,bg,fg,padX){
  font(c,800,size,FM);const w=c.measureText(str).width+padX*2,h=size*1.9;
  rr(c,cx-w/2,cy-h/2,w,h,h/2);c.fillStyle=bg;c.fill();c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.fillText(str,cx,cy+size*.04);
}

const T_ADV=[
{id:'kinetic',name:'Kinetic Slam',sub:'Words slam in with screen shake, flash and scrolling tickers',
 fields:[{k:'words',l:'Slam words (one per line)',t:'area',v:'SUPER\nSOFA\nSALE'},{k:'sub',l:'Sub line',t:'text',v:'UP TO 50% OFF SELECT SOFAS'},{k:'ticker',l:'Ticker text',t:'text',v:"THAT'S COMFORTABLE"},{k:'bg',l:'Background',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  const words=F.words.split('\n').filter(Boolean),n=Math.max(1,words.length);
  let sx=0,sy=0,flash=0;
  words.forEach((w,i)=>{const u=t-(.6+i*.35);if(u>0&&u<.4){const k=1-u/.4;sx+=Math.sin(u*120)*14*k;sy+=Math.cos(u*100)*10*k;flash=Math.max(flash,.3*k)}});
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  c.save();c.fillStyle=F.acc;c.globalAlpha=.07;const sh=(t/D)*220;
  for(let i=-3;i<9;i++){const x=i*220+sh;c.beginPath();c.moveTo(x,0);c.lineTo(x+90,0);c.lineTo(x-300,H);c.lineTo(x-390,H);c.closePath();c.fill()}c.restore();
  c.save();c.translate(sx,sy);
  pop(c,W/2,100,t,0,()=>logo(c,I,0,0,230,115),{from:.8,dur:.6});
  const sz=Math.min(250,H*.5/(n*.95)),total=n*sz*.95,cy=H*.46;
  words.forEach((w,i)=>{
    const p=prog(t,.3+i*.35,.45);if(p<=0)return;
    const wsz=Math.min(sz,fitSize(c,w,900,FM,W*.9,sz)),y=cy-total/2+(i+.5)*sz*.95,s=1+(1-eOut(p))*2.2;
    c.save();c.translate(W/2,y);c.rotate((1-p)*(i%2?.12:-.12));c.scale(s,s);c.globalAlpha*=clamp(p*3);
    font(c,900,wsz,FM);c.fillStyle=i%2?F.acc:'#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(w,0,0);c.restore();
  });
  c.restore();
  if(flash>0){c.fillStyle='rgba(255,255,255,'+flash+')';c.fillRect(0,0,W,H)}
  text(c,{s:F.sub,x:W/2,y:H*.71,size:44,wt:800,fill:'#fff',maxW:W*.86,t,at:.3+n*.35+.3});
  const bp=eOut(prog(t,1.5,.7));
  [[H-196,F.acc,'#000',1],[H-104,'#fff','#111',-1]].forEach((b,i)=>{
    c.save();c.translate(0,(1-bp)*260);
    objDraw(c,'obj:Ticker '+(i+1),0,b[0],W,84,()=>{
      c.fillStyle=b[1];c.fillRect(0,b[0],W,84);
      c.beginPath();c.rect(0,b[0],W,84);c.clip();marquee(c,W,b[0]+42,52,F.ticker,t,D,2,b[3],'fill',b[2]);
    });
    c.restore();
  });
 }},

{id:'priceburst',name:'Price Slam Burst',sub:'Spinning starburst, flipping price, strike-through and ribbon',
 fields:[{k:'eyebrow',l:'Eyebrow',t:'text',v:'LIMITED TIME'},{k:'name',l:'Product name',t:'text',v:'Avery Sofa'},{k:'was',l:'Old price',t:'text',v:'$1,299'},{k:'price',l:'Price',t:'text',v:'$649'},{k:'save',l:'Ribbon',t:'text',v:'SAVE $650'},{k:'cta',l:'Button',t:'text',v:'SHOP NOW'},{k:'legal',l:'Legal line',t:'text',v:'Valid at participating locations.'},{k:'bg',l:'Background',t:'color',v:'#0B0B0B'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'prod',l:'Product image (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const R=Math.min(W*.46,H*.34),cy=H*.46,bp=eOut(prog(t,.1,.9));
  glow(c,W,H,W/2,cy,W*.9,'rgba(255,232,26,.18)','rgba(0,0,0,0)');
  c.save();c.translate(W/2,cy);c.scale(bp,bp);
  objDraw(c,'obj:Burst',-R,-R,R*2,R*2,()=>{burstPath(c,0,0,R,R,24,.86,(t/D)*TAU/24);c.fillStyle=F.acc;c.fill()});
  c.restore();
  pop(c,W/2,82,t,0,()=>logo(c,I,0,0,200,100),{from:.8,dur:.6});
  /* On a near-square canvas R (capped by H*.34) shrinks enough that cy-R-10 rises above the
     fixed-position logo's bottom edge (logo is centred at y=82 with height ~100, so its
     bottom sits around y=132), letting the pill creep up underneath it. Keep a fixed clearance
     below the logo regardless of how tall/short the burst ends up on this ratio. */
  pop(c,W/2,Math.max(cy-R-10,176),t,.3,()=>{
    const s=1+.04*wave(t,D,3);c.scale(s,s);font(c,800,32,FM);const w=c.measureText(F.eyebrow).width+64;
    objDraw(c,'obj:Eyebrow pill',-w/2,-30,w,60,()=>{rr(c,-w/2,-30,w,60,30);c.fillStyle='#fff';c.fill();c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.eyebrow,0,2)});
  },{from:.6});
  const pe=eBack(prog(t,.6,.9));
  if(pe>0){c.save();c.translate(W/2,cy-R*.16+wave(t,D,2)*8);c.scale(.5+.5*pe,.5+.5*pe);c.rotate(wave(t,D,1)*.02);c.globalAlpha*=clamp(pe*2);drawImg(c,I.prod,-R*.66,-R*.5,R*1.32,R*1.0,{label:'Product',shadow:30});c.restore()}
  text(c,{s:F.name,x:W/2,y:cy+R*.4-R*.06,size:R*.11,wt:800,fill:'#111',t,at:1.2,maxW:R*1.4});
  const wp=prog(t,1.4,.5);
  if(wp>0){const y=cy+R*.56;font(c,700,R*.085,FM);const w=c.measureText(F.was).width;c.globalAlpha=wp;c.fillStyle='rgba(0,0,0,.65)';c.textAlign='center';c.textBaseline='middle';c.fillText(F.was,W/2,y);
    const sp=prog(t,1.9,.4);c.fillStyle='#E4262C';c.fillRect(W/2-w/2-10,y-3,(w+20)*sp,6);c.globalAlpha=1}
  const fp=prog(t,1.5,.7);
  if(fp>0){c.save();c.translate(W/2,cy+R*.78);const ang=(1-eOut(fp))*Math.PI/2;c.scale(1,Math.max(.01,Math.cos(ang)));c.globalAlpha=clamp(fp*3);
    const ps=fitSize(c,F.price,900,FN,R*1.1,R*.34);font(c,900,ps,FN);c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(countText(F.price,prog(t,1.6,.8)),0,0);c.restore()}
  const rp=eOut(prog(t,1.0,.7));
  if(rp>0){c.save();c.translate(W*.76+(1-rp)*W*.6,cy-R*.62);c.rotate(.12);font(c,900,44,FN);const w=c.measureText(F.save).width+60;
    objDraw(c,'obj:Ribbon',-w/2,-40,w,80,()=>{rr(c,-w/2,-40,w,80,10);c.fillStyle='#111';c.fill();c.fillStyle=F.acc;c.textAlign='center';c.textBaseline='middle';c.fillText(F.save,0,2)});
    c.restore()}
  pop(c,W/2,H-135,t,2.0,()=>{
    const s=1+.04*wave(t,D,2);c.scale(s,s);font(c,900,40,FM);const w=c.measureText(F.cta).width+120;
    objDraw(c,'obj:Button',-w/2,-42,w,84,()=>{rr(c,-w/2,-42,w,84,42);c.fillStyle=F.acc;c.fill();c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,2)});
  },{from:.5});
  text(c,{s:F.legal,x:W/2,y:H-62,size:22,wt:600,fill:'rgba(255,255,255,.75)',t,at:2.3,maxW:W*.9});
 }},

{id:'marquee',name:'Marquee Promo',sub:'Scrolling giant type rows behind a hero product and offer badge',
 fields:[{k:'ticker',l:'Ticker phrases (comma separated)',t:'text',v:'SUPER SOFA SALE,UP TO 50% OFF,SELECT SOFAS'},{k:'big',l:'Badge number',t:'text',v:'50%'},{k:'bigsub',l:'Badge label',t:'text',v:'OFF'},{k:'cta',l:'Button',t:'text',v:'SHOP NOW'},{k:'bg',l:'Background',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'prod',l:'Product image (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const phr=F.ticker.split(',').map(s=>s.trim()).filter(Boolean);if(!phr.length)phr.push('SALE');
  const rows=7,rh=H/rows,size=rh*.82;
  for(let i=0;i<rows;i++){const p=eOut(prog(t,.05+i*.08,.7));c.save();c.globalAlpha=p;c.translate((i%2?1:-1)*(1-p)*W,0);
    marquee(c,W,rh*(i+.5),size,phr[i%phr.length],t,D,1,i%2?-1:1,i%2?'stroke':'fill',i%2?'#fff':F.acc,3);c.restore()}
  glow(c,W,H,W/2,H*.5,H*.62,'rgba(0,0,0,.78)','rgba(0,0,0,0)');
  c.save();c.translate(W/2,H*.075);const lp=prog(t,.3,.5);c.globalAlpha=lp;
  objDraw(c,'obj:Logo panel',-170,-62,340,124,()=>{rr(c,-170,-62,340,124,28);c.fillStyle='#000';c.fill();c.strokeStyle=F.acc;c.lineWidth=4;c.stroke();logo(c,I,0,0,230,110,1.35)});
  c.restore();
  const pe=eBack(prog(t,.7,.9));
  if(pe>0){c.save();c.translate(W/2,H*.5+wave(t,D,2)*10);c.rotate(wave(t,D,1)*.035);const s=.4+.6*pe;c.scale(s,s);c.globalAlpha*=clamp(pe*2);drawImg(c,I.prod,-W*.4,-H*.2,W*.8,H*.4,{label:'Product',shadow:40});c.restore()}
  pop(c,W*.78,H*.3,t,1.2,()=>{
    const s=1+.05*wave(t,D,2);c.scale(s,s);c.rotate(wave(t,D,1)*.06);
    objDraw(c,'obj:Badge burst',-160,-160,320,320,()=>{
      burstPath(c,0,0,150,150,16,.88,(t/D)*TAU/16);c.fillStyle=F.acc;c.fill();
      c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';
      const bs=fitSize(c,F.big,900,FN,200,110);font(c,900,bs,FN);c.fillText(countText(F.big,prog(t,1.3,1.0)),0,-18);
      font(c,900,46,FN);c.fillText(F.bigsub,0,50);
    });
  },{from:.3});
  pop(c,W/2,H-120,t,1.8,()=>{
    const s=1+.04*wave(t,D,2);c.scale(s,s);font(c,900,44,FM);const w=c.measureText(F.cta).width+130;
    objDraw(c,'obj:Button',-w/2,-45,w,90,()=>{rr(c,-w/2,-45,w,90,45);c.fillStyle='#fff';c.fill();c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,2)});
  },{from:.5});
 }},

{id:'countdown',name:'Countdown Reveal',sub:'3, 2, 1 with shockwaves, rays and a confetti burst into the offer',
 fields:[{k:'steps',l:'Countdown steps (comma separated)',t:'text',v:'3,2,1'},{k:'final',l:'Reveal text',t:'text',v:'SALE STARTS NOW'},{k:'sub',l:'Sub line',t:'text',v:'Up to 50% off select sofas'},{k:'bg',l:'Background',t:'color',v:'#000000'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  const steps=F.steps.split(',').map(s=>s.trim()).filter(Boolean),n=steps.length,tf=.2+n*.8,cy=H*.46;
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);glow(c,W,H,W/2,cy,W*.8,'rgba(255,232,26,.2)','rgba(0,0,0,0)');
  steps.forEach((s,i)=>{
    const at=.2+i*.8,p=prog(t,at,.8);if(p<=0||p>=1)return;
    const sc=1.7-.8*eOut(p),al=Math.min(1,p*8)*(p>.72?(1-p)*3.6:1);
    c.save();c.translate(W/2,cy);c.scale(sc,sc);c.globalAlpha*=al;font(c,900,Math.min(560,H*.42),FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(s,0,0);c.restore();
    rings(c,W/2,cy,t,at,'#fff',1);
  });
  if(t>=tf){
    rays(c,W/2,cy,t,D,24,F.acc,.14,Math.max(W,H));
    rings(c,W/2,cy,t,tf,F.acc,3);
    const fl=Math.max(0,1-(t-tf)/.25);if(fl>0){c.fillStyle='rgba(255,255,255,'+(fl*.5)+')';c.fillRect(0,0,W,H)}
    confettiBurst(c,W/2,cy,t,tf,70,[F.acc,'#fff','#E4262C','#fff'],11);
    pop(c,W/2,cy,t,tf,()=>{
      const sz=Math.min(170,H*.14);font(c,900,sz,FM);const lines=wrap(c,F.final,W*.86),lh=sz*1.0;
      c.fillStyle=F.acc;c.textAlign='center';c.textBaseline='middle';
      lines.forEach((l,i)=>c.fillText(l,0,(i-(lines.length-1)/2)*lh))},{from:2.4,dur:.6});
    text(c,{s:F.sub,x:W/2,y:cy+H*.17,size:46,wt:700,fill:'#fff',maxW:W*.86,t,at:tf+.5});
    pop(c,W/2,H*.1,t,tf+.2,()=>logo(c,I,0,0,230,115),{from:.7,dur:.6});
  }
 }},

{id:'carousel',name:'Product Carousel',sub:'Three products slide through with flipping price tags',
 fields:[{k:'head',l:'Headline',t:'text',v:'NEW ARRIVALS'},{k:'n1',l:'Product 1 name',t:'text',v:'Avery Sofa'},{k:'p1',l:'Product 1 price',t:'text',v:'$649'},{k:'n2',l:'Product 2 name',t:'text',v:'Dallas Reclining Sofa'},{k:'p2',l:'Product 2 price',t:'text',v:'$999'},{k:'n3',l:'Product 3 name',t:'text',v:'Brooklyn Sectional'},{k:'p3',l:'Product 3 price',t:'text',v:'$1,499'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Product 1'},{k:'b',l:'Product 2'},{k:'c',l:'Product 3'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W/2,H*.45,W*.1,W/2,H*.45,H*.8);g.addColorStop(0,shade(F.bg,.25));g.addColorStop(1,F.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
  pop(c,W/2,95,t,0,()=>logo(c,I,0,0,220,110),{from:.8,dur:.6});
  text(c,{s:F.head,x:W/2,y:200,size:72,wt:900,fill:'#111',maxW:W*.9,t,at:.2});
  const seg=D/3,i=Math.floor(t/seg)%3,u=(t%seg)/seg,keys=['a','b','c'],nm=[F.n1,F.n2,F.n3][i],pr=[F.p1,F.p2,F.p3][i];
  const inP=eOut(prog(u,0,.28)),outP=prog(u,.84,.16),x=(1-inP)*W*.9-outP*outP*W*.9;
  c.save();c.translate(W/2+x,H*.49+wave(t,D,3)*6);c.rotate((1-inP)*.08-outP*.08);
  drawImg(c,I[keys[i]],-W*.42,-H*.19,W*.84,H*.38,{label:'Product '+(i+1),shadow:36});c.restore();
  const tp=prog(u,.2,.2)*(1-outP);
  if(tp>0){c.save();c.translate(W/2,H*.8);c.globalAlpha=tp;c.scale(1,Math.max(.02,Math.cos((1-eOut(prog(u,.2,.2)))*Math.PI/2)));
    objDraw(c,'obj:Price card',-W*.4,-70,W*.8,140,()=>{
      rr(c,-W*.4,-70,W*.8,140,30);c.fillStyle='#000';c.fill();
      font(c,800,46,FM);c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(nm,-W*.4+40,0,W*.8-250);
      font(c,900,76,FN);c.fillStyle=F.bg;c.textAlign='right';c.fillText(pr,W*.4-40,0);
    });
    c.restore()}
  for(let k=0;k<3;k++){c.fillStyle=k===i?'#111':'rgba(0,0,0,.25)';c.beginPath();c.arc(W/2+(k-1)*44,H-70,k===i?12:9,0,7);c.fill()}
 }},

{id:'speech',name:'Mascot Speech Bubble',sub:'Character cutout with a typewriter speech bubble and sparkles',
 fields:[{k:'say',l:'Speech',t:'area',v:"Now THAT'S comfortable!"},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'hero',l:'Character cutout (transparent PNG)'}],
 draw(c,W,H,t,D,F,I){
  const g=c.createRadialGradient(W*.4,H*.5,W*.1,W*.4,H*.5,H*.85);g.addColorStop(0,shade(F.bg,.22));g.addColorStop(1,F.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
  fx(c,W,H,t,D,'sparkle');
  pop(c,W*.5,H*.07,t,0,()=>logo(c,I,0,0,230,115),{from:.8,dur:.6});
  const hp=prog(t,.2,1.0);
  if(hp>0){c.save();c.translate(W*.3,H*.98);const s=.6+.4*eBack(hp);c.scale(s,s);c.rotate(wave(t,D,1)*.012);c.globalAlpha=clamp(hp*2.5);
    drawImg(c,I.hero,-W*.3,-H*.74,W*.6,H*.74,{ay:1,label:'Character cutout'});c.restore()}
  const sz=60,bw=W*.56,bx=W*.38,by=H*.2;
  font(c,800,sz,FM);const lines=wrap(c,F.say,bw-90),bh=lines.length*sz*1.12+80;
  pop(c,bx+bw/2,by+bh/2,t,.9,()=>{
    const s=1+.02*wave(t,D,2);c.scale(s,s);
    objDraw(c,'obj:Speech bubble',-bw/2,-bh/2-10,bw,bh+140,()=>{
      c.shadowColor='rgba(0,0,0,.22)';c.shadowBlur=28;c.shadowOffsetY=10;
      rr(c,-bw/2,-bh/2,bw,bh,44);c.fillStyle='#fff';c.fill();
      c.beginPath();c.moveTo(-bw*.42,bh/2-6);c.lineTo(-bw*.62,bh/2+120);c.lineTo(-bw*.2,bh/2-6);c.closePath();c.fill();
      c.shadowColor='transparent';
      font(c,800,sz,FM);c.fillStyle='#111';c.textAlign='left';c.textBaseline='middle';
      let left=Math.floor(lines.join('').length*prog(t,1.4,1.6));
      lines.forEach((l,i)=>{const k=Math.min(l.length,Math.max(0,left));left-=l.length;if(k>0)c.fillText(l.slice(0,k),-bw/2+45,-bh/2+40+(i+.5)*sz*1.12)});
    });
  },{from:.3});
 }},

{id:'slider',name:'Reveal Slider',sub:'Before and after photos with a sweeping wipe handle',
 fields:[{k:'la',l:'Left label',t:'text',v:'BEFORE'},{k:'lb',l:'Right label',t:'text',v:'AFTER'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Left photo (before)'},{k:'b',l:'Right photo (after)'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const k=eOut(prog(t,0,.8)),pos=W*(.5-.4*Math.cos(TAU*t/D))*1;
  c.save();c.beginPath();c.rect(pos,0,W-pos,H);c.clip();drawImg(c,I.b,0,0,W,H,{fit:'cover',label:'Right photo'});c.restore();
  c.save();c.beginPath();c.rect(0,0,pos,H);c.clip();drawImg(c,I.a,0,0,W,H,{fit:'cover',label:'Left photo'});c.restore();
  c.save();c.globalAlpha=k;c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=20;c.fillStyle='#fff';c.fillRect(pos-3,0,6,H);
  c.beginPath();c.arc(pos,H/2,44,0,7);c.fill();c.shadowColor='transparent';c.fillStyle='#111';
  c.beginPath();c.moveTo(pos-12,H/2);c.lineTo(pos-4,H/2-12);c.lineTo(pos-4,H/2+12);c.fill();
  c.beginPath();c.moveTo(pos+12,H/2);c.lineTo(pos+4,H/2-12);c.lineTo(pos+4,H/2+12);c.fill();c.restore();
  pop(c,150,90,t,.4,()=>{
    c.globalAlpha*=clamp(pos/(W*.3));
    font(c,800,36,FM);const w=c.measureText(F.la).width+68,h=36*1.9;
    objDraw(c,'obj:Left label',-w/2,-h/2,w,h,()=>pill(c,0,0,F.la,36,'#111','#fff',34));
  },{from:.6});
  pop(c,W-150,90,t,.6,()=>{
    c.globalAlpha*=clamp((W-pos)/(W*.3));
    font(c,800,36,FM);const w=c.measureText(F.lb).width+68,h=36*1.9;
    objDraw(c,'obj:Right label',-w/2,-h/2,w,h,()=>pill(c,0,0,F.lb,36,'#111','#fff',34));
  },{from:.6});
  pop(c,W/2,H-100,t,.9,()=>logo(c,I,0,0,230,115),{from:.8,dur:.6});
 }}
];
