import * as THREE from 'three';

const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
// Fixtures follow the approved schedule and the source SketchUp construction
// coordinates (millimetres converted to metres). Shared sources are referenced
// by ID: borrowing light never creates a second lamp in the receiving room.
export const LIGHTING_ROOMS=[
 {id:'entry',cn:'玄关',en:'ENTRY',polygon:rect(1.35,.12,3.35,4.15),anchor:[2.35,1.9],note:'墙面壁灯 · 顶面筒灯',noteEn:'Wall sconce · ceiling downlights',fixtures:['entry-wall','entry-down-0','entry-down-1']},
 {id:'kitchen',cn:'厨房',en:'KITCHEN',polygon:[[3.35,.1],[8.6,.1],[8.6,3.4],[7.72,3.4],[7.72,1.38],[3.35,1.38]],anchor:[6.6,.85],note:'餐厅顶灯借光 · 烟机侧隔板灯带',noteEn:'Borrowed dining pendant light · hood-side shelf strips',fixtures:['dining-0','dining-2','dining-4','hood-shelves']},
 {id:'dining',cn:'餐厅',en:'DINING',polygon:rect(3.35,1.38,7.72,3.4),anchor:[5.85,2.12],note:'错层五联纸灯 · 餐桌柔光',noteEn:'Five staggered paper pendants · soft dining light',fixtures:['dining-0','dining-1','dining-2','dining-3','dining-4']},
 {id:'guest-bath',cn:'公卫湿区',en:'GUEST BATH · WET',polygon:rect(8.6,.12,10.3,2.28),anchor:[9.48,1.23],note:'顶面筒灯 · 柔和均匀照明',noteEn:'Ceiling downlights · soft, even illumination',fixtures:['bath-wet-0','bath-wet-1']},
 {id:'guest-bath-dry',cn:'公卫干区',en:'GUEST BATH · DRY',polygon:rect(8.6,2.28,10.3,3.4),anchor:[9.48,2.82],note:'干区顶面筒灯 · 洗漱照明',noteEn:'Dry-area ceiling downlights · washbasin illumination',fixtures:['bath-dry-0','bath-dry-1']},
 {id:'bedroom2',cn:'次卧',en:'BEDROOM 2',polygon:rect(10.3,.12,13,3.4),anchor:[11.7,1.7],note:'顶面吊灯 · 柔和卧室照明',noteEn:'Ceiling pendant · soft bedroom illumination',fixtures:['bedroom2-pendant']},
 {id:'ensuite',cn:'主卫',en:'ENSUITE',polygon:rect(13,.12,15.42,2.28),anchor:[14.2,1.25],note:'基础顶光 · 卫浴照明',noteEn:'Basic ceiling light · bathroom illumination',fixtures:['ensuite-down-0','ensuite-down-1']},
 {id:'hall',cn:'过道',en:'HALLWAY',polygon:rect(3.35,3.4,11.15,4.2),anchor:[7.8,3.8],note:'墙面壁灯 · 客厅顶面灯带借光',noteEn:'Wall sconce · borrowed living-room cove light',fixtures:['hall-wall','cove-north']},
 {id:'children',cn:'儿童房',en:'CHILDREN’S ROOM',polygon:rect(.05,4.15,3.35,8.12),anchor:[1.65,5.75],note:'顶面吊灯 · 墙面壁灯 · 窗侧筒灯',noteEn:'Ceiling pendant · wall sconce · window-side downlights',fixtures:['children-pendant','children-wall','children-down-0','children-down-1']},
 {id:'living',cn:'客厅',en:'LIVING',polygon:rect(3.35,4.2,8.72,8.12),anchor:[6.1,5.95],note:'顶面吊灯 · 顶面灯带 · 电视墙隔板灯带',noteEn:'Ceiling pendant · concealed ceiling cove · TV-wall shelf strips',fixtures:['living-pendant','cove-north','cove-south','cove-west','cove-east','tv-shelves']},
 {id:'study',cn:'开放书房',en:'OPEN STUDY',polygon:rect(8.72,4.2,11.15,8.12),anchor:[9.7,6],note:'台灯 · 顶面射灯 · 书柜灯带 · 沙发旁落地灯',noteEn:'Desk lamp · ceiling spots · bookcase strips · sofa-side floor lamp',fixtures:['study-desk','study-spot-0','study-spot-1','bookcase','sofa-floor']},
 {id:'main-bedroom',cn:'主卧',en:'MAIN BEDROOM',polygon:[[13,2.28],[15.42,2.28],[15.42,8.12],[11.15,8.12],[11.15,3.4],[13,3.4]],anchor:[13.5,5.95],note:'过道筒灯 · 床头壁灯 · 顶面造型灯 · 梳妆台隔板灯带',noteEn:'Passage downlights · bedside sconces · feature ceiling light · vanity shelf strips',fixtures:['main-passage-0','main-passage-1','bedside-0','bedside-1','main-feature-0','main-feature-1','vanity-shelves']},
 {id:'laundry',cn:'洗衣区',en:'LAUNDRY',polygon:rect(.05,8.12,2.25,11.3),anchor:[1.1,9.5],note:'洗衣槽柜体隔板灯带 · 阳台壁灯借光',noteEn:'Laundry-cabinet shelf strips · borrowed balcony wall light',fixtures:['laundry-shelves','balcony-wall']},
 {id:'balcony',cn:'休闲阳台',en:'LEISURE BALCONY',polygon:rect(2.25,8.12,8.72,11.3),anchor:[5.45,9.55],note:'阳台壁灯 · 花台射灯 · 洗衣槽柜体隔板灯带',noteEn:'Balcony wall sconce · planter spotlights · laundry-cabinet shelf strips',fixtures:['balcony-wall','planter-0','planter-1','planter-2','laundry-shelves',...Array.from({length:6},(_,i)=>'garden-lantern-'+i)]}
];
const fixtures=[];
const add=(id,type,layer,p,options={})=>{const f={id,type,layer,p,power:2.0,distance:5.4,angle:1.05,...options};fixtures.push(f);return f};
const down=(id,x,z,options={})=>add(id,'downlight','ambient',[x,2.755,z],{target:[x,.35,z],power:1.55,...options});
add('entry-wall','wall','accent',[1.985,1.935,1.652],{existing:true,target:[2.48,1.05,1.65],power:1.05,distance:3.0,bounds:[[1.94,1.78,1.60],[2.035,2.10,1.71]],emitterGain:1.35});
down('entry-down-0',2.68,1.46,{power:1.55,angle:1.12});down('entry-down-1',2.68,2.60,{power:1.55,angle:1.12});
[[5.65,2.31,2.29,.18,.52],[5.55,1.825,2.01,.19,.25],[6.12,2.135,2.11,.15,.39],[6.10,2.06,2.55,.145,.32],[6.47,1.99,2.31,.115,.28]].forEach((p,i)=>add('dining-'+i,'pendant','ambient',p.slice(0,3),{radius:p[3],height:p[4],power:1.4,target:[p[0],.76,p[2]],distance:5.7}));
add('hood-shelves','strip','task',[8.02,1.76,1.98],{segments:[[[8.022,1.542,.61],[8.022,1.542,3.34]],[[8.022,2.042,.61],[8.022,2.042,3.34]]],existing:true,target:[7.72,.85,1.95],power:1.15,distance:3.5,bounds:[[7.98,1.50,.57],[8.06,2.08,3.38]]});
down('bath-wet-0',9.43,.71);down('bath-wet-1',9.43,1.72);
down('bath-dry-0',9.08,2.83);down('bath-dry-1',9.83,2.83);
add('bedroom2-pendant','pendant','ambient',[11.66,2.20,1.74],{radius:.235,height:.36,power:2.65,target:[11.66,.55,1.74],distance:5.3});
down('ensuite-down-0',13.73,1.16);down('ensuite-down-1',14.77,1.16);
add('hall-wall','wall','accent',[8.66,1.86,3.64],{existing:true,target:[8.5,.55,3.95],power:1.0,bounds:[[8.5,1.65,3.5],[8.8,2.08,3.8]]});
add('children-pendant','pendant','ambient',[1.32,2.415,5.89],{radius:.278,height:.61,power:2.7,target:[1.32,.5,5.89]});
add('children-wall','wall','accent',[.98,1.74,4.515],{existing:true,target:[1.08,.65,4.9],power:1.0,distance:3.0,bounds:[[.81,1.725,4.35],[1.15,1.90,4.68]],emitterPattern:'蘑菇灯橘红|灯笼透光',emitterGain:1.25});
down('children-down-0',.62,7.72,{layer:'task',power:1.15});down('children-down-1',1.99,7.72,{layer:'task',power:1.15});
add('living-pendant','pendant','ambient',[5.35,2.16,5.88],{radius:.329,height:.7,power:3.6,target:[5.35,.4,5.88],distance:6.4});
for(const [id,a,b,target] of [
 ['north',[3.5,2.795,3.96],[10.83,2.795,3.96],[7,.8,4.4]],
 ['south',[3.5,2.795,7.49],[10.83,2.795,7.49],[7,.7,7.1]],
 ['west',[3.46,2.795,3.99],[3.46,2.795,7.47],[3.9,1,5.7]],
 ['east',[10.87,2.795,3.99],[10.87,2.795,7.47],[10.4,1,5.7]]
]) add('cove-'+id,'cove','accent',a.map((v,i)=>(v+b[i])/2),{segments:[[a,b]],target,power:1.1,distance:5.7});
add('tv-shelves','strip','accent',[3.018,1.75,5.95],{existing:true,indirectOnly:true,target:[3.42,1.05,5.95],power:.9,distance:3.5,bounds:[[2.98,1.44,4.3],[3.045,2.06,7.81]]});
add('study-desk','table','task',[9.87,1.105,6.81],{existing:true,target:[9.7,.76,6.72],power:.75,distance:2.5,bounds:[[9.69,.97,6.63],[10.05,1.25,6.99]]});
add('sofa-floor','floor','task',[8.13,1.72,7.61],{existing:true,target:[7.85,.6,7.13],power:1.25,distance:3.2,bounds:[[7.88,1.55,7.36],[8.38,1.91,7.86]]});
add('bookcase','strip','accent',[11.006,1.75,6.2],{existing:true,target:[10.65,1.0,6.25],power:1.0,distance:3.5,bounds:[[10.98,1.02,4.5],[11.03,2.67,7.8]]});
add('study-spot-0','spot','ambient',[9.47,2.76,5.35],{target:[9.8,.75,5.75],power:1.65});
add('study-spot-1','spot','ambient',[10.13,2.76,6.85],{target:[10.6,1.3,6.8],power:1.65});
// Passage lights sit over the circulation strip, clear of the wardrobe.
[12.75,14.05].forEach((x,i)=>down('main-passage-'+i,x,3.92,{power:1.32,angle:1.08}));
[7.51,5.09].forEach((z,i)=>add('bedside-'+i,'wall','task',[11.766,1.72,z],{existing:true,target:[12.2,.7,z],power:1.18,distance:3.2,bounds:[[11.66,1.58,z-.115],[11.9,1.86,z+.115]],emitterPattern:'主卧_暖白亚麻灯罩|主卧_暖白发光灯芯',emitterGain:1.15}));
add('main-feature-0','spot','ambient',[13.25,2.587,6.38],{target:[13.25,.6,6.38],power:2.2,angle:1.14});
add('main-feature-1','spot','ambient',[13.41,2.587,6.38],{target:[13.95,.6,6.38],power:2.2});
add('vanity-shelves','strip','accent',[14.71,1.82,7.28],{existing:true,target:[14.62,.84,7.28],power:1.05,distance:3.0,bounds:[[14.67,1.49,6.93],[15.35,2.73,7.63]]});
add('balcony-wall','wall','ambient',[2.74,1.97,8.53],{existing:true,target:[3.15,.55,8.95],power:1.45,distance:4.3,bounds:[[2.59,1.78,8.39],[2.89,2.12,8.66]]});
add('laundry-shelves','strip','task',[.329,1.95,9.4],{existing:true,target:[.66,.98,9.4],power:1.15,distance:3.5,bounds:[[.305,1.59,8.22],[.35,2.38,10.59]]});
[[3.5,.6,10.34],[5.45,.6,10.34],[7.55,.6,10.34]].forEach((p,i)=>add('planter-'+i,'spot','accent',p,{target:[p[0],1.35,10.65],power:1.0,distance:3.2,angle:1.05}));
// Reuse the six low garden lanterns already present in the exported model.
[[3.45,.45,10.41],[4.93,.45,10.41],[6.23,.45,10.41],[7.54,.45,10.41],[7.95,.49,9.29],[2.66,.66,10.45]].forEach(([x,y,z],i)=>add('garden-lantern-'+i,'garden-lantern','accent',[x,y+.26,z],{existing:true,indirectOnly:true,power:0,bounds:[[x-.035,y+.215,z-.035],[x+.035,y+.305,z+.035]],emitterGain:1.5}));
export const LIGHTING_FIXTURES=fixtures;

export function createHoverLighting({scene,camera,controls,renderer,host,invalidate,onChange}){
 const root=new THREE.Group();root.name='CODEX approved fixture schedule';root.visible=false;scene.add(root);
 const rooms=new Map(LIGHTING_ROOMS.map(r=>[r.id,r]));
 const physical=new Map(fixtures.map(f=>[f.id,{...f,strength:0,materials:[],meshes:[]}]));
 // Six fixed, shadow-free lights avoid shader recompilation while changing rooms.
 const pool=Array.from({length:6},()=>{const l=new THREE.SpotLight(0xffd9b0,0,5,1.05,1,2);l.castShadow=false;root.add(l,l.target);return {light:l,spec:null,strength:0}});
 const sourceMin=Array.from({length:12},()=>new THREE.Vector3(1e4,1e4,1e4));
 const sourceMax=Array.from({length:12},()=>new THREE.Vector3(-1e4,-1e4,-1e4));
 const sourceGain=Array.from({length:12},()=>0);
 const coveGain=new THREE.Vector4(),gardenGain=new THREE.Vector3(),materialSources=[];
 const sourceUniforms={nightSourceMin:{value:sourceMin},nightSourceMax:{value:sourceMax},nightSourceGain:{value:sourceGain},nightCoveGain:{value:coveGain},nightGardenGain:{value:gardenGain}};
 let sourceSpecs=[];
 let active=false,playing=true,current=null,layers=new Set(['ambient','task','accent']),dirty=true,lastNow=0,lastRay=0,touchStart=null,savedControls=null;
 const warm=new THREE.Color(0xffd5a2),off=new THREE.Color(0x393027);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.65),hit=new THREE.Vector3();
 const sphere=new THREE.SphereGeometry(1,32,20),lens=new THREE.CylinderGeometry(.035,.035,.012,20);
 const cordMaterial=new THREE.MeshBasicMaterial({color:0x60554a,toneMapped:false});
 function mesh(f,g,p,glow=true){const m=glow?new THREE.MeshBasicMaterial({color:off,toneMapped:false}):cordMaterial;if(glow)f.materials.push(m);const o=new THREE.Mesh(g,m);o.position.set(...p);o.name=f.id;root.add(o);f.meshes.push(o);return o}
 for(const f of physical.values()){
  if(f.existing)continue;
  if(f.type==='pendant'){
   const shade=mesh(f,sphere,f.p);shade.scale.set(f.radius,f.height/2,f.radius);
   const a=new THREE.Vector3(f.p[0],f.p[1]+f.height/2,f.p[2]),b=new THREE.Vector3(f.p[0],2.96,f.p[2]);
   mesh(f,new THREE.TubeGeometry(new THREE.LineCurve3(a,b),1,.002,4,false),[0,0,0],false);
   for(let i=-4;i<=4;i++){const v=i/5,r=f.radius*Math.sqrt(1-v*v),rib=mesh(f,new THREE.TorusGeometry(r,.0014,3,40),[f.p[0],f.p[1]+v*f.height/2,f.p[2]],false);rib.rotation.x=Math.PI/2;}
  }else if(f.type==='cove'){
   // Keep the concealed bounce light while the ceiling is cut away;
   // an exposed luminous perimeter would float above the open model.
   continue;
  }else if(f.type==='wall'){
   const o=mesh(f,sphere,f.p);o.scale.set(.07,.10,.05);
  }else{
   const o=mesh(f,lens,f.p);if(f.p[1]<1)o.rotation.x=Math.PI;
  }
 }
 function contains(r,x,z){let inside=false;const p=r.polygon;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,zi]=p[i],[xj,zj]=p[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside}return inside}
 function roomAt(x,y){const b=renderer.domElement.getBoundingClientRect();if(x<b.left||x>b.right||y<b.top||y>b.bottom)return null;pointer.set((x-b.left)/b.width*2-1,-(y-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);if(!ray.ray.intersectPlane(plane,hit))return null;return LIGHTING_ROOMS.find(r=>contains(r,hit.x,hit.z))?.id||null}
 function selectedFixtures(){return new Set(current?rooms.get(current).fixtures:[])}
 function configure(){
  const selected=[...selectedFixtures()].map(id=>physical.get(id));
  if(!selected.length)return;
  // Spread the master's finite light budget across all specified fixture types.
  const ranked=current==='main-bedroom'?['main-passage-0','main-passage-1','bedside-0','bedside-1','main-feature-0','vanity-shelves'].map(id=>physical.get(id)):selected.filter(f=>f.type!=='cove'&&!f.indirectOnly);
  pool.forEach((p,i)=>{p.spec=ranked[i]||null;p.strength=0;p.light.intensity=0;if(!p.spec)return;const f=p.spec;p.light.position.set(...f.p);p.light.target.position.set(...(f.target||[f.p[0],.35,f.p[2]]));p.light.angle=f.angle;p.light.distance=f.distance;});
  sourceMin.forEach(v=>v.set(1e4,1e4,1e4));sourceMax.forEach(v=>v.set(-1e4,-1e4,-1e4));sourceGain.fill(0);
  sourceSpecs=selected.filter(f=>f.bounds);sourceSpecs.forEach((f,i)=>{sourceMin[i].set(...f.bounds[0]);sourceMax[i].set(...f.bounds[1]);});
  for(const {name,layer,mask} of materialSources)updateSourceMask(name,layer,mask);
 }
 function selectRoom(id){if(!active||!playing)return;id=rooms.has(id)?id:null;if(current===id)return;current=id;configure();dirty=true;onChange?.(id?rooms.get(id):null);invalidate()}
 function reset(){current=null;for(const f of physical.values()){f.strength=0;for(const m of f.materials)m.color.copy(off)}for(const p of pool){p.light.intensity=0;p.strength=0;p.spec=null}sourceGain.fill(0);sourceSpecs=[];coveGain.set(0,0,0,0);gardenGain.set(0,0,0);dirty=true;onChange?.(null);invalidate()}
 host.addEventListener('pointermove',e=>{if(!active||!playing||e.pointerType==='touch')return;const now=performance.now();if(now-lastRay<28)return;lastRay=now;selectRoom(roomAt(e.clientX,e.clientY))});
 host.addEventListener('pointerleave',e=>{if(active&&e.pointerType==='mouse')selectRoom(null)});
 host.addEventListener('pointerdown',e=>{if(active&&e.pointerType!=='mouse'&&e.isPrimary!==false)touchStart={id:e.pointerId,x:e.clientX,y:e.clientY}});
 host.addEventListener('pointerup',e=>{if(!touchStart||e.pointerId!==touchStart.id)return;const p=touchStart;touchStart=null;if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<12)selectRoom(roomAt(e.clientX,e.clientY))});
 host.addEventListener('pointercancel',()=>{touchStart=null});
 window.addEventListener('blur',()=>{if(active)reset()});
 function approach(v,t,speed){const n=v+(t-v)*speed;return Math.abs(t-n)<.008?t:n}
 function update(now=performance.now()){
  if(!active||!playing)return false;controls.enabled=false;
  const dt=Math.min(.09,(now-lastNow)/1000||.016);lastNow=now;const speed=1-Math.exp(-dt*9),selected=selectedFixtures();let changed=dirty;dirty=false;
  for(const f of physical.values()){
   const target=selected.has(f.id)&&layers.has(f.layer)?1:0,n=approach(f.strength,target,speed);if(n!==f.strength)changed=true;f.strength=n;
   for(const m of f.materials)m.color.copy(off).lerp(warm,n*.78);
  }
  for(const p of pool){if(!p.spec)continue;p.strength=physical.get(p.spec.id).strength;p.light.intensity=p.spec.power*p.strength;}
  sourceSpecs.forEach((f,i)=>{sourceGain[i]=f.strength;});
  coveGain.set(...['north','south','west','east'].map(id=>physical.get('cove-'+id).strength));
  gardenGain.set(...[0,1,2].map(i=>physical.get('planter-'+i).strength));return changed;
 }
 // Source masks keep a sconce shade luminous without making nearby walls glow.
 function updateSourceMask(name,layer,mask){mask.fill(0);sourceSpecs.forEach((f,i)=>{mask[i]=(f.emitterPattern?new RegExp(f.emitterPattern).test(name):!!layer)?(f.emitterGain||1):0;});}
 function prepareMaterial(m,layer){
  if(!m.emissive)return;m.emissive.set(0);m.emissiveIntensity=0;
  const mask=Array(12).fill(0),name=m.name||'';materialSources.push({name,layer,mask});updateSourceMask(name,layer,mask);
  const previous=m.onBeforeCompile,cache=m.customProgramCacheKey();
  m.onBeforeCompile=shader=>{previous(shader);Object.assign(shader.uniforms,sourceUniforms,{nightSourceMask:{value:mask}});
   shader.vertexShader='varying vec3 vNightWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvNightWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
   shader.fragmentShader=`varying vec3 vNightWorld;
    uniform vec3 nightSourceMin[12];
    uniform vec3 nightSourceMax[12];
    uniform float nightSourceGain[12];
    uniform float nightSourceMask[12];
    uniform vec4 nightCoveGain;
    uniform vec3 nightGardenGain;
    float nightBand(float t,float lo,float hi,float feather){return smoothstep(lo-feather,lo,t)*(1.0-smoothstep(hi,hi+feather,t));}
    `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float localGlow=0.0;
    for(int i=0;i<12;i++){
     vec3 lo=step(nightSourceMin[i],vNightWorld),hi=step(vNightWorld,nightSourceMax[i]);
     localGlow=max(localGlow,lo.x*lo.y*lo.z*hi.x*hi.y*hi.z*nightSourceGain[i]*nightSourceMask[i]);
    }
    totalEmissiveRadiance+=vec3(1.0,.70,.42)*localGlow*.55;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    // Continuous reflected cove light: upper surfaces receive light, with no visible floating emitter.
    vec3 nightNormal=inverseTransformDirection(normal,viewMatrix);
    float nightWall=1.0-abs(nightNormal.y);
    float nightHeight=exp(-pow((vNightWorld.y-2.78)/1.05,2.0));
    float nightX=nightBand(vNightWorld.x,2.99,11.10,.10);
    float nightZ=nightBand(vNightWorld.z,3.45,7.90,.10);
    vec4 nightDistance=vec4(vNightWorld.z-3.96,vNightWorld.z-7.49,vNightWorld.x-3.46,vNightWorld.x-10.87);
    vec4 nightFalloff=exp(-nightDistance*nightDistance/vec4(.49));
    float nightCove=dot(nightFalloff,nightCoveGain)*nightHeight*nightWall*nightX*nightZ;
    // A soft upward garden wash reveals foliage around the existing low lanterns.
    vec2 nightGardenPoint=vNightWorld.xz;
    vec2 nightG0=nightGardenPoint-vec2(3.30,10.55),nightG1=nightGardenPoint-vec2(5.35,10.60),nightG2=nightGardenPoint-vec2(7.55,10.43);
    vec3 nightGardenFalloff=exp(-vec3(dot(nightG0,nightG0),dot(nightG1,nightG1),dot(nightG2,nightG2))/1.12);
    float nightGarden=dot(nightGardenFalloff,nightGardenGain)*nightBand(vNightWorld.y,.30,2.7,.22)*nightBand(vNightWorld.z,9.0,11.26,.12);
    reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(1.0,.73,.43)*(nightCove*.27+nightGarden*.24);
   `);
  };m.customProgramCacheKey=()=>cache+'-approved-bounce-v3';
 }
 return {selectRoom,reset,roomAt,prepareMaterial,update,
  setActive(on,selected){if(on&&!active)savedControls=controls.enabled;if(!on&&active&&savedControls!==null)controls.enabled=savedControls;active=!!on;root.visible=active;if(selected)layers=new Set(selected);reset();lastNow=performance.now();if(active)controls.enabled=false},
  setLayers(selected){layers=new Set(selected);dirty=true;invalidate()},
  setPlaying(on){playing=!!on;if(!playing)reset();lastNow=performance.now()},
  get transitioning(){if(!active||!playing)return false;const selected=selectedFixtures();return [...physical.values()].some(f=>Math.abs(f.strength-(selected.has(f.id)&&layers.has(f.layer)?1:0))>.008)},
  get current(){return current},
  inspect:()=>({active,playing,current,roomCount:rooms.size,roomNames:LIGHTING_ROOMS.map(r=>r.cn),rotationLocked:!controls.enabled,modelLabels:0,fixtureCount:physical.size,lightPoolSize:pool.length,coveBounce:coveGain.toArray(),gardenBounce:gardenGain.toArray(),shadowLights:0,layers:[...layers],rooms:LIGHTING_ROOMS.map(r=>({id:r.id,cn:r.cn,anchor:r.anchor,polygon:r.polygon,fixtures:r.fixtures})),fixtures:[...physical.values()].map(f=>({id:f.id,type:f.type,layer:f.layer,position:f.p,target:f.target,sourceBounds:f.bounds,strength:f.strength})),lights:pool.map(p=>({id:p.spec?.id||null,intensity:p.light.intensity,position:p.light.position.toArray()}))})
 };
}
