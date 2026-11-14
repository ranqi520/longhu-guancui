import * as THREE from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

// Coordinates in metres; branches cross the actual model door openings.
// This is a circulation diagram, not a measured accessibility assessment.
export const PLAN_ROUTES={
 arrival:{color:'#c6464b',cn:'归家与休闲',en:'ARRIVAL & LEISURE',detail:'玄关 · 客厅 · 休闲阳台',detailEn:'Entry · Living · Leisure balcony',paths:[
  {id:'arrival-main',dashed:false,points:[[2.42,.78],[2.42,2.70],[3.85,2.70],[3.85,3.78],[3.85,6.95],[3.85,8.65]]},
  {id:'balcony-leisure',dashed:true,points:[[3.85,8.65],[4.65,8.65],[4.65,9.7]]}]},
 service:{color:'#c6464b',cn:'餐厨与家务',en:'DINING & HOUSEKEEPING',detail:'餐厅 · 厨房 · 阳台洗衣区',detailEn:'Dining · Kitchen · Balcony laundry',paths:[
  {id:'kitchen-main',dashed:false,points:[[3.85,2.70],[4.25,2.70],[4.25,1.08],[7.5,1.08]]},
  {id:'dining-branch',dashed:true,points:[[7.5,1.08],[7.5,2.72]]},
  {id:'laundry-branch',dashed:true,points:[[3.85,8.65],[1.35,8.65],[1.35,9.3]]}]},
 privacy:{color:'#367bc2',cn:'静区与阅读',en:'RETREATS & READING',detail:'儿童房 · 次卧 · 主卧 · 开放书房',detailEn:'Children’s room · Bedroom 2 · Main bedroom · Study',paths:[
  {id:'private-main',dashed:false,points:[[3.85,3.78],[10.72,3.78],[10.72,4.05],[11.65,4.05]]},
  {id:'child-branch',dashed:true,points:[[2.42,2.70],[2.25,3.05],[2.25,3.85],[2.05,4.25],[2.05,6.9]]},
  {id:'bedroom2-branch',dashed:true,points:[[9.68,3.78],[9.68,2.83],[10.85,2.83],[10.85,1.25]]},
  {id:'main-bedroom-branch',dashed:true,points:[[11.65,4.05],[14.45,4.05],[14.45,6.6]]},
  {id:'study-branch',dashed:true,points:[[9.07,3.78],[9.07,7.65],[10.4,7.65]]}]},
 sanitary:{color:'#367bc2',cn:'卫浴与起居',en:'BATHROOM CONNECTIONS',detail:'公卫 · 主卧套卫，完整纳入日常路径',detailEn:'Guest bathroom · Ensuite, connected to daily routines',paths:[
  {id:'guest-bath-branch',dashed:true,points:[[9.68,2.83],[9.68,1.5]]},
  {id:'ensuite-branch',dashed:true,points:[[14.1,4.05],[14.1,2.8],[14.1,1.5]]}]}
};
export const PLAN_ROOMS=[
 ['arrival','玄关','ENTRY',[2.0,1.65]],['arrival','客厅','LIVING',[5.45,6.85]],
 ['arrival','休闲阳台','BALCONY',[5.35,9.8]],['service','餐厅','DINING',[5.9,2.15]],
 ['service','厨房','KITCHEN',[7.4,.68]],['service','洗衣区','LAUNDRY',[.95,10.25]],
 ['privacy','儿童房','CHILDREN',[.95,5.5]],['privacy','次卧','BEDROOM 2',[12.05,1.5]],
 ['privacy','主卧','MAIN BEDROOM',[12.8,6.2]],['privacy','开放书房','OPEN STUDY',[10.15,4.65]],
 ['sanitary','公卫','GUEST BATH',[9.55,.72]],['sanitary','主卫','ENSUITE',[14.4,.72]]
];
export function createWhitePlan({scene,model,camera,controls,renderer,host,invalidate}){
 const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());
 const cache=new Map(),contours=[],meshState=[];let active=false,saved=null,lastSize='';
 const contourRoot=scene.getObjectByName('Reference architectural contours');
 contourRoot?.traverse(o=>{if(o.material?.color)contours.push({material:o.material,color:o.material.color.clone(),opacity:o.material.opacity});});
 model.traverse(mesh=>{if(mesh.isMesh)meshState.push({mesh,visible:mesh.visible,receiveShadow:mesh.receiveShadow});});
 const isCloth=name=>/床单|床品|华夫格|被褥|条纹枕/.test(name);
 const isDecoration=name=>/叶绿|绿叶|浅绿叶|嫩叶|橄榄叶|枝干|干枝|花枝|花瓣|盆土|种植土|小盆灰陶|绒毛小熊|小熊浅绒|彩绘童书|浅蓝书封|蘑菇灯|灯笼|米白纸灯/.test(name);
 function material(mesh){
  const src=mesh.userData.materialPair?.quality,name=src?.name||'';
  const section=/户型_墙体/.test(name),cloth=isCloth(name);
  const kind=section?'wall-section':cloth?'cloth':/墙体|抹灰|墙漆|墙面/.test(name)?'wall':'furniture';
  if(!cache.has(kind)){
   // A clean architectural clay study. No source maps, vertex colours, floor
   // patterns or baked surface noise are carried into the circulation chapter.
   const m=new THREE.MeshStandardMaterial({name:'CODEX White Plan '+kind,color:kind==='wall'?0xf4f3ef:0xf0f0ec,roughness:.96,metalness:0,envMapIntensity:.25,side:THREE.FrontSide,shadowSide:THREE.FrontSide,vertexColors:false,dithering:true});
   m.onBeforeCompile=shader=>{
    shader.uniforms.planGround={value:new THREE.Color(0xb3b6af)};
    shader.vertexShader='varying vec3 vPlanWorld;\nvarying float vPlanSection;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
     vPlanWorld=(modelMatrix*vec4(transformed,1.)).xyz;
     vec3 planNormal=normalize(mat3(modelMatrix)*objectNormal);
     vPlanSection=step(1.8,vPlanWorld.y)*smoothstep(.7,.96,planNormal.y);`);
    shader.fragmentShader='uniform vec3 planGround;\nvarying vec3 vPlanWorld;\nvarying float vPlanSection;\n'+shader.fragmentShader;
    if(cloth)shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
     normal=normalize(vec3(normal.xy*.10,max(.7,abs(normal.z))));`);
    if(section)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.018),vPlanSection*.96);');
    // Source floor tiles, grout and rugs share one flat ground colour. This
    // world-height mask also covers floor pieces merged into joinery meshes.
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','if(vPlanWorld.y<.125)outgoingLight=planGround;\n#include <opaque_fragment>');
   };
   m.customProgramCacheKey=()=> 'white-clay-clean-v4-'+kind;
   cache.set(kind,m);
  }
  return cache.get(kind);
 }
 function fit(){if(!active)return;const width=host.clientWidth,height=host.clientHeight;
  camera.zoom=Math.min((camera.right-camera.left)/(bounds.max.x-bounds.min.x+1.0),(camera.top-camera.bottom)/(bounds.max.z-bounds.min.z+1.0));
  // Same height for every point: a true orthographic plan, with no perspective.
  controls.target.set(center.x,.3,center.z);camera.position.set(center.x,32,center.z+.000032);camera.up.set(0,1,0);camera.updateProjectionMatrix();controls.update();camera.updateMatrixWorld();lastSize=width+'x'+height;invalidate();
 }
 function setActive(value){if(active===value)return;active=value;
  if(active){saved={enableRotate:controls.enableRotate,minPolarAngle:controls.minPolarAngle,maxPolarAngle:controls.maxPolarAngle,mouseButtons:{...controls.mouseButtons},touches:{...controls.touches}};
   controls.enableRotate=false;controls.minPolarAngle=0;controls.maxPolarAngle=0;
   controls.mouseButtons.LEFT=THREE.MOUSE.PAN;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;controls.touches.ONE=THREE.TOUCH.PAN;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
   contours.forEach(({material})=>{material.opacity=0;});
   meshState.forEach(({mesh})=>{const name=mesh.userData.materialPair?.quality?.name||'';if(isDecoration(name))mesh.visible=false;if(isCloth(name))mesh.receiveShadow=false;});
  }else if(saved){Object.assign(controls,{enableRotate:saved.enableRotate,minPolarAngle:saved.minPolarAngle,maxPolarAngle:saved.maxPolarAngle});Object.assign(controls.mouseButtons,saved.mouseButtons);Object.assign(controls.touches,saved.touches);contours.forEach(s=>{s.material.color.copy(s.color);s.material.opacity=s.opacity;});saved=null;meshState.forEach(s=>{s.mesh.visible=s.visible;s.mesh.receiveShadow=s.receiveShadow;});}
 }
 function draw(parent,definition){
  const points=definition.points,positions=points.slice(1).flatMap(([x,z],i)=>[points[i][0],3.65,points[i][1],x,3.65,z]);
  const geometry=new LineSegmentsGeometry();geometry.setPositions(positions);
  const mat=new LineMaterial({color:parent.userData.color,linewidth:definition.dashed?2.4:3.3,dashed:definition.dashed,dashSize:.18,gapSize:.105,depthTest:false,depthWrite:false,transparent:true,opacity:1,toneMapped:false});
  const line=new LineSegments2(geometry,mat);line.computeLineDistances();line.frustumCulled=false;line.renderOrder=31;line.name='CODEX Circulation '+definition.id;line.userData={routeId:definition.id,dashed:definition.dashed};
  line.onBeforeRender=r=>{const t=r.getRenderTarget();mat.resolution.set(t?t.width:r.domElement.width,t?t.height:r.domElement.height);mat.linewidth=(definition.dashed?2.4:3.3)*r.getPixelRatio();};parent.add(line);
  const arrowMat=new THREE.MeshBasicMaterial({color:parent.userData.color,depthTest:false,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const arrowPositions=[];
  // Small, flat arrows remain legible in the exact overhead view.
  for(let i=1;i<points.length;i++){const [ax,az]=points[i-1],[bx,bz]=points[i],dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);if(len<.6)continue;
   const count=definition.dashed?1:Math.max(1,Math.floor(len/2.15));
   for(let k=0;k<count;k++){const t=definition.dashed?.70:(k+.63)/count,x=ax+dx*t,z=az+dz*t,ux=dx/len,uz=dz/len;
    arrowPositions.push(x+ux*.12,3.66,z+uz*.12,x-ux*.09-uz*.085,3.66,z-uz*.09+ux*.085,x-ux*.09+uz*.085,3.66,z-uz*.09-ux*.085);
   }
  }
  const arrowsGeometry=new THREE.BufferGeometry();arrowsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(arrowPositions,3));const arrows=new THREE.Mesh(arrowsGeometry,arrowMat);arrows.renderOrder=32;parent.add(arrows);
 }
 return {material,draw,setActive,fit,update(){if(active&&lastSize!==host.clientWidth+'x'+host.clientHeight)fit();},inspect:()=>({active,projection:'orthographic-top',rotationLocked:active&&!controls.enableRotate,roomCount:PLAN_ROOMS.length,routeCount:Object.values(PLAN_ROUTES).reduce((n,r)=>n+r.paths.length,0),styleCounts:Object.fromEntries(['solid','dashed'].map(s=>[s,Object.values(PLAN_ROUTES).flatMap(r=>r.paths).filter(r=>r.dashed===(s==='dashed')).length]))})};
}
