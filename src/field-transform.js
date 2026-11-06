import {btn,icon,beaker} from './ui.js';
import {studySheets} from './study-materials.js';
import {fieldAction} from './fieldwork-model.js';
import {heatingTrial} from './activity-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

const changes={
 freeze:{verb:'얼리기',goal:'물컵의 물을 얼음으로 만들어 봐!',from:'water',to:'ice',result:'물을 차갑게 했더니 얼음이 됐어. 이 변화를 얼기라고 해.',hint:'물이 얼려면 더 차가워져야 해.'},
 melt:{verb:'녹이기',goal:'얼음을 녹여 물로 바꿔 봐!',from:'ice',to:'water',result:'얼음이 따뜻해지니까 녹아서 물이 됐어. 이 변화를 녹기라고 해.',hint:'얼음이 녹으려면 더 따뜻해져야 해.'},
 evaporate:{verb:'끓이기',goal:'물을 끓여 수증기로 바꿔 봐!',from:'water',to:'air',result:'물속에서도 기포가 계속 올라왔어. 기포 속에는 눈에 보이지 않는 수증기가 있어.',hint:'물을 충분히 가열해 물속에서 기포가 올라오게 해 봐.'},
 condense:{verb:'물방울 모으기',goal:'공기 중 수증기로 물방울을 만들어 봐!',from:'air',to:'drops',result:'눈에 보이지 않던 수증기가 차가운 판에 닿아 물방울이 됐어. 이게 응결이야.',hint:'공기 중 수증기가 차가운 표면에 닿게 해 봐.'}
};
const keys=Object.keys(changes);
const tools={
 cold:{name:'냉각팩',action:'차갑게 하기',button:'냉각팩 붙이기',art:1},
 warm:{name:'따뜻한 받침',action:'따뜻하게 하기',button:'받침으로 데우기',art:0},
 time:{name:'모래시계',action:'시간 보내기',button:'시간 보내기',art:2}
};
const labels={water:'물',ice:'얼음',air:'수증기',drops:'물방울'};
const usingText={cold:'차가워지는 중',warm:'따뜻해지는 중',time:'시간이 지나는 중'};
const USE_MS=2100,FLIGHT_MS=520;
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const nextKey=c=>keys.find(key=>!c.marks.includes(key));
function sprite(sheet,index){
 const {file,cols,rows}=studySheets[sheet];
 return `<svg class="transform-art" viewBox="0 0 512 512" aria-hidden="true"><svg width="512" height="512" viewBox="${index%cols*512} ${Math.floor(index/cols)*512} 512 512" overflow="hidden"><image href="/assets/learning/${file}" width="${cols*512}" height="${rows*512}"/></svg></svg>`;
}
function picture(kind,key){
 if(key==='condense')return `<img class="transform-art condensation-art" src="/assets/learning/${kind==='drops'?'cold-plate-guide':'cold-plate-dry'}.webp" alt="">`;
 if(kind==='water')return sprite('dew',0);
 if(kind==='ice')return sprite('ice',2);
 if(kind==='drops')return sprite('dew',2);
 return `<div class="transform-invisible"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 20V10m-3 3 3-3 3 3m3 7V4m-3 3 3-3 3 3m3 13V10m-3 3 3-3 3 3"/></svg><span>공기 중에 있어<br>눈에 보이지 않아</span></div>`;
}
/** Stays on the result so the learner still sees what was attached. */
function attachedPicture(kind,key,tool){
 return `<div class="transform-stack">${picture(kind,key)}<span class="transform-attached" data-fx="${tool}" aria-hidden="true">${sprite('tools',tools[tool].art)}</span></div>`;
}
function toolEffect(id,key,ok){
 const bits=id==='time'?'':Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('');
 return `<div class="tool-fx" data-fx="${id}" aria-hidden="true"><div class="fx-wash"></div>${ok?`<div class="fx-result">${picture(changes[key].to,key)}</div>`:''}<div class="fx-bits">${bits}</div><div class="fx-tool">${sprite('tools',tools[id].art)}</div><b class="fx-label">${usingText[id]}</b></div>`;
}
function overview(c,key){
 return `<ol class="transform-progress" aria-label="변신길 진행 상황">${keys.map((id,i)=>`<li ${id===key?'aria-current="step"':''} class="${c.marks.includes(id)?'is-done':''}"><span aria-hidden="true">${c.marks.includes(id)?icon('check',16):i+1}</span>${changes[id].verb}</li>`).join('')}</ol>`;
}
function resultText(key,tool,ok){
 if(ok)return changes[key].result;
 if(key==='evaporate'&&tool==='time')return '가열하지 않아도 표면에서 물이 줄었어. 이건 증발이야. 이번에는 가열판으로 물속에도 기포가 생기는지 보자.';
 if(key==='evaporate'&&tool==='cold')return '차가운 곳에서도 물은 증발하지만 천천히 줄어들어. 시간을 더 보내서 관찰해 볼까?';
 const observed=tool==='time'?'기다려 봤지만 이번에는 원하는 변화가 일어나지 않았어.':tool==='warm'?'따뜻하게 했지만 원하는 모습으로 바뀌지 않았어.':'냉각팩으로 차갑게 했지만 원하는 변화가 일어나지 않았어.';
 return observed+' '+changes[key].hint;
}
function boilComparison(time=0,heated=true){
 const t=heatingTrial(heated?100:0,time);
 return `<div class="transform-boil-pair">
 <figure><figcaption>가열하지 않은 물</figcaption>${beaker(t.room)}<small>${time?'표면에서 조금씩 증발해':'시간을 보내면 물높이가 달라져'}</small></figure>
 <figure class="${t.boiling?'is-boiling':''}" style="--heat:${heated?time/100:0}"><figcaption>${heated?'가열하는 물':'가열판을 끈 물'}</figcaption>${beaker(t.heated,false,t.boiling)}${heated?'<span class="boil-burner"><img class="boil-plate" src="/assets/learning/heat-plate-guide.webp" alt=""></span>':''}<small>${t.boiling?'물속에서 기포가 올라와!':heated&&time?'아직 끓지 않아':'가열판을 사용해 봐'}</small></figure>
 </div>`;
}
function view(c,key=nextKey(c),tool='',observed=null){
 const task=changes[key],allDone=!task,selected=tools[tool],boil=key==='evaporate',heating=boil&&tool==='warm',unheated=boil&&tool==='time';
 const hint=observed?boil?'두 컵의 물높이와 기포를 비교해 봐.':observed.ok?'전과 뒤의 모습을 비교해 봐.':'다른 도구로 다시 해 볼까?':heating?'시간 손잡이를 밀어 물속에 기포가 생길 때까지 가열해 봐.':tool==='cold'?'냉각팩을 왼쪽 ‘처음 모습’ 그림 위에 옮기거나 버튼을 눌러 봐.':tool==='warm'?'받침을 왼쪽 ‘처음 모습’ 그림 아래로 옮기거나 버튼을 눌러 봐.':tool==='time'?'시간 손잡이를 끝까지 밀거나 시간 보내기 버튼을 눌러 봐.':'아래 도구 중 하나를 골라 써 봐.';
 return `<div class="transform-top">${overview(c,key)}<button type="button" class="field-help-btn" data-action="field-help">파랑의 부탁 다시 보기</button></div>
 ${allDone?`<div class="transform-complete">
  <img src="/assets/v2/resident-2.webp" width="144" height="144" alt="">
  <div><h2>물의 변신길 네 개를 모두 찾았어!</h2><p>차갑게 하거나, 데우거나, 기다리면서 물의 모습이 달라지는 걸 봤어.</p>${btn('개념 영상 보고 도장 받기','field-finish','primary')}</div>
 </div>`:`<div class="transform-goal"><small>지금 할 일 · ${keys.indexOf(key)+1}번째 변신</small><h2>${task.goal}</h2><p>${hint}</p></div>
 ${heating||unheated?`<div id="transform-boiling-view">${boilComparison(observed?.time??0,heating)}</div>`:`<div class="transform-table" data-tool="${tool}">
  <div class="transform-sample" data-transform-sample><small>처음 모습</small>${picture(task.from,key)}<strong>${key==='condense'?'수증기와 금속판':labels[task.from]}</strong>${key==='condense'?'<span class="transform-note">수증기는 눈에 보이지 않아</span>':''}</div>
  <div class="transform-arrow" aria-hidden="true">${icon('arrow',32)}</div>
  <div class="transform-sample ${observed?'is-observed':''}"><small>${observed?'관찰한 모습':'만들어 볼 모습'}</small>${observed&&tool!=='time'?attachedPicture(observed.ok?task.to:task.from,key,tool):picture(observed&&!observed.ok?task.from:task.to,key)}<strong>${labels[observed&&!observed.ok?task.from:task.to]}</strong></div>
 </div>`}
 ${observed?`<div class="transform-feedback" role="status" data-correct="${observed.ok}"><p><strong>${observed.ok?'변신 성공!':unheated?'표면에서 증발했어.':'아직 그대로야.'}</strong> ${resultText(key,tool,observed.ok)}</p>
  <button type="button" class="btn primary" data-transform-next>${observed.ok?(nextKey(c)?'다음 변신 해 보기':'네 가지 변신 마치기'):unheated?'가열판으로 끓여 보기':'다른 도구 고르기'}</button></div>`:
 `<div class="transform-tray" role="group" aria-label="변신에 쓸 도구">${Object.entries(tools).map(([id,data])=>`<button type="button" class="transform-tool" data-transform-tool="${id}" aria-pressed="${tool===id}">${boil&&id==='warm'?'<img class="transform-art heat-tool-art" src="/assets/learning/heat-plate-guide.webp" alt="">':sprite('tools',data.art)}<span><strong>${boil&&id==='warm'?'가열판':data.name}</strong><small>${boil&&id==='warm'?'물을 가열하기':data.action}</small></span></button>`).join('')}</div>
  ${selected?`<div class="transform-use">${tool==='time'||heating?`<label for="transform-time">${heating?'가열한 시간':'시간 손잡이'} <input id="transform-time" type="range" min="0" max="100" value="0" step="5" aria-valuetext="처음"></label>`:''}
  <button type="button" class="btn primary" data-transform-apply>${heating?'끝까지 가열하기':selected.button}</button></div>`:''}`}`}
 <div class="transform-footer">${btn('앞 실험 다시 보기','field-back','quiet')}<details><summary>모형 안내</summary><p>기다리는 시간을 줄여서 보여 줘. 증발하면 물의 양이 조금씩 줄고, 생긴 수증기는 눈에 보이지 않아.</p></details></div>`;
}
export function transformView(c){return `<section id="field-transform" class="field-transform" aria-label="물의 네 가지 변신">${view(c)}</section>`;}

export function bindTransform(host,get){
 let key=nextKey(get()),tool='',observed=null,drag=null,busy=false,timer=0,frame=0;
 const life=new AbortController(),{signal}=life;
 const paint=selector=>{host.innerHTML=view(get(),key,tool,observed);if(selector)host.querySelector(selector)?.focus();};
 const sampleBox=()=>host.querySelector('[data-transform-sample]');
 const inside=(e,box)=>{const r=box?.getBoundingClientRect();return !!r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
 /** The tool flies in, presses onto the sample, and the change happens in place. */
 function playTool(sample,id,ok,from){
  const art=sample.querySelector('.transform-art,.transform-invisible').getBoundingClientRect(),box=sample.getBoundingClientRect();
  sample.closest('.transform-table').dataset.tool=id;
  sample.classList.add('is-using');sample.classList.toggle('is-changing',ok);
  sample.insertAdjacentHTML('beforeend',toolEffect(id,key,ok));
  const layer=sample.querySelector('.tool-fx'),piece=layer.querySelector('.fx-tool');
  for(const [name,value] of [['--ax',art.left-box.left],['--ay',art.top-box.top],['--aw',art.width],['--ah',art.height]])layer.style.setProperty(name,value+'px');
  const landed=piece.getBoundingClientRect(),source=host.querySelector(`[data-transform-tool="${id}"]`)?.getBoundingClientRect();
  const origin=from??(source?{x:source.left+source.width/2,y:source.top+source.height/2}:null);
  const dx=origin?origin.x-landed.left-landed.width/2:0,dy=origin?origin.y-landed.top-landed.height/2:-40;
  piece.animate([{transform:`translate(${dx}px,${dy}px) scale(1.25)`},{transform:'scale(1.12)',offset:.68},{transform:'scale(1.08,.84)',offset:.84},{transform:'none'}],{duration:FLIGHT_MS,easing:'ease-out'});
  setTimeout(()=>{if(!signal.aborted&&busy)void playCue('drop');},FLIGHT_MS*.8);
 }
 function test(id=tool,elapsed=100,from=null){
  if(!key||!tools[id]||observed||busy)return;
  const current=get();
  if(current.marks.includes(key))return;
  const checked=fieldAction(2,current,'try-route',{item:id,target:key,time:elapsed}),ok=checked.marks.includes(key);
  const finish=()=>{
   busy=false;tool=id;observed={ok,time:elapsed};
   checked.message=resultText(key,tool,ok);
   state.fieldwork.chapters[2]=checked;save();
   void playCue(ok?'success':'drop');
   paint('[data-transform-next]');
  };
  const sample=sampleBox();
  if(!sample||motionOff()){finish();return;}
  busy=true;playTool(sample,id,ok,from);timer=setTimeout(finish,USE_MS);
 }
 function showTime(value){
  const input=host.querySelector('#transform-time'),heating=key==='evaporate'&&tool==='warm';
  input?.setAttribute('aria-valuetext',heating&&heatingTrial(100,value).boiling?'끓는 중':value?'시간이 지나는 중':'처음');
  const visual=host.querySelector('#transform-boiling-view');if(visual)visual.innerHTML=boilComparison(value,heating);
 }
 /** Heating takes visible time: the slider and the burner climb together. */
 function runClock(){
  const input=host.querySelector('#transform-time');
  if(!input||motionOff()){test();return;}
  busy=true;const begin=+input.value,started=performance.now();
  const step=now=>{
   const progress=Math.min(1,(now-started)/1600),value=Math.round((begin+(100-begin)*progress)/5)*5;
   if(value!==+input.value){input.value=value;showTime(value);}
   if(progress<1)frame=requestAnimationFrame(step);else{busy=false;test(tool,100);}
  };
  frame=requestAnimationFrame(step);
 }
 host.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||busy)return;
  if(button.dataset.transformTool){
   tool=button.dataset.transformTool;
   void playCue('click');paint(tool==='time'||key==='evaporate'&&tool==='warm'?'#transform-time':'[data-transform-apply]');
  }else if(button.hasAttribute('data-transform-apply')){if(host.querySelector('#transform-boiling-view'))runClock();else test();}
  else if(button.hasAttribute('data-transform-next')){
   const tryHeat=!observed.ok&&key==='evaporate'&&tool==='time';
   if(observed.ok)key=nextKey(get());
   tool=tryHeat?'warm':'';observed=null;paint(tryHeat?'#transform-time':key?'[data-transform-tool]':'[data-action="field-finish"]');
  }
 },{signal});
 host.addEventListener('input',e=>{
  if(e.target.id!=='transform-time'||busy)return;
  const value=+e.target.value;
  showTime(value);
  if(value===100)test(tool,value);
 },{signal});
 host.addEventListener('pointerdown',e=>{
  const button=e.target.closest('[data-transform-tool="cold"],[data-transform-tool="warm"]');
  if(!button||e.button!==0||drag||busy)return;
  const id=button.dataset.transformTool;
  if(id==='warm'&&key==='evaporate')return;
  drag={button,tool:id,x:e.clientX,y:e.clientY,id:e.pointerId,ghost:null};
  button.setPointerCapture(e.pointerId);
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId)return;
  if(!drag.ghost){
   if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<=8)return;
   drag.ghost=document.createElement('div');drag.ghost.className='tool-ghost';drag.ghost.innerHTML=sprite('tools',tools[drag.tool].art);
   document.body.append(drag.ghost);
   drag.button.classList.add('is-dragging');host.classList.add('is-dragging-tool');host.dataset.dragTool=drag.tool;
  }
  const over=inside(e,sampleBox());
  drag.ghost.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%) scale(${over?1.12:1})`;
  sampleBox()?.classList.toggle('is-target',over);
 },{signal});
 function endDrag(e){
  if(drag?.id!==e.pointerId)return;
  const {button,tool:id,ghost}=drag;drag=null;
  ghost?.remove();button.classList.remove('is-dragging');host.classList.remove('is-dragging-tool');delete host.dataset.dragTool;
  sampleBox()?.classList.remove('is-target');
  if(!ghost||e.type==='pointercancel')return;
  if(inside(e,sampleBox()))test(id,100,{x:e.clientX,y:e.clientY});
  else{tool=id;paint(`[data-transform-tool="${id}"]`);}
 }
 host.addEventListener('pointerup',endDrag,{signal});
 host.addEventListener('pointercancel',endDrag,{signal});
 return ()=>{life.abort();clearTimeout(timer);cancelAnimationFrame(frame);drag?.ghost?.remove();};
}
