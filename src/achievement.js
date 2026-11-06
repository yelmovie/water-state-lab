// Rewards the learner keeps: the passport of area stamps and the final certificate.
import {residents} from './island-residents.js';
import {fieldMissions,fieldStages} from './fieldwork-model.js';
import {hasFieldSeal} from './fieldwork.js';
import {buddy,esc,icon} from './ui.js';

// The resident who asked for each area's request signs its stamp.
const signers=[2,4,5,8,10];
const person=i=>residents[signers[i]-1];

function seal(i){
 const r=person(i),arc=`seal-arc-${i}`;
 return `<svg class="seal" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="${arc}" d="M60 107a47 47 0 1 1 .01 0"/></defs><circle class="seal-ring" cx="60" cy="60" r="57"/><circle class="seal-inner" cx="60" cy="60" r="37"/><text class="seal-text"><textPath href="#${arc}" startOffset="50%" text-anchor="middle">${esc(r.spot)} 복구</textPath></text><image href="/assets/v2/resident-${r.stage}.webp" x="27" y="27" width="66" height="66"/></svg>`;
}
export function passportView(){
 const earned=fieldStages.map(hasFieldSeal),count=earned.filter(Boolean).length;
 const line=count===5?'도장을 다 모았어! 여권 완성!':count?`도장 ${5-count}개만 더 모으면 여권 완성!`:'구역 의뢰를 해결하고 첫 도장을 받아 봐!';
 const drops=earned.map((on,i)=>`<i class="${on?'on':''}" style="--i:${i}">${icon('drop',24)}</i>`).join('');
 const pages=fieldStages.map((n,i)=>{const m=fieldMissions[n];
  return `<article class="stamp-page area-${i+1} ${earned[i]?'earned':''}" style="--i:${i}">${earned[i]?seal(i):`<span class="seal-empty">${i+1}</span>`}<b>${esc(person(i).spot)}</b>${earned[i]?`<small>${esc(m.reward)}</small><p>${esc(m.ability)}</p>`:'<small>의뢰를 해결하면 찍혀</small>'}</article>`;}).join('');
 return `<section class="passport-book ${count===5?'is-full':''}" aria-label="탐구 여권, 도장 ${count}개 모음"><header class="passport-cover">${buddy(count===5?'celebrate':'proud')}<div><small>물방울 연구실</small><h3>방울이의 탐구 여권</h3><p>${line}</p></div><span class="passport-drops" aria-hidden="true">${drops}</span></header><div class="stamp-pages">${pages}</div></section>`;
}

// Twelve-point rosette around a water drop.
function goldSeal(){
 const points=Array.from({length:24},(_,i)=>{const a=i*Math.PI/12,r=i%2?46:56;return `${(60+r*Math.sin(a)).toFixed(1)},${(60-r*Math.cos(a)).toFixed(1)}`;}).join(' ');
 return `<svg class="cert-gold" viewBox="0 0 120 120" aria-hidden="true"><polygon points="${points}"/><circle cx="60" cy="60" r="38"/><path d="M60 32c-11 15-19 24-19 35a19 19 0 0 0 38 0c0-11-8-20-19-35z"/><path class="shine" d="M50 68a11 11 0 0 0 9 11"/></svg>`;
}
const skills=['물의 세 가지 모습과 우리 주변의 예를 말할 수 있어요.','물이 얼고 녹고 증발하고 끓고 응결할 때의 변화를 관찰했어요.','물의 상태 변화를 이용해 물을 모으는 장치를 설계했어요.'];
export function certificateView(strength){
 return `<div id="certificate-print"><div class="cert-sheet"><div class="cert-ribbon"><small>방울이의 물길 탐험</small><h3>연구 인증서</h3></div><p class="cert-name" id="cert-name">물방울 연구원</p><p class="cert-lead">물의 비밀을 찾아 멈춘 연구섬의 물길을 되살렸기에<br>이 인증서를 드립니다.</p><div class="cert-columns"><ul class="cert-skills">${skills.map((text,i)=>`<li style="--i:${i}"><span>${icon('check',18)}</span>${text}</li>`).join('')}</ul><div class="cert-seals">${fieldStages.map((_,i)=>`<span style="--i:${i}">${seal(i)}</span>`).join('')}</div></div><p class="cert-strength"><b>나의 강점</b> ${esc(strength)}</p><footer class="cert-foot">${buddy('celebrate')}<span>${new Date().toLocaleDateString('ko-KR')}<br>물방울 연구실 · 방울이</span>${goldSeal()}</footer></div></div>`;
}
