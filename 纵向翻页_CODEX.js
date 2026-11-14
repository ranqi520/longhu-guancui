(() => {
 'use strict';
 const slides=[...document.querySelectorAll('[data-slide-id]')], frame=document.querySelector('#report-model');
 const plans=[...document.querySelectorAll('[data-plan-chapter]')],embeds=[frame,...plans],modelLayer=document.querySelector('.model-layer');
 const heavySlides=slides.filter(slide=>['02','10'].includes(slide.dataset.modelChapter));
 let metrics={header:88,footer:42,tops:[]},placedChapter='02',lastModelState='',scrolling=false,scrollTimer;
 const planStates=new Map();
 const nav=[...document.querySelectorAll('[data-slide]')], desktop=matchMedia('(min-width: 901px)'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const chapterNames={cover:'序章 / PROLOGUE',model02:'空间全景 / SPATIAL OVERVIEW',analysis04:'空间序列 / SPATIAL SEQUENCE',analysis05:'光风协同 / DAYLIGHT & AIRFLOW',lighting10:'夜境光序 / LAYERED LIGHTING',scenes06:'虚实映境 / SPACES IN MOTION',materials07:'材色共鸣 / MATERIAL & COLOUR',furnishings08:'软装叙事 / FURNISHING NARRATIVE',details09:'细境入微 / THE ART OF DETAIL',film10:'归境成诗 / THE POETRY OF HOME',closing:'致居者 / A NOTE TO THE RESIDENTS'};
 const previous=document.querySelector('#previous-slide'), next=document.querySelector('#next-slide');
 const nightAmbience=window.createNightAmbience({frame});
 let active=-1, scheduled=false, ready=false, lastWheel=0, consumed=false, wheelSum=0, lockedUntil=0, interacting=false;
 const headerHeight=()=>metrics.header;
 const isDialogOpen=()=>!!document.querySelector('dialog[open]')||embeds.some(embed=>!!embed.contentDocument?.querySelector('dialog[open]'));
 function post(data){frame.contentWindow?.postMessage({source:'qianmu-report',...data},location.origin)}
 function ensureModel(){if(!frame.getAttribute('src'))frame.src=frame.dataset.src;}
 function syncModel(force=false){
  const top=scrollY+metrics.header,bottom=scrollY+innerHeight-metrics.footer;
  const visible=heavySlides.find(slide=>{const y=metrics.tops[slides.indexOf(slide)];return y<bottom-1&&y+slide.offsetHeight>top+1;});
  if(visible){
   ensureModel();const chapter=visible.dataset.modelChapter;
   if(chapter!==placedChapter){placedChapter=chapter;modelLayer.style.top=(metrics.tops[slides.indexOf(visible)]-metrics.tops[slides.indexOf(heavySlides[0])])+'px';}
  }
  const isActive=!!visible&&!document.hidden&&!scrolling,signature=placedChapter+':'+isActive;
  if(force||signature!==lastModelState){lastModelState=signature;post({type:'present',chapter:placedChapter,active:isActive});}
  for(const embed of plans){const on=slides[active]?.dataset.modelChapter===embed.dataset.planChapter&&!document.hidden;if(force||planStates.get(embed)!==on){planStates.set(embed,on);embed.contentWindow?.postMessage({source:'qianmu-report',type:'present',active:on},location.origin);}}
 }
 function stopInteractions(){for(const embed of embeds)embed.contentWindow?.postMessage({source:'qianmu-report',type:'interaction',enabled:false},location.origin);interacting=false;}
 function activate(index){
  if(index===active||!slides[index])return;
  active=index;interacting=false;document.body.classList.remove('model-interacting');
  const key=slides[index].dataset.slideId,navKey=slides[index].dataset.navId||key;document.body.dataset.activeSlide=key;nightAmbience.setActive(key==='lighting10');
  document.body.classList.toggle('is-closing',key==='closing');
  for(const button of nav){const selected=button.dataset.slide===navKey;button.classList.toggle('is-active',selected);if(selected)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}
  const activeNav=nav.find(button=>button.dataset.slide===navKey),navRail=activeNav?.parentElement;if(navRail&&navRail.scrollWidth>navRail.clientWidth)navRail.scrollTo({left:activeNav.offsetLeft-navRail.offsetLeft-(navRail.clientWidth-activeNav.offsetWidth)/2,behavior:'instant'});
  document.querySelector('#page-number').textContent=slides[index].dataset.reportNumber||String(index+1).padStart(2,'0');previous.disabled=index===0;next.disabled=index===slides.length-1;
  document.querySelector('#chapter-announcement').textContent=chapterNames[navKey]||slides[index].getAttribute('aria-label')||navKey;
  const hint=document.querySelector('#scroll-guidance');hint.innerHTML=index===slides.length-1?'向上滚动 · 重温空间<small lang="en">SCROLL UP TO REVISIT</small>':'向下滚动 · 继续阅览<small lang="en">SCROLL TO CONTINUE</small>';
  const color=(key.startsWith('scenes06')||key.startsWith('materials07')||key.startsWith('furnishings08')||key.startsWith('details09')||key==='film10')?getComputedStyle(document.body).getPropertyValue('--paper').trim():key==='model02'?'#9e7867':key==='lighting10'?'#9e7867':key.startsWith('analysis')?'#9e7867':key==='closing'?'#000000':'#9e7867';
  document.querySelector('meta[name="theme-color"]').content=color;
  if(location.hash!=='#'+key)history.replaceState(null,'','#'+key);
  syncModel();
  window.dispatchEvent(new CustomEvent('report:slidechange',{detail:{key,navKey,index}}));
 }
 function updateActive(){
  scheduled=false;const probe=scrollY+headerHeight()+Math.min((innerHeight-headerHeight())*.4,300);
  let index=metrics.tops.findLastIndex(top=>top<=probe);
  if(index<0)index=0;activate(index);syncModel();
 }
 function go(key,{instant=false,focus=false}={}){
  const index=slides.findIndex(slide=>slide.dataset.slideId===key);if(index<0)return;
  stopInteractions();if(['02','10'].includes(slides[index].dataset.modelChapter))ensureModel();
  const top=Math.max(0,metrics.tops[index]-headerHeight());
  window.scrollTo({top,behavior:instant||reduced.matches?'instant':'smooth'});
  if(instant)activate(index);
  if(focus)document.querySelector('#main-content').focus({preventScroll:true});
 }
 function move(direction){go(slides[Math.max(0,Math.min(slides.length-1,active+direction))].dataset.slideId);}
 function wheel(delta,time=performance.now()){
  if(isDialogOpen()||interacting)return;
  if(!desktop.matches){window.scrollBy({top:delta,behavior:'instant'});return;}
  const gap=time-lastWheel;lastWheel=time;if(gap>180){consumed=false;wheelSum=0;}
  if(consumed||time<lockedUntil)return;
  wheelSum+=delta;if(Math.abs(wheelSum)<28)return;
  consumed=true;lockedUntil=time+850;move(Math.sign(wheelSum));
 }
 function keyboard(key){if(isDialogOpen())return false;if((slides[active]?.dataset.sceneRoom||slides[active]?.hasAttribute('data-native-scroll'))&&['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(key))return false;const direction={ArrowDown:1,PageDown:1,' ':1,ArrowUp:-1,PageUp:-1}[key];if(direction){move(direction);return true;}if(key==='Home'){go('cover');return true;}if(key==='End'){go('closing');return true;}return false;}
 nav.forEach(button=>button.addEventListener('click',event=>{event.preventDefault();go(button.dataset.slide,{focus:true})}));
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 window.addEventListener('scroll',()=>{scrolling=true;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;syncModel();},160);if(!scheduled){scheduled=true;requestAnimationFrame(updateActive)}},{passive:true});
 document.addEventListener('visibilitychange',()=>syncModel());
 window.addEventListener('wheel',event=>{if(!desktop.matches||event.ctrlKey||isDialogOpen()||slides[active]?.dataset.sceneRoom||slides[active]?.hasAttribute('data-native-scroll')||event.target.closest('dialog,[data-native-scroll]'))return;event.preventDefault();wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));},{passive:false});
 window.addEventListener('keydown',event=>{if(event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"],dialog'))return;if(event.key===' '&&event.target.closest('button,a'))return;if(keyboard(event.key))event.preventDefault();});
 window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin)return;
  const embed=embeds.find(item=>item.contentWindow===event.source);
  if(!embed||event.data?.source!==(embed===frame?'qianmu-model':'qianmu-plan'))return;
  const data=event.data;
  if(data.type==='mounted')syncModel(true);
  else if(data.type==='ready'){if(embed===frame){ready=true;document.querySelector('#model-wait').hidden=true;}syncModel(true);}
  else if(data.type==='wheel'&&Number.isFinite(data.delta))wheel(data.delta);
  else if(data.type==='touch-scroll'&&!interacting&&!isDialogOpen()&&Number.isFinite(data.delta))window.scrollBy({top:data.delta,behavior:'instant'});
  else if(data.type==='key')keyboard(data.key);
  else if(data.type==='interaction'&&(embed===frame?slides[active]?.dataset.modelChapter===placedChapter:slides[active]?.dataset.modelChapter===embed.dataset.planChapter)){interacting=!!data.enabled;document.body.classList.toggle('model-interacting',interacting);}
 });
 for(const embed of embeds)embed.addEventListener('load',()=>syncModel(true));
 function measure(){metrics.header=document.querySelector('.site-header').getBoundingClientRect().height;metrics.footer=document.querySelector('.site-footer').getBoundingClientRect().height;const compactLandscape=document.documentElement.dataset.mobileReport==='true'&&innerWidth>innerHeight&&innerHeight<=600;const height=Math.max(compactLandscape?170:desktop.matches?520:450,innerHeight-metrics.header-metrics.footer);document.documentElement.style.setProperty('--slide-height',height+'px');metrics.tops=slides.map(slide=>scrollY+slide.getBoundingClientRect().top);modelLayer.style.top=(metrics.tops[slides.findIndex(slide=>slide.dataset.modelChapter===placedChapter)]-metrics.tops[slides.indexOf(heavySlides[0])])+'px';}
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const key=slides[Math.max(active,0)].dataset.slideId;measure();go(key,{instant:true})},150)});
 window.VERTICAL_REPORT={go,ambience:nightAmbience,inspect:()=>({active:slides[active]?.dataset.slideId,index:active,slides:slides.map(s=>s.dataset.slideId),ready,interacting,scrolling,modelChapter:placedChapter,modelLoaded:!!frame.getAttribute('src'),planFrames:plans.length,desktop:desktop.matches})};
 window.addEventListener('pageshow',event=>{if(event.persisted){measure();go('cover',{instant:true});}});
 measure();requestAnimationFrame(()=>go('cover',{instant:true}));
})();