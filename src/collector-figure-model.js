// Physical model: condensation forms on a cold surface, then gravity moves the liquid.
// The experiment's tested result decides which links work. This view never changes the test.
import {newDiagnosis,collectorTrial} from './collector-model.js';
import {targetParts} from './domain.js';

export const figureParts=[
 ['냉각판','공기 중의 수증기가 차가운 판에 닿으면 물방울이 맺힐 수 있어.'],
 ['경사판','물방울은 경사판의 낮은 쪽으로 흘러.'],
 ['깔때기','넓은 입구로 물을 받아 좁은 곳으로 모아.'],
 ['연결관','깔때기에서 나온 물을 물통 쪽으로 보내.'],
 ['물통','이어진 물길을 지나온 물이 이곳에 모여.']
];
export function comparisonExamples(){
 const design={parts:targetParts,cold:true,angle:20};
 return ['cooling','connection'].map(key=>{
  const {parts,cold,angle}=newDiagnosis(design,key).working;
  if(key==='connection'){
   // In the teaching example the whole receiving stack is offset: a drip that misses
   // the funnel must also miss the open tube and the bucket below it.
   const offset=parts.funnel.x-targetParts.funnel.x;
   parts.tube.x+=offset;parts.bucket.x+=offset;
  }
  return {key,name:key==='cooling'?'물이 안 맺힘':'물이 중간에 샘',result:collectorTrial(parts,cold,angle)};
 });
}
const point=(x,z)=>[x,0,z];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const mapPart=({x,y})=>({x:x*.3,z:Math.max(12,(465-y)*.35)});
const spillSources=['냉각판 아래','경사판 옆','경사판 끝','깔때기 아래','연결관 끝'];
export function figureLayout(result){
 const {parts,cold,angle}=result.design;
 const plate=mapPart(parts.plate), ramp=mapPart(parts.ramp), funnel=mapPart(parts.funnel), tube=mapPart(parts.tube), bucket=mapPart(parts.bucket);
 const slopeEnd={x:ramp.x+54,z:Math.max(12,ramp.z-angle*.7)};
 const rim=Math.max(20,bucket.z);
 // A small air gap stays visible between the tube and the receiving vessel.
 const pipeTop=Math.max(25,tube.z+13),pipeBottom=Math.max(13,tube.z-11);
 const coneSpout=Math.max(16,funnel.z-18);
 const entry=point(plate.x+9,plate.z+1),rampIn=point(ramp.x,ramp.z+1),rampOut=point(slopeEnd.x,slopeEnd.z+1);
 const bowl=point(funnel.x,funnel.z-4),spout=point(funnel.x,coneSpout);
 const pipeIn=point(tube.x,pipeTop),pipeOut=point(tube.x,pipeBottom);
 const tankRim=point(bucket.x,rim+1),tankBottom=point(bucket.x,Math.min(rim-2,8+result.collected/100*(rim-8)*.58));
 const path=(from,to)=>[from,to];
 const tracks=[{phase:0,start:0,end:.62,points:[point(plate.x-9,plate.z+10),entry]}];
 const add=(index,phase,start,end,points)=>{
  const link=result.links[index];if(!link?.incoming)return;
  if(link.outgoing>0)tracks.push({phase,start,end,points});
  if(link.lost>0){
   // When an opening misses, liquid falls below the outlet. It never jumps sideways to the next part.
   const at=points[0];
   const beside=index===1||index===2||Math.abs(at[0]-tube.x)<9||Math.abs(at[0]-bucket.x)<16;
   const exit=beside?[at[0],-18,at[2]-4]:at;
   tracks.push({phase,start,end:end+.34,points:beside?[at,exit,[exit[0],exit[1],7]]:path(at,[at[0],0,7]),spill:true,source:spillSources[index]});
  }
 };
 if(result.generated){
  add(0,1,.62,1.24,path(entry,rampIn));
  if(result.retained)tracks.push({phase:1,start:1.24,end:1.78,points:path(rampIn,point(ramp.x+11,ramp.z+1)),hold:true});
  add(1,1,1.24,1.94,path(rampIn,rampOut));
  add(2,2,1.94,2.70,[rampOut,bowl,spout]);
  add(3,3,2.70,3.62,[spout,pipeIn,pipeOut]);
  add(4,4,3.62,4.30,[pipeOut,tankRim,tankBottom]);
 }else tracks.length=0;
 const anchors=[point(plate.x,plate.z+8),point((ramp.x+slopeEnd.x)/2,(ramp.z+slopeEnd.z)/2),
  point(funnel.x,funnel.z-2),point(tube.x,(pipeTop+pipeBottom)/2),point(bucket.x,rim-5)];
 const duration=tracks.length?Math.max(...tracks.map(t=>t.end))+.25:.65;
 const spillSource=tracks.find(t=>t.spill)?.source;
 const finalNote=!result.generated?'이 시험에서는 냉각판에 물방울이 맺히지 않았어.':result.retained?'물방울이 경사판에 남았어. 내리막이 있는지 살펴봐.':result.lost?
  (result.collected?`일부는 물통에 모였지만, ${spillSource}에서 샌 물도 있어.`:`물방울이 ${spillSource}에서 새서 물통까지 못 갔어.`):'물방울이 부품을 따라 물통까지 도착했어!';
 return {plate,ramp,slopeEnd,funnel,tube,bucket,pipeTop,pipeBottom,coneSpout,rim,anchors,tracks,duration,finalNote,cold,spillSource,
  bounds:[Math.min(...anchors.map(p=>p[0]))-26,Math.max(slopeEnd.x,...anchors.map(p=>p[0]))+27,-25,25,0,Math.max(40,...anchors.map(p=>p[2]))+13],
  waterline:tankBottom[2]};
}
export function figureFrame(layout,time){
 const drops=[],trails=[];
 let step=0;
 for(const track of layout.tracks){
  if(time<track.start)continue;
  step=track.phase;
  const u=clamp((time-track.start)/(track.end-track.start),0,1)*(track.points.length-1);
  const i=Math.min(Math.floor(u),track.points.length-2),p=track.points[i],q=track.points[i+1];
  const point=p.map((v,j)=>v+(q[j]-v)*(u-i)),spill=track.spill===true;
  if(u>0)trails.push({points:[...track.points.slice(0,i+1),point],spill});
  if(time<=track.end||track.hold)drops.push({point,spill,phase:track.phase});
 }
 const leak=layout.tracks.find(t=>t.spill&&time>=t.start);
 return {drops,trails,step,leak,spilled:layout.tracks.some(t=>t.spill&&time>=t.end),collected:layout.tracks.some(t=>t.phase===4&&!t.spill&&time>=t.end)};
}
