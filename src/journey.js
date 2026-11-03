import {residentMarkers,residentCounter,returnedResidents,nextGreeting,villageFriend} from './island-residents.js';
import {finalContext} from './workshop.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';
import {villageLights} from './village-lights.js';
import {missions,canEnter,currentTrialValid,testCollector} from './domain.js';
import {buddy,icon,btn,propArt} from './ui.js';
import {islandStops,islandLanding,walkIslandStep,islandWalkTo,nearbyMapActions,routeDistance,pointOnRoute,clampValue as clamp} from './scene-model.js';

export const journey=[
 {tool:'관찰 돋보기',prop:'magnifier',need:'물과 얼음을 구분해야 얼어 버린 배관을 조사할 수 있어.',after:'관찰 돋보기를 찾았어. 다음 실험에서 눈금과 물의 모습을 자세히 보자.',story:'연구실의 물건들이 뒤섞였어. 직접 만지고 옮겨서 물의 모습을 찾아줘!',x:21.8,y:66},
 {tool:'배관 안전 기록',prop:'ice',need:'얼 때 달라지는 부피를 알아야 배관이 터지지 않아.',after:'비교한 배관 기록으로 얼음 구역을 연결했어. 이제 줄어드는 물의 행방을 찾자.',story:'얼음 구역의 배관이 막혔어. 얼기 전후를 재고, 물을 얼마나 담을지 정해줘.',x:35.2,y:35.5},
 {tool:'시간 관찰 기록',prop:'beaker',need:'물이 어디로 갔는지 알아야 다시 모을 방법을 찾을 수 있어.',after:'물이 수증기로 변하는 걸 알아냈어. 공기 중 수증기를 다시 물로 모을 수 있을까?',story:'내가 그린 물그림이 흐려지고 있어! 시간을 움직여 물이 어떻게 달라지는지 함께 보자.',x:49,y:59},
 {tool:'응결 냉각판',prop:'icepack',need:'차가운 표면의 물방울이 어디서 오는지 알아야 수집 장치를 만들 수 있어.',after:'공기 중 수증기가 차가운 표면에서 물방울로 변했어. 이 원리로 장치를 만들자!',story:'컵 안의 물은 그대로인데 바깥에 물방울이 생겼어. 내가 닦을게, 너는 증거를 찾아줘.',x:64.6,y:31},
 {tool:'내 물 수집 장치',prop:'seedling',need:'응결한 물이 물통까지 흐르도록 네가 길을 설계해야 해.',after:'네가 고친 장치로 모은 물이 연구실의 물길을 움직여!',story:'이제 우리가 알아낸 걸 써 볼 차례야. 물방울이 새는 곳을 찾고 장치를 고쳐줘.',x:82,y:45.8}
];
// Coordinates follow the cream paths in the generated island, including the shared bridge.
export const trails=[
 [[21.8,66],[27.7,64.5],[31.6,61.5],[34.8,58.2],[39.1,56.8],[42.3,54.5],[43,50],[44.2,46],[43.9,43.7],[42.2,40.8],[39.5,38.9],[37,37.1],[35.2,35.5]],
 [[35.2,35.5],[39.5,38.9],[42.2,40.8],[43.9,43.7],[44.2,46],[43,50],[42.3,54.5],[44.5,57],[46.5,58.5],[49,59]],
 [[49,59],[53.5,58],[56,54],[57.3,49],[58.5,44],[58,41],[59.4,38],[61.4,35.5],[63.8,33],[64.6,31]],
 [[64.6,31],[68.8,31.3],[71.8,34],[73.7,37.5],[73.7,42],[75.4,44.7],[77.8,45.1],[82,45.8]]
];
export function travelRoute(from,to){const points=[];if(from<to){for(let i=from;i<to;i++)points.push(...trails[i]);}else{for(let i=from-1;i>=to;i--)points.push(...[...trails[i]].reverse());}return points;}
export function mapEntryScreen(area){
 const first=area*2-1;
 return !state.completed.includes(area)&&state.pages.includes(first)&&canEnter(first+1,state)?first+1:first;
}
export function nextMission(){return missions.find(m=>!state.completed.includes(m.id))||missions[4];}
export function legacyJourneyView(home=false){
 const next=nextMission(),done=state.completed.length,stop=Math.max(0,Math.min(done-1,4)),pos=journey[stop],hasStarted=state.pages.length>0;
 return `<main class="journey-main"><div class="journey-heading"><div><span class="eyebrow">4학년 과학 · 물의 상태 변화</span><h1>${home?'방울이와 되찾는 물길':'우리의 발견으로 이어지는 길'}</h1><p>${state.restored?'네가 만든 장치 덕분에 연구실이 다시 움직여.':'관찰하고, 비교하고, 고쳐서 다섯 구역을 연결해 줘.'}</p></div><div class="journey-progress"><b>${done}<small> / 5</small></b><span>연구 기록</span></div></div>
 <div class="journey-world"><img class="journey-art" src="/assets/v2/journey-map.webp" alt="바다 위 연구섬. 관찰실에서 얼음 실험실, 시간 관찰실, 물방울 분석실을 거쳐 코어까지 길이 이어져 있어."><svg class="journey-paths" viewBox="0 0 1000 563" aria-hidden="true">${trails.map((points,i)=>`<polyline points="${points.map(([x,y])=>`${x*10},${y*5.63}`).join(' ')}" class="${state.completed.includes(i+1)?'open':''}"/>`).join('')}</svg>
 ${missions.map((m,i)=>{const j=journey[i],finished=state.completed.includes(m.id),locked=!canEnter(m.screens[0],state);return `<button class="journey-node ${finished?'finished':''} ${next.id===m.id&&!finished?'current':''}" style="left:${j.x}%;top:${j.y}%" data-action="mission-${m.id}" ${locked?'disabled':''} aria-label="${m.id}. ${m.short} ${finished?'연구 완료':locked?'앞 연구 완료 후 열림':'연구 시작'}"><span>${finished?icon('check',24):locked?icon('lock',21):m.id}</span><b>${m.short}</b><small>${finished?'물길 연결 완료':locked?'앞 연구를 마쳐줘':'여기서 시작 →'}</small></button>`;}).join('')}
 <div class="journey-traveler" data-stop="${stop}" style="left:${pos.x}%;top:${pos.y}%">${buddy(state.restored?'celebrate':'point')}</div><div class="world-status">${state.restored?'물길 복구 완료':done?`${done}개 구역 연결 · 다음 발견을 향해!`:'방울이가 첫 관찰실에서 기다리고 있어'}</div></div>
 <div class="journey-bottom"><div class="journey-companion">${buddy(state.restored?'celebrate':'wave')}<div><b>방울이</b><p>${state.restored?'네 기록과 네 장치로 해냈어! 연구노트에 우리의 발견을 모아 뒀어.':home&&!hasStarted?'안녕! 나는 방울이야. 물길이 끊겨 연구실이 멈췄어. 나와 함께 물의 비밀을 찾아줄래?':journey[next.id-1].story}</p></div></div><div class="journey-next"><small>${state.restored?'완성된 연구 이야기':`다음 목표 · ${journey[next.id-1].tool}`}</small>${btn(state.restored?'우리의 연구 결과 보기':state.completed.includes(5)?'마지막 코어 연결하기':`${hasStarted?'이어서':'첫 실험'} 시작하기 ${icon('arrow')}`,state.restored?'ending':state.completed.includes(5)?'screen-10':`mission-${next.id}`,'primary')}</div></div>
 <div class="toolbelt" aria-label="연구로 얻은 도구와 기록">${journey.map((j,i)=>`<div class="${state.completed.includes(i+1)?'earned':''}">${propArt(j.prop)}<span>${j.tool}</span>${state.completed.includes(i+1)?icon('check',16):icon('lock',16)}</div>`).join('')}</div></main>`;
}
export function workshopProgress(n){const s=state.lab.workshop;if(n===9){const revised=new Set(s.trials.map(t=>t.signature)).size>=2;return {steps:[{label:'냉각판 준비',done:s.cold},{label:'물길 시험',done:s.trials.length>0},{label:'고치고 비교',done:revised&&currentTrialValid(s)&&state.inquiry.workshopCompared===s.trials.at(-1)?.signature&&!!state.inquiry.workshopReason}],instruction:s.trials.length===0?(s.cold?'‘시험하기’를 눌러 물방울이 어디까지 가는지 봐.':'‘냉각팩 붙이기’를 눌러 판을 차갑게 한 뒤 ‘시험하기’를 눌러 봐.'):s.trials.at(-1).signature!==testCollector(s.parts,s.cold,s.angle).signature?'배치를 바꿨어. 현재 배치로 다시 시험해 줘.':!s.trials.at(-1)?.ok?'물이 멈춘 곳을 보고 부품 하나를 고쳐 다시 시험해 줘.':!revised?'기울기나 부품 위치를 바꾸고 첫 시험과 비교해 줘.':state.inquiry.workshopCompared!==s.trials.at(-1)?.signature||!state.inquiry.workshopReason?'전후 비교를 눌러 달라진 부분을 골라 줘.':'완성한 장치를 저장하고 코어에 연결하자!',hint:'냉각판 → 경사판 → 깔때기 → 연결관 → 물통 순서야. 물은 아래로 흘러.',mood:'experiment'};}const f=finalContext().progress;return {steps:[{label:'증상 살피기',done:!!f.diagnosis?.tests.length},{label:'증거로 고치기',done:!!f.diagnosis?.resolved},{label:'물 보내기',done:f.tested}],instruction:f.tested?'물이 도착했어! 마지막 레버를 당겨 봐.':f.connected?f.valve>0?'물 보내기를 눌러 코어에 도착하는지 시험해 줘.':'밸브를 열어 물이 흐를 길을 만들어 줘.':f.diagnosis?.resolved?'고친 장치를 코어에 연결해 줘.':!f.diagnosis?.tests.length?'먼저 ‘장치 시험’을 눌러 물이 어디에서 멈추는지 봐.':!f.diagnosis.hypothesis?'물방울이 생겼을까? 시험 결과를 보고 고장 원인을 하나 골라 봐.':!f.diagnosis.evidence?'네 생각을 뒷받침할 컵 실험 기록이나 장치 기록을 눌러 봐.':'냉각이나 깔때기 위치를 고친 뒤 ‘장치 시험’을 다시 눌러 봐.',hint:'물이 처음부터 생기지 않는지, 중간에서 새는지 봐.',mood:'think'};}

const islandNames=['물모양 샘터','얼음 다리','햇살 마당','이슬 정원','물길 공방'];
export function journeyView(){
 const next=nextMission(),done=state.completed.length,entry=mapEntryScreen(next.id);
 const names=islandNames,returned=returnedResidents(state),fresh=state.villageArrivals;
 const latest=returned.find(r=>r.stage===fresh.at(-1));
 const arrival=latest?`<button class="village-welcome" data-action="resident-talk-${latest.stage}"><img src="/assets/v2/resident-${latest.stage}.webp" alt=""><span><small>${latest.stage}장 복구 · ${latest.spot}</small><strong>${latest.news}</strong></span><em>${latest.name} 만나기 ›</em></button>`:'';
 return `<main class="journey-main"><div class="journey-heading"><div class="${arrival?'has-village-news':''}"><span class="eyebrow">물방울 연구실</span><h1${arrival?' class="sr-only"':''}>방울이의 물길 탐험</h1>${arrival}</div>${residentCounter(state)}</div>
 <div class="map-viewport" tabindex="0" aria-label="연구섬 지도. 방향키로 길을 따라 걷고, 가까이에서 엔터로 대화하거나 들어갈 수 있어."><div class="journey-world"><img class="journey-art" src="/assets/v2/research-island-v4.webp" draggable="false" alt="샘터, 얼음 다리, 햇살 마당, 이슬 정원과 물길 공방이 오솔길로 이어진 연구섬">
 ${villageLights(returned,fresh,villageFriend(state))}
 ${missions.map((m,i)=>{const finished=state.completed.includes(m.id),locked=!canEnter(m.screens[0],state),[x,y]=islandStops[i];return `<button class="journey-node ${finished?'finished':''} ${next.id===m.id&&!finished?'current':''}" style="left:${x/10}%;top:${Math.max(9,y/5.63-10)}%" data-action="mission-${m.id}" ${locked?'disabled':''} aria-label="${m.id}. ${names[i]}, ${finished?'다시 탐험':locked?'잠김':'길 따라 출발'}"><b>${locked?icon('lock',18):finished?icon('check',18):`<em>${m.id}</em>`}${names[i]}</b>${!locked&&finished?'<span class="node-state">연결 완료</span>':''}</button>`;}).join('')}
 ${residentMarkers(state)}<div class="journey-traveler" role="img" aria-label="탐험 중인 방울이"><span class="map-walk-sprite"></span></div></div><div class="map-nearby" role="group" aria-label="가까이에서 할 수 있는 행동" hidden></div><span class="sr-only map-nearby-status" role="status"></span><div class="map-hand-hint" aria-hidden="true">${icon('hand',40)}<span>방향키로 걷고, 가까이에서 엔터!</span></div></div>
 <div class="journey-bottom"><div class="journey-companion"><button class="map-coach" data-action="map-hint" aria-label="방울이의 다음 탐험 안내" aria-expanded="false" aria-controls="map-coach-help">${buddy(state.restored?'celebrate':'wave')}<span class="coach-trigger-badge">…</span><span class="coach-trigger-label">방울이 힌트</span></button><div id="map-coach-help" class="map-coach-help" hidden><b>방울이의 부탁</b><p>${state.restored?'네가 만든 물길이 섬을 살렸어! 우리의 발견을 보러 갈까?':done?journey[next.id-1].story:'물길이 끊겨 연구실이 멈췄어. 나랑 첫 샘터부터 살펴보자!'}</p></div></div><div class="map-pad" role="group" aria-label="지도 조작"><div class="map-arrows" role="group" aria-label="방울이 이동"><span class="map-arrow-label" aria-hidden="true">방울이<br>이동</span>${[['up','위'],['left','왼쪽'],['down','아래'],['right','오른쪽']].map(([d,label])=>`<button type="button" class="map-arrow map-arrow-${d}" data-map-move="${d}" aria-label="방울이 ${label}로 이동">${icon('arrow',24)}</button>`).join('')}</div><div class="map-modes"><button type="button" class="map-mode" data-map-mode="hand" aria-pressed="false">${icon('hand',22)}<span>손으로 밀기</span></button><button type="button" class="map-mode" data-map-mode="overview" aria-pressed="false">${icon('expand',22)}<span>한눈에 보기</span></button></div></div><div class="journey-next"><small>${state.restored?'물길 복구 완료':`이번 발견으로 얻을 것 · ${journey[next.id-1].tool}`}</small>${btn(state.restored?'우리의 발견 보기':done===5?'마지막 코어 연결':entry%2===0?`${entry}장 이어하기 ${icon('arrow')}`:`${names[next.id-1]}${[0,1].includes(next.id-1)?'로':'으로'} 출발 ${icon('arrow')}`,state.restored?'ending':done===5?'screen-10':`mission-${next.id}`,'primary')}</div></div></main>`;
}

// Map camera: the 16:9 island always covers the screen (no bands) and is zoomed in on Bangul.
// Drag pans the view. Directional controls move the traveler in island coordinates.
const MAP_W=1000,MAP_H=563,MAP_ZOOM=1.3;
const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
const mapView={overview:false,hand:false,handHintSeen:false};
let mapCamera=null;
export function cleanupMapCamera(){mapCamera?.destroy();mapCamera=null;}
export function travelIsland(i,arrive){if(!mapCamera)return false;mapCamera.travel(i,arrive);return true;}
export function mountMapCamera(){
 cleanupMapCamera();
 const view=document.querySelector('.map-viewport'),world=view?.querySelector('.journey-world');if(!world)return;
 const root=view.closest('.journey-main'),hint=view.querySelector('.map-hand-hint'),controller=new AbortController(),{signal}=controller;
 const done=state.completed.length,actor=world.querySelector('.journey-traveler'),sprite=actor.querySelector('.map-walk-sprite');
 const nearby=view.querySelector('.map-nearby'),announcement=view.querySelector('.map-nearby-status');
 const targets=[
  ...returnedResidents(state).map(r=>({feet:r.feet,name:r.name,verb:'대화하기',action:'resident-talk-'+r.stage})),
  ...missions.filter(m=>canEnter(m.screens[0],state)).map(m=>({feet:islandStops[m.id-1],name:islandNames[m.id-1],verb:'들어가기',action:'mission-'+m.id}))
 ];
 const arrival=returnedResidents(state).find(r=>r.stage===state.villageArrivals.at(-1));
 let position=!state.pages.length&&!done?islandLanding:islandStops[clamp(done-1,0,islandStops.length-1)];
 if(arrival){
  // Stay on the road beside the newcomer, with their conversation as the Enter action.
  const offsets=[[-24,6],[24,6],[-20,-5],[20,-5],[20,0],[0,18],[0,-18],[0,0]];
  const spots=offsets.map(([x,y])=>walkIslandStep(arrival.feet,x,y));
  position=spots.find(p=>nearbyMapActions(p,targets)[0]?.action==='resident-talk-'+arrival.stage)??spots.at(-1);
 }
 let focus=arrival?.feet??nextGreeting(state)?.feet??position,free=null,scale=1,ox=0,oy=0,grab=null,dragged=false,hintTimer=0;
 const blocked=()=>document.querySelector('dialog[open]');
 const held=new Map();
 let frame=0,lastTime=0,departing=false,arrivalFrame=0,facing=0,stride=0,nearKey='';
 const reduceMotion=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paintPose(moving=false){
  const col=moving&&!reduceMotion()?[0,1,2,1][Math.floor(stride/10)%4]:1;
  sprite.style.backgroundPosition=(col*50)+'% '+(facing*100/3)+'%';
 }
 function showNearby(){
  const hits=departing?[]:nearbyMapActions(position,targets),key=hits.map(t=>t.action).join(' ');
  if(key===nearKey)return;
  nearKey=key;nearby.hidden=!hits.length;
  nearby.innerHTML=hits.map((t,i)=>`<button type="button" data-action="${t.action}" aria-label="${t.name} ${t.verb}"><small>${t.name}</small><b>${t.verb}</b>${i===0?'<kbd>Enter</kbd>':''}</button>`).join('');
  announcement.textContent=hits.length?`${hits[0].name} ${hits[0].verb}. 엔터로 선택할 수 있어.`:'';
 }
 function placeTraveler(next=position){
  const dx=next[0]-position[0],dy=next[1]-position[1];
  if(dx||dy){facing=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);stride+=Math.hypot(dx,dy);}
  position=next;
  actor.style.left=position[0]/MAP_W*100+'%';actor.style.top=position[1]/MAP_H*100+'%';
  paintPose(!!(dx||dy));showNearby();
 }
 function draw(glide=false,follow=false){
  const w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;
  scale=Math.max(w/MAP_W,h/MAP_H)*(mapView.overview?1:MAP_ZOOM);
  const ww=MAP_W*scale,wh=MAP_H*scale,box=view.getBoundingClientRect();
  // Aim between the title and the bottom panels so Bangul is not hidden behind the controls.
  const top=root.querySelector('.journey-heading')?.getBoundingClientRect().bottom??box.top,low=root.querySelector('.journey-bottom')?.getBoundingClientRect().top??box.bottom;
  const cy=low-top>120?(top+low)/2-box.top:h*.55;
  if(follow){
   // Let Bangul cross the middle of the screen before scrolling the scenery.
   const x=position[0]*scale+ox,y=(position[1]-36)*scale+oy,band=Math.max(30,(low-top)*.25);
   free={x:ox+clamp(x,w*.32,w*.68)-x,y:oy+clamp(y,cy-band,cy+band)-y};
  }
  ox=clamp(free?free.x:w*.5-focus[0]*scale,w-ww,0);oy=clamp(free?free.y:cy-(focus[1]-30)*scale,h-wh,0);
  if(free)free={x:ox,y:oy};
  if(!nearby.hidden){
   const x=position[0]*scale+ox,y=position[1]*scale+oy;
   // Keep the action beside Bangul, inside the visible map and clear of the pad.
   const half=nearby.offsetWidth/2+5;
   nearby.style.left=clamp(x,half,w-half)+'px';
   const above=y-54*scale-nearby.offsetHeight;
   nearby.style.top=clamp(above>=top-box.top+6?above:y+6,6,Math.max(6,low-box.top-nearby.offsetHeight-4))+'px';
   nearby.style.visibility=x<0||x>w||y<0||y>h?'hidden':'visible';
  }
  world.classList.toggle('glide',glide&&!state.settings.reduced);
  world.style.width=ww+'px';world.style.height=wh+'px';world.style.transform=`translate3d(${ox}px,${oy}px,0)`;
  view.classList.toggle('hand-on',mapView.hand);
  root.querySelector('[data-map-mode="hand"]')?.setAttribute('aria-pressed',String(mapView.hand));
  const overview=root.querySelector('[data-map-mode="overview"]');
  if(overview){overview.setAttribute('aria-pressed',String(mapView.overview));overview.querySelector('span').textContent=mapView.overview?'방울이 따라 보기':'한눈에 보기';}
 }
 function hideHint(){clearTimeout(hintTimer);mapView.handHintSeen=true;hint?.classList.remove('show');}
 function step(dx,dy,distance){
  const length=Math.hypot(dx,dy);if(!length||departing)return;
  const next=walkIslandStep(position,dx/length*distance,dy/length*distance);
  if(Math.hypot(next[0]-position[0],next[1]-position[1])<.02){paintPose();return;}
  placeTraveler(next);focus=position;draw(false,true);
 }
 function stopWalking(){held.clear();cancelAnimationFrame(frame);frame=0;paintPose();}
 function release(source){
  if(held.delete(source)&&!held.size)stopWalking();
 }
 function advance(time){
  if(blocked()||departing){stopWalking();return;}
  let dx=0,dy=0;for(const [x,y] of held.values()){dx+=x;dy+=y;}
  const elapsed=clamp(time-lastTime,0,50);lastTime=time;
  step(dx,dy,elapsed*.14);frame=requestAnimationFrame(advance);
 }
 function press(source,direction){
  if(blocked()||departing||held.has(source))return;
  hideHint();held.set(source,direction);step(...direction,8);
  if(!frame){lastTime=performance.now();frame=requestAnimationFrame(advance);}
 }
 view.addEventListener('pointerdown',e=>{if(e.button>0||blocked()||e.target.closest('.map-nearby'))return;grab={id:e.pointerId,x:e.clientX,y:e.clientY,ox,oy};dragged=false;hideHint();},{signal});
 addEventListener('pointermove',e=>{
  if(grab?.id!==e.pointerId)return;const dx=e.clientX-grab.x,dy=e.clientY-grab.y;
  if(!dragged&&Math.hypot(dx,dy)<8)return;
  if(!dragged){dragged=true;view.dataset.drag='1';view.classList.add('grabbing');}
  free={x:grab.ox+dx,y:grab.oy+dy};draw();
 },{signal});
 // The island canvas reads drag/dragEnd so a released drag is not taken as a tap on a place.
 const letGo=e=>{if(grab?.id!==e.pointerId)return;grab=null;view.classList.remove('grabbing');if(dragged)view.dataset.dragEnd=String(performance.now());delete view.dataset.drag;};
 addEventListener('pointerup',letGo,{signal});addEventListener('pointercancel',letGo,{signal});
 // A drag, or any tap while the hand is on, never opens a place.
 view.addEventListener('click',e=>{if(e.detail===0||e.target.closest('.map-nearby')||(!dragged&&!mapView.hand))return;dragged=false;e.preventDefault();e.stopPropagation();},{signal,capture:true});
 root.querySelectorAll('[data-map-move]').forEach(button=>{
  const name=button.dataset.mapMove,direction=directions['Arrow'+name[0].toUpperCase()+name.slice(1)];
  button.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   button.setPointerCapture(e.pointerId);press(e.pointerId,direction);
  },{signal});
  for(const type of ['pointerup','pointercancel','lostpointercapture']){
   button.addEventListener(type,e=>release(e.pointerId),{signal});
  }
  // A keyboard or assistive-technology activation has no pointerdown.
  button.addEventListener('click',e=>{if(e.detail===0&&!blocked()){hideHint();step(...direction,8);paintPose();}},{signal});
 });
 root.querySelector('[data-map-mode="hand"]')?.addEventListener('click',()=>{mapView.hand=!mapView.hand;hideHint();draw();},{signal});
 root.querySelector('[data-map-mode="overview"]')?.addEventListener('click',()=>{mapView.overview=!mapView.overview;free=null;draw(true);},{signal});
 document.addEventListener('keydown',e=>{
  if(blocked()||departing||e.target.closest?.('input,textarea,select,[contenteditable="true"]')||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='Enter'&&!nearby.hidden&&(e.target===view||e.target===document.body)){
   e.preventDefault();if(!e.repeat){stopWalking();nearby.querySelector('button')?.click();}return;
  }
  if(!Object.hasOwn(directions,e.key))return;
  e.preventDefault();
  if(!e.repeat){view.focus({preventScroll:true});press(e.key,directions[e.key]);}
 },{signal});
 document.addEventListener('keyup',e=>release(e.key),{signal});
 addEventListener('blur',stopWalking,{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWalking();},{signal});
 world.addEventListener('focusin',e=>{
  const button=e.target.closest('.island-resident:focus-visible');if(!button)return;
  focus=[parseFloat(button.style.left)*10,parseFloat(button.style.top)*5.63];free=null;draw();
 },{signal});
 world.addEventListener('transitionend',()=>world.classList.remove('glide'),{signal});
 const observer=new ResizeObserver(()=>draw());observer.observe(view);
 placeTraveler();draw();
 if(state.villageArrivals.length){
  state.villageArrivals=[];save();
  if(arrival)void playCue('discover');
 }
 if(!arrival&&!mapView.handHintSeen&&hint){hint.classList.add('show');hintTimer=setTimeout(hideHint,4200);}
 mapCamera={
  travel(to,arrive){
   if(departing)return;
   departing=true;stopWalking();hideHint();showNearby();
   const path=islandWalkTo(position,to),distance=routeDistance(path);
   if(reduceMotion()||distance<2){arrive();return;}
   let start=performance.now(),fraction=0;
   const duration=clamp(distance*4,160,4800);
   function walk(time){
    if(!blocked())fraction=Math.min(1,fraction+clamp(time-start,0,60)/duration);
    start=time;
    placeTraveler(pointOnRoute(path,fraction));focus=position;draw(false,true);
    if(fraction<1)arrivalFrame=requestAnimationFrame(walk);else arrive();
   }
   arrivalFrame=requestAnimationFrame(walk);
  },
  destroy(){stopWalking();cancelAnimationFrame(arrivalFrame);clearTimeout(hintTimer);observer.disconnect();controller.abort();}
 };
}
