import * as THREE from 'three';
import {connectReport} from './汇报嵌入_CODEX.js';
import {createDesignStudies} from './方案分析交互_CODEX.js';
import {refineModelDetails} from './模型细节精修_CODEX.js';
import {createReferencePresentation} from './材质线稿表现_CODEX.js';
import {createMotionDetail} from './交互细节调度_CODEX.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';
const $=s=>document.querySelector(s),host=$('#viewport');
const state={ready:false,quality:true,view:'hero',error:null,frames:0,renderTime:0,mode:'refine',moving:false,pipeline:'idle',refinement:'waiting',samples:0};
window.MATERIAL_STUDY=state;
function fail(e){state.error=String(e?.message||e);$('#loading').classList.add('done');$('#error').hidden=false;$('#error-detail').textContent=state.error;console.error(e);}
try{
 const scene=new THREE.Scene();scene.background=null;
 const presentation=createReferencePresentation();scene.add(presentation.group);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.setClearColor('#7b6a59',0);
 host.appendChild(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(new Error('图形上下文已中断，请重新加载 / Graphics context lost. Please reload.'));});
 const camera=new THREE.OrthographicCamera(-10,10,10,-10,.1,100);camera.up.set(0,1,0);camera.position.set(20.6,20.5,18.5);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(7.6,.3,5.6);controls.enableDamping=true;controls.dampingFactor=.16;controls.minZoom=.65;controls.maxZoom=6;controls.minPolarAngle=.025;controls.maxPolarAngle=Math.PI*.485;controls.screenSpacePanning=true;controls.rotateSpeed=.65;controls.panSpeed=.8;controls.zoomSpeed=.85;controls.update();
 const ew=512,eh=256,pixels=new Float32Array(ew*eh*4);
 for(let y=0;y<eh;y++)for(let x=0;x<ew;x++){
  const theta=Math.PI*(y+.5)/eh,phi=2*Math.PI*(x+.5)/ew,up=Math.cos(theta),dx=Math.sin(theta)*Math.cos(phi),dz=Math.sin(theta)*Math.sin(phi),sky=Math.max(up,0),softbox=Math.pow(Math.max(0,-.6*dx+.65*up+.46*dz),26),rim=Math.pow(Math.max(0,.75*dx+.6*up-.28*dz),22),i=(y*ew+x)*4;
  pixels[i]=.29+.43*sky+2.3*softbox+.8*rim;pixels[i+1]=.28+.44*sky+2.15*softbox+.84*rim;pixels[i+2]=.25+.44*sky+1.92*softbox+.88*rim;pixels[i+3]=1;
 }
 const environment=new THREE.DataTexture(pixels,ew,eh,THREE.RGBAFormat,THREE.FloatType);environment.mapping=THREE.EquirectangularReflectionMapping;environment.needsUpdate=true;scene.environment=environment;scene.environmentIntensity=.76;
 scene.add(new THREE.HemisphereLight(0xfff7ea,0xb8afa0,.27));
 const key=new THREE.DirectionalLight(0xfff4e4,1.75);key.position.set(-3,20,13);key.target.position.set(7.5,0,5.5);key.castShadow=true;
 key.shadow.mapSize.set(4096,4096);Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:45});key.shadow.normalBias=.012;key.shadow.bias=-.00012;key.shadow.radius=7;key.shadow.blurSamples=12;scene.add(key,key.target);
 const fill=new THREE.DirectionalLight(0xfff5e8,.20);fill.position.set(21,12,17);scene.add(fill);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.ShadowMaterial({color:0x665444,opacity:.09}));ground.rotation.x=-Math.PI/2;ground.position.set(7.5,-.17,5.5);ground.receiveShadow=false;ground.visible=false;ground.name='Disabled exterior shadow catcher';
 let renderRequest=0;
 function requestRender(){if(!renderRequest&&!document.hidden&&state.reportActive!==false&&state.ready&&!state.error)renderRequest=requestAnimationFrame(animate);}
 function suspendRender(){if(renderRequest)cancelAnimationFrame(renderRequest);renderRequest=0;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendRender();else requestRender();});
 let model,analysis,motionDetail,dirty=true,transition=null,lastMotion=0,pointerDown=false,currentDpr=0,resizePending=true,downloadBytes=0;
 const maxSamples=24,materialPairs=[],cache=new Map(),keyOrigin=key.position.clone();
 let refineInvalid=true,refineReady=false,sampleTarget,accumA,accumB,aoTarget,combineTarget,aoPass,outputPass,blendQuad,combineQuad;
 let lastStatus='';
 function status(cn,en){const signature=cn+'|'+en;if(signature===lastStatus)return;lastStatus=signature;$('#render-status').textContent=cn;$('#render-status-en').textContent=en;}
 function materialPair(m){
  if(cache.has(m))return cache.get(m);
  const n=m.name,fabric=/亚麻|织物|沙发|抱枕|靠垫|床品|被褥|棉|平织地毯/.test(n);
  const quality=fabric?new THREE.MeshPhysicalMaterial():m;
  if(fabric){THREE.MeshStandardMaterial.prototype.copy.call(quality,m);quality.sheen=.35;quality.sheenColor=new THREE.Color(0xe5d8c4);quality.sheenRoughness=.8;quality.roughness=Math.max(.82,quality.roughness);}
  quality.side=THREE.FrontSide;quality.shadowSide=THREE.FrontSide;quality.envMapIntensity=.85;quality.dithering=true;
  quality.vertexColors=/地面|地砖|地板|抹灰|墙体|墙漆|墙面|地毯/.test(n);
  quality.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','').replace('#include <aomap_fragment>',`#include <aomap_fragment>
   #if defined(USE_COLOR) || defined(USE_COLOR_ALPHA)
    reflectedLight.indirectDiffuse *= mix(1.0, vColor.r, 0.85);
    reflectedLight.indirectSpecular *= mix(1.0, vColor.r, 0.50);
   #endif`);};
  quality.customProgramCacheKey=()=> 'surface-ambient-v6';
  if(quality.map){quality.map.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());if(/木|洞石|藤|砖|亚麻|织|布|毯/.test(n)){quality.bumpMap=quality.map;quality.bumpScale=/布|亚麻|织|毯/.test(n)?.0007:.0012;}}
  if(/木|橡|柚|胡桃|白蜡/.test(n)&&!/木纹地砖/.test(n))quality.roughness=THREE.MathUtils.clamp(quality.roughness,.48,.72);
  if(/陶器|陶瓷/.test(n))quality.roughness=.38;
  if(/玻璃/.test(n)){quality.roughness=.12;quality.metalness=.02;quality.depthWrite=false;}
  if(/抹灰|墙体|暖白|浅暖灰/.test(n))quality.roughness=.92;
  if(/灯带|发光|灯芯/.test(n)){quality.emissive=new THREE.Color(0xffd5a0);quality.emissiveIntensity=.10;}
  presentation.applyMaterial(quality);
  const base=new THREE.MeshBasicMaterial({name:n+' Source',color:quality.color,map:quality.map,opacity:quality.opacity,transparent:quality.transparent,side:THREE.FrontSide,depthWrite:quality.depthWrite,toneMapped:false});
  const pair={quality,base};materialPairs.push(pair);cache.set(m,pair);return pair;
 }
 function invalidateRefinement(){
  if(state.samples>0){key.position.copy(keyOrigin);renderer.shadowMap.needsUpdate=true;}
  refineInvalid=true;state.samples=0;requestRender();
 }
 function setResolution(moving=false){
  const pixels=Math.max(1,host.clientWidth*host.clientHeight),budgetDpr=Math.sqrt(4000000/pixels);
  const night=!!analysis?.isNight;const dpr=night?(moving?Math.min(devicePixelRatio,.85):Math.min(1.35,budgetDpr,Math.max(1,devicePixelRatio))):moving?Math.min(devicePixelRatio,.85):Math.min(2,budgetDpr,Math.max(devicePixelRatio,host.clientWidth>900?2:1.25));if(dpr===currentDpr&&!resizePending)return;
  currentDpr=dpr;renderer.setPixelRatio(dpr);renderer.setSize(host.clientWidth,host.clientHeight);resizePending=false;dirty=true;invalidateRefinement();
  if(refineReady)sizeRefinement();
 }
 function resize(){
  const w=host.clientWidth,h=host.clientHeight;if(w<1||h<1)return;
  const aspect=w/h,size=innerWidth<900?Math.max(18,20/aspect):17;
  camera.left=-size*aspect/2;camera.right=size*aspect/2;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix();resizePending=true;setResolution(state.moving);dirty=true;
 }
 new ResizeObserver(resize).observe(host);window.addEventListener('resize',resize);resize();
 function markMotion(){lastMotion=performance.now();dirty=true;invalidateRefinement();}
 controls.addEventListener('change',markMotion);controls.addEventListener('start',()=>{pointerDown=true;transition=null;markMotion();});controls.addEventListener('end',()=>{pointerDown=false;markMotion();});
 const views={hero:{position:[20.6,20.5,18.5],target:[7.6,.3,5.6],zoom:1,index:'01',cn:'三维空间总览',en:'SPATIAL OVERVIEW'},top:{position:[7.6,32,5.601],target:[7.6,.3,5.6],zoom:1.05,index:'02',cn:'平面俯视',en:'TOP VIEW'},detail:{position:[13.9,12.2,16.2],target:[7,.8,5.8],zoom:1.7,index:'03',cn:'客餐厅近景',en:'LIVING & DINING DETAIL'}};
 function setView(name,instant=false){
   if(state.chapter==='04'){name='top';instant=true;}
  const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;
  const v=views[name];if(!v)return;state.view=name;host.parentElement.classList.toggle('detail-view',name==='detail');
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('#view-index').textContent=v.index;$('#view-caption').innerHTML=v.cn+'<small>'+v.en+'</small>';
  const dest={position:new THREE.Vector3(...v.position),target:new THREE.Vector3(...v.target),zoom:v.zoom};
  if(state.chapter==='10'){dest.position.set(20.6,30.5,18.5);dest.target.set(7.6,1.15,5.6);dest.zoom=1.06;}
  if(state.chapter==='05'&&name==='hero'){dest.position.set(20.6,29.0,18.5);dest.target.set(7.6,.3,5.6);}
  if(instant){camera.position.copy(dest.position);controls.target.copy(dest.target);camera.zoom=dest.zoom;camera.updateProjectionMatrix();controls.update();transition=null;markMotion();}
  else transition={start:performance.now(),from:camera.position.clone(),targetFrom:controls.target.clone(),zoomFrom:camera.zoom,...dest};
 }
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));$('#reset').addEventListener('click',()=>analysis?.isImagePlan?analysis.resetPlan():setView('hero'));
 function setMode(mode){
  if((analysis?.isNight||analysis?.isEnvironmentStudy)&&mode==='base')return;
  state.mode=mode;state.quality=mode!=='base';key.castShadow=state.quality&&!analysis?.isNight;
  if(analysis)analysis.refreshMaterials();else if(model)model.traverse(o=>{if(o.isMesh)o.material=o.userData.materialPair[state.quality?'quality':'base'];});
  for(const [id,m] of [['quality','refine'],['live','live'],['basic','base']]){$('#'+id).classList.toggle('active',mode===m);$('#'+id).setAttribute('aria-pressed',String(mode===m));}
  renderer.shadowMap.needsUpdate=true;dirty=true;invalidateRefinement();
  if(mode==='refine')status('家具细节已加载 · 正在完成画面','FURNITURE DETAILS READY · FINISHING THE VIEW');
  else status(mode==='live'?'材质线稿 · 流畅浏览':'原始色彩对照',mode==='live'?'TEXTURED CONTOURS · SMOOTH EXPLORATION':'SOURCE COLOR COMPARISON');
  if(mode==='refine'&&state.ready&&!refineReady)initRefinement();
 }
 $('#quality').addEventListener('click',()=>setMode('refine'));$('#live').addEventListener('click',()=>setMode('live'));$('#basic').addEventListener('click',()=>setMode('base'));
 $('#exposure').addEventListener('input',e=>{renderer.toneMappingExposure=+e.target.value;if(refineReady&&state.samples>=maxSamples&&state.mode==='refine')displayRefinement();else{dirty=true;requestRender();}});
 function initRefinement(){
  const target=()=>new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false});
  sampleTarget=target();sampleTarget.depthBuffer=true;accumA=target();accumB=target();aoTarget=target();combineTarget=target();
  aoPass=new GTAOPass(scene,camera,1,1);aoPass.output=GTAOPass.OUTPUT.Denoise;
  aoPass.updateGtaoMaterial({radius:.32,thickness:1,distanceExponent:2,distanceFallOff:1,scale:1,samples:24,screenSpaceRadius:false});
  aoPass.updatePdMaterial({radius:5,lumaPhi:8,depthPhi:2,normalPhi:3,samples:16});
  outputPass=new OutputPass();outputPass.renderToScreen=true;
  const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  blendQuad=new FullScreenQuad(new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{current:{value:null},history:{value:null},weight:{value:1}},vertexShader:vertex,fragmentShader:'uniform sampler2D current;uniform sampler2D history;uniform float weight;varying vec2 vUv;void main(){gl_FragColor=mix(texture2D(history,vUv),texture2D(current,vUv),weight);}'}));
  combineQuad=new FullScreenQuad(new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{image:{value:null},ao:{value:null},strength:{value:.22}},vertexShader:vertex,fragmentShader:'uniform sampler2D image;uniform sampler2D ao;uniform float strength;varying vec2 vUv;void main(){vec4 c=texture2D(image,vUv);float a=texture2D(ao,vUv).r;gl_FragColor=vec4(c.rgb*mix(1.,clamp(a,.12,1.),strength),c.a);}'}));
  refineReady=true;state.refinement='ready';sizeRefinement();
 }
 function sizeRefinement(){
  const w=renderer.domElement.width,h=renderer.domElement.height;
  for(const t of [sampleTarget,accumA,accumB,combineTarget])t.setSize(w,h);
  const ratio=Math.min(1,1500/Math.max(w,h)),aw=Math.max(1,Math.round(w*ratio)),ah=Math.max(1,Math.round(h*ratio));
  aoTarget.setSize(aw,ah);aoPass.setSize(aw,ah);refineInvalid=true;
 }
 function halton(i,b){let f=1,r=0;for(;i>0;i=Math.floor(i/b)){f/=b;r+=f*(i%b);}return r;}
 function refineFrame(){
  if(refineInvalid){
   const hidden=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&(o===ground||o.material.transparent)){hidden.push(o);o.visible=false;}});
   const contoursVisible=presentation.group.visible;presentation.group.visible=false;
   const studyHidden=[];if(analysis?.isEnvironmentStudy)for(const name of ['CODEX Environment clean furniture edges','CODEX_Design_Studies']){const group=scene.getObjectByName(name);if(group?.visible){group.visible=false;studyHidden.push(group);}}
   if(!analysis?.isPlan)aoPass.render(renderer,aoTarget,null);presentation.group.visible=contoursVisible;for(const group of studyHidden)group.visible=true;for(const o of hidden)o.visible=true;
   state.samples=0;refineInvalid=false;
  }
  const i=state.samples+1,u=halton(i,2)-.5,v=halton(i,3)-.5;
  key.position.copy(keyOrigin).add(new THREE.Vector3(u*5.2,0,v*4.2));renderer.shadowMap.needsUpdate=true;
  camera.setViewOffset(sampleTarget.width,sampleTarget.height,halton(i,5)-.5,halton(i,7)-.5,sampleTarget.width,sampleTarget.height);
  renderer.setRenderTarget(sampleTarget);renderer.render(scene,camera);camera.clearViewOffset();
  blendQuad.material.uniforms.current.value=sampleTarget.texture;blendQuad.material.uniforms.history.value=accumA.texture;blendQuad.material.uniforms.weight.value=1/i;
  renderer.setRenderTarget(accumB);blendQuad.render(renderer);[accumA,accumB]=[accumB,accumA];
  state.samples=i;displayRefinement();dirty=false;
 }
 function displayRefinement(){
  combineQuad.material.uniforms.image.value=accumA.texture;combineQuad.material.uniforms.ao.value=aoTarget.texture;
  renderer.setRenderTarget(combineTarget);combineQuad.render(renderer);outputPass.render(renderer,null,combineTarget);renderer.setRenderTarget(null);
 }
 async function loadModel(){
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.loadAsync('./assets/住宅_网页优化_v5_CODEX.glb',p=>{downloadBytes=p.total||p.loaded;if(p.total){const n=Math.min(95,Math.round(p.loaded/p.total*95));$('#progress').style.width=n+'%';$('#load-label').textContent='正在载入空间 · '+n+'%';$('#load-en').textContent='LOADING YOUR SPACE';}});
  model=gltf.scene;const detailRefinement=refineModelDetails(model);state.geometryRefinement=detailRefinement.report;state.detailRefinement=detailRefinement;let meshes=0,triangles=0;
  model.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;const pair=materialPair(o.material);o.userData.materialPair=pair;o.material=pair.quality;o.castShadow=!o.material.transparent;o.receiveShadow=!o.material.transparent;o.frustumCulled=true;});
  scene.add(model);$('#load-label').textContent='正在整理材质与轮廓';$('#load-en').textContent='PREPARING TEXTURES & CONTOURS';
  motionDetail=createMotionDetail(model);
  const motionReady=motionDetail.load();
  state.referencePresentation=await presentation.buildContours(model,renderer);await motionReady;state.bounds=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).toArray();state.meshes=meshes;state.materials=materialPairs.length;state.triangles=triangles;state.source=gltf.parser.json.extras;state.assetBytes=downloadBytes;
  renderer.shadowMap.needsUpdate=true;setView('hero',true);state.ready=true;setMode('refine');
  analysis=createDesignStudies({scene,model,camera,controls,renderer,state,setView,setMode,invalidate(){dirty=true;invalidateRefinement();}});
  dirty=true;$('#progress').style.width='100%';$('#loading').classList.add('done');
 }
 function animate(now){
  renderRequest=0;if(document.hidden||state.reportActive===false||!state.ready||state.error)return;
  if(analysis?.isImagePlan){state.pipeline='image-plan';return;}
  try{renderFrame(now);}finally{if(transition||pointerDown||dirty||now-lastMotion<600||analysis?.isLightingTransitioning||(state.mode==='refine'&&refineReady&&state.samples<maxSamples))requestRender();}
 }
 function renderFrame(now){
  
  if(analysis?.isImagePlan){state.pipeline='image-plan';return;}
   if(transition){const p=Math.min(1,(now-transition.start)/850),t=p*p*(3-2*p);camera.position.lerpVectors(transition.from,transition.position,t);controls.target.lerpVectors(transition.targetFrom,transition.target,t);camera.zoom=THREE.MathUtils.lerp(transition.zoomFrom,transition.zoom,t);camera.updateProjectionMatrix();controls.update();markMotion();if(p===1)transition=null;}else controls.update();
  if(analysis?.update(now)){dirty=true;invalidateRefinement();}
  if(combineQuad)combineQuad.material.uniforms.strength.value=analysis?.isNight?.20:analysis?.isPlan?0:analysis?.isEnvironmentStudy?.34:.22;
  const moving=pointerDown||!!transition||now-lastMotion<220,lightingMoving=!!analysis?.isLightingTransitioning;
  if(motionDetail?.update(moving)){dirty=true;invalidateRefinement();}
  if(presentation.update(!!analysis?.isNight,state.quality,renderer,moving)){dirty=true;invalidateRefinement();}
  if(state.moving!==moving){state.moving=moving;dirty=true;if(moving&&state.mode==='refine')status('旋转浏览 · 家具细节保持','EXPLORE THE DETAILED MODEL');}
  setResolution(moving||lightingMoving);state.pipeline=moving?'interactive':lightingMoving?'lighting':'idle';
  if(state.mode==='refine'&&refineReady&&!moving&&!lightingMoving&&now-lastMotion>500){
   if(state.samples<maxSamples){const start=performance.now();refineFrame();state.frames++;state.renderTime=performance.now()-start;state.pipeline='refining';}
   if(state.samples>=maxSamples){state.pipeline='refined';status(analysis?.isNight?'夜境光序 · 已就绪':'材质与轮廓 · 已就绪',analysis?.isNight?'NIGHT AMBIENCE · READY':'TEXTURES & CONTOURS · READY');}
   else status('精细画面准备中 · '+Math.round(state.samples/maxSamples*100)+'%','FINISHING THE VIEW · '+Math.round(state.samples/maxSamples*100)+'%');
   return;
  }
  if(dirty){const start=performance.now();renderer.render(scene,camera);state.frames++;state.renderTime=performance.now()-start;state.drawCalls=renderer.info.render.calls;dirty=false;}
 }
 state.inspect=()=>({ready:state.ready,error:state.error,mode:state.mode,quality:state.quality,view:state.view,moving:state.moving,pipeline:state.pipeline,refinement:state.refinement,refinementError:state.refinementError,samples:state.samples,bounds:state.bounds,geometryRefinement:state.geometryRefinement,motionDetail:motionDetail?.inspect(),referencePresentation:state.referencePresentation,triangles:state.triangles,assetBytes:state.assetBytes,meshes:state.meshes,materials:state.materials,renderTime:state.renderTime,frames:state.frames,source:state.source,analysis:analysis?.inspect(),position:camera.position.toArray(),target:controls.target.toArray(),zoom:camera.zoom,exposure:renderer.toneMappingExposure,canvas:[renderer.domElement.width,renderer.domElement.height],dpr:currentDpr,drawCalls:state.drawCalls,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures});
 state.debug={scene,camera,renderer,controls,presentation,get refinement(){return {aoPass,combineQuad,maxSamples}},get model(){return model},get motionDetail(){return motionDetail},requestRender,suspendRender,get renderScheduled(){return !!renderRequest},setMode,setView,invalidate(){dirty=true;invalidateRefinement();},probe(x,y){const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((x-r.x)/r.width*2-1,-(y-r.y)/r.height*2+1),camera);return ray.intersectObject(model,true).slice(0,8).map(h=>({name:h.object.name,material:h.object.material.name,side:h.object.material.side,color:h.object.material.color.toArray(),point:h.point.toArray(),uv:h.uv?.toArray(),normal:h.face.normal.toArray()}));}};
 connectReport({state,controls,host});
 loadModel().then(requestRender).catch(fail);
}catch(e){fail(e);}
