/* ---------- premium campaign templates ---------- */
function charRise(c,str,cx,y,size,wt,fam,fill,t,at,per,rise,key,maxW){
  font(c,wt,size,fam);const ch=[...String(str)],ws=ch.map(q=>c.measureText(q).width),tot=ws.reduce((a,b)=>a+b,0);
  /* this draws the whole string one character at a time (each with its own stagger/rise), so
     unlike text() it can't just hand off to fillText's own textAlign - the per-character walk
     has to START somewhere. Reuse alignFor's answer for where that anchor point is: for centre
     that's the same cx-tot/2 this always used; for left/right it's the alignment column's edge. */
  const A=key?alignFor(key,cx,maxW||tot):{align:'center',x:cx};
  let x=A.align==='left'?A.x:A.align==='right'?A.x-tot:A.x-tot/2;
  c.textAlign='left';c.textBaseline='middle';c.fillStyle=fill;
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
  charRise(c,F.head,W/2,H*.72,hs,900,FM,'#fff',t,1.1,.03,40,'head',W*.88);
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.785,size:38,wt:600,fill:'rgba(255,255,255,.75)',t,at:1.8,maxW:W*.8});
  font(c,800,44,FM);const priceW0=c.measureText(F.price).width+100;
  pop(c,anchorX('price',W/2,90+priceW0/2,W-90-priceW0/2),H*.87,t,2.1,()=>{
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
  pop(c,W*.82,H*.2,t,1.0,()=>{c.rotate(.2*Math.sin(TAU*u*2)*.3);objDraw(c,'obj:Price badge',-150,-150,300,300,()=>{burstPath(c,0,0,150,150,14,.86,0);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';const A=alignFor('price',0,220);c.textAlign=A.align;c.textBaseline='middle';font(c,900,70,FN);c.fillText(F.price,A.x,4)})},{from:.3,dur:.8,rot:.5});
  const hs=Math.min(90,fitSize(c,F.head,900,FM,W*.86,90));charRise(c,F.head,W/2,H*.9,hs,900,FM,'#fff',t,1.2,.03,30,'head',W*.86);
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
  [[F.n1,F.l1,'n1','l1'],[F.n2,F.l2,'n2','l2'],[F.n3,F.l3,'n3','l3']].forEach((q,i)=>{
    const at=.6+i*.32,p=prog(t,at,.7);if(p<=0)return;const e=eBack(p),y=top+i*(ch+24);
    c.save();c.translate((1-eOut(p))*-W*.5,0);c.globalAlpha=clamp(p*3);
    objDraw(c,'obj:Stat card '+(i+1),60,y,W-120,ch,()=>{
      rr(c,60,y,W-120,ch,36);c.fillStyle='rgba(255,255,255,.07)';c.fill();c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=2;c.stroke();
      const rc=60+ch*.5+20,ry=y+ch/2,R=ch*.3;
      c.lineWidth=14;c.strokeStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(rc,ry,R,0,7);c.stroke();
      c.strokeStyle=F.acc;c.lineCap='round';c.beginPath();c.arc(rc,ry,R,-Math.PI/2,-Math.PI/2+TAU*(.55+.2*i)*eOut(prog(t,at+.2,1.1)));c.stroke();
      const tx=rc+R+50,mw=W-tx-90,cx=tx+mw/2;c.textBaseline='middle';
      const ns=countText(q[0],prog(t,at+.2,1.2)),sz=Math.min(ch*.46,fitSize(c,q[0],900,FN,mw,ch*.46));
      font(c,900,sz,FN);c.fillStyle=F.acc;{const A=alignFor(q[2],cx,mw);c.textAlign=A.align;c.fillText(ns,A.x,ry-ch*.12)}
      font(c,700,Math.min(34,ch*.18),FM);c.fillStyle='rgba(255,255,255,.8)';{const A=alignFor(q[3],cx,mw);c.textAlign=A.align;c.fillText(q[1],A.x,ry+ch*.28)}
    });
    c.restore();
  });
 }},
{id:'doorbuster',name:'Doorbuster Alert',sub:'Hazard-tape banners, slam price and a draining countdown bar',
 fields:[{k:'tag',l:'Tag',t:'text',v:'TODAY ONLY'},{k:'item',l:'Item',t:'text',v:'3-PIECE SECTIONAL'},{k:'price',l:'Price',t:'text',v:'$899'},{k:'was',l:'Was price',t:'text',v:'Was $1,799'},{k:'tape',l:'Tape text',t:'text',v:'DOORBUSTER'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  rays(c,W/2,H*.5,t,D,24,'#000',.06,W*1.2);
  function tape(y,dir,rot){c.save();c.translate(W/2,y);c.rotate(rot);c.fillStyle='#000';c.fillRect(-W,-52,W*2,104);c.beginPath();c.rect(-W,-52,W*2,104);c.clip();c.translate(-W,0);marquee(c,W*2,0,56,F.tape,t,D,2,dir,'fill',F.bg);c.restore()}
  const tp=eOut(prog(t,0,.6));tape(H*.07-(1-tp)*200,1,-.05);tape(H*.93+(1-tp)*200,-1,-.05);
  font(c,900,44,FM);const tagW0=c.measureText(F.tag).width+90;
  pop(c,anchorX('tag',W/2,90+tagW0/2,W-90-tagW0/2),H*.17,t,.4,()=>{
    font(c,900,44,FM);const w=c.measureText(F.tag).width+90;
    objDraw(c,'obj:Tag',-w/2,-40,w,80,()=>{rr(c,-w/2,-40,w,80,14);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(F.tag,0,3)});
  },{from:.4,dur:.6,rot:.1});
  const is=Math.min(100,fitSize(c,F.item,900,FM,W*.9,100));
  pop(c,W/2,H*.26,t,.6,()=>{font(c,900,is,FM);c.fillStyle='#000';const A=alignFor('item',0,W*.9);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.item,A.x,0)},{from:2,dur:.5,ease:eOut});
  const ph=H*.3;floorShadow(c,W/2,H*.5+ph/2+10,600,.4);
  pop(c,W/2,H*.5+Math.sin(TAU*u)*10,t,.9,()=>drawImg(c,I.p,-420,-ph/2,840,ph,{label:'Product photo',shadow:40}),{from:.6,dur:.8});
  pop(c,W/2,H*.71,t,1.3,()=>{c.rotate(-.03);const sp=countText(F.price,prog(t,1.4,.9)),ss=Math.min(300,fitSize(c,F.price,900,FN,W*.8,300));
    font(c,900,ss,FN);c.fillStyle='#E4262C';const A=alignFor('price',0,W*.8);c.textAlign=A.align;c.textBaseline='middle';c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=0;c.shadowOffsetX=8;c.shadowOffsetY=8;c.fillText(sp,A.x,0);c.restore()},{from:2.2,dur:.5,ease:eOut});
  const wp=prog(t,1.9,.5);if(wp>0){font(c,800,44,FM);c.fillStyle='#000';const A=alignFor('was',W/2,W*.9);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.was,A.x,H*.81);const w=c.measureText(F.was).width,lx=A.align==='left'?A.x:A.align==='right'?A.x-w:A.x-w/2;c.fillStyle='#E4262C';c.fillRect(lx,H*.81,w*wp,5)}
  objDraw(c,'obj:Progress bar',120,H*.87,W-240,22,()=>{
    c.fillStyle='rgba(0,0,0,.2)';rr(c,120,H*.87,W-240,22,11);c.fill();c.fillStyle='#000';rr(c,120,H*.87,(W-240)*(1-((u*2)%1)),22,11);c.fill();
  });
 }},
];
