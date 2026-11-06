import {btn,icon,esc} from './ui.js';
import {nights,reasons,vessels,currentNight,nightFills,nightTrial,levelHeight,retryHint} from './cold-night-model.js';
import {fieldAction,fieldReady} from './fieldwork-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

const POUR_PER_SECOND=28,TAP_STEP=5,TAP_MS=180,FREEZE_MS=1900;
const BOTTOM=180,HEIGHT=150,RIM=BOTTOM-HEIGHT;
const briefs=['첫째 밤이야. 마을에 물이 70만큼 필요해. 수도꼭지를 꾹 눌러 통을 채운 뒤 레버를 당겨 봐.','오늘은 뚜껑 닫은 유리병도 써야 해. 두 통을 합쳐 물이 150만큼 필요해.','마지막 밤이야! 목이 좁은 병까지 세 통을 합쳐 물이 240만큼 필요해.'];
const outcomeLabels={ok:'멀쩡해',overflow:'넘쳤어',crack:'갈라졌어'};
const outlines={
 tub:'M20 30V170q0 10 10 10h80q10 0 10-10V30',
 jar:'M20 44q0-14 14-14h72q14 0 14 14V166q0 14-14 14H34q-14 0-14-14Z',
 bottle:'M52 30V62q0 13-16 20-16 7-16 22V166q0 14 14 14h72q14 0 14-14V104q0-15-16-22-16-7-16-20V30Z'
};
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const surfaceY=(kind,volume)=>BOTTOM-HEIGHT*levelHeight(kind,volume);
/** Ice in an open tub can rise past the rim; everywhere else the vessel stops it. */
const iceTopY=(kind,ice)=>kind==='tub'&&ice>100?RIM-(ice-100)*2:surfaceY(kind,ice);

function vesselArt(kind,index,volume,{frozen=false,ghost=null,outcome=''}={}){
 const id=`cold-clip-${index}`,top=frozen?iceTopY(kind,volume):surfaceY(kind,volume),closed=vessels[kind].closed;
 const clip=kind==='tub'?`<rect x="20" y="0" width="100" height="${BOTTOM}"/>`:`<path d="${outlines[kind]}"/>`;
 return `<svg class="cold-art" viewBox="0 0 140 190" aria-hidden="true"><defs><clipPath id="${id}">${clip}</clipPath></defs>
  <path class="cold-inside" d="${outlines[kind]}${kind==='tub'?'Z':''}"/>
  <g clip-path="url(#${id})"><rect class="cold-water ${frozen?'is-ice':''}" data-level="${index}" x="0" y="${top}" width="140" height="${200-top}"/></g>
  <rect class="cold-stream" data-stream="${index}" x="66" y="0" width="8" height="${Math.max(0,top)}"/>
  ${ghost===null?'':`<line class="cold-ghost" x1="10" x2="130" y1="${iceTopY(kind,ghost)}" y2="${iceTopY(kind,ghost)}"/>`}
  <path class="cold-wall cold-wall-${kind}" d="${outlines[kind]}"/>
  ${kind==='tub'?'<path class="cold-hoop" d="M18 62h104M18 148h104"/>':''}
  ${closed?`<rect class="cold-lid" x="${kind==='jar'?24:46}" y="16" width="${kind==='jar'?92:48}" height="14" rx="4"/>`:''}
  ${outcome==='crack'?'<path class="cold-crack" d="M70 30 58 70l22 22-18 34 16 26-8 28M58 70 34 84M80 92l26 8M62 126l-24 14"/><g class="cold-burst"><text x="70" y="112">쩍!</text></g>':''}
  ${outcome==='overflow'?`<path class="cold-dome" d="M20 ${top+5}q50 -26 100 0"/><path class="cold-chunk" d="M2 180l8-16 13 4 3 12Z"/><path class="cold-chunk" d="M117 180l5-20 14 6 2 14Z"/><g class="cold-burst"><text x="70" y="112">넘쳤다!</text></g>`:''}
 </svg>`;
}
function vesselCard(kind,index,fill,ui){
 const trial=ui.phase!=='fill'?ui.trial?.vessels[index]:null,outcome=ui.phase==='result'?trial?.outcome:'';
 const volume=trial?trial.ice:fill,name=vessels[kind].name;
 return `<div class="cold-vessel" data-index="${index}" ${outcome?`data-outcome="${outcome}"`:''}>
  <div class="cold-taps">${ui.phase==='fill'?`<button type="button" class="cold-tap" data-pour="${index}" data-dir="1" aria-label="${esc(name)}에 물 담기">${icon('drop',20)}<span>꾹 눌러 담기</span></button><button type="button" class="cold-drain" data-pour="${index}" data-dir="-1" aria-label="${esc(name)}에서 물 빼기">빼기</button>`:''}</div>
  ${vesselArt(kind,index,volume,{frozen:!!trial,ghost:ui.phase==='fill'?ui.ghost?.[index]??null:null,outcome})}
  <p class="cold-name"><strong>${esc(name)}</strong><span>${outcome?(outcome==='ok'?icon('check',16):'')+outcomeLabels[outcome]:`담은 물 <b data-amount="${index}">${fill}</b>`}</span></p>
 </div>`;
}
function meter(total,need,capacity){
 return `<div class="cold-meter"><p>마을이 쓸 물 <b data-total>${total}</b> / ${need}</p><div class="cold-gauge" aria-hidden="true"><i data-gauge style="width:${total/capacity*100}%"></i><u style="left:${need/capacity*100}%"></u></div></div>`;
}
function say(text,extra=''){
 return `<div class="cold-bubble"><img src="/assets/v2/resident-4.webp" width="96" height="96" alt="뚝딱"><div role="status"><p>${esc(text)}</p>${extra}</div></div>`;
}
function top(c,current){
 return `<div class="transform-top cold-top"><ol class="transform-progress" aria-label="한파 진행 상황">${nights.map(n=>`<li ${n===current?'aria-current="step"':''} class="${c.marks.includes('night-'+n.id)?'is-done':''}"><span aria-hidden="true">${c.marks.includes('night-'+n.id)?icon('check',16):n.id}</span>${n.name}</li>`).join('')}</ol><button type="button" class="field-help-btn" data-action="field-help">뚝딱의 부탁 다시 보기</button></div>`;
}
const footer=`<div class="transform-footer">${btn('앞 실험 다시 보기','field-back','quiet')}<details><summary>모형 안내</summary><p>물의 양과 얼음이 커지는 정도는 비교하려고 만든 값이야. 실제 통이나 수도관의 안전 기준이 아니야.</p></details></div>`;

function reasonView(c){
 return `${top(c,null)}<div class="cold-explain"><img src="/assets/v2/resident-4.webp" width="120" height="120" alt="뚝딱"><div><h2>사흘을 버텼어! 왜 통 위쪽을 비워 뒀을까?</h2><p>마을 친구들에게 네 말로 알려 줘.</p>
  <div class="cold-reasons" role="group" aria-label="통 위쪽을 비운 까닭">${reasons.map(r=>`<button type="button" class="btn secondary" data-reason="${r.id}" aria-pressed="${c.selected===r.id}">${esc(r.label)}</button>`).join('')}</div>
  ${c.selected?`<p class="cold-reason-hint" role="status">${esc(c.message)}</p>`:''}</div></div>${footer}`;
}
function doneView(c){
 const tried=c.tested.filter(t=>t.value<=3).length;
 return `${top(c,null)}<div class="transform-complete"><img src="/assets/v2/resident-4.webp" width="144" height="144" alt=""><div><h2>얼음 다리 마을이 한파를 이겨 냈어!</h2><p>물이 얼면 커지니까, 얼음이 들어갈 자리를 남기고 담았어.${tried?` 밤을 ${tried}번 시험했어.`:''}</p>${btn('개념 영상 보고 도장 받기','field-finish','primary')}</div></div>${footer}`;
}
export function coldNightMarkup(c,ui){
 if(fieldReady(4,c))return doneView(c);
 // A night counts as cleared the moment it is frozen, but its morning still belongs on screen.
 const night=ui.phase==='fill'?currentNight(c):nights[ui.trial.night-1];
 if(!night)return reasonView(c);
 const fills=nightFills(c,night),total=fills.reduce((a,b)=>a+b,0),result=ui.phase==='result'?ui.trial:null;
 const failures=c.tested.filter(t=>t.value===night.id&&!t.ok).length,hint=ui.trial?retryHint(ui.trial,failures):'';
 const line=ui.phase==='freezing'?'밤이 깊어지고 있어. 통을 지켜봐!':result?c.message:ui.trial?(hint||'물의 양을 바꿔서 다시 해 봐.'):briefs[night.id-1];
 const next=result?(result.ok?(night.id===3?'아침 맞기':'다음 밤 준비하기'):'다시 채워 보기'):'';
 return `${top(c,night)}
 <div class="cold-yard" data-sky="${ui.phase==='freezing'?'night':result?'morning':'dusk'}">
  <div class="cold-snow" aria-hidden="true"></div>
  ${say(line,next?`<button type="button" class="btn primary" data-night-next>${next}</button>`:'')}
  <div class="cold-row" style="--count:${night.vessels.length}">${night.vessels.map((kind,i)=>vesselCard(kind,i,fills[i],ui)).join('')}</div>
  <div class="cold-side">
   ${meter(result?result.kept:total,night.need,night.vessels.length*100)}
   ${ui.phase==='fill'?`<div class="cold-lever-box"><button type="button" class="cold-lever" data-lever aria-label="레버를 당겨 밤 보내기"><span class="cold-lever-grip" aria-hidden="true"></span></button><p>레버를 당겨<br>밤 보내기</p></div>`:''}
   ${ui.phase==='fill'&&ui.ghost?'<p class="cold-legend"><i aria-hidden="true"></i>지난번 얼음이 닿은 곳</p>':''}
  </div>
 </div>${footer}`;
}
export function coldNightView(c){return `<section id="field-coldnight" class="field-transform cold-night" aria-label="한파가 온다">${coldNightMarkup(c,{phase:'fill'})}</section>`;}

export function bindColdNight(host,get,set){
 const ui={phase:'fill',trial:null,ghost:null};
 const life=new AbortController(),{signal}=life;
 let pour=null,pull=null,frame=0;
 const paint=selector=>{host.innerHTML=coldNightMarkup(get(),ui);if(selector)host.querySelector(selector)?.focus();};
 const commit=(action,payload)=>{set(fieldAction(4,get(),action,payload));save();};
 const night=()=>currentNight(get());
 function showLevels(fills,index){
  const current=night(),kind=current.vessels[index],y=surfaceY(kind,fills[index]);
  const water=host.querySelector(`[data-level="${index}"]`);water?.setAttribute('y',y);water?.setAttribute('height',200-y);
  host.querySelector(`[data-stream="${index}"]`)?.setAttribute('height',y);
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
  commit('freeze-night',{night:current.id});
  if(!fills.some(Boolean)){host.querySelector('.cold-bubble p').textContent=get().message;void playCue('hint');return;}
  ui.trial=nightTrial(current.id,fills);ui.phase='freezing';ui.ghost=null;
  const finish=()=>{ui.phase='result';paint('[data-night-next]');void playCue(ui.trial.ok?'success':'drop');};
  if(motionOff()){finish();return;}
  paint();
  const began=performance.now();
  const rise=now=>{
   const t=Math.min(1,(now-began)/FREEZE_MS);
   ui.trial.vessels.forEach((v,i)=>{const from=surfaceY(v.kind,v.fill),y=from+(iceTopY(v.kind,v.ice)-from)*t,el=host.querySelector(`[data-level="${i}"]`);el?.setAttribute('y',y);el?.setAttribute('height',200-y);});
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
  const tap=e.target.closest('[data-pour]'),lever=e.target.closest('[data-lever]');
  if(tap&&!pour&&ui.phase==='fill'){
   const index=+tap.dataset.pour,dir=+tap.dataset.dir,start=nightFills(get(),night())[index];
   pour={id:e.pointerId,index,dir,start,value:start,began:performance.now(),button:tap};
   tap.classList.add('is-held');
   if(dir>0){host.querySelector(`.cold-vessel[data-index="${index}"]`)?.classList.add('is-pouring');void playCue('pour');}
   frame=requestAnimationFrame(stepPour);
  }
  if(lever&&ui.phase==='fill')pull={id:e.pointerId,y:e.clientY,moved:0,lever,reach:lever.clientHeight-lever.firstElementChild.offsetHeight-8};
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(pull?.id!==e.pointerId)return;
  pull.moved=Math.max(0,e.clientY-pull.y);
  pull.lever.style.setProperty('--pull',Math.min(pull.moved,pull.reach)+'px');
 },{signal});
 function endPull(e){
  if(pull?.id!==e.pointerId)return;
  const {moved,lever,reach}=pull;pull=null;lever.style.removeProperty('--pull');
  if(e.type==='pointerup'&&(moved<8||moved>=reach*.7))runNight();
 }
 for(const type of ['pointerup','pointercancel']){host.addEventListener(type,endPour,{signal});host.addEventListener(type,endPull,{signal});}
 host.addEventListener('contextmenu',e=>{if(e.target.closest('[data-pour],[data-lever]'))e.preventDefault();},{signal});
 host.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  // Keyboard and switch presses arrive as a click with no pointer behind them.
  if(button.dataset.pour!==undefined&&e.detail===0&&ui.phase==='fill'){const index=+button.dataset.pour,value=nightFills(get(),night())[index]+ +button.dataset.dir*TAP_STEP;commit('fill',{night:night().id,index,value});showLevels(nightFills(get(),night()),index);}
  if(button.hasAttribute('data-lever')&&e.detail===0&&ui.phase==='fill')runNight();
  if(button.hasAttribute('data-night-next'))nextStep();
  if(button.dataset.reason){commit('reason',{choice:button.dataset.reason});void playCue(fieldReady(4,get())?'success':'hint');paint(fieldReady(4,get())?'[data-action="field-finish"]':`[data-reason="${button.dataset.reason}"]`);}
 },{signal});
 paint();
 return ()=>{life.abort();cancelAnimationFrame(frame);};
}
