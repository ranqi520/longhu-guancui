(() => {
 'use strict';
 const frame=document.querySelector('#mobile-view');let enabled=false,ownedFullscreen=false,sequence=0;
 const state=()=>({source:'qianmu-mobile-shell',enabled,rotated:enabled&&innerHeight>innerWidth});
 function announce(announce=false){frame.contentWindow?.postMessage({...state(),announce},location.origin)}
 function layout(){const rotated=enabled&&innerHeight>innerWidth;frame.classList.toggle('is-rotated',rotated);frame.style.width=(rotated?innerHeight:innerWidth)+'px';frame.style.height=(rotated?innerWidth:innerHeight)+'px';announce()}
 async function toggle(){
  const id=++sequence;enabled=!enabled;layout();announce(true);
  if(enabled){
   try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen({navigationUI:'hide'});ownedFullscreen=true}if(id===sequence&&enabled&&screen.orientation?.lock)await screen.orientation.lock('landscape')}catch{/* The rotated single iframe also works without orientation-lock permission. */}
   if(id!==sequence&&!enabled){try{screen.orientation?.unlock?.();if(ownedFullscreen&&document.fullscreenElement)await document.exitFullscreen()}catch{}ownedFullscreen=false}
  }else{
   try{screen.orientation?.unlock?.();if(ownedFullscreen&&document.fullscreenElement)await document.exitFullscreen()}catch{}ownedFullscreen=false;
  }
  layout();
 }
 addEventListener('resize',layout);visualViewport?.addEventListener('resize',layout);screen.orientation?.addEventListener('change',()=>setTimeout(layout,80));
 document.addEventListener('fullscreenchange',()=>{if(ownedFullscreen&&!document.fullscreenElement){ownedFullscreen=false;enabled=false;++sequence;try{screen.orientation?.unlock?.()}catch{}layout()}});
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.source!=='qianmu-mobile-report')return;if(e.data.type==='toggle')toggle();if(e.data.type==='ready')announce()});
 frame.addEventListener('load',()=>{document.querySelector('.mobile-loading').hidden=true;layout()});
 const src=new URL('index.html',location.href);src.search=location.search;src.searchParams.set('mobile-frame','1');src.hash='#cover';frame.src=src.href;layout();
 window.MOBILE_VIEW={toggle,inspect:()=>({...state(),width:innerWidth,height:innerHeight,childWidth:frame.contentWindow?.innerWidth,childHeight:frame.contentWindow?.innerHeight,fullscreen:!!document.fullscreenElement})};
})();
