// A deterministic classroom model. Visible droplets sample the result, never determine it.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function collectorTrial(parts,cold,angle){
 const generated=cold?100:0,steps=[],links=[];let amount=generated,retained=0;
 const overlap=(source,target,width)=>clamp((width+12-Math.abs(source-target))/24);
 const add=(factor,label,point,from)=>{const incoming=amount;amount*=factor;steps.push({ok:factor>0&&incoming>0,label,point:{...point},factor});links.push({from:{...from},to:{...point},incoming,outgoing:amount,lost:incoming-amount,factor,label});};
 steps.push({ok:!!cold,label:'냉각판에서 물방울 생성',point:{...parts.plate},factor:cold?1:0});
 add(parts.ramp.y-parts.plate.y>=45&&parts.ramp.y-parts.plate.y<=180?overlap(parts.plate.x,parts.ramp.x,65):0,'냉각판 → 경사판',parts.ramp,parts.plate);
 const end={x:parts.ramp.x+180,y:parts.ramp.y+angle*2};
 if(angle===0){retained=amount;amount=0;}
 add(angle>0?1:0,'경사판의 내리막',end,parts.ramp);
 add(parts.funnel.y>=end.y-20&&parts.funnel.y<end.y+90?overlap(end.x,parts.funnel.x,50):0,'경사판 → 깔때기',parts.funnel,end);
 add(parts.tube.y-parts.funnel.y>=45&&parts.tube.y-parts.funnel.y<125?overlap(parts.funnel.x,parts.tube.x,35):0,'깔때기 → 연결관',parts.tube,parts.funnel);
 add(parts.bucket.y-parts.tube.y>=65&&parts.bucket.y-parts.tube.y<160?overlap(parts.tube.x,parts.bucket.x,50):0,'연결관 → 물통',parts.bucket,parts.tube);
 const collected=Math.round(amount*10)/10;retained=Math.round(retained*10)/10;const lost=Math.round((generated-collected-retained)*10)/10;
 return {modelVersion:2,generated,collected,lost,retained,steps,links,passed:steps.findIndex(s=>!s.ok)<0?steps.length:steps.findIndex(s=>!s.ok),ok:collected>=60&&steps.every(s=>s.ok),signature:JSON.stringify({parts,cold,angle}),design:{parts:structuredClone(parts),cold,angle}};
}
export function newDiagnosis(design,fault='cooling') {const working=structuredClone(design);if(fault==='cooling')working.cold=false;else working.parts.funnel.x=working.parts.funnel.x>470?working.parts.funnel.x-180:working.parts.funnel.x+180;return {fault,hypothesis:'',evidence:0,working,tests:[],resolved:false};}
export function diagnosisResolved(d,result){return d.hypothesis===d.fault&&d.evidence===(d.fault==='cooling'?4:5)&&result.ok;}
