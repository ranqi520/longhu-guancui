(() => {
 'use strict';
 for(const image of document.querySelectorAll('.architectural-art,.letter-portrait img,.closing-art img')){
  image.classList.add('report-enlarge-image');image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',(image.alt||'图片 / Image')+' · 点击放大 / Enlarge');
  const open=()=>window.MATERIALS_REPORT?.openBoards([{room:{zh:'龙湖观萃',en:'GUANCUI RESIDENCE'},board:{full:image.currentSrc||image.src,zh:'设计影像',en:'DESIGN IMAGE',alt:image.alt}}],0,image);
  image.addEventListener('click',open);image.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();open();}});
 }
 // A tap closes; a swipe/drag is reserved for browsing and must never close a picture.
 for(const id of ['scene-image-full','gallery-image']){
  const image=document.getElementById(id),dialog=image?.closest('dialog');if(!dialog)continue;
  let pointer=null,suppressUntil=0;
  image.addEventListener('pointerdown',event=>{if(event.isPrimary===false){suppressUntil=performance.now()+700;return;}pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:0};});
  image.addEventListener('pointermove',event=>{if(pointer?.id===event.pointerId)pointer.moved=Math.max(pointer.moved,Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y));});
  image.addEventListener('pointerup',()=>{if(pointer?.moved>8)suppressUntil=performance.now()+700;pointer=null;});
  image.addEventListener('pointercancel',()=>{pointer=null;suppressUntil=performance.now()+700;});
  image.addEventListener('click',event=>{if(performance.now()>=suppressUntil){event.stopPropagation();dialog.close();}});
  image.title='点击图片关闭 / Tap image to close';
 }
})();
