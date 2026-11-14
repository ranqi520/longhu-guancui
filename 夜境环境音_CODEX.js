// Locally synthesised cricket ambience. No remote media or audio requests.
(() => {
 'use strict';
 window.createNightAmbience=({frame})=>{
  const button=document.createElement('button');button.type='button';button.className='night-ambience';button.hidden=true;
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8c3 2 3 6 0 8M20 5c5 4 5 10 0 14"/></svg><span></span>';
  document.querySelector('.header-tools').prepend(button);
  let ctx=null,buffer=null,source=null,output=null,active=false,unlocked=false,muted=false,pending=false;
  try{muted=localStorage.getItem('qianmu-night-muted')==='1'}catch{}
  const ambienceGain=1.4;
  const canPlay=()=>active&&!muted&&!document.hidden&&document.hasFocus()&&unlocked&&ctx?.state==='running';
  function label(){
   const playing=!!source&&canPlay(),waiting=active&&!muted&&!playing;
   button.hidden=!active;button.setAttribute('aria-pressed',String(!muted));
   button.querySelector('span').innerHTML=(muted?'环境音 · 已静音':waiting?'环境音 · 点击开启':'环境音 · 蛐蛐')+'<small lang="en">'+(muted?'AMBIENCE · MUTED':waiting?'ENABLE AMBIENCE':'CRICKET AMBIENCE')+'</small>';
   button.setAttribute('aria-label',muted||waiting?'开启蛐蛐环境音 / Enable cricket ambience':'静音蛐蛐环境音 / Mute cricket ambience');
  }
  function makeBuffer(){
   const seconds=24,rate=ctx.sampleRate,b=ctx.createBuffer(2,seconds*rate,rate);
   let seed=137;
   const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
   // Short, grouped stridulation pulses, with pauses and gentle stereo variation.
   for(let insect=0;insect<3;insect++){
    let time=.4+insect*.83;
    while(time<seconds-.65){
     const count=3+Math.floor(random()*3),frequency=3950+insect*390+random()*70,pan=.18+random()*.64;
     for(let pulse=0;pulse<count;pulse++){
      const start=Math.floor((time+pulse*.047)*rate),duration=Math.floor(.027*rate),level=.027*(.7+random()*.3)/(1+insect*.3);
      for(let i=0;i<duration;i++){
       const t=i/rate,envelope=Math.pow(Math.sin(Math.PI*i/duration),1.5),wave=Math.sin(2*Math.PI*frequency*t+1.2*Math.sin(2*Math.PI*35*t));
       const v=wave*envelope*level,index=start+i;
       if(index<b.length){b.getChannelData(0)[index]+=v*(1-pan);b.getChannelData(1)[index]+=v*pan;}
      }
     }
     time+=.72+random()*1.24;
    }
   }
   return b;
  }
  function sync(){
   if(canPlay()&&!source){
    buffer??=makeBuffer();const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buffer;s.loop=true;g.gain.value=0;s.connect(g);g.connect(output);s.start();g.gain.linearRampToValueAtTime(ambienceGain,ctx.currentTime+1.1);source={node:s,gain:g};
   }else if(!canPlay()&&source){
    const old=source;source=null;const now=ctx.currentTime;old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);old.gain.gain.linearRampToValueAtTime(0,now+.38);old.node.stop(now+.4);old.node.onended=()=>{old.node.disconnect();old.gain.disconnect()};
   }
   label();
  }
  async function unlock(){
   if(!active||muted||document.hidden||!document.hasFocus()){sync();return}if(pending||unlocked&&ctx?.state==='running'){sync();return}pending=true;
   try{
    if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){label();return}ctx=new Audio({latencyHint:'playback'});output=ctx.createGain();output.gain.value=1;output.connect(ctx.destination);ctx.addEventListener('statechange',sync)}
    await ctx.resume();unlocked=ctx.state==='running';sync();
   }catch{unlocked=false;label()}finally{pending=false}
  }
  const gesture=e=>{if(e.isTrusted&&!e.target.closest?.('.night-ambience'))unlock()};
  function bind(doc){doc.addEventListener('pointerdown',gesture,{capture:true,passive:true});doc.addEventListener('keydown',gesture,{capture:true});}
  bind(document);frame.addEventListener('load',()=>{try{bind(frame.contentDocument)}catch{}});try{if(frame.contentDocument)bind(frame.contentDocument)}catch{}
  button.addEventListener('click',()=>{muted=unlocked?(!muted):false;try{localStorage.setItem('qianmu-night-muted',muted?'1':'0')}catch{}unlock();sync()});
  // Blur/hidden/pagehide stop the source immediately, including inspection windows.
  function stopImmediately(){
   if(source){const old=source;source=null;old.gain.gain.cancelScheduledValues(ctx.currentTime);old.gain.gain.setValueAtTime(0,ctx.currentTime);try{old.node.stop()}catch{}old.node.disconnect();old.gain.disconnect();}
   if(ctx?.state==='running')ctx.suspend().catch(()=>{});label();
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopImmediately();else if(unlocked)unlock()});
  window.addEventListener('blur',stopImmediately);
  window.addEventListener('focus',()=>{if(unlocked)unlock()});
  window.addEventListener('pagehide',()=>{active=false;stopImmediately()});
  window.addEventListener('beforeunload',stopImmediately);
  label();
  return {setActive(on){active=!!on;sync()},setMuted(on){muted=!!on;try{localStorage.setItem('qianmu-night-muted',muted?'1':'0')}catch{}sync()},inspect:()=>({active,muted,unlocked,playing:!!source&&canPlay(),contextState:ctx?.state||'not-created',foreground:document.hasFocus()&&!document.hidden,gain:ambienceGain,synthesis:'local cricket pulses',modelText:false})};
 };
})();
