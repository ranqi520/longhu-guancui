import {BufferGeometry,BufferAttribute} from './build/three.module.js';
import {MeshBVH} from './mesh-bvh-worker.module.js';
self.onmessage=({data})=>{
 try{
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(data.position,3));if(data.index)geometry.setIndex(new BufferAttribute(data.index,1));geometry.groups=data.groups;
  const bvh=new MeshBVH(geometry,{...data.options,onProgress:p=>self.postMessage({progress:p})});
  const result=MeshBVH.serialize(bvh,{cloneBuffers:false});
  const transfers=[...result.roots];if(result.index)transfers.push(result.index.buffer);if(result.indirectBuffer)transfers.push(result.indirectBuffer.buffer);
  self.postMessage({result},[...new Set(transfers)]);
 }catch(e){self.postMessage({error:String(e.message||e)});}
};