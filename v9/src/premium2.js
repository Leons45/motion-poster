/* ---------- premium batch 2 ---------- */
function notchTicket(c,x,y,w,h,r,ny,nr){c.beginPath();c.roundRect(x,y,w,h,r);c.moveTo(x+nr,ny);c.arc(x,ny,nr,0,TAU,true);c.moveTo(x+w+nr,ny);c.arc(x+w,ny,nr,0,TAU,true)}
function star5(c,cx,cy,R,fill){c.save();c.translate(cx,cy);c.fillStyle=fill;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.42:R;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();c.restore()}
const T_PREM2=[
{id:'flyer',name:'Flyer Flip',sub:'Four products flip in with price tags, perfect for weekly flyers',
 fields:[{k:'title',l:'Title',t:'text',v:'THIS WEEK\'S FLYER'},{k:'dates',l:'Dates',t:'text',v:'OCT 20 – 26'},{k:'n1',l:'Name 1',t:'text',v:'Sectional'},{k:'p1',l:'Price 1',t:'text',v:'$899'},{k:'n2',l:'Name 2',t:'text',v:'Recliner'},{k:'p2',l:'Price 2',t:'text',v:'$499'},{k:'n3',l:'Name 3',t:'text',v:'Dining set'},{k:'p3',l:'Price 3',t:'text',v:'$699'},{k:'n4',l:'Name 4',t:'text',v:'Mattress'},{k:'p4',l:'Price 4',t:'text',v:'$349'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Product 1'},{k:'b',l:'Product 2'},{k:'c',l:'Product 3'},{k:'d',l:'Product 4'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,hh=H*.13;
  c.fillStyle='#000';c.fillRect(0,0,W,hh*eOut(prog(t,0,.5)));
  text(c,{s:F.title,x:W/2,y:hh*.38,size:56,wt:900,fill:'#fff',t,at:.2,maxW:W*.8});text(c,{s:F.dates,x:W/2,y:hh*.78,size:34,wt:800,fill:'#FFE81A',t,at:.35,maxW:W*.8});
  const g=28,tw=(W-g*3)/2,top=hh+g,th=(H-top-g*2-100)/2;
  [[I.a,F.n1,F.p1,'Product 1'],[I.b,F.n2,F.p2,'Product 2'],[I.c,F.n3,F.p3,'Product 3'],[I.d,F.n4,F.p4,'Product 4']].forEach((q,i)=>{
    const x=g+(i%2)*(tw+g),y=top+Math.floor(i/2)*(th+g),p=prog(t,.5+i*.22,.75);if(p<=0)return;
    const sx=Math.max(.001,Math.abs(Math.cos((1-eOut(p))*Math.PI/2))),bob=Math.sin(TAU*(u+i/4))*5;
    c.save();c.translate(x+tw/2,y+th/2+bob);c.scale(sx,1);c.translate(-tw/2,-th/2);
    objDraw(c,'obj:Card '+(i+1),0,0,tw,th,()=>{
      rr(c,0,0,tw,th,34);c.fillStyle='#fff';c.fill();c.save();rr(c,0,0,tw,th,34);c.clip();drawImg(c,q[0],14,14,tw-28,th-100,{label:q[3],shadow:20});c.restore();
      font(c,800,34,FM);c.fillStyle='#111';c.textAlign='left';c.textBaseline='middle';c.fillText(q[1],26,th-50);
    });
    const pp=eBack(prog(t,.9+i*.22,.5));c.save();c.translate(tw-26,th-50);c.scale(pp,pp);font(c,900,44,FN);const w=c.measureText(q[2]).width+40;
    objDraw(c,'obj:Price '+(i+1),-w,-34,w,68,()=>{rr(c,-w,-34,w,68,34);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';c.textAlign='center';c.fillText(q[2],-w/2,2)});
    c.restore();c.restore();
  });
  pop(c,W/2,H-55,t,2,()=>logo(c,I,0,0,190,95),{from:.8});
 }},
{id:'testimonial',name:'Review Card',sub:'Five-star review with typewriter quote and avatar',
 fields:[{k:'quote',l:'Quote',t:'area',v:'The delivery team was on time, careful and friendly. Our new sofa looks incredible and the whole process was effortless.'},{k:'name',l:'Name',t:'text',v:'Sarah M.'},{k:'place',l:'Location',t:'text',v:'Verified buyer, Toronto'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'},{k:'ink',l:'Card',t:'color',v:'#111111'}],
 images:[{k:'av',l:'Customer photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  pop(c,W/2,95,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  const cx=70,cw=W-140,cy=H*.18,ch=H*.68,p=eOut(prog(t,.2,.8));
  c.save();c.translate(0,(1-p)*120);c.globalAlpha=p;
  objDraw(c,'obj:Card',cx,cy,cw,ch,()=>{c.save();c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=50;c.shadowOffsetY=20;rr(c,cx,cy,cw,ch,56);c.fillStyle=F.ink;c.fill();c.restore()});
  c.restore();
  c.save();c.globalAlpha=p;c.fillStyle=F.bg;font(c,900,300,FN);c.textAlign='left';c.textBaseline='alphabetic';c.fillText('“',cx+40,cy+250);c.restore();
  objDraw(c,'obj:Stars',cx+cw-90-4*76-32,cy+110-32,64+4*76,64,()=>{
    for(let i=0;i<5;i++){const sp=eBack(prog(t,.8+i*.1,.45));if(sp>0){c.save();c.translate(cx+cw-90-(4-i)*76,cy+110);c.scale(sp,sp);star5(c,0,0,32,'#FFE81A');c.restore()}}
  });
  font(c,700,Math.min(54,H*.04),FM);const lines=wrap(c,F.quote,cw-120),tot=lines.join(' ').length,shown=Math.floor(tot*prog(t,1.4,2.2)),ls=Math.min(54,H*.04)*1.35;
  let left=shown;c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';
  lines.forEach((l,i)=>{const k=Math.min(l.length+1,Math.max(0,left));left-=l.length+1;if(k>0)c.fillText(l.slice(0,k),cx+60,cy+330+i*ls)});
  const ay=cy+ch-120,ap=eBack(prog(t,3.2,.6));if(ap>0){c.save();c.translate(cx+60+60,ay);c.scale(ap,ap);
    objDraw(c,'obj:Avatar',-60,-60,120,120,()=>{c.beginPath();c.arc(0,0,60,0,7);c.save();c.clip();drawImg(c,I.av,-60,-60,120,120,{fit:'cover',label:'Customer photo'});c.restore();c.lineWidth=6;c.strokeStyle=F.bg;c.beginPath();c.arc(0,0,60,0,7);c.stroke()});
    c.restore()}
  text(c,{s:F.name,x:cx+170+110,y:ay-18,size:44,wt:900,fill:'#fff',al:'left',t,at:3.3,maxW:cw-300});text(c,{s:F.place,x:cx+170+110,y:ay+30,size:30,wt:600,fill:'rgba(255,255,255,.65)',al:'left',t,at:3.45,maxW:cw-300});
 }},
{id:'iris',name:'Iris Reveal',sub:'A circular iris opens from one photo to the next',
 fields:[{k:'title',l:'Title',t:'text',v:'Room makeover'},{k:'la',l:'First label',t:'text',v:'BEFORE'},{k:'lb',l:'Second label',t:'text',v:'AFTER'},{k:'bg',l:'Ring colour',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'First photo'},{k:'b',l:'Second photo'}],
 draw(c,W,H,t,D,F,I){
  const u=t/D,R=Math.hypot(W,H)/2+40,k=.5-.5*Math.cos(TAU*u),r=R*eInOut(k);
  drawImg(c,I.a,0,0,W,H,{fit:'cover',label:'First photo'});
  c.save();c.beginPath();c.arc(W/2,H/2,Math.max(.1,r),0,7);c.clip();drawImg(c,I.b,0,0,W,H,{fit:'cover',label:'Second photo'});c.restore();
  c.save();c.strokeStyle=F.bg;c.lineWidth=14;c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=26;c.beginPath();c.arc(W/2,H/2,Math.max(.1,r),0,7);c.stroke();c.restore();
  const g=c.createLinearGradient(0,0,0,H*.22);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H*.22);
  text(c,{s:F.title,x:W/2,y:H*.07,size:60,wt:900,fill:'#fff',t,at:.2,maxW:W*.86});
  const lab=k<.5?F.la:F.lb;pop(c,W/2,H*.9,t,.6,()=>{
    font(c,800,40,FM);const pw=c.measureText(lab).width+88,ph=76;
    objDraw(c,'obj:Label',-pw/2,-ph/2,pw,ph,()=>pill(c,0,0,lab,40,'#111','#fff',44));
  },{from:.7});
  pop(c,W-140,H*.07+10,t,.9,()=>logo(c,I,0,0,170,85),{from:.8});
 }},
{id:'bilingual',name:'EN / FR Flip',sub:'Headline flips between English and French, built for Canadian posts',
 fields:[{k:'en',l:'English headline',t:'area',v:'SUPER\nSALE'},{k:'fr',l:'French headline',t:'area',v:'SUPER\nSOLDE'},{k:'sen',l:'English sub',t:'text',v:'Up to 50% off select sofas'},{k:'sfr',l:'French sub',t:'text',v:'Jusqu\'à 50 % de rabais sur sofas'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'},{k:'ink',l:'Ink',t:'color',v:'#111111'},{k:'acc',l:'Accent',t:'color',v:'#E4262C'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,ph=(u*2)%1,fr=Math.floor(u*2)%2===1;
  const k=eInOut(Math.min(1,ph/.12,(1-ph)/.12)),ent=eOut(prog(t,0,.6));
  c.save();c.fillStyle=F.ink;c.globalAlpha=.07;rays(c,W/2,H*.45,t,D,20,F.ink,.05,W*1.2);c.restore();
  pop(c,W/2,100,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const ls=(fr?F.fr:F.en).split('\n'),sz=Math.min(260,H*.2);
  c.save();c.translate(W/2,H*.45);c.scale(1,Math.max(.001,k*ent));c.globalAlpha=ent;
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FN,W*.88,sz));font(c,900,s,FN);c.fillStyle=i%2?F.acc:F.ink;c.textAlign='center';c.textBaseline='middle';c.fillText(l,0,(i-(ls.length-1)/2)*sz*.95)});c.restore();
  c.save();c.translate(W/2,H*.78);c.scale(1,Math.max(.001,k));c.globalAlpha=ent;font(c,800,42,FM);c.fillStyle=F.ink;c.textAlign='center';c.textBaseline='middle';c.fillText(fr?F.sfr:F.sen,0,0);c.restore();
  pop(c,W/2,H*.88,t,.8,()=>{const w=110;
    objDraw(c,'obj:Toggle',-w,-34,w*2,68,()=>{
      rr(c,-w,-34,w*2,68,34);c.fillStyle=F.ink;c.fill();c.fillStyle='#FFE81A';rr(c,fr?2:-w+2,-32,w-2,64,32);c.fill();
      font(c,900,32,FM);c.textAlign='center';c.textBaseline='middle';c.fillStyle=fr?'#fff':'#111';c.fillText('EN',-w/2,2);c.fillStyle=fr?'#111':'#fff';c.fillText('FR',w/2,2);
    });
  },{from:.7});
 }},
{id:'steps',name:'How It Works',sub:'Three steps connected by a drawing line with popping numbers',
 fields:[{k:'title',l:'Title',t:'text',v:'HOW TO ORDER'},{k:'s1',l:'Step 1',t:'text',v:'Pick your style'},{k:'d1',l:'Detail 1',t:'text',v:'Browse in store or online'},{k:'s2',l:'Step 2',t:'text',v:'Book delivery'},{k:'d2',l:'Detail 2',t:'text',v:'Choose a time that suits you'},{k:'s3',l:'Step 3',t:'text',v:'Enjoy at home'},{k:'d3',l:'Detail 3',t:'text',v:'We set it up for you'},{k:'bg',l:'Background',t:'color',v:'#0C0C0C'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  pop(c,W/2,95,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  text(c,{s:F.title,x:W/2,y:H*.19,size:68,wt:900,fill:'#fff',t,at:.3,maxW:W*.86});
  const y0=H*.33,gap=(H*.5)/2,x=170;
  c.strokeStyle='rgba(255,255,255,.15)';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(x,y0);c.lineTo(x,y0+gap*2);c.stroke();
  c.strokeStyle=F.acc;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y0+gap*2*eInOut(prog(t,.6,2.4)));c.stroke();
  [[F.s1,F.d1],[F.s2,F.d2],[F.s3,F.d3]].forEach((q,i)=>{const y=y0+i*gap,at=.6+i*1.2,p=eBack(prog(t,at,.55));
    if(p>0){c.save();c.translate(x,y);c.scale(p,p);
      objDraw(c,'obj:Step '+(i+1),-72,-72,144,144,()=>{
        c.beginPath();c.arc(0,0,58,0,7);c.fillStyle=F.acc;c.fill();c.fillStyle='#111';font(c,900,66,FN);c.textAlign='center';c.textBaseline='middle';c.fillText(String(i+1),0,3);
        c.globalAlpha=.4*(.5+.5*Math.sin(TAU*(u*3+i/3)));c.strokeStyle=F.acc;c.lineWidth=5;c.beginPath();c.arc(0,0,58+14,0,7);c.stroke();
      });
      c.restore()}
    text(c,{s:q[0],x:x+110,y:y-22,size:56,wt:900,fill:'#fff',al:'left',t,at:at+.15,maxW:W-x-170,rise:30});text(c,{s:q[1],x:x+110,y:y+38,size:36,wt:600,fill:'rgba(255,255,255,.7)',al:'left',t,at:at+.3,maxW:W-x-170,rise:30});});
 }},
{id:'wheel',name:'Spin to Win',sub:'A prize wheel spins and lands on your top prize',
 fields:[{k:'title',l:'Title',t:'text',v:'SPIN TO WIN'},{k:'segs',l:'Prizes (first one is the winner)',t:'area',v:'$100 OFF\n10% OFF\nFREE DELIVERY\nTRY AGAIN\n$50 OFF\n20% OFF'},{k:'cta',l:'Button',t:'text',v:'Play in store'},{k:'bg',l:'Background',t:'color',v:'#E4262C'},{k:'c1',l:'Wheel colour 1',t:'color',v:'#FFE81A'},{k:'c2',l:'Wheel colour 2',t:'color',v:'#111111'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;rays(c,W/2,H*.5,t,D,24,'#fff',.07,W*1.2);
  pop(c,W/2,95,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  text(c,{s:F.title,x:W/2,y:H*.17,size:96,wt:900,fill:'#fff',t,at:.3,maxW:W*.9});
  const segs=F.segs.split('\n').filter(Boolean),n=Math.max(2,segs.length),arc=TAU/n,R=Math.min(W*.42,H*.27),cy=H*.52,ang=TAU*3*eOut(prog(t,.4,3.4)),land=prog(t,3.8,.5);
  c.save();c.translate(W/2,cy);
  objDraw(c,'obj:Wheel',-R-22,-R-22,(R+22)*2,(R+22)*2,()=>{c.save();c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=40;c.beginPath();c.arc(0,0,R+22,0,7);c.fillStyle='#fff';c.fill();c.restore()});
  c.restore();
  c.save();c.translate(W/2,cy);c.rotate(ang);
  segs.forEach((s,i)=>{const a0=-Math.PI/2-arc/2+i*arc;c.beginPath();c.moveTo(0,0);c.arc(0,0,R,a0,a0+arc);c.closePath();c.fillStyle=i===0&&land>0?(Math.sin(TAU*u*6)>0?'#fff':F.c1):(i%2?F.c2:F.c1);c.fill();
    c.save();c.rotate(a0+arc/2);c.fillStyle=i%2?'#fff':'#111';if(i===0)c.fillStyle='#111';c.textAlign='right';c.textBaseline='middle';const fs=Math.min(48,fitSize(c,s,900,FM,R*.66,48));font(c,900,fs,FM);c.fillText(s,R-26,0);c.restore()});
  c.beginPath();c.arc(0,0,60,0,7);c.fillStyle='#fff';c.fill();c.fillStyle=F.bg;font(c,900,34,FM);c.textAlign='center';c.textBaseline='middle';c.fillText('GO',0,2);c.restore();
  c.save();c.translate(W/2,cy-R-14);c.fillStyle='#111';c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.moveTo(-34,-30);c.lineTo(34,-30);c.lineTo(0,34);c.closePath();c.fill();c.stroke();c.restore();
  pop(c,W/2,H*.86,t,1.6,()=>{font(c,800,44,FM);const w=c.measureText(F.cta).width+100;rr(c,-w/2,-48,w,96,48);c.fillStyle='#fff';c.fill();c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cta,0,3)},{from:.7});
 }},
{id:'ticket',name:'Event Ticket',sub:'A tilted ticket with a perforated stub, shine sweep and barcode',
 fields:[{k:'tag',l:'Tag',t:'text',v:'IN-STORE EVENT'},{k:'title',l:'Title',t:'area',v:'WAREHOUSE\nCLEARANCE'},{k:'date',l:'Date',t:'text',v:'OCT 25 – 27'},{k:'place',l:'Where',t:'text',v:'All Leon\'s locations'},{k:'time',l:'Time',t:'text',v:'9 AM – 9 PM'},{k:'bg',l:'Background',t:'color',v:'#111111'},{k:'acc',l:'Ticket',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  c.save();c.globalAlpha=.1;c.fillStyle=F.acc;for(let i=0;i<14;i++){const a=i*TAU/14+TAU*u/14;c.beginPath();c.arc(W/2+Math.cos(a)*W*.55,H/2+Math.sin(a)*H*.4,6,0,7);c.fill()}c.restore();
  const tw=W-150,th=H*.66,p=eBack(prog(t,.2,.9)),tl=Math.sin(TAU*u)*.02;
  c.save();c.translate(W/2,H*.5);c.rotate(-.05+tl);c.scale(p,p);c.translate(-tw/2,-th/2);
  objDraw(c,'obj:Ticket',0,0,tw,th,()=>{
    const ny=th*.74;c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=60;c.shadowOffsetY=30;notchTicket(c,0,0,tw,th,40,ny,34);c.fillStyle=F.acc;c.fill('evenodd');c.restore();
    c.fillStyle='#111';c.textBaseline='middle';
    pill(c,tw/2,70,F.tag,28,'#111',F.acc,34);
    const ls=F.title.split('\n'),sz=Math.min(150,th*.17);ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FN,tw*.86,sz));font(c,900,s,FN);c.fillStyle='#111';c.textAlign='center';c.fillText(l,tw/2,th*.27+i*sz*.95)});
    font(c,900,70,FN);c.fillStyle='#E4262C';c.fillText(F.date,tw/2,th*.62);font(c,700,36,FM);c.fillStyle='#111';c.fillText(F.place+'  •  '+F.time,tw/2,th*.7);
    c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=5;c.setLineDash([16,14]);c.beginPath();c.moveTo(48,ny);c.lineTo(tw-48,ny);c.stroke();c.setLineDash([]);
    c.fillStyle='#111';let bx=70;const r=rng(5);while(bx<tw*.62){const w=3+Math.floor(r()*9);c.fillRect(bx,ny+40,w,th-ny-90);bx+=w+4+Math.floor(r()*7)}
    font(c,900,40,FM);c.textAlign='right';c.fillText('ADMIT ONE',tw-70,ny+(th-ny)/2);
    shimmer(c,0,0,tw,th,40,(u*2)%1,'rgba(255,255,255,.35)');
  });
  c.restore();
  pop(c,W/2,H*.9,t,1.2,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'callouts',name:'Feature Callouts',sub:'Lines draw out from the product to labelled features',
 fields:[{k:'title',l:'Title',t:'text',v:'Why you will love it'},{k:'f1',l:'Feature 1',t:'text',v:'Stain-resistant fabric'},{k:'f2',l:'Feature 2',t:'text',v:'Solid hardwood frame'},{k:'f3',l:'Feature 3',t:'text',v:'Memory foam seats'},{k:'f4',l:'Feature 4',t:'text',v:'10-year warranty'},{k:'bg',l:'Background',t:'color',v:'#F4F0E8'},{k:'acc',l:'Accent',t:'color',v:'#E4262C'}],
 images:[{k:'p',l:'Product photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  text(c,{s:F.title,x:W/2,y:H*.09,size:58,wt:900,fill:'#111',t,at:.2,maxW:W*.88});
  const px=W/2,py=H*.47,pw=700,ph=H*.34;floorShadow(c,px,py+ph/2+20,560,.35);
  pop(c,px,py+Math.sin(TAU*u)*8,t,.3,()=>drawImg(c,I.p,-pw/2,-ph/2,pw,ph,{label:'Product photo',shadow:40}),{from:.8,dur:.9});
  const pts=[[-.28,-.15,-1,-1],[.28,-.2,1,-1],[-.2,.18,-1,1],[.25,.15,1,1]];
  [F.f1,F.f2,F.f3,F.f4].forEach((f,i)=>{const q=pts[i],at=1.0+i*.45,p=eOut(prog(t,at,.7));if(p<=0)return;
    const sx=px+q[0]*pw,sy=py+q[1]*ph,ex=px+q[2]*(W*.27),ey=py+q[3]*(ph/2+110)+(q[3]>0?60:-60)*0,mx=ex;
    c.save();c.strokeStyle=F.acc;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+(ex-sx)*p,sy+(ey-sy)*p);c.stroke();
    c.fillStyle=F.acc;c.beginPath();c.arc(sx,sy,14,0,7);c.fill();c.globalAlpha=.5*(1-((u*3+i/4)%1));c.strokeStyle=F.acc;c.lineWidth=4;c.beginPath();c.arc(sx,sy,14+((u*3+i/4)%1)*34,0,7);c.stroke();c.restore();
    if(p>.9){const pp=eBack(prog(t,at+.55,.4));if(pp>0){c.save();c.translate(ex,ey);c.scale(pp,pp);font(c,800,34,FM);const w=Math.min(W*.42,c.measureText(f).width+60);
      objDraw(c,'obj:Feature '+(i+1),-w/2,-40,w,80,()=>{rr(c,-w/2,-40,w,80,40);c.fillStyle='#111';c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(f,0,2,w-40)});
      c.restore()}}
  });
  pop(c,W/2,H*.9,t,2.8,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'coupon',name:'Promo Coupon',sub:'A cut-out coupon with a counting amount and a code that types in',
 fields:[{k:'tag',l:'Tag',t:'text',v:'EXCLUSIVE OFFER'},{k:'amt',l:'Amount',t:'text',v:'$100'},{k:'desc',l:'Description',t:'text',v:'off your next purchase'},{k:'code',l:'Code',t:'text',v:'LEONS100'},{k:'terms',l:'Terms',t:'text',v:'Min. spend $999. Ends Oct 31.'},{k:'bg',l:'Background',t:'color',v:'#E4262C'},{k:'acc',l:'Coupon',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  c.save();c.globalAlpha=.12;c.fillStyle='#fff';for(let i=0;i<9;i++)for(let j=0;j<12;j++){const x=(i*140+(j%2)*70+u*140)%1260-90,y=j*130;c.beginPath();c.arc(x,y,12,0,7);c.fill()}c.restore();
  pop(c,W/2,95,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  const cw=W-120,ch=H*.52,p=eBack(prog(t,.3,.8));
  c.save();c.translate(W/2,H*.5);c.rotate(Math.sin(TAU*u)*.015-.03);c.scale(p,p);c.translate(-cw/2,-ch/2);
  objDraw(c,'obj:Coupon',0,0,cw,ch,()=>{
    c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=50;c.shadowOffsetY=24;c.beginPath();c.roundRect(0,0,cw,ch,44);c.fillStyle=F.acc;c.fill();c.restore();
    c.strokeStyle='#111';c.lineWidth=5;c.setLineDash([22,16]);c.beginPath();c.roundRect(22,22,cw-44,ch-44,30);c.stroke();c.setLineDash([]);
    c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';pill(c,cw/2,ch*.14,F.tag,28,'#111',F.acc,32);
    const as=Math.min(300,fitSize(c,F.amt,900,FN,cw*.8,300));font(c,900,as,FN);c.fillStyle='#111';c.fillText(countText(F.amt,prog(t,.8,1)),cw/2,ch*.42);
    font(c,800,46,FM);c.fillText(F.desc,cw/2,ch*.65);
    const cp=prog(t,1.8,.9),cs=F.code.slice(0,Math.ceil(F.code.length*cp));font(c,900,52,FM);const w=Math.max(c.measureText(F.code).width,10)+90;
    objDraw(c,'obj:Code',cw/2-w/2,ch*.74,w,96,()=>{rr(c,cw/2-w/2,ch*.74,w,96,22);c.fillStyle='#111';c.fill();c.fillStyle=F.acc;c.textAlign='left';c.fillText(cs+(cp<1&&Math.sin(TAU*u*20)>0?'|':''),cw/2-w/2+45,ch*.74+50)});
    c.textAlign='center';font(c,600,28,FM);c.fillStyle='rgba(0,0,0,.65)';c.fillText(F.terms,cw/2,ch*.93,cw-120);
    shimmer(c,0,0,cw,ch,44,(u*2)%1,'rgba(255,255,255,.4)');
  });
  c.restore();
  confettiBurst(c,W/2,H*.5,t,1.9,40,['#fff','#111',F.acc],11);
 }}
];
