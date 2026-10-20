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
export const islandStops=[[211,365],[306,167],[515,322],[680,163],[839,335]];
export const islandTrails=[
 [[211,365],[240,357],[280,324],[320,300],[359,284],[385,260],[350,212],[320,193],[306,167]],
 [[306,167],[320,193],[350,212],[385,260],[405,280],[450,290],[515,322]],
 [[515,322],[580,303],[615,280],[600,235],[600,199],[650,165],[680,163]],
 [[680,163],[650,165],[600,199],[600,235],[660,270],[710,280],[755,315],[839,335]]
];
export function islandRoute(from,to){const points=[];if(from<to){for(let i=from;i<to;i++)points.push(...islandTrails[i]);}else for(let i=from-1;i>=to;i--)points.push(...[...islandTrails[i]].reverse());return points;}
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
