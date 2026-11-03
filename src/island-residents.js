import {modal,btn} from './ui.js';
import {playCue} from './sound.js';
import {state,save} from './state.js';

// The coordinates are the residents' feet on the 1000 × 563 island painting.
export const residents = [
 {stage:1, repair:'샘물 분수', news:'분수가 다시 솟아!', name:'여울', role:'샘물지기 수달', spot:'물모양 샘터', feet:[153,276], hello:'돌계단에 다시 물동이를 내려놓을 수 있어! 네가 두 그릇에 물을 부어 본 샘터야.', ask:'물동이를 바꾸면?', reply:'같은 물을 넓은 대야에 부으면 더 낮아 보여. 한 방울도 흘리지 않았다면 물의 양은 그대로야.'},
 {stage:2, repair:'샘터 회랑 등불', news:'회랑에 등불이 켜졌어!', name:'파랑', role:'소식꾼 물총새', spot:'물모양 샘터', feet:[277,324], hello:'오늘 첫 물소식이야! 네가 물의 여러 모습을 찾아 줘서 샘터 관찰책을 다시 펼쳤어.', ask:'책에 무엇을 그렸어?', reply:'고드름이랑 시냇물을 그렸어. 공기 중 수증기는 눈에 보이지 않아서 글로 적었지!'},
 {stage:3, repair:'측정소 눈금등', news:'측정소 눈금등이 켜졌어!', name:'눈솔', role:'눈금지기 북극여우', spot:'얼음 다리', feet:[252,152], hello:'어서 와! 다리 옆 측정소를 다시 열었어. 네가 남긴 얼기 전과 후의 눈금을 여기 걸어 뒀어.', ask:'얼음이 되면 더 무거워?', reply:'같은 물을 흘리거나 더하지 않고 얼리면 무게는 그대로야. 얼음이 차지하는 자리는 커졌지!'},
 {stage:4, repair:'얼음 다리 길잡이등', news:'다리에 길잡이등이 켜졌어!', name:'뚝딱', role:'배관공 비버', spot:'얼음 다리', feet:[309,131], hello:'톡톡, 수리 끝! 네 겨울 물통 기록을 보고 우리 작업장에도 얼음이 커질 자리를 남겼어.', ask:'물통을 왜 덜 채워?', reply:'물이 얼면 부피가 커져. 가득 찬 단단한 통에는 얼음이 커질 자리가 부족할 수 있어.'},
 {stage:5, repair:'화실의 오색 깃발', news:'화실에 깃발이 걸렸어!', name:'붓콩', role:'물그림 화가 토끼', spot:'햇살 마당', feet:[459,303], hello:'마당에 내 화실을 다시 열었어! 네 물그림처럼 나도 돌바닥에 물로 꽃을 그려 봤어.', ask:'꽃이 어디로 갔어?', reply:'햇살 아래서 물이 증발해 공기 중 수증기가 됐어. 다시 물로 그리면 여기가 또 새 도화지야!'},
 {stage:6, repair:'찻집 화로', news:'찻집 화로가 켜졌어!', name:'보리', role:'찻집 주인 레서판다', spot:'햇살 마당', feet:[613,281], hello:'어서 와, 햇살 찻집 첫 손님이야! 네 관찰 기록 옆에 내 주전자를 걸어 뒀어.', ask:'안 끓여도 물이 줄어?', reply:'응! 끓지 않아도 물 표면에서 증발해. 물이 끓을 때는 물속에서도 수증기 기포가 생겨.'},
 {stage:7, repair:'이슬 관찰등', news:'이슬 관찰등이 켜졌어!', name:'초롱', role:'이슬 탐정 청개구리', spot:'이슬 정원', feet:[652,150], hello:'정원 관찰소에 돌아왔어! 네가 두 컵을 비교한 덕분에 나도 물방울을 찾을 자리를 알아.', ask:'컵 밖의 물은 어디서 왔어?', reply:'공기 중 수증기가 차가운 컵 표면에서 물방울로 변했어. 겉면을 닦고 조금 기다리면 다시 관찰할 수 있어.'},
 {stage:8, repair:'온실 창문 불빛', news:'온실 창문이 환해졌어!', name:'송이', role:'이슬 정원사 고슴도치', spot:'이슬 정원', feet:[711,188], hello:'물방울 받이를 펴니까 정원 일이 다시 시작됐어. 네가 시험한 것처럼 받이를 냉각판 바로 아래에 뒀지.', ask:'잎사귀 받이는 무슨 일 해?', reply:'차가운 판에 맺혀 떨어지는 물방울을 받아. 물방울이 떨어질 곳을 보고 자리를 잘 잡아야 해!'},
 {stage:9, repair:'집수관의 물줄기', news:'집수관에 물이 흘러!', name:'고리', role:'물길 기술자 라쿤', spot:'물길 공방', feet:[762,311], hello:'공방 문을 다시 열었어. 네 설계대로 물이 아래로 흐르게 부품을 이으니 물통에 톡톡 떨어져!', ask:'어떻게 물길을 점검해?', reply:'물방울 하나를 따라가 봐. 깔때기를 비켜간다면 떨어지는 자리 아래로 옮긴 다음 다시 시험해.'},
 {stage:10, repair:'물레방앗간 등불', news:'물레방앗간에 불이 켜졌어!', name:'느티', role:'온실지기 거북이', spot:'물길 공방', feet:[839,329], hello:'들리니? 물레가 다시 도는 소리야. 네 장치에서 온 물로 오늘 첫 모종에 물을 줬단다.', ask:'우리 섬이 어떻게 살아났어?', reply:'네가 물을 관찰하고, 차가운 판에 맺힌 물을 모으고, 새는 곳을 고쳐 줬지. 자, 우리가 함께 키울 첫 잎이야!'}
];

export function returnedResidents(progress) {
 return residents.filter(({stage})=>{
  if(stage===10)return progress.restored;
  if(progress.pages.includes(stage))return true;
  // Older saves can contain the finished area without individual page entries.
  const area=Math.ceil(stage/2);
  return progress.completed.includes(area) && (stage===9 || stage%2===0 || !progress.pages.includes(stage+1));
 });
}
export function nextGreeting(progress) {
 return returnedResidents(progress).filter(r=>!progress.residentsMet.includes(r.stage)).at(-1);
}
const portrait=r=>`/assets/v2/resident-${r.stage}.webp`;
const action=(name,r)=>`resident-${name}-${r.stage}`;
export function residentMarkers(progress) {
 const arriving=nextGreeting(progress);
 return returnedResidents(progress).map(r=>`<button type="button" class="island-resident" data-action="${action('talk',r)}" style="left:${r.feet[0]/10}%;top:${r.feet[1]/5.63}%" aria-label="${r.spot}, ${r.role} ${r.name}에게 말 걸기" ${r===arriving?'data-arriving':''}><img src="${portrait(r)}" alt="" draggable="false"><span class="resident-speech" aria-hidden="true">${r===arriving?'인사하기':'···'}</span></button>`).join('');
}
export function villageFriend(progress){
 return returnedResidents(progress).length===residents.length&&residents.every(r=>progress.residentsMet.includes(r.stage));
}
export function residentReward(stage){
 const r=residents[stage-1];
 return `<div class="restoration-prize"><img src="${portrait(r)}" alt=""><div><small>${r.spot} · ${stage}장 복구</small><strong>${r.news}</strong><span>돌아온 주민 · ${r.role} ${r.name}</span></div></div>`;
}
export function residentCounter(progress) {
 const count=returnedResidents(progress).length;
 return `<button type="button" class="resident-counter" data-action="resident-list" aria-label="마을 수첩 열기, 돌아온 주민 ${count}명"><span class="village-friend-star" ${villageFriend(progress)?'':'hidden'} aria-label="마을의 단짝">★</span>마을 수첩 <b>${count}/10</b></button>`;
}
export function openResidentList() {
 const returned=returnedResidents(state),met=returned.filter(r=>state.residentsMet.includes(r.stage)).length;
 const spreads=[];
 for(let i=0;i<residents.length;i+=2){
  const slots=residents.slice(i,i+2).map(r=>{
   if(!returned.includes(r))return `<div class="village-slot waiting"><i aria-hidden="true">◇</i><span><b>${r.stage}장</b><small>완료하면 돌아와</small></span></div>`;
   const greeted=state.residentsMet.includes(r.stage);
   return `<button type="button" class="village-slot" data-action="${action('talk',r)}" aria-label="${r.name}에게 말 걸기, ${r.repair}"><img src="${portrait(r)}" alt=""><span><b>${r.name}</b><small>${r.repair}</small><em>${greeted?'✓ 인사 도장':'첫인사하기'}</em></span></button>`;
  }).join('');
  spreads.push(`<section class="village-spread"><h3>${residents[i].spot}</h3><div>${slots}</div></section>`);
 }
 modal('마을 복구 수첩',`<div class="village-tally"><strong>마을 복구 ${returned.length}/10</strong><span>인사 도장 ${met}/10</span></div><p class="village-goal">${villageFriend(state)?'★ 마을의 단짝 · 돌다리에 축제 깃발이 걸렸어!':'돌아온 주민과 첫인사를 나눠 봐. 도장 열 개를 모으면 돌다리에 축제 깃발이 걸려!'}</p>${spreads.join('')}`);
}
export function talkToResident(stage, followUp=false) {
 const r=returnedResidents(state).find(person=>person.stage===stage);
 if(!r)return;
 const first=!state.residentsMet.includes(stage);
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
 modal(`${r.name}의 이야기`,`<article class="resident-chat"><img src="${portrait(r)}" alt="${r.role}"><div><small>${r.spot} · ${r.stage}장 복구</small><h3>${r.role} ${r.name}</h3><p>${followUp?r.reply:r.hello}</p><div class="village-stamp">${first?(villageFriend(state)?'★ 마을의 단짝! 돌다리에 축제 깃발이 걸렸어.':`✓ 첫인사 도장 · ${r.name}`):`✓ ${r.name}의 인사 도장`}</div><div class="resident-replies">${followUp?'':btn(r.ask,action('ask',r),'primary')}${btn('지도 보기','resident-close',followUp?'primary':'secondary')}</div></div></article>`);
}

