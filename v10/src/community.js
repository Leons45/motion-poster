/* ---------- community ports ----------
   Motion ported to canvas from two open-source template libraries:
   - github.com/reactvideoeditor/remotion-templates (free to use, credit to reactvideoeditor.com)
   - github.com/RenderComp/free-remotion-templates (MIT, Trimora Inc.)
   Timing, easing and composition follow the originals; colours default to Leon's brand.      */
const CRED_RVE='Ported from React Video Editor', CRED_RC='Ported from RenderComp';
function scramble(str,p,seed){
  const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*',ch=[...String(str)],n=Math.floor(p*ch.length);
  return ch.map((q,i)=>{if(i<n||q===' ')return q;const r=Math.sin((seed*31+i*97)*9301+49297)*49297;return CH[Math.floor((r-Math.floor(r))*CH.length)]}).join('');
}
const T_COMM=[
{id:'quote',name:'Quote Card',sub:CRED_RVE+' — big quote mark, line fades up, attribution slides in',
 fields:[{k:'q',l:'Quote',t:'area',v:'We found the perfect sectional and it arrived in three days. Honestly the easiest furniture purchase we have ever made.'},{k:'by',l:'Attribution',t:'text',v:'— Sarah M., Toronto'},{k:'bg',l:'Background',t:'color',v:'#111827'},{k:'acc',l:'Quote mark',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const qo=prog(t,0,.5),to=prog(t,.33,.66),ao=prog(t,1,.5),ax=(1-eEnter(ao))*40;
  c.save();c.globalAlpha=qo;c.fillStyle=F.acc;font(c,900,260,'Georgia,serif');c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText('“',W/2,H*.28);c.restore();
  c.save();c.globalAlpha=to;font(c,700,Math.min(64,H*.047),FM);
  const ls=wrap(c,F.q,W*.78),lh=Math.min(64,H*.047)*1.42;c.fillStyle='#fff';const Aq=alignFor('q',W/2,W*.78);c.textAlign=Aq.align;c.textBaseline='middle';
  ls.forEach((l,i)=>c.fillText(l,Aq.x,H*.5+(i-(ls.length-1)/2)*lh));c.restore();
  c.save();c.globalAlpha=ao;font(c,800,40,FM);c.fillStyle=F.acc;const Aby=alignFor('by',W/2+ax,W*.8);c.textAlign=Aby.align;c.fillText(F.by,Aby.x,H*.78);c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H*.9,t,1.4,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'photostack',name:'Photo Stack',sub:CRED_RVE+' — three bordered photos spring into a fanned stack',
 fields:[{k:'title',l:'Title',t:'text',v:'NEW IN STORE'},{k:'c1',l:'Caption 1',t:'text',v:'Lounge'},{k:'c2',l:'Caption 2',t:'text',v:'Dine'},{k:'c3',l:'Caption 3',t:'text',v:'Rest'},{k:'bg',l:'Background',t:'color',v:'#111827'}],
 images:[{k:'a',l:'Photo 1'},{k:'b',l:'Photo 2'},{k:'c',l:'Photo 3'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  text(c,{s:F.title,key:'title',x:W/2,y:H*.15,size:62,wt:900,fill:'#fff',t,at:.1,maxW:W*.86});
  const pw=W*.44,phh=pw*1.28;
  [[I.a,F.c1,-7,0],[I.b,F.c2,0,.27],[I.c,F.c3,7,.53]].forEach((q,i)=>{
    const p=prog(t,.4+q[3],.8);if(p<=0)return;const s=eBack(p);
    c.save();c.translate(W/2+(i-1)*116,H*.54+(i-1)*-54);c.rotate(q[2]*Math.PI/180);c.scale(s,s);c.globalAlpha*=clamp(p*2.5);
    objDraw(c,'obj:Card '+(i+1),-pw/2,-phh/2,pw,phh,()=>{
      c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=36;c.shadowOffsetY=14;
      rr(c,-pw/2,-phh/2,pw,phh,10);c.fillStyle='#fff';c.fill();c.shadowColor='transparent';
      c.save();rr(c,-pw/2+14,-phh/2+14,pw-28,phh-28-54,6);c.clip();drawImg(c,q[0],-pw/2+14,-phh/2+14,pw-28,phh-82,{fit:'contain',label:'Photo '+(i+1)});c.restore();
      font(c,800,30,FM);c.fillStyle='#111';{const A=alignFor('c'+(i+1),0,pw-60);c.textAlign=A.align;c.textBaseline='middle';c.fillText(q[1],A.x,phh/2-32)}
    });
    c.restore();
  });
  /* On a square canvas the fanned stack runs tall enough that the lowest card (the one
     offset +54, drawn first) can reach down into the logo's fixed H*.9 slot. Push the logo
     below that card's real bottom edge instead on ratios where it would otherwise clip it. */
  const stackBottom=H*.54+54+pw*1.28/2;
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,Math.max(H*.9,stackBottom+70),t,1.6,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'polaroid',name:'Polaroid Drop',sub:CRED_RVE+' — a polaroid swings down from above and settles',
 fields:[{k:'cap',l:'Caption',t:'text',v:'Avery Sofa — $649'},{k:'sub',l:'Sub line',t:'text',v:'In stores now'},{k:'bg',l:'Background',t:'color',v:'#111827'}],
 images:[{k:'p',l:'Photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const d=prog(t,0,1.1),s=eElastic(d),ty=-300*(1-s),rot=(8+(-3-8)*s)*Math.PI/180,op=clamp(d*3.3);
  const pw=W*.62,ph=pw;
  c.save();c.globalAlpha=op;c.translate(W/2,H*.46+ty);c.rotate(rot);
  objDraw(c,'obj:Polaroid',-pw/2-18,-ph/2-18,pw+36,ph+36+78,()=>{
    c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=60;c.shadowOffsetY=24;
    rr(c,-pw/2-18,-ph/2-18,pw+36,ph+36+78,6);c.fillStyle='#fff';c.fill();c.shadowColor='transparent';
    c.save();c.beginPath();c.rect(-pw/2,-ph/2,pw,ph);c.clip();drawImg(c,I.p,-pw/2,-ph/2,pw,ph,{fit:'contain',label:'Photo'});c.restore();
    font(c,800,40,FM);c.fillStyle='#111';{const A=alignFor('cap',0,pw);c.textAlign=A.align;c.textBaseline='middle';c.fillText(F.cap,A.x,ph/2+44,pw)}
  });
  c.restore();
  text(c,{s:F.sub,key:'sub',x:W/2,y:H*.85,size:44,wt:800,fill:'#fff',t,at:1.2,maxW:W*.8});
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,95,190,I,1.6):W/2,H*.93,t,1.5,()=>logo(c,I,0,0,190,95),{from:.8});
 }},
{id:'splitscreen',name:'Split Screen',sub:CRED_RVE+' — two panels slide in and meet, divider fades up',
 fields:[{k:'ha',l:'Left heading',t:'text',v:'BEFORE'},{k:'sa',l:'Left line',t:'text',v:'Tired living room'},{k:'hb',l:'Right heading',t:'text',v:'AFTER'},{k:'sb',l:'Right line',t:'text',v:'Styled by Leon\'s'},{k:'ca',l:'Left colour',t:'color',v:'#1F2937'},{k:'cb',l:'Right colour',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Left photo'},{k:'b',l:'Right photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle='#111827';c.fillRect(0,0,W,H);
  const l=eBack(prog(t,0,.9)),r=eBack(prog(t,.17,.9)),dv=prog(t,.6,.3);
  [[0,-1,l,F.ca,I.a,F.ha,F.sa,'Left photo','#fff','ha','sa'],[1,1,r,F.cb,I.b,F.hb,F.sb,'Right photo','#111','hb','sb']].forEach(q=>{
    const x=q[0]*W/2+q[1]*(1-q[2])*W/2;
    c.save();c.beginPath();c.rect(x,0,W/2,H);c.clip();
    c.fillStyle=q[3];c.fillRect(x,0,W/2,H);
    if(q[4])drawImg(c,q[4],x,H*.22,W/2,H*.5,{fit:'contain',label:q[7]});else ph(c,x+30,H*.22,W/2-60,H*.5,q[7],q[8]==='#fff');
    font(c,900,58,FM);c.fillStyle=q[8];{const A=alignFor(q[9],x+W/4,W/2-50);c.textAlign=A.align;c.textBaseline='middle';c.fillText(q[5],A.x,H*.14,W/2-50)}
    font(c,700,34,FM);{const A=alignFor(q[10],x+W/4,W/2-50);c.textAlign=A.align;c.fillText(q[6],A.x,H*.8,W/2-50)}c.restore();
  });
  c.save();c.globalAlpha=dv;c.fillStyle='#fff';c.fillRect(W/2-3,0,6,H);c.restore();
  pop(c,evLogoAlign()==='left'?logoAnchorX(45,100,200,I,1.6):W/2,H*.93,t,1.1,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
];
