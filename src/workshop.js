import {coreTransfer} from './core-transfer.js';
import {playCue} from './sound.js';
import {previousTrial,funnelSeat,rampTilt} from './workshop-controls.js';
import {state,save} from './state.js';
import {testCollector,currentTrialValid,confirmedWorkshop,clamp,targetParts} from './domain.js';
import {newDiagnosis,diagnosisResolved,chooseDiagnosisFault} from './collector-model.js';
import {btn,range,toast,icon} from './ui.js';
import {openDevice,openIsland} from './three-view.js';
let previewFinal,cleanup=[];export function resetFinalPreview(){previewFinal={submitted:[],connected:false,valve:0,tested:false,lever:0,cooling:false,coreHeight:90};}resetFinalPreview();
export function cleanupWorkshop(){cleanup.forEach(fn=>fn());cleanup=[];}
export function finalContext(){const preview=state.settings.adminUnlock&&(!confirmedWorkshop(state.evidence[5])||[1,2,3,4].some(n=>!state.evidence[n]));const design=preview?{parts:structuredClone(targetParts),cold:true,angle:20,selected:'',trials:[testCollector(targetParts,true,20)]}:confirmedWorkshop(state.evidence[5]);return {preview,progress:preview?previewFinal:state.lab.final,design};}
const partNames={plate:'냉각판',ramp:'경사판',funnel:'깔때기',tube:'연결관',bucket:'물통'};
function workshopPartKey(){return `<p class="workshop-part-key" aria-label="장치의 부품 순서"><b>부품 찾기</b><span>냉각판 → 경사판 → 깔때기 → 연결관 → 물통</span></p>`;}
function partImage(k,x,y,w,h){const i=['plate','ramp','funnel','tube','bucket','core'].indexOf(k);return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${i%3*512} ${Math.floor(i/3)*512} 512 512" preserveAspectRatio="none" overflow="hidden"><image href="/assets/v2/workshop-atlas.webp" width="1536" height="1024"/></svg>`;}
export function workshopSVG(s,final=false,id='workbench'){
 const last=s.trials?.at(-1),result=last?.signature===testCollector(s.parts,s.cold,s.angle).signature?last:null;
 return `<svg id="${id}" viewBox="0 0 720 480" role="img" aria-label="부품을 옮겨 물이 흐르는 길 만들기"><rect width="720" height="480" rx="20" fill="#fafbef"/>${result?.links?.map((l,i)=>`<path d="M${l.from.x} ${l.from.y+15}L${l.to.x} ${l.to.y+15}" fill="none" stroke="#269fae" stroke-width="${Math.max(2,l.outgoing/15)}" opacity="${l.incoming?'.6':'0'}" stroke-dasharray="5 8"/>${l.lost>0?`<path d="M${l.from.x} ${l.from.y+18}Q${l.from.x+65} ${l.from.y+80} ${l.from.x+45} 445" class="loss-trail"/><text x="${l.from.x+35}" y="440" class="flow-label">새는 물</text>`:''}`).join('')||''}${Object.entries(s.parts).sort(([a],[b])=>Number(a===s.selected)-Number(b===s.selected)).map(([k,p])=>`<g data-part="${k}" transform="translate(${p.x} ${p.y})" class="part ${s.selected===k&&!final?'active':''}"><rect class="part-grip" x="-24" y="-24" width="48" height="48" rx="12" fill="${s.selected===k?'#ffe29b':'#fff8df'}" stroke="#517e78" stroke-width="2"/><text pointer-events="none" x="0" y="7" text-anchor="middle" font-size="20">✥</text>${k==='ramp'?`<g transform="rotate(${Math.atan(s.angle*2/180)*180/Math.PI})">${partImage(k,-20,-20,215,48)}</g>`:partImage(k,k==='plate'?-75:-45,-36,k==='plate'?150:90,85)}<text x="${k==='ramp'?75:0}" y="-48" text-anchor="middle" class="part-label">${partNames[k]}${k==='plate'?(s.cold?' · 차가움':' · 실온'):''}</text>${k==='funnel'||k==='bucket'?'<path d="M-34-25H34" stroke="#248e9e" stroke-width="5"/>':''}</g>`).join('')}${!final?`<circle data-angle-handle="true" cx="${s.parts.ramp.x+180}" cy="${s.parts.ramp.y+s.angle*2}" r="23" fill="#e5f6f2" stroke="#2a8c89" stroke-width="3"/><text pointer-events="none" x="${s.parts.ramp.x+180}" y="${s.parts.ramp.y+s.angle*2+7}" text-anchor="middle" font-size="23">↕</text>`:''}${Object.values(s.parts).map(p=>`<circle cx="${p.x}" cy="${p.y}" r="7" fill="#ecfbef" stroke="#245f72" stroke-width="3" pointer-events="none"/>`).join('')}${result?.steps?.find(step=>!step.ok)?`<circle cx="${result.steps.find(step=>!step.ok).point.x}" cy="${result.steps.find(step=>!step.ok).point.y}" r="18" fill="none" stroke="#b44836" stroke-width="5" pointer-events="none"/>`:""}<g class="moving-water"></g>${result?.collected?`<rect x="${s.parts.bucket.x-29}" y="${s.parts.bucket.y+26-result.collected*.3}" width="58" height="${result.collected*.3}" fill="#59c4d6" opacity=".7"/>`:''}</svg>`;
}
const funnelPlaced=s=>{const seat=funnelSeat(s.parts.ramp);return s.parts.funnel.x===seat.x&&s.parts.funnel.y===seat.y;};
// The sentence names the physical reason, so a failed run teaches the same idea as a good one.
function workshopResult(s,last){
 if(!last||last.signature!==testCollector(s.parts,s.cold,s.angle).signature)return s.cold?'물방울이 어디까지 가는지 지켜봐.':'판이 차갑지 않으면 수증기가 물방울이 되지 않아.';
 if(!s.cold)return '판이 차갑지 않아서 물방울이 생기지 않았어.';
 if(s.angle<=0)return '판이 평평해서 물방울이 멈췄어. 물은 아래로만 흘러.';
 if(!last.ok)return '경사판 끝과 깔때기가 어긋나서 물이 샜어.';
 return '성공! 수증기가 차가운 판에서 물방울이 되어, 아래로 흘러 물통에 모였어.';
}
export function workshopView(){const s=state.lab.workshop,last=s.trials.at(-1),ready=currentTrialValid(s),placed=funnelPlaced(s);
 const chain=[['공기 중 수증기',true],['차가운 판에 물방울',s.cold],['아래로 흐르기',s.cold&&s.angle>0],['물통에 모임',ready]];
 return `<div class="experiment-layout workshop-layout"><div class="lab-stage"><ol class="water-chain" aria-label="물이 모이는 순서">${chain.map(([label,on])=>`<li class="${on?'is-on':''}">${label}</li>`).join('')}</ol><div class="workshop-purpose"><img src="/assets/v2/resident-10.webp" alt="온실지기 느티"><p><b>느티의 부탁</b><br>온실 모종에 줄 물이 모자라. 공기 중 수증기를 물방울로 모아 물통에 담아 줘.</p><button class="field-help-btn" data-action="field-help">부탁 듣기</button></div>${workshopSVG(s)}${workshopPartKey()}<p class="collector-conditions">수증기가 충분한 공기 · 충분히 차가운 판 · 같은 시간 뒤를 비교하는 모형</p><p class="trial-result ${ready?'is-done':''}" role="status">${workshopResult(s,last)}</p></div><aside class="control-panel"><h2>물길 고치기</h2>${btn(s.cold?'✓ 판이 차가워졌어':'냉각팩 붙이기','toggle-cold','wide '+(s.cold?'selected':''))}${btn(s.angle>0?'✓ 경사판을 기울였어':'경사판 기울이기','ramp-tilt','wide '+(s.angle>0?'selected':''))}${btn(placed?'✓ 깔때기를 이었어':'깔때기 옮기기','funnel-fix','wide '+(placed?'selected':''),placed)}${btn('같은 시간 뒤 물길 시험','test-workshop','wide')}${btn('이 장치로 출발','complete-5','gold wide',!ready)}<details><summary>더 살펴보기</summary>${s.trials.some(t=>t.source==='initial-model')?'<p>처음 배치의 모형 결과를 자동으로 남겼어. 직접 바꾼 조건과 비교해 봐.</p>':''}${btn('내 장치 3D로 돌려 보기','three-device','wide')}</details></aside></div>`;
}
function ensureDiagnosis(f,design){if(!f.diagnosis&&design){f.diagnosis=newDiagnosis(design,chooseDiagnosisFault());f.cooling=f.diagnosis.working.cold;}}
export function finalView(){
 const {preview,progress:f,design}=finalContext();
 if(!design)return `<div class="lab-stage"><h2>먼저 내 장치를 완성해 줘.</h2>${btn('공방으로','screen-9','primary')}</div>`;
 ensureDiagnosis(f,design);if(!preview)save();
 const d=f.diagnosis,w=d.working,r=d.tests.at(-1),display={...w,selected:'funnel',trials:r?[r]:[]};
 const flowReady=f.connected&&d.resolved,transfer=coreTransfer(f,w);
 const heading=flowReady?(f.tested?'코어에 물이 도착했어!':!transfer.downhill?'코어 입구를 낮춰 봐':'밸브를 돌려 물길을 열어 봐'):'원인을 찾아 고쳐 봐';
 const status=f.tested?'물이 열린 밸브를 지나 더 낮은 코어 입구에 도착했어! 도착한 물로 코어를 깨워 줘.':r?(r.generated===0?'새 물방울이 생기지 않아.':r.collected<60?'중간에 새는 물이 있어.':d.resolved?'장치가 다시 물을 모았어.':'물길은 좋아졌어. 원인과 증거도 확인해 줘.'):'먼저 시험하고 물방울을 살펴봐.';
 const causes=`<div class="diagnosis-choices"><div role="group" aria-label="고장 원인">${btn('냉각 문제','diagnose-cooling',d.hypothesis==='cooling'?'selected':'')}${btn('연결 문제','diagnose-connection',d.hypothesis==='connection'?'selected':'')}</div></div>`;
 const needsBaseline=d.processVersion===3&&!d.tests.length;
 const connection=`<div class="core-connect-step">${btn('코어에 연결','connect-core','primary',!d.resolved)}${d.resolved?'':`<span>${needsBaseline?'먼저 장치 시험을 눌러 봐':!d.hypothesis||d.hypothesis!==d.fault?'고장 원인을 고르면 다음으로 갈 수 있어':'고친 장치를 시험하면 연결할 수 있어'}</span>`}</div>`;
 const repair=`${needsBaseline?'<p class="repair-before-note">먼저 고장 난 상태를 시험해서 어디서 멈추는지 살펴봐.</p>':''}${btn(w.cold?'✓ 냉각 켜짐':'냉각 켜기','core-cooling','wide '+(w.cold?'selected':''),needsBaseline)}${btn('깔때기 제자리로','core-funnel','wide',needsBaseline||w.parts.funnel.x===design.parts.funnel.x)}${btn('장치 시험','diagnosis-test','wide')}`;
 const flow=f.tested?btn('도착한 물로 코어 깨우기','core-activate','primary wide'):`<div class="core-flow-controls" aria-label="코어로 물 보내기">
 <div class="core-height-control"><strong>1. 입구 낮추기</strong><div class="core-height-buttons">${btn('↓ 낮추기','core-lower','secondary',transfer.height<=25)}${btn('↑ 올리기','core-raise','secondary',transfer.height>=95)}</div><details class="core-height-fine"><summary>높이 미세 조절</summary>${range('core-inlet-height','코어 입구 높이',transfer.height,25,95,5)}</details></div>
 <div class="core-valve-step"><strong>2. 밸브 열기</strong><button type="button" class="core-valve-control" data-action="${f.valve?'core-close-valve':'core-open-valve'}"><img src="/assets/learning/experiment-props-20261107/valve.webp" alt="" style="transform:rotate(${f.valve*2.7}deg)"><span>${f.valve?'열렸어 · 닫기':'밸브 열기'}</span></button></div>
 <div class="core-send-step"><strong>3. 물 보내기</strong>${btn('물 보내기','test-core','primary',!transfer.canFlow)}<span class="core-flow-hint" role="status">${!transfer.downhill?'입구를 물통의 물높이보다 낮춰 봐':!f.valve?'이제 밸브를 열어 봐':'준비됐어! 물이 가는 길을 지켜봐'}</span></div></div>`;
 return `<div class="experiment-layout final-layout ${d.resolved?'diagnosis-done':''}">
 <div class="lab-stage"><span class="stage-tag">${preview?'선생님 미리보기 · 예시 장치':'내가 만든 장치'} · ${f.tested?'코어까지 물이 도착했어':d.resolved?'고친 장치로 물을 모았어':'물이 코어에 도착하지 않아'}</span>
 ${workshopSVG(display,true)}${workshopPartKey()}<div class="observation-strip" role="status">${status}</div>${r?`<p class="diagnosis-readout">모은 물 ${r.collected} · 새는 물 ${r.lost}</p>`:''}${flowReady?'':causes}</div>
 <aside class="control-panel core-control-panel"><h2>${heading}</h2>
 ${flowReady?`${flow}<details class="core-repair"><summary>더 살펴보기</summary>${btn('3D로 보기','three-final','wide')}${repair}</details>`:`${connection}${repair}<details><summary>더 살펴보기</summary>${btn('내 장치 3D로 돌려 보기','three-final','wide')}<p>물방울이 처음부터 생기지 않는지, 중간에서 새는지 살펴봐.</p></details>`}
 </aside></div>`;
}
export function handleWorkshop(action,ctx){const s=state.lab.workshop;const {progress:f,preview,design}=finalContext();const redraw=()=>{if(!preview||state.route!==10)save();ctx.render();};
 // Figures are optional observation tools. A snapshot is never used as a new trial or hint about the actual fault.
 // 3D views only look at the current design; they never change records.
 if(action==='three-device'){const last=s.trials.at(-1);openDevice({parts:s.parts,cold:s.cold,angle:s.angle},{flowing:!!last?.ok&&last.signature===testCollector(s.parts,s.cold,s.angle).signature});return true;}
 if(action==='three-final'){const w=f.diagnosis?.working||design;if(w)openDevice({parts:w.parts,cold:w.cold,angle:w.angle},{withCore:true,flowing:!!f.tested,coreInletY:coreTransfer(f,w).inletY,connected:!!f.connected});return true;}
 if(action==='three-island'){openIsland();return true;}
 // Keep a real model snapshot before the first edit, even when taps outrun assist.
 if(['toggle-cold','ramp-tilt','funnel-fix'].includes(action)&&!s.trials.length)s.trials.push({...testCollector(s.parts,s.cold,s.angle),source:'initial-model'});
 if(action==='toggle-cold'){s.cold=!s.cold;redraw();return true;}
 if(action==='ramp-tilt'){s.angle=s.angle>0?0:rampTilt;redraw();return true;}
 if(action==='funnel-fix'){Object.assign(s.parts.funnel,funnelSeat(s.parts.ramp));redraw();return true;}
 if(action==='test-workshop'){const trial=testCollector(s.parts,s.cold,s.angle);s.trials.push(trial);if(s.trials.length>12)s.trials.shift();void playCue(trial.ok?'success':'error');redraw();return true;}
 if(action==='complete-5'){if(!currentTrialValid(s))return true;ctx.pageDone(9);state.evidence[5]={trials:s.trials.length,first:s.trials[0].collected,last:s.trials.at(-1).collected,parts:structuredClone(s.parts),angle:s.angle,cold:s.cold,result:structuredClone(s.trials.at(-1)),comparison:structuredClone([previousTrial(s.trials),s.trials.at(-1)])};state.lab.final={submitted:[],connected:false,valve:0,tested:false,lever:0,cooling:false,coreHeight:90};if(!state.completed.includes(5))state.completed.push(5);save();ctx.go(10);return true;}
 if(action.startsWith('submit-')){const n=+action.slice(7);if(n>=1&&n<=5&&(preview||state.evidence[n])&&!f.submitted.includes(n))f.submitted.push(n);return true;}
 if(!design)return false;
 if(action==='core-activate'){
  if(f.tested&&f.diagnosis?.resolved&&coreTransfer(f,f.diagnosis.working).canFlow){
   const w=f.diagnosis.working;
   openDevice({parts:w.parts,cold:w.cold,angle:w.angle},{withCore:true,flowing:true,coreInletY:coreTransfer(f,w).inletY,connected:true,onContinue:()=>ctx.finishEnding()});
  }
  return true;
 }
 if(action==='core-toggle-valve'){if(f.connected){f.valve=f.valve>=100?0:f.valve+25;f.tested=false;f.lever=0;redraw();}return true;}
 if(action==='core-lower'||action==='core-raise'){
  if(f.connected&&f.diagnosis?.resolved){f.coreHeight=clamp((f.coreHeight??90)+(action==='core-lower'?-10:10),25,95);f.tested=false;f.lever=0;redraw();}
  return true;
 }
 if(action==='core-open-valve'||action==='core-close-valve'){if(f.connected){f.valve=action==='core-open-valve'?100:0;f.tested=false;f.lever=0;redraw();}return true;}
 if(action==='connect-core'){if(f.diagnosis?.resolved||f.submitted.length===5){void playCue('latch');f.connected=true;redraw();}return true;}
 if(!/^(diagnos|core-cooling|core-funnel|test-core)/.test(action))return false;ensureDiagnosis(f,design);const d=f.diagnosis;
 if(d.processVersion===3&&!d.tests.length&&['core-cooling','core-funnel'].includes(action)){toast('먼저 고장 난 장치를 시험해서 물이 어디서 멈추는지 살펴봐.');return true;}
 if(action.startsWith('diagnose-')){
  d.hypothesis=action.slice(9);d.evidence=d.hypothesis==='cooling'?4:5;
  const last=d.tests.at(-1),current=testCollector(d.working.parts,d.working.cold,d.working.angle);
  d.resolved=!!last&&last.signature===current.signature&&diagnosisResolved(d,last);
  f.tested=false;f.lever=0;
 }
 else if(action==='core-cooling'){d.working.cold=!d.working.cold;f.cooling=d.working.cold;d.resolved=false;f.tested=false;f.lever=0;}
 else if(action==='core-funnel'){d.working.parts.funnel={...design.parts.funnel};d.resolved=false;f.tested=false;f.lever=0;}
 else if(action==='diagnosis-undo'){f.diagnosis=newDiagnosis(design,d.fault);f.tested=false;f.connected=false;f.valve=0;f.lever=0;}
 else if(action==='diagnosis-test'){const result=testCollector(d.working.parts,d.working.cold,d.working.angle);d.tests.push(result);if(d.tests.length>8)d.tests.shift();d.resolved=diagnosisResolved(d,result);f.tested=false;f.lever=0;void playCue(result.ok?'success':'error');}
 else if(action==='test-core'){const result=testCollector(d.working.parts,d.working.cold,d.working.angle);if(d.resolved&&diagnosisResolved(d,result)&&coreTransfer(f,d.working).canFlow){f.tested=true;void playCue('pour');}else toast(coreTransfer(f,d.working).downhill?'관을 연결하고 밸브를 열어 줘.':'코어 입구가 너무 높아. 물통의 물높이보다 낮춰 줘.');}
 else return false;redraw();return true;
}
function flow(svg,result){if(!svg||!result?.links)return;let start=null,frame;const reduced=state.settings.reduced||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const layer=svg.querySelector('.moving-water');if(!layer)return;function tick(now){start??=now;const t=(now-start)/1000;layer.innerHTML=result.links.filter(l=>l.outgoing>0).map((l,i)=>{const p=Math.min(1,Math.max(0,(t-i*.38)/.7));return `<circle cx="${l.from.x+(l.to.x-l.from.x)*p}" cy="${l.from.y+15+(l.to.y-l.from.y)*p}" r="${4+l.outgoing/30}" fill="#279dbd"/>`;}).join('');if(t<4&&!reduced)frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);cleanup.push(()=>cancelAnimationFrame(frame));}
export function bindWorkshop(n,ctx){if(n!==9&&n!==10)return;cleanupWorkshop();const s=state.lab.workshop;const rangeBind=(id,fn,disabled=false)=>{const el=document.getElementById(id);if(!el)return;el.disabled=disabled;el.oninput=()=>{const out=document.getElementById(id+'-out');if(out)out.textContent=el.value;};el.onchange=()=>{fn(+el.value);save();ctx.render();};};
 if(n===9){const svg=document.querySelector('#workbench');if(!svg)return;let drag=null;const position=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());svg.onpointerdown=e=>{const el=e.button===0&&!drag&&e.target.closest('[data-part="funnel"]');if(!el)return;e.preventDefault();drag={id:e.pointerId,el};svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const p=position(e);drag.el.setAttribute('transform',`translate(${p.x} ${p.y})`);};const end=e=>{if(!drag||drag.id!==e.pointerId)return;const p=position(e),seat=funnelSeat(s.parts.ramp);drag=null;if(Math.hypot(p.x-seat.x,p.y-seat.y)<90)Object.assign(s.parts.funnel,seat);save();ctx.render();};svg.onpointerup=end;svg.onpointercancel=end;const last=s.trials.at(-1);if(last?.signature===testCollector(s.parts,s.cold,s.angle).signature)flow(svg,last);}
 if(n===10){const {progress:f,preview}=finalContext(),d=f.diagnosis;if(!d)return;const svg=document.getElementById('workbench');let drag=null;svg.onpointerdown=e=>{if(e.button!==0||drag||d.processVersion===3&&!d.tests.length||!e.target.closest('[data-part="funnel"]'))return;e.preventDefault();const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());drag={id:e.pointerId,offset:p.x-d.working.parts.funnel.x};svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());d.working.parts.funnel.x=Math.round(clamp(p.x-drag.offset,60,650)/10)*10;svg.querySelector('[data-part="funnel"]').setAttribute('transform',`translate(${d.working.parts.funnel.x} ${d.working.parts.funnel.y})`);};const release=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;d.resolved=false;f.tested=false;f.lever=0;if(!preview)save();ctx.render();};svg.onpointerup=release;svg.onpointercancel=release;rangeBind('core-inlet-height',v=>{f.coreHeight=v;f.tested=false;f.lever=0;},!f.connected);const height=document.getElementById('core-inlet-height');if(height)height.oninput=()=>{f.coreHeight=+height.value;f.tested=false;f.lever=0;document.getElementById('core-inlet-height-out').textContent=height.value;};rangeBind('final-valve',v=>{f.valve=v;f.tested=false;f.lever=0;},!f.connected);rangeBind('final-lever',v=>{f.lever=v;if(v>=90&&f.tested)handleWorkshop('core-activate',ctx);},!f.tested);flow(document.querySelector('#workbench'),d.tests.at(-1));}
}
