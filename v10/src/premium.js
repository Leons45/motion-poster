/* ---------- premium campaign templates ---------- */
function charRise(c,str,cx,y,size,wt,fam,fill,t,at,per,rise){
  font(c,wt,size,fam);const ch=[...String(str)],ws=ch.map(q=>c.measureText(q).width),tot=ws.reduce((a,b)=>a+b,0);
  let x=cx-tot/2;c.textAlign='left';c.textBaseline='middle';c.fillStyle=fill;
  ch.forEach((q,i)=>{const p=prog(t,at+i*per,.55);if(p>0){c.save();c.globalAlpha*=clamp(p*2);c.fillText(q,x,y+(1-eEnter(p))*rise);c.restore()}x+=ws[i]});
}
function arcText(c,str,cx,cy,r,rot,size,fill,wt){
  font(c,wt||900,size,FM);const ch=[...String(str)],ws=ch.map(q=>c.measureText(q).width),tot=ws.reduce((a,b)=>a+b,0);
  c.save();c.translate(cx,cy);c.rotate(rot);c.fillStyle=fill;c.textAlign='center';c.textBaseline='middle';
  let a=-tot/2/r;ch.forEach((q,i)=>{const m=a+ws[i]/2/r;c.save();c.rotate(m);c.fillText(q,0,-r);c.restore();a+=ws[i]/r});c.restore();
}
function shimmer(c,x,y,w,h,r,u,col){c.save();rr(c,x,y,w,h,r);c.clip();const sx=x-w*.4+(w*1.8)*u;c.fillStyle=col||'rgba(255,255,255,.45)';
  c.beginPath();c.moveTo(sx,y);c.lineTo(sx+w*.18,y);c.lineTo(sx+w*.18-h*.4,y+h);c.lineTo(sx-h*.4,y+h);c.closePath();c.fill();c.restore()}
function floorShadow(c,cx,cy,w,a){c.save();const g=c.createRadialGradient(cx,cy,2,cx,cy,w/2);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.translate(0,cy);c.scale(1,.16);c.translate(0,-cy);c.beginPath();c.arc(cx,cy,w/2,0,7);c.fill();c.restore()}

const T_PREM=[
{id:'reveal',name:'Product Reveal',sub:'Studio spotlight, tracked headline and a floating hero product',
 fields:[{k:'eye',l:'Eyebrow',t:'text',v:'NEW ARRIVAL'},{k:'head',l:'Headline',t:'text',v:'The Avery Sofa'},{k:'sub',l:'Sub line',t:'text',v:'Cloud-soft comfort, made to last.'},{k:'price',l:'Price pill',t:'text',v:'From $649'},{k:'bg',l:'Background',t:'color',v:'#0B0B0D'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const k=eOut(prog(t,0,1.3)),u=t/D;
  glow(c,W,H,W/2,H*.44,W*(.5+.4*k),'rgba(255,255,255,'+(.2*k)+')','rgba(255,255,255,0)');
  c.save();const g=c.createLinearGradient(0,0,0,H*.7);g.addColorStop(0,'rgba(255,255,255,'+(.16*k)+')');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(W*.44,0);c.lineTo(W*.56,0);c.lineTo(W*.92,H*.7);c.lineTo(W*.08,H*.7);c.closePath();c.fill();c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,90,t,.1,()=>logo(c,I,0,0,220,110),{from:.8,dur:.6});
  text(c,{s:F.eye,key:'eye',x:W/2,y:H*.17,size:30,wt:800,fill:F.acc,t,at:.4,maxW:W*.8});
  const py=H*.43+Math.sin(TAU*u)*16,ph=H*.36;
  floorShadow(c,W/2,H*.43+ph/2+30,620-Math.sin(TAU*u)*40,.55*k);
  pop(c,W/2,py,t,.5,()=>drawImg(c,I.p,-430,-ph/2,860,ph,{label:'Product photo',dark:true,shadow:50}),{from:.82,dur:1.0});
  const hs=Math.min(112,fitSize(c,F.head,900,FM,W*.88,112));
  charRise(c,F.head,W/2,H*.72,hs,900,FM,'#fff',t,1.1,.03,40);
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.785,size:38,wt:600,fill:'rgba(255,255,255,.75)',t,at:1.8,maxW:W*.8});
  pop(c,W/2,H*.87,t,2.1,()=>{
    font(c,800,44,FM);const pw=c.measureText(F.price).width+100,ph=44*1.9;
    objDraw(c,'obj:Price pill',-pw/2,-ph/2,pw,ph,()=>{pill(c,0,0,F.price,44,F.acc,'#111',50);shimmer(c,-210,-42,420,84,42,((u*2)%1))});
  },{from:.7});
 }},
{id:'giant',name:'Giant Type Parallax',sub:'Oversized scrolling type behind a floating hero product',
 fields:[{k:'word',l:'Giant word',t:'text',v:'COMFORT'},{k:'head',l:'Headline',t:'text',v:'Sit back. Stay awhile.'},{k:'price',l:'Price badge',t:'text',v:'$499'},{k:'bg',l:'Background',t:'color',v:'#111111'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,k=eOut(prog(t,0,.8));
  c.save();c.globalAlpha=k;marquee(c,W,H*.25,H*.2,F.word,t,D,1,1,'stroke',F.acc,5);marquee(c,W,H*.5,H*.26,F.word,t,D,1,-1,'fill',F.acc);marquee(c,W,H*.75,H*.2,F.word,t,D,1,1,'stroke','#ffffff',4);c.restore();
  const ph=H*.42;floorShadow(c,W/2,H*.5+ph/2+20,640,.5);
  pop(c,W/2,H*.5+Math.sin(TAU*u)*14,t,.4,()=>{c.rotate(Math.sin(TAU*u)*.03);drawImg(c,I.p,-440,-ph/2,880,ph,{label:'Product photo',dark:true,shadow:60})},{from:.7,dur:.9,rot:.2});
  pop(c,W*.82,H*.2,t,1.0,()=>{c.rotate(.2*Math.sin(TAU*u*2)*.3);objDraw(c,'obj:Price badge',-150,-150,300,300,()=>{burstPath(c,0,0,150,150,14,.86,0);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';font(c,900,70,FN);c.fillText(F.price,0,4)})},{from:.3,dur:.8,rot:.5});
  const hs=Math.min(90,fitSize(c,F.head,900,FM,W*.86,90));charRise(c,F.head,W/2,H*.9,hs,900,FM,'#fff',t,1.2,.03,30);
  pop(c,logoAnchorX(45,105,210,I,1.6),90,t,.2,()=>logo(c,I,0,0,210,105),{from:.8,dur:.6});
 }},
{id:'stats',name:'Big Numbers',sub:'Three animated stat cards with counting numbers and progress rings',
 fields:[{k:'title',l:'Title',t:'text',v:'LEON\'S BY THE NUMBERS'},{k:'n1',l:'Number 1',t:'text',v:'90+'},{k:'l1',l:'Label 1',t:'text',v:'Years serving Canadians'},{k:'n2',l:'Number 2',t:'text',v:'300,000'},{k:'l2',l:'Label 2',t:'text',v:'Products in stock'},{k:'n3',l:'Number 3',t:'text',v:'100%'},{k:'l3',l:'Label 3',t:'text',v:'Canadian owned'},{k:'bg',l:'Background',t:'color',v:'#0C0C0C'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  c.save();c.globalAlpha=.06;c.fillStyle=F.acc;burstPath(c,W*.9,H*.1,420,420,16,.9,TAU*u/16);c.fill();c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,100,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  text(c,{s:F.title,key:'title',x:W/2,y:H*.2,size:44,wt:900,fill:'#fff',t,at:.4,maxW:W*.86});
  const top=H*.27,ch=(H*.66)/3-24;
  [[F.n1,F.l1],[F.n2,F.l2],[F.n3,F.l3]].forEach((q,i)=>{
    const at=.6+i*.32,p=prog(t,at,.7);if(p<=0)return;const e=eBack(p),y=top+i*(ch+24);
    c.save();c.translate((1-eOut(p))*-W*.5,0);c.globalAlpha=clamp(p*3);
    objDraw(c,'obj:Stat card '+(i+1),60,y,W-120,ch,()=>{
      rr(c,60,y,W-120,ch,36);c.fillStyle='rgba(255,255,255,.07)';c.fill();c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=2;c.stroke();
      const rc=60+ch*.5+20,ry=y+ch/2,R=ch*.3;
      c.lineWidth=14;c.strokeStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(rc,ry,R,0,7);c.stroke();
      c.strokeStyle=F.acc;c.lineCap='round';c.beginPath();c.arc(rc,ry,R,-Math.PI/2,-Math.PI/2+TAU*(.55+.2*i)*eOut(prog(t,at+.2,1.1)));c.stroke();
      const tx=rc+R+50;c.textAlign='left';c.textBaseline='middle';
      const ns=countText(q[0],prog(t,at+.2,1.2)),sz=Math.min(ch*.46,fitSize(c,q[0],900,FN,W-tx-90,ch*.46));
      font(c,900,sz,FN);c.fillStyle=F.acc;c.fillText(ns,tx,ry-ch*.12);
      font(c,700,Math.min(34,ch*.18),FM);c.fillStyle='rgba(255,255,255,.8)';c.fillText(q[1],tx,ry+ch*.28);
    });
    c.restore();
  });
 }},
{id:'aurora',name:'Aurora Gradient',sub:'Flowing mesh-gradient blobs with a bold centred message',
 fields:[{k:'head',l:'Headline',t:'area',v:'Home,\nreimagined.'},{k:'sub',l:'Sub line',t:'text',v:'Designed for the way Canada lives.'},{k:'cta',l:'Button',t:'text',v:'Discover more'},{k:'bg',l:'Background',t:'color',v:'#0A0A14'},{k:'c1',l:'Blob 1',t:'color',v:'#FFE81A'},{k:'c2',l:'Blob 2',t:'color',v:'#FF5A36'},{k:'c3',l:'Blob 3',t:'color',v:'#7B5CFF'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,k=eOut(prog(t,0,1.2));
  c.save();c.globalCompositeOperation='lighter';
  [[F.c1,1,.3,.28,.9],[F.c2,2,.7,.45,1],[F.c3,1,.45,.72,1.1],[F.c1,2,.8,.8,.7]].forEach((b,i)=>{
    const ph=i*1.7,x=W*(b[2]+.18*Math.cos(TAU*(u*b[1])+ph)),y=H*(b[3]+.14*Math.sin(TAU*(u*b[1])+ph*1.3)),r=W*b[4]*.62*(.6+.4*k);
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,b[0]+'DD');g.addColorStop(1,b[0]+'00');c.fillStyle=g;c.fillRect(0,0,W,H)});
  c.restore();c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,0,W,H);
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,100,t,.2,()=>logo(c,I,0,0,220,110),{from:.8});
  const ls=F.head.split('\n'),sz=Math.min(210,H*.17),cy=H*.45;
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FM,W*.88,sz));charRise(c,l,W/2,cy+(i-(ls.length-1)/2)*sz*1.02,s,900,FM,'#fff',t,.5+i*.28,.03,60)});
  text(c,{s:F.sub,key:'sub',x:W/2,y:cy+ls.length*sz*.55+40,size:40,wt:600,fill:'rgba(255,255,255,.9)',t,at:1.6,maxW:W*.8});
  pop(c,W/2,H*.82,t,2.0,()=>{
    font(c,800,40,FM);const w=c.measureText(F.cta).width+110;
    objDraw(c,'obj:Button',-w/2,-48,w,96,()=>{rr(c,-w/2,-48,w,96,48);c.fillStyle='#fff';c.fill();c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,3);shimmer(c,-w/2,-48,w,96,48,(u*2)%1,'rgba(255,232,26,.55)')});
  },{from:.7});
 }},
{id:'lookbook',name:'Lookbook Triptych',sub:'Three editorial panels that wipe in with captions and prices',
 fields:[{k:'title',l:'Title',t:'text',v:'THE NEW ARRIVALS'},{k:'c1',l:'Caption 1',t:'text',v:'Lounge'},{k:'p1',l:'Price 1',t:'text',v:'$899'},{k:'c2',l:'Caption 2',t:'text',v:'Dine'},{k:'p2',l:'Price 2',t:'text',v:'$649'},{k:'c3',l:'Caption 3',t:'text',v:'Rest'},{k:'p3',l:'Price 3',t:'text',v:'$1,199'},{k:'bg',l:'Background',t:'color',v:'#F4F0E8'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Panel 1'},{k:'b',l:'Panel 2'},{k:'c',l:'Panel 3'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,g=24,pw=(W-g*4)/3,py=H*.2,ph=H*.62;
  const bar=eOut(prog(t,0,.8));c.fillStyle='#111';c.fillRect(0,0,W*bar,16);
  text(c,{s:F.title,key:'title',x:W/2,y:H*.1,size:60,wt:900,fill:'#111',t,at:.2,maxW:W*.9});
  [[I.a,F.c1,F.p1,'Panel 1'],[I.b,F.c2,F.p2,'Panel 2'],[I.c,F.c3,F.p3,'Panel 3']].forEach((q,i)=>{
    const x=g+i*(pw+g),p=eOut(prog(t,.5+i*.25,.9));if(p<=0)return;
    c.save();c.beginPath();c.rect(x,py+ph*(1-p),pw,ph*p);c.clip();
    const z=1.06+.03*Math.sin(TAU*(u+i/3));c.translate(x+pw/2,py+ph/2);c.scale(z,z);c.translate(-pw/2,-ph/2);
    drawImg(c,q[0],0,0,pw,ph,{fit:'cover-safe',label:q[3]});c.restore();
    c.save();c.beginPath();c.rect(x,py,pw,ph);c.clip();
    const cp=eOut(prog(t,1.2+i*.25,.6));c.globalAlpha=cp;c.translate(0,(1-cp)*30);
    font(c,800,34,FM);const pw2=c.measureText(q[2]).width+52,ph2=34*1.9;
    objDraw(c,'obj:Price '+(i+1),x+pw/2-pw2/2,py+ph-70-ph2/2,pw2,ph2,()=>{pill(c,x+pw/2,py+ph-70,q[2],34,F.acc,'#111',26)});
    c.restore();
    text(c,{s:q[1].toUpperCase(),x:x+pw/2,y:py+ph+50,size:38,wt:800,fill:'#111',t,at:1.1+i*.25,maxW:pw});
  });
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H-80,t,1.9,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'glass',name:'Glass Countdown',sub:'Slow-zoom photo with a frosted card and a live ticking timer',
 fields:[{k:'head',l:'Headline',t:'text',v:'Black Friday starts in'},{k:'sub',l:'Sub line',t:'text',v:'Early access for members'},{k:'cta',l:'Button',t:'text',v:'Set a reminder'},{k:'d',l:'Days',t:'text',v:'02'},{k:'h',l:'Hours',t:'text',v:'14'},{k:'m',l:'Minutes',t:'text',v:'37'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[{k:'bg',l:'Background photo'}],
 draw(c,W,H,t,D,F,I){
  const u=t/D,z=1.06+.04*(.5-.5*Math.cos(TAU*u));
  if(I.bg){c.save();c.translate(W/2,H/2);c.scale(z,z);c.translate(-W/2,-H/2);drawImg(c,I.bg,0,0,W,H,{fit:'cover',label:'Background photo'});c.restore()}
  else{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#2B2B35');g.addColorStop(1,'#0B0B10');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(255,255,255,.4)';c.textAlign='center';font(c,700,34,FM);c.fillText('+ Add a background photo',W/2,H*.3)}
  const sh=c.createLinearGradient(0,H*.3,0,H);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.65)');c.fillStyle=sh;c.fillRect(0,0,W,H);
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,100,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const cw=W-120,chh=H*.46,cy=H-chh-70,p=eOut(prog(t,.5,.9));
  c.save();c.translate(0,(1-p)*200);c.globalAlpha=p;
  objDraw(c,'obj:Card',60,cy,cw,chh,()=>{
    rr(c,60,cy,cw,chh,56);c.fillStyle='rgba(255,255,255,.16)';c.fill();c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.stroke();
    const hl=c.createLinearGradient(0,cy,0,cy+chh);hl.addColorStop(0,'rgba(255,255,255,.18)');hl.addColorStop(.4,'rgba(255,255,255,0)');rr(c,60,cy,cw,chh,56);c.fillStyle=hl;c.fill();
  });
  c.restore();
  text(c,{s:F.head,key:'head',x:W/2,y:cy+60,size:54,wt:900,fill:'#fff',t,at:.9,maxW:cw-80});
  const sec=String(59-Math.floor((u*60)%60)).padStart(2,'0'),vals=[[F.d,'DAYS'],[F.h,'HOURS'],[F.m,'MINS'],[sec,'SECS']],bw=(cw-80-3*18)/4,bh=chh*.34,by=cy+chh*.34;
  vals.forEach((q,i)=>{const pp=eBack(prog(t,1.1+i*.15,.6));if(pp<=0)return;const x=100+i*(bw+18);
    c.save();c.translate(x+bw/2,by+bh/2);c.scale(pp,pp);
    objDraw(c,'obj:'+q[1]+' box',-bw/2,-bh/2,bw,bh,()=>{
      rr(c,-bw/2,-bh/2,bw,bh,28);c.fillStyle=i===3?F.acc:'rgba(0,0,0,.45)';c.fill();
      c.fillStyle=i===3?'#111':'#fff';c.textAlign='center';c.textBaseline='middle';font(c,900,bh*.5,FN);c.fillText(q[0],0,-8);font(c,800,24,FM);c.globalAlpha=.75;c.fillText(q[1],0,bh*.34);
    });
    c.restore()});
  pop(c,W/2,cy+chh-70,t,1.9,()=>{
    font(c,800,36,FM);const w=c.measureText(F.cta).width+90;
    objDraw(c,'obj:Button',-w/2,-42,w,84,()=>{rr(c,-w/2,-42,w,84,42);c.fillStyle='#fff';c.fill();c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,3)});
  },{from:.7});
 }},
{id:'swiss',name:'Swiss Poster',sub:'Bold grid typography with a rotating circular badge',
 fields:[{k:'num',l:'Big number',t:'text',v:'50'},{k:'unit',l:'Unit',t:'text',v:'% OFF'},{k:'title',l:'Title',t:'text',v:'Sofas, sectionals & more'},{k:'ring',l:'Badge text',t:'text',v:'LEON\'S • THE BIG SALE • '},{k:'bg',l:'Background',t:'color',v:'#F2EFE9'},{k:'ink',l:'Ink',t:'color',v:'#111111'},{k:'acc',l:'Accent',t:'color',v:'#E4262C'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  c.strokeStyle=F.ink;c.globalAlpha=.14;c.lineWidth=2;for(let i=1;i<6;i++){c.beginPath();c.moveTo(i*W/6,0);c.lineTo(i*W/6,H);c.stroke()}c.globalAlpha=1;
  const bar=eOut(prog(t,0,.8));c.fillStyle=F.ink;c.fillRect(60,70,(W-120)*bar,12);
  const ns=Math.min(H*.46,fitSize(c,F.num,900,FN,W-110,H*.46));font(c,900,ns,FN);
  c.save();c.beginPath();c.rect(0,H*.14,W,ns*1.05);c.clip();const np=eOut(prog(t,.3,.9));
  c.fillStyle=F.ink;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(F.num,48,H*.14+ns*.88+(1-np)*ns);c.restore();
  const us=Math.min(170,fitSize(c,F.unit,900,FN,W*.55,170)),up=eBack(prog(t,.9,.6)),uy=H*.14+ns*.88+us*.95;
  if(up>0){c.save();c.translate(60,uy);c.scale(up,up);font(c,900,us,FN);c.fillStyle=F.acc;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(F.unit,0,0);c.restore()}
  pop(c,W-220,uy-40,t,1.0,()=>{objDraw(c,'obj:Badge',-160,-160,320,320,()=>{c.beginPath();c.arc(0,0,160,0,7);c.fillStyle=F.acc;c.fill();arcText(c,F.ring,0,0,118,TAU*u,34,'#fff');c.fillStyle='#fff';burstPath(c,0,0,46,46,8,.55,TAU*u*-1);c.fill()})},{from:.2,dur:.9,rot:1.5});
  const ty=H*.86;c.fillStyle=F.ink;c.fillRect(60,ty-60,(W-120)*eOut(prog(t,1.3,.8)),6);
  text(c,{s:F.title,key:'title',x:W/2,y:ty,size:56,wt:800,fill:F.ink,t,at:1.5,maxW:W*.8});
  pop(c,logoAnchorX(45,100,200,I,1.6),H-70,t,1.8,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'festive',name:'Festive Greeting',sub:'String lights, rolling waves and falling snow for holiday posts',
 fields:[{k:'head',l:'Greeting',t:'area',v:'Happy\nHolidays'},{k:'sub',l:'Sub line',t:'text',v:'From all of us at Leon\'s'},{k:'cta',l:'Button',t:'text',v:'Shop holiday deals'},{k:'bg1',l:'Sky top',t:'color',v:'#B3122A'},{k:'bg2',l:'Sky bottom',t:'color',v:'#5A0A18'},{k:'wave',l:'Wave colour',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  const u=t/D,g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,F.bg1);g.addColorStop(1,F.bg2);c.fillStyle=g;c.fillRect(0,0,W,H);
  fx(c,W,H,t,D,'snow',0);
  const cols=['#FFE81A','#FF4D4D','#5CE08A','#4DB8FF','#fff'];c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=4;c.beginPath();
  for(let x=0;x<=W;x+=20){const y=60+Math.sin(x/W*Math.PI*4)*26+x*.0;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
  for(let i=0;i<15;i++){const x=i*(W/14),y=60+Math.sin(x/W*Math.PI*4)*26,tw=.55+.45*Math.sin(TAU*(u*2+i*.13)),dp=eOut(prog(t,.1+i*.05,.5));
    c.save();c.globalAlpha=dp;c.shadowColor=cols[i%5];c.shadowBlur=30*tw;c.fillStyle=cols[i%5];c.beginPath();c.ellipse(x,y+18,11,17,0,0,7);c.fill();c.restore()}
  const ls=F.head.split('\n'),sz=Math.min(230,H*.15);
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FN,W*.9,sz));pop(c,W/2,H*.3+i*sz*.95,t,.5+i*.25,()=>{font(c,900,s,FN);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=24;c.shadowOffsetY=10;c.fillText(l,0,0);c.restore()},{from:.3,dur:.8,rot:(i?.1:-.1)})});
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.3+ls.length*sz*.95+20,size:42,wt:700,fill:'#fff',t,at:1.5,maxW:W*.8});
  [[.62,.9,1,F.wave,.35],[.7,1.1,2,F.wave,.6],[.78,1.3,3,'#fff',1]].forEach((w,i)=>{c.save();c.globalAlpha=w[4]<1?1:1;c.fillStyle=i===2?'#FFFFFF':w[3];c.globalAlpha=i===0?.4:i===1?.85:1;
    c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=12){const y=H*(1-(1-w[0])*.55)+Math.sin(x/W*TAU*w[2]+TAU*u*(i+1)*(i%2?-1:1))*28;c.lineTo(x,y)}c.lineTo(W,H);c.closePath();c.fill();c.restore()});
  fx(c,W,H,t,D,'snow',1);
  pop(c,W/2,H*.9,t,1.9,()=>{
    font(c,800,40,FM);const w=c.measureText(F.cta).width+100;
    objDraw(c,'obj:Button',-w/2,-46,w,92,()=>{rr(c,-w/2,-46,w,92,46);c.fillStyle=F.bg1;c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,3)});
  },{from:.7});
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H*.8,t,1.6,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'neon',name:'Neon Night',sub:'Glowing neon sign with a realistic flicker and pulsing frame',
 fields:[{k:'l1',l:'Neon line 1',t:'text',v:'OPEN'},{k:'l2',l:'Neon line 2',t:'text',v:'LATE NIGHT SALE'},{k:'sub',l:'Sub line',t:'text',v:'Fri to Sun • Up to 50% off'},{k:'g1',l:'Glow 1',t:'color',v:'#FF2E9A'},{k:'g2',l:'Glow 2',t:'color',v:'#27E1FF'},{k:'bg',l:'Background',t:'color',v:'#09090F'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  c.fillStyle='rgba(255,255,255,.035)';for(let y=0,r=0;y<H;y+=64,r++)for(let x=-((r%2)*70);x<W;x+=140)c.fillRect(x+4,y+4,132,56);
  glow(c,W,H,W/2,H*.45,W*.9,F.g1+'33','#00000000');
  const on=eOut(prog(t,.3,.5)),fl=(Math.sin(TAU*u*37)*Math.sin(TAU*u*11)>.93)?.35:1,pulse=.85+.15*Math.sin(TAU*u*2),a=on*fl;
  function neon(str,y,size,col){font(c,900,size,FM);c.textAlign='center';c.textBaseline='middle';c.save();c.globalAlpha=a;c.lineJoin='round';
    c.shadowColor=col;c.shadowBlur=60*pulse;c.strokeStyle=col;c.lineWidth=10;c.strokeText(str,W/2,y);c.shadowBlur=24;c.lineWidth=5;c.strokeText(str,W/2,y);c.shadowBlur=8;c.fillStyle='#fff';c.fillText(str,W/2,y);c.restore()}
  c.save();c.globalAlpha=a;
  objDraw(c,'obj:Frame',70,H*.14,W-140,H*.62,()=>{
    c.shadowColor=F.g2;c.shadowBlur=40*pulse;c.strokeStyle=F.g2;c.lineWidth=8;rr(c,70,H*.14,W-140,H*.62,60);c.stroke();c.shadowBlur=0;c.strokeStyle='#fff';c.lineWidth=2.5;rr(c,70,H*.14,W-140,H*.62,60);c.stroke();
  });
  c.restore();
  const s1=Math.min(300,fitSize(c,F.l1,900,FM,W*.7,300));neon(F.l1,H*.34,s1,F.g1);
  const s2=Math.min(104,fitSize(c,F.l2,900,FM,W*.76,104));neon(F.l2,H*.34+s1*.8,s2,F.g2);
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.84,size:42,wt:700,fill:'#fff',t,at:1.2,maxW:W*.82});
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H*.93,t,1.5,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'doorbuster',name:'Doorbuster Alert',sub:'Hazard-tape banners, slam price and a draining countdown bar',
 fields:[{k:'tag',l:'Tag',t:'text',v:'TODAY ONLY'},{k:'item',l:'Item',t:'text',v:'3-PIECE SECTIONAL'},{k:'price',l:'Price',t:'text',v:'$899'},{k:'was',l:'Was price',t:'text',v:'Was $1,799'},{k:'tape',l:'Tape text',t:'text',v:'DOORBUSTER'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  rays(c,W/2,H*.5,t,D,24,'#000',.06,W*1.2);
  function tape(y,dir,rot){c.save();c.translate(W/2,y);c.rotate(rot);c.fillStyle='#000';c.fillRect(-W,-52,W*2,104);c.beginPath();c.rect(-W,-52,W*2,104);c.clip();c.translate(-W,0);marquee(c,W*2,0,56,F.tape,t,D,2,dir,'fill',F.bg);c.restore()}
  const tp=eOut(prog(t,0,.6));tape(H*.07-(1-tp)*200,1,-.05);tape(H*.93+(1-tp)*200,-1,-.05);
  pop(c,W/2,H*.17,t,.4,()=>{
    font(c,900,44,FM);const w=c.measureText(F.tag).width+90;
    objDraw(c,'obj:Tag',-w/2,-40,w,80,()=>{rr(c,-w/2,-40,w,80,14);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.tag,0,3)});
  },{from:.4,dur:.6,rot:.1});
  const is=Math.min(100,fitSize(c,F.item,900,FM,W*.9,100));
  pop(c,W/2,H*.26,t,.6,()=>{font(c,900,is,FM);c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(F.item,0,0)},{from:2,dur:.5,ease:eOut});
  const ph=H*.3;floorShadow(c,W/2,H*.5+ph/2+10,600,.4);
  pop(c,W/2,H*.5+Math.sin(TAU*u)*10,t,.9,()=>drawImg(c,I.p,-420,-ph/2,840,ph,{label:'Product photo',shadow:40}),{from:.6,dur:.8});
  pop(c,W/2,H*.71,t,1.3,()=>{c.rotate(-.03);const sp=countText(F.price,prog(t,1.4,.9)),ss=Math.min(300,fitSize(c,F.price,900,FN,W*.8,300));
    font(c,900,ss,FN);c.fillStyle='#E4262C';c.textAlign='center';c.textBaseline='middle';c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=0;c.shadowOffsetX=8;c.shadowOffsetY=8;c.fillText(sp,0,0);c.restore()},{from:2.2,dur:.5,ease:eOut});
  const wp=prog(t,1.9,.5);if(wp>0){font(c,800,44,FM);c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(F.was,W/2,H*.81);const w=c.measureText(F.was).width;c.fillStyle='#E4262C';c.fillRect(W/2-w/2,H*.81,w*wp,5)}
  objDraw(c,'obj:Progress bar',120,H*.87,W-240,22,()=>{
    c.fillStyle='rgba(0,0,0,.2)';rr(c,120,H*.87,W-240,22,11);c.fill();c.fillStyle='#000';rr(c,120,H*.87,(W-240)*(1-((u*2)%1)),22,11);c.fill();
  });
 }},
{id:'lyrics',name:'Statement Scroll',sub:'Brand statement where each line lights up in turn, music-app style',
 fields:[{k:'lines',l:'Lines (one per line)',t:'area',v:'Built for family dinners\nLate-night movie marathons\nLazy Sunday mornings\nEvery moment at home'},{k:'sig',l:'Signature',t:'text',v:'Leon\'s. Home is here.'},{k:'bg',l:'Background',t:'color',v:'#0E0E10'},{k:'acc',l:'Highlight',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,ls=F.lines.split('\n').filter(Boolean),n=Math.max(1,ls.length);
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,100,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const pos=u*n,sz=Math.min(104,H*.075),gap=sz*1.75,cy=H*.46;
  ls.forEach((l,i)=>{let d=Math.abs(pos-(i+.5));d=Math.min(d,n-d);const w=clamp(1-d/1.1),e=eInOut?eInOut(w):w,p=prog(t,.3+i*.2,.6);
    if(p<=0)return;const s=Math.min(sz*(1+.08*e),fitSize(c,l,900,FM,W*.86,sz*1.1));
    c.save();c.globalAlpha=clamp(p*2)*(.22+.78*e);c.translate(0,(1-eOut(p))*50);
    font(c,900,s,FM);c.textAlign='center';c.textBaseline='middle';c.fillStyle=w>.5?F.acc:'#fff';
    c.fillText(l,W/2,cy+(i-(n-1)/2)*gap);c.restore()});
  text(c,{s:F.sig,key:'sig',x:W/2,y:H*.88,size:44,wt:800,fill:'#fff',t,at:1.5,maxW:W*.8});
 }}
];
