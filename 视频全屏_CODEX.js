(() => {
 'use strict';
 const mobile=document.documentElement.dataset.mobileReport==='true';
 const records=new Map();let owner=null,transition=false,exitTask=null;
 const root=document.documentElement;
 const notify=(active,anchor)=>window.dispatchEvent(new CustomEvent('report:fullscreenchange',{detail:{active,anchor}}));
 const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 let viewportFrame=0;
 // Keep the exit control inside the visible viewport after browser toolbar changes or zoom.
 function fitViewport(){
  viewportFrame=0;if(owner?.mode!=='viewport'||transition)return;
  const view=window.visualViewport,style=owner.record.frame.style;
  for(const [key,value] of Object.entries({left:view?.offsetLeft||0,top:view?.offsetTop||0,width:view?.width||innerWidth,height:view?.height||innerHeight}))
   style.setProperty('--media-view-'+key,value+'px');
 }
 function queueViewport(){if(!viewportFrame)viewportFrame=requestAnimationFrame(fitViewport);}
 window.visualViewport?.addEventListener('resize',queueViewport);
 window.visualViewport?.addEventListener('scroll',queueViewport);
 window.addEventListener('resize',queueViewport);
 function acquire(record,mode){
  if(owner?.record===record)return;
  const slide=record.video.closest('[data-slide-id]');
  const header=document.querySelector('.site-header')?.getBoundingClientRect().height||0;
  owner={record,mode,key:slide.dataset.slideId,slide,minHeight:slide.style.minHeight,
   focus:document.activeElement,anchor:{key:slide.dataset.slideId,offset:Math.max(-header,-slide.getBoundingClientRect().top)}};
  slide.style.minHeight=slide.getBoundingClientRect().height+'px';
  root.classList.add('report-media-fullscreen');notify(true,owner.anchor);
 }
 function current(){
  const full=document.fullscreenElement||document.webkitFullscreenElement;
  return [...records.values()].find(r=>(full&&(full===r.frame||full===r.video))||r.video.webkitDisplayingFullscreen);
 }
 function releaseNative(){
  if(!owner)return;
  if(mobile){restoreMobile();return;}
  const previous=owner;owner=null;transition=false;previous.slide.style.minHeight=previous.minHeight;
  root.classList.remove('report-media-fullscreen');notify(false,previous.anchor);
 }
 function changed(){
  const record=current();
  if(record){transition=false;acquire(record,'native');}
  else if(owner?.mode==='native'&&!transition)releaseNative();
 }
 function render(record){
  const {video,pause,sound}=record;
  if(pause){pause.textContent=video.paused?'播放 / PLAY':'暂停 / PAUSE';pause.setAttribute('aria-label',pause.textContent);}
  if(sound){sound.textContent=video.muted?'开启声音 / SOUND ON':'关闭声音 / SOUND OFF';sound.setAttribute('aria-pressed',String(!video.muted));}
 }
 function register(frame,video){
  const record={frame,video};records.set(video,record);
  const back=document.createElement('button');back.type='button';back.className='media-exit';back.dataset.mediaExit='';
  back.innerHTML='<span aria-hidden="true">↙</span><span>返回汇报<small lang="en">EXIT FULL SCREEN</small></span>';
  back.setAttribute('aria-label','退出全屏，返回本章节 / Exit full screen and return to this chapter');
  back.addEventListener('click',event=>{event.stopPropagation();exit();});frame.append(back);record.back=back;
  const chapter=video.closest('[data-slide-id]');
  if(!chapter.hasAttribute('data-scene-room')){
   const tray=document.createElement('div');tray.className='media-fullscreen-tools';
   const pause=document.createElement('button'),sound=document.createElement('button');pause.type=sound.type='button';
   record.pause=pause;record.sound=sound;
   pause.addEventListener('click',()=>chapter.querySelector('[data-film-toggle],[data-letter-toggle]').click());
   sound.addEventListener('click',()=>chapter.querySelector('[data-film-sound],[data-letter-sound]').click());
   tray.append(pause,sound);frame.append(tray);
   for(const type of ['play','pause','volumechange','ended'])video.addEventListener(type,()=>render(record));render(record);
  }
  if(mobile){video.controlsList?.add('nofullscreen');video.setAttribute('webkit-playsinline','');}
  video.addEventListener('webkitbeginfullscreen',()=>{transition=false;acquire(record,'native');});
  video.addEventListener('webkitendfullscreen',()=>{transition=false;releaseNative();});
 }
 function enterMobile(record){
  acquire(record,'viewport');const {frame}=record,box=frame.getBoundingClientRect(),style=getComputedStyle(frame);
  const placeholder=document.createElement('div');placeholder.className='media-flow-placeholder';placeholder.setAttribute('aria-hidden','true');
  Object.assign(placeholder.style,{height:box.height+'px',minHeight:box.height+'px',width:'100%',
   gridArea:style.gridArea,flex:style.flex,margin:style.margin});
  frame.before(placeholder);owner.placeholder=placeholder;owner.ancestors=[];
  for(let node=frame.parentElement;node&&node!==document.body;node=node.parentElement){node.classList.add('media-fullscreen-ancestor');owner.ancestors.push(node);}
  root.classList.add('report-viewport-active');frame.classList.add('report-viewport-fullscreen');
  fitViewport();record.back.focus({preventScroll:true});queueViewport();render(record);return true;
 }
 async function restoreMobile(){
  if(exitTask)return exitTask;if(!owner)return true;
  const previous=owner;transition=true;
  exitTask=(async()=>{
   const {frame}=previous.record;
   frame.classList.remove('report-viewport-fullscreen');
   for(const key of ['left','top','width','height'])frame.style.removeProperty('--media-view-'+key);
   previous.placeholder?.remove();
   for(const node of previous.ancestors||[])node.classList.remove('media-fullscreen-ancestor');
   previous.slide.style.minHeight=previous.minHeight;
   // Keep chapter detection pinned until orientation/toolbar resize and focus settle.
   notify(false,previous.anchor);await nextFrame();await nextFrame();
   await new Promise(resolve=>setTimeout(resolve,220));
   if(previous.focus?.isConnected)previous.focus.focus({preventScroll:true});
   root.classList.remove('report-viewport-active','report-media-fullscreen');
   owner=null;transition=false;notify(false,previous.anchor);await nextFrame();return true;
  })().finally(()=>{exitTask=null;});
  return exitTask;
 }
 async function exit(){
  if(!owner)return false;
  if(owner.mode==='viewport')return restoreMobile();
  if(document.fullscreenElement)await document.exitFullscreen();
  else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();
  else if(owner.record.video.webkitDisplayingFullscreen&&owner.record.video.webkitExitFullscreen)owner.record.video.webkitExitFullscreen();
  else releaseNative();
  return true;
 }
 async function toggle(frame,video){
  const record=records.get(video);if(!record||transition)return false;
  if(owner)return exit();
  if(mobile)return enterMobile(record);
  const wasPlaying=!video.paused&&!video.ended;transition=true;acquire(record,'native');
  try{
   let entered=false;
   if(frame.requestFullscreen){try{await frame.requestFullscreen();entered=true;}catch{}}
   if(!entered&&typeof video.webkitEnterFullscreen==='function'){video.webkitEnterFullscreen();entered=true;}
   if(!entered){transition=false;releaseNative();return false;}
   transition=false;if(wasPlaying&&video.paused&&!document.hidden)video.play().catch(()=>{});
   setTimeout(changed,200);return true;
  }catch{transition=false;releaseNative();return false;}
 }
 for(const video of document.querySelectorAll('[data-scene-room] video,#film10 video,.letter-chapter video')){
  const frame=video.closest('.scene-motion-frame,.film-screen,.letter-screen');if(frame)register(frame,video);
 }
 document.addEventListener('fullscreenchange',changed);document.addEventListener('webkitfullscreenchange',changed);
 document.addEventListener('keydown',event=>{if(mobile&&owner&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();exit();}},true);
 // Native page scrolling must never move a chapter under its viewport player.
 document.addEventListener('touchmove',event=>{if(mobile&&owner&&!event.target.closest('video,input'))event.preventDefault();},{passive:false});
 window.REPORT_FULLSCREEN={toggle,exit,active:()=>!!owner,owns:video=>owner?.record.video===video,chapter:()=>owner?.key||null,
  inspect:()=>({active:!!owner,key:owner?.key||null,transition,native:!!current(),mode:owner?.mode||null,mobile})};
})();
