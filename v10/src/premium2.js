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
  text(c,{s:F.title,key:'title',x:W/2,y:hh*.38,size:56,wt:900,fill:'#fff',t,at:.2,maxW:W*.8});text(c,{s:F.dates,key:'dates',x:W/2,y:hh*.78,size:34,wt:800,fill:'#FFE81A',t,at:.35,maxW:W*.8});
  const g=28,tw=(W-g*3)/2,top=hh+g,th=(H-top-g*2-100)/2;
  [[I.a,F.n1,F.p1,'Product 1','n1'],[I.b,F.n2,F.p2,'Product 2','n2'],[I.c,F.n3,F.p3,'Product 3','n3'],[I.d,F.n4,F.p4,'Product 4','n4']].forEach((q,i)=>{
    const x=g+(i%2)*(tw+g),y=top+Math.floor(i/2)*(th+g),p=prog(t,.5+i*.22,.75);if(p<=0)return;
    const sx=Math.max(.001,Math.abs(Math.cos((1-eOut(p))*Math.PI/2))),bob=Math.sin(TAU*(u+i/4))*5;
    c.save();c.translate(x+tw/2,y+th/2+bob);c.scale(sx,1);c.translate(-tw/2,-th/2);
    objDraw(c,'obj:Card '+(i+1),0,0,tw,th,()=>{
      rr(c,0,0,tw,th,34);c.fillStyle='#fff';c.fill();c.save();rr(c,0,0,tw,th,34);c.clip();drawImg(c,q[0],14,14,tw-28,th-100,{label:q[3],shadow:20});c.restore();
      font(c,800,34,FM);c.fillStyle='#111';c.textBaseline='middle';{const nw=tw-52;const A=alignFor(q[4],26+nw/2,nw);c.textAlign=A.align;c.fillText(q[1],A.x,th-50)}
    });
    const pp=eBack(prog(t,.9+i*.22,.5));c.save();c.translate(tw-26,th-50);c.scale(pp,pp);font(c,900,44,FN);const w=c.measureText(q[2]).width+40;
    objDraw(c,'obj:Price '+(i+1),-w,-34,w,68,()=>{rr(c,-w,-34,w,68,34);c.fillStyle='#E4262C';c.fill();c.fillStyle='#fff';c.textAlign='center';c.fillText(q[2],-w/2,2)});
    c.restore();c.restore();
  });
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,95,190,I,1.6):W/2,H-55,t,2,()=>logo(c,I,0,0,190,95),{from:.8});
 }},
{id:'testimonial',name:'Review Card',sub:'Five-star review with typewriter quote and avatar',
 fields:[{k:'quote',l:'Quote',t:'area',v:'The delivery team was on time, careful and friendly. Our new sofa looks incredible and the whole process was effortless.'},{k:'name',l:'Name',t:'text',v:'Sarah M.'},{k:'place',l:'Location',t:'text',v:'Verified buyer, Toronto'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'},{k:'ink',l:'Card',t:'color',v:'#111111'}],
 images:[{k:'av',l:'Customer photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,105,210,I,1.6):W/2,95,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  const cx=70,cw=W-140,cy=H*.18,ch=H*.68,p=eOut(prog(t,.2,.8));
  c.save();c.translate(0,(1-p)*120);c.globalAlpha=p;
  objDraw(c,'obj:Card',cx,cy,cw,ch,()=>{c.save();c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=50;c.shadowOffsetY=20;rr(c,cx,cy,cw,ch,56);c.fillStyle=F.ink;c.fill();c.restore()});
  c.restore();
  c.save();c.globalAlpha=p;c.fillStyle=F.bg;font(c,900,300,FN);c.textAlign='left';c.textBaseline='alphabetic';c.fillText('“',cx+40,cy+250);c.restore();
  objDraw(c,'obj:Stars',cx+cw-90-4*76-32,cy+110-32,64+4*76,64,()=>{
    for(let i=0;i<5;i++){const sp=eBack(prog(t,.8+i*.1,.45));if(sp>0){c.save();c.translate(cx+cw-90-(4-i)*76,cy+110);c.scale(sp,sp);star5(c,0,0,32,'#FFE81A');c.restore()}}
  });
  font(c,700,Math.min(54,H*.04),FM);const qmw=cw-120,lines=wrap(c,F.quote,qmw),tot=lines.join(' ').length,shown=Math.floor(tot*prog(t,1.4,2.2)),ls=Math.min(54,H*.04)*1.35;
  let left=shown;c.fillStyle='#fff';c.textBaseline='middle';
  const qov=styleFor(cur().id,'quote');let qAlign='left';if(qov&&qov.al&&qov.al!=='left')qAlign=qov.al;
  const qx=qAlign==='left'?cx+60:qAlign==='center'?cx+60+qmw/2:cx+60+qmw;c.textAlign=qAlign;
  lines.forEach((l,i)=>{const k=Math.min(l.length+1,Math.max(0,left));left-=l.length+1;if(k>0)c.fillText(l.slice(0,k),qx,cy+330+i*ls)});
  const ay=cy+ch-120,ap=eBack(prog(t,3.2,.6));if(ap>0){c.save();c.translate(cx+60+60,ay);c.scale(ap,ap);
    objDraw(c,'obj:Avatar',-60,-60,120,120,()=>{c.beginPath();c.arc(0,0,60,0,7);c.save();c.clip();drawImg(c,I.av,-60,-60,120,120,{fit:'cover',label:'Customer photo'});c.restore();c.lineWidth=6;c.strokeStyle=F.bg;c.beginPath();c.arc(0,0,60,0,7);c.stroke()});
    c.restore()}
  text(c,{s:F.name,key:'name',x:cx+170+110,y:ay-18,size:44,wt:900,fill:'#fff',al:'left',t,at:3.3,maxW:cw-300});text(c,{s:F.place,key:'place',x:cx+170+110,y:ay+30,size:30,wt:600,fill:'rgba(255,255,255,.65)',al:'left',t,at:3.45,maxW:cw-300});
 }},
{id:'bilingual',name:'EN / FR Flip',sub:'Headline flips between English and French, built for Canadian posts',
 fields:[{k:'en',l:'English headline',t:'area',v:'SUPER\nSALE'},{k:'fr',l:'French headline',t:'area',v:'SUPER\nSOLDE'},{k:'sen',l:'English sub',t:'text',v:'Up to 50% off select sofas'},{k:'sfr',l:'French sub',t:'text',v:'Jusqu\'à 50 % de rabais sur sofas'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'},{k:'ink',l:'Ink',t:'color',v:'#111111'},{k:'acc',l:'Accent',t:'color',v:'#E4262C'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,ph=(u*2)%1,fr=Math.floor(u*2)%2===1;
  const k=eInOut(Math.min(1,ph/.12,(1-ph)/.12)),ent=eOut(prog(t,0,.6));
  c.save();c.fillStyle=F.ink;c.globalAlpha=.07;rays(c,W/2,H*.45,t,D,20,F.ink,.05,W*1.2);c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,110,220,I,1.6):W/2,100,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const ls=(fr?F.fr:F.en).split('\n'),sz=Math.min(260,H*.2);
  c.save();c.translate(W/2,H*.45);c.scale(1,Math.max(.001,k*ent));c.globalAlpha=ent;
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FN,W*.88,sz));font(c,900,s,FN);c.fillStyle=i%2?F.acc:F.ink;const A=alignFor(fr?'fr':'en',0,W*.88);c.textAlign=A.align;c.textBaseline='middle';c.fillText(l,A.x,(i-(ls.length-1)/2)*sz*.95)});c.restore();
  c.save();c.translate(W/2,H*.78);c.scale(1,Math.max(.001,k));c.globalAlpha=ent;font(c,800,42,FM);c.fillStyle=F.ink;const A2=alignFor(fr?'sfr':'sen',0,W*.8);c.textAlign=A2.align;c.textBaseline='middle';c.fillText(fr?F.sfr:F.sen,A2.x,0);c.restore();
  pop(c,W/2,H*.88,t,.8,()=>{const w=110;
    objDraw(c,'obj:Toggle',-w,-34,w*2,68,()=>{
      rr(c,-w,-34,w*2,68,34);c.fillStyle=F.ink;c.fill();c.fillStyle='#FFE81A';rr(c,fr?2:-w+2,-32,w-2,64,32);c.fill();
      font(c,900,32,FM);c.textAlign='center';c.textBaseline='middle';c.fillStyle=fr?'#fff':'#111';c.fillText('EN',-w/2,2);c.fillStyle=fr?'#111':'#fff';c.fillText('FR',w/2,2);
    });
  },{from:.7});
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
    font(c,800,28,FM);const tagW0=c.measureText(F.tag).width+68;
    pill(c,anchorX('tag',tw/2,tagW0/2,tw-tagW0/2),70,F.tag,28,'#111',F.acc,34);
    const ls=F.title.split('\n'),sz=Math.min(150,th*.17);const At=alignFor('title',tw/2,tw*.86);ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FN,tw*.86,sz));font(c,900,s,FN);c.fillStyle='#111';c.textAlign=At.align;c.fillText(l,At.x,th*.27+i*sz*.95)});
    font(c,900,70,FN);c.fillStyle='#E4262C';{const Ad=alignFor('date',tw/2,tw*.8);c.textAlign=Ad.align;c.fillText(F.date,Ad.x,th*.62)}font(c,700,36,FM);c.fillStyle='#111';{const Ap=alignFor('place',tw/2,tw*.8);c.textAlign=Ap.align;c.fillText(F.place+'  •  '+F.time,Ap.x,th*.7)}
    c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=5;c.setLineDash([16,14]);c.beginPath();c.moveTo(48,ny);c.lineTo(tw-48,ny);c.stroke();c.setLineDash([]);
    c.fillStyle='#111';let bx=70;const r=rng(5);while(bx<tw*.62){const w=3+Math.floor(r()*9);c.fillRect(bx,ny+40,w,th-ny-90);bx+=w+4+Math.floor(r()*7)}
    font(c,900,40,FM);c.textAlign='right';c.fillText('ADMIT ONE',tw-70,ny+(th-ny)/2);
    shimmer(c,0,0,tw,th,40,(u*2)%1,'rgba(255,255,255,.35)');
  });
  c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H*.9,t,1.2,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
];
