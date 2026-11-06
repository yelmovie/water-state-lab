import {modal,btn,icon,esc} from './ui.js';
import {residents} from './island-residents.js';
import {fieldMissions} from './fieldwork-model.js';
import {state} from './state.js';
import {setMusicQuiet} from './sound.js';

const requests=[
 null,
 ["안녕, 나 여울이야! 샘터의 물동이를 바꾸려는데, 물이랑 얼음도 모양이 똑같이 바뀔까?","물병을 눌러 옮길 그릇을 골라 봐. 얼음도 옮겨 보고, 둘이 어떻게 다른지 나한테 알려 줄래?","좋아, 옮겨 볼게!"],
 ["나 파랑이야! 물이 얼고, 얼음이 녹는 걸 봤는데 어떻게 그렇게 됐는지는 놓쳤지 뭐야.","내가 부탁한 변신을 하나씩 해 볼래? 도구를 고르고 직접 써 봐. 전과 뒤에 뭐가 달라졌는지 나한테도 알려 줘!","변신길을 찾아볼게!"],
 ["어라, 내가 붙여 둔 실험 사진이 섞였어! 네 기록을 빌려도 될까?","처음 물, 얼린 뒤, 녹인 뒤를 차례로 놓아 줘. 마지막엔 100 g짜리 추를 저울에 올려서 무게도 같이 확인하자.","내 기록을 펼쳐 볼게!"],
 ["뚝딱뚝딱, 큰일이야! 한파가 와서 사흘 밤 동안 샘터가 꽁꽁 언대.","그동안 쓸 물을 통에 담아 둬야 해. 많이 담아야 마을이 버티는데, 너무 담으면 얼면서 통이 터져. 수도꼭지를 꾹 눌러 채워 볼래?","통을 채워 볼게!"],
 ["앗, 내 화실 바닥에 물을 흘렸어! 같은 양이라도 넓게 펴면 먼저 마를까?","A 자국은 그대로 두고 B 자국만 손가락으로 펼쳐 줘. 같은 시간 동안 기다린 뒤 어느 쪽이 더 말랐는지 같이 보자!","어느 쪽이 마르는지 볼게!"],
 ["어서 와! 차를 끓이고 보니 주전자에 물이 줄었어. 옆에 둔, 끓이지 않은 물도 조금 줄었더라.","A와 B에서 줄어든 물을 하나씩 골라 어디로 갔는지 이어 줄래? 두 물에 어떤 공통점이 있는지 궁금해.","물의 행방을 찾아볼게!"],
 ["쉿, 이슬 탐정 초롱이야. A 컵에 생긴 물방울의 비밀을 알아내고 있어.","파란 냉각팩을 A 컵에 붙여 보고, 이번엔 B 컵으로 옮겨 봐. 똑같이 기다린 뒤, 물방울이 생긴 두 번의 공통점을 찾아 줄래?","냉각팩을 옮겨 볼게!"],
 ["온실 모종이 목마른가 봐. 공기에서 물을 모아 줄 수 있을까?","받이를 금속판 바로 아래에 두고 먼저 시험해 줘. 이번에는 받이를 그대로 두고 냉각팩만 붙여서, 같은 시간 뒤에 물이 모였는지 봐 줄래?","물방울을 모아 볼게!"],
 ["공방에 잘 왔어! 냉각판 아래로 떨어지는 물을 물통까지 데려가야 해.","나랑 경사판부터 깔때기, 연결관까지 아래로 길을 이어 보자. 시험할 때 물방울을 잘 봐 줘. 멈추거나 새는 곳이 보이면 고치면 돼!","물길을 이어 볼게!"],
 ["기다리고 있었단다. 이제 온실로 가는 마지막 물길만 남았어.","먼저 물이 수증기가 되는 길에 맞는 도구를 찾아 주렴. 수증기가 물방울로 돌아오는 길도 이어서, 우리 모종까지 물이 오는지 함께 시험해 보자꾸나.","온실까지 이어 볼게!"]
];
// These letters were rewritten after recording; the old voice would describe a different task.
const unrecorded=new Set([4]);
let stopCurrentVoice;

function bindVoice(dialog){
 const audio=dialog.querySelector('audio'),control=dialog.querySelector('.briefing-listen'),label=control.querySelector('span');
 const status=dialog.querySelector('.briefing-voice-status'),card=dialog.querySelector('.field-briefing');
 const lifetime=new AbortController(),{signal}=lifetime;
 let playing=false,heard=false;
 const showStatus=text=>{status.textContent=text;status.hidden=!text;};
 const update=value=>{
  if(playing!==value){playing=value;setMusicQuiet(value);}
  card.classList.toggle('is-speaking',value);
  label.textContent=value?'멈추기':heard?'다시 듣기':'목소리 듣기';
 };
 const stop=()=>{
  lifetime.abort();audio.pause();update(false);
  audio.removeAttribute('src');audio.load();
  if(stopCurrentVoice===stop)stopCurrentVoice=undefined;
 };
 const play=()=>{
  if(signal.aborted||!dialog.open||!dialog.contains(card))return;
  if(!state.settings.sound){showStatus('게임 소리를 켜면 목소리를 들을 수 있어.');return;}
  showStatus('');audio.currentTime=0;
  void audio.play().catch(()=>{if(!signal.aborted&&audio.error)showStatus('목소리를 불러오지 못했어. 말풍선에서 부탁을 읽을 수 있어.');});
 };
 control.addEventListener('click',()=>{if(audio.paused)play();else audio.pause();},{signal});
 audio.addEventListener('playing',()=>{heard=true;update(true);},{signal});
 for(const event of ['pause','ended','error'])audio.addEventListener(event,()=>update(false),{signal});
 audio.addEventListener('error',()=>showStatus('목소리를 불러오지 못했어. 말풍선에서 부탁을 읽을 수 있어.'),{signal});
 dialog.addEventListener('close',stop,{once:true,signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();},{signal});
 stopCurrentVoice=stop;
 if(state.settings.sound&&!document.hidden)play();
}

export function openFieldBriefing(n){
 // The drying request moved to chapter 6 but stays the painter's own letter and recording.
 const who=n===6?5:n,npc=residents[who-1],request=requests[who];
 if(!npc||!request)return;
 stopCurrentVoice?.();
 const [opening,asking,reply]=request;
 const voiced=!unrecorded.has(who);
 const hasFinal=(npc.name.charCodeAt(npc.name.length-1)-0xAC00)%28>0;
 const dialog=modal(`${npc.name}의 부탁 편지`,`<article class="field-briefing">
  <div class="letter-paper">
   <header class="letter-head">
    <div class="letter-subject"><p class="letter-to">탐험가 친구에게</p><h3>${esc(fieldMissions[n].title)}</h3></div>
    <p class="letter-postmark"><span>${esc(npc.spot)}</span><b>${n}장</b></p>
    <figure class="letter-stamp"><div><img src="/assets/v2/resident-${who}.webp" alt="" width="180" height="180"><figcaption>${esc(npc.name)}</figcaption></div></figure>
   </header>
   <div class="letter-body"><p>${esc(opening)}</p><p>${esc(asking)}</p></div>
   <p class="letter-from">${esc(npc.role)} ${esc(npc.name)}${hasFinal?'이':''}가</p>
  </div>
  <div class="briefing-actions">${voiced?`<button type="button" class="btn secondary briefing-listen">${icon('speaker',19)}<span>목소리 듣기</span></button>`:''}${btn(reply,'field-help-close','primary')}</div>
  ${voiced?`<p class="briefing-voice-status" role="status" hidden></p><audio preload="none" src="/assets/audio/briefings/resident-${String(who).padStart(2,'0')}.m4a"></audio>`:''}
 </article>`);
 if(voiced)bindVoice(dialog);
 return dialog;
}
