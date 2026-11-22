// The learner keeps area stamps, simple observation notes, and a final certificate.
import {residentForStage} from './island-residents.js';
import {fieldMissions,areaStages} from './fieldwork-model.js';
import {missions,stageLessons} from './domain.js';
import {hasFieldSeal} from './fieldwork.js';
import {buddy,esc,icon} from './ui.js';
import {SETTINGS_CONTENT} from './settings-content.js';

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
export function certificateView({reduced=false}={}){
 return `<section id="certificate-print" class="cert-paper${reduced?' cert-reduced':''}" aria-label="물방울 연구원 인증서"><img class="cert-frame" src="/assets/certificate-frame-20261122.webp" alt="" aria-hidden="true"><div class="cert-content"><p class="cert-world">방울이의 물길 탐험 · 물방울 연구실</p><h3 class="cert-title">물방울 연구원 인증서</h3><div class="cert-recipient"><div class="cert-recipient-top"><span class="cert-blank cert-school" data-cert-blank="school" aria-label="학교 쓰는 빈칸"></span><span>학교</span><span class="cert-blank cert-short" data-cert-blank="grade" aria-label="학년 쓰는 빈칸"></span><span>학년</span><span class="cert-blank cert-short" data-cert-blank="class" aria-label="반 쓰는 빈칸"></span><span>반</span><span class="cert-blank cert-short" data-cert-blank="number" aria-label="번호 쓰는 빈칸"></span><span>번</span></div><div class="cert-recipient-name"><b>이름</b><span class="cert-blank cert-name" data-cert-blank="name" aria-label="이름 쓰는 빈칸"></span></div></div><p class="cert-award">위 연구원은 물의 여러 모습과 상태 변화를 관찰·비교하고,<br>그 원리로 물을 모으는 장치를 설계해 연구섬의 물길을 되살렸으므로<br><strong>물방울 연구원</strong>으로 이 인증서를 드립니다.</p><div class="cert-learning">${skills.map(text=>`<p>${esc(text)}</p>`).join('')}</div><div class="cert-bottom"><p class="cert-date">인증서를 만든 날<br><b>${new Date().toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</b></p><div class="cert-stamp">${icon('drop')}<strong>물길 탐험<br>연구원 인증</strong></div><p class="cert-issuer">주는 이<br><b>물방울 연구실 · 방울이</b></p></div><small class="cert-credit">${esc(SETTINGS_CONTENT.credits.copyright)}</small></div></section><p class="cert-note">인쇄한 뒤 학교·반·번호·이름을 직접 적어요.</p>`;
}
