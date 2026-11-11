// The learner keeps area stamps, simple observation notes, and a final certificate.
import {residentForStage} from './island-residents.js';
import {fieldMissions,areaStages} from './fieldwork-model.js';
import {missions,stageLessons} from './domain.js';
import {hasFieldSeal} from './fieldwork.js';
import {buddy,esc,icon} from './ui.js';

// The resident who asked for each area's request signs its stamp.
const signers=[2,4,6,8,10];
const person=i=>residentForStage(signers[i]);

function seal(i){
 const r=person(i),arc=`seal-arc-${i}`;
 return `<svg class="seal" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="${arc}" d="M60 107a47 47 0 1 1 .01 0"/></defs><circle class="seal-ring" cx="60" cy="60" r="57"/><circle class="seal-inner" cx="60" cy="60" r="37"/><text class="seal-text"><textPath href="#${arc}" startOffset="50%" text-anchor="middle">${esc(r.spot)} 복구</textPath></text><image href="/assets/v2/resident-${r.stage}.webp" x="27" y="27" width="66" height="66"/></svg>`;
}
const discoveries=[
 ['물의 세 가지 모습','물은 <strong>고체·액체·기체</strong>로 모습을 바꾼다는 것을 알았다.','얼음은 <strong>모양이 유지</strong>되고, 물은 <strong>그릇에 따라 모양이 달라진다</strong>는 것을 발견했다.'],
 ['얼음이 차지하는 공간','물이 얼면 <strong>부피가 커진다</strong>는 것을 알았다.','같은 물을 얼리고 녹여도 <strong>무게는 같다</strong>는 것을 발견했다. 통에는 얼음이 커질 공간을 남겨야 한다.'],
 ['증발과 끓음','물 표면에서 물이 수증기로 바뀌는 것이 <strong>증발</strong>이라는 것을 알았다.','물이 <strong>끓을 때</strong>는 물속에서도 <strong>수증기 기포</strong>가 생긴다는 것을 발견했다.'],
 ['차가운 컵의 물방울','공기 중 <strong>수증기</strong>가 차가운 컵에 닿아 <strong>물방울</strong>로 바뀐다는 것을 발견했다.','수증기가 물로 바뀌는 것을 <strong>응결</strong>이라고 한다는 것을 알았다.'],
 ['물을 모으는 장치','<strong>응결</strong>로 생긴 물방울을 모아 물을 얻을 수 있다는 것을 알았다.','물은 <strong>높은 곳에서 낮은 곳으로</strong> 흐른다는 것을 발견했다. 물길을 기울이고 이어서 물을 모았다.']
];
export function researchRecords(evidence){
 return `<div class="notebook-list">${discoveries.map(([title,first,second],i)=>`<article class="notebook-record"><span class="eyebrow">연구 기록 ${i+1} · ${evidence[i+1]?'기록 완료':'탐구 중'}</span><h3>${title}</h3>${evidence[i+1]?`<p>${first}</p><p>${second}</p>`:'<p class="muted">실험을 마치면 내가 알아낸 것이 여기에 남는다.</p>'}</article>`).join('')}</div>`;
}
export function passportView(){
 const earned=areaStages.map(hasFieldSeal),count=earned.filter(Boolean).length;
 const line=count===areaStages.length?'도장을 다 모았어! 탐구 노트 완성!':count?`도장 ${areaStages.length-count}개만 더 모으면 탐구 노트 완성!`:'구역 의뢰를 해결하고 첫 도장을 받아 봐!';
 const drops=earned.map((on,i)=>`<i class="${on?'on':''}" style="--i:${i}">${icon('drop',24)}</i>`).join('');
 const pages=areaStages.map((n,i)=>{const m=fieldMissions[n]??{reward:missions[n/2-1].reward,ability:stageLessons[n]};
  return `<article class="stamp-page area-${i+1} ${earned[i]?'earned':''}" style="--i:${i}">${earned[i]?seal(i):`<span class="seal-empty">${i+1}</span>`}<b>${esc(person(i).spot)}</b>${earned[i]?`<small>${esc(m.reward)}</small><p>${discoveries[i][1]}</p>`:'<small>의뢰를 해결하면 찍혀</small>'}</article>`;}).join('');
 return `<section class="passport-book ${count===areaStages.length?'is-full':''}" aria-label="탐구 노트, 도장 ${count}개 모음"><header class="passport-cover">${buddy(count===areaStages.length?'celebrate':'proud')}<div><small>물방울 연구실</small><h3>방울이의 탐구 노트</h3><p>${line}</p></div><span class="passport-drops" aria-hidden="true">${drops}</span></header><div class="stamp-pages">${pages}</div></section>`;
}

const skills=['물의 세 가지 모습과 우리 주변의 예를 말할 수 있어요.','물이 얼고 녹고 증발하고 끓고 응결할 때의 변화를 관찰했어요.','물의 상태 변화를 이용해 물을 모으는 장치를 설계했어요.'];
export function certificateView(){
 return `<div id="certificate-print"><div class="cert-sheet">
  <header class="cert-ribbon"><small>방울이의 물길 탐험</small><h3>연구 인증서</h3></header>
  <p class="cert-name">물방울 연구원</p>
  <div class="cert-student" aria-label="인쇄 후 손으로 작성하는 학생 정보">${['학교','반','번호','이름'].map(label=>`<div><b>${label}</b><span aria-label="${label} 쓰는 빈칸"></span></div>`).join('')}</div>
  <p class="cert-lead">물의 변화를 탐구하고 연구섬의 물길을 되살렸기에<br>이 인증서를 드립니다.</p>
  <div class="cert-columns"><ul class="cert-skills">${skills.map((text,i)=>`<li style="--i:${i}"><span>${icon('check',18)}</span>${text}</li>`).join('')}</ul><div class="cert-mascot">${buddy('celebrate')}</div></div>
  <footer class="cert-foot"><div class="cert-seals">${areaStages.map((_,i)=>`<span style="--i:${i}">${seal(i)}</span>`).join('')}</div><p>${new Date().toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}<br><strong>물방울 연구실 · 방울이</strong></p></footer>
 </div></div>`;
}
