import {cycleView,bindCycle} from './greenhouse-cycle.js';
import {openFieldBriefing} from './field-briefing.js';
import {transformView,bindTransform} from './field-transform.js';
import {coldNightView,bindColdNight} from './field-coldnight.js';
import {seedColdNight} from './cold-night-model.js';
import {drawStudyArt,drawRealDrop,studySheets} from './study-materials.js';
import {fieldTask} from './field-guidance.js';
import {drawFreezePhoto,drawFreezeBeaker,photoLevel} from './freeze-photos.js';
import {startLevel} from './freeze-talk.js';
import {restingIceY,beakerInner} from './scene-model.js';
import {drawVessel,drawVesselFront,drawBeakerWater,waterSurfaceY} from './pouring-scene.js';
import {state,save} from './state.js';
import {fieldMissions,chapterState,fieldAction,fieldReady} from './fieldwork-model.js';
import {btn,buddy,icon,esc,toast,modal,propArt} from './ui.js';
import {playCue} from './sound.js';
import {openConcept} from './concepts.js';

let cleanups=[];
export function cleanupFieldwork(){cleanups.splice(0).forEach(fn=>fn());}
export function fieldChapter(n){return state.fieldwork.chapters[n]??=chapterState(n);}
export function hasFieldSeal(n){return [6,8].includes(n)?state.completed.includes(n/2):fieldReady(n,state.fieldwork.chapters[n]);}
export function startFieldwork(n,pending,ctx){if(!fieldMissions[n])return;state.fieldwork.active=n;state.fieldwork.pending=pending;const c=fieldChapter(n);if(n===4)seedColdNight(c,state.activities.pipe);save();ctx.render();}
const names={water:'물',ice:'얼음',warm:'따뜻한 받침',time:'잠깐 기다리기',cold:'냉각팩',condition:'찾은 조건',weight:'100 g 추',melt:'녹인 뒤 사진',pack:'냉각팩',tray:'물 받이',destination:'줄어든 물',A:'A의 줄어든 물',B:'B의 줄어든 물',lens:'돋보기'};
const destinations={tall:'길쭉한 그릇',wide:'넓은 그릇',freeze:'물 → 얼음',melt:'얼음 → 물',evaporate:'물 → 수증기',condense:'수증기 → 물',first:'① 냉각팩을 대기 전',middle:'② 냉각팩을 댄 뒤',last:'③ 따뜻하게 한 뒤',balance:'저울',air:'공기 중',surface:'A 표면',inside:'B 물속',level:'두 수위',A:'A컵',B:'B컵',plate:'금속판',under:'판 아래'};
const weighingOpen=c=>c.marks.includes('order')||c.done;
function setup(n){
 let items=[],targets=[];
 const item=(id,x,y,art,label=names[id])=>items.push({id,x,y,art,label,w:110,h:90});
 const target=(id,x,y,label=destinations[id],w=150,h=86)=>targets.push({id,x,y,label,w,h});
 if(n===1){item('water',110,100,1);item('ice',110,265,2);target('tall',365,205,undefined,125,240);target('wide',570,205,undefined,200,240);}
 if(n===3){
  // Photos carry no answers until their order is found; after that they become the things to weigh.
  const weighing=weighingOpen(fieldChapter(3));
  if(weighing){item('water',100,62,0,'① 처음 물');item('ice',100,182,0,'② 얼음');item('melt',100,302,0,'③ 녹인 물');}
  else{item('melt',100,62,0,'사진 가');item('ice',100,182,0,'사진 나');item('water',100,302,0,'사진 다');}
  items.forEach(i=>{i.w=164;i.h=112;});
  if(weighing){item('weight',645,62,-1);target('pan',300,232,'왼쪽 접시',170,190);target('balance',560,232,'오른쪽 접시',170,190);}
  else ['first','middle','last'].forEach((id,k)=>target(id,450,62+k*120,undefined,340,112));
 }

 if(n===5){item('A',130,320,0);item('B',345,320,0);target('air',590,345,'공기 중의 수증기',190,65);}
 if(n===7){item('pack',105,170,5);target('A',320,195,'A컵',160,210);target('B',550,195,'B컵',160,210);if([0,1].every(k=>fieldChapter(7).tested.some(t=>t.cold===k))){item('condition',105,320,7);target('identity',320,355,'컵 이름',180,60);target('cold',550,355,'차가운 표면',180,60);}}
 if(n===8){item('cold',100,105,5);item('tray',100,285,9,'물 받이');target('plate',475,110,'금속판',240,75);target('under',475,315,'판 아래',240,80);}
 return {items,targets};
}
function alternatives(n){
 const {items,targets}=setup(n);

 if(n===9)return '<label>출발<select id="field-from">'+['냉각판','경사판','깔때기','연결관'].map((v,k)=>`<option value="${k}">${v}</option>`).join('')+'</select></label><label>도착<select id="field-to">'+['경사판','깔때기','연결관','물통'].map((v,k)=>`<option value="${k+1}">${v}</option>`).join('')+'</select></label>'+btn('물길 연결','field-connect');
 const select=items.length?'<label>움직일 물체<select id="field-item">'+items.map(i=>`<option value="${i.id}">${esc(i.label)}</option>`).join('')+'</select></label>':'';
 const places=targets.filter(t=>n!==6||t.id==='air').map(t=>btn(t.label,'field-place-'+t.id)).join('');
 return select+places+(n===6?btn('같은 물 넓게 펴기','field-spread'):'');
}
const lastSpreadMatches=c=>c.tested.at(-1)?.ok&&c.tested.at(-1).spread===c.spread.length;
function fieldControls(n,c,task){
 if(task.done)return btn('개념 영상 보고 도장 받기','field-finish','gold');
 if(n===3&&c.marks.includes('order'))return c.selected?'':`<div class="field-choice-group" role="group" aria-label="얼음이 되면 무게는 어떻게 될까?">${[['heavier','더 무거워져'],['same','그대로야'],['lighter','더 가벼워져']].map(([key,label])=>btn(label,'field-weigh-guess-'+key,'secondary')).join('')}</div>`;
 if(n===5){
  const cups=['A','B'].map(key=>btn(key==='A'?'A · 가열하지 않은 물':'B · 끓는 물','field-water-'+key,'secondary',c.moves[key]==='air').replace('data-action=',`aria-pressed="${c.selected===key}" data-action=`)).join('');
  const choices=c.selected?['공기 중','컵 속','바닥'].map((label,i)=>btn(label,'field-destination-'+['air','cup','floor'][i],'secondary')).join(''):'';
  return `<div class="field-choice-group" role="group" aria-label="줄어든 물을 골라 봐">${cups}</div>${choices?`<div class="field-choice-group" role="group" aria-label="물이 간 곳">${choices}</div>`:''}`;
 }
 if(n===10)return !c.marks.includes('evaporate')?`<label class="activity-range" for="field-cycle-time">시간 손잡이<input id="field-cycle-time" type="range" min="0" max="100" step="5" value="0"></label>${btn('시간 보내기','field-cycle-evaporate','primary')}`:btn('냉각판 켜기','field-cycle-condense','primary');
 if(n===7&&c.tested.some(t=>t.cold===0)&&c.tested.some(t=>t.cold===1))return `<div class="field-choice-group">${btn('컵의 이름','field-condition-identity','secondary')}${btn('차가운 표면','field-condition-cold','secondary')}</div>`;
 const testLabel=({3:'사진 순서 확인하기',6:'같은 시간 뒤 비교하기',7:'같은 시간 뒤 비교하기',8:'물 모이는지 시험하기'})[n];
 const testDisabled=n===7&&!['A','B'].includes(c.selected)||n===8&&c.moves.tray!=='under';
 return (n===8&&c.moves.cold==='plate'?btn('냉각팩 떼기','field-remove-cold','quiet'):'')+(testLabel?btn(testLabel,'field-test',task.target.includes('field-test')?'primary':'secondary',testDisabled):'');
}
export function fieldworkView(n){
 if(n===2)return transformView(fieldChapter(n));
 if(n===4)return coldNightView(fieldChapter(n));
 if(n===10)return cycleView(fieldChapter(n));
 const m=fieldMissions[n],c=fieldChapter(n),task=fieldTask(n,c);
 const zones=n===6?`<div class="spread-coverage"><label for="spread-coverage">B판의 물자국</label><meter id="spread-coverage" min="0" max="12" value="${Math.min(12,c.spread.length)}"></meter><output id="spread-count" for="spread-coverage">${c.spread.length}/12칸</output></div>`:n===8?`<div class="cooling-checks"><span class="${task.beforeCooling?'done':''}">냉각 전 · ${task.beforeCooling?'관찰함':'아직'}</span><span class="${task.afterCooling?'done':''}">냉각 후 · ${task.afterCooling?'관찰함':'아직'}</span></div>`:'';
 const result=c.message?`<div class="challenge-status field-observed" role="status"><b>본 결과</b> <span>${esc(task.result)}</span></div>`:'';
 const readings=[7,8].includes(n)?c.tested.slice(-2).map(t=>`<span class="activity-record">${n===7?`${t.cold===0?'A':'B'}컵에 냉각팩`:`${t.cold?'냉각함':'냉각 안 함'} · ${t.ok?'물 모임':'모인 물 없음'}`}</span>`).join(''):'';
 return `<div class="activity fieldwork-activity activity-${n}"><div class="activity-scene">${zones}<div class="expedition-board"><canvas id="field-canvas" width="720" height="400" role="img" aria-label="${esc(m.goal)}" aria-describedby="stage-how"></canvas></div>${result}${readings?`<div class="activity-records">${readings}</div>`:''}</div><aside class="activity-tools quest-panel" aria-label="지금 사용할 실험 도구">${fieldControls(n,c,task)}${!task.done&&![6,10].includes(n)?`<details class="expedition-choices essential-controls"><summary>버튼으로 조작하기</summary>${alternatives(n)}</details>`:''}${btn('앞 실험 다시 보기','field-back','quiet')}<details class="science-detail"><summary>모형 안내</summary><p class="activity-science">${n===6?'같은 물과 바닥에서 넓이만 바꿔 비교하는 모형이야.':'관찰하기 쉽도록 시간과 물의 양을 줄여 보여 줘. 수증기는 눈에 보이지 않아.'}</p></details></aside></div>`;
}
export function handleFieldwork(action,ctx){
 if(!action.startsWith('field-'))return false;
 const n=state.fieldwork.active||Number(state.route);
 if(action==='field-help'){if(fieldMissions[n])openFieldBriefing(n);else import('./field-briefing.js').then(m=>m.openStageLetter(n));return true;}
 if(action==='field-help-close'){document.querySelector('#dialog')?.close();return true;}
 if(!fieldMissions[n])return true;
 if(action==='field-back'){state.fieldwork.active=0;save();ctx.render();return true;}
 if(action==='field-finish'||action==='field-continue'){
  if(!hasFieldSeal(n)){toast('조건을 바꿔 보고, 관찰한 근거로 문제를 해결해 줘.');return true;}
  if(action==='field-finish'){openConcept(n/2,{reduced:state.settings.reduced,continueLabel:'주민 만나기',onContinue:()=>{if(state.route===n&&state.fieldwork.active===n)handleFieldwork('field-continue',ctx);}});return true;}
  document.querySelector('#dialog')?.close();
  const pending=state.fieldwork.pending;state.fieldwork.active=0;state.fieldwork.pending='';save();playCue('success');
  if(pending==='teacher-return'&&state.settings.adminUnlock)ctx.go(n);
  else if(pending==='field-ending')ctx.finishEnding();
  else ctx.baseAction(pending);
  return true;
 }
 let command,payload={};
 if(action==='field-remove-cold'&&n===8){command='place';payload={item:'cold',target:'shelf'};}
 if(action==='field-test')command='test';
 if(n===3&&action.startsWith('field-weigh-guess-')){command='guess-weight';payload={guess:action.slice(18)};}
 if(n===5&&action.startsWith('field-water-')){command='select-water';payload={cup:action.slice(12)};}
 if(n===5&&action.startsWith('field-destination-')){command='trace-water';payload={destination:action.slice(18)};}
 if(n===7&&action.startsWith('field-condition-')){command='place';payload={item:'condition',target:action.slice(16)};}
 if(n===10&&action.startsWith('field-cycle-')){command='run-cycle';payload={step:action.slice(12),time:100};}
 if(action==='field-spread'){let c=fieldChapter(n);for(let cell=0;cell<24;cell++)c=fieldAction(n,c,'spread',{cell});state.fieldwork.chapters[n]=c;save();ctx.render();return true;}
 if(action.startsWith('field-place-')){command='place';payload={item:document.getElementById('field-item')?.value,target:action.slice(12)};}
 if(action.startsWith('field-inspect-')){command='inspect';payload={site:action.slice(14)};}
 if(action==='field-connect'){command='connect';payload={from:+document.getElementById('field-from').value,to:+document.getElementById('field-to').value};}
 if(command){state.fieldwork.chapters[n]=fieldAction(n,fieldChapter(n),command,payload);save();ctx.render();}
 return true;
}
export function bindFieldwork(n,ctx){
 cleanupFieldwork();
 if(n===2){const host=document.getElementById('field-transform');if(host)cleanups.push(bindTransform(host,()=>fieldChapter(n)));return;}
 if(n===4){const host=document.getElementById('field-coldnight');if(host)cleanups.push(bindColdNight(host,()=>fieldChapter(n),c=>{state.fieldwork.chapters[n]=c;}));return;}
 if(n===10){const host=document.getElementById('field-greenhouse');if(host)cleanups.push(bindCycle(host,()=>fieldChapter(n),(step,time)=>{state.fieldwork.chapters[n]=fieldAction(n,fieldChapter(n),'greenhouse-cycle',{step,time});save();},()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches));return;}
 const canvas=document.getElementById('field-canvas');if(!canvas)return;
 const g=canvas.getContext('2d'),assets={},layout=setup(n),f=state.fieldwork,guidance=fieldTask(n,fieldChapter(n)),hasCoach=!!document.querySelector('.coach-trigger');
  let beam=0,drag=null,activePointer=null,lineStart=null,brush=false,frame,tapItem=null,tapNode=null;
 const get=()=>fieldChapter(n);
 const clockInput=document.getElementById('field-cycle-time');
 if(clockInput)clockInput.oninput=()=>{if(Number(clockInput.value)>=100)handleFieldwork('field-cycle-evaporate',ctx);};

 for(const [key,url] of [['equipment','equipment-atlas.webp'],['workshop','workshop-atlas.webp'],['buddy','buddy-poses-clean.webp'],...(n===1?[['pouring-glass','pouring-glass.webp']]:[])]){const im=new Image();im.src='/assets/v2/'+url;assets[key]=im;}
 for(const key of ['tools',...([2,7,10].includes(n)?['dew']:[]),...([1,2,3].includes(n)?['ice']:[])]){const im=new Image();im.src='/assets/learning/'+studySheets[key].file;assets['real-'+key]=im;}
 for(const [key,url,needed] of [['water-material','water-material.webp',true],['cold-plate','cold-plate-guide.webp',n===8||n===10],['weight','weight-100g.webp',n===3],['cold-plate-dry','cold-plate-dry.webp',n===8||n===10]])if(needed){const im=new Image();im.src='/assets/learning/'+url;assets[key]=im;}
 // Each region has its own field worktable; it is flattened once so every frame only copies pixels.
 let table=null;{const im=new Image();im.onload=()=>{const off=document.createElement('canvas');off.width=720;off.height=400;const o=off.getContext('2d'),s=Math.max(720/im.naturalWidth,400/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;o.drawImage(im,(720-w)/2,(400-h)/2,w,h);const wash=o.createRadialGradient(360,205,70,360,205,430);wash.addColorStop(0,'rgba(255,253,243,.4)');wash.addColorStop(1,'rgba(255,253,243,.06)');o.fillStyle=wash;o.fillRect(0,0,720,400);table=off;};im.src=`/assets/stages/field-${['spring','winter','sun','dew','lab'][Math.ceil(n/2)-1]}.webp`;}
 const act=(a,p={})=>{f.chapters[n]=fieldAction(n,get(),a,p);};
 const pos=e=>{const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*720,y:(e.clientY-b.top)/b.height*400};};
 const inside=(p,t)=>Math.abs(p.x-t.x)<t.w/2&&Math.abs(p.y-t.y)<t.h/2;
 const nodes=[[165,55],[300,135],[450,210],[450,280],[450,350]];
 const nearest=p=>{
  let node=-1,best=Math.max(45,24*720/canvas.clientWidth);
  nodes.forEach(([x,y],i)=>{const d=Math.hypot(x-p.x,y-p.y);if(d<best){best=d;node=i;}});
  return node;
 };
 const spread=p=>{if(p.x>=390&&p.x<=690&&p.y>=85&&p.y<=290)act('spread',{cell:Math.min(47,Math.floor((p.y-85)/205*6)*8+Math.min(7,Math.floor((p.x-390)/300*8)))});};
 canvas.onpointerdown=e=>{if(e.button!==0||activePointer!==null)return;e.preventDefault();activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);const p=pos(e);
  if(n===6&&p.x>390&&p.y<300){brush=true;spread(p);return;}
  if(n===9){lineStart=nearest(p);return;}
  if(n===5){const water=layout.items.find(t=>inside(p,t));if(water){act('select-water',{cup:water.id});save();ctx.render();}return;}
  const placedCold=n===8&&get().moves.cold==='plate'?{...layout.items.find(t=>t.id==='cold'),x:580,y:100}:null;
  const item=placedCold&&inside(p,placedCold)?placedCold:[...layout.items].reverse().find(t=>inside(p,t));if(item){tapItem=item;drag={...item,dx:p.x-item.x,dy:p.y-item.y};}
  else if(tapItem&&layout.targets.some(t=>inside(p,t)))drag={...tapItem,x:p.x,y:p.y,dx:0,dy:0};
 };
 canvas.onpointermove=e=>{if(activePointer!==e.pointerId)return;const p=pos(e);if(brush)spread(p);else if(drag){drag.x=p.x-drag.dx;drag.y=p.y-drag.dy;}};
 const finish=e=>{if(activePointer!==e.pointerId)return;activePointer=null;const p=pos(e);
  if(e.type!=='pointercancel'){
   if(n===9&&lineStart>=0){const end=nearest(p);if(end===lineStart&&tapNode===null){tapNode=lineStart;drag=null;lineStart=null;ctx.say('출발 부품을 골랐어. 이어 받을 부품을 눌러 줘.');void playCue('click');return;}act('connect',{from:tapNode??lineStart,to:end});tapNode=null;void playCue('connect');}
   else if(drag){const source=layout.items.find(i=>i.id===drag.id),t=n===8&&drag.id==='cold'&&get().moves.cold==='plate'&&inside(p,source)?{id:'shelf'}:layout.targets.find(t=>inside(p,t));if(t){if(drag.id==='lens')act('inspect',{site:t.id});else act('place',{item:drag.id,target:t.id});tapItem=null;void playCue('drop');}else{tapItem=source;drag=null;lineStart=null;ctx.say('물체를 골랐어. 놓을 곳을 눌러도 돼.');void playCue('click');return;}}
  }
  drag=null;lineStart=null;brush=false;save();ctx.render();
 };
 canvas.onpointerup=finish;canvas.onpointercancel=finish;
  function text(str,x,y,size=22,color='#234f59',align='center'){const renderedScale=canvas.getBoundingClientRect().width/720;size=Math.max(size,Math.min(24,17/Math.max(.6,renderedScale)));g.font=`${size}px Jua, system-ui, sans-serif`;g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';const lines=String(str).split('\n');lines.forEach((line,i)=>g.fillText(line,x,y+(i-(lines.length-1)/2)*size*1.15));}
 function panel(x,y,w,h,fill='#fffdf3',stroke='#c8d5c9'){g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=2;g.beginPath();g.roundRect(x,y,w,h,16);g.fill();g.stroke();}
 function art(index,x,y,w=100,type='equipment'){const im=assets[type];if(!im?.complete||!im.naturalWidth)return;const cols=type==='buddy'?4:3,rows=type==='buddy'?4:type==='workshop'?2:3,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;g.drawImage(im,index%cols*sw,Math.floor(index/cols)*sh,sw,sh,x-w/2,y-w/2,w,w);}
 const packArt=(x,y,w)=>art(5,x,y,w);
 function learningArt(key,x,y,w,h){const im=assets[key];if(!im?.complete||!im.naturalWidth)return false;g.drawImage(im,x-w/2,y-h/2,w,h);return true;}
 function cup(x,y,w,h,amount=70){
  const image=assets.equipment;if(!image?.complete||!image.naturalWidth)return;
  const shell={left:x-w*.6,top:y-h*1.04,width:w*1.2,height:h*1.1},sw=image.naturalWidth/3,sh=image.naturalHeight/3,level=Math.max(0,Math.min(100,amount))/100;
  g.drawImage(image,sw*.12,sh*.07,sw*.76,sh*.86,shell.left,shell.top,shell.width,shell.height);
  if(level)drawBeakerWater(g,image,shell,{top:beakerInner(shell).floor-shell.height*.7*level});
 }
 function clock(x,y,r=25){g.strokeStyle='#b58736';g.lineWidth=4;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.moveTo(x,y-r*.7);g.lineTo(x,y);g.lineTo(x+r*.5,y+r*.3);g.stroke();}
 function arrow(x1,y1,x2,y2,color='#56a6b5'){g.strokeStyle=color;g.fillStyle=color;g.lineWidth=5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-14*Math.cos(a-.5),y2-14*Math.sin(a-.5));g.lineTo(x2-14*Math.cos(a+.5),y2-14*Math.sin(a+.5));g.fill();}
 // The tilt comes from what is on each pan, so the beam can never show a result the learner did not set up.
 function drawBalance(c){
  const sample=c.moves.pan||(c.done?'ice':''),weight=c.moves.weight==='balance',target=weight&&!sample?.17:0;
  beam=state.settings.reduced?target:beam+(target-beam)*.1;if(Math.abs(beam-target)<.002)beam=target;
  const px=430,py=92,half=130,dy=half*Math.sin(beam),dx=half*Math.cos(beam),drop=112,sides=[[px-dx,py-dy],[px+dx,py+dy]];
  const metal=g.createLinearGradient(0,py-8,0,py+8);metal.addColorStop(0,'#f3d98f');metal.addColorStop(1,'#a97a26');
  g.fillStyle='#8a6a2e';g.beginPath();g.roundRect(px-70,346,140,14,7);g.fill();g.beginPath();g.roundRect(px-6,py,12,250,4);g.fill();
  g.strokeStyle=metal;g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(...sides[0]);g.lineTo(...sides[1]);g.stroke();g.lineCap='butt';
  g.fillStyle='#c79a3e';g.beginPath();g.arc(px,py,11,0,7);g.fill();
  for(const [x,y] of sides){
   g.strokeStyle='#8a6a2e';g.lineWidth=2;g.beginPath();g.moveTo(x-62,y+drop);g.lineTo(x,y);g.lineTo(x+62,y+drop);g.stroke();
   g.fillStyle='#d9c08a';g.strokeStyle='#8a6a2e';g.lineWidth=2;g.beginPath();g.ellipse(x,y+drop,74,11,0,0,7);g.fill();g.stroke();
  }
  if(sample)drawFreezeBeaker(g,sample,sides[0][0],sides[0][1]+drop-6,58,.86);
  if(weight)learningArt('weight',sides[1][0],sides[1][1]+drop-40,58,70);
  if(weight&&sample&&beam===0){panel(px-52,28,104,34,'#e4f3d8','#96b994');text('수평!',px,45,20,'#2f6e4a');}
  else if(weight&&!sample)text('추 쪽으로 기울었어',px,45,18,'#9a5a1e');
 }
 function draw(time){
  const scale=Math.min(4,Math.max(2,canvas.clientWidth/720*2*devicePixelRatio));
  if(canvas.width!==Math.round(720*scale)){canvas.width=Math.round(720*scale);canvas.height=Math.round(400*scale);}
  g.setTransform(scale,0,0,scale,0,0);
  const c=get();g.clearRect(0,0,720,400);g.fillStyle='#fbf6e9';g.fillRect(0,0,720,400);if(table)g.drawImage(table,0,0);
  for(const t of layout.targets){const hit=drag&&inside(drag,t),filled=Object.values(c.moves).includes(t.id);if(n===3&&weighingOpen(c)&&!hit){text(t.label,t.x,t.y+t.h/2-17,18);continue;}if(tapItem&&!hit)g.setLineDash([9,5]);panel(t.x-t.w/2,t.y-t.h/2,t.w,t.h,hit?'#e3f6eb':filled?'#eef7ed':'#fffdf3',hit?'#25867b':tapItem?'#986716':'#c5d1c4');g.setLineDash([]);if(!(n===8&&t.id==='under'&&c.moves.tray==='under'))text(t.label,t.x,t.y+t.h/2-17,18);}
  if(n===1){const glass=assets['pouring-glass'],place=x=>({x,floor:268,scale:.95});if(glass?.complete&&glass.naturalWidth)for(const [key,x] of [['tall',365],['wide',570]]){const amount=c.moves.water===key?100:0;drawVessel(g,glass,key,{...place(x),amount});if(c.moves.ice===key){const y=restingIceY({floor:268,size:66,waterTop:amount?waterSurfaceY(key,amount,268,.95):null});drawStudyArt(g,assets['real-ice'],3,x,y,66);drawVesselFront(g,glass,key,place(x));}}text('같은 양의 물',465,32,22);}
  if(n===10){
   const evaporated=c.marks.includes('evaporate'),condensed=c.marks.includes('condense'),timePassed=clockInput?Number(clockInput.value):evaporated?100:0;
   panel(36,94,184,212);panel(268,94,184,212);panel(500,94,184,212);
   text('물 표면',128,125,22);cup(128,245,92,100,72-timePassed*.22);
   text('공기 중 수증기',360,125,22);text('눈에 보이지 않아',360,196,18);
   if(evaporated){g.setLineDash([6,6]);arrow(210,198,281,198,'#517e82');g.setLineDash([]);}
   text('차가운 판',592,125,22);
   if(!learningArt(condensed?'cold-plate':'cold-plate-dry',592,193,144,96))panel(552,153,80,72,'#d5e8ed','#82a5af');
   if(condensed){const fall=(state.settings.reduced?.55:time/900%1);drawRealDrop(g,592,245+fall*42,5);arrow(592,247,592,283);text('온실로 물이 흘러',592,327,20);}
   else text(evaporated?'냉각판을 켜 봐':'물이 먼저 증발해야 해',592,327,19);
  }
  if(n===3){
   if(weighingOpen(c))drawBalance(c);
   else for(const [id,to] of Object.entries(c.moves)){
    const t=layout.targets.find(t=>t.id===to);if(!t)continue;
    drawFreezePhoto(g,id,t.x-86,t.y-13,118,76,packArt);
    const gap=Math.round((photoLevel[id]-startLevel)*10)/10;
    text(`눈금 ${photoLevel[id]}`,t.x+72,t.y-26,17);text(gap?`선보다 +${gap}`:'빨간 선과 같아',t.x+72,t.y,15,gap?'#14506e':'#b5352a');
   }
  }
  if(n===6){
   const meter=document.getElementById('spread-coverage'),count=document.getElementById('spread-count');
   if(meter)meter.value=Math.min(12,c.spread.length);if(count)count.textContent=c.spread.length+'/12칸';
   text('A · 처음처럼 좁게',185,35,23);text('B · 같은 물을 넓게',540,35,23);
   panel(35,70,300,230,'#e4ddc6','#98ada2');panel(385,70,310,230,'#e4ddc6','#98ada2');
   const grain=assets['water-material'],showAfter=lastSpreadMatches(c);
   const puddle=(spots,left,width,opacity)=>{
    g.save();g.beginPath();
    for(const [x,y,rx,ry,rotation] of spots){g.moveTo(x+rx,y);g.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);}
    g.fillStyle='#388294';g.globalAlpha=opacity;g.fill();
    if(grain?.naturalWidth){g.clip();g.globalAlpha=opacity*.64;g.drawImage(grain,left,78,width,222);}
    g.restore();
   };
   puddle([[185,180,41,50,-.16]],35,300,showAfter?.51:.88);
   const spots=c.spread.length?c.spread.map(cell=>[414+cell%8*37.5,102+Math.floor(cell/8)*34.2,23,22,(cell%5-2)*.15]):[[540,180,41,50,-.16]];
   puddle(spots,385,310,showAfter?.19:c.spread.length?.42+Math.min(.32,5/c.spread.length):.88);
   g.strokeStyle='#7e9c8f88';g.lineWidth=1;g.beginPath();
   for(let col=0;col<=8;col++){g.moveTo(390+col*37.5,85);g.lineTo(390+col*37.5,290);}
   for(let row=0;row<=6;row++){g.moveTo(390,85+row*34.2);g.lineTo(690,85+row*34.2);}
   g.stroke();
  }
  if(n===5){cup(210,280,115,205,60);cup(450,280,115,205,43);for(let j=0;j<6;j++){g.strokeStyle='#bdeeff';g.lineWidth=3;g.beginPath();g.arc(425+j%3*23,250-(time/28+j*21)%50,5,0,7);g.stroke();}text('가열하지 않은 A',210,35,20);text('끓는 B',450,35,20);if(drag?.id==='lens'){g.strokeStyle='#e3b34f';g.lineWidth=5;g.beginPath();g.arc(drag.x,drag.y,48,0,7);g.stroke();}}
  if(n===7){
   const last=c.tested.at(-1);
   for(const [key,x] of [['A',320],['B',550]]){
    const cold=c.selected===key,wet=!!last&&last.cold===(key==='A'?0:1)&&cold;
    drawStudyArt(g,assets['real-dew'],cold?2:1,x,175,190,215);
    if(wet)for(let i=0;i<26;i++)drawRealDrop(g,x-53+(i*29)%106,135+(i*37)%109,2.3+i%3);
    if(cold)text('냉각팩을 겉면에 붙임',x,315,17,'#21645d');
   }
   text('랩으로 입구를 막아 둔 같은 두 컵',430,35,20);
  }
  if(n===8){if(!learningArt(c.tested.at(-1)?.ok&&c.moves.cold==='plate'?'cold-plate':'cold-plate-dry',475,90,112,75)){g.fillStyle=c.moves.cold==='plate'?'#acdce2':'#c7d2ce';g.fillRect(365,85,220,27);}if(c.moves.cold==='plate')art(5,580,100,75);if(c.moves.tray==='under')art(4,475,300,115,'workshop');if(c.tested.at(-1)?.ok){for(let i=0;i<6;i++){const t=state.settings.reduced?i/6:(time/1500+i/6)%1;g.fillStyle='#40abc4';g.beginPath();g.ellipse(435+i%3*40,130+t*130,4,7,0,0,7);g.fill();}}}
  if(n===9){nodes.forEach(([x,y],i)=>{art(i,x,y,i===1?95:80,'workshop');text(['냉각판','경사판','깔때기','연결관','물통'][i],x+(i<2?95:100),y,21);g.strokeStyle='#d5b55f';g.lineWidth=3;g.beginPath();g.arc(x,y,38,0,7);g.stroke();});for(const line of c.lines){const [from,to]=line.split('-').map(Number),a=nodes[from],b=nodes[to];arrow(...a,...b);const t=state.settings.reduced?.5:(time/1400)%1;g.fillStyle='#32b6d1';g.beginPath();g.arc(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,6,0,7);g.fill();}}

  if(n===9&&tapNode!==null){const [x,y]=nodes[tapNode];g.strokeStyle='#d09a2b';g.lineWidth=7;g.beginPath();g.arc(x,y,44,0,7);g.stroke();}
  for(const it of layout.items){const obj=drag?.id===it.id?drag:it;
   if(n===3){
    const held=drag?.id===it.id||tapItem?.id===it.id,weighing=weighingOpen(c),weighed=c.marks.includes('weigh-'+it.id),used=!held&&(it.id==='weight'?c.moves.weight==='balance':weighing?weighed:c.moves[it.id]!==undefined);
    g.save();if(used)g.globalAlpha=.42;
    panel(obj.x-it.w/2,obj.y-it.h/2,it.w,it.h,tapItem?.id===it.id?'#fff0bd':'#fffdf3',held?'#238b82':'#dac999');
    if(it.id==='weight'){learningArt('weight',obj.x,obj.y-10,52,62);text(it.label,obj.x,obj.y+36,17);}
    else{drawFreezePhoto(g,it.id,obj.x,obj.y-12,it.w-14,76,packArt);text(weighed?`${it.label} ✓`:it.label,obj.x+14,obj.y+41,16);}
    g.restore();continue;
   }
   panel(obj.x-53,obj.y-43,106,86,tapItem?.id===it.id?'#fff0bd':'#fffdf3',drag?.id===it.id||tapItem?.id===it.id?'#238b82':'#dac999');if(obj.art===-1)text('100 g',obj.x,obj.y,22);else if(obj.art===-2){if(!drawStudyArt(g,assets['real-tools'],2,obj.x,obj.y,75,75,3))clock(obj.x,obj.y);}else if(obj.art===5)drawStudyArt(g,assets['real-tools'],1,obj.x,obj.y,90,90,3);else if(obj.art===6)drawStudyArt(g,assets['real-tools'],0,obj.x,obj.y,90,90,3);else if(obj.art===9)art(4,obj.x,obj.y,80,'workshop');else if(!(n===1&&obj.id==='ice'&&drawStudyArt(g,assets['real-ice'],3,obj.x,obj.y-5,72)))art(obj.art,obj.x,obj.y-5,72);text(obj.label,obj.x,Math.min(380,obj.y+53),18);}
  // The DOM hint character already occupies this corner on activity pages.
  if(!hasCoach&&![1,3,5,9,10].includes(n)){art(c.done?14:10,42,350,75,'buddy');}
  if(!c.done){
   const boxes=[...guidance.zones,...layout.items.filter(t=>guidance.items.includes(t.id)).map(t=>[t.x,t.y,t.w,t.h]),...layout.targets.filter(t=>guidance.targets.includes(t.id)).map(t=>[t.x,t.y,t.w,t.h])];
   g.lineWidth=2.5;g.strokeStyle='#a67b29';g.setLineDash([7,5]);
   for(const [x,y,w,h] of boxes){g.beginPath();g.roundRect(x-w/2-3,y-h/2-3,w+6,h+6,13);g.stroke();}
   g.setLineDash([]);
  }
  if(c.done){panel(260,365,200,31,'#e4f3d8','#96b994');text('현장 의뢰 해결!',360,381,20,'#35704f');}
  canvas.dataset.ready='true';frame=requestAnimationFrame(draw);
 }
 draw(performance.now());
 cleanups.push(()=>{cancelAnimationFrame(frame);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=null;});
}
