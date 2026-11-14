(()=>{
 'use strict';
 const section=document.querySelector('#film10');
 if(!section)return;
 const video=section.querySelector('video'),screen=section.querySelector('.film-screen');
 const overlay=section.querySelector('[data-film-overlay]'),playButton=section.querySelector('[data-film-play]');
 const toggle=section.querySelector('[data-film-toggle]'),fullscreen=section.querySelector('[data-film-fullscreen]'),sound=section.querySelector('[data-film-sound]');
 const status=section.querySelector('[data-film-status]'),clock=section.querySelector('[data-film-time]');
 let loaded=false,started=false,intent=0,pending=false;
 const active=()=>document.body.dataset.activeSlide==='film10';
 const format=value=>{const n=Math.max(0,Math.floor(Number.isFinite(value)?value:0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
 function bilingual(element,zh,en){element.replaceChildren(document.createTextNode(zh));const small=document.createElement('small');small.lang='en';small.textContent=en;element.append(small)}
 function message(zh,en){bilingual(status,zh,en)}
 function playbackMessage(){video.muted?message('正在静音播放 · 点击开启原声','PLAYING MUTED · TAP SOUND ON'):message('原片音轨 · 全屏欣赏更沉浸','ORIGINAL SOUNDTRACK · ENJOY IN FULL SCREEN')}
 function sync(){
  const paused=video.paused||video.ended;
  overlay.hidden=!paused;
  bilingual(playButton.querySelector('[data-film-play-label]'),pending?'正在载入':video.ended?'重新欣赏':video.currentTime>0?'继续播放 · 开启原声':'点击播放 · 开启原声',pending?'LOADING':video.ended?'WATCH AGAIN':video.currentTime>0?'RESUME FILM · SOUND ON':'PLAY FILM · SOUND ON');
  bilingual(toggle,paused?'播放影片':'暂停影片',paused?'PLAY':'PAUSE');
  toggle.setAttribute('aria-label',paused?'播放影片 / Play the film':'暂停影片 / Pause the film');
  bilingual(sound,video.muted?'开启原声':'关闭原声',video.muted?'SOUND ON':'SOUND OFF');
  sound.setAttribute('aria-pressed',String(!video.muted));
  playButton.disabled=pending;toggle.disabled=pending;
  clock.textContent=format(video.currentTime)+' / '+format(Number.isFinite(video.duration)?Math.ceil(video.duration):68);
 }
 function pause(){intent++;pending=false;video.pause();sync()}
 async function play({withSound=false}={}){
  if(!active()||document.hidden||pending)return;
  const token=++intent;pending=true;
  if(withSound){video.muted=false;if(video.volume===0)video.volume=1}
  if(!loaded){video.src=video.dataset.src;loaded=true;video.load()}
  if(video.ended)video.currentTime=0;
  video.controls=true;message('影片载入中','LOADING THE FILM');sync();
  try{
   await video.play();
   if(token!==intent)return;
   if(!active()||document.hidden){pause();return}
   started=true;playbackMessage();
  }catch(error){
   if(token===intent&&error.name!=='AbortError')message('请点击继续播放影片','PLEASE CLICK TO CONTINUE THE FILM');
  }finally{if(token===intent){pending=false;sync()}}
 }
 playButton.addEventListener('click',()=>play({withSound:true}));
 toggle.addEventListener('click',()=>video.paused||video.ended?play({withSound:true}):pause());
 sound.addEventListener('click',()=>{video.muted=!video.muted;if(video.volume===0&&!video.muted)video.volume=1;sync();if(video.paused)play();else playbackMessage()});
 video.addEventListener('play',()=>{if(!active()||document.hidden){pause();return}sync()});
 video.addEventListener('playing',()=>{if(!active()||document.hidden){pause();return}started=true;pending=false;playbackMessage();sync()});
 video.addEventListener('pause',()=>{if(!video.ended&&loaded)message('影片已暂停 · 返回章节自动续播','PAUSED · RESUMES WHEN YOU RETURN');sync()});
 video.addEventListener('ended',()=>{pending=false;message('家的故事，正待开启','THE STORY OF HOME IS JUST BEGINNING');sync()});
 video.addEventListener('loadedmetadata',sync);video.addEventListener('timeupdate',sync);
 video.addEventListener('volumechange',()=>{sync();if(!video.paused)playbackMessage()});
 video.addEventListener('error',()=>{intent++;pending=false;message('影片载入失败，请刷新后重试','THE FILM COULD NOT LOAD · PLEASE REFRESH AND RETRY');sync()});
 fullscreen.addEventListener('click',async()=>{
  try{
   if(document.fullscreenElement===screen)await document.exitFullscreen();
   else if(screen.requestFullscreen)await screen.requestFullscreen();
   else if(typeof video.webkitEnterFullscreen==='function'){if(!loaded)await play({withSound:true});video.webkitEnterFullscreen()}
   else message('请使用播放器的全屏按钮','PLEASE USE THE PLAYER FULL-SCREEN BUTTON');
  }catch{message('请使用播放器的全屏按钮','PLEASE USE THE PLAYER FULL-SCREEN BUTTON')}
 });
 window.addEventListener('report:slidechange',()=>{if(!active())pause();else if(started)play()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(active()&&started)play()});
 window.addEventListener('pagehide',pause);
 window.FILM_REPORT={pause,inspect:()=>({active:active(),loaded,started,pending,paused:video.paused,ended:video.ended,time:video.currentTime,duration:Number.isFinite(video.duration)?video.duration:null,width:video.videoWidth,height:video.videoHeight,muted:video.muted,volume:video.volume,preload:video.preload,readyState:video.readyState,src:video.currentSrc||null,fullscreen:document.fullscreenElement===screen})};
 sync();
})();
