import {PLAN_STUDIES} from './平面分析配置_CODEX.js';
import * as THREE from 'three';
import {createImageCirculation} from './成图动线分析_CODEX.js';
import {createImageEnvironment} from './成图光风分析_CODEX.js';
import {PLAN_ROUTES,PLAN_ROOMS,createWhitePlan} from './全屋动线白模_CODEX.js';
import {LIGHTING_ROOMS,createHoverLighting} from './全宅悬停照明_CODEX.js';
import {createEnvironmentClay} from './光风实体白模_CODEX.js';

// All coordinates follow the exported, metre-based model. Openings were checked
// against the original wall-building scripts; the graphics express design intent.
const ROUTES = PLAN_ROUTES;
const CHAPTERS = {
 '02':{title:'细节入微，生活入境。',en:'Thoughtful details. A place to call home.',eyebrow:'空间全景 / SPATIAL OVERVIEW'},
 ...PLAN_STUDIES,
 '10':{title:'夜境光序 · 分层照明',en:'Layered Lighting · A Home After Dusk',eyebrow:'全宅交互光环境 / WHOLE-HOME INTERACTIVE LIGHTING',lead:'光随所至，夜有层次。',leadEn:'Where you linger, light follows.',desc:'鼠标移至空间，点亮所在区域的三层照明。',descEn:'Hover over a room to reveal its three layers of light.',layers:{ambient:{color:'#f4dbb3',cn:'基础光',en:'AMBIENT'},task:{color:'#edc38e',cn:'功能光',en:'TASK'},accent:{color:'#dba575',cn:'氛围光',en:'ACCENT'}},foot:'灯具类型依据确认清单与9张参考图；厨房与过道呈现借光关系。次卧、主卫仅示意基础顶光，灯位待深化。',footEn:'Fixture types follow the approved schedule and nine references. Kitchen and hallway lighting is shared with adjacent spaces. Bedroom 2 and the ensuite show basic ceiling light; positions remain provisional.'},
};
const HASHES={'02':'model02','04':'analysis04','05':'analysis05','10':'lighting10'};
const NIGHT_REFERENCES=[['客厅人工照明层次01','客厅 · 书柜与纸灯','Living · shelving & pendant'],['客厅人工照明层次02','客厅 · 复合光层','Living · combined layers'],['客厅人工照明层次03','客厅 · 电视墙与阅读','Living · TV wall & reading'],['餐厅人工照明层次','餐厨 · 吊灯与操作台','Dining · pendants & worktop'],['主卧人工照明层次01','主卧 · 顶灯与壁灯','Bedroom · ceiling & wall lights'],['主卧人工照明层次02','主卧 · 床头照明','Bedroom · bedside lighting'],['儿童房人工照明层次','儿童房 · 灯笼与壁灯','Children’s room · lantern & wall light'],['阳台人工照明层次01','阳台 · 柜下与墙面','Balcony · cabinet & wall lighting'],['阳台人工照明层次02','阳台 · 植物与休闲','Balcony · planting & leisure']];

export function createDesignStudies({scene,model,camera,controls,renderer,state,setView,setMode,invalidate}){
 const $=s=>document.querySelector(s),stage=$('#stage'),panel=$('#analysis-panel');
 const root=new THREE.Group();root.name='CODEX_Design_Studies';scene.add(root);
 const labelRoot=document.createElement('div');labelRoot.className='analysis-labels';$('#viewport').append(labelRoot);
 const labels=[],groups=new Map(),selection={'04':new Set(Object.keys(ROUTES)),'05':new Set(['daylight','airflow']),'10':new Set(['ambient','task','accent'])};
 const sourceLights=[];scene.traverse(o=>{if(o.isLight)sourceLights.push({light:o,intensity:o.intensity,castShadow:o.castShadow,color:o.color.clone(),groundColor:o.groundColor?.clone()})});
 const dayEnvironment=scene.environmentIntensity;
 const whitePlan=createWhitePlan({scene,model,camera,controls,renderer,host:$('#viewport'),invalidate});
 const environmentClay=createEnvironmentClay({scene,model,renderer});
 const imagePlan=createImageCirculation({host:$('#viewport')});
 const imageEnvironment=createImageEnvironment({host:$('#viewport')});
 const meshRecords=[];model.traverse(o=>{if(o.isMesh)meshRecords.push({mesh:o,pair:o.userData.materialPair})});
 let chapter=null,labelsVisible=true,lastProjection='',nightMaterialCache=new Map(),nightActive=false;
 const sharedGeometry={sphere:new THREE.SphereGeometry(.065,12,8),arrow:new THREE.ConeGeometry(.10,.24,3),ring:new THREE.RingGeometry(.105,.15,32)};
 const materials=new Map();
 const lineMaterial=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshBasicMaterial({color,toneMapped:false}));return materials.get(color)};
 const newGroup=(chapterId,id)=>{const g=new THREE.Group();g.name=`CODEX_${chapterId}_${id}`;root.add(g);groups.set(chapterId+':'+id,g);return g};
 function addLabel(chapterId,layer,cn,en,position,color){
  const el=document.createElement('div');el.className='world-label'+(chapterId==='04'?' plan-label':'');el.style.setProperty('--label-color',color);el.append(document.createTextNode(cn));const small=document.createElement('small');small.textContent=en;el.append(small);labelRoot.append(el);labels.push({chapterId,layer,position:new THREE.Vector3(...position),el});
 }
 function line(parent,points,color,{height=.18,radius=.03,arrows=true,both=false}={}){
  const vectors=points.map(([x,z])=>new THREE.Vector3(x,height,z)),curve=new THREE.CurvePath();
  for(let i=1;i<vectors.length;i++)curve.add(new THREE.LineCurve3(vectors[i-1],vectors[i]));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(24,points.length*8),radius,6,false),lineMaterial(color));parent.add(mesh);
  if(arrows)for(let i=1;i<vectors.length;i++){
   const a=vectors[i-1],b=vectors[i],dir=b.clone().sub(a),length=dir.length();dir.normalize();
   const count=Math.max(1,Math.floor(length/1.15));for(let j=0;j<count;j++){
    const cone=new THREE.Mesh(sharedGeometry.arrow,lineMaterial(color));cone.position.lerpVectors(a,b,(j+.62)/count);cone.position.y+=.025;cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);parent.add(cone);
   }
  }
  if(both){const cone=new THREE.Mesh(sharedGeometry.arrow,lineMaterial(color));cone.position.copy(vectors[0]);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vectors[0].clone().sub(vectors[1]).normalize());parent.add(cone)}
  for(const v of [vectors[0],vectors.at(-1)]){const ring=new THREE.Mesh(sharedGeometry.ring,lineMaterial(color));ring.rotation.x=-Math.PI/2;ring.position.copy(v);parent.add(ring)}
  return mesh;
 }
 for(const [id,definition] of Object.entries(ROUTES)){
  const g=newGroup('04',id);g.userData.color=definition.color; // Chapter 03 routes are now authored over the supplied image.
 }
 // Room labels for chapter 03 are native SVG labels, aligned to the supplied image.
 // Chapter 04 is an image study, so it adds no hidden 3D arrow meshes.

 const nightRig=createHoverLighting({scene,camera,controls,renderer,host:$('#viewport'),invalidate,onChange:()=>updateNightStatus()});

 function emissionLayer(name){if(/米白纸灯|灯笼透光/.test(name))return 'ambient';if(/主卧.*发光|餐厨.*暖白灯带/.test(name))return 'task';if(/发光|灯芯|灯带/.test(name))return 'accent';return null}
 function nightMaterial(source){
  if(nightMaterialCache.has(source))return nightMaterialCache.get(source);
  const m=source.clone();m.onBeforeCompile=source.onBeforeCompile;m.customProgramCacheKey=source.customProgramCacheKey;m.envMapIntensity=.85;
  const layer=emissionLayer(source.name||'');if(m.emissive){m.emissive.set(0x000000);m.emissiveIntensity=0;nightRig.prepareMaterial(m,layer)}
  nightMaterialCache.set(source,m);return m;
 }
 function refreshMaterials(){
  for(const {mesh,pair} of meshRecords)mesh.material=nightActive?nightMaterial(pair.quality):pair[state.quality?'quality':'base'];

 }
 function applyLighting(){
  nightActive=chapter==='10';stage.classList.toggle('night-mode',nightActive);
  scene.environmentIntensity=nightActive?.115:chapter==='04'?.55:chapter==='05'?.40:dayEnvironment;
  for(const saved of sourceLights){
   const light=saved.light,plan=chapter==='04',environment=chapter==='05';
   light.intensity=nightActive?(light.isHemisphereLight?.09:saved.castShadow?.15:.055):plan?(light.isHemisphereLight?.85:saved.castShadow?1.45:.55):environment?(light.isHemisphereLight?.42:saved.castShadow?2.05:.22):saved.intensity;
   light.color.copy(saved.color);if(plan||environment)light.color.set(0xffffff);
   if(light.groundColor){light.groundColor.copy(saved.groundColor);if(plan||environment)light.groundColor.set(0xc3c7bd);}
   light.castShadow=nightActive?false:saved.castShadow&&state.quality;
  }
  $('#basic').disabled=nightActive||chapter==='05';refreshMaterials();renderer.shadowMap.needsUpdate=true;
 }
 function renderPanel(){
  if(chapter==='10'){renderNightPanel();return}
  if(chapter==='02'){panel.replaceChildren();return}
  const d=CHAPTERS[chapter],active=selection[chapter];
  panel.innerHTML=`<p class="panel-kicker">DESIGN STUDY / ${chapter==='04'?'03':chapter==='05'?'04':chapter}</p><h2 class="panel-lead">${d.lead}<small>${d.leadEn}</small></h2><p class="panel-sub">${d.desc}<small>${d.descEn}</small></p>${chapter==='04'?'<div class="plan-legend"><span><i class="legend-red"></i>公共生活<small>SHARED LIVING</small></span><span><i class="legend-blue"></i>静区联系<small>PRIVATE CONNECTIONS</small></span><span><i class="legend-solid"></i>主要通道<small>MAIN PASSAGE</small></span><span><i class="legend-dashed"></i>空间支线<small>ROOM BRANCH</small></span></div><p class="plan-coverage">全户型 · 11处空间<small>WHOLE HOME · 11 DESTINATIONS</small></p>':''}<div class="layers">${Object.entries(d.layers).map(([id,l])=>`<button class="layer-chip" data-layer="${id}" aria-pressed="${active.has(id)}" style="--layer-color:${l.color}"><i class="layer-swatch"></i><span><strong>${l.cn}</strong><small>${l.en}</small><span class="layer-detail">${l.detail}<small>${l.detailEn}</small></span></span><i class="layer-mark">✓</i></button>`).join('')}</div><div class="panel-actions"><button data-action="all">${chapter==='10'?'全部开启':'全部显示'}<small>${chapter==='10'?'ALL LIGHTS ON':'SHOW ALL'}</small></button>${chapter==='10'?'<button data-action="off">全部关闭<small>ALL LIGHTS OFF</small></button>':''}<button data-action="labels" aria-pressed="${labelsVisible}">${labelsVisible?'隐藏标注':'显示标注'}<small>${labelsVisible?'HIDE LABELS':'SHOW LABELS'}</small></button></div>${chapter==='10'?'<p class="night-state" id="night-state"></p><button class="reference-link" data-action="references">查看照明依据 · 9张<small>VIEW LIGHTING REFERENCES · 9 IMAGES</small></button>':''}<p class="panel-foot">${d.foot}<small>${d.footEn}</small></p>`;
  if(chapter==='05'){
   const coverage=document.createElement('div');coverage.className='environment-coverage';coverage.innerHTML='<p>全户型 · 11处空间<small>WHOLE HOME · 11 SPACES</small></p>';
   panel.querySelector('.layers').after(coverage);
  }
  panel.querySelector('.layers').before(panel.querySelector('.panel-actions'));
  panel.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>toggleLayer(b.dataset.layer)));
  panel.querySelector('[data-action="all"]').addEventListener('click',()=>setAll(true));panel.querySelector('[data-action="off"]')?.addEventListener('click',()=>setAll(false));
  panel.querySelector('[data-action="labels"]').addEventListener('click',()=>{labelsVisible=!labelsVisible;renderPanel();updateVisibility()});panel.querySelector('[data-action="references"]')?.addEventListener('click',showReferences);updateNightStatus();
 }
 function renderNightPanel(){
  const d=CHAPTERS['10'];
  panel.innerHTML=`<p class="panel-kicker">DESIGN STUDY / 05</p><h2 class="panel-lead">${d.lead}<small>${d.leadEn}</small></h2><p class="night-instruction">悬停空间，即刻点亮<small>HOVER OVER A ROOM TO REVEAL ITS LIGHT</small></p><div class="night-current" aria-live="polite"><span id="night-current-cn">全宅待览</span><small id="night-current-en">EXPLORE THE WHOLE HOME</small><p id="night-current-note">保留材质与家具细节，等待光线回应。</p><small id="night-current-note-en">Materials and furniture remain visible between rooms.</small></div><p class="night-room-heading">全户型 · ${LIGHTING_ROOMS.length}处光域<small>WHOLE HOME · ${LIGHTING_ROOMS.length} LIGHTING ZONES</small></p><div class="night-room-grid">${LIGHTING_ROOMS.map(r=>`<button data-night-room="${r.id}" aria-pressed="false"><span>${r.cn}</span><small>${r.en}</small></button>`).join('')}</div><div class="layers night-layer-controls">${Object.entries(d.layers).map(([id,l])=>`<button class="layer-chip" data-layer="${id}" aria-pressed="${selection['10'].has(id)}" style="--layer-color:${l.color}"><i class="layer-swatch"></i><span><strong>${l.cn}</strong><small>${l.en}</small></span><i class="layer-mark">✓</i></button>`).join('')}</div><div class="night-panel-links"><button data-action="hover-reset">恢复悬停<small>RESET HOVER</small></button><button data-action="references">照明依据 · 9张<small>9 LIGHTING REFERENCES</small></button></div><p class="panel-foot">${d.foot}<small>${d.footEn}</small></p>`;
  panel.querySelectorAll('[data-night-room]').forEach(b=>{
   b.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')nightRig.selectRoom(b.dataset.nightRoom)});
   b.addEventListener('focus',()=>nightRig.selectRoom(b.dataset.nightRoom));
   b.addEventListener('click',()=>nightRig.selectRoom(b.dataset.nightRoom));
  });
  panel.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.layer,active=selection['10'];active.has(id)?active.delete(id):active.add(id);b.setAttribute('aria-pressed',String(active.has(id)));nightRig.setLayers(active)}));
  panel.querySelector('[data-action="hover-reset"]').addEventListener('click',()=>nightRig.selectRoom(null));
  panel.querySelector('[data-action="references"]').addEventListener('click',showReferences);
  updateNightStatus();
 }
 function updateNightStatus(){
  if(chapter!=='10')return;const id=nightRig.current,room=LIGHTING_ROOMS.find(r=>r.id===id);
  const cn=$('#night-current-cn');if(!cn)return;
  cn.textContent=room?room.cn+' · 光已回应':'全宅待览';$('#night-current-en').textContent=room?room.en+' · LIGHT ON':'EXPLORE THE WHOLE HOME';
  $('#night-current-note').textContent=room?room.note:'保留材质与家具细节，等待光线回应。';$('#night-current-note-en').textContent=room?room.noteEn:'Materials and furniture remain visible between rooms.';
  panel.querySelectorAll('[data-night-room]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nightRoom===id)));
 }

 function updateVisibility(){
  for(const [key,g] of groups){const [ch,id]=key.split(':');g.visible=ch===chapter&&selection[ch].has(id)}
  if(nightActive){refreshMaterials();nightRig.setLayers(selection['10']);}
  imagePlan.select(selection['04'],labelsVisible);imageEnvironment.select(selection['05'],labelsVisible);
   for(const label of labels)label.el.hidden=nightActive||!labelsVisible||label.chapterId!==chapter||!(label.layer==='context'?selection['05'].size>0:selection[label.chapterId].has(label.layer));
  lastProjection='';updateLabels();renderer.shadowMap.needsUpdate=true;invalidate();
 }
 function toggleLayer(id){const active=selection[chapter];if(!Object.hasOwn(CHAPTERS[chapter].layers,id))return;active.has(id)?active.delete(id):active.add(id);updateVisibility();renderPanel()}
 function setAll(on){selection[chapter]=new Set(on?Object.keys(CHAPTERS[chapter].layers):[]);updateVisibility();renderPanel()}
 function setChapter(id,{hash=true,instant=false}={}){
  if(!CHAPTERS[id]||chapter===id)return;chapter=id;state.chapter=id;stage.dataset.chapter=id;document.querySelectorAll('button[data-chapter]').forEach(b=>{const selected=b.dataset.chapter===id;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
  const d=CHAPTERS[id];$('#chapter-title').textContent=d.title;$('#chapter-subtitle').textContent=d.en;$('#chapter-eyebrow').textContent=d.eyebrow;
  if(hash&&location.hash!=='#'+HASHES[id])history.replaceState(null,'','#'+HASHES[id]);
  // A mode selected for unlit source comparison cannot remain active at night.
  whitePlan.setActive(false);environmentClay.setActive(false);nightRig.setActive(id==='10',selection['10']);imagePlan.setActive(id==='04');imageEnvironment.setActive(id==='05');if(id==='10'&&state.mode==='base')setMode('refine');applyLighting();renderPanel();updateVisibility();
  setView(id==='04'||id==='05'?'top':'hero',id==='04'||id==='05'||instant);if(id==='04')imagePlan.fit();if(id==='05')imageEnvironment.fit();document.querySelector('#display-settings').open=false;
 }
 function updateLabels(){
  if(chapter==='04'||chapter==='05')return;
  whitePlan.update();
  const host=$('#viewport'),signature=camera.matrixWorld.elements.join(',')+'|'+camera.zoom+'|'+host.clientWidth+'|'+host.clientHeight;if(signature===lastProjection)return;lastProjection=signature;
  const occupied=[];for(const label of labels){if(label.el.hidden)continue;const v=label.position.clone().project(camera),x=(v.x+1)*host.clientWidth/2,y=(1-v.y)*host.clientHeight/2;const inFrame=v.z>=-1&&v.z<=1&&x>25&&x<host.clientWidth-25&&y>38&&y<host.clientHeight-15;
   label.el.style.visibility=inFrame?'visible':'hidden';label.el.style.left=x+'px';label.el.style.top=y+'px';if(!inFrame)continue;
   // Nudge neighbouring labels without changing their model anchors.
   let offset=0;const width=label.el.offsetWidth;for(const box of occupied)if(Math.abs(x-box.x)<(width+box.width)/2+6&&Math.abs(y+offset-box.y)<(chapter==='04'?33:48))offset-=(chapter==='04'?33:48);
   label.el.style.marginTop=offset+'px';occupied.push({x,y:y+offset,width});
  }
 }
 function showReferences(){
  let dialog=$('#lighting-references');if(!dialog){dialog=document.createElement('dialog');dialog.id='lighting-references';dialog.className='reference-dialog';dialog.innerHTML=`<header><div><h2>人工照明 · 参考依据</h2><small>ARTIFICIAL LIGHTING · REFERENCE IMAGES</small></div><button>关闭 / CLOSE</button></header><p class="reference-note">下列图像为模型布光的参考。模型以俯视切面展示各层灯光的空间关系。<small>These images guide the model lighting. The cutaway model presents the spatial relationship between lighting layers.</small></p><div class="reference-grid">${NIGHT_REFERENCES.map(([file,cn,en])=>`<figure><img loading="lazy" src="./assets/照明参考_CODEX/${file}_CODEX.jpg" alt="${cn} / ${en}"><figcaption>${cn}<small>${en}</small></figcaption></figure>`).join('')}</div>`;dialog.querySelector('header button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});document.body.append(dialog)}dialog.showModal();
 }
 function fromHash(){return Object.keys(HASHES).find(id=>HASHES[id]===location.hash.slice(1))||'04'}
 document.querySelectorAll('button[data-chapter]').forEach(b=>b.addEventListener('click',()=>setChapter(b.dataset.chapter)));
 window.addEventListener('hashchange',()=>setChapter(fromHash(),{hash:false}));
 const api={setChapter,resetPlan:()=>chapter==='05'?imageEnvironment.fit():imagePlan.fit(),setPlanInteraction:on=>{imagePlan.setInteracting(on);imageEnvironment.setInteracting(on)},setPlanPlaying:on=>{imagePlan.setPlaying(on);imageEnvironment.setPlaying(on);nightRig.setPlaying(on)},get isImagePlan(){return chapter==='04'||chapter==='05'},toggleLayer,setAll,refreshMaterials,update:now=>{updateLabels();return nightRig.update(now)},get isLightingTransitioning(){return nightRig.transitioning},get isPlan(){return chapter==='04'||chapter==='05'},get isNight(){return nightActive},get isEnvironmentStudy(){return chapter==='05'},inspect:()=>({chapter,selected:Object.fromEntries(Object.entries(selection).map(([k,s])=>[k,[...s]])),labelsVisible,visibleLabels:labels.filter(l=>!l.el.hidden&&l.el.style.visibility!=='hidden').map(l=>l.el.textContent),visibleGroups:[...groups].filter(([,g])=>g.visible).map(([k])=>k),night:nightActive,environment:scene.environmentIntensity,baselineLights:sourceLights.map(s=>({type:s.light.type,intensity:s.light.intensity})),hoverLighting:nightRig.inspect(),whitePlan:whitePlan.inspect(),imagePlan:imagePlan.inspect(),imageEnvironment:imageEnvironment.inspect(),routePoints:ROUTES,environmentClay:environmentClay.inspect(),environmentArrows:{source:'image-overlay',active:chapter==='05',routes:imageEnvironment.inspect().routeCount}})};
 state.analysis=api;setChapter(fromHash(),{hash:true,instant:true});return api;
}