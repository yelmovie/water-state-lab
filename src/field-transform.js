import {btn,icon,modal} from './ui.js';
import {transformationObserved} from './fieldwork-model.js';
import {freezeTrayView,bindFreezeTray} from './freeze-tray.js';
import {processView,bindProcess} from './transform-process.js';

const kinds=['freeze','melt','evaporate','condense'];
const labels={freeze:'얼리기',melt:'녹이기',evaporate:'끓이기',condense:'응결'};
const modelNote='실제 변화에 걸리는 시간을 줄인 모형이야. 물의 양과 주변 조건에 따라 시간은 달라져. 응결은 수증기가 충분한 공기에서 판을 충분히 차갑게 한 조건이야. 수증기는 눈에 보이지 않아. 실제 가열은 선생님과 함께 해.';
const nextKey=c=>kinds.find(key=>!transformationObserved(c,key));
function view(c,key=nextKey(c)){
 const progress=`<ol class="transform-progress" aria-label="변신길 진행 상황">${kinds.map((id,i)=>`<li ${id===key?'aria-current="step"':''} class="${transformationObserved(c,id)?'is-done':''}"><span aria-hidden="true">${transformationObserved(c,id)?icon('check',16):i+1}</span>${labels[id]}</li>`).join('')}</ol>`;
 const top=`<div class="transform-top">${progress}<button type="button" class="field-help-btn" data-action="field-help">파랑의 부탁 다시 보기</button></div>`;
 const content=key==='freeze'?freezeTrayView(c):key?processView(c,key):`<div class="transform-complete"><img src="/assets/v2/resident-2.webp" width="144" height="144" alt=""><div><h2>물의 변신길 네 개를 모두 찾았어!</h2><p>준비하고, 조건을 바꾸고, 시간이 지난 모습을 비교했어.</p>${btn('개념 영상 보고 도장 받기','field-finish','primary')}</div></div>`;
 return top+content+`<div class="transform-footer">${btn('앞 실험 다시 보기','field-back','quiet')}<button type="button" class="btn quiet transform-model" data-transform-model>모형 안내</button></div>`;
}
export function transformView(c){return `<section id="field-transform" class="field-transform" aria-label="물의 네 가지 변신">${view(c)}</section>`;}
export function bindTransform(host,get){
 let key=nextKey(get());const life=new AbortController();
 const paint=()=>{host.innerHTML=view(get(),key);host.querySelector('[data-tray-action],[data-process-action],[data-transform-next],[data-action="field-finish"]')?.focus({preventScroll:true});};
 const cleanupTray=bindFreezeTray(host,get,paint),cleanupProcess=bindProcess(host,get,()=>key,paint);
 host.addEventListener('click',e=>{
  if(e.target.closest('[data-transform-model]')){host.dispatchEvent(new Event('transform-pause'));modal('실험 모형 안내',`<p>${modelNote}</p>`);return;}
  if(!e.target.closest('[data-transform-next]')||!transformationObserved(get(),key))return;key=nextKey(get());paint();
 },{signal:life.signal});
 return ()=>{life.abort();cleanupTray();cleanupProcess();};
}
