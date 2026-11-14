(() => {
 'use strict';
 // Pin the presenting chapter while a native media surface changes the viewport.
 let owner=null,transition=false;
 const records=new Map();
 function notify(active,anchor){window.dispatchEvent(new CustomEvent('report:fullscreenchange',{detail:{active,anchor}}));}
 function acquire(record){
  if(owner?.record===record)return;
  const slide=record.video.closest('[data-slide-id]');
  owner={record,key:slide.dataset.slideId,slide,minHeight:slide.style.minHeight,anchor:{key:slide.dataset.slideId,offset:-slide.getBoundingClientRect().top}};
  // Fullscreen content leaves normal flow; keep its chapter's geometry in place.
  slide.style.minHeight=slide.getBoundingClientRect().height+'px';
  document.documentElement.classList.add('report-media-fullscreen');notify(true,owner.anchor);
 }
 function release(){
  if(!owner)return;
  const previous=owner;owner=null;transition=false;
  previous.slide.style.minHeight=previous.minHeight;
  document.documentElement.classList.remove('report-media-fullscreen');notify(false,previous.anchor);
 }
 function current(){
  const full=document.fullscreenElement||document.webkitFullscreenElement;
  return [...records.values()].find(r=>(full&&(full===r.frame||full===r.video))||r.video.webkitDisplayingFullscreen);
 }
 function changed(){const record=current();if(record){transition=false;acquire(record);}else if(!transition)release();}
 function register(frame,video){
  if(records.has(video))return;
  const record={frame,video};records.set(video,record);
  video.addEventListener('webkitbeginfullscreen',()=>{transition=false;acquire(record);});
  video.addEventListener('webkitendfullscreen',()=>{transition=false;release();});
 }
 async function toggle(frame,video){
  const record=records.get(video);if(!record)return false;
  if(owner&&current()){
   if(document.fullscreenElement)await document.exitFullscreen();
   else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();
   else if(typeof video.webkitExitFullscreen==='function')video.webkitExitFullscreen();
   return true;
  }
  const wasPlaying=!video.paused&&!video.ended;
  transition=true;acquire(record);
  try{
   let entered=false;
   if(frame.requestFullscreen){try{await frame.requestFullscreen();entered=true;}catch{}}
   if(!entered&&typeof video.webkitEnterFullscreen==='function'){video.webkitEnterFullscreen();entered=true;}
   if(!entered){transition=false;release();return false;}
   transition=false;
   // Some native players pause during handover; resume only an already-playing clip.
   if(wasPlaying&&video.paused&&!document.hidden)video.play().catch(()=>{});
   setTimeout(changed,200);
   return true;
  }catch{transition=false;release();return false;}
 }
 for(const video of document.querySelectorAll('[data-scene-room] video,#film10 video,.letter-chapter video')){
  const frame=video.closest('.scene-motion-frame,.film-screen,.letter-screen');if(frame)register(frame,video);
 }
 document.addEventListener('fullscreenchange',changed);
 document.addEventListener('webkitfullscreenchange',changed);
 window.REPORT_FULLSCREEN={toggle,active:()=>!!owner,owns:video=>owner?.record.video===video,chapter:()=>owner?.key||null,inspect:()=>({active:!!owner,key:owner?.key||null,transition,native:!!current()})};
})();
