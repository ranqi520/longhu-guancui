(() => {
 'use strict';
 const slides=[...document.querySelectorAll('[data-scene-room]')];
 if(!slides.length)return;
 const dialog=document.querySelector('#scene-image-dialog'),full=document.querySelector('#scene-image-full');
 const score=document.querySelector('#scene-background-music'),startButton=slides[0].querySelector('[data-scene-start]');
 const states=new Map(slides.map(slide=>[slide,{video:slide.querySelector('video'),inView:false,pending:false,intent:0,blocked:false}]));
 let activeKey=window.VERTICAL_REPORT?.inspect().active||location.hash.slice(1)||'',disposed=false;
 let started=false,userPaused=false,musicEnabled=true,unlocked=false,musicPending=false,musicIntent=0,musicBlocked=false,musicFailed=false;
 score.volume=.48;score.muted=false;
 const visible=()=>!disposed&&!document.hidden&&!document.querySelector('dialog[open]');
 const inChapter=()=>activeKey.startsWith('scenes06')||window.REPORT_FULLSCREEN?.chapter()?.startsWith('scenes06');
 // One explicit session starts all four muted animations and their shared audible score.
 const shouldPlay=()=>started&&!userPaused&&inChapter()&&visible();
 const shouldScore=()=>shouldPlay()&&musicEnabled&&!musicFailed;
 function paint(slide){
  const {video}=states.get(slide),playing=!video.paused&&!video.ended;
  slide.querySelector('[data-play-icon]').textContent=playing?'Ⅱ':'▶';
  slide.querySelector('[data-play-label]').innerHTML=playing?'暂停全部<small lang="en">PAUSE ALL</small>':started?'继续播放<small lang="en">RESUME ALL</small>':'播放全部<small lang="en">PLAY ALL</small>';
  slide.querySelector('[data-scene-play]').setAttribute('aria-label',playing?'暂停所有动画与配乐 / Pause all animations and music':'播放所有动画与配乐 / Play all animations and music');
  if(startButton)startButton.hidden=started;
 }
 function paintMusic(){
  const playing=!score.paused&&!score.ended;
  for(const slide of slides){
   const button=slide.querySelector('[data-scene-music]');
   button.setAttribute('aria-pressed',String(musicEnabled));
   button.setAttribute('aria-label',musicEnabled?'关闭背景配乐 / Turn music off':'开启背景配乐 / Turn music on');
   button.querySelector('[data-music-label]').innerHTML=musicFailed?'配乐重试<small lang="en">RETRY MUSIC</small>':playing?'配乐已开启<small lang="en">MUSIC ON</small>':musicBlocked?'点击开启配乐<small lang="en">ENABLE MUSIC</small>':musicEnabled?'配乐待播放<small lang="en">MUSIC READY</small>':'开启配乐<small lang="en">MUSIC OFF</small>';
  }
 }
 function load(slide){const {video}=states.get(slide);if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
 function pause(slide){const state=states.get(slide);state.intent++;state.video.pause();paint(slide);}
 async function play(slide){
  const state=states.get(slide);if(!shouldPlay()||state.pending||!state.video.paused)return;
  load(slide);state.pending=true;state.blocked=false;const intent=++state.intent;
  try{await state.video.play();if(intent!==state.intent||!shouldPlay())state.video.pause();}
  catch(error){if(intent===state.intent&&error.name!=='AbortError')state.blocked=true;}
  finally{state.pending=false;paint(slide);if(intent!==state.intent&&shouldPlay()&&state.video.paused)play(slide);}
 }
 function pauseMusic(){musicIntent++;score.pause();paintMusic();}
 async function syncMusic(){
  if(!shouldScore()){pauseMusic();return;}
  if(musicBlocked||musicPending||!score.paused){paintMusic();return;}
  if(!score.getAttribute('src')){score.src=score.dataset.src;score.load();}
  score.muted=false;musicPending=true;const intent=++musicIntent;
  try{await score.play();unlocked=true;musicBlocked=false;if(intent!==musicIntent||!shouldScore())score.pause();}
  catch(error){if(intent===musicIntent&&shouldScore()&&error.name!=='AbortError')musicBlocked=true;}
  finally{musicPending=false;paintMusic();if(intent!==musicIntent&&shouldScore()&&score.paused&&!musicBlocked)syncMusic();}
 }
 function sync(){
  // Invoke play in the same trusted click stack; do not await video loading before audio.
  syncMusic();
  for(const slide of slides){if(shouldPlay())play(slide);else pause(slide);paint(slide);}
 }
 function startSession(){
  started=true;userPaused=false;musicBlocked=false;
  if(musicFailed){musicFailed=false;score.removeAttribute('src');}
  sync();
 }
 startButton?.addEventListener('click',()=>{musicEnabled=true;startSession();});
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){const slide=entry.target.closest('[data-scene-room]');states.get(slide).inView=entry.isIntersecting&&entry.intersectionRatio>.03;}},{threshold:[0,.03,.1]});
 for(const slide of slides){
  const state=states.get(slide),{video}=state;video.muted=true;video.volume=0;video.controls=false;
  observer.observe(video);
  for(const type of ['play','pause','playing','loadedmetadata','durationchange'])video.addEventListener(type,()=>paint(slide));
  video.addEventListener('error',()=>{slide.querySelector('.scene-video-error').hidden=false;paint(slide);});
  slide.querySelector('[data-scene-retry]').addEventListener('click',()=>{slide.querySelector('.scene-video-error').hidden=true;video.src=video.dataset.src;video.load();startSession();});
  // The lower-left control is the only manual pause control. The video picture has none.
  slide.querySelector('[data-scene-play]').addEventListener('click',()=>{if(shouldPlay()){userPaused=true;sync();}else startSession();});
  slide.querySelector('[data-scene-replay]').addEventListener('click',()=>{for(const item of slides){load(item);states.get(item).video.currentTime=0;}if(score.getAttribute('src'))score.currentTime=0;startSession();});
  slide.querySelector('[data-scene-music]').addEventListener('click',()=>{
   if(musicBlocked||musicFailed){musicEnabled=true;musicBlocked=false;if(musicFailed){musicFailed=false;score.removeAttribute('src');}}
   else musicEnabled=!musicEnabled;
   syncMusic();
  });
  // Fullscreen keeps the same custom lower-left controls instead of native video controls.
  slide.querySelector('[data-scene-video-expand]').addEventListener('click',()=>window.REPORT_FULLSCREEN.toggle(slide.querySelector('.scene-motion-frame'),video));
  slide.querySelector('[data-scene-enlarge]').addEventListener('click',()=>{
   const image=slide.querySelector('.scene-render-button img');full.src=image.currentSrc||image.src;full.alt=image.alt;
   const title=document.querySelector('#scene-image-title');title.replaceChildren(document.createTextNode(slide.querySelector('.scene-room-nav [aria-pressed="true"]>span:nth-child(2)').firstChild.textContent+' · 空间效果图'));
   const english=document.createElement('small');english.lang='en';english.textContent='DESIGN PERSPECTIVE';title.append(english);
   if(!dialog.open)dialog.showModal();sync();
  });
  paint(slide);
 }
 for(const type of ['playing','pause','ended'])score.addEventListener(type,paintMusic);
 score.addEventListener('error',()=>{musicFailed=true;pauseMusic();});
 document.querySelector('[data-scene-image-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',sync);window.addEventListener('report:fullscreenchange',sync);
 document.querySelectorAll('[data-scene-target]').forEach(button=>button.addEventListener('click',()=>window.VERTICAL_REPORT.go(button.dataset.sceneTarget)));
 window.addEventListener('report:slidechange',event=>{activeKey=event.detail.key;musicBlocked=false;sync();});
 // Native fullscreen controls can blur the document without hiding it.
 window.addEventListener('focus',sync);
 document.addEventListener('visibilitychange',sync);
 for(const modal of document.querySelectorAll('dialog'))new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',()=>{disposed=true;sync();});
 window.addEventListener('pageshow',()=>{disposed=false;sync();});
 window.SCENES_REPORT={inspect:()=>({active:activeKey,foreground:visible(),started,userPaused,music:{enabled:musicEnabled,unlocked,paused:score.paused,muted:score.muted,volume:score.volume,blocked:musicBlocked,failed:musicFailed,time:score.currentTime,ready:score.readyState},rooms:slides.map(slide=>{const {video,inView,blocked}=states.get(slide);return{key:slide.dataset.slideId,room:slide.dataset.sceneRoom,paused:video.paused,muted:video.muted,loaded:!!video.getAttribute('src'),ready:video.readyState,time:video.currentTime,duration:Number.isFinite(video.duration)?video.duration:null,userPaused,inView,blocked};})})};
 sync();
})();
