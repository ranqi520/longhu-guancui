(() => {
 'use strict';
 const section=document.querySelector('.letter-chapter');
 if(!section)return;
 const video=section.querySelector('video'),panels=[...section.querySelectorAll('[data-letter-panel]')];
 const open=section.querySelector('[data-letter-open]'),resume=section.querySelector('[data-letter-resume]'),toggle=section.querySelector('[data-letter-toggle]'),sound=section.querySelector('[data-letter-sound]');
 const overlay=section.querySelector('[data-letter-overlay]'),message=section.querySelector('[data-letter-message]'),clock=section.querySelector('[data-letter-time]'),live=section.querySelector('[data-letter-live]');
 const screen=section.querySelector('[data-letter-screen]');
 let loaded=false,started=false,pending=false,intent=0,state='intro';
 const active=()=>document.body.dataset.activeSlide==='closing'||window.REPORT_FULLSCREEN?.owns(video);
 const format=value=>{const n=Math.max(0,Math.floor(Number.isFinite(value)?value:0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
 function bilingual(el,zh,en){el.replaceChildren(document.createTextNode(zh));const small=document.createElement('small');small.lang='en';small.textContent=en;el.append(small)}
 function status(zh,en){bilingual(message,zh,en)}
 function setState(next){
  if(state===next&&section.dataset.closingState===next)return;
  state=next;section.dataset.closingState=next;
  for(const panel of panels)panel.hidden=panel.dataset.letterPanel!==next;
 }
 function sync(){
  const paused=video.paused||video.ended;
  overlay.hidden=state!=='playback'||(!paused&&!pending);
  bilingual(resume.querySelector('[data-letter-resume-label]'),pending?'正在载入寄语':'继续聆听',pending?'LOADING THE NOTE':'CONTINUE LISTENING');
  bilingual(toggle,paused?'播放寄语':'暂停寄语',paused?'PLAY':'PAUSE');
  toggle.setAttribute('aria-label',paused?'播放寄语 / Play the note':'暂停寄语 / Pause the note');
  bilingual(sound,video.muted?'开启声音':'关闭声音',video.muted?'SOUND ON':'SOUND OFF');
  sound.setAttribute('aria-pressed',String(!video.muted));
  open.disabled=pending;resume.disabled=pending;toggle.disabled=pending;
  clock.textContent=format(video.currentTime)+' / '+format(Number.isFinite(video.duration)?Math.ceil(video.duration):46);
 }
 function playbackStatus(){video.muted?status('正在静音聆听 · 可开启声音','PLAYING MUTED · SOUND IS AVAILABLE'):status('设计师寄语 · 原声聆听','A PERSONAL NOTE · ORIGINAL SOUND')}
 function pause(){intent++;pending=false;video.pause();sync()}
 async function play({withSound=false,restart=false,focus=false}={}){
  if(!active()||document.hidden||pending)return;
  const token=++intent;pending=true;
  if(withSound){video.muted=false;if(video.volume===0)video.volume=1}
  if(!loaded){video.src=video.dataset.src;loaded=true;video.load()}
  if(restart||video.ended)video.currentTime=0;
  setState('playback');status('寄语载入中','LOADING THE NOTE');sync();
  if(focus)toggle.focus({preventScroll:true});
  try{
   await video.play();
   if(token!==intent)return;
   if(!active()||document.hidden){pause();return}
   started=true;playbackStatus();
  }catch(error){
   if(token===intent&&error.name!=='AbortError')status('请点击继续聆听','PLEASE CLICK TO CONTINUE LISTENING');
  }finally{if(token===intent){pending=false;sync()}}
 }
 open.addEventListener('click',()=>play({withSound:true,focus:true}));
 resume.addEventListener('click',()=>play({withSound:true,focus:true}));
 toggle.addEventListener('click',()=>video.paused?play({withSound:true}):pause());
 section.querySelector('[data-letter-replay]').addEventListener('click',()=>play({withSound:true,restart:true,focus:true}));
 sound.addEventListener('click',()=>{video.muted=!video.muted;if(!video.muted&&video.volume===0)video.volume=1;sync();if(!video.paused)playbackStatus()});
 video.addEventListener('click',()=>video.paused?play({withSound:true}):pause());
 video.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();video.paused?play({withSound:true}):pause()}});
 video.addEventListener('play',()=>{if(!active()||document.hidden){pause();return}sync()});
 video.addEventListener('playing',()=>{if(!active()||document.hidden){pause();return}started=true;pending=false;playbackStatus();sync()});
 video.addEventListener('pause',()=>{if(state==='playback'&&!video.ended&&loaded)status('寄语已暂停 · 返回章节继续聆听','PAUSED · RESUMES WHEN YOU RETURN');sync()});
 video.addEventListener('ended',async()=>{
  intent++;pending=false;
  const moveFocus=active()&&screen.contains(document.activeElement)||active()&&section.querySelector('.letter-film-toolbar').contains(document.activeElement);
  if(document.fullscreenElement===screen){try{await document.exitFullscreen()}catch{}}
  setState('signoff');sync();
  live.textContent='设计有终章，生活正开场。 / The design is complete. Life is just beginning.';
  if(moveFocus)requestAnimationFrame(()=>section.querySelector('#closing-signoff-title').focus({preventScroll:true}));
 });
 video.addEventListener('loadedmetadata',sync);video.addEventListener('timeupdate',sync);
 video.addEventListener('volumechange',()=>{sync();if(!video.paused)playbackStatus()});
 video.addEventListener('error',()=>{intent++;pending=false;status('寄语未能载入，请点击重试','THE NOTE COULD NOT LOAD · PLEASE TRY AGAIN');sync()});
 section.querySelector('[data-letter-fullscreen]').addEventListener('click',async()=>{
  if(!await window.REPORT_FULLSCREEN.toggle(screen,video))status('请使用播放器的全屏按钮','PLEASE USE THE PLAYER FULL-SCREEN BUTTON');
 });
 window.addEventListener('report:slidechange',()=>{if(!active())pause();else if(started&&state==='playback'&&!video.ended)play()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(active()&&started&&state==='playback'&&!video.ended)play()});
 window.addEventListener('pagehide',pause);
 window.LETTER_REPORT={pause,inspect:()=>({active:active(),state,loaded,started,pending,paused:video.paused,ended:video.ended,time:video.currentTime,duration:Number.isFinite(video.duration)?video.duration:null,width:video.videoWidth,height:video.videoHeight,muted:video.muted,volume:video.volume,src:video.currentSrc||null,readyState:video.readyState})};
 sync();
})();
