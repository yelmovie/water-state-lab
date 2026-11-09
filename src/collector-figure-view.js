import {icon,modal} from './ui.js';
import {state} from './state.js';
import {comparisonExamples,figureLayout,figureFrame,figureParts} from './collector-figure-model.js';

const HOME={yaw:70,pitch:23};
const svgIcon=path=>`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const playIcon=svgIcon('<path d="m8 5 12 7-12 7z" fill="currentColor"/>');
const pauseIcon=svgIcon('<path d="M9 5v14m6-14v14" stroke-width="3.4"/>');
const eyeIcon=svgIcon('<path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/>');
const turnIcon=svgIcon('<path d="M20 14a7 7 0 1 0-3 5M4 11V5m0 6h6"/>');
let artModule;
const loadArt=()=>artModule??=import('./collector-figure-art.js').catch(error=>{artModule=null;throw error;});
export function openCollectorFigure(result){
 const compare=!result,examples=(compare?comparisonExamples():[{name:'내가 시험한 물길',result}]).map(row=>({...row,layout:figureLayout(row.result)}));
 const d=modal(compare?'물이 왜 안 모였을까?':'내 물방울 길 보기',`
 <section class="collector-figure" aria-label="돌려 보는 물 모으는 장치">
  <div class="figure-grid">
   <div class="figure-model">
    <span class="figure-tag">밀어서 돌리기</span>
    <svg class="figure-art" viewBox="0 0 480 300" tabindex="0" role="img" aria-label="물 모으는 장치. 손가락으로 밀거나 화살표 키로 돌려 봐."><g data-figure-structure></g><g data-figure-trail-layer></g><g data-figure-water></g><g data-figure-marker></g></svg>
    <p class="figure-loading" role="status">모형을 열고 있어…</p>
   </div>
   <div class="figure-reading">
    ${compare?`<div class="figure-cases" role="group" aria-label="비교할 예시">${examples.map(({name},i)=>`<button type="button" class="btn" data-figure-case="${i}" aria-label="${i?'B':'A'} · ${name}" aria-pressed="${i===0}"><span aria-hidden="true">${i?'B':'A'}</span>${i?'중간에 샘':'안 맺힘'}</button>`).join('')}</div>`:''}
    <div class="figure-main-actions">
     <button class="btn primary" type="button" data-figure-play>${playIcon}<span>자동재생</span></button>
     <button class="btn secondary" type="button" data-figure-step>한 단계씩</button>
     <button class="btn secondary" type="button" data-figure-cut aria-pressed="false">${eyeIcon}<span>속 보기</span></button>
    </div>
    <div class="figure-feedback">
     <p class="figure-note" data-figure-note role="status"></p>
     <div class="figure-key" aria-label="물길 표시"><span>→ 흐른 길</span><span data-leak-key hidden>┈ 새는 길</span></div>
    </div>
    <details class="figure-tools">
     <summary>돌리기 · 부품 살펴보기</summary>
     <div class="figure-camera" role="group" aria-label="모형 돌리기와 확대">
      <button class="btn" type="button" data-figure-turn="-1" aria-label="왼쪽으로 돌리기">${turnIcon}</button>
      <button class="btn" type="button" data-figure-turn="1" aria-label="오른쪽으로 돌리기">${turnIcon}</button>
      <button class="btn" type="button" data-figure-zoom aria-pressed="false">${icon('zoom')}<span>부품 확대</span></button>
      <button class="btn" type="button" data-figure-reset>처음 각도</button>
     </div>
     <ol class="figure-parts">${figureParts.map(([label],i)=>`<li><button class="btn" type="button" data-figure-part="${i}" aria-pressed="${i===0}"><span aria-hidden="true">${i+1}</span>${label}</button></li>`).join('')}</ol>
     <p class="figure-part-note" data-figure-part-note>${figureParts[0][1]}</p>
    </details>
   </div>
  </div>
  <footer class="figure-footer"><span>${compare?'두 예시를 본 뒤, 네가 본 증상과 비교해 봐.':'실험에서 확인한 물길이야. 눈에 보이는 물방울부터 따라가 봐.'}</span><button type="button" class="btn secondary" data-figure-close>실험으로 돌아가기</button></footer>
 </section>`);
 d.classList.add('collector-figure-dialog');
 const host=d.querySelector('.collector-figure'),svg=host.querySelector('svg.figure-art');
 const footer=host.querySelector('.figure-footer');
 d.append(footer);
 footer.querySelector('[data-figure-close]').addEventListener('click',()=>d.close());
 const play=host.querySelector('[data-figure-play]'),cut=host.querySelector('[data-figure-cut]'),zoomButton=host.querySelector('[data-figure-zoom]');
 const note=host.querySelector('[data-figure-note]'),partNote=host.querySelector('[data-figure-part-note]'),loading=host.querySelector('.figure-loading');
 const leakKey=host.querySelector('[data-leak-key]');
 const cases=[...host.querySelectorAll('[data-figure-case]')],parts=[...host.querySelectorAll('[data-figure-part]')];
 const controls=host.querySelectorAll('button');
 const reduced=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 let caseIndex=0,mode=false,time=null,zoom=1,selected=0,yaw=HOME.yaw,pitch=HOME.pitch,playing=false,drag=null,frame=0,drawFrame=0,last=0,paint;
 const selectedExample=()=>examples[caseIndex];
 const layout=()=>selectedExample().layout;
 const draw=()=>{if(!paint||!host.isConnected||!d.open)return;paint({layout:layout(),mode,time,yaw,pitch,zoom,selected,width:svg.clientWidth,height:svg.clientHeight});};
 const queueDraw=()=>{if(!drawFrame)drawFrame=requestAnimationFrame(()=>{drawFrame=0;draw();});};
 function choosePart(i){
  if(i!==selected){selected=i;parts.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));partNote.textContent=figureParts[i][1];}
 }
 function setNote(message){if(note.textContent!==message)note.textContent=message;}
 const firstNote=()=>compare?'A와 B를 바꿔 보며 물이 어디서 멈추는지 찾아 봐.':'자동재생을 눌러 냉각판에서 시작하는 물길을 봐.';
 function updateTime(){
  const l=layout();
  if(time===null){leakKey.hidden=true;setNote(firstNote());return;}
  const atEnd=time>=l.duration,now=figureFrame(l,time);
  choosePart(now.step);
  leakKey.hidden=!now.leak;
  setNote(atEnd||!l.tracks.length?l.finalNote:now.leak?`${now.leak.source}에서 물이 아래로 새고 있어.`:`${now.step+1}. ${figureParts[now.step][0]}`);
  host.dataset.result=atEnd?'finished':'playing';
 }
 function playLabel(){
  play.querySelector('svg').outerHTML=playing?pauseIcon:playIcon;
  play.querySelector('span').textContent=playing?'직접 해보기':time!==null&&time>=layout().duration?'다시 재생':time===null?'자동재생':'이어서 재생';
 }
 function stop(){playing=false;cancelAnimationFrame(frame);frame=0;last=0;playLabel();}
 const stepTimes=()=>[...new Set(layout().tracks.map(t=>t.start+(t.end-t.start)*.6))].sort((a,b)=>a-b).concat(layout().duration);
 function nextStep(){
  if(time>=layout().duration)time=null;
  time=stepTimes().find(t=>t>(time??-1)+.0001)??layout().duration;
 }
 function tick(now){
  if(!d.open||!host.isConnected){stop();return;}
  if(!last)last=now;
  const dt=now-last,still=reduced();
  if(dt>=(still?1120:31)){
   last=now;
   if(still)nextStep();
   else time=Math.min(layout().duration,time+Math.min(dt,80)/1120);
   updateTime();draw();
   if(time>=layout().duration){stop();return;}
  }
  frame=requestAnimationFrame(tick);
 }
 function changeCase(i){
  if(caseIndex===i)return;
  caseIndex=i;time=null;choosePart(0);cases.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));
  stop();host.dataset.result='ready';updateTime();draw();
 }
 host.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(!paint)return;
  if(b.matches('[data-figure-case]'))changeCase(+b.dataset.figureCase);
  if(b.matches('[data-figure-play]')){
   if(playing){stop();return;}
   if(time>=layout().duration)time=null;
   if(reduced()&&time===null)nextStep();
   time??=0;
   playing=true;updateTime();playLabel();draw();
   if(time>=layout().duration)stop();else frame=requestAnimationFrame(tick);
  }
  if(b.matches('[data-figure-step]')){stop();nextStep();updateTime();playLabel();draw();}
  if(b.matches('[data-figure-cut]')){mode=!mode;cut.setAttribute('aria-pressed',String(mode));cut.querySelector('span').textContent=mode?'겉 보기':'속 보기';draw();}
  if(b.matches('[data-figure-part]')){stop();choosePart(+b.dataset.figurePart);draw();}
  if(b.matches('[data-figure-turn]')){yaw+=+b.dataset.figureTurn*34;draw();}
  if(b.matches('[data-figure-reset]')){yaw=HOME.yaw;pitch=HOME.pitch;zoom=1;zoomButton.setAttribute('aria-pressed','false');zoomButton.querySelector('span').textContent='부품 확대';draw();}
  if(b.matches('[data-figure-zoom]')){zoom=zoom===1?1.24:1;zoomButton.setAttribute('aria-pressed',String(zoom>1));zoomButton.querySelector('span').textContent=zoom>1?'원래 크기':'부품 확대';draw();}
 });
 svg.addEventListener('pointerdown',e=>{if(e.button!==0||drag||!paint)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch};svg.setPointerCapture(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;yaw=drag.yaw+(e.clientX-drag.x)*.48;pitch=Math.min(67,Math.max(12,drag.pitch+(e.clientY-drag.y)*.23));queueDraw();});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});
 svg.addEventListener('keydown',e=>{const delta={ArrowLeft:-18,ArrowRight:18,ArrowUp:0,ArrowDown:0}[e.key];if(delta===undefined)return;e.preventDefault();yaw+=delta;if(!delta)pitch=Math.min(67,Math.max(12,pitch+(e.key==='ArrowUp'?7:-7)));draw();});
 const ro=new ResizeObserver(queueDraw);ro.observe(svg);
 const visibility=()=>{if(document.hidden&&playing)stop();};
 document.addEventListener('visibilitychange',visibility);
 d.addEventListener('close',()=>{stop();cancelAnimationFrame(drawFrame);ro.disconnect();document.removeEventListener('visibilitychange',visibility);},{once:true});
 controls.forEach(b=>b.disabled=true);
 setNote(firstNote());playLabel();host.dataset.result='ready';
 loadArt().then(({mountFigureArt})=>{
  if(!d.open||!host.isConnected)return;
  paint=mountFigureArt(svg);loading.remove();controls.forEach(b=>b.disabled=false);draw();
 }).catch(()=>{if(d.open&&host.isConnected)loading.textContent='모형을 열지 못했어. 실험으로 돌아가서 계속할 수 있어.';});
}
