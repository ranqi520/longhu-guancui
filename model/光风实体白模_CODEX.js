import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// White architectural study: source geometry stays intact and is restored on exit.
export function createEnvironmentClay({scene,model,renderer}){
 const cache=new Map(),meshes=[],contours=[];let active=false;
 model.traverse(mesh=>{if(mesh.isMesh)meshes.push({mesh,visible:mesh.visible,castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow})});
 scene.getObjectByName('Reference architectural contours')?.traverse(o=>{
  if(o.material?.color)contours.push({material:o.material,color:o.material.color.clone(),opacity:o.material.opacity});
 });
 const cleanContours=new THREE.Group();cleanContours.name='CODEX Environment clean furniture edges';cleanContours.visible=false;scene.add(cleanContours);
 const decorative=/叶绿|绿叶|浅绿叶|嫩叶|橄榄叶|枝干|干枝|花枝|花瓣|盆土|种植土|小熊|彩绘童书|浅蓝书封|蘑菇灯|灯笼|米白纸灯|暖白灯芯|流苏|树皮|干花|白花|花心|小花|紫褐果实|青苹果|华夫格毯|自然米色窗帘|罗马帘织物|透光奶白纱帘/;
 function material(mesh){
  const name=mesh.userData.materialPair?.quality?.name||'';
  const kind=/户型_墙体/.test(name)?'section':/透明|清玻璃|透光.*纱帘/.test(name)?'glass':/门窗深灰框/.test(name)?'frame':/墙面|抹灰|墙漆/.test(name)?'wall':'furniture';
  if(cache.has(kind))return cache.get(kind);
  const colors={section:0xe4e4df,wall:0xefefeb,furniture:0xf1f1ed,frame:0x92968f,glass:0xf1f3ee};
  const m=new THREE.MeshStandardMaterial({name:'CODEX Environment Clay '+kind,color:colors[kind],roughness:.86,metalness:0,envMapIntensity:.16,side:THREE.FrontSide,vertexColors:false,dithering:true,transparent:kind==='glass',opacity:kind==='glass'?.10:1,depthWrite:kind!=='glass'});
  m.onBeforeCompile=shader=>{
   shader.uniforms.clayFloor={value:new THREE.Color(0xb7bab3)};
   shader.vertexShader='varying vec3 vClayWorld;\nvarying float vClayCap;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    vClayWorld=(modelMatrix*vec4(transformed,1.)).xyz;
    vec3 clayNormal=normalize(mat3(modelMatrix)*objectNormal);
    vClayCap=step(2.45,vClayWorld.y)*smoothstep(.80,.98,abs(clayNormal.y));`);
   shader.fragmentShader='uniform vec3 clayFloor;\nvarying vec3 vClayWorld;\nvarying float vClayCap;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vClayWorld.y<.13)diffuseColor.rgb=clayFloor;');
   if(kind==='section')shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=mix(outgoingLight,vec3(.008),vClayCap);\n#include <opaque_fragment>');
  };
  m.customProgramCacheKey=()=> 'environment-clay-v1-'+kind;cache.set(kind,m);return m;
 }
 function featureEdges(mesh,settings,output){
  const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index;
  const count=index?index.count:position.count;
  if(!count)return 0;
  const vertices=[],ids=new Int32Array(position.count),welded=new Map();
  for(let i=0;i<position.count;i++){
   const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
   const key=Math.round(x*10000)+','+Math.round(y*10000)+','+Math.round(z*10000);
   let id=welded.get(key);
   if(id===undefined){id=vertices.length;welded.set(key,id);vertices.push([x,y,z]);}ids[i]=id;
  }
  const edges=new Map(),faces=new Set(),threshold=Math.cos(settings.angle*Math.PI/180);
  const add=(a,b,nx,ny,nz)=>{
   if(a>b)[a,b]=[b,a];
   const key=a+':'+b,edge=edges.get(key);
   if(!edge)edges.set(key,{a,b,nx,ny,nz,count:1,crease:false});
   else{edge.count++;if(Math.abs(edge.nx*nx+edge.ny*ny+edge.nz*nz)<threshold)edge.crease=true;}
  };
  for(let i=0;i<count;i+=3){
   const a=ids[index?index.getX(i):i],b=ids[index?index.getX(i+1):i+1],c=ids[index?index.getX(i+2):i+2];
   if(a===b||b===c||c===a)continue;
   const sorted=[a,b,c].sort((x,y)=>x-y),key=sorted.join(':');if(faces.has(key))continue;faces.add(key);
   const p=vertices[a],q=vertices[b],r=vertices[c],ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const length=Math.hypot(nx,ny,nz);if(length<1e-11)continue;
   nx/=length;ny/=length;nz/=length;add(a,b,nx,ny,nz);add(b,c,nx,ny,nz);add(c,a,nx,ny,nz);
  }
  const point=new THREE.Vector3(),minimum=settings.min**2;let emitted=0;
  for(const edge of edges.values()){
   if(edge.count!==1&&!edge.crease)continue;
   const a=vertices[edge.a],b=vertices[edge.b];
   if((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2<minimum)continue;
   for(const p of [a,b]){point.set(...p).applyMatrix4(mesh.matrixWorld);output.push(point.x,point.y,point.z);}emitted++;
  }
  return emitted;
 }
 function setActive(value){
  if(active===value)return;active=value;
  if(active){
   contours.forEach(({material})=>{material.opacity=0;});cleanContours.visible=true;
   meshes.forEach(({mesh})=>{const name=mesh.userData.materialPair?.quality?.name||'';if(decorative.test(name))mesh.visible=false;
    if(/床单|床品|华夫格|被褥|条纹枕/.test(name))mesh.receiveShadow=false;
    if(/透明|清玻璃|纱帘/.test(name))mesh.castShadow=false;
   });
  }else{
   cleanContours.visible=false;contours.forEach(s=>{s.material.color.copy(s.color);s.material.opacity=s.opacity;});
   meshes.forEach(s=>{s.mesh.visible=s.visible;s.mesh.castShadow=s.castShadow;s.mesh.receiveShadow=s.receiveShadow;});
  }
  renderer.shadowMap.needsUpdate=true;
 }
 // One merged draw call for white furniture and architecture, with no floor seams.
 const edgePositions=[];
 for(const {mesh} of meshes){
  const name=mesh.userData.materialPair?.quality?.name||'';
  if(decorative.test(name)||/地面|地板|地砖|地毯|接缝|拼缝|勾缝|毛石|地石|树皮|背墙窄砖|灯芯|灯带|玻璃|书封|书页|桌旗|嵌线|纱帘/.test(name))continue;
  const positions=[];featureEdges(mesh,{angle:/布艺|床单|被褥|床品|织物|抱枕|靠垫|亚麻|华夫格/.test(name)?72:43,min:.055},positions);
  for(let i=0;i<positions.length;i+=6)if(Math.min(positions[i+1],positions[i+4])>.14)edgePositions.push(...positions.slice(i,i+6));
 }
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3));
 const em=new THREE.LineBasicMaterial({color:0x41483f,transparent:true,opacity:.44,depthTest:true,depthWrite:false,toneMapped:false});
 em.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <logdepthbuf_vertex>','gl_Position.z-=0.000006*gl_Position.w;\n#include <logdepthbuf_vertex>');};
 const edges=new THREE.LineSegments(eg,em);edges.frustumCulled=false;edges.renderOrder=4;edges.raycast=()=>{};cleanContours.add(edges);
 return {material,setActive,inspect:()=>({active,style:'white-solid-black-wall-caps',floor:'plain-grey',textured:false,materials:cache.size,meshCount:meshes.length,cleanEdgeCount:edgePositions.length/6})};
}

// Locations are model coordinates, not inferred sun bearings or wind velocities.
// Short dashed red arrows show borrowed light rather than an invented external window.
export const ENVIRONMENT_ROOMS=[
 {id:'entry',cn:'玄关',en:'ENTRY',at:[2,1.65],light:'借光',lightEn:'BORROWED LIGHT',borrowed:true,red:[[4,2.8],[2.65,2.1]],blue:[[2.6,1.35],[2.6,2.7],[3.65,2.7]],label:true},
 {id:'living',cn:'客厅',en:'LIVING',at:[5.2,6.6],light:'双向引光',lightEn:'TWO-SIDED DAYLIGHT',red:[[4.65,8.65],[4.65,5.65]],blue:[[4.0,8.95],[4.0,6.7],[4.0,3.8]],label:true},
 {id:'balcony',cn:'休闲阳台',en:'LEISURE BALCONY',at:[5.1,9.75],light:'外缘采光',lightEn:'PERIMETER DAYLIGHT',red:[[6.65,11.65],[6.65,9.25]],blue:[[3.6,11.55],[3.6,9.25],[4.0,8.95]],label:true},
 {id:'dining',cn:'餐厅',en:'DINING',at:[5.75,2.65],light:'临窗引光',lightEn:'WINDOW DAYLIGHT',red:[[5.45,-.65],[5.45,2.5]],blue:[[4.0,3.8],[4.0,2.6],[4.0,1.35],[5.45,1.35],[5.45,-.45]],label:true},
 {id:'kitchen',cn:'厨房',en:'KITCHEN',at:[7.15,.50],light:'临窗引光',lightEn:'WINDOW DAYLIGHT',red:[[7.3,-.65],[7.3,1.75]],blue:[[7.5,-.45],[7.5,1.12],[5.6,1.12]],label:true},
 {id:'laundry',cn:'洗衣区',en:'LAUNDRY',at:[.95,9.6],light:'阳台引光',lightEn:'BALCONY DAYLIGHT',red:[[1.2,11.65],[1.2,9.15]],blue:[[.9,10.9],[.9,8.65],[3.6,8.65]],label:true},
 {id:'children',cn:'儿童房',en:'CHILDREN',at:[1.2,5.6],light:'外窗采光',lightEn:'WINDOW DAYLIGHT',red:[[1.1,8.65],[1.1,5.75]],blue:[[1.85,8.45],[1.85,5.0],[2.05,4.25],[2.25,3.85],[2.25,3.05],[2.42,2.7]],label:true},
 {id:'bedroom2',cn:'次卧',en:'BEDROOM 2',at:[11.65,1.85],light:'外窗采光',lightEn:'WINDOW DAYLIGHT',red:[[11.5,-.65],[11.5,2.1]],blue:[[12.1,-.45],[12.1,1.7],[10.85,1.7],[10.85,2.83],[9.68,2.83],[9.68,3.78]],label:true},
 {id:'bedroom',cn:'主卧',en:'MAIN BEDROOM',at:[13.5,6.65],light:'外窗采光',lightEn:'WINDOW DAYLIGHT',red:[[13.4,8.65],[13.4,5.65]],blue:[[14.6,8.45],[14.6,5.55],[14.45,4.05],[11.65,4.05],[10.72,4.05],[10.72,3.78],[9.68,3.78],[4.0,3.8]],label:true},
 {id:'study',cn:'开放书房',en:'OPEN STUDY',at:[9.6,6.75],light:'窗边与共享借光',lightEn:'WINDOW & SHARED LIGHT',red:[[9.6,9.7],[9.6,7.0]],blue:[[10.5,9.45],[10.5,7.65],[9.07,7.65],[9.07,3.78]],label:true},
 {id:'guestbath',cn:'公卫',en:'GUEST BATH',at:[9.25,.5],light:'高窗采光',lightEn:'HIGH-WINDOW DAYLIGHT',red:[[9.15,-.65],[9.15,1.25]],blue:[[9.68,2.83],[9.68,1.55],[9.68,-.45]],label:true},
 {id:'ensuite',cn:'主卫',en:'ENSUITE',at:[14.35,1.4],light:'高窗采光',lightEn:'HIGH-WINDOW DAYLIGHT',red:[[14.65,-.65],[14.65,1.25]],blue:[[14.1,4.05],[14.1,2.8],[14.1,1.5],[14.7,1.5],[14.7,-.45]],label:true}
];
export function buildEnvironmentArrows({daylight,airflow,addLabel}){
 const red=new THREE.MeshStandardMaterial({name:'CODEX Daylight red solid',color:0xcc3139,roughness:.42,metalness:.10,envMapIntensity:.25});
 const blue=new THREE.MeshStandardMaterial({name:'CODEX Airflow blue solid',color:0x287ed0,roughness:.36,metalness:.10,envMapIntensity:.25});
 function redArrow(a,b,dashed=false){
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),head=Math.min(.55,len*.35),width=dashed?.095:.13;
  const shape=new THREE.Shape();shape.moveTo(-width,0);shape.lineTo(width,0);shape.lineTo(width,len-head);shape.lineTo(width*2.55,len-head);shape.lineTo(0,len);shape.lineTo(-width*2.55,len-head);shape.lineTo(-width,len-head);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.11,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.018,bevelThickness:.018});
  geometry.rotateX(Math.PI/2);geometry.rotateY(Math.atan2(b[0]-a[0],b[1]-a[1]));geometry.translate(a[0],2.28,a[1]);
  const mesh=new THREE.Mesh(geometry,red);mesh.name='CODEX Red volumetric daylight arrow';mesh.castShadow=false;mesh.userData.borrowed=dashed;daylight.add(mesh);
  if(dashed){ // Two gaps communicate diffuse/borrowed light in the single entrance area.
   // Short separated feeder blocks distinguish the entrance borrowed-light arrow.
   for(let k=1;k<=2;k++){const block=new THREE.Mesh(new THREE.BoxGeometry(.16,.11,.13),red);const t=-.15*k;block.position.set(a[0]+(b[0]-a[0])*t,2.23,a[1]+(b[1]-a[1])*t);block.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);daylight.add(block);}
  }
 }
 function airPath(points){
  const curve=new THREE.CurvePath();points.slice(1).forEach(([x,z],i)=>curve.add(new THREE.LineCurve3(new THREE.Vector3(points[i][0],1.65,points[i][1]),new THREE.Vector3(x,1.65,z))));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*9),.047,6,false),blue);mesh.name='CODEX Blue volumetric ventilation path';airflow.add(mesh);
  for(let i=1;i<points.length;i++){
   const a=new THREE.Vector3(points[i-1][0],1.65,points[i-1][1]),b=new THREE.Vector3(points[i][0],1.65,points[i][1]),length=a.distanceTo(b);if(length<.48)continue;
   const count=Math.max(1,Math.floor(length/2.25));for(let k=0;k<count;k++){
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.155,.40,4),blue);cone.position.lerpVectors(a,b,(k+.72)/count);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());cone.name='CODEX Blue 3D airflow arrowhead';airflow.add(cone);
   }
  }
 }
 for(const room of ENVIRONMENT_ROOMS){
  const r=new THREE.Group(),b=new THREE.Group();r.name='DAYLIGHT '+room.id;b.name='AIRFLOW '+room.id;r.userData.roomId=b.userData.roomId=room.id;daylight.add(r);airflow.add(b);
  // Generate into the shared layer, then keep each room's objects together for inspection.
  const nr=daylight.children.length,nb=airflow.children.length;redArrow(...room.red,room.borrowed);airPath(room.blue);
  daylight.children.slice(nr).forEach(o=>r.add(o));airflow.children.slice(nb).forEach(o=>b.add(o));
  if(room.label)addLabel('05','context',room.cn,room.en,[room.at[0],3.15,room.at[1]],'#1a110d');
 }
 // Batch all red solids and all blue solids. Rotating the study adds only two draw calls.
 for(const parent of [daylight,airflow]){
  const geometries=[];parent.updateMatrixWorld(true);
  for(const room of [...parent.children]){
   const meshes=room.children.filter(o=>o.isMesh);room.userData.geometryPieces=meshes.length;
   for(const mesh of meshes){const geometry=mesh.geometry.clone();geometry.applyMatrix4(mesh.matrixWorld);geometries.push(geometry.index?geometry.toNonIndexed():geometry);mesh.geometry.dispose();room.remove(mesh);}
  }
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
  const solid=new THREE.Mesh(geometry,parent===daylight?red:blue);solid.name=parent===daylight?'CODEX Batched red 3D daylight arrows':'CODEX Batched blue 3D ventilation arrows';solid.userData.analysisGraphic=true;parent.add(solid);
 }
 return {inspect:()=>({rooms:ENVIRONMENT_ROOMS.map(({id,cn,light,blue})=>({id,cn,light,ventilationPoints:blue})),roomCount:ENVIRONMENT_ROOMS.length,red:'solid-bevelled-3d',blue:'solid-tube-and-arrowhead-3d',borrowed:['entry']})};
}
