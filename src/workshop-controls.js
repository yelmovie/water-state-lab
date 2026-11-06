// Pointer and button movement share the same ten-unit model grid.
export function partPosition(key,x,y){
 const snap=(value,min,max)=>Math.max(min,Math.min(max,Math.round(value/10)*10));
 return {x:snap(x,60,key==='ramp'?480:650),y:snap(y,60,390)};
}
// Where the funnel catches water leaving a ramp tilted to rampTilt.
export const rampTilt=20;
export const funnelSeat=ramp=>({x:ramp.x+190,y:ramp.y+45});
export function previousTrial(trials){
 const last=trials.at(-1);
 for(let i=trials.length-2;i>=0;i--)if(trials[i].design&&trials[i].signature!==last?.signature)return trials[i];
}
