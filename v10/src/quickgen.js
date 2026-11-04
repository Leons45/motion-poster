/* ---------- Quick Generate ----------
   One small form (headline, offer, offer sub-line, footer price, product
   photo) mapped onto a curated set of the REAL templates above (T_EVENTS'
   shared sale-post schema plus the three leons.js masthead layouts) and
   rendered with their own tp.draw() via the existing previewInto() thumbnail
   renderer. Nothing here invents new visuals or colours - it only decides
   which of the studio's own, already-on-brand posts to pre-fill and show.
   Picking one just sets state.tid/vals/imgs exactly the way clicking a rail
   item + typing the fields by hand would, so every Leon's-brand guarantee
   (lint, overrides, export) keeps working untouched. */

const QG_IDS=['ev_megasale','ev_appreciation','ev_seasonal','ev_buymore','ev_newarrivals','ev_delivery','lcircle','lclean','lcallout'];

const QG_INPUT={headline:'',offer:'',offerSub:'',footerLabel:'',footerPrice:'',photo:null,photoUrl:''};

function qgDefaults(tp){const F={};tp.fields.forEach(f=>F[f.k]=f.v);return F}

/* Map the 5 plain-English inputs onto one template's actual field keys.
   Blank inputs fall back to the template's own factory copy, so a post
   still looks complete (and still looks like a real Leon's post) even
   before every field is filled in. */
function qgMapFields(tp,input){
  const F=qgDefaults(tp);
  const set=(k,v)=>{if(v&&k in F)F[k]=v};
  if(tp.id.startsWith('ev_')){
    set('head',input.headline);set('off',input.offer);set('osub',input.offerSub);
    set('flab',input.footerLabel);set('fprice',input.footerPrice);
  }else if(tp.id==='lcircle'){
    set('head',input.headline);set('off',input.offer);set('osub',input.offerSub);
    set('flab',input.footerLabel);set('fprice',input.footerPrice);
  }else if(tp.id==='lclean'){
    set('off',input.offer);set('l1',input.headline);set('l2',input.offerSub);
  }else if(tp.id==='lcallout'){
    set('head',input.headline);set('off',input.offer);set('osub',input.offerSub);
    set('ctitle',input.footerPrice);
  }
  return F;
}

function qgMapImages(tp,input){
  const I={};
  const photo=input.photo||(SAMPLE_IMG&&SAMPLE_IMG.complete&&SAMPLE_IMG.naturalWidth?SAMPLE_IMG:null);
  if(photo)tp.images.forEach(s=>{if(s.k==='p')I[s.k]=photo});
  return I;
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
    if(!QG_INPUT.headline&&!QG_INPUT.offer){
      qgGridEl.append(el('p','qg-empty','Type a headline or offer above to see your options — they update live.'));
      return;
    }
    QG_IDS.forEach(id=>{
      const tp=T.find(x=>x.id===id);if(!tp)return;
      const F=qgMapFields(tp,QG_INPUT),I=qgMapImages(tp,QG_INPUT);
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
  modal.append(el('p','qg-sub','Fill these in once — get several real Leon\'s-brand post options back instantly, built from the templates in this studio.'));

  const form=el('div','qg-form');
  qgField(form,'Headline','headline',{area:true,placeholder:'MEGA SOFA SALE!',full:true});
  qgField(form,'Offer','offer',{placeholder:'50% OFF or $499'});
  qgField(form,'Offer sub-line','offerSub',{placeholder:'SELECT FABRIC SOFAS'});
  qgField(form,'Footer label','footerLabel',{placeholder:'STARTING FROM'});
  qgField(form,'Footer price','footerPrice',{placeholder:'$599'});

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
