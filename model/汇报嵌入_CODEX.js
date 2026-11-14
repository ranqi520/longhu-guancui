export function connectReport({state,controls,host}) {
 if(!document.documentElement.classList.contains('report-embed'))return;
 const root=document.documentElement, actions=document.querySelector('.quick-actions'), hint=document.querySelector('.controls-hint');
 const origin=location.origin, validChapters=new Set(['02','04','05','10']);
 let active=false, interaction=false, pendingChapter='02', startY=null, layersOpen=false;
 state.reportActive=false;controls.enabled=false;
 const send=data=>parent.postMessage({source:'qianmu-model',...data},origin);
 const button=document.createElement('button');button.className='report-interact';button.id='report-interact';button.setAttribute('aria-pressed','false');
 const layerButton=document.createElement('button');layerButton.className='report-layers';layerButton.setAttribute('aria-controls','analysis-panel');layerButton.setAttribute('aria-expanded','false');layerButton.innerHTML='分析图层<small lang="en">ANALYSIS LAYERS</small>';
 actions.prepend(button);actions.append(layerButton);
 function setLayers(value){layersOpen=!!value;root.classList.toggle('analysis-open',layersOpen);layerButton.setAttribute('aria-expanded',String(layersOpen));}
 function setInteraction(value){
  interaction=!!value&&active&&pendingChapter!=='10';button.hidden=pendingChapter==='10';controls.enabled=interaction&&!['04','05'].includes(pendingChapter);state.analysis?.setPlanInteraction(interaction);state.analysis?.setPlanPlaying(active);root.classList.toggle('model-interacting',interaction);button.setAttribute('aria-pressed',String(interaction));
  const plan=['04','05'].includes(pendingChapter);
  button.innerHTML=interaction?'↩ <span>退出操作<small lang="en">EXIT CONTROLS</small></span>':plan?'⤢ <span>操作平面<small lang="en">EXPLORE PLAN</small></span>':'⤢ <span>操作模型<small lang="en">INTERACT WITH MODEL</small></span>';
  hint.innerHTML=interaction?(plan?'拖动平移 · 滚轮缩放，按 Esc 退出<small lang="en">DRAG TO PAN · SCROLL TO ZOOM · ESC TO EXIT</small>':'旋转 · 平移 · 缩放，按 Esc 或点击上方按钮退出<small lang="en">ORBIT · PAN · ZOOM. PRESS ESC OR USE THE EXIT BUTTON.</small>'):(plan?'上下滚动继续汇报 · 点击“操作平面”平移与缩放<small lang="en">SCROLL TO CONTINUE · SELECT “EXPLORE PLAN” TO PAN & ZOOM</small>':'上下滚动继续汇报 · 点击“操作模型”开启三维操作<small lang="en">SCROLL TO CONTINUE · SELECT “INTERACT WITH MODEL” TO EXPLORE</small>');
  if(pendingChapter==='10')hint.innerHTML='鼠标悬停空间，点亮局部灯光 · 上下滚动继续汇报<small lang="en">HOVER TO LIGHT A ROOM · SCROLL TO CONTINUE</small>';
   send({type:'interaction',enabled:interaction});
 }
 button.addEventListener('click',()=>setInteraction(!interaction));layerButton.addEventListener('click',()=>setLayers(!layersOpen));
 function apply(){
  if(!state.analysis)return;
  if(document.querySelector('#stage').dataset.chapter!==pendingChapter){setLayers(false);state.analysis.setChapter(pendingChapter,{hash:false,instant:true});}
  layerButton.hidden=pendingChapter==='02';setInteraction(interaction);
 }
 window.addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==origin||event.data?.source!=='qianmu-report')return;
  const data=event.data;
  if(data.type==='interaction'){setInteraction(data.enabled);return;}
  if(data.type!=='present')return;
  const changed=validChapters.has(data.chapter)&&pendingChapter!==data.chapter;
  if(validChapters.has(data.chapter))pendingChapter=data.chapter;
  active=!!data.active;state.reportActive=active;
  if(changed||!active){setInteraction(false);setLayers(false);document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());}
  apply();if(active)state.debug.invalidate();else state.debug.suspendRender();
 });
 const dialogOpen=()=>!!document.querySelector('dialog[open]');
 window.addEventListener('wheel',event=>{
  if(interaction||event.ctrlKey||dialogOpen()||event.target.closest('.analysis-panel,.mode-panel'))return;
  event.preventDefault();send({type:'wheel',delta:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)});
 },{capture:true,passive:false});
 host.addEventListener('touchstart',event=>{startY=!interaction&&event.touches.length===1?event.touches[0].screenY:null},{passive:true});
 host.addEventListener('touchmove',event=>{if(startY===null||interaction||event.touches.length!==1||dialogOpen())return;event.preventDefault();const y=event.touches[0].screenY;send({type:'touch-scroll',delta:startY-y});startY=y},{passive:false});
 host.addEventListener('touchend',()=>{startY=null},{passive:true});host.addEventListener('touchcancel',()=>{startY=null},{passive:true});
 window.addEventListener('keydown',event=>{
  if(event.key==='Escape'){setInteraction(false);setLayers(false);return;}
  if(interaction||dialogOpen()||event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)){event.preventDefault();send({type:'key',key:event.key});}
 });
 const watcher=setInterval(()=>{if(!state.ready||!state.analysis)return;clearInterval(watcher);apply();send({type:'ready'});},80);
 setInteraction(false);send({type:'mounted'});
 state.reportBridge={inspect:()=>({active,interaction,chapter:pendingChapter,layersOpen}),setInteraction};
}