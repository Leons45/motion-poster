/* ---------- Quick Generate ----------
   One small form mapped onto a SMALL, deliberately curated set of
   layouts - not templates. Early versions picked four different
   TEMPLATES (ev_megasale, ev_seasonal, lcircle, lclean) and kept
   whatever photo zone each one happened to ship with. That was the
   actual cause of the "0% design knowledge" complaint: lcircle and
   lclean each reserve a small, FIXED-size photo box sized for a dense,
   fully-filled post, and when Quick Generate's minimal 2-field input
   leaves everything else blank, that box just sits there as dead
   space - no amount of clearing stale text fixes a layout whose empty
   space isn't content-driven to begin with.

   The studio's own event-post engine already solves exactly this: every
   ev_* template can render through any of its 12 shared LAYOUTS
   (events.js), and two of them - 'fullbleed' and 'badge' - use the
   product photo as a full-canvas cover-fit BACKGROUND rather than a
   box floating in empty space, with every text block individually
   gated on having real content (see layoutFullbleed/layoutBadge: each
   line only takes space if its field is non-empty). A photo that
   covers 100% of the canvas can't leave dead space, and a headline
   stack that collapses around whatever's actually filled in can't
   show stale leftovers either. So instead of 4 templates, Quick
   Generate now offers 4 LAYOUT VARIANTS across the two event templates
   whose "off" line is a genuinely generic offer slot.

   Blank input fields are still CLEARED on their template (not left at
   factory defaults) for the same reason as before: a left-over default
   is what produced incoherent, overlapping posts and fabricated-looking
   numbers. Every candidate is then measured with the studio's own
   Design-check engine (lintCurrent()) before it's shown - a candidate
   with a real overlap, margin violation or illegibly small line is
   dropped rather than displayed. */

/* Event templates whose field schema is concept-neutral (a real "offer"
   slot, not a fixed concept like rewards-% or free-delivery), each paired
   with the two full-bleed-photo layouts. Left out on purpose: lcircle/
   lclean (fixed small photo zone - see above), ev_appreciation/ev_buymore/
   ev_newarrivals/ev_delivery (fixed-concept offer line) and lcallout (its
   price card has no equivalent field in this simple form). */
const QG_VARIANTS=[
  {id:'ev_megasale',layout:'fullbleed',label:'Full-bleed photo'},
  {id:'ev_megasale',layout:'badge',label:'Circle badge'},
  {id:'ev_seasonal',layout:'fullbleed',label:'Full-bleed photo'},
  {id:'ev_seasonal',layout:'badge',label:'Circle badge'}
];

const QG_INPUT={headline:'',offer:'',offerSub:'',footerLabel:'',footerPrice:'',photo:null,photoUrl:''};

function qgDefaults(tp){const F={};tp.fields.forEach(f=>F[f.k]=f.v);return F}

function qgMapFields(tp,input,layout){
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
  if(has('num'))F.num=''; // only circle/split/poster read this - irrelevant to fullbleed/badge, but clear it so switching layout later never surfaces a stray number
  /* Switch to one of the two full-bleed-photo layouts: the product photo
     covers the whole canvas as a background (drawImg ... fit:'cover' over
     0,0,W,H) instead of sitting in a small fixed box, and every text block
     is gated on its own field being non-empty (if(kb.h)/if(sb.h)/if(hasP)
     etc. in layoutFullbleed/layoutBadge) - so a sparse 2-field input still
     renders as a full, intentional-looking photo poster instead of empty
     yellow space around a small floating image. */
  if(layout&&has('layout'))F.layout=layout;
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
    QG_VARIANTS.forEach(variant=>{
      const tp=T.find(x=>x.id===variant.id);if(!tp)return;
      const F=qgMapFields(tp,QG_INPUT,variant.layout),I=qgMapImages(tp,QG_INPUT);
      // every candidate here is an ev_* template, so always run it past the
      // studio's own Design-check engine before showing it
      const errors=qgLintErrors(tp,F,I);
      if(errors.length)return; // don't show a layout that fails its own Design check
      shown++;
      const card=el('div','qg-card');
      const cvs=document.createElement('canvas');cvs.width=220;cvs.height=275;
      card.append(cvs);
      card.append(el('div','qg-name',tp.name));
      card.append(el('div','qg-grp',variant.label));
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
