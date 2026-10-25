// Pointer and button movement share the same ten-unit model grid.
const keys=new Set(['plate','ramp','funnel','tube','bucket']);
export function partPosition(key,x,y){
 const snap=(value,min,max)=>Math.max(min,Math.min(max,Math.round(value/10)*10));
 return {x:snap(x,60,key==='ramp'?480:650),y:snap(y,60,390)};
}
export function movePart(parts,key,dx,dy){
 if(!keys.has(key)||!parts[key])return false;
 Object.assign(parts[key],partPosition(key,parts[key].x+dx,parts[key].y+dy));
 return true;
}
export function previousTrial(trials){
 const last=trials.at(-1);
 for(let i=trials.length-2;i>=0;i--)if(trials[i].design&&trials[i].signature!==last?.signature)return trials[i];
}
