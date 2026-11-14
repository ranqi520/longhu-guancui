(() => {
 'use strict';
 const framed=new URLSearchParams(location.search).get('mobile-frame')==='1'&&parent!==window;
 const touchDevice=navigator.maxTouchPoints>0&&(matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
 if(!framed&&parent===window&&touchDevice){
  const url=new URL('手机横屏_CODEX.html',location.href);url.search=location.search;url.searchParams.delete('mobile-frame');url.hash='#cover';location.replace(url.href);return;
 }
 if(!framed)return;
 document.documentElement.dataset.mobileReport='true';
 document.addEventListener('DOMContentLoaded',()=>{
  const tools=document.querySelector('.header-tools');if(!tools)return;
  const button=document.createElement('button');button.type='button';button.className='landscape-button';button.id='landscape-button';button.setAttribute('aria-pressed','false');
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M17 3h4v4M7 21H3v-4M21 3l-4 4M3 21l4-4"/></svg><span>横屏浏览<small lang="en">LANDSCAPE</small></span>';
  tools.prepend(button);
  const notice=document.createElement('div');notice.className='landscape-notice';notice.setAttribute('role','status');notice.hidden=true;document.body.append(notice);let timer;
  function state(data){const on=!!data.enabled;document.documentElement.dataset.mobileRotated=String(!!data.rotated);syncRotatedTouch(!!data.rotated);button.setAttribute('aria-pressed',String(on));button.querySelector('span').innerHTML=on?'退出横屏<small lang="en">EXIT LANDSCAPE</small>':'横屏浏览<small lang="en">LANDSCAPE</small>';button.title=on?'退出横屏浏览 / Exit landscape view':'横屏浏览 / Landscape view';if(data.announce){notice.innerHTML=on?'请横向握持手机<small lang="en">TURN YOUR PHONE SIDEWAYS</small>':'已退出横屏浏览<small lang="en">LANDSCAPE VIEW CLOSED</small>';notice.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{notice.hidden=true},3000)}}
  button.addEventListener('click',()=>{if(parent.MOBILE_VIEW)parent.MOBILE_VIEW.toggle();else parent.postMessage({source:'qianmu-mobile-report',type:'toggle'},location.origin)});
  addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.source==='qianmu-mobile-shell')state(e.data)});

  // A CSS-rotated iframe needs local-axis touch scrolling when OS rotation is locked.
  // Let existing horizontal detail gestures and all nested model frames keep their handlers.
  let touch=null,suppressClickUntil=0,manualTouchBound=false;
  const rotated=()=>document.documentElement.dataset.mobileRotated==='true';
  function scrollLocal(target,axis,delta){
   const property=axis==='y'?'scrollTop':'scrollLeft',size=axis==='y'?'scrollHeight':'scrollWidth',client=axis==='y'?'clientHeight':'clientWidth',overflow=axis==='y'?'overflowY':'overflowX';
   for(let node=target;node&&node!==document.body&&node!==document.documentElement;node=node.parentElement){
    if(/auto|scroll/.test(getComputedStyle(node)[overflow])&&node[size]>node[client]+1&&((delta>0&&node[property]<node[size]-node[client]-1)||(delta<0&&node[property]>0))){node[property]+=delta;return;}
   }
   if(axis==='y')window.scrollBy({top:delta,behavior:'instant'});
  }
  addEventListener('touchstart',event=>{
   touch=null;
   if(!rotated()||event.touches.length!==1||event.target.closest('dialog,input,select,textarea,[role="slider"]'))return;
   const t=event.touches[0];touch={id:t.identifier,x:t.clientX,y:t.clientY,lastX:t.clientX,lastY:t.clientY,target:event.target,axis:null};
  },{passive:true});
  function touchMove(event){
   if(!touch||!rotated()||event.touches.length!==1){touch=null;return;}
   const t=event.touches[0];if(t.identifier!==touch.id)return;
   const dx=t.clientX-touch.x,dy=t.clientY-touch.y;
   if(!touch.axis&&Math.hypot(dx,dy)<7)return;
   if(!touch.axis)touch.axis=Math.abs(dy)>=Math.abs(dx)?'y':'x';
   if(event.cancelable)event.preventDefault();
   scrollLocal(touch.target,touch.axis,touch.axis==='y'?touch.lastY-t.clientY:touch.lastX-t.clientX);
   touch.lastX=t.clientX;touch.lastY=t.clientY;suppressClickUntil=performance.now()+450;
  }
  function syncRotatedTouch(on){
   if(on===manualTouchBound)return;manualTouchBound=on;touch=null;
   if(on)addEventListener('touchmove',touchMove,{passive:false});else removeEventListener('touchmove',touchMove);
  }
  for(const type of ['touchend','touchcancel'])addEventListener(type,()=>{if(touch?.axis)suppressClickUntil=performance.now()+450;touch=null},{passive:true});
  addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}},{capture:true});
  parent.postMessage({source:'qianmu-mobile-report',type:'ready'},location.origin);
 });
})();
