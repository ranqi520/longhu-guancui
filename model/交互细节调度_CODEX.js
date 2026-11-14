import * as THREE from 'three';

// Only dense balcony foliage uses temporary navigation indices. The complete
// index buffers and every vertex/UV/normal/material remain untouched for stills.
export function createMotionDetail(model){
 const entries=[];
 const report={ready:false,active:false,enabled:true,meshes:0,fullTriangles:0,movingTriangles:0,savedTriangles:0,error:null};
 let lastMoving=false;
 async function load(){
  try{
   const base=new URL('./assets/PlantInteractionIndices_CODEX.json',import.meta.url);
   const response=await fetch(base);if(!response.ok)throw new Error('Motion detail manifest '+response.status);
   const spec=await response.json();
   if(spec.version!==1||!Array.isArray(spec.meshes)||spec.data!=='PlantInteractionIndices_CODEX.bin')throw new Error('Unsupported motion detail data');
   const data=await fetch(new URL(spec.data,base));if(!data.ok)throw new Error('Motion detail indices '+data.status);
   const buffer=await data.arrayBuffer();if(buffer.byteLength!==spec.byteLength)throw new Error('Motion detail length mismatch');
   const used=new Set(),pending=[];
   for(const item of spec.meshes){
    const mesh=model.getObjectByName(item.name),g=mesh?.geometry;
    if(!mesh?.isMesh||!g?.index||g.index.count!==item.originalIndexCount||g.attributes.position.count!==item.vertexCount||used.has(g))throw new Error('Motion detail source mismatch');
    if(!Number.isInteger(item.byteOffset)||item.byteOffset<0||item.byteOffset%4||!Number.isInteger(item.indexCount)||item.indexCount%3||item.indexCount<=0||item.indexCount>=g.index.count||item.byteOffset+item.indexCount*4>buffer.byteLength)throw new Error('Invalid motion detail range');
    const indices=new Uint32Array(buffer,item.byteOffset,item.indexCount);
    for(let i=0;i<indices.length;i++)if(indices[i]>=item.vertexCount)throw new Error('Motion detail index out of bounds');
    const low=new THREE.BufferAttribute(indices,1);low.name='Navigation foliage indices';
    pending.push({geometry:g,full:g.index,low});used.add(g);
   }
   entries.push(...pending);
   report.meshes=entries.length;report.fullTriangles=entries.reduce((n,e)=>n+e.full.count/3,0);report.movingTriangles=entries.reduce((n,e)=>n+e.low.count/3,0);report.savedTriangles=report.fullTriangles-report.movingTriangles;report.ready=true;
  }catch(error){report.error=String(error.message||error);console.warn('Navigation detail unavailable; complete geometry retained.',error);}
  return inspect();
 }
 function update(moving){
  lastMoving=moving;
  const active=!!(moving&&report.ready&&report.enabled);
  if(active===report.active)return false;
  for(const entry of entries)entry.geometry.setIndex(active?entry.low:entry.full);
  report.active=active;return true;
 }
 function setEnabled(enabled){report.enabled=!!enabled;return update(lastMoving);}
 function inspect(){return {...report};}
 return {load,update,inspect,setEnabled};
}