import {finalContext} from './workshop.js';
import {state} from './state.js';
import {missions,canEnter,currentTrialValid} from './domain.js';
import {buddy,icon,btn,propArt} from './ui.js';
import {islandStops,discoveryStars} from './scene-model.js';

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
export function workshopProgress(n){const s=state.lab.workshop;if(n===9){const revised=new Set(s.trials.map(t=>t.signature)).size>=2;return {steps:[{label:'냉각판 준비',done:s.cold},{label:'물길 시험',done:s.trials.length>0},{label:'고치고 비교',done:revised&&currentTrialValid(s)&&state.inquiry.workshopCompared===s.trials.at(-1)?.signature&&!!state.inquiry.workshopReason}],instruction:s.trials.length===0?'냉각판을 차갑게 하고 부품을 끌어 물길을 만들어 줘.':!s.trials.at(-1)?.ok?'물이 멈춘 곳을 보고 부품 하나를 고쳐 다시 시험해 줘.':!revised?'기울기나 부품 위치를 바꾸고 첫 시험과 비교해 줘.':!state.inquiry.workshopReason?'전후 비교를 눌러 달라진 부분을 골라 줘.':'완성한 장치를 저장하고 코어에 연결하자!',hint:'냉각판 → 경사판 → 깔때기 → 연결관 → 물통 순서야. 물은 아래로 흘러.',mood:'experiment'};}const f=finalContext().progress;return {steps:[{label:'증상 살피기',done:!!f.diagnosis?.tests.length},{label:'증거로 고치기',done:!!f.diagnosis?.resolved},{label:'물 보내기',done:f.tested}],instruction:f.tested?'물이 도착했어! 마지막 레버를 당겨 봐.':'시험에서 보이는 모습과 내 기록을 함께 살펴봐.',hint:'물이 처음부터 생기지 않는지, 중간에서 새는지 봐.',mood:'think'};}

export function journeyView(){
 const next=nextMission(),done=state.completed.length;
 const names=['물모양 샘터','얼음 다리','햇살 마당','이슬 정원','물길 공방'];
 const total=missions.reduce((sum,m)=>sum+discoveryStars(m.id,state).filter(Boolean).length,0);
 return `<main class="journey-main"><div class="journey-heading"><div><span class="eyebrow">물방울 연구실</span><h1>방울이의 물길 탐험</h1></div></div>
 <div class="journey-world"><img class="journey-art" src="/assets/v2/research-island-v4.webp" alt="샘터, 얼음 다리, 햇살 마당, 이슬 정원과 물길 공방이 오솔길로 이어진 연구섬">
 ${missions.map((m,i)=>{const finished=state.completed.includes(m.id),locked=!canEnter(m.screens[0],state),[x,y]=islandStops[i];return `<button class="journey-node ${finished?'finished':''} ${next.id===m.id&&!finished?'current':''}" style="left:${x/10}%;top:${y/5.63-17}%" data-action="mission-${m.id}" ${locked?'disabled':''} aria-label="${m.id}. ${names[i]}, ${finished?'다시 탐험':locked?'잠김':'길 따라 출발'}"><b>${locked?icon('lock',18):finished?icon('check',18):`<em>${m.id}</em>`}${names[i]}</b>${!locked&&finished?'<span class="node-state">연결 완료</span>':''}<small class="node-stars" aria-label="발견 별 ${discoveryStars(m.id,state).filter(Boolean).length}개">${discoveryStars(m.id,state).map(v=>`<span class="${v?'earned':''}">${v?'★':'☆'}</span>`).join('')}</small></button>`;}).join('')}
 <div class="journey-traveler" style="left:21.1%;top:65%">${buddy('wave')}</div></div>
 <div class="journey-bottom"><div class="journey-companion"><button class="map-coach" data-action="map-hint" aria-label="방울이의 다음 탐험 안내" aria-expanded="false" aria-controls="map-coach-help">${buddy(state.restored?'celebrate':'wave')}<span class="coach-trigger-badge">…</span><span class="coach-trigger-label">방울이 힌트</span></button><div id="map-coach-help" class="map-coach-help" hidden><b>방울이의 부탁</b><p>${state.restored?'네가 만든 물길이 섬을 살렸어! 우리의 발견을 보러 갈까?':done?journey[next.id-1].story:'물길이 끊겨 연구실이 멈췄어. 나랑 첫 샘터부터 살펴보자!'}</p></div></div><div class="journey-next"><small>${state.restored?'물길 복구 완료':`이번 발견으로 얻을 것 · ${journey[next.id-1].tool}`}</small>${btn(state.restored?'우리의 발견 보기':done===5?'마지막 코어 연결':`${names[next.id-1]}로 출발 ${icon('arrow')}`,state.restored?'ending':done===5?'screen-10':`mission-${next.id}`,'primary')}</div></div></main>`;
}
