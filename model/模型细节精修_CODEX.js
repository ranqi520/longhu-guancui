import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Furniture is rebuilt as geometry. Lighting settings remain those of the approved viewer.
export function refineModelDetails(root){
 const report={version:'geometry-v1',cushions:0,seamLoops:0,beveledParts:0,bedVertices:0,smoothedVertices:0,extraDrawCalls:0};
 const batches=new Map(),swaps=[],materialSwaps=[],group=new THREE.Group();group.name='家具软包与木作精修 / Furniture detailing';
 const fabrics=new Map();
 function weave(){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),im=ctx.createImageData(256,256);
  let seed=51973;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
   const i=(y*256+x)*4,v=151+21*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2)+12*Math.cos(y*Math.PI)+9*(rand()-.5);
   im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;
  }
  ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=8;return t;
 }
 const fiber=weave();
 function fabric(original){
  if(fabrics.has(original))return fabrics.get(original);
  const m=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(m,original);
  m.map=null;m.color.set('#ddd6c6');m.vertexColors=false;m.bumpMap=fiber;m.bumpScale=.0009;m.roughness=.89;m.metalness=0;m.sheen=.32;m.sheenRoughness=.84;m.sheenColor.set('#d5c7ae');
  m.name=original.name+' / 细织亚麻';fabrics.set(original,m);return m;
 }
 const seamMat=new THREE.MeshStandardMaterial({name:'软包同色嵌线 / Upholstery piping',color:'#b7ae99',roughness:.96});
 function batch(g,m){if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);}
 function rounded(w,h,d,r,{soft=false,segments=12}={}){
  const g=new THREE.BoxGeometry(w,h,d,segments,Math.max(6,Math.round(segments*.6)),segments),p=g.attributes.position,n=g.attributes.normal;
  const half=new THREE.Vector3(w/2,h/2,d/2),inner=half.clone().addScalar(-r),v=new THREE.Vector3(),q=new THREE.Vector3(),dir=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
   v.fromBufferAttribute(p,i);q.copy(v).clamp(inner.clone().negate(),inner);dir.copy(v).sub(q).normalize();v.copy(q).addScaledVector(dir,r);
   if(soft){
    const u=v.x/half.x,k=v.z/half.z,side=v.y/half.y,top=Math.max(0,dir.y),edge=Math.max(Math.abs(u),Math.abs(k));
    v.y+=top*(.018*(1-u*u)*(1-k*k)-.004*Math.exp(-Math.pow((edge-.80)/.055,2))*(.6+.4*Math.cos(u*29+k*23)));
    v.x+=dir.x*.003*Math.sin(k*23+side*4)*(1-side*side);v.z+=dir.z*.003*Math.sin(u*26-side*5)*(1-side*side);
   }
   p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,dir.x,dir.y,dir.z);
  }
  if(soft)smoothNormals(g);g.computeBoundingBox();return g;
 }
 function orientationNormals(g){
  // COLLADA has coincident front and back faces. Never average opposite normals.
  const reference=g.attributes.normal.clone();g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,lookup=new Map();
  for(let i=0;i<p.count;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*100000)).join(',');if(!lookup.has(k))lookup.set(k,[]);lookup.get(k).push(i);}
  for(const ids of lookup.values())for(const i of ids){const r=new THREE.Vector3().fromBufferAttribute(reference,i),sum=new THREE.Vector3();for(const j of ids){const ref=new THREE.Vector3().fromBufferAttribute(reference,j);if(ref.dot(r)>.45){const v=new THREE.Vector3().fromBufferAttribute(n,j);if(v.dot(ref)<0)v.negate();sum.add(v);}}if(sum.lengthSq()<.001)sum.copy(r);else sum.normalize();n.setXYZ(i,sum.x,sum.y,sum.z);}n.needsUpdate=true;
 }
 function smoothNormals(g){
  g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,shared=new Map();
  for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*100000)).join(',');if(!shared.has(key))shared.set(key,{ids:[],v:new THREE.Vector3()});const a=shared.get(key);a.ids.push(i);a.v.x+=n.getX(i);a.v.y+=n.getY(i);a.v.z+=n.getZ(i);}
  for(const a of shared.values()){a.v.normalize();for(const i of a.ids)n.setXYZ(i,a.v.x,a.v.y,a.v.z);}n.needsUpdate=true;
 }
 function seam(w,d,y,center,r=.075,thickness=.0022){
  const points=[];for(let corner=0;corner<4;corner++){
   const sx=[1,-1,-1,1][corner],sz=[1,1,-1,-1][corner],cx=sx*(w/2-r),cz=sz*(d/2-r);
   for(let j=0;j<=8;j++){const a=corner*Math.PI/2+j*Math.PI/16;points.push(new THREE.Vector3(cx+Math.cos(a)*r,y,cz+Math.sin(a)*r));}
  }
  const curve=new THREE.CatmullRomCurve3(points,true,'centripetal'),g=new THREE.TubeGeometry(curve,112,thickness,4,true);g.translate(...center);batch(g,seamMat);report.seamLoops++;
 }
 function cushion(min,max,m,{back=false}={}){
  const dims=max.map((v,i)=>v-min[i]),center=min.map((v,i)=>(v+max[i])/2),r=Math.min(.079,...dims.map(v=>v*.25));
  const g=rounded(...dims,r,{soft:true,segments:18});g.translate(...center);batch(g,m);
  seam(dims[0]-.025,dims[2]-.025,back?0:dims[1]*.33,center,Math.min(r,.07));report.cushions++;
 }
 function trim(mesh,predicate){
  const g=mesh.geometry.clone(),p=g.attributes.position,ix=g.index,kept=[];let removed=0;
  for(let t=0;t<ix.count;t+=3){const a=ix.getX(t),b=ix.getX(t+1),c=ix.getX(t+2),v=[(p.getX(a)+p.getX(b)+p.getX(c))/3,(p.getY(a)+p.getY(b)+p.getY(c))/3,(p.getZ(a)+p.getZ(b)+p.getZ(c))/3];if(predicate(v)){removed++;continue;}kept.push(a,b,c);}
  g.setIndex(kept);g.computeBoundingSphere();swaps.push({mesh,original:mesh.geometry,refined:g});mesh.geometry=g;return removed;
 }
 function components(g){
  const p=g.attributes.position,ix=g.index,parents=new Int32Array(p.count),seen=new Map();for(let i=0;i<p.count;i++)parents[i]=i;
  const find=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;},join=(a,b)=>{parents[find(a)]=find(b);};
  for(let i=0;i<p.count;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*100000)).join(',');if(seen.has(k))join(i,seen.get(k));else seen.set(k,i);}
  for(let t=0;t<ix.count;t+=3){join(ix.getX(t),ix.getX(t+1));join(ix.getX(t),ix.getX(t+2));}
  const parts=new Map();for(let i=0;i<p.count;i++){const id=find(i);if(!parts.has(id))parts.set(id,{ids:[],box:new THREE.Box3()});const a=parts.get(id);a.ids.push(i);a.box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i));}return [...parts.values()];
 }
 const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(const mesh of meshes){
  const name=mesh.material.name;
  if(name==='客厅_米白亚麻'&&mesh.name.includes('客厅_三视角')){
   const m=fabric(mesh.material);materialSwaps.push({mesh,original:mesh.material,refined:m});mesh.material=m;
   trim(mesh,([x,y,z])=>x>6.29&&x<8.36&&y<1.05&&z>4.49&&z<7.38);
   for(const [z0,z1] of [[4.511,5.278],[5.482,6.396],[6.400,7.355]]){
    cushion([6.31,.048,z0],[7.21,.47,z1],m);cushion([7.43,.048,z0],[8.33,.47,z1],m);
    cushion([7.17,.42,z0],[7.47,.838,z1],m,{back:true});
    cushion([7.215,.048,z0],[7.425,.455,z1],m);
   }
   for(const [x0,x1] of [[6.31,7.21],[7.43,8.33]])cushion([x0,.048,5.28],[x1,.73,5.48],m,{back:true});
   const pillow=rounded(.185,.43,.46,.085,{soft:true,segments:20});pillow.rotateZ(-.2);pillow.rotateY(-.10);pillow.translate(7.60,.70,5.90);batch(pillow,m);report.cushions++;
  }
  if(/主卧_柔软米白床单/.test(name)){
   const m=fabric(mesh.material);materialSwaps.push({mesh,original:mesh.material,refined:m});mesh.material=m;
   const old=mesh.geometry,g=old.clone(),p=g.attributes.position,n=g.attributes.normal;
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(x<11.79||x>14.12||z<5.34||z>7.59||y<.35||y>.65)continue;
    const edge=Math.min(z-5.34,7.59-z),fold=.006*Math.sin(21*x+3*Math.sin(6*z))*Math.exp(-edge*3)+.0035*Math.sin(17*z+2*Math.sin(4*x));
    p.setY(i,y+fold*Math.max(.15,Math.abs(n.getY(i))));report.bedVertices++;
   }
   orientationNormals(g);swaps.push({mesh,original:old,refined:g});mesh.geometry=g;
  }
  if(/客厅_红棕菱纹织物|客厅_棕花织物|主卧_橄榄绿黄条纹枕/.test(name)){
   const old=mesh.geometry,g=old.clone();orientationNormals(g);swaps.push({mesh,original:old,refined:g});mesh.geometry=g;report.smoothedVertices+=g.attributes.position.count;
   const m=mesh.material.clone();m.bumpMap=fiber;m.bumpScale=.0006;m.roughness=.90;m.vertexColors=false;materialSwaps.push({mesh,original:mesh.material,refined:m});mesh.material=m;
  }
  // Only rectangular tabletop slabs are beveled; walls, carved frames and joinery stay intact.
  if(/客厅_深暖实木/.test(name)){
   const chosen=components(mesh.geometry).filter(a=>{const s=a.box.getSize(new THREE.Vector3()),c=a.box.getCenter(new THREE.Vector3());return a.ids.length<150&&s.y>.02&&s.y<.13&&s.x>.25&&s.z>.25&&c.x<6.5&&c.z>4&&c.y<.8;});
   if(chosen.length){
    trim(mesh,point=>chosen.some(a=>a.box.clone().expandByScalar(.00002).containsPoint(new THREE.Vector3(...point))));
    for(const a of chosen){const s=a.box.getSize(new THREE.Vector3()),c=a.box.getCenter(new THREE.Vector3()),g=rounded(s.x,s.y,s.z,Math.min(.012,s.y*.22));g.translate(c.x,c.y,c.z);batch(g,mesh.material);report.beveledParts++;}
   }
  }
 }
 let triangles=0;for(const [material,list] of batches){const g=mergeGeometries(list,false);if(!g)throw Error('Furniture geometry merge failed');for(const a of list)a.dispose();const m=new THREE.Mesh(g,material);m.name=material.name+' / 实体细节';m.userData.detailGeometry=true;m.castShadow=m.receiveShadow=true;group.add(m);triangles+=g.index.count/3;}
 root.add(group);report.addedTriangles=triangles;report.extraDrawCalls=group.children.length;
 return {report,group,setGeometryEnabled(enabled){group.visible=enabled;for(const s of swaps)s.mesh.geometry=enabled?s.refined:s.original;},setEnabled(enabled){this.setGeometryEnabled(enabled);for(const s of materialSwaps)s.mesh.material=enabled?s.refined:s.original;}};
}