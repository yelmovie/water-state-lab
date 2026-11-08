import {attachNpcVoice} from './npc-voice.js';
import {modal,btn} from './ui.js';
import {playCue} from './sound.js';
import {state,save} from './state.js';
import {stageLessons} from './domain.js';

// The coordinates are the residents' feet on the 1000 × 563 island painting.
export const residents = [
 {stage:2, repair:'샘터 회랑 등불', news:'회랑에 등불이 켜졌어!', name:'파랑', role:'소식꾼 물총새', spot:'물모양 샘터', feet:[277,324], hello:'오늘 첫 물소식이야! 네가 물의 여러 모습을 찾아 줘서 샘터 관찰책을 다시 펼쳤어.', ask:'책에 무엇을 그렸어?', reply:'고드름이랑 시냇물을 그렸어. 공기 중 수증기는 눈에 보이지 않아서 글로 적었지!'},
 {stage:4, repair:'얼음 다리 길잡이등', news:'다리에 길잡이등이 켜졌어!', name:'뚝딱', role:'배관공 비버', spot:'얼음 다리', feet:[309,131], hello:'톡톡, 수리 끝! 네 겨울 물통 기록을 보고 우리 작업장에도 얼음이 커질 자리를 남겼어.', ask:'물통을 왜 덜 채워?', reply:'물이 얼면 부피가 커져. 가득 찬 단단한 통에는 얼음이 커질 자리가 부족할 수 있어.'},
 {stage:6, repair:'찻집 화로', news:'찻집 화로가 켜졌어!', name:'보리', role:'찻집 주인 레서판다', spot:'햇살 마당', feet:[613,281], hello:'어서 와, 햇살 찻집 첫 손님이야! 네 관찰 기록 옆에 내 주전자를 걸어 뒀어.', ask:'안 끓여도 물이 줄어?', reply:'응! 끓지 않아도 물 표면에서 증발해. 물이 끓을 때는 물속에서도 수증기 기포가 생겨.'},
 {stage:8, repair:'온실 창문 불빛', news:'온실 창문이 환해졌어!', name:'송이', role:'이슬 정원사 고슴도치', spot:'이슬 정원', feet:[711,188], hello:'물방울 받이를 펴니까 정원 일이 다시 시작됐어. 네가 시험한 것처럼 받이를 냉각판 바로 아래에 뒀지.', ask:'잎사귀 받이는 무슨 일 해?', reply:'차가운 판에 맺혀 떨어지는 물방울을 받아. 물방울이 떨어질 곳을 보고 자리를 잘 잡아야 해!'},
 {stage:10, repair:'물레방앗간 등불', news:'물레방앗간에 불이 켜졌어!', name:'느티', role:'온실지기 거북이', spot:'물길 공방', feet:[839,329], hello:'들리니? 물레가 다시 도는 소리야. 네 장치에서 온 물로 오늘 첫 모종에 물을 줬단다.', ask:'우리 섬이 어떻게 살아났어?', reply:'네가 물을 관찰하고, 차가운 판에 맺힌 물을 모으고, 새는 곳을 고쳐 줬지. 자, 우리가 함께 키울 첫 잎이야!'}
];
export const residentForStage=n=>Number.isInteger(n)&&n>=1&&n<=10?residents.find(r=>r.stage===Math.ceil(n/2)*2):undefined;
const met=(progress,r)=>progress.residentsMet.some(n=>Math.ceil(n/2)*2===r.stage);

export function returnedResidents(progress) {
 return residents.filter(({stage})=>{
  if(stage===10)return progress.restored;
  if(progress.pages.includes(stage))return true;
  // Older saves can contain the finished area without individual page entries.
  const area=Math.ceil(stage/2);
  return progress.completed.includes(area);
 });
}
export function nextGreeting(progress) {
 return returnedResidents(progress).filter(r=>!met(progress,r)).at(-1);
}
const portrait=r=>`/assets/v2/resident-${r.stage}.webp`;
const action=(name,r)=>`resident-${name}-${r.stage}`;
export function residentMarkers(progress) {
 const arriving=nextGreeting(progress);
 return returnedResidents(progress).map(r=>`<button type="button" class="island-resident" data-action="${action('talk',r)}" style="left:${r.feet[0]/10}%;top:${r.feet[1]/5.63}%" aria-label="${r.spot}, ${r.role} ${r.name}에게 말 걸기" ${r===arriving?'data-arriving':''}><img src="${portrait(r)}" alt="" draggable="false"><span class="resident-speech" aria-hidden="true">${r===arriving?'인사하기':'···'}</span></button>`).join('');
}
export function villageFriend(progress){
 return returnedResidents(progress).length===residents.length&&residents.every(r=>met(progress,r));
}
export function residentReward(stage){
 const r=residentForStage(stage);
 return `<div class="restoration-prize"><img src="${portrait(r)}" alt=""><div><small>${r.spot} 복구</small><strong>${r.news}</strong><span>${r.role} ${r.name}</span></div></div>`;
}
export function residentCounter(progress) {
 const count=returnedResidents(progress).length;
 return `<button type="button" class="resident-counter" data-action="resident-list" aria-label="마을 수첩 열기, 돌아온 주민 ${count}명"><span class="village-friend-star" ${villageFriend(progress)?'':'hidden'} aria-label="마을의 단짝">★</span>마을 수첩 <b>${count}/5</b></button>`;
}
export function openResidentList() {
 const returned=returnedResidents(state),greetedCount=returned.filter(r=>met(state,r)).length;
 const spreads=[];
 for(let i=0;i<residents.length;i++){
  const slots=residents.slice(i,i+1).map(r=>{
   if(!returned.includes(r))return `<div class="village-slot waiting"><i aria-hidden="true">◇</i><span><b>${r.spot}</b><small>실험을 마치면 돌아와</small></span></div>`;
   const greeted=met(state,r);
   return `<button type="button" class="village-slot" data-action="${action('talk',r)}" aria-label="${r.name}에게 말 걸기, ${r.repair}"><img src="${portrait(r)}" alt=""><span><b>${r.name}</b><small>${r.repair}</small><em>${greeted?'✓ 인사 도장':'첫인사하기'}</em></span></button>`;
  }).join('');
  spreads.push(`<section class="village-spread"><h3>${residents[i].spot}</h3><div>${slots}</div></section>`);
 }
 modal('건물과 친구들',`<div class="village-tally"><strong>건물 복구 ${returned.length}/5</strong><span>만난 친구 ${greetedCount}/5</span></div>${spreads.join('')}`);
}
// A finished stage runs straight into its resident's talk. The last button carries on to `next`.
let ending=null;
export function stageEndTalk(stage,next,tool=''){
 ending={stage,next,tool};
 talkToResident(stage);
}
export function talkToResident(stage, followUp=false) {
 stage=residentForStage(stage)?.stage;if(!stage)return;
 const flow=state.route!=='map'&&ending?.stage===stage?ending:null;
 const r=returnedResidents(state).find(person=>person.stage===stage);
 if(!r)return;
 const first=!met(state,r);
 if(first){
  state.residentsMet.push(stage);save();
  void playCue('discover');
  if(villageFriend(state)){
   document.querySelector('.festival-ropes')?.setAttribute('visibility','visible');
   document.querySelector('.village-friend-star')?.removeAttribute('hidden');
  }
  // Refresh the two arrival flags without replacing the focused map or moving its camera.
  const next=nextGreeting(state);
  for(const marker of document.querySelectorAll('.island-resident')){
   const arriving=!!next && marker.dataset.action===action('talk',next);
   marker.toggleAttribute('data-arriving',arriving);
   marker.querySelector('.resident-speech').textContent=arriving?'인사하기':'···';
  }
 }
 const lesson=flow&&!followUp?`<section class="lesson-card"><small>${r.spot}에서 발견했어</small><strong>${stageLessons[r.stage]}</strong>${flow.tool?`<span>${flow.tool}${(flow.tool.charCodeAt(flow.tool.length-1)-0xAC00)%28?'을':'를'} 얻었어!</span>`:''}</section>`:'';
 const dialog=modal(`${r.name}의 이야기`,`${lesson}<article class="resident-chat"><img src="${portrait(r)}" alt="${r.role}"><div><small>${r.spot}</small><h3>${r.role} ${r.name}</h3><p>${followUp?r.reply:r.hello}</p><div class="village-stamp">${first?'✓ 처음 만난 친구':'✓ 다시 만난 친구'} · ${r.name}</div><div class="resident-replies">${followUp?'':btn(r.ask,action('ask',r),'primary')}${flow?(followUp?btn(flow.next.label,flow.next.action,'primary'):''):btn('지도 보기','resident-close',followUp?'primary':'secondary')}</div></div></article>`);
 attachNpcVoice(dialog,`${followUp?'reply':'hello'}-${String(stage).padStart(2,'0')}`);
}

