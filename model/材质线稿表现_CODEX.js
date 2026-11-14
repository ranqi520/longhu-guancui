import * as THREE from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

// Texture-led architectural illustration. Shared uniforms allow the established
// physical night-lighting chapter to remain a genuinely dark scene.
export function createReferencePresentation(){
 const uniforms={referenceMix:{value:.84}};
 const group=new THREE.Group();group.name='Reference architectural contours';
 const lineMaterials=[],wideLines=[],lightLines=[];
 const report={version:'reference-surfaces-v1',meshesReviewed:0,outlinedMeshes:0,segments:0,drawCalls:0,buildMs:0};
 let lastEnabled=null;
 function applyMaterial(material){
  const previous=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
   previous(shader);shader.uniforms.referenceMix=uniforms.referenceMix;
   shader.vertexShader='varying vec3 vReferenceWorldNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>',`#include <defaultnormal_vertex>
    vReferenceWorldNormal=inverseTransformDirection(transformedNormal,viewMatrix);`);
   shader.fragmentShader='uniform float referenceMix;\nvarying vec3 vReferenceWorldNormal;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
    vec3 refN=normalize(vReferenceWorldNormal);
    float refPlane=0.73+0.12*max(refN.y,0.0)+0.065*refN.x-0.035*refN.z;
    vec3 refSurface=diffuseColor.rgb*refPlane;
    #if defined(USE_COLOR) || defined(USE_COLOR_ALPHA)
     refSurface*=mix(1.0,vColor.r,0.12);
    #endif
    outgoingLight=mix(outgoingLight,refSurface,referenceMix);
    #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>cacheKey+'-reference-surfaces-v1';
  material.needsUpdate=true;
 }
 function classify(name,material){
  if(material.transparent||/叶|花瓣|花心|盆土|枝干|绿植|小花|蕨|花蕊|透明|发光|灯芯|灯带|烟灰玻璃|暗玻璃/.test(name))return null;
  if(/墙体|抹灰|墙漆|柜门|橱柜|门框|窗框|踢脚|门套|屏风|电视|深灰金属|黑色金属|深灰铝/.test(name))return {layer:0,angle:34,min:.018};
  if(/地面|地板|地砖|地毯|接缝|背墙窄砖/.test(name))return {layer:1,angle:45,min:.03};
  if(/亚麻|布艺|床单|被褥|床品|织物|抱枕|靠垫|花卉簇绒|细织|嵌线/.test(name))return {layer:1,angle:66,min:.045};
  return {layer:1,angle:42,min:.02};
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
 async function buildContours(model,renderer){
  const start=performance.now(),meshes=[],layers=[[],[]];model.updateMatrixWorld(true);model.traverse(o=>{if(o.isMesh)meshes.push(o)});
  for(let i=0;i<meshes.length;i++){
   const mesh=meshes[i];report.meshesReviewed++;
   const settings=classify(mesh.material.name,mesh.material);
   if(settings){const count=featureEdges(mesh,settings,layers[settings.layer]);if(count){report.outlinedMeshes++;report.segments+=count;}}
   if(i%12===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  for(let i=0;i<layers.length;i++){
   if(!layers[i].length)continue;
   const geometry=new LineSegmentsGeometry();geometry.setPositions(layers[i]);
   const material=new LineMaterial({color:i===0?0x38342e:0x50483b,linewidth:i===0?1.10:.78,transparent:true,opacity:i===0?.77:.56,depthTest:true,depthWrite:false,toneMapped:false});
   material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <logdepthbuf_vertex>','gl_Position.z -= 0.000008 * gl_Position.w;\n#include <logdepthbuf_vertex>');};
   material.customProgramCacheKey=()=> 'reference-contours-v1';lineMaterials.push(material);
   const lines=new LineSegments2(geometry,material);lines.name=i===0?'Architectural contours':'Joinery and furniture contours';lines.frustumCulled=false;lines.renderOrder=4;lines.userData.referenceContours=true;lines.raycast=()=>{};
   const weight=i===0?1.02:.74;
   lines.onBeforeRender=r=>{const target=r.getRenderTarget();material.resolution.set(target?target.width:r.domElement.width,target?target.height:r.domElement.height);material.linewidth=weight*r.getPixelRatio();};
   group.add(lines);wideLines.push(lines);
   const lightGeometry=new THREE.BufferGeometry();lightGeometry.setAttribute('position',new THREE.Float32BufferAttribute(layers[i],3));
   const lightMaterial=new THREE.LineBasicMaterial({color:material.color,transparent:true,opacity:i===0?.67:.43,depthTest:true,depthWrite:false,toneMapped:false});
   lightMaterial.onBeforeCompile=material.onBeforeCompile;lightMaterial.customProgramCacheKey=()=> 'reference-light-contours-v1';
   const light=new THREE.LineSegments(lightGeometry,lightMaterial);light.name='Interactive lightweight contours';light.frustumCulled=false;light.renderOrder=4;light.raycast=()=>{};light.visible=false;group.add(light);lightLines.push(light);
  }
  report.drawCalls=wideLines.length;report.interactiveDrawCalls=lightLines.length;report.buildMs=Math.round(performance.now()-start);update(false,true,renderer);
  return report;
 }
 function update(night,enabled,renderer,moving=false){
  const active=enabled&&!night;uniforms.referenceMix.value=active?.84:0;group.visible=active;
  for(const line of wideLines)line.visible=!moving;for(const line of lightLines)line.visible=moving;
  const signature=active+':'+moving,changed=lastEnabled!==signature;lastEnabled=signature;return changed;
 }
 return {group,uniforms,report,applyMaterial,buildContours,update};
}
