import {expeditions,phaseName,restoreAdventure,adventureMove} from './drop-adventure-model.js';
import {esc,btn,icon} from './ui.js';

const art='/assets/learning/adventure-20261111/';
const devices={
 channel:{image:'channel-right',description:'모양을 바꿔 흐르는 물의 길'},
 cooling:{image:'cooling-right',description:'냉각팩으로 물을 얼리는 장치'},
 air:{image:'basin',description:'물이 증발해 공기 중으로 가는 곳'},
 condenser:{image:'condenser',description:'수증기가 물방울로 맺히는 차가운 판'}
};
const phaseDescriptions={ice:'단단한 모양의 얼음',water:'모양을 바꾸며 흐르는 물',vapor:'눈에 보이지 않는 수증기'};

function waterForm(phase){
 if(phase==='vapor')return '<span class="drop-vapor-marker"><span>방울이는 지금<br>수증기 상태야</span></span>';
 return `<img src="${art}${phase}.webp" alt="${phaseDescriptions[phase]}" draggable="false">`;
}
function avatar(s){
 return `<div class="drop-avatar phase-${s.phase}" aria-label="현재 모습 · ${phaseDescriptions[s.phase]}"><div class="drop-form">${waterForm(s.phase)}</div></div>`;
}
function station(gate,index,s){
 const device=devices[gate.scene],current=index===s.gate,passed=index<s.gate;
 const occupied=current&&!s.done;
 const fill=occupied&&s.phase!=='vapor';
 const fillHeight=s.space?(s.phase==='ice'?28:25):35;
 return `<button type="button" class="drop-gate ${current?'is-current':''} ${passed?'passed':''}" data-action="drop-move"
  ${!current?'disabled':''} ${current?'aria-current="step"':''} aria-label="${gate.name} 통과하기 · ${device.description}">
  <span class="drop-station-status">${passed?'✓ 통과':current?'지금 여기':`${index+1}번째 길`}</span>
  <span class="drop-device drop-device-${gate.scene} ${fill?'has-water':''} ${occupied&&s.phase==='ice'?'is-frozen':''}" style="--fill-height:${fillHeight}%">
   <img class="drop-device-art" src="${art}${device.image}.webp" alt="" draggable="false">
   ${gate.scene==='cooling'&&fill?`<span class="drop-tank-water"></span>${gate.space?`<span class="drop-room-line ${s.space?'has-room':''}"></span>`:''}`:''}
   ${gate.scene==='air'?'<span class="drop-air-route" aria-hidden="true"><i></i><i></i><i></i></span>':''}
   ${gate.scene==='condenser'&&occupied&&s.phase==='water'?'<span class="drop-condensation" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="drop-cup-water"></span>':''}
   ${gate.scene==='air'&&occupied&&s.phase==='water'?'<span class="drop-basin-water" aria-hidden="true"></span>':''}
   ${occupied?avatar(s):''}
   ${gate.scene==='channel'&&occupied&&s.phase==='water'?'<span class="drop-channel-water" aria-hidden="true"><i></i><i></i><i></i></span>':''}
   ${gate.scene==='channel'?`<img class="drop-channel-front" src="${art}${device.image}.webp" alt="" draggable="false">`:''}
  </span>
  <span class="drop-station-caption"><strong>${gate.name}</strong><span>${device.description}</span></span>
 </button>`;
}
function scene(s,mission){
 return `<section class="drop-world" aria-label="방울이가 모습을 바꾸며 지나가는 물길">
  <div class="drop-world-top"><span class="drop-phase-label phase-${s.phase}">${phaseName[s.phase]} <span>${phaseDescriptions[s.phase]}</span></span><span class="drop-progress">${s.gate} / ${mission.gates.length} 통과</span></div>
  <div class="drop-scene-scroll" tabindex="0" aria-label="물길 장치 살펴보기 · 좁은 화면에서는 옆으로 밀 수 있어요">
   <div class="drop-scene" data-phase="${s.phase}" data-heat="${s.heat}" style="--stations:${mission.gates.length}">
    <svg class="drop-waterway" aria-hidden="true"><path class="drop-path-base"/><path class="drop-path-flow"/><path class="drop-path-glints"/></svg>
    <div class="drop-gates">${mission.gates.map((gate,i)=>station(gate,i,s)).join('')}</div>
    ${s.done?`<div class="drop-arrival">${avatar(s)}<span>물길 도착!</span></div>`:''}
   </div>
  </div>
  <p class="drop-world-label"><span class="drop-pan-hint">옆으로 밀어 다음 장치도 살펴봐.</span>${s.done?'모습을 바꾸며 물길을 모두 통과했어!':esc(mission.gates[s.gate].hint)}</p>
 </section>`;
}
export function dropAdventureView(state,header){
 const s=restoreAdventure(state.dropAdventure),mission=expeditions[s.chapter],gate=mission.gates[s.gate];
 let controls;
 if(s.done){
  controls=`<div class="drop-discovery"><h2>내가 만든 물의 변화</h2><ul>${s.log.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="drop-controls">${btn(s.chapter===4?'처음 길 다시 탐험':'다음 모험으로','drop-next','primary')}${btn('연구섬 지도','map','secondary')}</div>`;
 }else{
  controls=`<div class="drop-controls">${btn('열 주기','drop-warm','warm')}${btn('열 빼앗기','drop-cool','cool')}${gate.space?btn(s.space?'✓ 여유 공간 남겼어':'물을 덜어 공간 남기기','drop-space',s.space?'selected':'secondary'):''}${btn('길 따라 이동 '+icon('arrow',20),'drop-move','primary')}</div>
   <div class="drop-energy"><span>열을 빼앗기</span><meter min="-2" max="2" value="${s.heat}" aria-label="열 조절 단계"></meter><span>열을 주기</span></div>`;
 }
 return `<div class="drop-adventure">${header}<main class="drop-adventure-main">
  <header class="drop-mission"><div><small>자유 탐험 · 변신 모험 ${s.chapter+1} / ${expeditions.length}</small><h1>${mission.title}</h1></div><div class="drop-links">${btn('실험 지도','map','secondary')}${btn('다시 도전','drop-retry','secondary')}</div></header>
  ${scene(s,mission)}
  <section class="drop-dock"><p class="drop-feedback" role="status" aria-live="polite">${esc(s.message)}</p>${controls}
   <details class="drop-science"><summary>게임과 실제 과학</summary><p>얼음은 단단한 모양을 유지하고, 물은 모양을 바꾸며 흘러. 수증기는 눈에 보이지 않아 점선으로 위치만 표시했어. 얼굴·장치 사이 이동·버튼 횟수는 게임의 표현이며 실제 변화 시간이나 크기를 나타내지 않아. 실제 뜨거운 물은 어른과 함께 다뤄.</p></details>
  </section></main></div>`;
}

let flowObserver;
export function cleanupDropAdventure(){flowObserver?.disconnect();flowObserver=null;}
function alignWaterway(){
 const scene=document.querySelector('.drop-scene');
 if(!scene)return;
 const box=scene.getBoundingClientRect(),devices=[...scene.querySelectorAll('.drop-device')];
 const svg=scene.querySelector('.drop-waterway');
 svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
 const paths=[];
 for(let index=0;index<devices.length-1;index++){
  const from=devices[index],to=devices[index+1];
  if(!from.matches('.drop-device-cooling,.drop-device-channel')||!to.matches('.drop-device-cooling,.drop-device-channel'))continue;
  const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
  const x1=a.right-box.left+(from.matches('.drop-device-channel')?a.width*.04:0);
  const x2=b.left-box.left+(to.matches('.drop-device-channel')?-b.width*.04:b.width*.06);
  const y1=a.bottom-box.top-a.height*.27,y2=b.bottom-box.top-b.height*.27;
  paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
 }
 for(const path of svg.querySelectorAll('path'))path.setAttribute('d',paths.join(' '));
}
export function mountDropAdventure(){
 cleanupDropAdventure();
 alignWaterway();
 const scene=document.querySelector('.drop-scene');
 if(scene){flowObserver=new ResizeObserver(alignWaterway);flowObserver.observe(scene);}
 const scroller=document.querySelector('.drop-scene-scroll');
 const target=document.querySelector('.drop-gate.is-current')||document.querySelector('.drop-arrival');
 if(scroller&&target){
  scroller.closest('.drop-world').classList.toggle('can-pan',scroller.scrollWidth>scroller.clientWidth+4);
  const box=scroller.getBoundingClientRect(),item=target.getBoundingClientRect();
  scroller.scrollLeft+=item.left-box.left+(item.width-box.width)/2;
 }
}

function animateChange(before,after,oldBox,oldForm){
 const actor=document.querySelector('.drop-avatar'),form=actor?.querySelector('.drop-form');
 if(!actor||!form)return;
 if(before.gate!==after.gate&&after.gate>before.gate&&oldBox){
  const box=actor.getBoundingClientRect(),distance=oldBox.left+oldBox.width/2-box.left-box.width/2;
  const dx=Math.abs(distance)<5?-110:distance,dy=oldBox.bottom-box.bottom;
  actor.classList.add('is-travelling');
  const travel=actor.animate([{translate:`${dx}px ${dy}px`},{translate:'0 0'}],{duration:1100,easing:'cubic-bezier(.3,0,.2,1)'});
  travel.finished.then(()=>actor.classList.remove('is-travelling'),()=>actor.classList.remove('is-travelling'));
  if(after.phase==='water')form.animate([{scale:'1 1'},{scale:'1.6 .5',offset:.45},{scale:'1 1'}],{duration:1100});
  return;
 }
 if(before.phase!==after.phase){
  if(oldForm){
   oldForm.classList.add('drop-old-form');actor.append(oldForm);
   const exit=oldForm.animate([{opacity:1,scale:'1 1'},{opacity:0,scale:after.phase==='vapor'?'1.4 .25':'.9 .45',translate:after.phase==='vapor'?'0 -45px':'0 0'}],{duration:650,fill:'forwards'});
   exit.finished.then(()=>oldForm.remove(),()=>oldForm.remove());
  }
  form.animate([{opacity:0,scale:after.phase==='ice'?'1.15 .6':'.7 .3'},{opacity:1,scale:'1 1'}],{duration:850,easing:'ease-out'});
 }else if(before.heat!==after.heat){
  form.animate([{scale:'1 1'},{scale:'1.08 .94'},{scale:'1 1'}],{duration:450});
 }
}

export function handleDropAdventure(action,state,ctx){
 if(action==='drop-start'){
  state.dropAdventure=restoreAdventure(state.dropAdventure);
  state.dropReturn=false;
  ctx.go('adventure');
  return true;
 }
 if(!action.startsWith('drop-')||state.route!=='adventure')return false;
 const before=restoreAdventure(state.dropAdventure);
 if(action==='drop-lab'){state.dropReturn=false;ctx.go('map');return true;}
 const reduced=state.settings.reduced||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const actor=typeof document==='undefined'?null:document.querySelector('.drop-avatar');
 const oldBox=actor?.getBoundingClientRect(),oldForm=actor?.querySelector('.drop-form')?.cloneNode(true);
 state.dropAdventure=adventureMove(state.dropAdventure,action.slice(5));
 ctx.save();ctx.render();
 if(!reduced&&typeof document!=='undefined'&&before.chapter===state.dropAdventure.chapter){
  animateChange(before,state.dropAdventure,oldBox,oldForm);
 }
 return true;
}
