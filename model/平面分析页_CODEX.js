import {createImageCirculation} from './成图动线分析_CODEX.js';
import {createImageEnvironment} from './成图光风分析_CODEX.js';
import {PLAN_STUDIES} from './平面分析配置_CODEX.js';
const $=s=>document.querySelector(s),stage=$('#stage'),host=$('#viewport'),panel=$('#analysis-panel');
const chapter=new URLSearchParams(location.search).get('chapter')==='05'?'05':'04',d=PLAN_STUDIES[chapter];
let selected=new Set(Object.keys(d.layers)),labelsVisible=true,active=false,interaction=false,layersOpen=false,startY=null;
stage.dataset.chapter=chapter;$('#chapter-title').textContent=d.title;$('#chapter-subtitle').textContent=d.en;$('#chapter-eyebrow').textContent=d.eyebrow;
const study=(chapter==='04'?createImageCirculation:createImageEnvironment)({host});study.setActive(true);study.setPlaying(false);
const send=data=>parent.postMessage({source:'qianmu-plan',chapter,...data},location.origin);
const button=$('#report-interact'),layerButton=$('.report-layers');
function setLayers(on){layersOpen=!!on;document.documentElement.classList.toggle('analysis-open',layersOpen);layerButton.setAttribute('aria-expanded',String(layersOpen));}
function setInteraction(on){interaction=!!on&&active;study.setInteracting(interaction);document.documentElement.classList.toggle('model-interacting',interaction);button.setAttribute('aria-pressed',String(interaction));button.innerHTML=interaction?'↩ <span>退出操作<small lang="en">EXIT CONTROLS</small></span>':'⤢ <span>操作平面<small lang="en">EXPLORE PLAN</small></span>';$('.controls-hint').innerHTML=interaction?'拖动平移 · 滚轮缩放，按 Esc 退出<small lang="en">DRAG TO PAN · SCROLL TO ZOOM · ESC TO EXIT</small>':'上下滚动继续汇报 · 点击“操作平面”平移与缩放<small lang="en">SCROLL TO CONTINUE · SELECT “EXPLORE PLAN” TO PAN & ZOOM</small>';send({type:'interaction',enabled:interaction});}
function updateVisibility(){study.select(selected,labelsVisible);}
function toggleLayer(id){if(!Object.hasOwn(d.layers,id))return;selected.has(id)?selected.delete(id):selected.add(id);updateVisibility();renderPanel();}
function setAll(on){selected=new Set(on?Object.keys(d.layers):[]);updateVisibility();renderPanel();}
 function renderPanel(){
  const d=PLAN_STUDIES[chapter],active=selected;
  panel.innerHTML=`<p class="panel-kicker">DESIGN STUDY / ${chapter==='04'?'03':chapter==='05'?'04':chapter}</p><h2 class="panel-lead">${d.lead}<small>${d.leadEn}</small></h2><p class="panel-sub">${d.desc}<small>${d.descEn}</small></p>${chapter==='04'?'<div class="plan-legend"><span><i class="legend-red"></i>公共生活<small>SHARED LIVING</small></span><span><i class="legend-blue"></i>静区联系<small>PRIVATE CONNECTIONS</small></span><span><i class="legend-solid"></i>主要通道<small>MAIN PASSAGE</small></span><span><i class="legend-dashed"></i>空间支线<small>ROOM BRANCH</small></span></div><p class="plan-coverage">全户型 · 11处空间<small>WHOLE HOME · 11 DESTINATIONS</small></p>':''}<div class="layers">${Object.entries(d.layers).map(([id,l])=>`<button class="layer-chip" data-layer="${id}" aria-pressed="${active.has(id)}" style="--layer-color:${l.color}"><i class="layer-swatch"></i><span><strong>${l.cn}</strong><small>${l.en}</small><span class="layer-detail">${l.detail}<small>${l.detailEn}</small></span></span><i class="layer-mark">✓</i></button>`).join('')}</div><div class="panel-actions"><button data-action="all">${chapter==='10'?'全部开启':'全部显示'}<small>${chapter==='10'?'ALL LIGHTS ON':'SHOW ALL'}</small></button>${chapter==='10'?'<button data-action="off">全部关闭<small>ALL LIGHTS OFF</small></button>':''}<button data-action="labels" aria-pressed="${labelsVisible}">${labelsVisible?'隐藏标注':'显示标注'}<small>${labelsVisible?'HIDE LABELS':'SHOW LABELS'}</small></button></div>${chapter==='10'?'<p class="night-state" id="night-state"></p><button class="reference-link" data-action="references">查看照明依据 · 9张<small>VIEW LIGHTING REFERENCES · 9 IMAGES</small></button>':''}<p class="panel-foot">${d.foot}<small>${d.footEn}</small></p>`;
  if(chapter==='05'){
   const coverage=document.createElement('div');coverage.className='environment-coverage';coverage.innerHTML='<p>全户型 · 11处空间<small>WHOLE HOME · 11 SPACES</small></p>';
   panel.querySelector('.layers').after(coverage);
  }
  panel.querySelector('.layers').before(panel.querySelector('.panel-actions'));
  panel.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>toggleLayer(b.dataset.layer)));
  panel.querySelector('[data-action="all"]').addEventListener('click',()=>setAll(true));panel.querySelector('[data-action="off"]')?.addEventListener('click',()=>setAll(false));
  panel.querySelector('[data-action="labels"]').addEventListener('click',()=>{labelsVisible=!labelsVisible;renderPanel();updateVisibility()});
 }

button.addEventListener('click',()=>setInteraction(!interaction));layerButton.addEventListener('click',()=>setLayers(!layersOpen));$('#reset').addEventListener('click',()=>study.fit());
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin||event.data?.source!=='qianmu-report')return;const data=event.data;if(data.type==='interaction'){setInteraction(data.enabled);return;}if(data.type!=='present')return;active=!!data.active;study.setPlaying(active);if(!active){setInteraction(false);setLayers(false);}});
window.addEventListener('wheel',event=>{if(planDialog.open||interaction||event.ctrlKey||event.target.closest('.analysis-panel'))return;event.preventDefault();send({type:'wheel',delta:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)});},{capture:true,passive:false});
host.addEventListener('touchstart',event=>{startY=!interaction&&event.touches.length===1?event.touches[0].screenY:null;},{passive:true});
host.addEventListener('touchmove',event=>{if(startY===null||interaction||event.touches.length!==1)return;event.preventDefault();const y=event.touches[0].screenY;send({type:'touch-scroll',delta:startY-y});startY=y;},{passive:false});
for(const name of ['touchend','touchcancel'])host.addEventListener(name,()=>{startY=null;},{passive:true});
window.addEventListener('keydown',event=>{if(planDialog.open)return;if(event.key==='Escape'){setInteraction(false);setLayers(false);return;}if(interaction||event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"]')||(event.key===' '&&event.target.closest('button,a')))return;if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)){event.preventDefault();send({type:'key',key:event.key});}});
window.PLAN_REPORT={inspect:()=>({chapter,active,interaction,layersOpen,...study.inspect()}),setInteraction};
renderPanel();updateVisibility();setInteraction(false);send({type:'mounted'});
// Move the actual board into a native dialog: routes, animated arrows and labels stay intact.
const planDialog=document.createElement('dialog');planDialog.className='plan-image-modal';planDialog.setAttribute('aria-label',d.title+' · 放大查看 / Enlarged design study');
planDialog.innerHTML='<header><span>'+d.title+'<small lang="en">'+d.en+'</small></span><button type="button" data-plan-close>关闭<small lang="en">CLOSE ×</small></button></header><div class="plan-image-modal-view"></div><p>点击画面关闭 · 双指缩放 · 拖动查看<small lang="en">TAP TO CLOSE · PINCH TO ZOOM · DRAG TO EXPLORE</small></p>';
document.body.append(planDialog);
const planRoot=host.querySelector('.image-circulation'),modalView=planDialog.querySelector('.plan-image-modal-view');
let tap=null,suppressTapUntil=0,savedInteraction=false;
function openPlan(){if(planDialog.open||!active)return;savedInteraction=interaction;modalView.append(planRoot);planDialog.showModal();study.setInteracting(true);study.fit();}
function trackTap(area){
 area.addEventListener('pointerdown',event=>{if(event.isPrimary===false){tap=null;suppressTapUntil=performance.now()+600;return;}tap={id:event.pointerId,x:event.clientX,y:event.clientY,moved:0};},{capture:true});
 area.addEventListener('pointermove',event=>{if(tap?.id===event.pointerId)tap.moved=Math.max(tap.moved,Math.hypot(event.clientX-tap.x,event.clientY-tap.y));},{capture:true});
 area.addEventListener('pointerup',()=>{if(tap?.moved>8)suppressTapUntil=performance.now()+600;tap=null;},{capture:true});
 area.addEventListener('pointercancel',()=>{tap=null;suppressTapUntil=performance.now()+600;},{capture:true});
}
trackTap(host);trackTap(modalView);
host.addEventListener('click',event=>{if(!interaction&&performance.now()>=suppressTapUntil&&event.target.closest('.image-plan-stage'))openPlan();});
modalView.addEventListener('click',event=>{if(!event.target.closest('button')&&performance.now()>=suppressTapUntil)planDialog.close();});
planDialog.querySelector('[data-plan-close]').addEventListener('click',()=>planDialog.close());
planDialog.addEventListener('close',()=>{host.append(planRoot);study.setInteracting(savedInteraction&&active);study.fit();});
const expand=document.createElement('button');expand.type='button';expand.textContent='⤢';expand.title='放大分析图 / Enlarge analysis diagram';expand.setAttribute('aria-label',expand.title);expand.dataset.planEnlarge='';
expand.addEventListener('click',event=>{event.stopPropagation();openPlan();});planRoot.querySelector('.image-plan-tools').prepend(expand);
const image=host.querySelector('img');if(image.complete&&image.naturalWidth)send({type:'ready'});else image.addEventListener('load',()=>send({type:'ready'}),{once:true});
