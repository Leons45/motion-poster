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
  const ls=wrap(c,F.q,W*.78),lh=Math.min(64,H*.047)*1.42;c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
  ls.forEach((l,i)=>c.fillText(l,W/2,H*.5+(i-(ls.length-1)/2)*lh));c.restore();
  c.save();c.globalAlpha=ao;font(c,800,40,FM);c.fillStyle=F.acc;c.textAlign='center';c.fillText(F.by,W/2+ax,H*.78);c.restore();
  pop(c,W/2,H*.9,t,1.4,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'photostack',name:'Photo Stack',sub:CRED_RVE+' — three bordered photos spring into a fanned stack',
 fields:[{k:'title',l:'Title',t:'text',v:'NEW IN STORE'},{k:'c1',l:'Caption 1',t:'text',v:'Lounge'},{k:'c2',l:'Caption 2',t:'text',v:'Dine'},{k:'c3',l:'Caption 3',t:'text',v:'Rest'},{k:'bg',l:'Background',t:'color',v:'#111827'}],
 images:[{k:'a',l:'Photo 1'},{k:'b',l:'Photo 2'},{k:'c',l:'Photo 3'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  text(c,{s:F.title,x:W/2,y:H*.15,size:62,wt:900,fill:'#fff',t,at:.1,maxW:W*.86});
  const pw=W*.44,phh=pw*1.28;
  [[I.a,F.c1,-7,0],[I.b,F.c2,0,.27],[I.c,F.c3,7,.53]].forEach((q,i)=>{
    const p=prog(t,.4+q[3],.8);if(p<=0)return;const s=eBack(p);
    c.save();c.translate(W/2+(i-1)*116,H*.54+(i-1)*-54);c.rotate(q[2]*Math.PI/180);c.scale(s,s);c.globalAlpha*=clamp(p*2.5);
    objDraw(c,'obj:Card '+(i+1),-pw/2,-phh/2,pw,phh,()=>{
      c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=36;c.shadowOffsetY=14;
      rr(c,-pw/2,-phh/2,pw,phh,10);c.fillStyle='#fff';c.fill();c.shadowColor='transparent';
      c.save();rr(c,-pw/2+14,-phh/2+14,pw-28,phh-28-54,6);c.clip();drawImg(c,q[0],-pw/2+14,-phh/2+14,pw-28,phh-82,{fit:'cover-safe',label:'Photo '+(i+1)});c.restore();
      font(c,800,30,FM);c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(q[1],0,phh/2-32);
    });
    c.restore();
  });
  pop(c,W/2,H*.9,t,1.6,()=>logo(c,I,0,0,200,100),{from:.8});
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
    c.save();c.beginPath();c.rect(-pw/2,-ph/2,pw,ph);c.clip();drawImg(c,I.p,-pw/2,-ph/2,pw,ph,{fit:'cover-safe',label:'Photo'});c.restore();
    font(c,800,40,FM);c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(F.cap,0,ph/2+44,pw);
  });
  c.restore();
  text(c,{s:F.sub,x:W/2,y:H*.85,size:44,wt:800,fill:'#fff',t,at:1.2,maxW:W*.8});
  pop(c,W/2,H*.93,t,1.5,()=>logo(c,I,0,0,190,95),{from:.8});
 }},
{id:'splitscreen',name:'Split Screen',sub:CRED_RVE+' — two panels slide in and meet, divider fades up',
 fields:[{k:'ha',l:'Left heading',t:'text',v:'BEFORE'},{k:'sa',l:'Left line',t:'text',v:'Tired living room'},{k:'hb',l:'Right heading',t:'text',v:'AFTER'},{k:'sb',l:'Right line',t:'text',v:'Styled by Leon\'s'},{k:'ca',l:'Left colour',t:'color',v:'#1F2937'},{k:'cb',l:'Right colour',t:'color',v:'#FFE81A'}],
 images:[{k:'a',l:'Left photo'},{k:'b',l:'Right photo'}],
 draw(c,W,H,t,D,F,I){
  c.fillStyle='#111827';c.fillRect(0,0,W,H);
  const l=eBack(prog(t,0,.9)),r=eBack(prog(t,.17,.9)),dv=prog(t,.6,.3);
  [[0,-1,l,F.ca,I.a,F.ha,F.sa,'Left photo','#fff'],[1,1,r,F.cb,I.b,F.hb,F.sb,'Right photo','#111']].forEach(q=>{
    const x=q[0]*W/2+q[1]*(1-q[2])*W/2;
    c.save();c.beginPath();c.rect(x,0,W/2,H);c.clip();
    c.fillStyle=q[3];c.fillRect(x,0,W/2,H);
    if(q[4])drawImg(c,q[4],x,H*.22,W/2,H*.5,{fit:'cover-safe',label:q[7]});else ph(c,x+30,H*.22,W/2-60,H*.5,q[7],q[8]==='#fff');
    font(c,900,58,FM);c.fillStyle=q[8];c.textAlign='center';c.textBaseline='middle';c.fillText(q[5],x+W/4,H*.14,W/2-50);
    font(c,700,34,FM);c.fillText(q[6],x+W/4,H*.8,W/2-50);c.restore();
  });
  c.save();c.globalAlpha=dv;c.fillStyle='#fff';c.fillRect(W/2-3,0,6,H);c.restore();
  pop(c,W/2,H*.93,t,1.1,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'matrix',name:'Matrix Rain',sub:CRED_RVE+' — falling character columns behind a headline',
 fields:[{k:'head',l:'Headline',t:'area',v:'TECH\nEVENT'},{k:'sub',l:'Sub line',t:'text',v:'Smart home, set up for you'},{k:'bg1',l:'Background top',t:'color',v:'#0A1933'},{k:'bg2',l:'Background bottom',t:'color',v:'#101010'},{k:'acc',l:'Rain colour',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,F.bg1);g.addColorStop(1,F.bg2);c.fillStyle=g;c.fillRect(0,0,W,H);
  const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*',cols=Math.floor(W/34),r=rng(21);
  font(c,700,30,'ui-monospace,Menlo,monospace');c.textAlign='center';c.textBaseline='middle';
  for(let i=0;i<cols;i++){
    const sp=r()*5+5, y0=r()*H, tail=6+Math.floor(r()*8);
    for(let k=0;k<tail;k++){
      const y=((y0+t*60*sp-k*34)%(H+120))-60, a=(1-k/tail)*(1-(y/H)*.5);
      if(a<=0)continue;c.fillStyle=F.acc;c.globalAlpha=a*.75;
      c.fillText(CH[Math.floor((t*20+i*3+k)%CH.length)],i*34+17,y);
    }
  }
  c.globalAlpha=1;
  const ls=F.head.split('\n'),sz=Math.min(210,H*.16);
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FM,W*.86,sz));
    pop(c,W/2,H*.44+(i-(ls.length-1)/2)*sz*1.02,t,.3+i*.18,()=>{font(c,900,s,FM);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
      c.save();c.shadowColor=F.acc;c.shadowBlur=40;c.fillText(l,0,0);c.restore()},{from:.6,dur:.7})});
  text(c,{s:F.sub,x:W/2,y:H*.68,size:42,wt:700,fill:'#fff',t,at:1,maxW:W*.84});
  pop(c,W/2,H*.88,t,1.3,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'liquidwave',name:'Liquid Wave',sub:CRED_RVE+' — a soft blurred wave rolls under the message',
 fields:[{k:'head',l:'Headline',t:'area',v:'Comfort,\ndelivered'},{k:'sub',l:'Sub line',t:'text',v:'Free delivery over $999'},{k:'bg',l:'Background',t:'color',v:'#111827'},{k:'c1',l:'Wave from',t:'color',v:'#F5C900'},{k:'c2',l:'Wave to',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D;
  [[.62,1,.35,26],[.68,2,.6,18],[.74,3,1,0]].forEach((q,i)=>{
    const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,F.c1);g.addColorStop(1,F.c2);
    c.save();c.globalAlpha=q[2];if(q[3]&&'filter' in c)c.filter='blur('+q[3]+'px)';c.fillStyle=g;
    c.beginPath();c.moveTo(0,H);
    for(let x=0;x<=W;x+=W/50)c.lineTo(x,H*q[0]+Math.sin(TAU*(u*q[1]*(i%2?-1:1))+x/W*5)*50);
    c.lineTo(W,H);c.closePath();c.fill();if('filter' in c)c.filter='none';c.restore();
  });
  const ls=F.head.split('\n'),sz=Math.min(150,H*.115);
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FM,W*.84,sz));
    charRise(c,l,W/2,H*.3+(i-(ls.length-1)/2)*sz*1.05,s,900,FM,'#fff',t,.2+i*.3,.03,50)});
  text(c,{s:F.sub,x:W/2,y:H*.5,size:42,wt:700,fill:'rgba(255,255,255,.85)',t,at:1.1,maxW:W*.8});
  pop(c,W/2,H*.12,t,0,()=>logo(c,I,0,0,210,105),{from:.8});
 }},
{id:'starfield',name:'Starfield',sub:CRED_RVE+' — stars stream outward from the centre, golden-angle spread',
 fields:[{k:'head',l:'Headline',t:'text',v:'BOXING WEEK'},{k:'sub',l:'Sub line',t:'text',v:'The biggest event of the year'},{k:'cta',l:'Button',t:'text',v:'Starts Dec 26'},{k:'bg',l:'Background',t:'color',v:'#0A0A1A'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2,N=110,maxR=Math.max(cx,cy)*1.25;
  for(let i=0;i<N;i++){
    const a=((i*137.508)%360)*Math.PI/180, sr=((i*31+17)%50)/50, sp=.5+((i*7+3)%10)/10, bs=1+((i*13+5)%3);
    const p=((t/D*2*sp+i/N)%1), R=sr*20+p*maxR, x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
    const op=Math.min(p*4,1)*Math.max(1-p*.8,.2);
    c.save();c.globalAlpha=op;c.fillStyle=i%7===0?F.acc:'#fff';
    c.beginPath();c.arc(x,y,bs*(1+p*2),0,TAU);c.fill();c.restore();
  }
  glow(c,W,H,cx,cy,W*.6,'rgba(255,232,26,.14)','rgba(0,0,0,0)');
  pop(c,W/2,H*.16,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const hs=Math.min(130,fitSize(c,F.head,900,FM,W*.88,130));
  charRise(c,F.head,W/2,H*.44,hs,900,FM,'#fff',t,.4,.03,60);
  text(c,{s:F.sub,x:W/2,y:H*.56,size:42,wt:700,fill:'rgba(255,255,255,.82)',t,at:1.1,maxW:W*.8});
  pop(c,W/2,H*.72,t,1.5,()=>{
    font(c,800,42,FM);const bw=c.measureText(F.cta).width+96,bh=42*1.9;
    objDraw(c,'obj:Button',-bw/2,-bh/2,bw,bh,()=>pill(c,0,0,F.cta,42,F.acc,'#111',48));
  },{from:.7});
 }},
{id:'soundwave',name:'Sound Bars',sub:CRED_RVE+' — an audio-style bar field pulsing under the message',
 fields:[{k:'head',l:'Headline',t:'text',v:'NOW PLAYING'},{k:'sub',l:'Sub line',t:'text',v:'The Leon\'s home makeover podcast'},{k:'bg',l:'Background',t:'color',v:'#101014'},{k:'acc',l:'Bars',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);const u=t/D,N=40,bw=W/N*.56,gap=W/N,r=rng(3);
  const cy=H*.62;
  for(let i=0;i<N;i++){
    const hgt=(Math.abs(Math.sin(TAU*u*2+i/2))*160+r()*80)*clamp(prog(t,.2+i*.012,.5));
    c.save();c.fillStyle=F.acc;c.shadowColor=F.acc;c.shadowBlur=22;
    rr(c,i*gap+(gap-bw)/2,cy-hgt/2,bw,Math.max(bw,hgt),bw/2);c.fill();c.restore();
  }
  pop(c,W/2,H*.14,t,.1,()=>logo(c,I,0,0,210,105),{from:.8});
  const hs=Math.min(110,fitSize(c,F.head,900,FM,W*.86,110));
  charRise(c,F.head,W/2,H*.32,hs,900,FM,'#fff',t,.3,.03,50);
  text(c,{s:F.sub,x:W/2,y:H*.42,size:40,wt:700,fill:'rgba(255,255,255,.8)',t,at:.9,maxW:W*.8});
 }},
{id:'highlight',name:'Marker Highlight',sub:CRED_RVE+' — each word gets a marker sweep as it is spoken',
 fields:[{k:'words',l:'Words (space separated)',t:'area',v:'Built for family dinners and lazy Sundays'},{k:'tag',l:'Tag line',t:'text',v:'LEON\'S'},{k:'bg',l:'Background',t:'color',v:'#111827'},{k:'acc',l:'Highlighter',t:'color',v:'#FFE81A'},{k:'on',l:'Text on highlight',t:'color',v:'#111111'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  pop(c,W/2,H*.16,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const words=F.words.split(/\s+/).filter(Boolean),sz=Math.min(92,H*.068),per=.42;
  font(c,900,sz,FM);const sp=c.measureText(' ').width;
  const lines=[];let cur=[],wd=0;
  words.forEach(w=>{const ww=c.measureText(w).width;if(wd+ww>W*.8&&cur.length){lines.push(cur);cur=[];wd=0}cur.push([w,ww]);wd+=ww+sp});
  if(cur.length)lines.push(cur);
  let idx=0;const lh=sz*1.5,y0=H*.48-(lines.length-1)*lh/2;
  lines.forEach((ln,li)=>{
    const tot=ln.reduce((m,q)=>m+q[1],0)+sp*(ln.length-1);let x=W/2-tot/2;
    ln.forEach(q=>{
      const hp=clamp(prog(t,.4+idx*per,per*.5));idx++;
      if(hp>0){c.save();c.fillStyle=F.acc;rr(c,x-12,y0+li*lh-sz*.56,(q[1]+24)*hp,sz*1.12,8);c.fill();c.restore()}
      font(c,900,sz,FM);c.fillStyle=hp>.5?F.on:'#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(q[0],x,y0+li*lh);
      x+=q[1]+sp;
    });
  });
  text(c,{s:F.tag,x:W/2,y:H*.82,size:44,wt:900,fill:F.acc,t,at:.4+idx*per,maxW:W*.8});
 }},
{id:'brush',name:'Brush Stroke Reveal',sub:CRED_RC+' — the title is painted on in horizontal brush bands',
 fields:[{k:'title',l:'Title',t:'text',v:'FRESH LOOK'},{k:'desc',l:'Description',t:'text',v:'New season collections in store now'},{k:'n',l:'Brush bands',t:'text',v:'7'},{k:'bg',l:'Background',t:'color',v:'#FFE81A'},{k:'ink',l:'Title colour',t:'color',v:'#111111'},{k:'acc',l:'Accent dot',t:'color',v:'#E4262C'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const n=Math.max(2,Math.min(20,parseInt(F.n)||7)),sz=Math.min(190,fitSize(c,F.title,900,FM,W*.86,190));
  font(c,900,sz,FM);const tw=c.measureText(F.title).width,cy=H*.44;
  for(let i=0;i<n;i++){
    const p=eEnter(prog(t,.15+i*.055,.5));if(p<=0)continue;
    const y0=cy-sz*.62+i*(sz*1.24/n);
    c.save();c.beginPath();c.rect(W/2-tw/2-10,y0,(tw+20)*p,sz*1.24/n+1);c.clip();
    c.fillStyle=F.ink;c.textAlign='center';c.textBaseline='middle';c.fillText(F.title,W/2,cy);c.restore();
  }
  const dp=eBack(prog(t,.9,.5));
  if(dp>0){c.save();c.translate(W/2,H*.58);c.scale(dp,dp);objDraw(c,'obj:Dot',-22,-22,44,44,()=>{c.fillStyle=F.acc;c.beginPath();c.arc(0,0,22,0,TAU);c.fill()});c.restore()}
  text(c,{s:F.desc,x:W/2,y:H*.68,size:44,wt:700,fill:F.ink,t,at:1.1,maxW:W*.78});
  pop(c,W/2,H*.86,t,1.4,()=>logo(c,I,0,0,200,100),{from:.8});
 }},
{id:'gridwave',name:'Grid Wave',sub:CRED_RC+' — a dot grid breathing in a diagonal wave, seamless loop',
 fields:[{k:'head',l:'Headline',t:'area',v:'Always\nin stock'},{k:'sub',l:'Sub line',t:'text',v:'Over 300,000 products ready to go'},{k:'bg',l:'Background',t:'color',v:'#0A0F1E'},{k:'dot',l:'Dots',t:'color',v:'#334155'},{k:'acc',l:'Peak colour',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const cols=18,rows=Math.round(18*H/W),cw=W/cols,chh=H/rows,maxR=Math.min(cw,chh)*.3,u=TAU*(t/D);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const wv=Math.sin(u+col*.38+row*.48)*.5+.5;
    c.save();c.globalAlpha=.1+wv*.9;c.fillStyle=wv>.7?F.acc:F.dot;
    c.beginPath();c.arc(cw*(col+.5),chh*(row+.5),maxR*(.2+wv*.8),0,TAU);c.fill();c.restore();
  }
  const ls=F.head.split('\n'),sz=Math.min(160,H*.12);
  c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=36;
  ls.forEach((l,i)=>{const s=Math.min(sz,fitSize(c,l,900,FM,W*.84,sz));
    charRise(c,l,W/2,H*.44+(i-(ls.length-1)/2)*sz*1.04,s,900,FM,'#fff',t,.25+i*.28,.03,50)});
  c.restore();
  text(c,{s:F.sub,x:W/2,y:H*.64,size:40,wt:700,fill:'rgba(255,255,255,.8)',t,at:1.1,maxW:W*.8});
  pop(c,W/2,H*.14,t,0,()=>logo(c,I,0,0,210,105),{from:.8});
 }},
{id:'scramble',name:'Scramble Text',sub:CRED_RC+' — characters resolve out of random noise, left to right',
 fields:[{k:'head',l:'Headline',t:'text',v:'SECRET SALE'},{k:'sub',l:'Sub line',t:'text',v:'UNLOCKED FOR MEMBERS'},{k:'cta',l:'Button',t:'text',v:'Shop now'},{k:'bg',l:'Background',t:'color',v:'#0B0B0D'},{k:'acc',l:'Accent',t:'color',v:'#FFE81A'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  c.save();c.globalAlpha=.07;c.strokeStyle=F.acc;c.lineWidth=2;
  for(let y=0;y<H;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}c.restore();
  pop(c,W/2,H*.18,t,.1,()=>logo(c,I,0,0,220,110),{from:.8});
  const fr=Math.floor(t*30);
  const hs=Math.min(140,fitSize(c,F.head,900,FM,W*.88,140));
  font(c,900,hs,FM);c.fillStyle=F.acc;c.textAlign='center';c.textBaseline='middle';
  c.save();c.shadowColor=F.acc;c.shadowBlur=26;c.fillText(scramble(F.head,eEnter(prog(t,.3,1.4)),fr),W/2,H*.44);c.restore();
  font(c,800,52,FM);c.fillStyle='#fff';
  c.fillText(scramble(F.sub,eEnter(prog(t,1.1,1.4)),fr+11),W/2,H*.56);
  pop(c,W/2,H*.74,t,2.3,()=>{
    font(c,800,42,FM);const bw=c.measureText(F.cta).width+96,bh=42*1.9;
    objDraw(c,'obj:Button',-bw/2,-bh/2,bw,bh,()=>pill(c,0,0,F.cta,42,'#fff','#111',48));
  },{from:.7});
 }},
{id:'shatter',name:'Shatter Reveal',sub:CRED_RC+' — fragments fly in and reassemble into the card',
 fields:[{k:'title',l:'Title',t:'text',v:'CLEARANCE'},{k:'sub',l:'Sub line',t:'text',v:'Up to 60% off floor models'},{k:'n',l:'Fragments',t:'text',v:'36'},{k:'bg',l:'Background',t:'color',v:'#0B0B0D'},{k:'tile',l:'Card colour',t:'color',v:'#FFE81A'},{k:'ink',l:'Title colour',t:'color',v:'#111111'},{k:'acc',l:'Accent bar',t:'color',v:'#E4262C'}],
 images:[],
 draw(c,W,H,t,D,F,I){
  c.fillStyle=F.bg;c.fillRect(0,0,W,H);
  const n=Math.max(4,Math.min(80,parseInt(F.n)||36)),cols=6,rows=Math.ceil(n/cols);
  const cwid=W*.8,chh=H*.42,x0=W/2-cwid/2,y0=H*.36-chh/2,fw=cwid/cols,fh=chh/rows;
  const p=eOut(prog(t,.07,1.6)),r=rng(13);
  font(c,900,Math.min(120,fitSize(c,F.title,900,FM,cwid*.86,120)),FM);
  for(let i=0;i<cols*rows;i++){
    const col=i%cols,row=Math.floor(i/cols);
    const ang=r()*TAU, dist=(1-p)*(140+r()*460), rot=(1-p)*(r()-.5)*3;
    const fx2=x0+col*fw, fy=y0+row*fh, cxm=fx2+fw/2, cym=fy+fh/2;
    c.save();c.globalAlpha=clamp(p*2.2);
    c.translate(cxm+Math.cos(ang)*dist,cym+Math.sin(ang)*dist);c.rotate(rot);c.translate(-cxm,-cym);
    c.beginPath();c.rect(fx2,fy,fw+.6,fh+.6);c.clip();
    c.fillStyle=F.tile;c.fillRect(fx2-1,fy-1,fw+2,fh+2);
    c.fillStyle=F.ink;c.textAlign='center';c.textBaseline='middle';c.fillText(F.title,W/2,H*.36);
    c.restore();
  }
  const bs=eBack(prog(t,1.9,.6));
  if(bs>0){c.save();c.translate(W/2,H*.63);c.scale(bs,1);objDraw(c,'obj:Bar',-200,-9,400,18,()=>{c.fillStyle=F.acc;rr(c,-200,-9,400,18,9);c.fill()});c.restore()}
  text(c,{s:F.sub,x:W/2,y:H*.72,size:46,wt:800,fill:'#fff',t,at:2,maxW:W*.8});
  pop(c,W/2,H*.87,t,2.3,()=>logo(c,I,0,0,200,100),{from:.8});
 }}
];
