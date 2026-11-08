import {createObservationClock} from './observation-speed.js';
import {btn,icon,esc} from './ui.js';
import {nights,reasons,vessels,currentNight,nightFills,nightTrial,levelHeight,retryHint} from './cold-night-model.js';
import {fieldAction,fieldReady} from './fieldwork-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

const POUR_PER_SECOND=28,TAP_STEP=5,TAP_MS=180,FREEZE_MS=4200;
const BOTTOM=250,HEIGHT=150,RIM=BOTTOM-HEIGHT;
const briefs=['첫째 날이야. 내일 마을에서 물이 70만큼 필요해. 수도꼭지를 꾹 눌러 채우고, 추운 밤을 지켜보자.','둘째 날은 뚜껑 있는 모형 통도 써. 두 통에 물을 150만큼 모으되, 위쪽에 물을 채우지 않은 공간도 남겨 줘.','마지막 날이야! 세 통에 물을 240만큼 준비해. 통마다 위쪽에 물을 채우지 않은 공간이 있는지 확인해 줘.'];
const outcomeLabels={ok:'멀쩡해',overflow:'넘쳤어',crack:'얼음이 커질 공간 부족',raised:'얼음이 위로 올라왔어'};
const outlines={
 tub:'M20 30V170q0 10 10 10h80q10 0 10-10V30',
 jar:'M20 44q0-14 14-14h72q14 0 14 14V166q0 14-14 14H34q-14 0-14-14Z',
 bottle:'M52 30V62q0 13-16 20-16 7-16 22V166q0 14 14 14h72q14 0 14-14V104q0-15-16-22-16-7-16-20V30Z'
};
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const surfaceY=(kind,volume)=>kind==='tub'?224-105*levelHeight(kind,volume):BOTTOM-HEIGHT*levelHeight(kind,volume);
/** Ice in an open tub can rise past the rim; everywhere else the vessel stops it. */
const iceTopY=(kind,ice)=>kind==='tub'&&ice>100?RIM-(ice-100)*2:surfaceY(kind,ice);

function vesselArt(kind,index,volume,{frozen=false,ghost=null,outcome=''}={}){
 const id=`cold-clip-${index}`,top=frozen?iceTopY(kind,volume):surfaceY(kind,volume),closed=vessels[kind].closed;
 const path=kind==='bottle'?'M84 100V128Q84 138 67 145Q45 152 45 174V234Q45 250 60 250H140Q155 250 155 234V174Q155 152 133 145Q116 138 116 128V100Z':kind==='jar'?'M45 100H155V236Q155 250 140 250H60Q45 250 45 236Z':'M26 100H174L168 232Q168 250 151 250H49Q32 250 32 232Z';
 const body=kind==='tub'?'tub':kind+'-body',x=kind==='tub'?17:kind==='jar'?39:46,w=kind==='tub'?166:kind==='jar'?122:108;
 return `<svg class="cold-art" viewBox="0 0 200 280" aria-hidden="true"><defs><clipPath id="${id}"><path d="${path}"/></clipPath><linearGradient id="${id}-water"><stop stop-color="#0d8bb4"/><stop offset=".3" stop-color="#6ddbed"/><stop offset=".7" stop-color="#2da8cf"/><stop offset="1" stop-color="#15739f"/></linearGradient><linearGradient id="${id}-ice" x2=".5" y2="1"><stop stop-color="#f0feff"/><stop offset=".4" stop-color="#b8e6f3"/><stop offset=".65" stop-color="#84c4de"/><stop offset="1" stop-color="#d7f5fc"/></linearGradient></defs>
 <ellipse cx="100" cy="259" rx="78" ry="7" fill="#31505d" opacity=".18"/>
 <image href="/assets/learning/experiment-props-20261107/${body}.webp" x="${x}" y="94" width="${w}" height="160" preserveAspectRatio="none"/>
 <g clip-path="url(#${id})"><rect class="cold-water ${frozen?'is-ice':''}" data-level="${index}" x="22" y="${top}" width="156" height="${Math.max(0,260-top)}" style="fill:url(#${id}-${frozen?'ice':'water'})"/>
 <ellipse data-surface="${index}" cx="100" cy="${top}" rx="${kind==='bottle'&&volume>88?15:55}" ry="5" opacity="${volume?1:0}" fill="${frozen?'#e3faff':'#90e6f3'}" stroke="#ecfeff" stroke-width="1.3"/>
 ${frozen?`<path d="M42 ${top+12}l35 24 47-17 26 25M77 ${top+36}l-15 47 35 33 40-22M97 ${top+116}l-28 29" fill="none" stroke="#f4feff" stroke-width="1.8" opacity=".7"/>`:''}</g>
 <image href="/assets/learning/experiment-props-20261107/${body}.webp" x="${x}" y="94" width="${w}" height="160" preserveAspectRatio="none" opacity="${kind==='tub'?1:.48}"/>
 ${closed?`<image class="cold-lid ${frozen?'':'is-open'}" href="/assets/learning/experiment-props-20261107/${kind}-lid.webp" x="${kind==='jar'?53:83}" y="${kind==='jar'?83:85}" width="${kind==='jar'?94:35}" height="18" preserveAspectRatio="none"/>`:''}
 ${ghost===null?'':`<line class="cold-ghost" x1="22" x2="178" y1="${iceTopY(kind,ghost)}" y2="${iceTopY(kind,ghost)}"/>`}
 ${!frozen?`<image class="cold-faucet" href="/assets/learning/experiment-props-20261107/faucet.webp" x="-12" y="-5" width="146" height="104"/><path class="cold-stream" data-stream="${index}" d="M116 69 Q112 100 116 ${top}" fill="none" stroke="#7ddbec" stroke-width="5" stroke-linecap="round"/><g class="cold-splash" data-splash="${index}" transform="translate(116 ${top})"><path d="M-15 -4q8-8 15 0 8-8 15 0" fill="none" stroke="#dcfbff" stroke-width="2"/><ellipse rx="18" ry="4" fill="none" stroke="#b8f3fc" stroke-width="1.5"/></g>`:''}
 ${outcome==='crack'?'<path class="cold-crack" d="M100 102 84 141l22 20-17 28 20 25-9 35M84 141l-25 11M106 161l31 5"/><g class="cold-burst"><text x="100" y="170">쩍!</text></g>':''}
 ${['overflow','raised'].includes(outcome)?`<path class="cold-dome" d="M30 103q70 -28 140 0"/><g class="cold-burst"><text x="100" y="170">위로 올라왔어</text></g>`:''}
 </svg>`;
}
function vesselCard(kind,index,fill,ui){
 const trial=ui.phase!=='fill'?ui.trial?.vessels[index]:null,outcome=ui.phase==='result'?trial?.outcome:'';
 const volume=trial?trial.ice:fill,name=vessels[kind].name;
 return `<div class="cold-vessel" data-index="${index}" ${outcome?`data-outcome="${outcome}"`:''}>
  <div class="cold-taps">${ui.phase==='fill'?`<button type="button" class="cold-tap" data-pour="${index}" data-dir="1" aria-label="${esc(name)}에 물 담기">${icon('drop',20)}<span>수도꼭지 열기</span></button><button type="button" class="cold-drain" data-pour="${index}" data-dir="-1" aria-label="${esc(name)}에서 물 빼기">빼기</button>`:''}</div>
  ${vesselArt(kind,index,volume,{frozen:!!trial,ghost:ui.phase==='fill'?ui.ghost?.[index]??null:null,outcome})}
  <p class="cold-name"><strong>${esc(name)}</strong><span>${outcome?(outcome==='ok'?icon('check',16):'')+outcomeLabels[outcome]:`담은 물 <b data-amount="${index}">${fill}</b>`}</span></p>
 </div>`;
}
function meter(total,need,capacity){
 return `<div class="cold-meter"><p>녹여 쓸 물 <b data-total>${total}</b> / ${need}</p><div class="cold-gauge" aria-hidden="true"><i data-gauge style="width:${total/capacity*100}%"></i><u style="left:${need/capacity*100}%"></u></div></div>`;
}
function say(text,extra=''){
 return `<div class="cold-bubble"><img src="/assets/v2/resident-4.webp" width="96" height="96" alt="뚝딱"><div role="status"><p>${esc(text)}</p>${extra}</div></div>`;
}
function top(c,current){
 return `<div class="transform-top cold-top"><ol class="transform-progress" aria-label="한파 진행 상황">${nights.map(n=>`<li ${n===current?'aria-current="step"':''} class="${c.marks.includes('night-'+n.id)?'is-done':''}"><span aria-hidden="true">${c.marks.includes('night-'+n.id)?icon('check',16):n.id}</span>${n.name}</li>`).join('')}</ol><button type="button" class="field-help-btn" data-action="field-help">뚝딱의 부탁 다시 보기</button></div>`;
}
const footer=`<div class="transform-footer">${btn('앞 실험 다시 보기','field-back','quiet')}<details><summary>모형 안내</summary><p>물의 양과 얼음이 커지는 정도는 비교하려고 만든 값이야. 열린 통은 얼음이 위로 올라올 수 있어. 닫힌 모형 통은 얼음이 커질 공간 부족을 비교해. 실제 용기의 재질·모양·얼어가는 방향에 따른 파손을 계산한 안전 기준은 아니야.</p></details></div>`;

function reasonView(c){
 const trial=nightTrial(3,nightFills(c,nights[2]));
 const comparison=`<div class="cold-reason-scene"><div class="cold-row" style="--count:3">${nights[2].vessels.map((kind,i)=>vesselCard(kind,i,trial.vessels[i].fill,{phase:'result',trial})).join('')}</div><p>얼기 전 물높이와 얼음 위에 남은 공간을 비교해 봐.</p></div>`;
 return `${top(c,null)}${comparison}<div class="cold-explain"><img src="/assets/v2/resident-4.webp" width="120" height="120" alt="뚝딱"><div><h2>사흘을 버텼어! 왜 통 위쪽을 비워 뒀을까?</h2><p>마을 친구들에게 네 말로 알려 줘.</p>
  <div class="cold-reasons" role="group" aria-label="통 위쪽을 비운 까닭">${reasons.map(r=>`<button type="button" class="btn secondary" data-reason="${r.id}" aria-pressed="${c.selected===r.id}">${esc(r.label)}</button>`).join('')}</div>
  ${c.selected?`<p class="cold-reason-hint" role="status">${esc(c.message)}</p>`:''}</div></div>${footer}`;
}
function doneView(c){
 const tried=c.tested.filter(t=>t.value<=3).length;
 return `${top(c,null)}<div class="transform-complete"><img src="/assets/v2/resident-4.webp" width="144" height="144" alt=""><div><h2>얼음 다리 마을이 한파를 이겨 냈어!</h2><p>물이 얼면 커져. 닫힌 통 위쪽에는 물을 채우지 않은 공간을 남겼고, 아침의 얼음은 녹여서 써.${tried?` 밤을 ${tried}번 시험했어.`:''}</p>${btn('개념 영상 보고 도장 받기','field-finish','primary')}</div></div>${footer}`;
}
export function coldNightMarkup(c,ui){
 if(fieldReady(4,c))return doneView(c);
 // A night counts as cleared the moment it is frozen, but its morning still belongs on screen.
 const night=ui.phase==='fill'?currentNight(c):nights[ui.trial.night-1];
 if(!night)return reasonView(c);
 const fills=nightFills(c,night),total=fills.reduce((a,b)=>a+b,0),result=ui.phase==='result'?ui.trial:null;
 const failures=c.tested.filter(t=>t.value===night.id&&!t.ok).length,hint=ui.trial?retryHint(ui.trial,failures):'';
 const carried=ui.phase==='fill'&&night.id===1&&c.moves['bench-fill']&&!c.tested.length?`앞 실험에서 찾은 물 ${c.moves['bench-fill']}만큼을 담아 왔어. 내일 쓸 물은 70만큼이야. 양을 확인하고 밤 동안 어떻게 되는지 보자.`:'';
 const line=ui.phase==='freezing'?'해가 졌어. 추운 밤 동안 물이 얼고 있어. 얼음이 커지는 모습을 지켜봐!':result?c.message:ui.trial?(hint||'물의 양을 바꿔서 다시 해 봐.'):carried||briefs[night.id-1];
 const next=result?(result.ok?(night.id===3?'왜 물을 가득 채우지 않았을까?':'다음 날 물 준비하기'):'다시 채워 보기'):'';
 return `<div class="cold-yard" data-sky="${ui.phase==='freezing'?'night':result?'morning':'dusk'}">
  <div class="cold-snow" aria-hidden="true"></div>
  <div class="cold-intro">${top(c,night)}${say(line,next?`<button type="button" class="btn primary" data-night-next>${next}</button>`:'')}</div>
  <div class="cold-row" style="--count:${night.vessels.length}">${night.vessels.map((kind,i)=>vesselCard(kind,i,fills[i],ui)).join('')}</div>
  <div class="cold-side">
   ${meter(result?result.kept:total,night.need,night.vessels.length*100)}
   <div class="cold-night-watch"><div class="night-sky-symbol" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${ui.phase==='freezing'?'<path d="M28 7A14 14 0 1 0 33 29 15 15 0 0 1 28 7Z" fill="currentColor"/>':'<circle cx="20" cy="20" r="8" fill="currentColor"/><path d="M20 2v5m0 26v5M2 20h5m26 0h5M7 7l4 4m18 18 4 4M7 33l4-4m18-18 4-4"/>'}</svg></div><b>${ui.phase==='fill'?'해가 지기 전':ui.phase==='freezing'?'추운 밤 · 물이 얼어요':'다음 날 아침'}</b><p>${ui.phase==='fill'?'물의 양과 물을 채우지 않은 공간을 확인해.':ui.phase==='freezing'?'물을 더 넣지 않아도 얼음이 커져.':'밤사이 통이 어떻게 달라졌을까?'}</p>${ui.phase==='fill'?'<button type="button" class="btn primary" data-night-start>물을 담았어 · 밤 지켜보기</button>':''}</div>
   ${ui.phase==='fill'&&ui.ghost?'<p class="cold-legend"><i aria-hidden="true"></i>지난번 얼음이 닿은 곳</p>':''}
  </div>
 </div>${footer}`;
}
export function coldNightView(c){return `<section id="field-coldnight" class="field-transform cold-night" aria-label="한파가 온다">${coldNightMarkup(c,{phase:'fill'})}</section>`;}

export function bindColdNight(host,get,set){
 const ui={phase:'fill',trial:null,ghost:null};
 const life=new AbortController(),{signal}=life;
 let pour=null,frame=0;
 const paint=selector=>{host.innerHTML=coldNightMarkup(get(),ui);if(selector)host.querySelector(selector)?.focus();};
 const commit=(action,payload)=>{set(fieldAction(4,get(),action,payload));save();};
 const night=()=>currentNight(get());
 function showLevels(fills,index){
  const current=night(),kind=current.vessels[index],y=surfaceY(kind,fills[index]);
  const water=host.querySelector(`[data-level="${index}"]`);water?.setAttribute('y',y);water?.setAttribute('height',Math.max(0,260-y));host.querySelector(`[data-surface="${index}"]`)?.setAttribute('cy',y);host.querySelector(`[data-surface="${index}"]`)?.setAttribute('opacity',fills[index]?1:0);
  host.querySelector(`[data-stream="${index}"]`)?.setAttribute('d',`M116 69Q112 100 116 ${y}`);host.querySelector(`[data-splash="${index}"]`)?.setAttribute('transform',`translate(116 ${y})`);
  const amount=host.querySelector(`[data-amount="${index}"]`);if(amount)amount.textContent=fills[index];
  const total=fills.reduce((a,b)=>a+b,0);
  host.querySelector('[data-total]').textContent=total;
  host.querySelector('[data-gauge]').style.width=total/(current.vessels.length*100)*100+'%';
 }
 function stepPour(now){
  if(!pour)return;
  const fills=nightFills(get(),night());
  fills[pour.index]=Math.max(0,Math.min(100,Math.round(pour.start+pour.dir*POUR_PER_SECOND*(now-pour.began)/1000)));
  pour.value=fills[pour.index];showLevels(fills,pour.index);
  frame=requestAnimationFrame(stepPour);
 }
 function endPour(e){
  if(pour?.id!==e.pointerId)return;
  cancelAnimationFrame(frame);
  const {index,dir,start,began,button}=pour,quick=performance.now()-began<TAP_MS;
  const value=quick?Math.max(0,Math.min(100,start+dir*TAP_STEP)):pour.value;
  pour=null;button.classList.remove('is-held');host.querySelector(`.cold-vessel[data-index="${index}"]`)?.classList.remove('is-pouring');
  commit('fill',{night:night().id,index,value});showLevels(nightFills(get(),night()),index);
 }
 function runNight(){
  const current=night(),fills=nightFills(get(),current);
  if(!fills.some(Boolean)){commit('freeze-night',{night:current.id});host.querySelector('.cold-bubble p').textContent=get().message;void playCue('hint');return;}
  ui.trial=nightTrial(current.id,fills);ui.phase='freezing';ui.ghost=null;host.setAttribute('aria-busy','true');
  const finish=()=>{commit('freeze-night',{night:current.id});ui.phase='result';host.removeAttribute('aria-busy');paint('[data-night-next]');void playCue(ui.trial.ok?'success':'drop');};
  if(motionOff()){finish();return;}
  paint();
  const clock=createObservationClock(state.settings);
  const rise=now=>{
   const t=Math.min(1,clock(now)/FREEZE_MS);
   ui.trial.vessels.forEach((v,i)=>{const from=surfaceY(v.kind,v.fill),y=from+(iceTopY(v.kind,v.ice)-from)*t,el=host.querySelector(`[data-level="${i}"]`);el?.setAttribute('y',y);el?.setAttribute('height',Math.max(0,260-y));host.querySelector(`[data-surface="${i}"]`)?.setAttribute('cy',y);});
   if(t<1)frame=requestAnimationFrame(rise);else finish();
  };
  ui.trial.vessels.forEach((v,i)=>{const el=host.querySelector(`[data-level="${i}"]`);el?.setAttribute('y',surfaceY(v.kind,v.fill));});
  frame=requestAnimationFrame(rise);
 }
 function nextStep(){
  if(ui.trial.ok){ui.trial=null;ui.ghost=null;}
  else ui.ghost=ui.trial.vessels.map(v=>v.ice);
  ui.phase='fill';paint(night()?'[data-pour]':'[data-reason]');
 }
 host.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  const tap=e.target.closest('[data-pour]');
  if(tap&&!pour&&ui.phase==='fill'){
   const index=+tap.dataset.pour,dir=+tap.dataset.dir,start=nightFills(get(),night())[index];
   pour={id:e.pointerId,index,dir,start,value:start,began:performance.now(),button:tap};
   tap.classList.add('is-held');
   if(dir>0){host.querySelector(`.cold-vessel[data-index="${index}"]`)?.classList.add('is-pouring');void playCue('pour');}
   host.setPointerCapture?.(e.pointerId);e.preventDefault();frame=requestAnimationFrame(stepPour);
  }
 },{signal});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,endPour,{signal});
 host.addEventListener('contextmenu',e=>{if(e.target.closest('[data-pour]'))e.preventDefault();},{signal});
 host.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  // Keyboard and switch presses arrive as a click with no pointer behind them.
  if(button.dataset.pour!==undefined&&e.detail===0&&ui.phase==='fill'){const index=+button.dataset.pour,value=nightFills(get(),night())[index]+ +button.dataset.dir*TAP_STEP;commit('fill',{night:night().id,index,value});showLevels(nightFills(get(),night()),index);}
  if(button.hasAttribute('data-night-start')&&ui.phase==='fill'&&!pour)runNight();
  if(button.hasAttribute('data-night-next'))nextStep();
  if(button.dataset.reason){commit('reason',{choice:button.dataset.reason});void playCue(fieldReady(4,get())?'success':'hint');paint(fieldReady(4,get())?'[data-action="field-finish"]':`[data-reason="${button.dataset.reason}"]`);}
 },{signal});
 document.addEventListener('observation-stop',()=>{if(ui.phase==='freezing'){cancelAnimationFrame(frame);ui.phase='fill';ui.trial=null;host.removeAttribute('aria-busy');paint();}},{signal});
 paint();
 return ()=>{life.abort();cancelAnimationFrame(frame);};
}
