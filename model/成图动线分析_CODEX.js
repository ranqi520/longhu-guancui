// Coordinates are authored against the owner's 2047 × 1152 white-model image.
// The entry is only a connection anchor: the supplied image does not show the full vestibule.
const RED='#bd4149', BLUE='#286fb3';
// Extra image-space margins keep every callout outside the silhouette and inside the fitted view.
const IMAGE_PLAN_FRAME={x:-100,y:-80,width:2260,height:1400};
export const IMAGE_PLAN_ROUTES={
 arrival:{color:RED,paths:[
  {id:'arrival-main',dashed:false,d:'M 790 347 Q 782 380 748 417 Q 722 447 706 489 L 673 553 Q 659 586 708 615'},
  {id:'balcony-leisure',dashed:true,d:'M 686 601 Q 660 650 632 700 L 590 765 Q 566 789 525 790'}]},
 service:{color:RED,paths:[
  {id:'kitchen-main',dashed:false,d:'M 790 347 L 828 280 Q 848 246 879 258 L 1090 308 Q 1110 317 1135 323'},
  {id:'dining-branch',dashed:true,d:'M 790 347 Q 798 384 827 401 L 944 457'},
  {id:'laundry-branch',dashed:true,d:'M 590 765 L 542 741 Q 458 700 368 700'}]},
 privacy:{color:BLUE,paths:[
  {id:'private-main',dashed:false,d:'M 803 399 Q 830 420 869 439 L 1152 565 Q 1202 586 1256 609 L 1330 638'},
  {id:'child-branch',dashed:true,d:'M 790 347 Q 759 350 735 366 L 662 405 Q 635 422 622 448 L 580 515'},
  {id:'bedroom2-branch',dashed:true,d:'M 1240 602 L 1319 559 Q 1336 548 1349 523 L 1382 454'},
  {id:'main-bedroom-branch',dashed:true,d:'M 1330 638 L 1429 680 Q 1471 700 1501 737'},
  {id:'study-branch',dashed:true,d:'M 1168 572 Q 1145 604 1129 641 L 1059 806 Q 1051 826 1078 841'}]},
 sanitary:{color:BLUE,paths:[
  {id:'guest-bath-branch',dashed:true,d:'M 1216 592 Q 1249 558 1272 510 L 1300 451 Q 1311 424 1287 414'},
  {id:'ensuite-branch',dashed:true,d:'M 1501 737 Q 1557 701 1580 658 L 1618 591 Q 1637 558 1670 568'}]}
};
export const IMAGE_PLAN_ROOMS=[
 {layer:'arrival',cn:'玄关衔接',en:'ENTRY CONNECTION',x:752,y:300,labelX:425,labelY:160,leader:[[610,170],[545,170]]},
 {layer:'arrival',cn:'客厅',en:'LIVING',x:876,y:674,labelX:1005,labelY:1110,leader:[[997,915],[1005,1070]]},
 {layer:'arrival',cn:'休闲阳台',en:'LEISURE BALCONY',x:754,y:930,labelX:630,labelY:1190,leader:[[630,1090],[630,1150]]},
 {layer:'service',cn:'餐厨区',en:'DINING & KITCHEN',x:1018,y:376,labelX:1270,labelY:112,leader:[[1140,240],[1270,160]]},
 {layer:'service',cn:'洗衣区',en:'LAUNDRY',x:320,y:664,labelX:90,labelY:690,leader:[[220,700],[160,700]]},
 {layer:'privacy',cn:'儿童房',en:'CHILDREN’S ROOM',x:494,y:447,labelX:160,labelY:400,leader:[[340,410],[280,410]]},
 {layer:'privacy',cn:'次卧',en:'BEDROOM 2',x:1455,y:480,labelX:1880,labelY:410,leader:[[1690,415],[1770,415]]},
 {layer:'privacy',cn:'主卧',en:'MAIN BEDROOM',x:1415,y:885,labelX:1780,labelY:1060,leader:[[1590,1065],[1650,1065]]},
 {layer:'privacy',cn:'开放书房',en:'OPEN STUDY',x:1170,y:761,labelX:1290,labelY:1220,leader:[[1096,990],[1200,1180],[1290,1180]]},
 {layer:'sanitary',cn:'公卫',en:'GUEST BATH',x:1268,y:346,labelX:1550,labelY:240,leader:[[1380,288],[1550,288]]},
 {layer:'sanitary',cn:'主卫',en:'ENSUITE',x:1660,y:500,labelX:1940,labelY:640,leader:[[1800,645],[1850,645]]}
];
export function createImageCirculation({host}){
 return createImageStudy({host,studyId:'circulation',routes:IMAGE_PLAN_ROUTES,rooms:IMAGE_PLAN_ROOMS,
  aria:'全宅白模动线分析 / Whole-home circulation study',
  title:'空间序列 · 全宅动线 / Spatial sequence · whole-home circulation',
  description:'红色公共生活、蓝色静区联系；实线主通道、虚线空间支线。Red shared living, blue private connections; solid main passages and dashed room branches.'});
}
// Both image studies share the exact board, callouts and interaction coordinates.
export function createImageStudy({host,studyId,routes,rooms,aria,title,description,contextLabels=false}){
 const ns='http://www.w3.org/2000/svg',embedded=document.documentElement.classList.contains('report-embed');
 const root=document.createElement('section');root.className='image-circulation image-'+studyId;root.dataset.study=studyId;root.hidden=true;root.setAttribute('aria-label',aria);
 const stage=document.createElement('div');stage.className='image-plan-stage';
 const board=document.createElement('div');board.className='image-plan-board';board.style.aspectRatio=`${IMAGE_PLAN_FRAME.width} / ${IMAGE_PLAN_FRAME.height}`;
 const image=document.createElement('img');image.src='./assets/全宅白模透明底图_CODEX.png';image.alt='业主提供的住宅三维白模图 / Owner-provided residential white-model image';image.draggable=false;image.decoding='async';image.width=2047;image.height=1152;
 Object.assign(image.style,{left:`${-IMAGE_PLAN_FRAME.x/IMAGE_PLAN_FRAME.width*100}%`,top:`${-IMAGE_PLAN_FRAME.y/IMAGE_PLAN_FRAME.height*100}%`,width:`${2047/IMAGE_PLAN_FRAME.width*100}%`,height:`${1152/IMAGE_PLAN_FRAME.height*100}%`});
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`${IMAGE_PLAN_FRAME.x} ${IMAGE_PLAN_FRAME.y} ${IMAGE_PLAN_FRAME.width} ${IMAGE_PLAN_FRAME.height}`);svg.setAttribute('class','image-plan-overlay');svg.setAttribute('role','img');
 svg.innerHTML='<title></title><desc></desc>';svg.querySelector('title').textContent=title;svg.querySelector('desc').textContent=description;
 const el=(tag,attrs,parent=svg)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));parent.append(n);return n;};
 const prefix='image-'+studyId;const defs=el('defs',{});for(const [id,{color}] of Object.entries(routes)){
  const m=el('marker',{id:prefix+'-arrow-'+id,viewBox:'0 0 16 14',refX:13,refY:7,markerWidth:4,markerHeight:4,orient:'auto',markerUnits:'strokeWidth'},defs);
  el('path',{d:'M 1 1 L 14 7 L 1 13 L 5 7 Z',fill:color},m);
 }
 const layers=new Map();let count=0;
 for(const [id,layer] of Object.entries(routes)){
  const group=el('g',{'data-image-layer':id,'class':'image-plan-layer',color:layer.color});layers.set(id,group);
  for(const route of layer.paths){
   const common={d:route.d,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'};
   el('path',{...common,stroke:'#ffffff','stroke-width':route.dashed?8.8:10.5,opacity:studyId==='environment'?.76:.88},group);
   const path=el('path',{...common,id:prefix+'-route-'+route.id,stroke:layer.color,'stroke-width':route.dashed?4.3:5.7,...(route.dashed?{'stroke-dasharray':'13 11'}:{}),'marker-end':'url(#'+prefix+'-arrow-'+id+')','class':route.dashed?'image-route branch':'image-route main'},group);
   const title=el('title',{},path);title.textContent=route.title||route.id;
   // A moving chevron makes direction legible while the underlying line remains stable.
   const length=path.getTotalLength(),duration=Math.max(3.8,length/66);
   const movingCount=route.movers??(route.dashed?1:2);
   for(let k=0;k<movingCount;k++){
    const arrow=el('g',{'class':'image-plan-mover'},group);
    el('path',{d:'M -11 -7 L 3 0 L -11 7 L -6 0 Z',fill:layer.color,stroke:'#fff','stroke-width':1.4,'paint-order':'stroke'},arrow);
    const motion=el('animateMotion',{dur:duration+'s',begin:(-duration*k/movingCount-count*.17)+'s',repeatCount:'indefinite',rotate:'auto',calcMode:'paced',path:route.d},arrow);
   }
   count++;
  }
 }
 const labelNodes=[];
 for(const room of rooms){
  // Callouts belong to the same image-space board as the routes, so zoom/pan cannot detach them.
  const label=el('g',{'class':'image-plan-label','data-room':room.en,'data-anchor':`${room.x},${room.y}`,'data-caption':`${room.labelX},${room.labelY}`});
  const d=`M ${room.x} ${room.y} `+room.leader.map(([x,y])=>`L ${x} ${y}`).join(' ');
  el('path',{d,'class':'image-plan-leader-shade','vector-effect':'non-scaling-stroke'},label);
  el('path',{d,'class':'image-plan-leader','vector-effect':'non-scaling-stroke'},label);
  el('circle',{cx:room.x,cy:room.y,r:4,'class':'image-plan-leader-dot','vector-effect':'non-scaling-stroke'},label);
  const caption=el('g',{transform:`translate(${room.labelX} ${room.labelY})`,'class':'image-plan-caption'},label);
  const cn=el('text',{x:0,y:0,'text-anchor':'middle','class':'image-plan-room-cn'},caption);cn.textContent=room.cn;
  const en=el('text',{x:0,y:23,'text-anchor':'middle','class':'image-plan-room-en'},caption);en.textContent=room.en;
  labelNodes.push({room,label});
 }
 board.append(image,svg);stage.append(board);root.append(stage);
 const tools=document.createElement('div');tools.className='image-plan-tools';
 for(const [action,text,title] of [['out','−','缩小 / ZOOM OUT'],['fit','↺','完整户型 / FIT TO VIEW'],['in','+','放大 / ZOOM IN']]){
  const b=document.createElement('button');b.type='button';b.textContent=text;b.title=title;b.setAttribute('aria-label',title);b.dataset.imageAction=action;tools.append(b);
 }
 const scaleLabel=document.createElement('span');scaleLabel.className='image-plan-scale';tools.append(scaleLabel);root.append(tools);host.append(root);
 let active=false,interacting=!embedded,zoom=1,panX=0,panY=0;const pointers=new Map();let gesture=null;
 const enabled=()=>active&&interacting;
 function apply(){board.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;scaleLabel.textContent=Math.round(zoom*100)+'%';root.classList.toggle('is-zoomed',zoom>1.01);}
 function fit(){zoom=1;panX=panY=0;apply();}
 function size(){const w=Math.min(stage.clientWidth,stage.clientHeight*IMAGE_PLAN_FRAME.width/IMAGE_PLAN_FRAME.height);board.style.width=Math.max(1,w)+'px';apply();}
 function limit(){panX=Math.max(-stage.clientWidth*zoom*.4,Math.min(stage.clientWidth*zoom*.4,panX));panY=Math.max(-stage.clientHeight*zoom*.4,Math.min(stage.clientHeight*zoom*.4,panY));}
 function zoomAt(factor,x,y){const old=zoom;zoom=Math.max(1,Math.min(3.5,zoom*factor));const r=stage.getBoundingClientRect(),dx=x-r.left-r.width/2,dy=y-r.top-r.height/2;panX=dx-(dx-panX)*zoom/old;panY=dy-(dy-panY)*zoom/old;if(zoom===1)panX=panY=0;limit();apply();}
 tools.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.imageAction==='fit')fit();else{const r=stage.getBoundingClientRect();zoomAt(b.dataset.imageAction==='in'?1.2:1/1.2,r.x+r.width/2,r.y+r.height/2);}});
 stage.addEventListener('wheel',e=>{if(!enabled())return;e.preventDefault();e.stopPropagation();zoomAt(Math.exp(-e.deltaY*(e.deltaMode===1?.028:.0018)),e.clientX,e.clientY);},{passive:false});
 function startGesture(){const p=[...pointers.values()];gesture=p.length>1?{type:'pinch',distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom,panX,panY,cx:(p[0].x+p[1].x)/2,cy:(p[0].y+p[1].y)/2}:p.length?{type:'pan',x:p[0].x,y:p[0].y,panX,panY}:null;}
 stage.addEventListener('pointerdown',e=>{if(!enabled()||e.button>0)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);startGesture();stage.classList.add('dragging');});
 stage.addEventListener('pointermove',e=>{if(!enabled()||!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()];if(gesture.type==='pinch'&&p.length>1){const next=Math.max(1,Math.min(3.5,gesture.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/Math.max(1,gesture.distance)));const r=stage.getBoundingClientRect(),cx=gesture.cx-r.x-r.width/2,cy=gesture.cy-r.y-r.height/2;zoom=next;panX=cx-(cx-gesture.panX)*zoom/gesture.zoom+(p[0].x+p[1].x)/2-gesture.cx;panY=cy-(cy-gesture.panY)*zoom/gesture.zoom+(p[0].y+p[1].y)/2-gesture.cy;}else{panX=gesture.panX+e.clientX-gesture.x;panY=gesture.panY+e.clientY-gesture.y;}limit();apply();});
 const release=e=>{pointers.delete(e.pointerId);startGesture();if(!pointers.size)stage.classList.remove('dragging');};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 const observer=new ResizeObserver(size);observer.observe(stage);
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');let playing=true;
 function playback(){if(active&&playing&&!document.hidden&&!motionPreference.matches)svg.unpauseAnimations();else svg.pauseAnimations();}
 document.addEventListener('visibilitychange',playback);motionPreference.addEventListener('change',playback);
 function setInteracting(on){interacting=!!on;root.classList.toggle('is-interacting',interacting);pointers.clear();gesture=null;stage.classList.remove('dragging');}
 function setActive(on){active=!!on;root.hidden=!active;host.classList.toggle('has-image-circulation',!!host.querySelector('.image-circulation:not([hidden])'));if(active){size();fit();}playback();}
 function select(selected,labelsVisible){for(const [id,g]of layers)g.style.display=selected.has(id)?'':'none';for(const {room,label}of labelNodes)label.style.display=labelsVisible&&(contextLabels?selected.size>0:selected.has(room.layer))?'':'none';}
 setInteracting(interacting);size();playback();
 return {setActive,setInteracting,select,fit,setPlaying(on){playing=!!on;playback();},inspect:()=>({active,kind:studyId,source:image.getAttribute('src'),loaded:image.complete&&image.naturalWidth>0,size:[image.naturalWidth,image.naturalHeight],zoom,pan:[panX,panY],interacting,routeCount:count,roomCount:rooms.length,routeMap:Object.entries(routes).flatMap(([layer,data])=>data.paths.map(r=>({id:r.id,layer,dashed:r.dashed,exterior:!!r.exterior,title:r.title||r.id,rooms:r.rooms||[]}))),labelLayout:'exterior-leaders',frame:{...IMAGE_PLAN_FRAME},selected:[...layers].filter(([,g])=>g.style.display!=='none').map(([id])=>id),visibleRooms:labelNodes.filter(({label})=>label.style.display!=='none').map(({room})=>room.cn),animationPaused:svg.animationsPaused()})};
}