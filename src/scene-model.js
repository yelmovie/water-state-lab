// Shared geometry and learner actions. No renderer, clock or DOM dependency.
export const clampValue=(v,min,max)=>Math.max(min,Math.min(max,v));
export const vesselGeometry={tall:{x:300,width:100},wide:{x:535,width:192}};
export function waterHeight(amount,width){return clampValue(amount,0,100)*160/100*100/width;}
export function pourInto(inquiry,observation,key,amount){
 if(!Object.hasOwn(vesselGeometry,key))return false;
 inquiry.pourTarget=key;
 inquiry.pours[key]=clampValue(inquiry.pours[key]+Math.max(0,amount),0,100);
 if(inquiry.pours[key]>=100&&!observation.pours.includes(key))observation.pours.push(key);
 return inquiry.pours[key]>=100;
}
// Foot coordinates traced on research-island-v4 (1000 × 563). Shared points are bridge junctions.
export const islandStops=[[210,291],[286,135],[521,286],[683,144],[801,316]];
export const islandLanding=[432,355];
const square=[502,304],eastFork=[734,287];
const roads=[
 [islandStops[0],[238,315],[279,326],[324,337],[371,348],islandLanding,[474,345],[488,321],square],
 [square,[447,293],[404,281],[376,267],[365,253],[368,244],[343,230],[313,220],[271,211],[241,201],[222,189],[221,177],[231,162],[253,150],islandStops[1]],
 [square,islandStops[2]],
 [islandStops[2],[563,287],[603,282],[648,279],[698,281],eastFork],
 [eastFork,[731,270],[735,252],[750,235],[756,225],[748,212],[728,203],[700,185],[678,174],[654,157],[657,149],islandStops[3]],
 [eastFork,[747,303],[770,314],islandStops[4],[828,326]],
 [islandStops[0],[187,283],[153,276]]
];
const links=new Map(),segments=[];
for(const road of roads){
 for(let i=1;i<road.length;i++){
  const a=road[i-1],b=road[i];
  segments.push([a,b]);
  for(const [from,to] of [[a,b],[b,a]]){
   if(!links.has(from))links.set(from,[]);
   links.get(from).push(to);
  }
 }
}
function nearestRoad([x,y]){
 let best;
 for(const [a,b] of segments){
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=clampValue(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);
  const foot=[a[0]+t*dx,a[1]+t*dy],offset=Math.hypot(x-foot[0],y-foot[1]);
  if(!best||offset<best.offset)best={a,b,foot,offset};
 }
 return best;
}
// A narrow walking lane allows diagonal steering and slides along bends at its edge.
export function walkIslandStep(position,dx,dy){
 const next=[position[0]+dx,position[1]+dy],{foot,offset}=nearestRoad(next),width=12;
 if(offset<=width)return next;
 return next.map((v,i)=>foot[i]+(v-foot[i])*width/offset);
}
function connectedPath(from,to,parent=null){
 if(from===to)return [to];
 for(const next of links.get(from)){
  if(next===parent)continue;
  const path=connectedPath(next,to,from);
  if(path)return [from,...path];
 }
}
export function islandRoute(from,to){return connectedPath(islandStops[from],islandStops[to]);}
export const islandTrails=islandStops.slice(1).map((_,i)=>islandRoute(i,i+1));
export function islandWalkTo(position,to){
 const {a,b,foot}=nearestRoad(position),goal=islandStops[to];
 const routes=[a,b].map(end=>[position,foot,...connectedPath(end,goal)]);
 return routeDistance(routes[0])<=routeDistance(routes[1])?routes[0]:routes[1];
}
export function nearbyMapActions(position,targets){
 const inReach=targets.map(t=>({target:t,distance:Math.hypot(t.feet[0]-position[0],t.feet[1]-position[1])}))
  .filter(hit=>hit.distance<=34).sort((a,b)=>a.distance-b.distance);
 return inReach.map(hit=>hit.target);
}
export function pointOnRoute(points,fraction){
 if(!points.length)return [0,0];if(points.length===1)return [...points[0]];
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let d=clampValue(fraction,0,1)*lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1){const t=lengths[i]?d/lengths[i]:0;return points[i].map((v,k)=>v+(points[i+1][k]-v)*t);}d-=lengths[i];}
 return [...points.at(-1)];
}
export function routeDistance(points){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);}
export function freezeLevel(phase){return phase==='ice'?65.4:60;}
export function lensRegion(x,y){return x<350?'surface':y>218?'level':'inside';}
export function rampEndpoint(position,angle,scale=.64,offset=10){return {x:position.x+180,y:(position.y+angle*2)*scale+offset};}
export function discoveryStars(m,s){
 const a=s.activities;
 return ({
 1:[a.observe.pours.length===2,a.observe.iceMoved,a.observe.records.some(r=>r.kind==='cloth')],
 2:[a.freeze.records.length>=3,a.pipe.trials.some(t=>t.safe)&&new Set(a.pipe.trials.map(t=>t.fill)).size>=2,a.pipe.marked&&a.pipe.chosen>=0],
 3:[a.draw.records.length>=3,!!a.compare.baseline,a.compare.pins.length===3],
 4:[a.dew.records.length>=2,a.dew.again,!!a.explain.transfer],
 5:[s.lab.workshop.trials.length>0,new Set(s.lab.workshop.trials.map(t=>t.signature)).size>=2,s.restored]
 })[m];
}
export const discoveryGoals=[['물과 그릇 비교','얼음 옮겨 관찰','젖은 자국 추적'],['얼기와 녹기 비교','두 배관 비교','남는 공간 찾기'],['물그림 시간 기록','가열 전 비교','세 곳 확대 관찰'],['두 컵 비교','닦고 다시 관찰','새로운 병에 적용'],['내 물길 시험','고치기 전후 비교','코어에 물 보내기']];
