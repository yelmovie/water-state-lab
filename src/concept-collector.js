import {btn,buddy,icon,esc,canArt} from './ui.js';
import {setMusicQuiet} from './sound.js';
const phases=[
 {title:'먼저, 차갑게 하지 않은 판',text:'받이를 같은 자리에 놓아도 판이 차갑지 않으면 이 모형에서는 물이 모이지 않아.'},
 {title:'공기 중 수증기가 차가운 판을 만나면',text:'컵 바깥 물방울과 같은 원리야. 눈에 보이지 않던 수증기가 차가운 판에서 작은 물방울로 변해. 응결이야.'},
 {title:'물방울이 커져 아래로 떨어져',text:'작은 물방울이 모여 커지면 아래로 떨어져. 물을 더 붓거나 컵 속에서 꺼낸 것이 아니야.'},
 {title:'떨어지는 자리 아래에서 모아',text:'판은 차갑게, 받이는 바로 아래에. 이렇게 모은 물이 다음 물길 장치의 출발이 돼.'}
];
const art='/assets/learning/experiment-props-20261107/';
export function openCollectorConcept({reduced=false,onContinue,continueLabel='실험으로 돌아가기',onClose}={}){
 const opener=document.activeElement,d=document.createElement('dialog');d.className='concept-dialog collector-concept';d.setAttribute('aria-labelledby','concept-title');
 d.innerHTML=`<div class="dialog-head"><div><span class="eyebrow">네 번째 발견 · 응결로 물 모으기</span><h2 id="concept-title">컵에서 찾은 원리로 물을 모아!</h2></div><button class="icon-btn" data-collector-close aria-label="설명 닫기">${icon('close')}</button></div><div class="collector-concept-body"><div class="collector-concept-art" data-phase="0" role="img" aria-label="차가운 판에 맺힌 물방울이 아래 받이에 모이는 모습"><div class="collector-air-label">공기 중 수증기<small>눈에 보이지 않아</small></div><img class="collector-plate" src="${art}plate.webp" alt="금속판"><img class="collector-pack" src="${art}icepack.webp" alt="냉각팩"><div class="collector-condensation">${Array.from({length:8},(_,i)=>`<img src="${art}dew.webp" alt="" style="--i:${i};left:${34+i%4*7}%;top:${30+i%2*4}%">`).join('')}</div><div class="collector-falling">${Array.from({length:4},(_,i)=>`<img src="${art}dew.webp" alt="" style="--i:${i}">`).join('')}</div><div class="collector-catch"><span></span><img src="${art}catcher.webp" alt="판 바로 아래의 물 받이"></div><p class="collector-state">차갑게 하기 전 · 모인 물 없음</p></div><div class="collector-concept-copy"><div class="collector-transfer"><div data-transfer-can>${canArt(0)}</div><span>다른 물체에서도<br>겉면을 비교해 봐!</span></div><h3>${phases[0].title}</h3><p role="status" aria-live="polite">${phases[0].text}</p><div class="collector-concept-steps" role="group" aria-label="설명 장면">${phases.map((p,i)=>`<button type="button" data-collector-step="${i}" aria-pressed="${i===0}">${i+1}<span>${['차갑게 하기 전','응결','물방울','모으기'][i]}</span></button>`).join('')}</div></div></div><footer class="concept-footer"><button type="button" class="btn secondary" data-collector-replay>처음부터 보기</button>${btn(continueLabel,'','primary').replace('data-action=""','data-collector-continue')}</footer>`;
 document.body.append(d);let timer,closed=false;
 const show=i=>{d.querySelector('[data-transfer-can]').innerHTML=canArt(i?18:0);d.querySelector('.collector-transfer span').textContent=i?'충분히 차가운 캔 겉면에도 물방울이 생겨.':'차갑게 하기 전 캔 · 마른 겉면';d.querySelector('.collector-concept-art').dataset.phase=i;d.querySelector('.collector-concept-copy h3').textContent=phases[i].title;d.querySelector('.collector-concept-copy p').textContent=phases[i].text;d.querySelector('.collector-state').textContent=['차갑게 하기 전 · 모인 물 없음','냉각팩을 붙임 · 표면에 맺힘','물방울이 커져 떨어짐','같은 받이 · 물이 모임'][i];d.querySelectorAll('[data-collector-step]').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));};
 const stop=()=>{clearInterval(timer);timer=undefined;};
 const play=()=>{stop();show(0);if(reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let i=0;timer=setInterval(()=>{show(++i);if(i===3)stop();},3400);};
 const visibility=()=>{if(document.hidden)stop();};
 const close=()=>{if(closed)return;closed=true;stop();d.close();d.remove();document.removeEventListener('visibilitychange',visibility);setMusicQuiet(false);onClose?.();if(opener?.isConnected)opener.focus({preventScroll:true});};
 d.addEventListener('cancel',e=>{e.preventDefault();close();});d.addEventListener('close',close,{once:true});
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-collector-close'))close();if(b.hasAttribute('data-collector-continue')){close();onContinue?.();}if(b.hasAttribute('data-collector-replay'))play();if(b.dataset.collectorStep!==undefined){stop();show(+b.dataset.collectorStep);}});
 document.addEventListener('visibilitychange',visibility);setMusicQuiet(true);d.showModal();d.querySelector('[data-collector-continue]').focus();play();return {dialog:d,close};
}
