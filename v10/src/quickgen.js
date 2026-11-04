/* ---------- Quick Generate ----------
   One small form mapped onto a SMALL, deliberately curated set of the
   studio's own templates - only the ones whose fields are a genuinely
   generic "headline + offer + optional sub + optional price" shape, so
   nothing here forces a fixed concept (free delivery, a rewards program,
   a floating price card with a baked-in product name) to wear a headline
   it was never written for. Blank input fields are CLEARED on their
   template (not left at factory defaults), because a left-over default
   is exactly what produced incoherent, overlapping posts before: a
   "100" nobody asked for, a price bar nobody filled in, a second line
   that only made sense paired with different first line.

   Every generated candidate is then measured with the studio's own
   Design-check engine (lintCurrent(), the same one behind the "Design
   check" chip) before it's shown - a candidate with a real overlap,
   margin violation or illegibly small line is dropped rather than
   displayed, so what reaches the grid has already passed the same bar
   as a hand-built post. */

/* Templates whose field schema is concept-neutral enough to auto-fill safely.
   Left out on purpose: ev_appreciation/ev_buymore/ev_newarrivals/ev_delivery
   (their "off" line is a fixed concept - rewards %, spend tiers, "shop the
   collection", "free" - not a generic offer slot) and lcallout (its price
   card has no equivalent field in this simple form, so it would always show
   a stale placeholder product name/price with no clean way to hide it). */
const QG_IDS=['ev_megasale','ev_seasonal','lcircle','lclean'];

const QG_INPUT={headline:'',offer:'',offerSub:'',footerLabel:'',footerPrice:'',photo:null,photoUrl:''};

function qgDefaults(tp){const F={};tp.fields.forEach(f=>F[f.k]=f.v);return F}

function qgMapFields(tp,input){
  const F=qgDefaults(tp);
  const has=k=>k in F;
  const headline=(input.headline||'').trim(), offer=(input.offer||'').trim(),
        offerSub=(input.offerSub||'').trim(), footerLabel=(input.footerLabel||'').trim(),
        footerPrice=(input.footerPrice||'').trim();
  const showPrice=!!footerPrice;

  /* Headline and offer are each template's own hero text and differ per
     template (one factory default is "40% OFF", another is "15% OFF") -
     falling back to "whatever that template happened to ship with" when
     the person left a field blank means four cards can show four
     different, uninvited numbers that look like real data. qgRenderGrid
     refuses to generate anything until both are actually typed, so these
     two lines only ever carry what the person wrote. */
  if(has('head'))F.head=headline;
  if(has('off'))F.off=offer;
  if(has('osub'))F.osub=offerSub; // clear when blank - a factory sub-line was written for the factory offer, not this one
  if(has('flab')&&has('fprice')){F.flab=showPrice?(footerLabel||'STARTING FROM'):'';F.fprice=showPrice?footerPrice:''}
  if(tp.id==='lcircle'){
    /* Leave "num" blank rather than guess a figure from the offer text: lcircle
       splits its masthead band between the number and the headline, so any
       number at all shrinks the headline - and a guessed one (e.g. parsing
       "50" out of "50% off") duplicates the real offer figure for no reason.
       Blank skips that row entirely and gives the headline the full band. */
    F.num='';
    F.pre=''; // "UP TO" was tuned for the factory copy; let the typed offer stand on its own
  }
  if(tp.id==='lclean'){
    F.l1=headline||F.l1;
    F.l2=offerSub; // clear when blank, rather than keep a line written to pair with a different l1
  }
  return F;
}

function qgMapImages(tp,input){
  const I={};
  const photo=input.photo||(typeof SAMPLE_IMG!=='undefined'&&SAMPLE_IMG.complete&&SAMPLE_IMG.naturalWidth?SAMPLE_IMG:null);
  if(photo)tp.images.forEach(s=>{if(s.k==='p')I[s.k]=photo});
  return I;
}

/* Run the studio's own Design-check engine against a candidate without
   disturbing whatever the person currently has open: swap state onto the
   candidate, measure, then restore exactly what was there before any
   frame paints. Returns the error-level issues only (warnings like "photo
   a bit small" are fine during preview and shouldn't hide an otherwise
   good option). */
function qgLintErrors(tp,F,I){
  const savedTid=state.tid,savedVals=state.vals[tp.id],savedImgs=state.imgs[tp.id],
        savedSel=state.sel,savedT=state.t;
  let errors=[];
  try{
    state.tid=tp.id;state.vals[tp.id]=F;state.imgs[tp.id]=I;state.sel=null;state.t=(state.D||6)*.92;
    const res=lintCurrent();
    errors=(res.issues||[]).filter(i=>i.sev==='error');
  }catch(e){ /* if the check itself fails, don't block the candidate on it */ }
  finally{
    state.tid=savedTid;state.vals[tp.id]=savedVals;state.imgs[tp.id]=savedImgs;state.sel=savedSel;state.t=savedT;
  }
  return errors;
}

function qgField(parent,label,key,opts){
  opts=opts||{};
  const wrap=el('label',opts.full?'qg-full':'');wrap.append(el('span','',label));
  const inp=el(opts.area?'textarea':'input');
  if(!opts.area)inp.type='text';
  inp.placeholder=opts.placeholder||'';
  inp.value=QG_INPUT[key]||'';
  inp.addEventListener('input',()=>{QG_INPUT[key]=inp.value;qgRenderGrid()});
  wrap.append(inp);parent.append(wrap);
  return inp;
}

let qgGridEl=null,qgDebounce=null;

function qgRenderGrid(){
  clearTimeout(qgDebounce);
  qgDebounce=setTimeout(()=>{
    if(!qgGridEl)return;
    qgGridEl.innerHTML='';
    if(!QG_INPUT.headline.trim()||!QG_INPUT.offer.trim()){
      qgGridEl.append(el('p','qg-empty','Type both a headline and an offer above — every option needs its own real numbers, never a leftover from the template.'));
      return;
    }
    let shown=0;
    QG_IDS.forEach(id=>{
      const tp=T.find(x=>x.id===id);if(!tp)return;
      const F=qgMapFields(tp,QG_INPUT),I=qgMapImages(tp,QG_INPUT);
      /* lintCurrent()'s role-matching was built for the T_EVENTS field schema
         (see ui.js runCheck, which only shows the Design-check chip for
         tp.id.startsWith('ev_')) and throws a false "offer bigger than
         headline" on lcircle even with its own untouched factory copy - so
         only gate event templates on it; trust the field mapping for the
         other two. */
      if(tp.id.startsWith('ev_')){
        const errors=qgLintErrors(tp,F,I);
        if(errors.length)return; // don't show a layout that fails its own Design check
      }
      shown++;
      const card=el('div','qg-card');
      const cvs=document.createElement('canvas');cvs.width=220;cvs.height=275;
      card.append(cvs);
      card.append(el('div','qg-name',tp.name));
      card.append(el('div','qg-grp',tp.grp));
      const useBtn=el('button','','Use this');useBtn.type='button';
      useBtn.addEventListener('click',()=>qgApply(tp,F,I));
      card.append(useBtn);
      qgGridEl.append(card);
      requestAnimationFrame(()=>previewInto(cvs,tp,F,I));
    });
    if(!shown)qgGridEl.append(el('p','qg-empty','None of the layouts cleanly fit this text yet (too long to fit without overlapping) — try a shorter headline or offer.'));
  },150);
}

function qgApply(tp,F,I){
  state.vals[tp.id]={...F};
  state.imgs[tp.id]={...I};
  selectTemplate(tp.id);
  buildInspector();
  qgClose();
  if(typeof toast==='function')toast('Loaded: '+tp.name+' — keep editing or export.');
}

function qgOpen(){
  const overlay=$('#qgOverlay'),modal=$('#qgModal');if(!overlay||!modal)return;
  modal.innerHTML='';
  const h=el('h2');h.append(el('span','','Quick Generate'));
  const close=el('button','qg-close','×');close.type='button';close.setAttribute('aria-label','Close');
  close.addEventListener('click',qgClose);h.append(close);
  modal.append(h);
  modal.append(el('p','qg-sub','Headline and offer are required — every option shows exactly what you typed, never a leftover number from the template. Only layouts that pass this studio’s own Design check (no overlap, no tiny type) are shown.'));

  const form=el('div','qg-form');
  qgField(form,'Headline (required)','headline',{area:true,placeholder:'MEGA SOFA SALE!',full:true});
  qgField(form,'Offer (required)','offer',{placeholder:'50% OFF or $499'});
  qgField(form,'Offer sub-line (optional)','offerSub',{placeholder:'SELECT FABRIC SOFAS'});
  qgField(form,'Footer label (optional)','footerLabel',{placeholder:'STARTING FROM'});
  qgField(form,'Footer price (optional)','footerPrice',{placeholder:'$599'});

  const photoWrap=el('label','qg-full');photoWrap.append(el('span','','Product photo'));
  const photoRow=el('div','qg-photo');
  const pv=el('div','qg-pv');if(QG_INPUT.photoUrl)pv.style.backgroundImage='url('+QG_INPUT.photoUrl+')';
  const photoBtn=el('button','btn sm','Choose photo');photoBtn.type='button';
  photoBtn.addEventListener('click',()=>pickFile(file=>{
    loadImageFile(file,(im,url)=>{QG_INPUT.photo=im;QG_INPUT.photoUrl=url;pv.style.backgroundImage='url('+url+')';qgRenderGrid()});
  }));
  photoRow.append(pv,photoBtn);photoWrap.append(photoRow);form.append(photoWrap);

  modal.append(form);
  modal.append(el('h3','','Options'));
  qgGridEl=el('div','qg-grid');modal.append(qgGridEl);

  overlay.hidden=false;
  qgRenderGrid();
}

function qgClose(){const overlay=$('#qgOverlay');if(overlay)overlay.hidden=true;qgGridEl=null}

const qgOpenBtn=$('#qgOpenBtn');if(qgOpenBtn)qgOpenBtn.addEventListener('click',qgOpen);
const qgOverlayEl=$('#qgOverlay');if(qgOverlayEl)qgOverlayEl.addEventListener('click',e=>{if(e.target===qgOverlayEl)qgClose()});
addEventListener('keydown',e=>{if(e.key==='Escape'){const o=$('#qgOverlay');if(o&&!o.hidden)qgClose()}});
