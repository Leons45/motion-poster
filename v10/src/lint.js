/* ---------- Design check (linter) ----------
   Renders the current post once with the canvas calls recorded, then measures what was ACTUALLY drawn:
   text size vs. the canvas, margins, overlaps, type hierarchy and product-photo size. The same checks
   run in the app (Design check chip) and in the regression sweep, so a layout that ships is a layout
   that passes. All thresholds are fractions of the canvas width W, so they hold at 4:5, 1:1 and 9:16. */
const LINT={minText:.024,minHead:.072,minPhotoArea:.13,minPhotoW:.46,marginTol:.55,overlap:.12};
function lintCapture(){
  const rec={texts:[],imgs:[],objs:[]},ft=ctx.fillText,di=ctx.drawImage,od=objDraw,SOLID=/Price card|Corner badge|Canada|Seal/;
  objDraw=function(c,key,x,y,w,h,fn){try{if(SOLID.test(key)){const tr=ctx.getTransform();rec.objs.push({key,x0:tr.a*x+tr.e,y0:tr.d*y+tr.f,x1:tr.a*(x+w)+tr.e,y1:tr.d*(y+h)+tr.f})}}catch(e){}return od.apply(this,arguments)};
  ctx.fillText=function(s,x,y,mw){
    try{
      const m=/(\d+(?:\.\d+)?)px/.exec(this.font),tr=this.getTransform(),sc=Math.hypot(tr.a,tr.b),size=(m?+m[1]:16)*sc;
      if(this.globalAlpha>.35&&String(s).trim()){
        let w=this.measureText(String(s)).width;if(mw&&w>mw)w=mw;w*=sc;
        const al=this.textAlign,bl=this.textBaseline,px=tr.a*x+tr.c*y+tr.e,py=tr.b*x+tr.d*y+tr.f;
        const x0=al==='center'?px-w/2:(al==='right'||al==='end')?px-w:px;
        const cap=size*.72,y0=bl==='middle'?py-cap/2:bl==='top'?py:bl==='bottom'?py-cap:py-cap;
        rec.texts.push({s:String(s),size,x0,x1:x0+w,y0,y1:y0+cap,fill:this.fillStyle});
      }
    }catch(e){}
    return ft.apply(this,arguments);
  };
  ctx.drawImage=function(im){
    try{
      const a=arguments,tr=this.getTransform();let dx,dy,dw,dh;
      if(a.length===3){dx=a[1];dy=a[2];dw=im.width;dh=im.height}else if(a.length===5){dx=a[1];dy=a[2];dw=a[3];dh=a[4]}else{dx=a[5];dy=a[6];dw=a[7];dh=a[8]}
      const sc=Math.hypot(tr.a,tr.b);rec.imgs.push({im,x:tr.a*dx+tr.e,y:tr.d*dy+tr.f,w:dw*sc,h:dh*Math.hypot(tr.c,tr.d),small:(a.length===3?im.width:a.length===5?dw:a[7])<=0});
    }catch(e){}
    return di.apply(this,arguments);
  };
  return {rec,done(){ctx.fillText=ft;ctx.drawImage=di;objDraw=od}};
}
function lintCurrent(){
  const tp=cur();if(tp.free||!state.vals[tp.id])return {issues:[],stats:{}};
  const H=Hnow(),F=state.vals[tp.id],cap=lintCapture();
  try{render()}finally{cap.done()}
  const T=cap.rec.texts,issues=[],M=evM(W),add=(sev,code,msg,fix)=>issues.push({sev,code,msg,fix:fix||null});
  const lines=v=>String(v==null?'':v).split('\n').map(x=>x.trim().toUpperCase()).filter(Boolean);
  const role=s=>{const u=s.trim().toUpperCase();
    if(lines(F.head).includes(u))return 'head';if(lines(F.off).includes(u)||u===lines(F.pre)[0]&&false)return 'off';
    if(lines(F.osub).includes(u))return 'sub';if(lines(F.kicker).includes(u))return 'kicker';
    if(F.num&&u===String(F.num).toUpperCase())return 'num';if(u===String(F.fprice||'').toUpperCase())return 'price';return 'other'};
  T.forEach(t=>t.role=role(t.s));
  const by=r=>T.filter(t=>t.role===r),mx=a=>a.length?Math.max(...a.map(t=>t.size)):0,mn=a=>a.length?Math.min(...a.map(t=>t.size)):0;
  const hs=mn(by('head')),os=mn(by('off')),ss=mn(by('sub')),ks=mn(by('kicker'));
  /* size */
  T.forEach(t=>{if(t.size<W*LINT.minText&&t.role!=='other')add('error','tiny','"'+t.s+'" is only '+Math.round(t.size)+'px - too small to read on a phone',{k:t.role})});
  if(by('head').length&&by('head').length<=2&&hs<W*LINT.minHead)add('warn','head-small','Headline is small ('+Math.round(hs)+'px) - the event name should lead',{k:'head'});
  /* hierarchy */
  if(hs&&os&&os>hs*1.02)add('error','rank-offer','Offer is bigger than the headline - the headline should lead',{k:'off'});
  if(os&&ss&&ss>os*.9)add('warn','rank-sub','Offer sub line is nearly as big as the offer',{k:'sub'});
  if(ss&&ks&&ks>ss*1.02)add('warn','rank-kicker','Eyebrow is bigger than the sub line',{k:'kicker'});
  if(F.num&&by('num').length&&hs&&mx(by('num'))<hs*.9&&0)add('warn','rank-num','Big number is smaller than the headline');
  /* margins */
  T.forEach(t=>{if(t.role==='other')return;if(t.x0<M*LINT.marginTol||t.x1>W-M*LINT.marginTol||t.y0<M*LINT.marginTol*.7||t.y1>H-M*LINT.marginTol*.7)add('error','margin','"'+t.s+'" is too close to the edge',{k:t.role})});
  /* overlaps between different text items */
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){
    const a=T[i],b=T[j];if(a.s===b.s)continue;
    const ix=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),iy=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);
    if(ix>2&&iy>2){const ar=ix*iy/Math.min((a.x1-a.x0)*(a.y1-a.y0),(b.x1-b.x0)*(b.y1-b.y0));if(ar>LINT.overlap)add('error','overlap','"'+a.s+'" overlaps "'+b.s+'"',{k:a.role})}
  }
  /* text colliding with a badge / price card it does not belong to (text fully inside the object is fine) */
  T.forEach(t=>cap.rec.objs.forEach(o=>{
    const ix=Math.min(t.x1,o.x1)-Math.max(t.x0,o.x0),iy=Math.min(t.y1,o.y1)-Math.max(t.y0,o.y0);
    if(ix>2&&iy>2){const ta=(t.x1-t.x0)*(t.y1-t.y0),inter=ix*iy,inside=inter>=ta*.97;if(!inside&&inter>ta*.1)add('error','overlap','"'+t.s+'" runs into the '+o.key.replace('obj:','').toLowerCase(),{k:t.role})}
  }));
  /* story (9:16): keep copy out of the app's own top/bottom UI */
  if(H>W*1.6)T.forEach(t=>{if(t.role==='other')return;if(t.y0<H*.1||t.y1>H*.92)add('warn','story-zone','"'+t.s+'" sits where Instagram/TikTok overlay their own buttons',{k:t.role})});
  /* product photo size */
  const ph=cap.rec.imgs.filter(i=>i.im&&i.im!==BRAND.logo&&i.w>W*.2&&i.h>W*.2).sort((a,b)=>b.w*b.h-a.w*a.h)[0];
  if(ph){const area=ph.w*ph.h/(W*H);
    if(area<LINT.minPhotoArea&&ph.w<W*LINT.minPhotoW)add('warn','photo-small','Product photo is small ('+Math.round(area*100)+'% of the post) - give the product more room',{k:'photo'})}
  const ink=T.filter(t=>t.role!=='other'&&t.y1>0&&t.y0<H);
  const used=ink.length?{top:Math.min(...ink.map(t=>t.y0)),bot:Math.max(...ink.map(t=>t.y1))}:{top:0,bot:H};
  return {issues,stats:{hs,os,ss,ks,photo:ph?ph.w*ph.h/(W*H):null,texts:T.length,used}};
}
