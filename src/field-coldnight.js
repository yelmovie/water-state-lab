import {createObservationClock} from './observation-speed.js';
import {btn,icon,esc} from './ui.js';
import {nights,reasons,vessels,currentNight,nightFills,nightTrial,vesselTrial,levelHeight,retryHint} from './cold-night-model.js';
import {materialPattern} from './study-materials.js';
import {fieldAction,fieldReady} from './fieldwork-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

const POUR_PER_SECOND=28,TAP_STEP=5,TAP_MS=180,FREEZE_MS=700;
const BOTTOM=250,HEIGHT=150,RIM=BOTTOM-HEIGHT;
const briefs=['첫째 날이야. 내일 마을에서 물이 70만큼 필요해. 수도꼭지를 꾹 눌러 채우고, 추운 밤을 지켜보자.','둘째 날은 뚜껑 있는 모형 통도 써. 두 통에 물을 150만큼 모으되, 위쪽에 물을 채우지 않은 공간도 남겨 줘.','마지막 날이야! 세 통에 물을 240만큼 준비해. 통마다 위쪽에 물을 채우지 않은 공간이 있는지 확인해 줘.'];
const outcomeLabels={ok:'멀쩡해',overflow:'넘쳤어',crack:'얼음이 커질 공간 부족',raised:'얼음이 위로 올라왔어'};
const outlines={
 tub:'M20 30V170q0 10 10 10h80q10 0 10-10V30',
 jar:'M20 44q0-14 14-14h72q14 0 14 14V166q0 14-14 14H34q-14 0-14-14Z',
 bottle:'M52 30V62q0 13-16 20-16 7-16 22V166q0 14 14 14h72q14 0 14-14V104q0-15-16-22-16-7-16-20V30Z'
};
// Inside of jar-body.webp (glass walls inset), traced from the picture's alpha so water never shows outside the neck.
const BOTTLE_INSIDE='M78.6 100.4L78.2 102.4L78.2 104.3L79.5 106.3L82.8 108.3L84.0 110.2L84.3 112.2L84.3 114.2L84.3 116.2L84.3 118.1L84.3 120.1L84.3 122.1L84.3 124.0L83.7 126.0L82.5 128.0L80.1 129.9L76.4 131.9L72.2 133.9L68.2 135.8L65.2 137.8L62.7 139.8L60.6 141.8L58.8 143.7L57.0 145.7L55.4 147.7L54.5 149.6L53.3 151.6L52.4 153.6L51.8 155.5L51.2 157.5L50.9 159.5L50.6 161.4L50.3 163.4L50.3 165.4L50.3 167.4L50.3 169.3L50.3 171.3L50.6 173.3L50.6 175.2L50.6 177.2L50.6 179.2L50.6 181.1L50.6 183.1L50.6 185.1L50.9 187.0L50.9 189.0L50.9 191.0L50.9 193.0L50.9 194.9L50.9 196.9L50.9 198.9L50.9 200.8L50.9 202.8L50.9 204.8L50.9 206.7L50.9 208.7L50.9 210.7L50.9 212.6L50.9 214.6L50.9 216.6L51.2 218.6L51.2 220.5L51.2 222.5L51.2 224.5L51.2 226.4L51.2 228.4L51.2 230.4L51.2 232.3L50.9 234.3L51.2 236.3L51.2 238.2L51.2 240.2L51.8 242.2L52.4 244.2L53.9 246.1L56.3 248.1L60.9 250.1L137.9 250.1L142.7 248.1L145.5 246.1L146.7 244.2L147.6 242.2L147.9 240.2L147.9 238.2L147.9 236.3L147.9 234.3L147.9 232.3L147.9 230.4L147.9 228.4L147.9 226.4L148.2 224.5L147.9 222.5L148.2 220.5L148.2 218.6L148.2 216.6L148.2 214.6L148.2 212.6L148.2 210.7L148.2 208.7L148.2 206.7L148.5 204.8L148.5 202.8L148.5 200.8L148.5 198.9L148.5 196.9L148.5 194.9L148.5 193.0L148.5 191.0L148.8 189.0L148.8 187.0L148.8 185.1L148.8 183.1L148.8 181.1L149.1 179.2L149.1 177.2L149.1 175.2L149.1 173.3L149.1 171.3L149.1 169.3L149.4 167.4L149.4 165.4L149.4 163.4L149.1 161.4L148.8 159.5L148.5 157.5L147.9 155.5L147.3 153.6L146.4 151.6L145.5 149.6L144.3 147.7L142.7 145.7L141.2 143.7L139.4 141.8L137.3 139.8L134.8 137.8L131.8 135.8L128.1 133.9L123.6 131.9L119.9 129.9L117.5 128.0L116.3 126.0L115.7 124.0L115.7 122.1L115.7 120.1L115.7 118.1L115.7 116.2L115.7 114.2L115.7 112.2L116.0 110.2L117.2 108.3L120.5 106.3L121.8 104.3L121.8 102.4L121.1 100.4Z';
const JAR_INSIDE='M58.0 102.3L58.2 104.8L60.1 107.3L61.0 109.9L61.0 112.4L61.0 115.0L59.9 117.5L56.4 120.0L51.7 122.6L48.8 125.1L46.6 127.7L45.2 130.2L44.4 132.7L43.9 135.3L43.6 137.8L43.3 140.3L43.3 142.9L43.3 145.4L43.3 148.0L43.3 150.5L43.3 153.0L43.3 155.6L43.3 158.1L43.3 160.7L43.3 163.2L43.3 165.7L43.3 168.3L43.3 170.8L43.3 173.4L43.3 175.9L43.3 178.4L43.3 181.0L43.3 183.5L43.3 186.1L43.3 188.6L43.3 191.1L43.3 193.7L43.3 196.2L43.3 198.8L43.3 201.3L43.3 203.8L43.3 206.4L43.3 208.9L43.3 211.5L43.3 214.0L43.3 216.5L43.3 219.1L43.3 221.6L43.3 224.2L43.3 226.7L43.3 229.2L43.6 231.8L43.9 234.3L44.4 236.9L45.5 239.4L46.9 241.9L48.8 244.5L52.0 247.0L147.7 247.0L150.7 244.5L152.9 241.9L154.2 239.4L155.3 236.9L155.8 234.3L156.1 231.8L156.4 229.2L156.4 226.7L156.4 224.2L156.4 221.6L156.4 219.1L156.4 216.5L156.4 214.0L156.4 211.5L156.4 208.9L156.4 206.4L156.4 203.8L156.4 201.3L156.4 198.8L156.4 196.2L156.4 193.7L156.4 191.1L156.4 188.6L156.4 186.1L156.4 183.5L156.4 181.0L156.4 178.4L156.4 175.9L156.4 173.4L156.4 170.8L156.4 168.3L156.4 165.7L156.4 163.2L156.4 160.7L156.4 158.1L156.4 155.6L156.4 153.0L156.4 150.5L156.4 148.0L156.4 145.4L156.4 142.9L156.4 140.3L156.4 137.8L156.1 135.3L155.3 132.7L154.5 130.2L153.1 127.7L151.0 125.1L148.0 122.6L143.4 120.0L139.6 117.5L138.8 115.0L138.8 112.4L138.8 109.9L139.3 107.3L141.5 104.8L141.5 102.3Z';
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const surfaceY=(kind,volume)=>kind==='tub'?224-105*levelHeight(kind,volume):BOTTOM-HEIGHT*levelHeight(kind,volume);
/** Ice in an open tub can rise past the rim; everywhere else the vessel stops it. */
const iceTopY=(kind,ice)=>kind==='tub'&&ice>100?RIM-(ice-100)*2:surfaceY(kind,ice);

function vesselArt(kind,index,volume,{frozen=false,ghost=null,outcome='',target=null}={}){
 const id=`cold-clip-${index}`,top=frozen?iceTopY(kind,volume):surfaceY(kind,volume),closed=vessels[kind].closed;
 const path=kind==='bottle'?BOTTLE_INSIDE:kind==='jar'?JAR_INSIDE:'M26 100H174L168 232Q168 250 151 250H49Q32 250 32 232Z';
 // A full closed vessel that froze shows the generated cracked picture (ice inside, cracked glass, shards).
 const cracked=outcome==='crack'&&kind!=='tub',crackH=kind==='jar'?163:164;
 const body=kind==='tub'?'tub':kind+'-body',x=kind==='tub'?17:kind==='jar'?39:46,w=kind==='tub'?166:kind==='jar'?122:108;
 return `<svg class="cold-art" viewBox="0 0 200 280" aria-hidden="true"><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs>
 <defs>${materialPattern(id+'-material',frozen?'ice':'water',{x:22,y:60,width:156,height:210,base:frozen?'#c9e7f3':'#a2d8e5'})}<linearGradient id="${id}-surface"><stop stop-color="#8cd5e4"/><stop offset=".4" stop-color="#eafcff"/><stop offset=".8" stop-color="#c1edf4"/><stop offset="1" stop-color="#73bacd"/></linearGradient><linearGradient id="${id}-stream"><stop stop-color="#478fab"/><stop offset=".45" stop-color="#e9fcff"/><stop offset=".7" stop-color="#b5e9f3"/><stop offset="1" stop-color="#4ba8c0"/></linearGradient></defs>
 <ellipse cx="100" cy="259" rx="78" ry="7" fill="#31505d" opacity=".18"/>
 ${cracked?`<image class="cold-cracked" href="/assets/learning/coldnight-20261109/${kind}-cracked.webp" x="${x}" y="${254-crackH}" width="${w}" height="${crackH}" preserveAspectRatio="none"/>`:`
 <image href="/assets/learning/experiment-props-20261107/${body}.webp" x="${x}" y="94" width="${w}" height="160" preserveAspectRatio="none"/>
 <g clip-path="url(#${id})"><rect class="cold-water ${frozen?'is-ice':''}" data-level="${index}" x="22" y="${top}" width="156" height="${Math.max(0,260-top)}" opacity="${volume?1:0}" fill="url(#${id}-material)"/>
 <ellipse data-surface="${index}" cx="100" cy="${top}" rx="${surfaceWidth(kind,volume,top)}" ry="${frozen?3:5}" opacity="${volume?1:0}" fill="url(#${id}-surface)" stroke="#ecfeff" stroke-width="1.1"/></g>
 <image href="/assets/learning/experiment-props-20261107/${body}.webp" x="${x}" y="94" width="${w}" height="160" preserveAspectRatio="none" opacity="${kind==='tub'?1:.48}"/>`}
 ${closed?`<image class="cold-lid ${cracked?'is-popped':frozen?'':'is-open'}" href="/assets/learning/experiment-props-20261107/${kind}-lid.webp" x="${kind==='jar'?53:83}" y="${kind==='jar'?83:85}" width="${kind==='jar'?94:35}" height="18" preserveAspectRatio="none"/>`:''}
 ${ghost===null?'':`<line class="cold-ghost" x1="22" x2="178" y1="${iceTopY(kind,ghost)}" y2="${iceTopY(kind,ghost)}"/>`}
 ${target===null?'':`<line class="cold-fill-line" x1="21" x2="179" y1="${surfaceY(kind,target)}" y2="${surfaceY(kind,target)}"/>`}
 ${!frozen?`<image class="cold-faucet" href="/assets/learning/experiment-props-20261107/faucet.webp" x="-12" y="-5" width="146" height="104"/><path class="cold-stream" data-stream="${index}" d="M116 69 Q112 100 116 ${top}" fill="none" stroke="url(#${id}-stream)" stroke-width="5" stroke-linecap="round"/><g class="cold-splash" data-splash="${index}" transform="translate(116 ${top})"><path d="M-15 -4q8-8 15 0 8-8 15 0" fill="none" stroke="#dcfbff" stroke-width="2"/><ellipse rx="18" ry="4" fill="none" stroke="#b8f3fc" stroke-width="1.5"/></g>`:''}
 ${outcome==='crack'?'<g class="cold-burst"><text x="100" y="60">쩍!</text></g>':''}
 ${['overflow','raised'].includes(outcome)?`<path class="cold-dome" d="M30 103q70 -28 140 0" style="fill:url(#${id}-material)"/><g class="cold-burst"><text x="100" y="170">위로 올라왔어</text></g>`:''}
 </svg>`;
}
const surfaceWidth=(kind,volume,y)=>kind==='bottle'&&volume>88?15:kind==='jar'&&y<121?36:55;
const fillRisk=(kind,fill)=>vesselTrial(kind,fill).outcome==='crack';
function vesselCard(kind,index,fill,ui,target=null){
 const trial=ui.phase!=='fill'?ui.trial?.vessels[index]:null,outcome=ui.phase==='result'?trial?.outcome:'';
 const volume=trial?trial.ice:fill,name=vessels[kind].name;
 return `<div class="cold-vessel" data-index="${index}" ${target!==null&&fillRisk(kind,fill)?'data-fill-risk':''} ${outcome?`data-outcome="${outcome}"`:''}>
  <div class="cold-taps">${ui.phase==='fill'?`<button type="button" class="cold-tap" data-pour="${index}" data-dir="1" aria-label="${esc(name)}에 물 담기">${icon('drop',20)}<span>수도꼭지 열기</span></button><button type="button" class="cold-drain" data-pour="${index}" data-dir="-1" aria-label="${esc(name)}에서 물 빼기">빼기</button>`:''}</div>
  ${vesselArt(kind,index,volume,{frozen:!!trial,ghost:ui.phase==='fill'?ui.ghost?.[index]??null:null,outcome,target})}
  <p class="cold-name"><strong>${esc(name)}</strong><span>${outcome?(outcome==='ok'?icon('check',16):'')+outcomeLabels[outcome]:`담은 물 <b data-amount="${index}">${fill}</b>${target===null?'':` <span class="cold-target">· 권장 ${target}</span>`}`}</span>${target!==null?'<b class="cold-risk">위에 빈자리가 더 필요해</b>':''}</p>
 </div>`;
}
const amountMessage=(total,need)=>total<need?`목표까지 ${need-total} 남았어`:'목표량을 채웠어';
function meter(total,need,capacity,filling){
 return `<section class="cold-goal" aria-label="오늘의 물 채우기 목표"><div class="cold-goal-copy"><strong>내일 쓸 물 <b>${need} 이상</b></strong>${filling?'<span>점선까지 나눠 담아 봐. 닫는 통 위에는 빈자리를 남겨.</span>':''}</div><div class="cold-meter" data-enough="${total>=need}"><p>${filling?'지금 담은 물':'녹여 쓸 물'} <b data-total>${total}</b> <span data-amount-message>${amountMessage(total,need)}</span></p><div class="cold-gauge" aria-hidden="true"><i data-gauge style="width:${total/capacity*100}%"></i><u style="left:${need/capacity*100}%"></u></div></div></section>`;
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
 const fills=nightFills(c,night),total=fills.reduce((a,b)=>a+b,0),result=ui.phase==='result'?ui.trial:null,filling=ui.phase==='fill';
 const target=filling?Math.ceil(night.need/night.vessels.length):null;
 const failures=c.tested.filter(t=>t.value===night.id&&!t.ok).length,hint=ui.trial?retryHint(ui.trial,failures):'';
 const carried=ui.phase==='fill'&&night.id===1&&c.moves['bench-fill']&&!c.tested.length?`앞 실험에서 찾은 물 ${c.moves['bench-fill']}만큼을 담아 왔어. 내일 쓸 물은 70만큼이야. 양을 확인하고 밤 동안 어떻게 되는지 보자.`:'';
 const line=ui.phase==='freezing'?'해가 졌어. 추운 밤 동안 물이 얼고 있어. 얼음이 커지는 모습을 지켜봐!':result?c.message:ui.trial?(hint||'물의 양을 바꿔서 다시 해 봐.'):carried||briefs[night.id-1];
 const next=result?(result.ok?(night.id===3?'왜 물을 가득 채우지 않았을까?':'다음 날 물 준비하기'):'다시 채워 보기'):'';
 return `<div class="cold-yard" data-sky="${ui.phase==='freezing'?'night':result?'morning':'dusk'}">
  <div class="cold-snow" aria-hidden="true"></div>
  <div class="cold-intro">${top(c,night)}${say(line,next?`<button type="button" class="btn primary" data-night-next>${next}</button>`:'')}</div>
  ${meter(result?result.kept:total,night.need,night.vessels.length*100,filling)}
  <div class="cold-row" style="--count:${night.vessels.length}">${night.vessels.map((kind,i)=>vesselCard(kind,i,fills[i],ui,target)).join('')}</div>
  <div class="cold-side">
   <div class="cold-night-watch"><div class="night-sky-symbol" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${ui.phase==='freezing'?'<path d="M28 7A14 14 0 1 0 33 29 15 15 0 0 1 28 7Z" fill="currentColor"/>':'<circle cx="20" cy="20" r="8" fill="currentColor"/><path d="M20 2v5m0 26v5M2 20h5m26 0h5M7 7l4 4m18 18 4 4M7 33l4-4m18-18 4-4"/>'}</svg></div><b>${ui.phase==='fill'?'해가 지기 전':ui.phase==='freezing'?'추운 밤 · 물이 얼어요':'다음 날 아침'}</b><p>${ui.phase==='fill'?'물의 양과 물을 채우지 않은 공간을 확인해.':ui.phase==='freezing'?'물을 더 넣지 않아도 얼음이 커져.':'밤사이 통이 어떻게 달라졌을까?'}</p>${ui.phase==='fill'?'<button type="button" class="btn primary" data-night-start>물을 담았어 · 밤 지켜보기</button>':''}</div>
   ${ui.phase==='fill'&&ui.ghost?'<p class="cold-legend"><i aria-hidden="true"></i>지난번 얼음이 닿은 곳</p>':''}
  </div>
 </div>${footer}`;
}
export function coldNightView(c){return `<section id="field-coldnight" class="field-transform cold-night" aria-label="한파가 온다">${coldNightMarkup(c,{phase:'fill'})}</section>`;}

export function bindColdNight(host,get,set){
 const ui={phase:'fill',trial:null,ghost:null};
 const life=new AbortController(),{signal}=life;
 let pour=null,frame=0,fillAnimation=0;
 let finishFill=null;
 const paint=selector=>{host.innerHTML=coldNightMarkup(get(),ui);host.dispatchEvent(new Event('cold-phase-change'));if(selector)host.querySelector(selector)?.focus({preventScroll:true});};
 const commit=(action,payload)=>{set(fieldAction(4,get(),action,payload));save();};
 const night=()=>currentNight(get());
 function showLevels(fills,index){
  const current=night(),kind=current.vessels[index],y=surfaceY(kind,fills[index]);
  const water=host.querySelector(`[data-level="${index}"]`),surface=host.querySelector(`[data-surface="${index}"]`);
  water?.setAttribute('y',y);water?.setAttribute('height',Math.max(0,260-y));water?.setAttribute('opacity',fills[index]?1:0);
  surface?.setAttribute('cy',y);surface?.setAttribute('rx',surfaceWidth(kind,fills[index],y));surface?.setAttribute('opacity',fills[index]?1:0);
  host.querySelector(`.cold-vessel[data-index="${index}"]`)?.toggleAttribute('data-fill-risk',fillRisk(kind,fills[index]));
  host.querySelector(`[data-stream="${index}"]`)?.setAttribute('d',`M116 69Q112 100 116 ${y}`);host.querySelector(`[data-splash="${index}"]`)?.setAttribute('transform',`translate(116 ${y})`);
  const amount=host.querySelector(`[data-amount="${index}"]`);if(amount)amount.textContent=fills[index];
  const total=fills.reduce((a,b)=>a+b,0);
  const totalLabel=host.querySelector('[data-total]'),message=host.querySelector('[data-amount-message]'),meter=host.querySelector('.cold-meter'),enough=String(total>=current.need),label=amountMessage(total,current.need);
  if(totalLabel.textContent!==String(total))totalLabel.textContent=total;
  if(meter.dataset.enough!==enough)meter.dataset.enough=enough;
  if(message.textContent!==label)message.textContent=label;
  host.querySelector('[data-gauge]').style.width=total/(current.vessels.length*100)*100+'%';
 }
 function stepPour(now){
  if(!pour)return;
  const fills=nightFills(get(),night());
  fills[pour.index]=Math.max(0,Math.min(100,Math.round(pour.start+pour.dir*POUR_PER_SECOND*(now-pour.began)/1000)));
  if(pour.value!==fills[pour.index]){pour.value=fills[pour.index];showLevels(fills,pour.index);}
  frame=requestAnimationFrame(stepPour);
 }
 function endPour(e){
  if(pour?.id!==e.pointerId)return;
  cancelAnimationFrame(frame);
  const {index,dir,start,began,button}=pour,quick=performance.now()-began<TAP_MS;
  const value=e.type==='pointerup'&&quick?Math.max(0,Math.min(100,start+dir*TAP_STEP)):pour.value;
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
 // Automatic fills update the existing vessels, preserving decoded images and pointer targets.
 host.addEventListener('cold-levels-change',()=>{
  finishFill?.();
  if(ui.phase!=='fill'||!night())return;
  const target=nightFills(get(),night());
  const start=target.map((_,i)=>Number(host.querySelector(`[data-amount="${i}"]`)?.textContent)||0);
  const changed=target.map((value,i)=>value!==start[i]?i:-1).filter(i=>i>=0);
  if(!changed.length)return;
  const began=performance.now(),duration=motionOff()?0:700;
  host.setAttribute('aria-busy','true');
  for(const i of changed)host.querySelector(`.cold-vessel[data-index="${i}"]`)?.classList.add('is-pouring');
  finishFill=()=>{
   cancelAnimationFrame(fillAnimation);
   for(const i of changed){showLevels(target,i);host.querySelector(`.cold-vessel[data-index="${i}"]`)?.classList.remove('is-pouring');}
   host.removeAttribute('aria-busy');finishFill=null;
  };
  const rise=now=>{
   const progress=duration?Math.min(1,(now-began)/duration):1;
   const levels=start.map((value,i)=>Math.round(value+(target[i]-value)*progress));
   for(const i of changed)showLevels(levels,i);
   if(progress===1)finishFill();else fillAnimation=requestAnimationFrame(rise);
  };
  fillAnimation=requestAnimationFrame(rise);
 },{signal});
 host.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  const tap=e.target.closest('[data-pour]');
  if(tap&&!pour&&ui.phase==='fill'){
   finishFill?.();
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
  if(button.dataset.pour!==undefined&&e.detail===0&&ui.phase==='fill'&&!pour){finishFill?.();const index=+button.dataset.pour,value=nightFills(get(),night())[index]+ +button.dataset.dir*TAP_STEP;commit('fill',{night:night().id,index,value});showLevels(nightFills(get(),night()),index);}
  if(button.hasAttribute('data-night-start')&&ui.phase==='fill'&&!pour){finishFill?.();runNight();}
  if(button.hasAttribute('data-night-next'))nextStep();
  if(button.dataset.reason){commit('reason',{choice:button.dataset.reason});void playCue(fieldReady(4,get())?'success':'error');paint(fieldReady(4,get())?'[data-action="field-finish"]':`[data-reason="${button.dataset.reason}"]`);}
 },{signal});
 document.addEventListener('observation-stop',()=>{finishFill?.();if(ui.phase==='freezing'){cancelAnimationFrame(frame);ui.phase='fill';ui.trial=null;host.removeAttribute('aria-busy');paint();}},{signal});
 paint();
 return ()=>{life.abort();cancelAnimationFrame(frame);cancelAnimationFrame(fillAnimation);};
}
